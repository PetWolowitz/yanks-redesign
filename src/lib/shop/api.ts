// Il contratto dello shop: tutto il frontend passa da qui, nessun componente chiama fetch.
// Due implementazioni della stessa interfaccia, scelte da PUBLIC_SHOP_MODE:
// mock.ts (dati finti, Fasi 1-3) e http.ts (endpoint veri, dalla Fase 4).
import { PUBLIC_SHOP_MODE } from 'astro:env/client';
import { createMockShopApi } from './mock';
import type { CheckoutRequest, CheckoutResponse, OrderStatus, Product } from './types';

export interface ShopApi {
  // prodotti e giacenze
  getProducts(): Promise<Product[]>;
  // crea l'ordine pending e restituisce id, token e l'indirizzo di pagamento
  createCheckout(req: CheckoutRequest): Promise<CheckoutResponse>;
  // stato dell'ordine; token sbagliato e ordine inesistente danno lo stesso errore
  getOrder(id: string, token: string): Promise<OrderStatus>;
}

function selectShopApi(): ShopApi {
  if (PUBLIC_SHOP_MODE === 'mock') return createMockShopApi();
  throw new Error('PUBLIC_SHOP_MODE=live: http.ts arriva nella Fase 4');
}

export const shopApi: ShopApi = selectShopApi();
