import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { orderToken, verifyOrderToken } from '../src/lib/shop/token';

// Segreti di prova: 43 caratteri come quelli generati con randomBytes(32)
const secret = 'test-secret-0123456789abcdefghijklmnopqrstu';
const otherSecret = 'altro-segreto-0123456789abcdefghijklmnopqrs';
const id = '6f1c2a9e-3b7d-4c55-9a01-2d8e7f4b6c10';

describe('orderToken', () => {
  it('è HMAC-SHA256 di "order-access:v1:" + id, in base64url a lunghezza piena', async () => {
    const expected = createHmac('sha256', secret).update(`order-access:v1:${id}`).digest('base64url');
    const token = await orderToken(secret, id);
    expect(token).toBe(expected);
    expect(token).toHaveLength(43);
  });

  it('è sempre lo stesso per lo stesso ordine: si ricalcola, non si conserva', async () => {
    expect(await orderToken(secret, id)).toBe(await orderToken(secret, id));
  });

  it('rifiuta un segreto troppo corto', async () => {
    await expect(orderToken('corto', id)).rejects.toThrow();
  });
});

describe('verifyOrderToken', () => {
  it('accetta il token giusto', async () => {
    expect(await verifyOrderToken(secret, id, await orderToken(secret, id))).toBe(true);
  });

  it('rifiuta un token troncato', async () => {
    const token = await orderToken(secret, id);
    expect(await verifyOrderToken(secret, id, token.slice(0, 42))).toBe(false);
    expect(await verifyOrderToken(secret, id, token.slice(0, 22))).toBe(false);
  });

  it("rifiuta il token di un altro ordine", async () => {
    const other = await orderToken(secret, 'a0b1c2d3-0000-4000-8000-000000000000');
    expect(await verifyOrderToken(secret, id, other)).toBe(false);
  });

  it('rifiuta un token firmato con un altro segreto', async () => {
    expect(await verifyOrderToken(secret, id, await orderToken(otherSecret, id))).toBe(false);
  });

  it('rifiuta un token con un carattere cambiato', async () => {
    const token = await orderToken(secret, id);
    const changed = (token[0] === 'A' ? 'B' : 'A') + token.slice(1);
    expect(await verifyOrderToken(secret, id, changed)).toBe(false);
  });

  it('rifiuta forme non valide senza lanciare errori', async () => {
    for (const bad of ['', 'x', '='.repeat(43), 'a'.repeat(44), 'a+b/'.repeat(11).slice(0, 43)]) {
      expect(await verifyOrderToken(secret, id, bad)).toBe(false);
    }
  });
});
