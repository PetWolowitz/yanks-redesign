// Token d'accesso all'ordine (docs/06, "Il token d'accesso all'ordine — HMAC").
// Non si conserva da nessuna parte: si ricalcola dal segreto e dall'id pubblico.
//   token = base64url(HMAC-SHA256(ORDER_TOKEN_SECRET, "order-access:v1:" + id))
// 32 byte, 43 caratteri, mai troncato. Solo Web Crypto: c'è nei Workers e in Node.
// La verifica usa crypto.subtle.verify, che confronta in tempo costante: mai ===.

const PREFIX = 'order-access:v1:';
const encoder = new TextEncoder();
// 32 byte in base64url senza "=" finale
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

async function hmacKey(secret: string): Promise<CryptoKey> {
  // Un segreto corto è un errore di configurazione, non un caso da gestire
  if (secret.length < 32) throw new Error('ORDER_TOKEN_SECRET troppo corto');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function toBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!TOKEN_FORMAT.test(text)) return null;
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Lo usano api/checkout (risposta al browser) e api/stripe-webhook (link nell'email)
export async function orderToken(secret: string, publicId: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(PREFIX + publicId));
  return toBase64url(new Uint8Array(signature));
}

// Lo usa api/order. false per qualunque token non valido: forma sbagliata, troncato,
// di un altro ordine, firmato con un altro segreto
export async function verifyOrderToken(secret: string, publicId: string, token: string): Promise<boolean> {
  const bytes = fromBase64url(token);
  if (!bytes || bytes.length !== 32) return false;
  return crypto.subtle.verify('HMAC', await hmacKey(secret), bytes, encoder.encode(PREFIX + publicId));
}
