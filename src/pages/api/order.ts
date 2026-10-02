// POST /api/order con { id, token } nel body (docs/06). La logica è in lib/shop/handlers.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleOrder } from '../../lib/shop/handlers';

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleOrder(request, env);
