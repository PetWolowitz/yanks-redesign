// La ShopApi finta: stessa forma e stesse regole che avrà quella vera.
import { describe, expect, it } from 'vitest';
import { merch } from '../src/data/merch';
import { createMockShopApi } from '../src/lib/shop/mock';
import { ShopError, type CheckoutRequest } from '../src/lib/shop/types';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value) };
}

function setup() {
  let time = 1_000_000;
  const api = createMockShopApi({ storage: memoryStorage(), now: () => time, paymentDelayMs: 2000 });
  return { api, advance: (ms: number) => (time += ms) };
}

const request: CheckoutRequest = {
  lang: 'de',
  email: 'pietro@example.com',
  address: { fullName: 'Pietro Costa', street: 'Dorpsplein 2', postalCode: '2042 JK', city: 'Zandvoort', country: 'NL' },
  items: [
    { sku: 'hoodie-m', quantity: 2 },
    { sku: 'djeep-lighter', quantity: 1 },
  ],
  turnstileToken: 'token-di-prova',
};

async function codeOf(promise: Promise<unknown>) {
  try {
    await promise;
    return 'nessun errore';
  } catch (error) {
    return error instanceof ShopError ? error.code : String(error);
  }
}

describe('mock ShopApi', () => {
  it('getProducts restituisce tutti i prodotti di merch.ts, una variante per taglia', async () => {
    const products = await setup().api.getProducts();
    expect(products.map((p) => p.slug)).toEqual(merch.map((m) => m.slug));
    expect(products.find((p) => p.slug === 'hoodie')?.variants.map((v) => v.sku)).toEqual(['hoodie-s', 'hoodie-m', 'hoodie-l', 'hoodie-xl']);
    expect(products.find((p) => p.slug === 'mystery-box')?.variants).toEqual([{ sku: 'mystery-box', size: null, stock: 3 }]);
  });

  it('checkout: totale calcolato dai prezzi di merch.ts, token di 43 caratteri, ritorno alla pagina ordine', async () => {
    const { api } = setup();
    const checkout = await api.createCheckout(request);
    expect(checkout.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(checkout.redirectUrl).toBe('/de/shop/order');
    const order = await api.getOrder(checkout.id, checkout.token);
    expect(order.totalCents).toBe(2 * 4500 + 350);
  });

  it('un prezzo aggiunto dal browser non cambia il totale', async () => {
    const { api } = setup();
    const tampered = { ...request, items: [{ sku: 'hoodie-m', quantity: 1, priceCents: 1 }], totalCents: 1 };
    const checkout = await api.createCheckout(tampered as CheckoutRequest);
    expect((await api.getOrder(checkout.id, checkout.token)).totalCents).toBe(4500);
  });

  it('l\'ordine è pending, poi pagato dopo il finto pagamento', async () => {
    const { api, advance } = setup();
    const { id, token } = await api.createCheckout(request);
    expect((await api.getOrder(id, token)).status).toBe('pending');
    advance(2000);
    expect((await api.getOrder(id, token)).status).toBe('paid');
  });

  it('token sbagliato e ordine inesistente danno lo stesso errore', async () => {
    const { api } = setup();
    const { id, token } = await api.createCheckout(request);
    expect(await codeOf(api.getOrder(id, token.slice(0, 20)))).toBe('not_found');
    expect(await codeOf(api.getOrder('ordine-che-non-esiste', token))).toBe('not_found');
  });

  it('rifiuta richieste non valide, SKU sconosciuti e quantità oltre la giacenza', async () => {
    const { api } = setup();
    expect(await codeOf(api.createCheckout({ ...request, email: 'non-una-email' }))).toBe('invalid');
    expect(await codeOf(api.createCheckout({ ...request, items: [{ sku: 'grinder', quantity: 1 }] }))).toBe('invalid');
    expect(await codeOf(api.createCheckout({ ...request, items: [{ sku: 'skull-t-shirt-xl', quantity: 1 }] }))).toBe('out_of_stock');
    expect(await codeOf(api.createCheckout({ ...request, items: [{ sku: 'mystery-box', quantity: 4 }] }))).toBe('out_of_stock');
  });

  it('gli errori di validazione dicono quale campo è sbagliato', async () => {
    expect.assertions(1);
    const { api } = setup();
    try {
      await api.createCheckout({ ...request, email: '' });
    } catch (error) {
      expect(error instanceof ShopError && error.fields).toEqual({ email: 'required' });
    }
  });
});
