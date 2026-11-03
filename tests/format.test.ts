import { describe, expect, it } from 'vitest';
import { formatMonth, formatPrice } from '../src/lib/format';

// Intl mette spazi non separabili: si normalizzano per leggere i test
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('olandese: € 3,25', () => {
    expect(plain(formatPrice(325, 'nl'))).toBe('€ 3,25');
  });
  it('tedesco: 3,25 €', () => {
    expect(plain(formatPrice(325, 'de'))).toBe('3,25 €');
  });
  it('inglese: €3.25', () => {
    expect(formatPrice(325, 'en')).toBe('€3.25');
  });
  it('i centesimi restano esatti', () => {
    expect(formatPrice(4500, 'en')).toBe('€45.00');
    expect(formatPrice(350, 'en')).toBe('€3.50');
  });
});

describe('formatMonth', () => {
  it('mese e anno nella lingua della pagina', () => {
    expect(formatMonth('2026-10-13', 'nl')).toBe('oktober 2026');
    expect(formatMonth('2026-10-13', 'en')).toBe('October 2026');
    expect(formatMonth('2026-10-13', 'de')).toBe('Oktober 2026');
  });
  it('il primo e l\'ultimo giorno restano nel loro mese', () => {
    expect(formatMonth('2026-09-01', 'en')).toBe('September 2026');
    expect(formatMonth('2026-09-30', 'en')).toBe('September 2026');
  });
});
