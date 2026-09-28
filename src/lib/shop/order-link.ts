// Il link alla pagina ordine: id e token stanno nel fragment (#id=…&t=…), che non
// arriva mai al server, né nei log né nel Referer (docs/06). Lo usano la pagina
// ordine (secondo paracadute) e, dalla Fase 3, l'email di conferma.

export interface OrderAccess {
  id: string;
  token: string;
}

// id e token hanno forme note: UUID o simili, e base64url. Tutto il resto si scarta
const ID = /^[A-Za-z0-9-]{1,64}$/;
const TOKEN = /^[A-Za-z0-9_-]{1,128}$/;

export function orderLink(origin: string, lang: string, access: OrderAccess): string {
  const fragment = new URLSearchParams({ id: access.id, t: access.token });
  return `${origin}/${lang}/shop/order/#${fragment}`;
}

// "#id=…&t=…" → { id, token }, oppure null se manca o non è valido
export function parseOrderFragment(hash: string): OrderAccess | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const id = params.get('id');
  const token = params.get('t');
  if (!id || !token || !ID.test(id) || !TOKEN.test(token)) return null;
  return { id, token };
}

// Quello che il checkout salva in sessionStorage prima di andare su Stripe
export function parseStoredAccess(raw: string | null): OrderAccess | null {
  if (!raw) return null;
  try {
    const { id, token } = JSON.parse(raw) as Record<string, unknown>;
    if (typeof id !== 'string' || typeof token !== 'string' || !ID.test(id) || !TOKEN.test(token)) return null;
    return { id, token };
  } catch {
    return null;
  }
}
