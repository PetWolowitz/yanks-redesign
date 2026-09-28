// Le regole del checkout: le stesse per form e server.
import { describe, expect, it } from 'vitest';
import { isValidQuantity, limits, validateCheckout } from '../src/lib/shop/validate';

function request(overrides: Record<string, unknown> = {}, address: Record<string, unknown> = {}) {
  return {
    lang: 'nl',
    email: 'pietro@example.com',
    address: { fullName: 'Pietro Costa', street: 'Dorpsplein 2', postalCode: '2042 JK', city: 'Zandvoort', country: 'NL', ...address },
    items: [{ sku: 'hoodie-m', quantity: 1 }],
    turnstileToken: 'token-di-prova',
    ...overrides,
  };
}

function errorsOf(input: unknown) {
  const result = validateCheckout(input);
  return result.ok ? {} : result.errors;
}

describe('validateCheckout', () => {
  it('accetta una richiesta corretta', () => {
    expect(validateCheckout(request())).toEqual({ ok: true, value: request() });
  });

  it('toglie gli spazi ai lati e mette il CAP in maiuscolo', () => {
    const result = validateCheckout(request({ email: '  pietro@example.com ' }, { postalCode: ' 2042jk ', city: ' Zandvoort ' }));
    expect(result.ok && result.value.email).toBe('pietro@example.com');
    expect(result.ok && result.value.address.postalCode).toBe('2042JK');
    expect(result.ok && result.value.address.city).toBe('Zandvoort');
  });

  it('rifiuta qualsiasi cosa non sia un oggetto, segnalando i campi', () => {
    for (const input of [null, undefined, 'ciao', 42, []]) {
      expect(errorsOf(input)).toMatchObject({ email: 'required', items: 'required', lang: 'invalid' });
    }
  });

  it('email: obbligatoria, valida, non troppo lunga', () => {
    expect(errorsOf(request({ email: '' }))).toEqual({ email: 'required' });
    expect(errorsOf(request({ email: 'pietro.example.com' }))).toEqual({ email: 'invalid' });
    expect(errorsOf(request({ email: 'pietro@example' }))).toEqual({ email: 'invalid' });
    expect(errorsOf(request({ email: `${'a'.repeat(limits.email)}@example.com` }))).toEqual({ email: 'tooLong' });
    expect(errorsOf(request({ email: 42 }))).toEqual({ email: 'invalid' });
  });

  it('indirizzo: campi obbligatori e lunghezze massime', () => {
    expect(errorsOf(request({}, { fullName: '   ' }))).toEqual({ fullName: 'required' });
    expect(errorsOf(request({}, { street: 'x'.repeat(limits.street + 1) }))).toEqual({ street: 'tooLong' });
    expect(errorsOf(request({}, { city: undefined }))).toEqual({ city: 'required' });
  });

  it('paese: solo dalla lista chiusa', () => {
    expect(errorsOf(request({}, { country: 'US' }))).toEqual({ country: 'invalid' });
    expect(errorsOf(request({}, { country: 'nl' }))).toEqual({ country: 'invalid' });
    expect(errorsOf(request({}, { country: '' }))).toEqual({ country: 'required' });
  });

  it('CAP: controllato secondo il paese', () => {
    expect(errorsOf(request({}, { postalCode: '2042' }))).toEqual({ postalCode: 'invalid' });
    expect(errorsOf(request({}, { country: 'DE', postalCode: '10115' }))).toEqual({});
    expect(errorsOf(request({}, { country: 'DE', postalCode: '2042 JK' }))).toEqual({ postalCode: 'invalid' });
    expect(errorsOf(request({}, { country: 'BE', postalCode: '1000' }))).toEqual({});
    expect(errorsOf(request({}, { country: 'LU', postalCode: 'L-1234' }))).toEqual({});
  });

  it('lingua: solo quelle del sito', () => {
    expect(errorsOf(request({ lang: 'xx' }))).toEqual({ lang: 'invalid' });
  });

  it('articoli: almeno uno, quantità da 1 a 10, niente doppioni', () => {
    expect(errorsOf(request({ items: [] }))).toEqual({ items: 'required' });
    expect(errorsOf(request({ items: [{ sku: 'hoodie-m', quantity: 0 }] }))).toEqual({ items: 'invalid' });
    expect(errorsOf(request({ items: [{ sku: 'hoodie-m', quantity: 11 }] }))).toEqual({ items: 'invalid' });
    expect(errorsOf(request({ items: [{ sku: 'hoodie-m', quantity: 1.5 }] }))).toEqual({ items: 'invalid' });
    expect(errorsOf(request({ items: [{ sku: 'hoodie-m', quantity: '2' }] }))).toEqual({ items: 'invalid' });
    expect(errorsOf(request({ items: [{ sku: 'HOODIE M', quantity: 1 }] }))).toEqual({ items: 'invalid' });
    const twice = [{ sku: 'hoodie-m', quantity: 1 }, { sku: 'hoodie-m', quantity: 2 }];
    expect(errorsOf(request({ items: twice }))).toEqual({ items: 'invalid' });
    const many = Array.from({ length: limits.maxLines + 1 }, (_, i) => ({ sku: `sku-${i}`, quantity: 1 }));
    expect(errorsOf(request({ items: many }))).toEqual({ items: 'tooLong' });
  });

  it('non lascia passare campi in più, come un prezzo mandato dal browser', () => {
    const result = validateCheckout(request({ totalCents: 1, items: [{ sku: 'hoodie-m', quantity: 1, priceCents: 1 }] }));
    expect(result.ok && result.value).not.toHaveProperty('totalCents');
    expect(result.ok && result.value.items[0]).toEqual({ sku: 'hoodie-m', quantity: 1 });
  });

  it('token di Turnstile obbligatorio', () => {
    expect(errorsOf(request({ turnstileToken: '' }))).toEqual({ turnstileToken: 'required' });
  });
});

describe('isValidQuantity', () => {
  it('solo interi da 1 a 10', () => {
    expect([1, 10].every(isValidQuantity)).toBe(true);
    expect([0, 11, -1, 2.5, NaN, '3', null].some(isValidQuantity)).toBe(false);
  });
});
