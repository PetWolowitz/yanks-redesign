// GET /api/products (docs/06). Gira sul server: la logica è in lib/shop/handlers.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleProducts } from '../../lib/shop/handlers';

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleProducts(request, env);
