// Dati del locale: unica fonte di indirizzo, contatti e orari (docs/03).
// Gli orari sono ore locali di Europe/Amsterdam, nel formato "HH:MM".

export interface Venue {
  name: string;
  tagline: string;
  address: { street: string; postalCode: string; city: string; country: string };
  coords: { lat: number; lng: number };
  phone: string;
  email: string;
  timezone: string;
  hours: {
    open: string;
    // dopo quest'ora solo asporto
    dineInUntil: string;
    close: string;
  };
  // DA VERIFICARE: le fonti dicono "37 anni" o "oltre 30"
  founded: number | null;
  // anno della registrazione societaria, non dell'apertura
  companyFounded: number;
  social: { facebook: string; instagram: string };
}

export const venue: Venue = {
  name: 'Yanks Indian Club',
  tagline: 'Home of the Medicine Man',
  address: { street: 'Dorpsplein 2', postalCode: '2042 JK', city: 'Zandvoort', country: 'NL' },
  coords: { lat: 52.3726, lng: 4.525 },
  phone: '+31235719299',
  email: 'info@yanks.nl',
  timezone: 'Europe/Amsterdam',
  // Tutti i giorni. Verificato di persona, settembre 2026
  hours: {
    open: '08:00',
    dineInUntil: '02:00',
    close: '02:45',
  },
  founded: null,
  companyFounded: 1995,
  social: {
    facebook: 'https://www.facebook.com/yankscoffeeshop',
    instagram: 'https://www.instagram.com/yanksindianclub/',
  },
};
