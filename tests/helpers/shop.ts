// Strumenti comuni ai test degli endpoint: un SQLite in memoria con schema e seed
// veri, un adattatore con la parte di D1 che usiamo, e servizi esterni finti.
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { merch, skuOf } from '../../src/data/merch';
import type { Deps } from '../../src/lib/shop/handlers';
import { seedSql } from '../../src/lib/shop/seed';
import type { D1Database, D1PreparedStatement, ShopEnv } from '../../src/lib/shop/server-env';

export const ORIGIN = 'https://yanks.test';
export const SECRETS = {
  ORDER_TOKEN_SECRET: 'segreto-di-prova-0123456789abcdefghijklmnop',
  STRIPE_SECRET_KEY: 'sk_test_finto',
  STRIPE_WEBHOOK_SECRET: 'whsec_finto_0123456789',
  TURNSTILE_SECRET_KEY: 'turnstile-finto',
  RESEND_API_KEY: 're_finto',
  EMAIL_FROM: 'Yanks concept <onboarding@resend.dev>',
};

export function d1(db: DatabaseSync): D1Database {
  const statement = (sql: string, values: SQLInputValue[] = []): D1PreparedStatement => ({
    bind: (...next) => statement(sql, next),
    first: async <T,>() => (db.prepare(sql).get(...values) ?? null) as T | null,
    all: async <T,>() => ({ results: db.prepare(sql).all(...values) as T[] }),
    run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...values).changes) } }),
  });
  return {
    prepare: (sql) => statement(sql),
    // Come D1: un batch è una transazione
    batch: async (list) => {
      db.exec('BEGIN');
      try {
        const results = [];
        for (const s of list) results.push(await s.run());
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

export function makeDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../../migrations/0001_init.sql', import.meta.url), 'utf8'));
  db.exec(seedSql(merch, skuOf));
  return db;
}

export function makeEnv(db: DatabaseSync = makeDb(), overrides: Partial<ShopEnv> = {}): ShopEnv {
  return { DB: d1(db), ...SECRETS, ...overrides };
}

export interface FakeCall {
  url: string;
  init: RequestInit;
}

// fetch finto: risponde in base all'indirizzo e registra le chiamate
export function fakeFetch(answers: { turnstile?: unknown; stripe?: unknown; resend?: number } = {}) {
  const calls: FakeCall[] = [];
  const fetcher = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes('turnstile')) return Response.json(answers.turnstile ?? { success: true });
    if (url.includes('api.stripe.com')) {
      const body = answers.stripe ?? { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' };
      return body === 'error' ? new Response('{}', { status: 500 }) : Response.json(body);
    }
    if (url.includes('api.resend.com')) return new Response('{"id":"em_1"}', { status: answers.resend ?? 200 });
    throw new Error(`chiamata inattesa: ${url}`);
  }) as typeof fetch;
  return { fetcher, calls };
}

export const FIXED_NOW = Date.UTC(2026, 9, 2, 12, 0, 0);

export function deps(fetcher: typeof fetch, id = '6f1c2a9e-3b7d-4c55-9a01-2d8e7f4b6c10'): Deps {
  return { fetch: fetcher, now: () => FIXED_NOW, randomId: () => id };
}

// Firma come la fa Stripe: HMAC-SHA256 di "timestamp.corpo", in esadecimale
export function stripeSignature(body: string, secret = SECRETS.STRIPE_WEBHOOK_SECRET, timestamp = Math.floor(FIXED_NOW / 1000)): string {
  const v1 = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}
