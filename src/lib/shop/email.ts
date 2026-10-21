// Email dell'ordine con Resend (docs/06, "Email di conferma — Resend"): la conferma
// al cliente e l'avviso al negozio. Partono dal webhook, dopo il pagamento confermato. fetch all'API REST, nessun
// pacchetto. Se l'invio fallisce l'ordine resta pagato: chi chiama scrive nei log
// solo una frase fissa, mai token né corpo dell'email.
// Documentazione: resend.com/docs/api-reference/emails/send-email
import type { Lang } from '../../i18n/locales';
import { t, type Key } from '../../i18n/t';
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

// Colori della variante C (tokens.css): l'email non legge il CSS del sito
const PAGE_STYLE = 'font-family:Georgia,serif;color:#1C1B1A;background:#FBFAF7;padding:24px';
const MUTED_STYLE = 'color:#625C55;font-size:14px';

// Tutto quello che finisce nell'HTML passa da qui
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function orderNumber(publicId: string): string {
  return publicId.slice(0, 8).toUpperCase();
}

function orderLines(lang: Lang, items: EmailOrder['items']) {
  return items.map((item) => {
    const name = t(lang, `shop.products.${item.slug}.name` as Key) + (item.size ? ` (${item.size})` : '');
    return { label: `${item.quantity} × ${name}`, price: formatPrice(item.priceCents * item.quantity, lang) };
  });
}

export function confirmationEmail(origin: string, order: EmailOrder): Email {
  const { lang } = order;
  const link = orderLink(origin, lang, { id: order.publicId, token: order.token });
  const number = orderNumber(order.publicId);
  const lines = orderLines(lang, order.items);
  const total = formatPrice(order.totalCents, lang);
  const subject = t(lang, 'email.subject', { number });

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
    t(lang, 'email.test'),
  ].join('\n');

  const html = `<!doctype html><html lang="${lang}"><body style="${PAGE_STYLE}">
<p>${escapeHtml(t(lang, 'email.intro'))}</p>
<p><strong>${escapeHtml(t(lang, 'order.number'))}: ${escapeHtml(number)}</strong></p>
<ul>${lines.map((line) => `<li>${escapeHtml(line.label)} — ${escapeHtml(line.price)}</li>`).join('')}</ul>
<p><strong>${escapeHtml(t(lang, 'order.total'))}: ${escapeHtml(total)}</strong></p>
<p>${escapeHtml(t(lang, 'email.link'))}<br><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
<p>${escapeHtml(t(lang, 'order.link.text'))}</p>
<p style="${MUTED_STYLE}">${escapeHtml(t(lang, 'email.test'))}</p>
</body></html>`;

  return { subject, text, html };
}

// Avviso al negozio: in olandese, la lingua del locale. Serve a spedire, quindi porta
// indirizzo ed email del cliente; niente link all'ordine né token, non servono
export function shopNotificationEmail(order: Omit<EmailOrder, 'token'>, address: ShippingAddress, customerEmail: string): Email {
  const lang: Lang = 'nl';
  const number = orderNumber(order.publicId);
  const lines = orderLines(lang, order.items);
  const total = formatPrice(order.totalCents, lang);
  const addressLines = [address.fullName, address.street, `${address.postalCode} ${address.city}`, address.country];

  const text = [
    t(lang, 'shopEmail.intro'),
    '',
    `${t(lang, 'order.number')}: ${number}`,
    ...lines.map((line) => `${line.label}  ${line.price}`),
    `${t(lang, 'order.total')}: ${total}`,
    '',
    `${t(lang, 'shopEmail.address')}:`,
    ...addressLines,
    '',
    `${t(lang, 'shopEmail.customer')}: ${customerEmail}`,
    `${t(lang, 'shopEmail.language')}: ${order.lang}`,
    '',
    t(lang, 'email.test'),
  ].join('\n');

  const html = `<!doctype html><html lang="${lang}"><body style="${PAGE_STYLE}">
<p>${escapeHtml(t(lang, 'shopEmail.intro'))}</p>
<p><strong>${escapeHtml(t(lang, 'order.number'))}: ${escapeHtml(number)}</strong></p>
<ul>${lines.map((line) => `<li>${escapeHtml(line.label)} — ${escapeHtml(line.price)}</li>`).join('')}</ul>
<p><strong>${escapeHtml(t(lang, 'order.total'))}: ${escapeHtml(total)}</strong></p>
<p><strong>${escapeHtml(t(lang, 'shopEmail.address'))}</strong><br>${addressLines.map(escapeHtml).join('<br>')}</p>
<p>${escapeHtml(t(lang, 'shopEmail.customer'))}: ${escapeHtml(customerEmail)}<br>${escapeHtml(t(lang, 'shopEmail.language'))}: ${escapeHtml(order.lang)}</p>
<p style="${MUTED_STYLE}">${escapeHtml(t(lang, 'email.test'))}</p>
</body></html>`;

  return { subject: t(lang, 'shopEmail.subject', { number }), text, html };
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

export function sendShopNotification(fetcher: typeof fetch, apiKey: string, from: string, to: string, order: Omit<EmailOrder, 'token'>, address: ShippingAddress, customerEmail: string): Promise<boolean> {
  return sendEmail(fetcher, apiKey, from, to, `order-shop/${order.publicId}`, shopNotificationEmail(order, address, customerEmail));
}
