// Foto dei prodotti: src/assets/shop/<slug>/<n>.jpg, da shop.yanks.nl, ridotte a
// 1000 px (scelte ed esclusioni in docs/03). La 1 è la foto principale.
// Fuori da merch.ts, che tiene solo slug, categoria, prezzo, taglie e limited.
// astro:assets le converte in WebP in build.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../../assets/shop/*/*.jpg', { eager: true });

export function productImages(slug: string): ImageMetadata[] {
  const images = Object.entries(files)
    .filter(([path]) => path.startsWith(`../../assets/shop/${slug}/`))
    .sort(([a], [b]) => Number(a.match(/(\d+)\.jpg$/)?.[1]) - Number(b.match(/(\d+)\.jpg$/)?.[1]))
    .map(([, file]) => file.default);
  if (images.length === 0) throw new Error(`Mancano le foto in src/assets/shop/${slug}/`);
  return images;
}

export function productImage(slug: string): ImageMetadata {
  return productImages(slug)[0]!;
}
