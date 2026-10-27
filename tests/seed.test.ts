// Schema e seed applicati a un SQLite in memoria (node:sqlite, dentro Node: D1 è SQLite)
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { merch, skuOf, variantsOf } from '../src/data/merch';
import { INITIAL_STOCK, initialStock, seedSql } from '../src/lib/shop/seed';
import type { MerchItem } from '../src/lib/shop/types';

// Tutte le migrazioni, in ordine: lo schema è quello del database vero
const migrations = new URL('../migrations/', import.meta.url);
const schema = readdirSync(migrations)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => readFileSync(new URL(file, migrations), 'utf8'))
  .join('\n');

function freshDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  return db;
}

const helpers = { skuOf, variantsOf };

const count = (db: DatabaseSync, sql: string) => (db.prepare(sql).get() as { n: number }).n;

describe('seed da merch.ts', () => {
  it('crea un prodotto per riga di merch.ts e una variante per colore e taglia', () => {
    const db = freshDb();
    db.exec(seedSql(merch, helpers));
    const variants = merch.reduce((sum, item) => sum + variantsOf(item).length, 0);
    expect(count(db, 'SELECT COUNT(*) n FROM products WHERE active = 1')).toBe(merch.length);
    expect(count(db, 'SELECT COUNT(*) n FROM variants')).toBe(variants);
  });

  it('i prezzi nel database sono quelli di merch.ts', () => {
    const db = freshDb();
    db.exec(seedSql(merch, helpers));
    for (const item of merch) {
      const row = db.prepare('SELECT price_cents p FROM products WHERE slug = ?').get(item.slug) as { p: number };
      expect(row.p).toBe(item.priceCents);
    }
  });

  it('le edizioni limitate dividono i pezzi tra le taglie, senza perderne', () => {
    for (const item of merch.filter((i) => i.limited !== null)) {
      expect(initialStock(item).reduce((a, b) => a + b, 0)).toBe(item.limited);
    }
    expect(initialStock({ slug: 'x', category: 'clothing', priceCents: 1, sizes: [], limited: null })).toEqual([INITIAL_STOCK]);
  });

  it('rifatto non tocca le giacenze, aggiorna i prezzi e spegne i prodotti tolti', () => {
    const db = freshDb();
    db.exec(seedSql(merch, helpers));
    db.prepare('UPDATE variants SET stock = 3 WHERE sku = ?').run('hoodie-black-m');

    const changed: MerchItem[] = merch
      .filter((item) => item.slug !== 'beanie')
      .map((item) => (item.slug === 'hoodie' ? { ...item, priceCents: 5000 } : item));
    db.exec(seedSql(changed, helpers));

    expect((db.prepare('SELECT stock s FROM variants WHERE sku = ?').get('hoodie-black-m') as { s: number }).s).toBe(3);
    expect((db.prepare('SELECT price_cents p FROM products WHERE slug = ?').get('hoodie') as { p: number }).p).toBe(5000);
    expect((db.prepare('SELECT active a FROM products WHERE slug = ?').get('beanie') as { a: number }).a).toBe(0);
  });

  it('un prodotto che prende i colori: le varianti vecchie senza colore restano ma a zero pezzi', () => {
    const db = freshDb();
    const old = merch.map((item) => (item.slug === 'hoodie' ? { ...item, colors: undefined } : item));
    db.exec(seedSql(old, helpers));
    expect((db.prepare('SELECT stock s FROM variants WHERE sku = ?').get('hoodie-m') as { s: number }).s).toBe(INITIAL_STOCK);
    db.exec(seedSql(merch, helpers));
    expect((db.prepare('SELECT stock s FROM variants WHERE sku = ?').get('hoodie-m') as { s: number }).s).toBe(0);
    expect((db.prepare('SELECT stock s, color c FROM variants WHERE sku = ?').get('hoodie-black-m') as { s: number; c: string })).toEqual({ s: INITIAL_STOCK, c: 'black' });
  });

  it('rifiuta valori che non sono slug puliti', () => {
    const bad: MerchItem = { slug: "x'; DROP TABLE products; --", category: 'special', priceCents: 100, sizes: [], limited: null };
    expect(() => seedSql([bad], helpers)).toThrow();
  });

  it('i CHECK del database rifiutano giacenze negative e quantità fuori misura', () => {
    const db = freshDb();
    db.exec(seedSql(merch, helpers));
    expect(() => db.prepare('UPDATE variants SET stock = -1 WHERE sku = ?').run('cap')).toThrow();
    db.exec("INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES ('o1', 'a@b.nl', 'nl', 'pending', 3000)");
    expect(() => db.exec('INSERT INTO order_items (order_id, variant_id, quantity, price_cents) VALUES (1, 1, 11, 350)')).toThrow();
    expect(() => db.exec("INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES ('o2', 'a@b.nl', 'xx', 'pending', 3000)")).toThrow();
  });
});
