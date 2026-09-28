// ShopApi finta: legge merch.ts, simula le giacenze e il pagamento.
// Si comporta come il server: valida la richiesta con validate.ts e calcola il
// totale dai prezzi di merch.ts, mai da quelli del browser.
// Gli ordini finti stanno in localStorage, così sopravvivono al finto
// reindirizzamento e si aprono anche da un'altra scheda col link copiato.
import { merch, skuOf } from '../../data/merch';
import type { ShopApi } from './api';
import { ShopError, type CheckoutResponse, type OrderStatus, type Product } from './types';
import { validateCheckout } from './validate';

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;

interface MockOrder {
  id: string;
  token: string;
  createdAt: number;
  totalCents: number;
  items: OrderStatus['items'];
}

export interface MockOptions {
  // dove salvare gli ordini; di serie localStorage, o la memoria se non c'è
  storage?: Storage;
  now?: () => number;
  // quanto resta pending l'ordine, per vedere "pagamento in verifica"
  paymentDelayMs?: number;
}

const STORAGE_KEY = 'yanks-mock-orders';
const MAX_ORDERS = 20;

// Giacenze finte: 20 per variante, tranne qualche caso per provare l'interfaccia
const DEFAULT_STOCK = 20;
const stockOverrides: Record<string, number> = {
  // esaurito
  'skull-t-shirt-xl': 0,
  // ne restano pochi
  'limited-t-shirt-m': 2,
  'mystery-box': 3,
};

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) };
}

function defaultStorage(): Storage {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // localStorage bloccato (per esempio cookie disattivati): si ripiega sulla memoria
  }
  return memoryStorage();
}

// 32 byte casuali in base64url, 43 caratteri: stessa forma del token vero
function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildProducts(): Product[] {
  return merch.map(({ slug, category, priceCents, sizes, limited }) => ({
    slug,
    category,
    priceCents,
    limited,
    variants: (sizes.length > 0 ? sizes : [null]).map((size) => {
      const sku = skuOf(slug, size);
      return { sku, size, stock: stockOverrides[sku] ?? DEFAULT_STOCK };
    }),
  }));
}

export function createMockShopApi(options: MockOptions = {}): ShopApi {
  const storage = options.storage ?? defaultStorage();
  const now = options.now ?? Date.now;
  const paymentDelayMs = options.paymentDelayMs ?? 2000;

  function loadOrders(): MockOrder[] {
    try {
      const saved = storage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as MockOrder[]) : [];
    } catch {
      return [];
    }
  }

  function saveOrders(orders: MockOrder[]): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(-MAX_ORDERS)));
    } catch {
      // spazio pieno o storage bloccato: l'ordine finto va perso, il mock resta usabile
    }
  }

  return {
    async getProducts() {
      return buildProducts();
    },

    async createCheckout(req): Promise<CheckoutResponse> {
      const result = validateCheckout(req);
      if (!result.ok) throw new ShopError('invalid', result.errors);
      const { lang, items } = result.value;

      const products = buildProducts();
      const lines: OrderStatus['items'] = [];
      for (const { sku, quantity } of items) {
        const product = products.find((p) => p.variants.some((v) => v.sku === sku));
        const variant = product?.variants.find((v) => v.sku === sku);
        if (!product || !variant) throw new ShopError('invalid', { items: 'invalid' });
        if (quantity > variant.stock) throw new ShopError('out_of_stock');
        lines.push({ sku, quantity, priceCents: product.priceCents });
      }

      const order: MockOrder = {
        id: crypto.randomUUID(),
        token: randomToken(),
        createdAt: now(),
        totalCents: lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0),
        items: lines,
      };
      saveOrders([...loadOrders(), order]);

      // Al posto di Stripe si torna subito alla pagina ordine, senza parametri,
      // come farà il success_url vero
      return { id: order.id, token: order.token, redirectUrl: `/${lang}/shop/order/` };
    },

    async getOrder(id, token): Promise<OrderStatus> {
      // Nel mock basta il confronto semplice. In api/order il token si verifica
      // solo con crypto.subtle.verify, mai con === (docs/06)
      const order = loadOrders().find((o) => o.id === id && o.token === token);
      if (!order) throw new ShopError('not_found');
      const status = now() - order.createdAt >= paymentDelayMs ? 'paid' : 'pending';
      return { id: order.id, status, totalCents: order.totalCents, items: order.items };
    },
  };
}
