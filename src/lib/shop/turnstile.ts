// Verifica Turnstile lato server (docs/06): il token del widget vale una volta sola
// e per 5 minuti. Se Cloudflare non risponde si rifiuta: niente ordini senza verifica.
// Documentazione: developers.cloudflare.com/turnstile/get-started/server-side-validation
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// In locale si usano le chiavi di prova di Cloudflare, che rispondono sempre con
// hostname "example.com" e metadata.result_with_testing_key: true. Si accettano
// solo qui: online il risultato di una chiave di prova viene rifiutato
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

interface SiteverifyResult {
  success?: unknown;
  hostname?: unknown;
  metadata?: { result_with_testing_key?: unknown };
}

// expectedHostname: quello della richiesta al checkout. Il token deve venire da un
// widget mostrato sul nostro sito, non da un altro sito con la stessa chiave
export async function verifyTurnstile(fetcher: typeof fetch, secret: string, token: string, ip: string, expectedHostname: string): Promise<boolean> {
  try {
    const response = await fetcher(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as SiteverifyResult;
    if (result.success !== true) return false;
    if (result.metadata?.result_with_testing_key === true) return LOCAL_HOSTS.has(expectedHostname);
    return result.hostname === expectedHostname;
  } catch {
    return false;
  }
}
