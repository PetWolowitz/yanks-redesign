// Le pagine della navigazione, in ordine: le usano header e footer.
// Story entra quando la pagina esiste (serve un testo non promozionale, docs/03).
import type { Key } from '../i18n/t';

export const pages: { slug: string; key: Key }[] = [
  { slug: 'menu', key: 'nav.menu' },
  { slug: 'visit', key: 'nav.visit' },
  { slug: 'shop', key: 'nav.shop' },
  { slug: 'know-before', key: 'nav.knowBefore' },
];
