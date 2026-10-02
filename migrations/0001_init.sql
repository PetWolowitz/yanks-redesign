-- Schema dello shop (docs/06, Database). Applicato con: wrangler d1 migrations apply
-- I CHECK sono la seconda linea di difesa dopo validate.ts.
-- Mai in tabella: numeri di carta, CVV, password, IBAN. Niente token né hash del token.

-- Solo quello che cambia: prezzo e stato. Nomi e descrizioni stanno nei file di lingua
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  -- edizione limitata: pezzi totali, NULL se non è limitata
  limited INTEGER CHECK (limited IS NULL OR limited > 0),
  active INTEGER NOT NULL DEFAULT 1
);

-- Una variante per taglia; size NULL = taglia unica
CREATE TABLE variants (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  size TEXT,
  sku TEXT UNIQUE NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  -- l'id che vede il browser (UUID), mai l'id interno
  public_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('nl','en','de','it','fr','es')),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','shipped','cancelled')),
  total_cents INTEGER NOT NULL CHECK (total_cents > 0),
  stripe_session_id TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Il prezzo è quello letto dal database al momento dell'ordine, mai quello del browser
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  variant_id INTEGER NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  price_cents INTEGER NOT NULL CHECK (price_cents > 0)
);

CREATE INDEX order_items_order ON order_items(order_id);

CREATE TABLE shipping_addresses (
  order_id INTEGER PRIMARY KEY REFERENCES orders(id),
  full_name TEXT NOT NULL,
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL
);
