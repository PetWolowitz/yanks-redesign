// Tipi minimi di quello che gli endpoint usano da Cloudflare: database D1, segreto e
// limitatore di richieste. Scritti a mano perché i tipi completi del runtime
// (wrangler types) vanno in conflitto con quelli del DOM usati dal resto del sito.
// Solo la parte di API che usiamo; i nomi seguono la documentazione di Cloudflare.

export interface D1Result<T> {
  results: T[];
}

// Esito di una scrittura: quante righe ha cambiato
export interface D1RunResult {
  meta: { changes: number };
}

export interface D1PreparedStatement {
  bind(...values: (string | number | null)[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<D1RunResult>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  // Le istruzioni di un batch sono una transazione: o tutte o nessuna
  batch(statements: D1PreparedStatement[]): Promise<D1RunResult[]>;
}

export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

// I binding di wrangler.jsonc e i segreti (wrangler secret put / .dev.vars)
export interface ShopEnv {
  DB: D1Database;
  ORDER_TOKEN_SECRET: string;
  // chiave segreta di Stripe in modalità test (sk_test_…)
  STRIPE_SECRET_KEY: string;
  // segreto di firma del webhook (whsec_…)
  STRIPE_WEBHOOK_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  // mittente dell'email, non segreto (vars in wrangler.jsonc)
  EMAIL_FROM: string;
  // facoltativo: se Cloudflare non lo fornisce, gli endpoint funzionano lo stesso
  SHOP_LIMITER?: RateLimit;
}
