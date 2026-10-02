// Stripe senza libreria: due cose sole, con fetch e Web Crypto (docs/06, docs/09).
// - creare una sessione di Checkout (API REST, corpo form-encoded)
// - verificare la firma dei webhook (HMAC-SHA256, confronto a tempo costante)
// Documentazione: docs.stripe.com/api/checkout/sessions/create e
// docs.stripe.com/webhooks ("Verifica manuale delle firme")
const SESSIONS = 'https://api.stripe.com/v1/checkout/sessions';
// Tolleranza tra il timestamp firmato e l'ora attuale: quella delle librerie di Stripe
export const SIGNATURE_TOLERANCE_SECONDS = 300;

export interface SessionLine {
  name: string;
  unitAmountCents: number;
  quantity: number;
}

export interface SessionInput {
  publicId: string;
  email: string;
  locale: string;
  successUrl: string;
  cancelUrl: string;
  lines: SessionLine[];
  // secondi Unix; Stripe accetta da 30 minuti a 24 ore
  expiresAt: number;
}

export function sessionForm(input: SessionInput): URLSearchParams {
  const form = new URLSearchParams({
    mode: 'payment',
    locale: input.locale,
    customer_email: input.email,
    client_reference_id: input.publicId,
    'metadata[order_id]': input.publicId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    expires_at: String(input.expiresAt),
  });
  input.lines.forEach((line, i) => {
    form.set(`line_items[${i}][quantity]`, String(line.quantity));
    form.set(`line_items[${i}][price_data][currency]`, 'eur');
    form.set(`line_items[${i}][price_data][unit_amount]`, String(line.unitAmountCents));
    form.set(`line_items[${i}][price_data][product_data][name]`, line.name);
  });
  return form;
}

// null se Stripe rifiuta o non risponde. La chiave di idempotenza fa sì che un
// secondo invio dello stesso ordine non crei una seconda sessione
export async function createSession(fetcher: typeof fetch, secretKey: string, input: SessionInput): Promise<{ id: string; url: string } | null> {
  try {
    const response = await fetcher(SESSIONS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': `checkout-${input.publicId}`,
      },
      body: sessionForm(input),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const session = (await response.json()) as { id?: unknown; url?: unknown };
    if (typeof session.id !== 'string' || typeof session.url !== 'string') return null;
    // Si manda il cliente solo sulla pagina di pagamento di Stripe, mai altrove
    if (!session.url.startsWith('https://checkout.stripe.com/')) return null;
    return { id: session.id, url: session.url };
  } catch {
    return null;
  }
}

const encoder = new TextEncoder();

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]{64}$/.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// Intestazione "t=…,v1=…,v1=…,v0=…": si usa solo lo schema v1 (gli altri si
// ignorano, come chiede Stripe). Il corpo deve essere quello ricevuto, intatto
export async function verifyStripeSignature(secret: string, header: string | null, rawBody: string, nowSeconds: number): Promise<boolean> {
  if (!secret || !header) return false;
  let timestamp: number | null = null;
  const signatures: Uint8Array<ArrayBuffer>[] = [];
  for (const part of header.split(',')) {
    const [key, value] = part.split('=', 2);
    if (key === 't' && value && /^\d{1,12}$/.test(value)) timestamp = Number(value);
    if (key === 'v1' && value) {
      const bytes = fromHex(value);
      if (bytes) signatures.push(bytes);
    }
  }
  if (timestamp === null || signatures.length === 0 || signatures.length > 8) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const payload = encoder.encode(`${timestamp}.${rawBody}`);
  for (const signature of signatures) {
    if (await crypto.subtle.verify('HMAC', key, signature, payload)) return true;
  }
  return false;
}
