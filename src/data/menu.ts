// Menu food & drink (docs/03). Solo cibo e bevande: niente cannabis, né nomi né prezzi.
// Nomi da tradurre nei file di lingua: menu.group.<id> e menu.item.<id>.
// I marchi delle bibite sono nomi propri e restano qui, uguali in ogni lingua.
// Prezzi in centesimi; null = DA VERIFICARE, non si mostra.

export interface MenuItem {
  id: string;
  priceCents: number | null;
}

// Un marchio con il numero di gusti, oppure un prodotto senza marchio da tradurre
export type DrinkEntry = { brand: string; variants?: number } | { id: string };

export type MenuGroup =
  | { id: 'tosti' | 'pizza' | 'coffee'; kind: 'items'; items: MenuItem[] }
  // Prezzo unico, scritto una volta in testa al gruppo
  | { id: 'softDrinks' | 'functional'; kind: 'drinks'; priceCents: number | null; drinks: DrinkEntry[] };

export const menu: MenuGroup[] = [
  {
    id: 'tosti',
    kind: 'items',
    // DA VERIFICARE: il sito originale non riporta i prezzi
    items: [
      { id: 'tosti-cheese', priceCents: null },
      { id: 'tosti-ham-cheese', priceCents: null },
      { id: 'tosti-vlam', priceCents: null },
    ],
  },
  {
    id: 'pizza',
    kind: 'items',
    // DA VERIFICARE: il sito originale non riporta i prezzi
    items: [
      { id: 'pizza-salami', priceCents: null },
      { id: 'pizza-chorizo', priceCents: null },
      { id: 'pizza-margherita', priceCents: null },
      { id: 'pizza-hawaii', priceCents: null },
      { id: 'pizza-prosciutto', priceCents: null },
    ],
  },
  {
    id: 'coffee',
    kind: 'items',
    items: [
      { id: 'coffee', priceCents: 275 },
      { id: 'espresso', priceCents: 275 },
      { id: 'cappuccino', priceCents: 325 },
      { id: 'latte-macchiato', priceCents: 325 },
      { id: 'caffe-latte', priceCents: 325 },
      { id: 'hot-chocolate', priceCents: 325 },
      { id: 'hot-chocolate-cream', priceCents: 375 },
      { id: 'tea', priceCents: 275 },
      { id: 'fresh-mint-tea', priceCents: 325 },
    ],
  },
  {
    id: 'softDrinks',
    kind: 'drinks',
    priceCents: 325,
    drinks: [
      { brand: 'Coca-Cola', variants: 5 },
      { brand: 'Fanta', variants: 4 },
      { brand: 'Capri-Sun', variants: 3 },
      { brand: 'Fernandes', variants: 4 },
      { brand: 'Lipton', variants: 3 },
      { brand: 'Oasis', variants: 2 },
      { brand: 'Orangina', variants: 2 },
      { brand: 'Schweppes', variants: 2 },
      { brand: 'Dr Pepper' },
      { brand: 'AA Energy' },
      { id: 'apple-juice' },
      { brand: 'Chocomel' },
      { brand: 'Fristi' },
      { brand: 'Hawai' },
      { brand: 'Poms' },
      { brand: 'Taksi' },
      // naturale e frizzante
      { brand: 'Spa', variants: 2 },
    ],
  },
  {
    id: 'functional',
    kind: 'drinks',
    // DA VERIFICARE: docs/03 dà il prezzo unico solo per le bibite
    priceCents: null,
    drinks: [
      { brand: 'Aloe Vera', variants: 4 },
      { brand: 'Aquarius', variants: 6 },
      { brand: 'Fuze Tea', variants: 4 },
      { brand: 'Maaza', variants: 3 },
      { brand: 'Red Bull', variants: 4 },
      { brand: 'Sourcy', variants: 4 },
      { brand: 'Spa Vitamin Water', variants: 2 },
    ],
  },
];
