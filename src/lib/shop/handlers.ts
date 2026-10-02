// La logica degli endpoint, separata dai file in src/pages/api/ (che passano solo
// env e request) così si prova con Vitest su un SQLite in memoria.
import type { Lang } from '../../i18n/locales';
import { t, type Key } from '../../i18n/t';
import {
  cancelPendingOrder,
  findOrder,
  findOrderBySession,
  insertPendingOrder,
  listProducts,
  loadVariants,
  markOrderPaid,
  orderLinesForEmail,
  setStripeSession,
} from './db';
import { sendConfirmation } from './email';
import { apiError, clientKey, isSameOrigin, json, methodNotAllowed, readJson } from './http';
import type { ShopEnv } from './server-env';
import { createSession, verifyStripeSignature } from './stripe';
import { orderToken, verifyOrderToken } from './token';
import { verifyTurnstile } from './turnstile';
import type { CheckoutResponse } from './types';
import { validateCheckout } from './validate';

// Servizi esterni passati da fuori, così i test li sostituiscono senza rete
export interface Deps {
  fetch: typeof fetch;
  // millisecondi, come Date.now
  now: () => number;
  randomId: () => string;
}

const defaultDeps: Deps = {
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
  randomId: () => crypto.randomUUID(),
};

// L'id pubblico degli ordini è un UUID (crypto.randomUUID nel checkout)
const PUBLIC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// id e token in JSON: bastano poche centinaia di byte
const ORDER_BODY_MAX = 512;
// Il checkout: tutto il form, al massimo pochi KB
const CHECKOUT_BODY_MAX = 4096;
// Gli eventi di Stripe sono piccoli; oltre questo non è Stripe
const WEBHOOK_BODY_MAX = 128 * 1024;
// La sessione di Stripe scade dopo 31 minuti (Stripe accetta da 30 minuti a 24 ore)
const SESSION_LIFETIME_SECONDS = 31 * 60;

// Limite di richieste per IP. Se il limitatore non c'è o non risponde si lascia
// passare: non è la barriera di sicurezza, lo è il token
async function overLimit(env: ShopEnv, request: Request, scope: string): Promise<boolean> {
  if (!env.SHOP_LIMITER) return false;
  try {
    const { success } = await env.SHOP_LIMITER.limit({ key: `${scope}:${clientKey(request)}` });
    return !success;
  } catch {
    return false;
  }
}

const tooMany = () => apiError('unavailable', 429, { 'Retry-After': '60' });

// GET /api/products: prodotti attivi e giacenze. Niente dati personali
export async function handleProducts(request: Request, env: ShopEnv): Promise<Response> {
  if (request.method !== 'GET') return methodNotAllowed('GET');
  if (await overLimit(env, request, 'products')) return tooMany();
  try {
    return json(await listProducts(env.DB));
  } catch {
    console.error('api/products: lettura del database non riuscita');
    return apiError('unavailable');
  }
}

// POST /api/order con { id, token } nel body (mai nell'indirizzo: finirebbe nei log).
// Token sbagliato e ordine inesistente danno la stessa risposta (docs/06)
export async function handleOrder(request: Request, env: ShopEnv): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  if (!isSameOrigin(request)) return apiError('invalid', 403);
  if (await overLimit(env, request, 'order')) return tooMany();

  const body = await readJson(request, ORDER_BODY_MAX);
  const { id, token } = (body ?? {}) as Record<string, unknown>;
  if (typeof id !== 'string' || typeof token !== 'string' || !PUBLIC_ID.test(id)) return apiError('invalid');

  // Prima il token (tempo costante, nessuna lettura del database), poi l'ordine
  let valid = false;
  try {
    valid = await verifyOrderToken(env.ORDER_TOKEN_SECRET, id, token);
  } catch {
    console.error('api/order: ORDER_TOKEN_SECRET mancante o troppo corto');
    return apiError('unavailable');
  }
  if (!valid) return apiError('not_found');

  try {
    const order = await findOrder(env.DB, id);
    return order ? json(order) : apiError('not_found');
  } catch {
    console.error('api/order: lettura del database non riuscita');
    return apiError('unavailable');
  }
}

function productName(lang: Lang, slug: string, size: string | null): string {
  return t(lang, `shop.products.${slug}.name` as Key) + (size ? ` (${size})` : '');
}

// POST /api/checkout (docs/06, Flusso d'acquisto). L'ordine dei controlli conta:
// prima quelli che non costano niente, poi Turnstile, poi il database, poi Stripe.
// I prezzi arrivati dal browser non si leggono nemmeno: il totale viene dal database
export async function handleCheckout(request: Request, env: ShopEnv, deps: Deps = defaultDeps): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  if (!isSameOrigin(request)) return apiError('invalid', 403);
  if (await overLimit(env, request, 'checkout')) return tooMany();

  const validation = validateCheckout(await readJson(request, CHECKOUT_BODY_MAX));
  if (!validation.ok) return json({ error: 'invalid', fields: validation.errors }, 400);
  const req = validation.value;

  if (!(await verifyTurnstile(deps.fetch, env.TURNSTILE_SECRET_KEY, req.turnstileToken, clientKey(request)))) {
    return json({ error: 'invalid', fields: { turnstileToken: 'invalid' } }, 400);
  }

  const publicId = deps.randomId();
  try {
    const variants = await loadVariants(env.DB, req.items.map((item) => item.sku));
    const bySku = new Map(variants.map((variant) => [variant.sku, variant]));
    // Uno SKU che non esiste o di un prodotto spento: il carrello è vecchio
    if (req.items.some((item) => !bySku.has(item.sku))) return json({ error: 'invalid', fields: { items: 'invalid' } }, 400);
    if (req.items.some((item) => item.quantity > bySku.get(item.sku)!.stock)) return apiError('out_of_stock');

    const lines = req.items.map((item) => {
      const variant = bySku.get(item.sku)!;
      return { variant, quantity: item.quantity, priceCents: variant.price_cents };
    });
    const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

    await insertPendingOrder(env.DB, {
      publicId,
      email: req.email,
      lang: req.lang,
      totalCents,
      address: req.address,
      lines: lines.map((line) => ({ variantId: line.variant.variant_id, quantity: line.quantity, priceCents: line.priceCents })),
    });

    const origin = new URL(request.url).origin;
    const session = await createSession(deps.fetch, env.STRIPE_SECRET_KEY, {
      publicId,
      email: req.email,
      locale: req.lang,
      // senza parametri: il token non passa mai da Stripe (docs/06)
      successUrl: `${origin}/${req.lang}/shop/order/`,
      cancelUrl: `${origin}/${req.lang}/shop/checkout/`,
      expiresAt: Math.floor(deps.now() / 1000) + SESSION_LIFETIME_SECONDS,
      lines: lines.map((line) => ({
        name: productName(req.lang, line.variant.slug, line.variant.size),
        unitAmountCents: line.priceCents,
        quantity: line.quantity,
      })),
    });
    if (!session) {
      console.error('api/checkout: sessione Stripe non creata');
      await cancelPendingOrder(env.DB, { publicId });
      return apiError('unavailable');
    }
    await setStripeSession(env.DB, publicId, session.id);

    const body: CheckoutResponse = { id: publicId, token: await orderToken(env.ORDER_TOKEN_SECRET, publicId), redirectUrl: session.url };
    return json(body);
  } catch {
    console.error('api/checkout: errore interno');
    await cancelPendingOrder(env.DB, { publicId }).catch(() => {});
    return apiError('unavailable');
  }
}

interface StripeSession {
  id?: unknown;
  client_reference_id?: unknown;
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
}

// POST /api/stripe-webhook (docs/06). Solo eventi con firma valida. Risponde 200
// anche quando non c'è niente da fare, così Stripe non riprova all'infinito; 400
// solo per firma o corpo non validi
export async function handleStripeWebhook(request: Request, env: ShopEnv, deps: Deps = defaultDeps): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');

  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > WEBHOOK_BODY_MAX) return apiError('invalid');
  const raw = await request.text();
  if (raw.length > WEBHOOK_BODY_MAX) return apiError('invalid');

  const nowSeconds = Math.floor(deps.now() / 1000);
  if (!(await verifyStripeSignature(env.STRIPE_WEBHOOK_SECRET, request.headers.get('Stripe-Signature'), raw, nowSeconds))) {
    return apiError('invalid');
  }

  let event: { type?: unknown; data?: { object?: StripeSession } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return apiError('invalid');
  }
  const session = event.data?.object;
  if (typeof session?.id !== 'string') return json({ received: true });

  try {
    const order = await findOrderBySession(env.DB, session.id);
    // La sessione deve essere nostra e combaciare su due campi
    if (!order || session.client_reference_id !== order.public_id) return json({ received: true });

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      await cancelPendingOrder(env.DB, { sessionId: session.id });
      return json({ received: true });
    }

    const paidNow =
      (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
      event.type === 'checkout.session.async_payment_succeeded';
    if (!paidNow) return json({ received: true });

    // L'importo pagato deve essere esattamente il totale calcolato dal database
    if (session.amount_total !== order.total_cents || session.currency !== 'eur') {
      console.error("api/stripe-webhook: importo diverso dal totale dell'ordine, ordine non segnato come pagato");
      return json({ received: true });
    }

    if (await markOrderPaid(env.DB, order.id)) {
      // Da qui l'ordine è pagato: qualunque problema con l'email non lo cambia e
      // non fa riprovare Stripe. Nei log mai token né email
      try {
        const sent = await sendConfirmation(deps.fetch, env.RESEND_API_KEY, env.EMAIL_FROM, order.email, new URL(request.url).origin, {
          publicId: order.public_id,
          token: await orderToken(env.ORDER_TOKEN_SECRET, order.public_id),
          lang: order.lang as Lang,
          totalCents: order.total_cents,
          items: await orderLinesForEmail(env.DB, order.id),
        });
        if (!sent) console.error('api/stripe-webhook: email di conferma non inviata');
      } catch {
        console.error('api/stripe-webhook: email di conferma non preparata');
      }
    }
    return json({ received: true });
  } catch {
    // 500: Stripe riproverà più tardi, e l'aggiornamento è idempotente
    console.error('api/stripe-webhook: errore interno');
    return apiError('unavailable', 500);
  }
}
