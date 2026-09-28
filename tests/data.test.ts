// I dati scritti a mano sono coerenti con i file di lingua e tra loro.
// Basta controllare en.json: i18n.test.ts garantisce che nl e de abbiano le stesse chiavi.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { menu } from '../src/data/menu';
import { merch, skuOf } from '../src/data/merch';
import en from '../src/i18n/en.json';

const keys = new Set(Object.keys(en));

describe('menu.ts', () => {
  it('ogni gruppo e ogni voce da tradurre ha il suo testo', () => {
    const needed = menu.flatMap((group) => [
      `menu.group.${group.id}`,
      ...(group.kind === 'items' ? group.items : group.drinks).flatMap((entry) => ('id' in entry ? [`menu.item.${entry.id}`] : [])),
    ]);
    expect(needed.filter((key) => !keys.has(key))).toEqual([]);
  });

  it('i prezzi sono centesimi interi positivi, o null se da verificare', () => {
    const prices = menu.flatMap((group) => (group.kind === 'items' ? group.items.map((item) => item.priceCents) : [group.priceCents]));
    expect(prices.every((price) => price === null || (Number.isInteger(price) && price > 0))).toBe(true);
  });
});

describe('merch.ts', () => {
  it('ogni prodotto ha nome e descrizione nei file di lingua', () => {
    const needed = merch.flatMap(({ slug }) => [`shop.products.${slug}.name`, `shop.products.${slug}.description`]);
    expect(needed.filter((key) => !keys.has(key))).toEqual([]);
  });

  it('slug e SKU sono unici', () => {
    const slugs = merch.map((item) => item.slug);
    const skus = merch.flatMap(({ slug, sizes }) => (sizes.length > 0 ? sizes : [null]).map((size) => skuOf(slug, size)));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it('i prezzi sono centesimi interi positivi', () => {
    expect(merch.filter((item) => !Number.isInteger(item.priceCents) || item.priceCents <= 0)).toEqual([]);
  });

  it('SKU: slug più taglia in minuscolo, solo slug per la taglia unica', () => {
    expect(skuOf('hoodie', 'XL')).toBe('hoodie-xl');
    expect(skuOf('mystery-box', null)).toBe('mystery-box');
  });
});

describe('foto dei prodotti', () => {
  it('ogni prodotto di merch.ts ha la sua foto in src/assets/shop', () => {
    expect(merch.map((item) => item.slug).filter((slug) => !existsSync(`src/assets/shop/${slug}.jpg`))).toEqual([]);
  });
});

describe('rotte dello shop', () => {
  it('nessuno slug di merch.ts coincide con una pagina fissa dello shop', () => {
    const reserved = ['cart', 'checkout', 'order'];
    expect(merch.filter((item) => reserved.includes(item.slug))).toEqual([]);
  });
});
