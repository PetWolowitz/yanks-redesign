// Giacenze per il browser: una sola chiamata a getProducts() per pagina, condivisa
// da tutti i componenti che ne hanno bisogno. null = servizio non raggiungibile.
import { shopApi } from './api';
import type { Product } from './types';

let products: Promise<Product[] | null> | null = null;

export function loadProducts(): Promise<Product[] | null> {
  products ??= shopApi.getProducts().catch(() => null);
  return products;
}

// Somma delle giacenze degli SKU indicati; null se il servizio non risponde
export async function stockOf(skus: string[]): Promise<number | null> {
  const list = await loadProducts();
  if (!list) return null;
  return list
    .flatMap((product) => product.variants)
    .filter((variant) => skus.includes(variant.sku))
    .reduce((sum, variant) => sum + variant.stock, 0);
}
