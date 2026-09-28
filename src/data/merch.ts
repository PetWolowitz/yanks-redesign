// Prodotti dello shop: l'unica fonte scritta a mano (docs/03, sezione Merch).
// Da qui escono i prezzi scritti nell'HTML statico in build e il seed del database.
// Un prezzo si cambia solo qui, poi seed e nuova pubblicazione: l'addebito lo
// calcola sempre il server dal database.
// Nomi e descrizioni nei file di lingua: shop.products.<slug>.name e .description.
// Niente accessori legati alla cannabis e niente semi (docs/03).
import type { MerchItem, Size } from '../lib/shop/types';

// Taglie di shop.yanks.nl (lette il 2026-09-28). I colori non ci sono: il concept
// vende una variante per taglia (docs/06, Merch)
const clothingSizes: Size[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const merch: MerchItem[] = [
  { slug: 'djeep-lighter', category: 'smoking', priceCents: 350, sizes: [], limited: null },
  { slug: 'clipper-lighter', category: 'smoking', priceCents: 400, sizes: [], limited: null },
  { slug: 'torch-lighter', category: 'smoking', priceCents: 500, sizes: [], limited: null },
  { slug: 'metal-cigarette-case', category: 'smoking', priceCents: 600, sizes: [], limited: null },
  { slug: 'ceramic-ashtray', category: 'smoking', priceCents: 1750, sizes: [], limited: null },
  { slug: 'metal-ashtray-zandvoort', category: 'smoking', priceCents: 1750, sizes: [], limited: null },
  { slug: 'indian-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'skull-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'ton-sur-ton-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'swim-short', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'limited-t-shirt', category: 'clothing', priceCents: 4000, sizes: clothingSizes, limited: 250 },
  { slug: 'hoodie', category: 'clothing', priceCents: 4500, sizes: clothingSizes, limited: null },
  { slug: 'zipper', category: 'clothing', priceCents: 4500, sizes: clothingSizes, limited: null },
  // Cappellino e beanie: prezzi da shop.yanks.nl, taglia unica
  { slug: 'cap', category: 'clothing', priceCents: 3000, sizes: [], limited: null },
  { slug: 'beanie', category: 'clothing', priceCents: 2500, sizes: [], limited: null },
  { slug: 'mystery-box', category: 'special', priceCents: 8000, sizes: [], limited: 50 },
];

// SKU di una variante: "hoodie-m", oppure solo lo slug se il prodotto ha taglia unica.
// La usano mock, seed e carrello: una regola sola
export function skuOf(slug: string, size: Size | null): string {
  return size ? `${slug}-${size.toLowerCase()}` : slug;
}
