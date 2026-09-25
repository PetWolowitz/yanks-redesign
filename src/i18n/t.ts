// Testi del sito: chiavi piatte, le valide sono quelle di en.json.
// Se un file di lingua non ha tutte le chiavi, astro check lo segnala qui.
import de from './de.json';
import en from './en.json';
import nl from './nl.json';
import type { Lang } from './locales';

export type Key = keyof typeof en;

const dictionaries: Record<Lang, Record<Key, string>> = { nl, en, de };

export function t(lang: Lang, key: Key): string {
  return dictionaries[lang][key];
}
