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
  action?: unknown;
  'error-codes'?: unknown;
  metadata?: { result_with_testing_key?: unknown };
}

// Ogni rifiuto lascia nei log il motivo, così si capisce subito se è un robot, una
// secret sbagliata o un hostname diverso. Mai token né secret: solo i codici di
// Cloudflare (filtrati: solo lettere minuscole, cifre e trattini) e dei sì/no
function reject(reason: Record<string, unknown>): false {
  console.warn('api/checkout: Turnstile rifiutato', JSON.stringify(reason));
  return false;
}

function errorCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((code): code is string => typeof code === 'string' && /^[a-z0-9-]{1,40}$/.test(code)).slice(0, 5);
}

// Valori arrivati da Cloudflare: nei log solo se hanno la forma attesa
function safe(value: unknown, pattern: RegExp): string | null {
  return typeof value === 'string' && pattern.test(value) ? value : null;
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
    if (!response.ok) return reject({ status: response.status });
    const result = (await response.json()) as SiteverifyResult;
    if (result.success !== true) return reject({ errorCodes: errorCodes(result['error-codes']) });
    if (result.metadata?.result_with_testing_key === true) {
      return LOCAL_HOSTS.has(expectedHostname) || reject({ testingKey: true, local: false });
    }
    // Il widget del checkout dichiara l'azione "checkout" (checkout.astro)
    const hostnameOk = result.hostname === expectedHostname;
    const actionOk = result.action === 'checkout';
    return (
      (hostnameOk && actionOk) ||
      reject({
        hostname: { received: safe(result.hostname, /^[a-z0-9.-]{1,253}$/), expected: expectedHostname },
        action: { received: safe(result.action, /^[a-z0-9_-]{1,32}$/), expected: 'checkout' },
      })
    );
  } catch {
    return reject({ unreachable: true });
  }
}
