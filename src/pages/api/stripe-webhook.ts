// POST /api/stripe-webhook, chiamato solo da Stripe (docs/06). Logica in lib/shop/handlers.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleStripeWebhook } from '../../lib/shop/handlers';

export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleStripeWebhook(request, env);
