// Stampa il seed SQL generato da merch.ts (src/lib/shop/seed.ts).
// Uso: npm run db:seed:local (o :remote), che lo scrive in .wrangler/seed.sql e lo applica.
import { writeFileSync, mkdirSync } from 'node:fs';
import { merch, skuOf } from '../src/data/merch.ts';
import { seedSql } from '../src/lib/shop/seed.ts';

mkdirSync('.wrangler', { recursive: true });
writeFileSync('.wrangler/seed.sql', seedSql(merch, skuOf));
console.log(`Seed scritto in .wrangler/seed.sql: ${merch.length} prodotti`);
