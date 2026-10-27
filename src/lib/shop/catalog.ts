// Catalogo per il browser, preparato in build: per ogni SKU nome tradotto, colore e
// taglia, prezzo mostrato, miniatura e link. Le pagine di carrello, checkout e ordine
// lo passano in un attributo data- (non uno script inline: CSP).
// I prezzi servono solo a mostrare: l'addebito lo calcola il server (docs/06).
import { getImage } from 'astro:assets';
import { merch, skuOf, variantsOf } from '../../data/merch';
import type { Lang } from '../../i18n/locales';
import { t, type Key } from '../../i18n/t';
import { colorPhotoIndex, productImages } from './images';
import { variantText } from './labels';

export interface CatalogEntry {
  name: string;
  // "Zwart, L" per le righe di checkout e ordine; "" se non c'è niente da scegliere
  variant: string;
  // "Kleur: Zwart · Maat: L" per il carrello
  details: string;
  priceCents: number;
  image: string;
  href: string;
}

export async function buildCatalog(lang: Lang): Promise<Record<string, CatalogEntry>> {
  const catalog: Record<string, CatalogEntry> = {};
  const text = (key: Key) => t(lang, key);
  for (const item of merch) {
    const images = productImages(item.slug);
    const variants = variantsOf(item);
    // I prodotti con i colori hanno anche le varianti vecchie senza colore (seed.ts):
    // servono per mostrare gli ordini fatti prima
    if (item.colors?.length) variants.push(...variantsOf({ ...item, colors: undefined }));
    for (const { color, size } of variants) {
      const photo = color ? images[colorPhotoIndex(item.slug, color)]! : images[0]!;
      const image = await getImage({ src: photo, width: 160, format: 'webp' });
      const details = [color && `${t(lang, 'shop.colorLabel')}: ${t(lang, `shop.color.${color}` as Key)}`, size && `${t(lang, 'shop.size')}: ${size}`];
      catalog[skuOf(item.slug, size, color)] = {
        name: t(lang, `shop.products.${item.slug}.name` as Key),
        variant: variantText(text, color, size),
        details: details.filter(Boolean).join(' · '),
        priceCents: item.priceCents,
        image: image.src,
        href: `/${lang}/shop/${item.slug}/`,
      };
    }
  }
  return catalog;
}
