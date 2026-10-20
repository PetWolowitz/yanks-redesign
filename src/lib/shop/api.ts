// Il contratto dello shop: tutto il frontend passa da qui, nessun componente chiama fetch.
// Due implementazioni della stessa interfaccia, scelte da PUBLIC_SHOP_MODE:
// mock.ts (dati finti, Fasi 1-3) e live.ts (endpoint veri, dalla Fase 4).
import { PUBLIC_SHOP_MODE } from 'astro:env/client';
import { createLiveShopApi } from './live';
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
  return PUBLIC_SHOP_MODE === 'live' ? createLiveShopApi() : createMockShopApi();
}

export const shopApi: ShopApi = selectShopApi();
