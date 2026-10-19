// verifyTurnstile: hostname e azione della risposta devono essere i nostri; le chiavi di
// prova di Cloudflare (hostname "example.com") valgono solo in locale
import { describe, expect, it } from 'vitest';
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
