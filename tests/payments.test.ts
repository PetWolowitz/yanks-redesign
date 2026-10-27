// Metodi di pagamento (lib/shop/payments.ts): stessa lista per icone e frase
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { paymentIcons, paymentList } from '../src/lib/shop/payments';

describe('metodi di pagamento', () => {
  it('ogni icona esiste in public/payments/ e ha un nome per i lettori di schermo', () => {
    for (const { file, alt } of paymentIcons) {
      expect(existsSync(`public/payments/${file}.svg`), file).toBe(true);
      expect(alt).not.toBe('');
    }
  });

  it('in una frase, "card" nella lingua e la congiunzione della lingua', () => {
    expect(paymentList('nl')).toBe('iDEAL | Wero, kaart, Apple Pay, Google Pay, PayPal, Klarna, Bancontact, Amazon Pay en Revolut Pay');
    expect(paymentList('de')).toMatch(/, Karte, .* und Revolut Pay$/);
  });
});
