// Email dell'ordine con Resend (docs/06, "Email di conferma — Resend"): la conferma
// al cliente e l'avviso al negozio. Partono dal webhook, dopo il pagamento confermato. fetch all'API REST, nessun
// pacchetto. Se l'invio fallisce l'ordine resta pagato: chi chiama scrive nei log
// solo una frase fissa, mai token né corpo dell'email.
// Documentazione: resend.com/docs/api-reference/emails/send-email
import type { Lang } from '../../i18n/locales';
import { t, type Key } from '../../i18n/t';
import { venue } from '../../data/venue';
import { formatPrice } from '../format';
import { orderLink } from './order-link';

const RESEND = 'https://api.resend.com/emails';

export interface EmailOrder {
  publicId: string;
  token: string;
  lang: Lang;
  totalCents: number;
  items: { slug: string; size: string | null; quantity: number; priceCents: number }[];
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

interface Email {
  subject: string;
  text: string;
  html: string;
}

// Colori della variante C (tokens.css): l'email non legge il CSS del sito. Nemmeno i
// font: Gmail e Outlook non caricano i nostri, quindi sostituti di sistema. Georgia
// per la prosa, Courier per numeri e pulsanti (al posto di Martian Mono), Impact in
// maiuscolo per i titoli (al posto di Yankee Clipper)
const C = { bg: '#FBFAF7', ink: '#1C1B1A', inkText: '#D9D0C2', cream: '#EFEEEB', muted: '#625C55', redText: '#A54C3D' };
const PROSE = "font-family:Georgia,'Times New Roman',serif";
const MONO = "font-family:'Courier New',Courier,monospace";
const SIGN = "font-family:Impact,'Arial Narrow Bold',sans-serif;font-weight:normal;text-transform:uppercase;letter-spacing:1px";

// Tutto quello che finisce nell'HTML passa da qui
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function paragraph(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;${PROSE};font-size:16px;line-height:1.5;${style}">${escapeHtml(text)}</p>`;
}

// Un testo nella lingua giusta: la conferma usa quella del cliente, l'avviso al
// negozio olandese e inglese insieme (both)
type Label = (key: Key, params?: Record<string, string>) => string;

function inLang(lang: Lang): Label {
  return (key, params) => t(lang, key, params);
}

// Olandese e inglese insieme, per chi al negozio non legge l'olandese (Pietro,
// 2026-10-26); una volta sola se sono uguali
const both: Label = (key, params) => {
  const [nl, en] = [t('nl', key, params), t('en', key, params)];
  return nl === en ? nl : `${nl} / ${en}`;
};

// Riquadro dell'ordine, come le card del sito: bordo da 1.5 px, prezzi a destra,
// totale sotto una riga piena
function orderBox(label: Label, number: string, lines: { label: string; price: string }[], total: string): string {
  const cell = `padding:8px 0;border-bottom:1px solid ${C.muted}`;
  const rows = lines
    .map((line) => `<tr><td style="${PROSE};font-size:15px;${cell}">${escapeHtml(line.label)}</td><td align="right" style="${MONO};font-size:14px;white-space:nowrap;${cell};padding-left:12px">${escapeHtml(line.price)}</td></tr>`)
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid ${C.ink};border-radius:16px;border-collapse:separate;margin:8px 0 24px">
<tr><td style="padding:20px 22px">
<p style="margin:0 0 8px;${SIGN};font-size:18px">${escapeHtml(label('order.number'))} <span style="${MONO};font-size:14px;text-transform:none;letter-spacing:0">${escapeHtml(number)}</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
<tr><td style="${SIGN};font-size:20px;padding-top:14px">${escapeHtml(label('order.total'))}</td><td align="right" style="${MONO};font-size:18px;font-weight:bold;white-space:nowrap;padding-top:14px">${escapeHtml(total)}</td></tr>
</table>
</td></tr></table>`;
}

// Cornice comune alle due email, larga 560 px: testata inchiostro col timbro, onda del
// badge, contenuto su bianco caldo, footer grigio caldo con indirizzo, orari e link.
// Le immagini sono PNG in public/email/: i programmi di posta non mostrano gli SVG
function layout(lang: Lang, origin: string, title: string, content: string): string {
  const { street, postalCode, city } = venue.address;
  const { open, dineInUntil, close } = venue.hours;
  const hours = [
    [`${open}–${dineInUntil}`, t(lang, 'hours.open')],
    [`${dineInUntil}–${close}`, t(lang, 'hours.takeaway')],
    [`${close}–${open}`, t(lang, 'hours.closed')],
  ]
    .map(([time, label]) => `${escapeHtml(time!)}&nbsp; ${escapeHtml(label!)}`)
    .join('<br>');
  const small = `${MONO};font-size:13px;line-height:1.6;color:${C.ink}`;
  const link = `color:${C.ink};text-decoration:underline`;

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px">
<tr><td align="center" style="background:${C.ink};border-radius:16px 16px 0 0;padding:28px 24px 16px">
<img src="${escapeHtml(origin)}/email/yanks-badge.png" width="120" height="120" alt="${escapeHtml(venue.name)}" style="display:block;margin:0 auto;border:0">
<p style="margin:14px 0 0;${SIGN};font-size:14px;letter-spacing:3px;color:${C.inkText}">${escapeHtml(venue.tagline)}</p>
</td></tr>
<tr><td style="line-height:0;font-size:0"><img src="${escapeHtml(origin)}/email/wave.png" width="560" height="18" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:24px 24px 8px">
<h1 style="margin:0 0 16px;${SIGN};font-size:32px;line-height:1.1">${escapeHtml(title)}</h1>
${content}
</td></tr>
<tr><td style="background:${C.cream};border-radius:0 0 16px 16px;padding:24px">
<p style="margin:0 0 12px;${small}"><strong>${escapeHtml(venue.name)}</strong><br>${escapeHtml(street)}<br>${escapeHtml(postalCode)} ${escapeHtml(city)}</p>
<p style="margin:0 0 12px;${small}">${escapeHtml(t(lang, 'hours.everyday'))}<br>${hours}</p>
<p style="margin:0 0 12px;${small}"><a href="${escapeHtml(origin)}/${lang}/" style="${link}">${escapeHtml(venue.name)}</a> · <a href="${escapeHtml(origin)}/${lang}/legal/" style="${link}">${escapeHtml(t(lang, 'legal.link'))}</a></p>
<p style="margin:0 0 8px;${PROSE};font-size:13px;line-height:1.5;color:${C.muted}">${escapeHtml(t(lang, 'email.test'))}</p>
<p style="margin:0;${PROSE};font-size:13px;line-height:1.5;color:${C.muted}">${escapeHtml(t(lang, 'footer.disclaimer'))}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function orderNumber(publicId: string): string {
  return publicId.slice(0, 8).toUpperCase();
}

// Righe dell'ordine più la spedizione, che è il totale meno gli articoli: il totale
// salvato la comprende (lib/shop/shipping.ts) e così vale anche per gli ordini vecchi
function orderLines(lang: Lang, label: Label, order: Pick<EmailOrder, 'items' | 'totalCents'>) {
  const lines = order.items.map((item) => {
    const name = label(`shop.products.${item.slug}.name` as Key) + (item.size ? ` (${item.size})` : '');
    return { label: `${item.quantity} × ${name}`, price: formatPrice(item.priceCents * item.quantity, lang) };
  });
  const shipping = order.totalCents - order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  return shipping > 0 ? [...lines, { label: label('shop.shipping'), price: formatPrice(shipping, lang) }] : lines;
}

export function confirmationEmail(origin: string, order: EmailOrder): Email {
  const { lang } = order;
  const link = orderLink(origin, lang, { id: order.publicId, token: order.token });
  const number = orderNumber(order.publicId);
  const lines = orderLines(lang, inLang(lang), order);
  const total = formatPrice(order.totalCents, lang);
  const subject = t(lang, 'email.subject', { number });
  // Condizioni e recesso anche nella conferma: la legge le vuole su un supporto durevole
  const legal = `${origin}/${lang}/legal/`;

  const text = [
    t(lang, 'email.intro'),
    '',
    `${t(lang, 'order.number')}: ${number}`,
    ...lines.map((line) => `${line.label}  ${line.price}`),
    `${t(lang, 'order.total')}: ${total}`,
    '',
    t(lang, 'email.link'),
    link,
    t(lang, 'order.link.text'),
    '',
    t(lang, 'email.withdrawal'),
    legal,
    '',
    t(lang, 'email.test'),
  ].join('\n');

  // Pulsante come btn-solid del sito; sotto, il link intero in chiaro (CLAUDE.md:
  // secondo paracadute, si copia a mano anche se il pulsante non funziona)
  const content = [
    paragraph(t(lang, 'email.intro')),
    orderBox(inLang(lang), number, lines, total),
    `<p style="margin:0 0 12px"><a href="${escapeHtml(link)}" style="display:inline-block;background:${C.ink};color:${C.bg};${MONO};font-size:14px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border:3px solid ${C.ink};border-radius:9999px">${escapeHtml(t(lang, 'email.button'))}</a></p>`,
    `<p style="margin:0 0 4px;${MONO};font-size:12px;line-height:1.5;word-break:break-all"><a href="${escapeHtml(link)}" style="color:${C.redText}">${escapeHtml(link)}</a></p>`,
    paragraph(t(lang, 'order.link.text'), `font-size:14px;color:${C.muted}`),
    paragraph(t(lang, 'email.withdrawal'), 'font-size:14px;margin-bottom:4px'),
    `<p style="margin:0 0 16px;${PROSE};font-size:14px"><a href="${escapeHtml(legal)}" style="color:${C.redText}">${escapeHtml(t(lang, 'legal.link'))}</a></p>`,
  ].join('\n');

  return { subject, text, html: layout(lang, origin, t(lang, 'email.title'), content) };
}

// Avviso al negozio: olandese e inglese insieme (both); la cornice in olandese, la
// lingua del locale. Serve a spedire, quindi porta indirizzo ed email del cliente;
// niente link all'ordine né token, non servono
export function shopNotificationEmail(origin: string, order: Omit<EmailOrder, 'token'>, address: ShippingAddress, customerEmail: string): Email {
  const lang: Lang = 'nl';
  const number = orderNumber(order.publicId);
  const lines = orderLines(lang, both, order);
  const total = formatPrice(order.totalCents, lang);
  const addressLines = [address.fullName, address.street, `${address.postalCode} ${address.city}`, address.country];
  const intro = [t('nl', 'shopEmail.intro'), t('en', 'shopEmail.intro')] as const;

  const text = [
    ...intro,
    '',
    `${both('order.number')}: ${number}`,
    ...lines.map((line) => `${line.label}  ${line.price}`),
    `${both('order.total')}: ${total}`,
    '',
    `${both('shopEmail.address')}:`,
    ...addressLines,
    '',
    `${both('shopEmail.customer')}: ${customerEmail}`,
    `${both('shopEmail.language')}: ${order.lang}`,
    '',
    both('email.test'),
  ].join('\n');

  // Stessa cornice della conferma; al posto del pulsante l'indirizzo, in un riquadro
  const content = [
    paragraph(intro[0], 'margin-bottom:4px'),
    paragraph(intro[1], `color:${C.muted}`),
    orderBox(both, number, lines, total),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid ${C.ink};border-radius:16px;border-collapse:separate;margin:0 0 24px"><tr><td style="padding:20px 22px">
<p style="margin:0 0 8px;${SIGN};font-size:18px">${escapeHtml(both('shopEmail.address'))}</p>
<p style="margin:0 0 12px;${PROSE};font-size:16px;line-height:1.5">${addressLines.map(escapeHtml).join('<br>')}</p>
<p style="margin:0;${MONO};font-size:13px;line-height:1.6">${escapeHtml(both('shopEmail.customer'))}: ${escapeHtml(customerEmail)}<br>${escapeHtml(both('shopEmail.language'))}: ${escapeHtml(order.lang)}</p>
</td></tr></table>`,
  ].join('\n');

  return { subject: `${both('shopEmail.title')} ${number}`, text, html: layout(lang, origin, both('shopEmail.title'), content) };
}

// true se Resend ha accettato l'email. La chiave di idempotenza evita doppioni se
// il webhook arriva due volte entro 24 ore
async function sendEmail(fetcher: typeof fetch, apiKey: string, from: string, to: string, idempotencyKey: string, { subject, text, html }: Email): Promise<boolean> {
  try {
    const response = await fetcher(RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function sendConfirmation(fetcher: typeof fetch, apiKey: string, from: string, to: string, origin: string, order: EmailOrder): Promise<boolean> {
  return sendEmail(fetcher, apiKey, from, to, `order-confirmation/${order.publicId}`, confirmationEmail(origin, order));
}

export function sendShopNotification(fetcher: typeof fetch, apiKey: string, from: string, to: string, origin: string, order: Omit<EmailOrder, 'token'>, address: ShippingAddress, customerEmail: string): Promise<boolean> {
  return sendEmail(fetcher, apiKey, from, to, `order-shop/${order.publicId}`, shopNotificationEmail(origin, order, address, customerEmail));
}
