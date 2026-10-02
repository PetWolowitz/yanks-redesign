// Regole comuni delle risposte degli endpoint /api/* (docs/06, Sicurezza).
// public/_headers vale solo per i file statici: qui le intestazioni si mettono a mano.
import type { ApiErrorBody, ShopErrorCode } from './types';

// Nessuna pagina: niente script, niente frame, niente cache condivise
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...SECURITY_HEADERS, 'Cache-Control': 'no-store', ...headers },
  });
}

const STATUS: Record<ShopErrorCode, number> = {
  invalid: 400,
  not_found: 404,
  out_of_stock: 409,
  unavailable: 503,
};

// Risposte d'errore sempre generiche: niente dettagli interni, niente stack
export function apiError(code: ShopErrorCode, status = STATUS[code], headers: Record<string, string> = {}): Response {
  const body: ApiErrorBody = { error: code };
  return json(body, status, headers);
}

export function methodNotAllowed(allow: string): Response {
  return json({ error: 'invalid' } satisfies ApiErrorBody, 405, { Allow: allow });
}

// Le POST arrivano solo dalle nostre pagine. I browser mandano sempre Origin con
// una POST fetch; Sec-Fetch-Site c'è nei browser moderni. Chi non li manda (curl,
// script) resta comunque fermo davanti al token
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (origin !== null && origin !== new URL(request.url).origin) return false;
  const site = request.headers.get('Sec-Fetch-Site');
  return site === null || site === 'same-origin';
}

// Legge un corpo JSON piccolo. null se il tipo non è JSON, se è troppo grande o
// se non si legge: la validazione dei campi viene dopo
export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) return null;
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > maxBytes) return null;
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

// IP del visitatore come lo vede Cloudflare (non falsificabile attraverso Cloudflare)
export function clientKey(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}
