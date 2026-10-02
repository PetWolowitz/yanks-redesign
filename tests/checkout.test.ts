// POST /api/checkout e POST /api/stripe-webhook: i test obbligatori di docs/04
// (Fase 3) più quelli sugli attacchi. Database SQLite in memoria, servizi finti.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleCheckout, handleOrder, handleStripeWebhook } from '../src/lib/shop/handlers';
import { verifyStripeSignature } from '../src/lib/shop/stripe';
import { orderToken } from '../src/lib/shop/token';
import { deps, fakeFetch, FIXED_NOW, makeDb, makeEnv, ORIGIN, SECRETS, stripeSignature } from './helpers/shop';

const ID = '6f1c2a9e-3b7d-4c55-9a01-2d8e7f4b6c10';

const validBody = {
  lang: 'nl',
  email: 'cliente@example.com',
  address: { fullName: 'Mario Rossi', street: 'Dorpsplein 2', postalCode: '2042 JK', city: 'Zandvoort', country: 'NL' },
  items: [
    { sku: 'cap', quantity: 2 },
    { sku: 'hoodie-m', quantity: 1 },
  ],
  turnstileToken: 'token-del-widget',
};

function checkoutRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${ORIGIN}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin', ...headers },
    body: JSON.stringify(body),
  });
}

function webhookRequest(event: unknown, signature?: string): Request {
  const body = JSON.stringify(event);
  return new Request(`${ORIGIN}/api/stripe-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature ?? stripeSignature(body) },
    body,
  });
}

function paidEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_123', client_reference_id: ID, payment_status: 'paid', amount_total: 10500, currency: 'eur', ...overrides } },
  };
}

const row = <T,>(db: ReturnType<typeof makeDb>, sql: string, ...params: (string | number)[]) => db.prepare(sql).get(...params) as T;

// Checkout riuscito: restituisce db, risposta e chiamate ai servizi finti
async function checkout(body: unknown = validBody) {
  const db = makeDb();
  const fake = fakeFetch();
  const response = await handleCheckout(checkoutRequest(body), makeEnv(db), deps(fake.fetcher, ID));
  return { db, fake, response };
}

afterEach(() => vi.restoreAllMocks());

describe('POST /api/checkout', () => {
  it('crea un ordine pending, la sessione Stripe e risponde con id, token e indirizzo di Stripe', async () => {
    const { db, response } = await checkout();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; token: string; redirectUrl: string };
    expect(body).toEqual({ id: ID, token: await orderToken(SECRETS.ORDER_TOKEN_SECRET, ID), redirectUrl: 'https://checkout.stripe.com/c/pay/cs_test_123' });
    const order = row<{ status: string; total_cents: number; stripe_session_id: string }>(db, 'SELECT status, total_cents, stripe_session_id FROM orders WHERE public_id = ?', ID);
    // 2 cappellini a 30 euro + una felpa a 45
    expect(order).toEqual({ status: 'pending', total_cents: 10500, stripe_session_id: 'cs_test_123' });
  });

  it('un prezzo modificato dal browser non cambia l\'addebito', async () => {
    const tampered = { ...validBody, items: [{ sku: 'cap', quantity: 2, priceCents: 1 }], totalCents: 2 };
    const { db, fake, response } = await checkout(tampered);
    expect(response.status).toBe(200);
    const stripe = fake.calls.find((call) => call.url.includes('api.stripe.com'))!;
    const form = new URLSearchParams(String(stripe.init.body));
    expect(form.get('line_items[0][price_data][unit_amount]')).toBe('3000');
    expect(form.get('line_items[0][quantity]')).toBe('2');
    expect(row<{ total_cents: number }>(db, 'SELECT total_cents FROM orders').total_cents).toBe(6000);
  });

  it('il success_url non contiene il token né l\'id: il token non passa da Stripe', async () => {
    const { fake, response } = await checkout();
    const { token } = (await response.json()) as { token: string };
    const stripe = fake.calls.find((call) => call.url.includes('api.stripe.com'))!;
    const form = new URLSearchParams(String(stripe.init.body));
    expect(form.get('success_url')).toBe(`${ORIGIN}/nl/shop/order/`);
    expect(String(stripe.init.body)).not.toContain(token);
    expect((stripe.init.headers as Record<string, string>)['Idempotency-Key']).toBe(`checkout-${ID}`);
  });

  it('una quantità superiore alla giacenza viene rifiutata', async () => {
    const db = makeDb();
    db.prepare('UPDATE variants SET stock = 1 WHERE sku = ?').run('cap');
    const fake = fakeFetch();
    const response = await handleCheckout(checkoutRequest(validBody), makeEnv(db), deps(fake.fetcher, ID));
    expect(response.status).toBe(409);
    expect(await response.text()).toBe('{"error":"out_of_stock"}');
    expect(row<{ n: number }>(db, 'SELECT COUNT(*) n FROM orders').n).toBe(0);
    expect(fake.calls.some((call) => call.url.includes('stripe'))).toBe(false);
  });

  it('Turnstile non superato o non raggiungibile: niente ordine', async () => {
    for (const answer of [{ success: false, 'error-codes': ['invalid-input-response'] }, 'not json']) {
      const db = makeDb();
      const fake = fakeFetch({ turnstile: answer });
      const response = await handleCheckout(checkoutRequest(validBody), makeEnv(db), deps(fake.fetcher, ID));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'invalid', fields: { turnstileToken: 'invalid' } });
      expect(row<{ n: number }>(db, 'SELECT COUNT(*) n FROM orders').n).toBe(0);
    }
  });

  it('campi non validi: 400 con gli errori dei campi, senza chiamare servizi esterni', async () => {
    const fake = fakeFetch();
    const response = await handleCheckout(checkoutRequest({ ...validBody, email: 'non-una-email' }), makeEnv(), deps(fake.fetcher, ID));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid', fields: { email: 'invalid' } });
    expect(fake.calls).toHaveLength(0);
  });

  it('SKU inesistente o di un prodotto spento: rifiutato', async () => {
    const db = makeDb();
    db.prepare("UPDATE products SET active = 0 WHERE slug = 'cap'").run();
    const fake = fakeFetch();
    const response = await handleCheckout(checkoutRequest(validBody), makeEnv(db), deps(fake.fetcher, ID));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid', fields: { items: 'invalid' } });
  });

  it('Stripe non risponde o risponde con un indirizzo estraneo: ordine annullato, 503', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const stripe of ['error', { id: 'cs_1', url: 'https://evil.example/pay' }]) {
      const db = makeDb();
      const fake = fakeFetch({ stripe });
      const response = await handleCheckout(checkoutRequest(validBody), makeEnv(db), deps(fake.fetcher, ID));
      expect(response.status).toBe(503);
      expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('cancelled');
    }
  });

  it('rifiuta richieste da altri siti e metodi diversi da POST', async () => {
    const fake = fakeFetch();
    const cross = await handleCheckout(checkoutRequest(validBody, { Origin: 'https://evil.example' }), makeEnv(), deps(fake.fetcher, ID));
    expect(cross.status).toBe(403);
    const get = await handleCheckout(new Request(`${ORIGIN}/api/checkout`), makeEnv(), deps(fake.fetcher, ID));
    expect(get.status).toBe(405);
    expect(fake.calls).toHaveLength(0);
  });
});

describe('POST /api/stripe-webhook', () => {
  it('l\'ordine resta pending finché il webhook non conferma, poi è paid e le giacenze scendono', async () => {
    const { db } = await checkout();
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('pending');
    const before = row<{ stock: number }>(db, "SELECT stock FROM variants WHERE sku = 'cap'").stock;

    const fake = fakeFetch();
    const response = await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fake.fetcher));
    expect(response.status).toBe(200);
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('paid');
    expect(row<{ stock: number }>(db, "SELECT stock FROM variants WHERE sku = 'cap'").stock).toBe(before - 2);
    expect(row<{ stock: number }>(db, "SELECT stock FROM variants WHERE sku = 'hoodie-m'").stock).toBe(19);
  });

  it('lo stesso webhook due volte non scala le giacenze due volte e manda una sola email', async () => {
    const { db } = await checkout();
    const fake = fakeFetch();
    await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fake.fetcher));
    await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fake.fetcher));
    expect(row<{ stock: number }>(db, "SELECT stock FROM variants WHERE sku = 'cap'").stock).toBe(18);
    expect(fake.calls.filter((call) => call.url.includes('resend'))).toHaveLength(1);
  });

  it('un webhook con firma sbagliata, vecchia o assente viene rifiutato', async () => {
    const { db } = await checkout();
    const body = JSON.stringify(paidEvent());
    const stale = Math.floor(FIXED_NOW / 1000) - 301;
    for (const signature of [
      stripeSignature(body, 'whsec_altro_segreto'),
      stripeSignature(body, SECRETS.STRIPE_WEBHOOK_SECRET, stale),
      `t=${Math.floor(FIXED_NOW / 1000)},v0=${'a'.repeat(64)}`,
      'garbage',
    ]) {
      const response = await handleStripeWebhook(webhookRequest(paidEvent(), signature), makeEnv(db), deps(fakeFetch().fetcher));
      expect(response.status).toBe(400);
    }
    // e un corpo modificato dopo la firma
    const tampered = new Request(`${ORIGIN}/api/stripe-webhook`, {
      method: 'POST',
      headers: { 'Stripe-Signature': stripeSignature(body) },
      body: body.replace('10500', '1'),
    });
    expect((await handleStripeWebhook(tampered, makeEnv(db), deps(fakeFetch().fetcher))).status).toBe(400);
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('pending');
  });

  it('importo pagato diverso dal totale, o sessione di un altro ordine: non pagato', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { db } = await checkout();
    for (const event of [paidEvent({ amount_total: 100 }), paidEvent({ currency: 'usd' }), paidEvent({ client_reference_id: 'altro' })]) {
      const response = await handleStripeWebhook(webhookRequest(event), makeEnv(db), deps(fakeFetch().fetcher));
      expect(response.status).toBe(200);
    }
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('pending');
  });

  it('con Resend che risponde errore l\'ordine resta paid, il webhook risponde 200 e nei log non c\'è il token', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { db, response: checkoutResponse } = await checkout();
    const { token } = (await checkoutResponse.json()) as { token: string };
    const response = await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fakeFetch({ resend: 500 }).fetcher));
    expect(response.status).toBe(200);
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('paid');
    expect(log).toHaveBeenCalled();
    for (const call of log.mock.calls) {
      expect(JSON.stringify(call)).not.toContain(token);
      expect(JSON.stringify(call)).not.toContain('cliente@example.com');
    }
  });

  it('l\'email porta il link con id e token nel fragment, nella lingua dell\'ordine', async () => {
    const { db, response: checkoutResponse } = await checkout();
    const { token } = (await checkoutResponse.json()) as { token: string };
    const fake = fakeFetch();
    await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fake.fetcher));
    const email = JSON.parse(String(fake.calls.find((call) => call.url.includes('resend'))!.init.body)) as Record<string, unknown>;
    expect(email.to).toEqual(['cliente@example.com']);
    expect(email.from).toBe(SECRETS.EMAIL_FROM);
    expect(String(email.text)).toContain(`${ORIGIN}/nl/shop/order/#id=${ID}&t=${token}`);
    expect(String(email.subject)).toContain('Je bestelling');
  });

  it('dopo il pagamento la pagina ordine vede lo stato paid', async () => {
    const { db, response: checkoutResponse } = await checkout();
    const { token } = (await checkoutResponse.json()) as { token: string };
    await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(db), deps(fakeFetch().fetcher));
    const response = await handleOrder(
      new Request(`${ORIGIN}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({ id: ID, token }),
      }),
      makeEnv(db),
    );
    expect(((await response.json()) as { status: string }).status).toBe('paid');
  });

  it('sessione scaduta: l\'ordine pending viene annullato, uno pagato no', async () => {
    const { db } = await checkout();
    const expired = { type: 'checkout.session.expired', data: { object: { id: 'cs_test_123', client_reference_id: ID } } };
    await handleStripeWebhook(webhookRequest(expired), makeEnv(db), deps(fakeFetch().fetcher));
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('cancelled');

    const paid = await checkout();
    await handleStripeWebhook(webhookRequest(paidEvent()), makeEnv(paid.db), deps(fakeFetch().fetcher));
    await handleStripeWebhook(webhookRequest(expired), makeEnv(paid.db), deps(fakeFetch().fetcher));
    expect(row<{ status: string }>(paid.db, 'SELECT status FROM orders').status).toBe('paid');
  });

  it('eventi sconosciuti o di sessioni non nostre: 200 senza toccare niente', async () => {
    const { db } = await checkout();
    const other = { type: 'checkout.session.completed', data: { object: { id: 'cs_altro', client_reference_id: ID, payment_status: 'paid', amount_total: 10500, currency: 'eur' } } };
    for (const event of [{ type: 'charge.refunded', data: { object: { id: 'ch_1' } } }, other]) {
      const response = await handleStripeWebhook(webhookRequest(event), makeEnv(db), deps(fakeFetch().fetcher));
      expect(response.status).toBe(200);
    }
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('pending');
  });
});

describe('verifyStripeSignature', () => {
  it('accetta una delle firme v1 multiple e ignora gli altri schemi', async () => {
    const body = '{"a":1}';
    const now = Math.floor(FIXED_NOW / 1000);
    const good = stripeSignature(body).split(',')[1];
    const header = `t=${now},v1=${'0'.repeat(64)},${good},v0=${'f'.repeat(64)}`;
    expect(await verifyStripeSignature(SECRETS.STRIPE_WEBHOOK_SECRET, header, body, now)).toBe(true);
  });
});

describe('senza chiavi configurate', () => {
  it('tutto viene rifiutato: nessun ordine pagato, nessuna sessione', async () => {
    const { db } = await checkout();
    const event = paidEvent();
    const body = JSON.stringify(event);
    const response = await handleStripeWebhook(
      new Request(`${ORIGIN}/api/stripe-webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSignature(body, '') }, body }),
      makeEnv(db, { STRIPE_WEBHOOK_SECRET: '' }),
      deps(fakeFetch().fetcher),
    );
    expect(response.status).toBe(400);
    expect(row<{ status: string }>(db, 'SELECT status FROM orders').status).toBe('pending');
  });
});
