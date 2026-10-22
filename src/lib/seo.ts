// Dati strutturati per i motori di ricerca (schema.org, JSON-LD), tutti da venue.ts.
// Tipo LocalBusiness generico: schema.org non ha un tipo per i coffeeshop olandesi, e
// CafeOrCoffeeShop vuol dire bar del caffè. Niente email: info@yanks.nl non si usa
// senza il permesso del locale (src/data/legal.ts).
// Orario continuo 08:00-02:45 (chiusura dopo mezzanotte, la forma che Google accetta);
// l'asporto dopo le 02:00 lo spiega la pagina Visit.
import { venue } from '../data/venue';
import { locales } from '../i18n/locales';

// Interruttore dell'indicizzazione (Pietro, 2026-10-22). Spento finché il locale non
// approva il sito: il concept non deve passare per il sito ufficiale su Google.
// Spento: ogni pagina ha "noindex" e robots.txt non indica la sitemap. Il resto (Open
// Graph, JSON-LD, sitemap) è già pronto: per accenderlo basta true
export const INDEXABLE = false;

// Sitemap con le versioni nelle altre lingue (hreflang) di ogni pagina.
// paths: percorsi dopo la lingua, per esempio "" (home) o "menu/"
export function sitemapXml(site: URL, paths: string[]): string {
  const url = (lang: string, path: string) => new URL(`/${lang}/${path}`, site).href;
  const entries = paths.flatMap((path) =>
    locales.map((lang) => {
      const alternates = locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`).join('');
      return `<url><loc>${url(lang, path)}</loc>${alternates}</url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function localBusiness(homeUrl: string, imageUrl: string) {
  const { street, postalCode, city, country } = venue.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: venue.name,
    slogan: venue.tagline,
    url: homeUrl,
    image: imageUrl,
    telephone: venue.phone,
    ...(venue.founded ? { foundingDate: String(venue.founded) } : {}),
    address: { '@type': 'PostalAddress', streetAddress: street, postalCode, addressLocality: city, addressCountry: country },
    geo: { '@type': 'GeoCoordinates', latitude: venue.coords.lat, longitude: venue.coords.lng },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS, opens: venue.hours.open, closes: venue.hours.close }],
    sameAs: [venue.social.instagram, venue.social.facebook],
  };
}
