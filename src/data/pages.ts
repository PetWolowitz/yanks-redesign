// Le pagine della navigazione, in ordine: le usano header e footer.
import type { Key } from '../i18n/t';

export const pages: { slug: string; key: Key }[] = [
  { slug: 'menu', key: 'nav.menu' },
  { slug: 'visit', key: 'nav.visit' },
  { slug: 'shop', key: 'nav.shop' },
  { slug: 'story', key: 'nav.story' },
  { slug: 'know-before', key: 'nav.knowBefore' },
];
