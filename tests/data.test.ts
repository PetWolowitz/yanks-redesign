// I dati scritti a mano sono coerenti con i file di lingua e tra loro.
// Basta controllare en.json: i18n.test.ts garantisce che nl e de abbiano le stesse chiavi.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { menu } from '../src/data/menu';
import { merch, skuOf, skusOf, variantsOf } from '../src/data/merch';
import { latestReviews, longestFirst, reviews, type Review } from '../src/data/reviews';
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
    const skus = merch.flatMap(skusOf);
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

  // Il catalogo somma le giacenze di questi SKU: senza i colori segnava "esaurito"
  // felpa, Ton sur Ton e Clipper anche quando c'erano (errore trovato il 2026-11-02)
  it('skusOf: tutti gli SKU di un prodotto, colori compresi', () => {
    const find = (slug: string) => merch.find((item) => item.slug === slug)!;
    const hoodie = skusOf(find('hoodie'));
    expect(hoodie).toContain('hoodie-black-m');
    expect(hoodie).not.toContain('hoodie-m');
    expect(hoodie).toHaveLength(variantsOf(find('hoodie')).length);
    expect(skusOf(find('clipper-lighter'))).toContain('clipper-lighter-red');
    expect(skusOf(find('skull-t-shirt'))).toContain('skull-t-shirt-xl');
    expect(skusOf(find('cap'))).toEqual(['cap']);
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

  it('ogni colore di merch.ts ha il suo quadratino in tokens.css, in esadecimale', () => {
    const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
    for (const item of merch) {
      for (const color of item.colors ?? []) {
        expect(tokens, `${item.slug} ${color}`).toMatch(new RegExp(`--swatch-${item.slug}-${color}: #[0-9A-F]{6};`));
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

describe('reviews.ts', () => {
  it('date vere in formato AAAA-MM-GG, lingue del sito', () => {
    for (const review of reviews) {
      expect(review.date, review.text).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(review.date)), review.date).toBe(false);
      expect(['nl', 'en', 'de']).toContain(review.lang);
    }
  });

  it('latestReviews: le più recenti per prime, tre di serie', () => {
    const at = (date: string): Review => ({ source: 'google', lang: 'nl', text: date, date, url: '' });
    const list = [at('2026-08-01'), at('2026-10-20'), at('2026-09-15'), at('2026-10-02')];
    expect(latestReviews(list).map((review) => review.date)).toEqual(['2026-10-20', '2026-10-02', '2026-09-15']);
    expect(list[0]!.date).toBe('2026-08-01');
    expect(latestReviews(reviews)).toHaveLength(Math.min(3, reviews.length));
  });

  it("longestFirst: la più lunga in testa, le altre nell'ordine dato", () => {
    const of = (text: string): Review => ({ source: "google", lang: "nl", text, date: "2026-10-01", url: "" });
    expect(longestFirst([of("aa"), of("aaaa"), of("a")]).map((review) => review.text)).toEqual(["aaaa", "aa", "a"]);
    expect(longestFirst([])).toEqual([]);
  });

  // Vincoli legali (docs/03): niente prodotti di cannabis né fumo nelle recensioni pubblicate
  it('nessuna recensione nomina prodotti di cannabis o il fumare', () => {
    const banned = /wiet|weed|hasj|hash|cannabis|edible|joint|spliff|\bbud\b|thc|kush|haze|blow|gras\b|rook|smok|rauch|kiffen|qualit|kwaliteit/i;
    expect(reviews.filter((review) => banned.test(review.text)).map((review) => review.text)).toEqual([]);
  });
});
