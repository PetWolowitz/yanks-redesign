// Verifica Turnstile lato server (docs/06): il token del widget vale una volta sola
// e per 5 minuti. Se Cloudflare non risponde si rifiuta: niente ordini senza verifica.
// Documentazione: developers.cloudflare.com/turnstile/get-started/server-side-validation
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(fetcher: typeof fetch, secret: string, token: string, ip: string): Promise<boolean> {
  try {
    const response = await fetcher(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: unknown };
    return result.success === true;
  } catch {
    return false;
  }
}
