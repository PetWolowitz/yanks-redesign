// Nome di un articolo con colore e taglia: "Yanks hoodie (Zwart, L)". Una regola
// sola per carrello, checkout, pagina ordine, Stripe ed email. text traduce una
// chiave: t(lang, …) per una lingua, oppure olandese e inglese insieme (email.ts)
import type { Key } from '../../i18n/t';
import type { Color } from './types';

type Text = (key: Key) => string;

// "Zwart, L", "L", "Zwart" oppure "" per la taglia unica di un colore solo
export function variantText(text: Text, color: Color | null, size: string | null): string {
  return [color && text(`shop.color.${color}` as Key), size].filter(Boolean).join(', ');
}

export function itemName(text: Text, slug: string, color: Color | null, size: string | null): string {
  const variant = variantText(text, color, size);
  return text(`shop.products.${slug}.name` as Key) + (variant ? ` (${variant})` : '');
}
