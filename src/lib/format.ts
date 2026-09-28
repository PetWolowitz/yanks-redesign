// Prezzi in euro nel formato di ogni lingua: "€ 3,25" in olandese, "3,25 €" in
// tedesco, "€3.25" in inglese. Sempre da centesimi interi.
import type { Lang } from '../i18n/locales';

const intlLocale: Record<Lang, string> = {
  nl: 'nl-NL',
  // inglese con l'euro: il formato irlandese
  en: 'en-IE',
  de: 'de-DE',
};

export function formatPrice(cents: number, lang: Lang): string {
  return new Intl.NumberFormat(intlLocale[lang], { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
