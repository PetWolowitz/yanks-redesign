import { describe, expect, it } from 'vitest';
import { formatPrice } from '../src/lib/format';

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
