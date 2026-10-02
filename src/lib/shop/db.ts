// Query dello shop su D1 (docs/06, Database). SQL scritto a mano, sempre con
// parametri (.bind): mai valori concatenati nel testo della query.
import type { D1Database } from './server-env';
import type { Category, OrderState, OrderStatus, Product, Size } from './types';

interface ProductRow {
  slug: string;
  category: Category;
  price_cents: number;
  limited: number | null;
  sku: string;
  size: Size | null;
  stock: number;
}

// Prodotti attivi con le loro varianti, nell'ordine in cui sono stati inseriti
export async function listProducts(db: D1Database): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.slug, p.category, p.price_cents, p.limited, v.sku, v.size, v.stock
       FROM products p JOIN variants v ON v.product_id = p.id
       WHERE p.active = 1
       ORDER BY p.id, v.id`,
    )
    .all<ProductRow>();
  const bySlug = new Map<string, Product>();
  for (const row of results) {
    let product = bySlug.get(row.slug);
    if (!product) {
      product = { slug: row.slug, category: row.category, priceCents: row.price_cents, limited: row.limited, variants: [] };
      bySlug.set(row.slug, product);
    }
    product.variants.push({ sku: row.sku, size: row.size, stock: row.stock });
  }
  return [...bySlug.values()];
}

interface OrderRow {
  id: number;
  public_id: string;
  status: OrderState;
  total_cents: number;
}

// Stato di un ordine per la pagina ordine. Solo quello che serve a mostrarlo:
// niente email, niente indirizzo (dati personali che la pagina non usa)
export async function findOrder(db: D1Database, publicId: string): Promise<OrderStatus | null> {
  const order = await db
    .prepare('SELECT id, public_id, status, total_cents FROM orders WHERE public_id = ?')
    .bind(publicId)
    .first<OrderRow>();
  if (!order) return null;
  const { results } = await db
    .prepare(
      `SELECT v.sku, i.quantity, i.price_cents
       FROM order_items i JOIN variants v ON v.id = i.variant_id
       WHERE i.order_id = ?
       ORDER BY i.id`,
    )
    .bind(order.id)
    .all<{ sku: string; quantity: number; price_cents: number }>();
  return {
    id: order.public_id,
    status: order.status,
    totalCents: order.total_cents,
    items: results.map((item) => ({ sku: item.sku, quantity: item.quantity, priceCents: item.price_cents })),
  };
}

// ---------------------------------------------------------------------------
// Checkout e webhook

export interface VariantRow {
  variant_id: number;
  sku: string;
  slug: string;
  size: Size | null;
  price_cents: number;
  stock: number;
}

// Le varianti richieste, solo di prodotti attivi, con prezzo e giacenza del database.
// I segnaposto sono uno per SKU (al massimo 20, limite di validate.ts)
export async function loadVariants(db: D1Database, skus: string[]): Promise<VariantRow[]> {
  if (skus.length === 0) return [];
  const marks = skus.map(() => '?').join(', ');
  const { results } = await db
    .prepare(
      `SELECT v.id AS variant_id, v.sku, p.slug, v.size, p.price_cents, v.stock
       FROM variants v JOIN products p ON p.id = v.product_id
       WHERE p.active = 1 AND v.sku IN (${marks})`,
    )
    .bind(...skus)
    .all<VariantRow>();
  return results;
}

export interface NewOrder {
  publicId: string;
  email: string;
  lang: string;
  totalCents: number;
  address: { fullName: string; street: string; postalCode: string; city: string; country: string };
  lines: { variantId: number; quantity: number; priceCents: number }[];
}

// Ordine pending, righe e indirizzo in un'unica transazione
export async function insertPendingOrder(db: D1Database, order: NewOrder): Promise<void> {
  const orderId = '(SELECT id FROM orders WHERE public_id = ?)';
  await db.batch([
    db
      .prepare("INSERT INTO orders (public_id, email, lang, status, total_cents) VALUES (?, ?, ?, 'pending', ?)")
      .bind(order.publicId, order.email, order.lang, order.totalCents),
    ...order.lines.map((line) =>
      db
        .prepare(`INSERT INTO order_items (order_id, variant_id, quantity, price_cents) VALUES (${orderId}, ?, ?, ?)`)
        .bind(order.publicId, line.variantId, line.quantity, line.priceCents),
    ),
    db
      .prepare(`INSERT INTO shipping_addresses (order_id, full_name, street, postal_code, city, country) VALUES (${orderId}, ?, ?, ?, ?, ?)`)
      .bind(order.publicId, order.address.fullName, order.address.street, order.address.postalCode, order.address.city, order.address.country),
  ]);
}

export async function setStripeSession(db: D1Database, publicId: string, sessionId: string): Promise<void> {
  await db.prepare("UPDATE orders SET stripe_session_id = ? WHERE public_id = ? AND status = 'pending'").bind(sessionId, publicId).run();
}

// Solo un ordine ancora pending si annulla: mai uno già pagato
export async function cancelPendingOrder(db: D1Database, where: { publicId: string } | { sessionId: string }): Promise<void> {
  const [column, value] = 'publicId' in where ? ['public_id', where.publicId] : ['stripe_session_id', where.sessionId];
  await db.prepare(`UPDATE orders SET status = 'cancelled' WHERE ${column} = ? AND status = 'pending'`).bind(value).run();
}

export interface WebhookOrder {
  id: number;
  public_id: string;
  email: string;
  lang: string;
  status: OrderState;
  total_cents: number;
}

export async function findOrderBySession(db: D1Database, sessionId: string): Promise<WebhookOrder | null> {
  return db
    .prepare('SELECT id, public_id, email, lang, status, total_cents FROM orders WHERE stripe_session_id = ?')
    .bind(sessionId)
    .first<WebhookOrder>();
}

// Pagato e giacenze scalate nella stessa transazione, e una volta sola: le giacenze
// scendono solo se l'ordine è ancora pending, e lo stato passa a paid solo da
// pending. Un secondo webhook uguale non cambia niente. Le giacenze non scendono
// sotto zero (la giacenza si controlla al checkout ma non si prenota): un eventuale
// esaurito venduto due volte si vede dalla giacenza a 0, non fa fallire il pagamento.
// true se questa chiamata ha davvero segnato l'ordine come pagato
export async function markOrderPaid(db: D1Database, orderId: number): Promise<boolean> {
  const results = await db.batch([
    db
      .prepare(
        `UPDATE variants
         SET stock = MAX(stock - (SELECT i.quantity FROM order_items i WHERE i.order_id = ?1 AND i.variant_id = variants.id), 0)
         WHERE id IN (SELECT variant_id FROM order_items WHERE order_id = ?1)
           AND (SELECT status FROM orders WHERE id = ?1) = 'pending'`,
      )
      .bind(orderId),
    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?1 AND status = 'pending'").bind(orderId),
  ]);
  return results[1]?.meta.changes === 1;
}

export async function orderLinesForEmail(db: D1Database, orderId: number) {
  const { results } = await db
    .prepare(
      `SELECT p.slug, v.size, i.quantity, i.price_cents
       FROM order_items i JOIN variants v ON v.id = i.variant_id JOIN products p ON p.id = v.product_id
       WHERE i.order_id = ?
       ORDER BY i.id`,
    )
    .bind(orderId)
    .all<{ slug: string; size: string | null; quantity: number; price_cents: number }>();
  return results.map((row) => ({ slug: row.slug, size: row.size, quantity: row.quantity, priceCents: row.price_cents }));
}
