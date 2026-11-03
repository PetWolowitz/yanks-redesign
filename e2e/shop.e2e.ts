// Flussi dello shop cliccati come farebbe un cliente, sulla build mock
// (playwright.config.ts). In inglese: i testi vengono da src/i18n/en.json.
import { expect, test, type Page } from '@playwright/test';

const lighter = '/en/shop/djeep-lighter/';

// L'avviso d'età si salta: ha il suo test qui sotto
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith('age gate')) return;
  await page.addInitScript(() => {
    try {
      localStorage.setItem('age-ok', '1');
    } catch {}
  });
});

async function addLighter(page: Page) {
  await page.goto(lighter);
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('1');
}

async function fillCheckout(page: Page) {
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Full name').fill('Test Klant');
  await page.getByLabel('Street and number').fill('Dorpsplein 2');
  await page.getByLabel('Postal code').fill('2042 JK');
  await page.getByLabel('City').fill('Zandvoort');
  await page.getByLabel('Country').selectOption('NL');
}

test('without JavaScript the catalogue and prices can be read', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/shop/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // i prezzi sono nell'HTML statico, scritti in build da merch.ts
  await expect(page.getByText('€3.50').first()).toBeVisible();
  await context.close();
});

test('adding to the cart updates the count and the cart page', async ({ page }) => {
  await addLighter(page);
  await page.goto('/en/shop/cart/');
  await expect(page.getByText('Yanks Djeep lighter').first()).toBeVisible();
  await expect(page.getByText('€3.50').first()).toBeVisible();
});

// Giacenze finte in lib/shop/mock.ts: la felpa ha 20 pezzi per variante, il
// berretto 0. La felpa ha solo varianti con colore: il catalogo deve contarle
test('sold out: the catalogue counts colours, the button says Sold out', async ({ page }) => {
  await page.goto('/en/shop/');
  const card = (slug: string) => page.locator('[data-card]').filter({ has: page.locator(`a[href="/en/shop/${slug}/"]`) });
  await expect(card('beanie').locator('stock-status')).toHaveText('Sold out');
  await expect(card('hoodie').locator('stock-status')).toHaveText('');

  await page.goto('/en/shop/beanie/');
  const button = page.locator('add-to-cart button[type=submit]');
  await expect(button).toHaveText('Sold out');
  await expect(button).toBeDisabled();

  await page.goto('/en/shop/hoodie/');
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
});

// Quadratini dei colori: nel catalogo portano alla scheda con quel colore; nella
// scheda cambiano la foto grande e il nome accanto a "Colour". Felpa: grigio = foto 5
test('colour squares: from the catalogue to the product, with the photo of that colour', async ({ page }) => {
  await page.goto('/en/shop/');
  const hoodie = page.locator('[data-card]').filter({ has: page.locator('a[href="/en/shop/hoodie/"]') });
  await expect(hoodie.locator('[data-swatch]')).toHaveCount(4);
  await hoodie.locator('[data-swatch="grey"]').click();

  await expect(page).toHaveURL(/\/en\/shop\/hoodie\/\?color=grey$/);
  await expect(page.locator('input[name=color][value=grey]')).toBeChecked();
  await expect(page.locator('[data-color-name]')).toHaveText('Grey');
  await expect(page.locator('a[data-main]')).toHaveAttribute('data-zoom', '4');

  await page.locator('label[title="Black"]').click();
  await expect(page.locator('[data-color-name]')).toHaveText('Black');
  await expect(page.locator('a[data-main]')).toHaveAttribute('data-zoom', '6');
});

test('checkout refuses an empty form and a wrong Dutch postal code', async ({ page }) => {
  await addLighter(page);
  await page.goto('/en/shop/checkout/');
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await expect(page.locator('#checkout-email-error')).not.toBeEmpty();
  await expect(page).toHaveURL(/\/shop\/checkout\//);

  await fillCheckout(page);
  await page.getByLabel('Postal code').fill('12345');
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await expect(page.locator('#checkout-postalCode-error')).not.toBeEmpty();
  await expect(page).toHaveURL(/\/shop\/checkout\//);
});

test('a paid order shows the toast once and empties the cart', async ({ page }) => {
  await addLighter(page);
  await page.goto('/en/shop/checkout/');
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Continue to payment' }).click();

  await expect(page).toHaveURL(/\/shop\/order\//);
  await expect(page.getByText('Thank you! Your order is paid.')).toBeVisible({ timeout: 15_000 });
  const toast = page.locator('[data-toast]');
  await expect(toast).toBeVisible();
  // la frase arriva nella regione annunciata, senza il pulsante
  await expect(page.locator('[data-toast-live]')).toHaveText('Payment received: your order is confirmed.');
  await expect(page.locator('[data-cart-count]').first()).not.toHaveText('1');

  await page.getByRole('button', { name: 'Close message' }).click();
  await expect(toast).toBeHidden();

  // ricaricando la pagina il toast non torna
  await page.reload();
  await expect(page.getByText('Thank you! Your order is paid.')).toBeVisible({ timeout: 15_000 });
  await expect(toast).toBeHidden();
});

test('the order page without an order points to the email link', async ({ page }) => {
  await page.goto('/en/shop/order/');
  await expect(page.getByText("We can't find an order in this browser.", { exact: false })).toBeVisible();
});

test('age gate: asks first, remembers only the yes', async ({ page }) => {
  await page.goto('/en/');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /yes/i }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeHidden();
});
