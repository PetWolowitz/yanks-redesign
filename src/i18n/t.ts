// Testi del sito: chiavi piatte, le valide sono quelle di en.json.
// Se un file di lingua non ha tutte le chiavi, astro check lo segnala qui.
import de from './de.json';
import en from './en.json';
import nl from './nl.json';
import type { Lang } from './locales';

export type Key = keyof typeof en;

const dictionaries: Record<Lang, Record<Key, string>> = { nl, en, de };

// I segnaposto {nome} nel testo si riempiono con params: t(lang, 'clock.until', { time: '02:00' })
export function t(lang: Lang, key: Key, params: Record<string, string> = {}): string {
  return dictionaries[lang][key].replace(/\{(\w+)\}/g, (match, name: string) => params[name] ?? match);
}
