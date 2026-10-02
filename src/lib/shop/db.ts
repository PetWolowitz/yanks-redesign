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
