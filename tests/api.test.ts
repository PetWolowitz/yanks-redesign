// Gli endpoint /api/products e /api/order su un SQLite in memoria con schema e seed
// veri. Un piccolo adattatore imita la parte di D1 che usiamo.
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { merch, skuOf } from '../src/data/merch';
import { handleOrder, handleProducts } from '../src/lib/shop/handlers';
import { seedSql } from '../src/lib/shop/seed';
import type { D1Database, D1PreparedStatement, RateLimit, ShopEnv } from '../src/lib/shop/server-env';
import { orderToken } from '../src/lib/shop/token';

const SECRET = 'segreto-di-prova-0123456789abcdefghijklmnop';
const ORIGIN = 'https://yanks.test';
const ORDER_ID = '6f1c2a9e-3b7d-4c55-9a01-2d8e7f4b6c10';
const OTHER_ID = '0b9d8c7e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';

function d1(db: DatabaseSync): D1Database {
  const statement = (sql: string, values: SQLInputValue[] = []): D1PreparedStatement => ({
    bind: (...next) => statement(sql, next),
    first: async <T,>() => (db.prepare(sql).get(...values) ?? null) as T | null,
    all: async <T,>() => ({ results: db.prepare(sql).all(...values) as T[] }),
    run: async () => db.prepare(sql).run(...values),
  });
  return { prepare: (sql) => statement(sql), batch: async (list) => Promise.all(list.map((s) => s.run())) };
}

function makeEnv(overrides: Partial<ShopEnv> = {}): ShopEnv {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
  db.exec(seedSql(merch, skuOf));
  // un ordine pagato: 2 cappellini a 30 euro
  db.exec(`INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES ('${ORDER_ID}', 'cliente@example.com', 'nl', 'paid', 6000)`);
  db.exec(`INSERT INTO order_items (order_id, variant_id, quantity, price_cents) VALUES (1, (SELECT id FROM variants WHERE sku = 'cap'), 2, 3000)`);
  db.exec(`INSERT INTO shipping_addresses VALUES (1, 'Mario Rossi', 'Via Roma 1', '00100', 'Roma', 'IT')`);
  return { DB: d1(db), ORDER_TOKEN_SECRET: SECRET, ...overrides };
}

function orderRequest(body: unknown, init: { headers?: Record<string, string>; method?: string; raw?: string } = {}): Request {
  return new Request(`${ORIGIN}/api/order`, {
    method: init.method ?? 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin', ...init.headers },
    body: (init.method ?? 'POST') === 'GET' ? undefined : (init.raw ?? JSON.stringify(body)),
  });
}

afterEach(() => vi.restoreAllMocks());

describe('GET /api/products', () => {
  it('restituisce i prodotti attivi con prezzi e giacenze del database', async () => {
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`), makeEnv());
    expect(response.status).toBe(200);
    const products = (await response.json()) as { slug: string; priceCents: number; variants: unknown[] }[];
    expect(products.map((p) => p.slug)).toEqual(merch.map((m) => m.slug));
    expect(products.find((p) => p.slug === 'hoodie')?.priceCents).toBe(4500);
    expect(products.find((p) => p.slug === 'hoodie')?.variants).toHaveLength(6);
  });

  it('ha le intestazioni di sicurezza e non va in cache', async () => {
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`), makeEnv());
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('accetta solo GET', async () => {
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`, { method: 'POST' }), makeEnv());
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
  });

  it('con il database giù risponde 503 generico, senza dettagli', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const broken: D1Database = { prepare: () => { throw new Error('D1_ERROR: segreto interno'); }, batch: async () => [] };
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`), makeEnv({ DB: broken }));
    expect(response.status).toBe(503);
    expect(await response.text()).toBe('{"error":"unavailable"}');
  });

  it('oltre il limite di richieste risponde 429', async () => {
    const limiter: RateLimit = { limit: async () => ({ success: false }) };
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`), makeEnv({ SHOP_LIMITER: limiter }));
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
  });

  it('se il limitatore si rompe lascia passare', async () => {
    const limiter: RateLimit = { limit: async () => { throw new Error('giù'); } };
    const response = await handleProducts(new Request(`${ORIGIN}/api/products`), makeEnv({ SHOP_LIMITER: limiter }));
    expect(response.status).toBe(200);
  });
});

describe('POST /api/order', () => {
  it('con id e token giusti restituisce lo stato, senza email né indirizzo', async () => {
    const token = await orderToken(SECRET, ORDER_ID);
    const response = await handleOrder(orderRequest({ id: ORDER_ID, token }), makeEnv());
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ id: ORDER_ID, status: 'paid', totalCents: 6000, items: [{ sku: 'cap', quantity: 2, priceCents: 3000 }] });
    expect(text).not.toContain('cliente@example.com');
    expect(text).not.toContain('Roma');
  });

  it('token sbagliato, troncato, di un altro ordine o di un altro segreto: stessa risposta di un ordine inesistente', async () => {
    const env = makeEnv();
    const good = await orderToken(SECRET, ORDER_ID);
    // ordine che non esiste, con un token valido per il suo id
    const missing = await handleOrder(orderRequest({ id: OTHER_ID, token: await orderToken(SECRET, OTHER_ID) }), env);
    const reference = { status: missing.status, body: await missing.text() };
    expect(reference).toEqual({ status: 404, body: '{"error":"not_found"}' });

    const attempts = [
      'A'.repeat(43),
      good.slice(0, 42),
      good.slice(0, 20),
      await orderToken(SECRET, OTHER_ID),
      await orderToken('un-altro-segreto-0123456789abcdefghijklmnop', ORDER_ID),
      '',
      '../../etc/passwd',
    ];
    for (const token of attempts) {
      const response = await handleOrder(orderRequest({ id: ORDER_ID, token }), env);
      expect({ status: response.status, body: await response.text() }).toEqual(reference);
    }
  });

  it('rifiuta le richieste da un altro sito', async () => {
    const token = await orderToken(SECRET, ORDER_ID);
    const env = makeEnv();
    const fromElsewhere = await handleOrder(orderRequest({ id: ORDER_ID, token }, { headers: { Origin: 'https://evil.example' } }), env);
    expect(fromElsewhere.status).toBe(403);
    const crossSite = await handleOrder(orderRequest({ id: ORDER_ID, token }, { headers: { 'Sec-Fetch-Site': 'cross-site' } }), env);
    expect(crossSite.status).toBe(403);
  });

  it('accetta solo POST con JSON piccolo e campi nella forma giusta', async () => {
    const env = makeEnv();
    const token = await orderToken(SECRET, ORDER_ID);
    const get = await handleOrder(orderRequest(null, { method: 'GET' }), env);
    expect(get.status).toBe(405);
    expect(get.headers.get('Allow')).toBe('POST');

    const cases: Request[] = [
      orderRequest({ id: ORDER_ID, token }, { headers: { 'Content-Type': 'text/plain' } }),
      orderRequest(null, { raw: '{"id":' }),
      orderRequest({ id: ORDER_ID, token, extra: 'x'.repeat(600) }),
      orderRequest({ id: 'non-un-uuid', token }),
      orderRequest({ id: "1' OR '1'='1", token }),
      orderRequest({ id: 42, token }),
      orderRequest([ORDER_ID, token]),
    ];
    for (const request of cases) {
      const response = await handleOrder(request, env);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('{"error":"invalid"}');
    }
  });

  it('senza segreto configurato risponde 503 e non scrive il token nei log', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const token = await orderToken(SECRET, ORDER_ID);
    const response = await handleOrder(orderRequest({ id: ORDER_ID, token }), makeEnv({ ORDER_TOKEN_SECRET: '' }));
    expect(response.status).toBe(503);
    for (const call of log.mock.calls) expect(JSON.stringify(call)).not.toContain(token);
  });

  it('oltre il limite di richieste risponde 429 prima di leggere il body', async () => {
    const limiter: RateLimit = { limit: vi.fn(async () => ({ success: false })) };
    const response = await handleOrder(orderRequest({ id: ORDER_ID, token: 'x' }), makeEnv({ SHOP_LIMITER: limiter }));
    expect(response.status).toBe(429);
  });
});
