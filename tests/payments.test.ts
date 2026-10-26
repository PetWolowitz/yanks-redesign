// Metodi di pagamento (lib/shop/payments.ts): stessa lista per etichette e frase
import { describe, expect, it } from 'vitest';
import { paymentList, paymentNames } from '../src/lib/shop/payments';

describe('metodi di pagamento', () => {
  it('nelle etichette "card" diventa la parola della lingua, con la maiuscola; i marchi restano uguali', () => {
    expect(paymentNames('nl', true)).toEqual(['iDEAL', 'Kaart', 'Apple Pay', 'Google Pay', 'PayPal', 'Klarna', 'Bancontact', 'Amazon Pay']);
    expect(paymentNames('de', true)).toContain('Karte');
  });

  it('in una frase, minuscola e con la congiunzione della lingua', () => {
    expect(paymentList('nl')).toBe('iDEAL, kaart, Apple Pay, Google Pay, PayPal, Klarna, Bancontact en Amazon Pay');
    expect(paymentList('en')).toMatch(/, card, .* and Amazon Pay$/);
  });
});
