// Seed del database generato da merch.ts, l'unica fonte scritta a mano dei prodotti
// (docs/06). Lo stampa scripts/seed.ts; si applica con wrangler d1 execute.
// Si può rifare quante volte si vuole:
// - prezzi, categorie ed edizioni si aggiornano da merch.ts
// - le giacenze delle varianti già presenti NON si toccano (sono vendite vere)
// - un prodotto tolto da merch.ts resta nel database (ordini vecchi) ma non è più attivo
// - se un prodotto ha i colori, le sue varianti vecchie senza colore restano (ordini
//   vecchi) ma vanno a zero pezzi: un carrello vecchio non può più comprarle
// Gli unici valori nel testo SQL vengono da merch.ts e sono controllati qui sotto.
// skuOf e variantsOf arrivano come argomenti (da merch.ts): così il file si esegue
// anche con Node, che non risolve gli import senza estensione
import type { Color, MerchItem, Size } from './types';

export interface SeedHelpers {
  skuOf: (slug: string, size: Size | null, color?: Color | null) => string;
  variantsOf: (item: MerchItem) => { color: Color | null; size: Size | null }[];
}

// Giacenza iniziale di ogni variante nuova. Le edizioni limitate dividono i pezzi
// tra le varianti (i primi resti alle prime: le taglie più piccole)
export const INITIAL_STOCK = 20;

const SAFE = /^[a-z0-9-]+$/;

function text(value: string): string {
  if (!SAFE.test(value)) throw new Error(`valore non ammesso nel seed: ${value}`);
  return `'${value}'`;
}

function int(value: number): string {
  if (!Number.isInteger(value) || value < 0) throw new Error(`numero non ammesso nel seed: ${value}`);
  return String(value);
}

export function initialStock(item: MerchItem): number[] {
  const count = Math.max(item.sizes.length, 1) * Math.max(item.colors?.length ?? 0, 1);
  if (item.limited === null) return Array.from({ length: count }, () => INITIAL_STOCK);
  const base = Math.floor(item.limited / count);
  return Array.from({ length: count }, (_, i) => base + (i < item.limited! % count ? 1 : 0));
}

export function seedSql(merch: MerchItem[], { skuOf, variantsOf }: SeedHelpers): string {
  const lines = ['-- Generato da scripts/seed.ts a partire da src/data/merch.ts: non modificare a mano'];
  for (const item of merch) {
    const limited = item.limited === null ? 'NULL' : int(item.limited);
    lines.push(
      `INSERT INTO products (slug, category, price_cents, limited, active) VALUES (${text(item.slug)}, ${text(item.category)}, ${int(item.priceCents)}, ${limited}, 1)` +
        ` ON CONFLICT(slug) DO UPDATE SET category = excluded.category, price_cents = excluded.price_cents, limited = excluded.limited, active = 1;`,
    );
    const stock = initialStock(item);
    variantsOf(item).forEach(({ color, size }, i) => {
      if (size !== null && !/^[A-Z0-9]+$/.test(size)) throw new Error(`taglia non ammessa nel seed: ${size}`);
      const sizeSql = size === null ? 'NULL' : `'${size}'`;
      const colorSql = color === null ? 'NULL' : text(color);
      lines.push(
        `INSERT INTO variants (product_id, size, color, sku, stock) VALUES ((SELECT id FROM products WHERE slug = ${text(item.slug)}), ${sizeSql}, ${colorSql}, ${text(skuOf(item.slug, size, color))}, ${int(stock[i]!)})` +
          ` ON CONFLICT(sku) DO NOTHING;`,
      );
    });
    if (item.colors && item.colors.length > 0) {
      lines.push(`UPDATE variants SET stock = 0 WHERE color IS NULL AND product_id = (SELECT id FROM products WHERE slug = ${text(item.slug)});`);
    }
  }
  const slugs = merch.map((item) => text(item.slug)).join(', ');
  lines.push(`UPDATE products SET active = 0 WHERE slug NOT IN (${slugs});`);
  return lines.join('\n') + '\n';
}
