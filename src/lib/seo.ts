// Dati strutturati per i motori di ricerca (schema.org, JSON-LD), tutti da venue.ts.
// Tipo LocalBusiness generico: schema.org non ha un tipo per i coffeeshop olandesi, e
// CafeOrCoffeeShop vuol dire bar del caffè. Niente email: info@yanks.nl non si usa
// senza il permesso del locale (src/data/legal.ts).
// Orario continuo 08:00-02:45 (chiusura dopo mezzanotte, la forma che Google accetta);
// l'asporto dopo le 02:00 lo spiega la pagina Visit.
import { venue } from '../data/venue';

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
