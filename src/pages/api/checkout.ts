// POST /api/checkout (docs/06). La logica è in lib/shop/handlers.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleCheckout } from '../../lib/shop/handlers';

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleCheckout(request, env);
