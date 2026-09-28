// Il carrello: solo SKU e quantità, righe uniche, quantità tra 1 e 10.
import { describe, expect, it } from 'vitest';
import { addItem, countItems, parseCart, setQuantity } from '../src/lib/shop/cart';

describe('carrello', () => {
  it('aggiunge una riga nuova', () => {
    expect(addItem([], 'hoodie-m', 2)).toEqual([{ sku: 'hoodie-m', quantity: 2 }]);
  });

  it('somma sulla stessa riga invece di duplicarla', () => {
    expect(addItem([{ sku: 'hoodie-m', quantity: 2 }], 'hoodie-m', 3)).toEqual([{ sku: 'hoodie-m', quantity: 5 }]);
  });

  it('non supera 10 per riga', () => {
    expect(addItem([{ sku: 'hoodie-m', quantity: 8 }], 'hoodie-m', 5)).toEqual([{ sku: 'hoodie-m', quantity: 10 }]);
    expect(setQuantity([], 'cap', 40)).toEqual([{ sku: 'cap', quantity: 10 }]);
  });

  it('quantità 0 toglie la riga', () => {
    expect(setQuantity([{ sku: 'cap', quantity: 1 }, { sku: 'beanie', quantity: 2 }], 'cap', 0)).toEqual([{ sku: 'beanie', quantity: 2 }]);
  });

  it('conta gli articoli, non le righe', () => {
    expect(countItems([{ sku: 'cap', quantity: 1 }, { sku: 'beanie', quantity: 2 }])).toBe(3);
  });
});

describe('parseCart', () => {
  it('legge un carrello valido', () => {
    expect(parseCart('[{"sku":"cap","quantity":2}]')).toEqual([{ sku: 'cap', quantity: 2 }]);
  });

  it('non si fida dello storage: scarta righe non valide, doppie e prezzi', () => {
    const raw = JSON.stringify([
      { sku: 'cap', quantity: 2, priceCents: 1 },
      { sku: 'cap', quantity: 3 },
      { sku: 'BAD SKU', quantity: 1 },
      { sku: 'beanie', quantity: 0 },
      { sku: 'hoodie-m', quantity: 11 },
      null,
    ]);
    expect(parseCart(raw)).toEqual([{ sku: 'cap', quantity: 2 }]);
  });

  it('JSON rotto o vuoto: carrello vuoto', () => {
    expect(parseCart('{rotto')).toEqual([]);
    expect(parseCart(null)).toEqual([]);
    expect(parseCart('{"sku":"cap"}')).toEqual([]);
  });
});
