// Dati dell'azienda per la pagina legale (/[lang]/legal/). null = dato non trovato o
// non autorizzato dal locale: la pagina mostra un segnaposto, mai un dato inventato.
// Le pagine legali di shop.yanks.nl (ottobre 2026) sono il modello Shopify non
// compilato: niente ragione sociale, KvK né BTW (docs/03)
export const legal: Record<'legalName' | 'kvk' | 'vat' | 'email' | 'returnAddress', string | null> = {
  legalName: null,
  kvk: null,
  vat: null,
  // info@yanks.nl esiste, ma senza il permesso del locale non ci mandiamo i clienti del concept
  email: null,
  returnAddress: null,
};
