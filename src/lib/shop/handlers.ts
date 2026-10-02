// La logica degli endpoint, separata dai file in src/pages/api/ (che passano solo
// env e request) così si prova con Vitest su un SQLite in memoria.
import { findOrder, listProducts } from './db';
import { apiError, clientKey, isSameOrigin, json, methodNotAllowed, readJson } from './http';
import type { ShopEnv } from './server-env';
import { verifyOrderToken } from './token';

// L'id pubblico degli ordini è un UUID (crypto.randomUUID nel checkout)
const PUBLIC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// id e token in JSON: bastano poche centinaia di byte
const ORDER_BODY_MAX = 512;

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
