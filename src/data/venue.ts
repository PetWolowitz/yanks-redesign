// Dati del locale: unica fonte di indirizzo, contatti e orari (docs/03).
// Gli orari sono ore locali di Europe/Amsterdam, nel formato "HH:MM".

export interface Venue {
  name: string;
  tagline: string;
  address: { street: string; postalCode: string; city: string; country: string };
  coords: { lat: number; lng: number };
  phone: string;
  // lo stesso numero, scritto per essere letto
  phoneDisplay: string;
  email: string;
  timezone: string;
  hours: {
    open: string;
    // dopo quest'ora solo asporto
    dineInUntil: string;
    close: string;
  };
  // anno di apertura: 1984, dal ricamo sul cappellino dello shop ufficiale
  // (src/assets/shop/cap/2.jpg). Scelto da Pietro il 2026-10-01 ("usa le fonti
  // del merch"); prima era 1989
  founded: number | null;
  // anno della registrazione societaria, non dell'apertura
  companyFounded: number;
  social: { facebook: string; instagram: string };
  // Scheda Google del locale e mappa da incorporare (caricata solo al clic)
  maps: { url: string; embedUrl: string };
}

export const venue: Venue = {
  name: 'Yanks Indian Club',
  tagline: 'Home of the Medicine Man',
  address: { street: 'Dorpsplein 2', postalCode: '2042 JK', city: 'Zandvoort', country: 'NL' },
  coords: { lat: 52.3726, lng: 4.525 },
  phone: '+31235719299',
  phoneDisplay: '+31 23 571 92 99',
  email: 'info@yanks.nl',
  timezone: 'Europe/Amsterdam',
  // Tutti i giorni. Verificato di persona, settembre 2026
  hours: {
    open: '08:00',
    dineInUntil: '02:00',
    close: '02:45',
  },
  founded: 1984,
  companyFounded: 1995,
  social: {
    facebook: 'https://www.facebook.com/yankscoffeeshop',
    instagram: 'https://www.instagram.com/yanksindianclub/',
  },
  // Dal sito attuale (yanks.nl): la stessa scheda "Yanks Coffee Shop"
  maps: {
    url: 'https://maps.google.com/?cid=508006116904350505',
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.879317711208!2d4.524996176940651!3d52.372608247131225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5ec12f0ff8e57%3A0x70cccdf2dcf3329!2sYanks%20Coffee%20Shop!5e0!3m2!1snl!2snl!4v1708428098845!5m2!1snl!2snl',
  },
};
