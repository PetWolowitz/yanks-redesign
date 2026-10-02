// Tipi minimi di quello che gli endpoint usano da Cloudflare: database D1, segreto e
// limitatore di richieste. Scritti a mano perché i tipi completi del runtime
// (wrangler types) vanno in conflitto con quelli del DOM usati dal resto del sito.
// Solo la parte di API che usiamo; i nomi seguono la documentazione di Cloudflare.

export interface D1Result<T> {
  results: T[];
}

export interface D1PreparedStatement {
  bind(...values: (string | number | null)[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

// I binding di wrangler.jsonc e i segreti (wrangler secret put / .dev.vars)
export interface ShopEnv {
  DB: D1Database;
  ORDER_TOKEN_SECRET: string;
  // facoltativo: se Cloudflare non lo fornisce, gli endpoint funzionano lo stesso
  SHOP_LIMITER?: RateLimit;
}
