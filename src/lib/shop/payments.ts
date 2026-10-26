// Metodi di pagamento accettati (docs/06). Il checkout non li fissa: Stripe mostra
// quelli accesi nella sua dashboard (elenco di Pietro, 2026-10-26). La legge vuole
// che il cliente li conosca prima di iniziare l'ordine, quindi carrello, checkout e
// pagina legale li elencano da qui: se in dashboard se ne accende o spegne uno, si
// aggiorna questa lista. I nomi dei marchi restano uguali in ogni lingua, "card" no.
import type { Lang } from '../../i18n/locales';
import { t } from '../../i18n/t';

export const paymentMethods = ['iDEAL', 'card', 'Apple Pay', 'Google Pay', 'PayPal', 'Klarna', 'Bancontact', 'Amazon Pay'] as const;

// label: con la maiuscola, per le etichette ("Kaart"); in una frase resta minuscola
export function paymentNames(lang: Lang, label = false): string[] {
  const card = t(lang, 'payments.card');
  return paymentMethods.map((method) => (method !== 'card' ? method : label ? card[0]!.toUpperCase() + card.slice(1) : card));
}

// In una frase: "iDEAL, kaart, … en Amazon Pay"
export function paymentList(lang: Lang): string {
  return new Intl.ListFormat(lang, { type: 'conjunction' }).format(paymentNames(lang));
}
