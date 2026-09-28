// Catalogo per il browser, preparato in build: per ogni SKU nome tradotto, taglia,
// prezzo mostrato, miniatura e link. Le pagine di carrello, checkout e ordine lo
// passano in un attributo data- (non uno script inline: CSP).
// I prezzi servono solo a mostrare: l'addebito lo calcola il server (docs/06).
import { getImage } from 'astro:assets';
import { merch, skuOf } from '../../data/merch';
import type { Lang } from '../../i18n/locales';
import { t, type Key } from '../../i18n/t';
import { productImage } from './images';

export interface CatalogEntry {
  name: string;
  size: string | null;
  priceCents: number;
  image: string;
  href: string;
}

export async function buildCatalog(lang: Lang): Promise<Record<string, CatalogEntry>> {
  const catalog: Record<string, CatalogEntry> = {};
  for (const item of merch) {
    const image = await getImage({ src: productImage(item.slug), width: 160, format: 'webp' });
    for (const size of item.sizes.length > 0 ? item.sizes : [null]) {
      catalog[skuOf(item.slug, size)] = {
        name: t(lang, `shop.products.${item.slug}.name` as Key),
        size,
        priceCents: item.priceCents,
        image: image.src,
        href: `/${lang}/shop/${item.slug}/`,
      };
    }
  }
  return catalog;
}
