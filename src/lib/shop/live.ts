// ShopApi sugli endpoint veri (Fase 4): l'unico punto del frontend che chiama fetch.
// Stessa interfaccia e stessi errori del mock (ShopError), così i componenti non
// cambiano passando da mock a live.
import type { ShopApi } from './api';
import { ShopError, type ApiErrorBody, type CheckoutResponse, type OrderStatus, type Product, type ShopErrorCode } from './types';

const CODES: readonly ShopErrorCode[] = ['invalid', 'out_of_stock', 'not_found', 'unavailable'];

async function call<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ShopError('unavailable');
  }
  const data = (await response.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;
  if (response.ok && data) return data;
  // Qualunque risposta inattesa diventa "servizio non disponibile"
  const code = data && CODES.includes(data.error as ShopErrorCode) ? (data.error as ShopErrorCode) : 'unavailable';
  throw new ShopError(code, data?.fields);
}

export function createLiveShopApi(): ShopApi {
  return {
    getProducts: () => call<Product[]>('/api/products'),
    createCheckout: (req) => call<CheckoutResponse>('/api/checkout', req),
    // id e token nel corpo, mai nell'indirizzo (finirebbero nei log)
    getOrder: (id, token) => call<OrderStatus>('/api/order', { id, token }),
  };
}
