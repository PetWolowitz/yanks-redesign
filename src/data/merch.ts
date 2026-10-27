// Prodotti dello shop: l'unica fonte scritta a mano (docs/03, sezione Merch).
// Da qui escono i prezzi scritti nell'HTML statico in build e il seed del database.
// Un prezzo si cambia solo qui, poi seed e nuova pubblicazione: l'addebito lo
// calcola sempre il server dal database.
// Nomi e descrizioni nei file di lingua: shop.products.<slug>.name e .description.
// Niente accessori legati alla cannabis e niente semi (docs/03).
import type { Color, MerchItem, Size } from '../lib/shop/types';

// Taglie di shop.yanks.nl (lette il 2026-09-28). Colori dal 2026-10-27 (Pietro: "scelta
// a pastiglie"), solo per i prodotti che ne hanno più d'uno nelle foto del negozio
const clothingSizes: Size[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const merch: MerchItem[] = [
  { slug: 'djeep-lighter', category: 'smoking', priceCents: 350, sizes: [], limited: null },
  { slug: 'clipper-lighter', category: 'smoking', priceCents: 400, sizes: [], limited: null, colors: ['black', 'white', 'pink', 'red', 'blue', 'green', 'burgundy', 'yellow'] },
  { slug: 'torch-lighter', category: 'smoking', priceCents: 500, sizes: [], limited: null },
  { slug: 'metal-cigarette-case', category: 'smoking', priceCents: 600, sizes: [], limited: null },
  { slug: 'ceramic-ashtray', category: 'smoking', priceCents: 1750, sizes: [], limited: null },
  { slug: 'metal-ashtray-zandvoort', category: 'smoking', priceCents: 1750, sizes: [], limited: null },
  { slug: 'indian-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'skull-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'ton-sur-ton-t-shirt', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null, colors: ['brown', 'army-green'] },
  { slug: 'swim-short', category: 'clothing', priceCents: 3500, sizes: clothingSizes, limited: null },
  { slug: 'limited-t-shirt', category: 'clothing', priceCents: 4000, sizes: clothingSizes, limited: 250 },
  { slug: 'hoodie', category: 'clothing', priceCents: 4500, sizes: clothingSizes, limited: null, colors: ['blue', 'army-green', 'grey', 'black'] },
  { slug: 'zipper', category: 'clothing', priceCents: 4500, sizes: clothingSizes, limited: null },
  // Cappellino e beanie: prezzi da shop.yanks.nl, taglia unica
  { slug: 'cap', category: 'clothing', priceCents: 3000, sizes: [], limited: null },
  { slug: 'beanie', category: 'clothing', priceCents: 2500, sizes: [], limited: null },
  // Accessori da shop.yanks.nl (2026-09-29). Il profumo ha due fragranze: due prodotti,
  // perché il contratto conosce solo le taglie
  { slug: 'beach-bag', category: 'accessories', priceCents: 1750, sizes: [], limited: null },
  { slug: 'metal-keychain', category: 'accessories', priceCents: 450, sizes: [], limited: null },
  { slug: 'wristband-keychain', category: 'accessories', priceCents: 900, sizes: [], limited: null },
  { slug: 'interior-perfume-original', category: 'accessories', priceCents: 1500, sizes: [], limited: null },
  { slug: 'interior-perfume-high-tides', category: 'accessories', priceCents: 1500, sizes: [], limited: null },
  { slug: 'mystery-box', category: 'special', priceCents: 8000, sizes: [], limited: 50 },
];

// SKU di una variante: slug, poi colore e taglia se ci sono: "hoodie-black-m",
// "skull-t-shirt-m", "clipper-lighter-red", "cap". La usano mock, seed e carrello:
// una regola sola
export function skuOf(slug: string, size: Size | null, color: Color | null = null): string {
  return [slug, color, size?.toLowerCase()].filter(Boolean).join('-');
}

// Tutte le combinazioni vendibili di un prodotto: colore per colore, taglia per taglia
export function variantsOf(item: MerchItem): { color: Color | null; size: Size | null }[] {
  const colors: (Color | null)[] = item.colors && item.colors.length > 0 ? item.colors : [null];
  const sizes: (Size | null)[] = item.sizes.length > 0 ? item.sizes : [null];
  return colors.flatMap((color) => sizes.map((size) => ({ color, size })));
}
