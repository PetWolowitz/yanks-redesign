// Test dei flussi dello shop nel browser (Fase 5S). Girano sulla build in modalità
// mock: niente Stripe, niente Turnstile, niente database, quindi nessuna chiave
// (mai quelle vere). Il server lo avvia Playwright: build e anteprima sulla 4331.
// I file sono e2e/*.e2e.ts, così Vitest non li prende.
import { defineConfig, devices } from '@playwright/test';

const port = 4331;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  globalSetup: './e2e/warmup.ts',
  // un browser alla volta: anteprima e Chromium insieme pesano
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx astro build && npx astro preview --port ${port}`,
    url: `http://localhost:${port}/en/`,
    env: { PUBLIC_SHOP_MODE: 'mock' },
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
  },
});
