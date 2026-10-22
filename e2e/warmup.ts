// Prima dei test: l'anteprima locale (Miniflare) fallisce la prima richiesta dopo
// l'avvio. Si chiedono un paio di pagine finché rispondono, così il primo test parte
// con il server già caldo invece di prendersi l'errore.
import type { FullConfig } from '@playwright/test';

export default async function warmup(config: FullConfig) {
  const base = config.projects[0]!.use.baseURL!;
  for (const path of ['/en/', '/en/shop/']) {
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        if ((await fetch(base + path)).ok) break;
      } catch {
        // non ancora pronto
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
