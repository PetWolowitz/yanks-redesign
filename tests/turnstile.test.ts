// verifyTurnstile: hostname e azione della risposta devono essere i nostri; le chiavi di
// prova di Cloudflare (hostname "example.com") valgono solo in locale
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from '../src/lib/shop/turnstile';

const answer = (body: unknown, status = 200) => (async () => Response.json(body, { status })) as unknown as typeof fetch;
const testingKey = { success: true, hostname: 'example.com', metadata: { result_with_testing_key: true } };

describe('verifyTurnstile', () => {
  it('accetta solo il nostro hostname', async () => {
    expect(await verifyTurnstile(answer({ success: true, hostname: 'yanks.test', action: 'checkout' }), 's', 't', 'ip', 'yanks.test')).toBe(true);
    expect(await verifyTurnstile(answer({ success: true, hostname: 'altro.example', action: 'checkout' }), 's', 't', 'ip', 'yanks.test')).toBe(false);
    expect(await verifyTurnstile(answer({ success: true }), 's', 't', 'ip', 'yanks.test')).toBe(false);
  });

  it("accetta solo l'azione del checkout", async () => {
    expect(await verifyTurnstile(answer({ success: true, hostname: 'yanks.test', action: 'login' }), 's', 't', 'ip', 'yanks.test')).toBe(false);
    expect(await verifyTurnstile(answer({ success: true, hostname: 'yanks.test' }), 's', 't', 'ip', 'yanks.test')).toBe(false);
  });

  it('chiavi di prova: sì in locale, no online', async () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      expect(await verifyTurnstile(answer(testingKey), 's', 't', 'ip', host)).toBe(true);
    }
    expect(await verifyTurnstile(answer(testingKey), 's', 't', 'ip', 'yanks-redesign.workers.dev')).toBe(false);
  });

  it('rifiuta se la verifica non riesce, anche con hostname giusto', async () => {
    expect(await verifyTurnstile(answer({ success: false, hostname: 'yanks.test', action: 'checkout' }), 's', 't', 'ip', 'yanks.test')).toBe(false);
    expect(await verifyTurnstile(answer({ success: true, hostname: 'yanks.test', action: 'checkout' }, 500), 's', 't', 'ip', 'yanks.test')).toBe(false);
    const broken = (async () => {
      throw new Error('rete');
    }) as unknown as typeof fetch;
    expect(await verifyTurnstile(broken, 's', 't', 'ip', 'yanks.test')).toBe(false);
  });
});

// Il motivo del rifiuto va nei log; token e secret mai
describe('verifyTurnstile, log del rifiuto', () => {
  const secret = 'secret-da-non-scrivere';
  const token = 'token-da-non-scrivere';
  let lines: string[] = [];
  beforeEach(() => {
    lines = [];
    vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => void lines.push(args.join(' ')));
  });
  afterEach(() => vi.restoreAllMocks());

  const logged = async (fetcher: typeof fetch, host = 'yanks.test') => {
    expect(await verifyTurnstile(fetcher, secret, token, 'ip', host)).toBe(false);
    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain(secret);
    expect(lines[0]).not.toContain(token);
    return lines[0]!;
  };

  it('scrive i codici di Cloudflare, filtrati', async () => {
    const line = await logged(answer({ success: false, 'error-codes': ['invalid-input-secret', '<script>', 42] }));
    expect(line).toContain('"errorCodes":["invalid-input-secret"]');
  });

  it('scrive quale controllo non passa tra hostname e azione', async () => {
    expect(await logged(answer({ success: true, hostname: 'altro.example', action: 'checkout' }))).toContain('"hostnameOk":false,"actionOk":true');
    lines = [];
    expect(await logged(answer({ success: true, hostname: 'yanks.test', action: 'login' }))).toContain('"hostnameOk":true,"actionOk":false');
  });

  it('chiave di prova online, risposta non ok, Cloudflare irraggiungibile', async () => {
    expect(await logged(answer(testingKey), 'yanks-redesign.workers.dev')).toContain('"testingKey":true');
    lines = [];
    expect(await logged(answer({}, 500))).toContain('"status":500');
    lines = [];
    const broken = (async () => {
      throw new Error(`rete ${token}`);
    }) as unknown as typeof fetch;
    expect(await logged(broken)).toContain('"unreachable":true');
  });

  it('nessun log quando la verifica passa', async () => {
    expect(await verifyTurnstile(answer({ success: true, hostname: 'yanks.test', action: 'checkout' }), secret, token, 'ip', 'yanks.test')).toBe(true);
    expect(lines).toHaveLength(0);
  });
});
