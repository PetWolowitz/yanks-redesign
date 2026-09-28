// I file di lingua devono avere esattamente le stesse chiavi, e nessun testo vuoto.
import { describe, expect, it } from 'vitest';
import de from '../src/i18n/de.json';
import en from '../src/i18n/en.json';
import nl from '../src/i18n/nl.json';
import { pickLang } from '../src/i18n/locales';

const reference = Object.keys(en).sort();
const files: Record<string, Record<string, string>> = { nl, de };

describe('file di lingua', () => {
  for (const [name, dictionary] of Object.entries(files)) {
    it(`${name}.json ha le stesse chiavi di en.json`, () => {
      expect(Object.keys(dictionary).sort()).toEqual(reference);
    });
  }

  // I segnaposto di t() ({time}, {minutes}…) devono essere gli stessi in ogni lingua
  const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
  for (const [name, dictionary] of Object.entries(files)) {
    it(`${name}.json ha gli stessi segnaposto di en.json`, () => {
      const different = Object.entries(en).filter(
        ([key, text]) => placeholders(text).join() !== placeholders(dictionary[key] ?? '').join(),
      );
      expect(different.map(([key]) => key)).toEqual([]);
    });
  }

  for (const [name, dictionary] of Object.entries({ en, ...files })) {
    it(`${name}.json non ha testi vuoti`, () => {
      const empty = Object.entries(dictionary).filter(([, text]) => text.trim() === '');
      expect(empty.map(([key]) => key)).toEqual([]);
    });
  }
});

describe('pickLang', () => {
  it('prende la prima lingua del browser che il sito ha', () => {
    expect(pickLang(['de-AT', 'en'])).toBe('de');
    expect(pickLang(['fr-FR', 'nl-BE', 'en'])).toBe('nl');
  });
  it('ripiega sull\'inglese', () => {
    expect(pickLang(['it-IT', 'fr'])).toBe('en');
    expect(pickLang([])).toBe('en');
  });
  it('non distingue maiuscole e minuscole', () => {
    expect(pickLang(['NL'])).toBe('nl');
  });
});
