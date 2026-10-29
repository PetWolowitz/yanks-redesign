// I dati scritti a mano sono coerenti con i file di lingua e tra loro.
// Basta controllare en.json: i18n.test.ts garantisce che nl e de abbiano le stesse chiavi.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { menu } from '../src/data/menu';
import { merch, skuOf, variantsOf } from '../src/data/merch';
import { colorPhotoIndex, hasColorPhoto, photoColors, productImages } from '../src/lib/shop/images';
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

  it('SKU: slug, poi colore e taglia in minuscolo se ci sono', () => {
    expect(skuOf('skull-t-shirt', 'XL')).toBe('skull-t-shirt-xl');
    expect(skuOf('hoodie', 'XL', 'army-green')).toBe('hoodie-army-green-xl');
    expect(skuOf('clipper-lighter', null, 'red')).toBe('clipper-lighter-red');
    expect(skuOf('mystery-box', null)).toBe('mystery-box');
  });

  it('variantsOf: ogni colore con ogni taglia, oppure una variante sola', () => {
    const hoodie = merch.find((item) => item.slug === 'hoodie')!;
    expect(variantsOf(hoodie)).toHaveLength(hoodie.colors!.length * hoodie.sizes.length);
    expect(variantsOf(merch.find((item) => item.slug === 'cap')!)).toEqual([{ color: null, size: null }]);
  });

  it('ogni colore di merch.ts ha la sua foto e il suo nome in ogni lingua', () => {
    for (const item of merch) {
      for (const color of item.colors ?? []) {
        expect(hasColorPhoto(item.slug, color), `${item.slug} ${color}`).toBe(true);
        expect(productImages(item.slug).length).toBeGreaterThan(colorPhotoIndex(item.slug, color));
        expect(photoColors(item.slug)[colorPhotoIndex(item.slug, color)], `${item.slug} ${color}`).toBe(color);
        expect(en[`shop.color.${color}` as keyof typeof en], color).toBeTruthy();
      }
    }
  });

  it('nei prodotti con i colori ogni foto è di un colore (se no, scelto un colore, sparirebbe)', () => {
    for (const item of merch.filter((item) => item.colors?.length)) {
      expect(photoColors(item.slug), item.slug).not.toContain(null);
    }
  });
});

describe('foto dei prodotti', () => {
  it('ogni prodotto di merch.ts ha almeno la foto 1 in src/assets/shop/<slug>/', () => {
    expect(merch.map((item) => item.slug).filter((slug) => !existsSync(`src/assets/shop/${slug}/1.jpg`))).toEqual([]);
  });
});

describe('rotte dello shop', () => {
  it('nessuno slug di merch.ts coincide con una pagina fissa dello shop', () => {
    const reserved = ['cart', 'checkout', 'order'];
    expect(merch.filter((item) => reserved.includes(item.slug))).toEqual([]);
  });
});
