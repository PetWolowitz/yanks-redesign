// Il carrello: solo SKU e quantità, mai prezzi (docs/06). Sta in localStorage,
// dentro try/catch: se lo storage è bloccato il carrello vive finché resta la pagina.
// Le funzioni pure (addItem, setQuantity, countItems, parseCart) sono testate;
// loadCart, saveCart e onCartChange le collegano al browser.
import type { CartItem } from './types';
import { isValidQuantity, limits } from './validate';

export type Cart = CartItem[];

const STORAGE_KEY = 'yanks-cart';
const EVENT = 'cart-change';

// Aggiunge o somma; la quantità di una riga non supera il massimo per riga
export function addItem(cart: Cart, sku: string, quantity: number): Cart {
  const current = cart.find((item) => item.sku === sku)?.quantity ?? 0;
  return setQuantity(cart, sku, Math.min(current + quantity, limits.maxQuantity));
}

// Imposta la quantità; 0 o meno toglie la riga
export function setQuantity(cart: Cart, sku: string, quantity: number): Cart {
  if (quantity <= 0) return cart.filter((item) => item.sku !== sku);
  const clamped = Math.min(Math.floor(quantity), limits.maxQuantity);
  return cart.some((item) => item.sku === sku)
    ? cart.map((item) => (item.sku === sku ? { sku, quantity: clamped } : item))
    : [...cart, { sku, quantity: clamped }];
}

export function countItems(cart: Cart): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Legge quello che c'è in storage senza fidarsi: righe non valide o doppie spariscono
export function parseCart(raw: string | null): Cart {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const cart: Cart = [];
    for (const entry of data) {
      const { sku, quantity } = (entry ?? {}) as Record<string, unknown>;
      if (typeof sku !== 'string' || !/^[a-z0-9-]{1,64}$/.test(sku) || !isValidQuantity(quantity)) continue;
      if (cart.some((item) => item.sku === sku)) continue;
      cart.push({ sku, quantity });
    }
    return cart.slice(0, limits.maxLines);
  } catch {
    return [];
  }
}

// Ripiego in memoria se localStorage non funziona
let memory: Cart = [];

export function loadCart(): Cart {
  try {
    return parseCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return memory;
  }
}

export function saveCart(cart: Cart): void {
  memory = cart;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // storage bloccato o pieno: resta la copia in memoria
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Chiama callback quando il carrello cambia, in questa scheda o in un'altra
export function onCartChange(callback: (cart: Cart) => void): void {
  window.addEventListener(EVENT, () => callback(loadCart()));
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) callback(loadCart());
  });
}
