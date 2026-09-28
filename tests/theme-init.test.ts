// Lo script inline dell'<head>: tema e avviso d'età, prima del rendering.
// Si esegue il file vero in un contesto finto, con document e localStorage minimi.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/scripts/theme-init.js', 'utf8');

function run(stored: Record<string, string>, now = new Date('2026-07-15T10:00:00Z'), blocked = false) {
  const dataset: Record<string, string> = {};
  const localStorage = {
    getItem: (key: string) => {
      if (blocked) throw new Error('storage bloccato');
      return stored[key] ?? null;
    },
  };
  class FixedDate extends Date {
    constructor() {
      super(now);
    }
  }
  runInNewContext(source, { document: { documentElement: { dataset } }, localStorage, Intl, Date: FixedDate, Number });
  return dataset;
}

describe('theme-init.js', () => {
  it('senza scelta salvata: chiaro di giorno ad Amsterdam', () => {
    expect(run({}).theme).toBe('light');
  });

  it('senza scelta salvata: scuro alle 22 di Amsterdam (20 UTC in estate)', () => {
    expect(run({}, new Date('2026-07-15T20:00:00Z')).theme).toBe('dark');
  });

  it('la scelta salvata vince sull\'orario', () => {
    expect(run({ theme: 'dark' }).theme).toBe('dark');
  });

  it('avviso d\'età: "ask" finché non si è risposto sì', () => {
    expect(run({}).age).toBe('ask');
    expect(run({ 'age-ok': '0' }).age).toBe('ask');
  });

  it('avviso d\'età: "ok" dopo il sì salvato', () => {
    expect(run({ 'age-ok': '1' }).age).toBe('ok');
  });

  it('con lo storage bloccato non si rompe: tema dall\'orario e avviso mostrato', () => {
    const dataset = run({}, undefined, true);
    expect(dataset.theme).toBe('light');
    expect(dataset.age).toBe('ask');
  });
});
