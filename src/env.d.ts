// Il modulo con i binding di Cloudflare, letto solo dagli endpoint in src/pages/api/
declare module 'cloudflare:workers' {
  export const env: import('./lib/shop/server-env').ShopEnv;
}
