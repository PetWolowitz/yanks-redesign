// Foto dei prodotti: src/assets/shop/<slug>/<n>.jpg, da shop.yanks.nl, ridotte a
// 1000 px (scelte ed esclusioni in docs/03). La 1 è la foto principale.
// Fuori da merch.ts, che tiene solo slug, categoria, prezzo, taglie e limited.
// astro:assets le converte in WebP in build.
import type { ImageMetadata } from 'astro';
import type { Color } from './types';

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

// La foto principale di ogni colore, col numero del file (<n>.jpg), viste una per
// una il 2026-10-27. Scegliendo il colore nella scheda prodotto la foto grande
// diventa questa. Un colore in merch.ts senza foto qui non passa i test
const colorPhotos: Record<string, Partial<Record<Color, number>>> = {
  hoodie: { blue: 1, 'army-green': 3, grey: 5, black: 7 },
  'ton-sur-ton-t-shirt': { brown: 1, 'army-green': 2 },
  'clipper-lighter': { black: 1, white: 2, pink: 3, red: 4, blue: 5, green: 6, burgundy: 7, yellow: 8 },
};

// Posizione (da 0) della foto di quel colore in productImages(slug); 0 se non c'è
export function colorPhotoIndex(slug: string, color: Color): number {
  const n = colorPhotos[slug]?.[color];
  return n === undefined ? 0 : n - 1;
}

export function hasColorPhoto(slug: string, color: Color): boolean {
  return colorPhotos[slug]?.[color] !== undefined;
}
