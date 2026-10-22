// JSON-LD LocalBusiness (lib/seo.ts): tutto da venue.ts, niente email
import { describe, expect, it } from 'vitest';
import { venue } from '../src/data/venue';
import { localBusiness, sitemapXml } from '../src/lib/seo';

describe('sitemapXml', () => {
  const xml = sitemapXml(new URL('https://example.com'), ['', 'menu/']);

  it('una voce per pagina e per lingua, con le versioni nelle altre lingue', () => {
    expect(xml.match(/<url>/g)).toHaveLength(2 * 3);
    expect(xml).toContain('<loc>https://example.com/nl/menu/</loc>');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="de" href="https://example.com/de/"/>');
  });
});

describe('localBusiness', () => {
  const data = localBusiness('https://example.com/nl/', 'https://example.com/og.jpg');

  it('prende indirizzo, coordinate, telefono e social da venue.ts', () => {
    expect(data).toMatchObject({
      '@type': 'LocalBusiness',
      name: venue.name,
      url: 'https://example.com/nl/',
      telephone: venue.phone,
      address: { streetAddress: venue.address.street, postalCode: venue.address.postalCode, addressLocality: venue.address.city },
      geo: { latitude: venue.coords.lat, longitude: venue.coords.lng },
      sameAs: [venue.social.instagram, venue.social.facebook],
    });
  });

  it('orario continuo tutti i giorni, dall\'apertura alla chiusura dopo mezzanotte', () => {
    expect(data.openingHoursSpecification).toEqual([
      expect.objectContaining({ dayOfWeek: expect.arrayContaining(['Monday', 'Sunday']), opens: venue.hours.open, closes: venue.hours.close }),
    ]);
    expect(data.openingHoursSpecification[0]!.dayOfWeek).toHaveLength(7);
  });

  it('non pubblica l\'email del locale', () => {
    expect(JSON.stringify(data)).not.toContain(venue.email);
  });
});
