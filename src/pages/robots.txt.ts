// /robots.txt, generato in build. La scansione resta sempre permessa: con l'indicizzazione
// spenta Google deve poter leggere il "noindex" delle pagine (un Disallow lo
// nasconderebbe). La sitemap si indica solo quando l'indicizzazione è accesa
import type { APIRoute } from 'astro';
import { INDEXABLE } from '../lib/seo';

export const GET = (({ site }) => {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  if (INDEXABLE) lines.push('', `Sitemap: ${new URL('/sitemap.xml', site).href}`);
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}) satisfies APIRoute;
