// Schema e seed applicati a un SQLite in memoria (node:sqlite, dentro Node: D1 è SQLite)
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { merch, skuOf } from '../src/data/merch';
import { INITIAL_STOCK, initialStock, seedSql } from '../src/lib/shop/seed';
import type { MerchItem } from '../src/lib/shop/types';

const schema = readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8');

function freshDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  return db;
}

const count = (db: DatabaseSync, sql: string) => (db.prepare(sql).get() as { n: number }).n;

describe('seed da merch.ts', () => {
  it('crea un prodotto per riga di merch.ts e una variante per taglia', () => {
    const db = freshDb();
    db.exec(seedSql(merch, skuOf));
    const variants = merch.reduce((sum, item) => sum + Math.max(item.sizes.length, 1), 0);
    expect(count(db, 'SELECT COUNT(*) n FROM products WHERE active = 1')).toBe(merch.length);
    expect(count(db, 'SELECT COUNT(*) n FROM variants')).toBe(variants);
  });

  it('i prezzi nel database sono quelli di merch.ts', () => {
    const db = freshDb();
    db.exec(seedSql(merch, skuOf));
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
    db.exec(seedSql(merch, skuOf));
    db.prepare('UPDATE variants SET stock = 3 WHERE sku = ?').run('hoodie-m');

    const changed: MerchItem[] = merch
      .filter((item) => item.slug !== 'beanie')
      .map((item) => (item.slug === 'hoodie' ? { ...item, priceCents: 5000 } : item));
    db.exec(seedSql(changed, skuOf));

    expect((db.prepare('SELECT stock s FROM variants WHERE sku = ?').get('hoodie-m') as { s: number }).s).toBe(3);
    expect((db.prepare('SELECT price_cents p FROM products WHERE slug = ?').get('hoodie') as { p: number }).p).toBe(5000);
    expect((db.prepare('SELECT active a FROM products WHERE slug = ?').get('beanie') as { a: number }).a).toBe(0);
  });

  it('rifiuta valori che non sono slug puliti', () => {
    const bad: MerchItem = { slug: "x'; DROP TABLE products; --", category: 'special', priceCents: 100, sizes: [], limited: null };
    expect(() => seedSql([bad], skuOf)).toThrow();
  });

  it('i CHECK del database rifiutano giacenze negative e quantità fuori misura', () => {
    const db = freshDb();
    db.exec(seedSql(merch, skuOf));
    expect(() => db.prepare('UPDATE variants SET stock = -1 WHERE sku = ?').run('cap')).toThrow();
    db.exec("INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES ('o1', 'a@b.nl', 'nl', 'pending', 3000)");
    expect(() => db.exec('INSERT INTO order_items (order_id, variant_id, quantity, price_cents) VALUES (1, 1, 11, 350)')).toThrow();
    expect(() => db.exec("INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES ('o2', 'a@b.nl', 'xx', 'pending', 3000)")).toThrow();
  });
});
