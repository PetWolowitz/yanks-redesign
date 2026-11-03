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

// Mese e anno di una data AAAA-MM-GG: "oktober 2026", "October 2026", "Oktober 2026".
// A mezzogiorno UTC, così il fuso non sposta il giorno nel mese prima
export function formatMonth(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(intlLocale[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
