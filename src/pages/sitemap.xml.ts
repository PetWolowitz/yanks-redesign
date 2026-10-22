// /sitemap.xml, generata in build: le pagine pubbliche in ogni lingua, schede prodotto
// comprese (lib/seo.ts). Fuori carrello, checkout, pagina ordine e styleguide: non
// servono nei risultati di ricerca
import type { APIRoute } from 'astro';
import { merch } from '../data/merch';
import { pages } from '../data/pages';
import { sitemapXml } from '../lib/seo';

export const GET = (({ site }) => {
  const paths = ['', ...pages.map(({ slug }) => `${slug}/`), 'legal/', ...merch.map(({ slug }) => `shop/${slug}/`)];
  return new Response(sitemapXml(site!, paths), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}) satisfies APIRoute;
