// Nessun link interno rotto: ogni href="/…" delle pagine generate porta a un file
// che esiste in dist/client. Legge l'HTML vero, quindi va dopo `npm run build`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = 'dist/client';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function target(href: string): string {
  const path = decodeURI(href.split('#')[0]!.split('?')[0]!);
  return join(DIST, path.endsWith('/') ? `${path}index.html` : path);
}

describe('link interni', () => {
  const pages = existsSync(DIST) ? htmlFiles(DIST) : [];

  it('la build esiste', () => {
    expect(pages.length, 'manca dist/: esegui prima npm run build').toBeGreaterThan(0);
  });

  it('ogni href interno porta a un file esistente', () => {
    const broken = new Set<string>();
    for (const page of pages) {
      for (const match of readFileSync(page, 'utf8').matchAll(/\shref="(\/[^"]*)"/g)) {
        const href = match[1]!;
        if (!existsSync(target(href))) broken.add(`${href} (in ${page})`);
      }
    }
    expect([...broken]).toEqual([]);
  });
});
