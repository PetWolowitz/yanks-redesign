// Foto dei prodotti: src/assets/shop/<slug>.jpg (da shop.yanks.nl, ridotte a 1000 px).
// Fuori da merch.ts, che tiene solo slug, categoria, prezzo, taglie e limited.
// astro:assets le converte in WebP in build.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../../assets/shop/*.jpg', { eager: true });

export function productImage(slug: string): ImageMetadata {
  const file = files[`../../assets/shop/${slug}.jpg`];
  if (!file) throw new Error(`Manca la foto src/assets/shop/${slug}.jpg`);
  return file.default;
}
