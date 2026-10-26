// Metodi di pagamento accettati (docs/06). Il checkout non li fissa: Stripe mostra
// quelli accesi nella sua dashboard (elenco di Pietro, 2026-10-26). La legge vuole
// che il cliente li conosca prima di iniziare l'ordine, quindi carrello, checkout e
// pagina legale li elencano da qui: se in dashboard se ne accende o spegne uno, si
// aggiorna questa lista. I nomi dei marchi restano uguali in ogni lingua, "card" no.
// Le icone sono in public/payments/, da datatrans/payment-logos (CC BY-SA 4.0,
// citata nella pagina legale); la carta ne ha due, Visa e Mastercard.
import type { Lang } from '../../i18n/locales';
import { t } from '../../i18n/t';

export const paymentMethods = [
  { name: 'iDEAL', icons: [{ file: 'ideal', alt: 'iDEAL' }] },
  { name: 'card', icons: [{ file: 'visa', alt: 'Visa' }, { file: 'mastercard', alt: 'Mastercard' }] },
  { name: 'Apple Pay', icons: [{ file: 'apple-pay', alt: 'Apple Pay' }] },
  { name: 'Google Pay', icons: [{ file: 'google-pay', alt: 'Google Pay' }] },
  { name: 'PayPal', icons: [{ file: 'paypal', alt: 'PayPal' }] },
  { name: 'Klarna', icons: [{ file: 'klarna', alt: 'Klarna' }] },
  { name: 'Bancontact', icons: [{ file: 'bancontact', alt: 'Bancontact' }] },
  { name: 'Amazon Pay', icons: [{ file: 'amazon-pay', alt: 'Amazon Pay' }] },
] as const;

export const paymentIcons = paymentMethods.flatMap((method) => method.icons);

// In una frase: "iDEAL, kaart, … en Amazon Pay"
export function paymentList(lang: Lang): string {
  const names = paymentMethods.map(({ name }) => (name === 'card' ? t(lang, 'payments.card') : name));
  return new Intl.ListFormat(lang, { type: 'conjunction' }).format(names);
}
