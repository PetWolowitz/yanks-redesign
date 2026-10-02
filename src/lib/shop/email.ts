// Email di conferma dell'ordine con Resend (docs/06, "Email di conferma — Resend").
// Parte dal webhook, dopo il pagamento confermato. fetch all'API REST, nessun
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

// Tutto quello che finisce nell'HTML passa da qui
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function confirmationEmail(origin: string, order: EmailOrder): { subject: string; text: string; html: string } {
  const { lang } = order;
  const link = orderLink(origin, lang, { id: order.publicId, token: order.token });
  const number = order.publicId.slice(0, 8).toUpperCase();
  const lines = order.items.map((item) => {
    const name = t(lang, `shop.products.${item.slug}.name` as Key) + (item.size ? ` (${item.size})` : '');
    return { label: `${item.quantity} × ${name}`, price: formatPrice(item.priceCents * item.quantity, lang) };
  });
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

  const html = `<!doctype html><html lang="${lang}"><body style="font-family:Georgia,serif;color:#2B2724;background:#F7F0E4;padding:24px">
<p>${escapeHtml(t(lang, 'email.intro'))}</p>
<p><strong>${escapeHtml(t(lang, 'order.number'))}: ${escapeHtml(number)}</strong></p>
<ul>${lines.map((line) => `<li>${escapeHtml(line.label)} — ${escapeHtml(line.price)}</li>`).join('')}</ul>
<p><strong>${escapeHtml(t(lang, 'order.total'))}: ${escapeHtml(total)}</strong></p>
<p>${escapeHtml(t(lang, 'email.link'))}<br><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
<p>${escapeHtml(t(lang, 'order.link.text'))}</p>
<p style="color:#6B645C;font-size:14px">${escapeHtml(t(lang, 'email.test'))}</p>
</body></html>`;

  return { subject, text, html };
}

// true se Resend ha accettato l'email. La chiave di idempotenza evita doppioni se
// il webhook arriva due volte entro 24 ore
export async function sendConfirmation(fetcher: typeof fetch, apiKey: string, from: string, to: string, origin: string, order: EmailOrder): Promise<boolean> {
  const { subject, text, html } = confirmationEmail(origin, order);
  try {
    const response = await fetcher(RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-confirmation/${order.publicId}`,
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
