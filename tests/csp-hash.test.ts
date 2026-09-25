// Ogni script inline delle pagine generate deve essere autorizzato nella CSP tramite hash.
// Controlla l'HTML vero in dist/, quindi va eseguito dopo `npm run build`.
import { createHash } from 'node:crypto';
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

function inlineScripts(html: string): string[] {
  const scripts = html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g);
  return [...scripts].map((match) => match[1] ?? '');
}

function sha256(text: string): string {
  return `'sha256-${createHash('sha256').update(text).digest('base64')}'`;
}

function scriptSrc(headersFile: string): string {
  const csp = readFileSync(headersFile, 'utf8').match(/Content-Security-Policy:(.*)/)?.[1] ?? '';
  return csp.split(';').find((directive) => directive.trim().startsWith('script-src')) ?? '';
}

describe('CSP e script inline', () => {
  it('la build esiste', () => {
    expect(existsSync(DIST), 'manca dist/: esegui prima npm run build').toBe(true);
  });

  const pages = existsSync(DIST) ? htmlFiles(DIST) : [];
  const themeInit = readFileSync('src/scripts/theme-init.js', 'utf8');

  it('lo script del tema arriva nell\'HTML identico al sorgente', () => {
    const page = readFileSync(join(DIST, 'en/index.html'), 'utf8');
    expect(inlineScripts(page)).toContain(themeInit);
  });

  for (const page of pages) {
    it(`${page}: ogni script inline ha il suo hash in public/_headers e in dist/`, () => {
      for (const script of inlineScripts(readFileSync(page, 'utf8'))) {
        expect(scriptSrc('public/_headers')).toContain(sha256(script));
        expect(scriptSrc(join(DIST, '_headers'))).toContain(sha256(script));
      }
    });
  }
});
