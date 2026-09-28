// Regole di validazione del checkout, scritte una volta sola.
// Le usa il form (per mostrare gli errori subito) e il server (per sicurezza):
// per questo validateCheckout accetta qualsiasi valore, anche JSON non fidato.
import { locales, type Lang } from '../../i18n/locales';
import {
  shippingCountries,
  type CartItem,
  type CheckoutErrors,
  type CheckoutRequest,
  type Country,
  type FieldError,
} from './types';

export const limits = {
  email: 254,
  fullName: 100,
  street: 200,
  city: 100,
  turnstileToken: 2048,
  sku: 64,
  // quantità per riga, come il CHECK del database
  maxQuantity: 10,
  // righe diverse nello stesso ordine
  maxLines: 20,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const skuPattern = /^[a-z0-9-]+$/;

// CAP per paese, già in maiuscolo e senza spazi ai lati
const postalCodePatterns: Record<Country, RegExp> = {
  NL: /^\d{4} ?[A-Z]{2}$/,
  BE: /^\d{4}$/,
  LU: /^(L-)?\d{4}$/,
  DE: /^\d{5}$/,
  AT: /^\d{4}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
};

export function isValidQuantity(quantity: unknown): quantity is number {
  return Number.isInteger(quantity) && (quantity as number) >= 1 && (quantity as number) <= limits.maxQuantity;
}

// Testo obbligatorio: tolti gli spazi ai lati, non vuoto, non troppo lungo
function text(value: unknown, max: number): string | FieldError {
  if (value === undefined || value === null) return 'required';
  if (typeof value !== 'string') return 'invalid';
  const trimmed = value.trim();
  if (trimmed === '') return 'required';
  if (trimmed.length > max) return 'tooLong';
  return trimmed;
}

function isError(value: unknown): value is FieldError {
  return value === 'required' || value === 'tooLong' || value === 'invalid';
}

function items(value: unknown): CartItem[] | FieldError {
  if (!Array.isArray(value) || value.length === 0) return 'required';
  if (value.length > limits.maxLines) return 'tooLong';
  const seen = new Set<string>();
  const result: CartItem[] = [];
  for (const item of value) {
    const { sku, quantity } = (item ?? {}) as Record<string, unknown>;
    if (typeof sku !== 'string' || sku.length > limits.sku || !skuPattern.test(sku)) return 'invalid';
    if (!isValidQuantity(quantity) || seen.has(sku)) return 'invalid';
    seen.add(sku);
    result.push({ sku, quantity });
  }
  return result;
}

export type ValidationResult = { ok: true; value: CheckoutRequest } | { ok: false; errors: CheckoutErrors };

export function validateCheckout(input: unknown): ValidationResult {
  const data = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const address = (typeof data.address === 'object' && data.address !== null ? data.address : {}) as Record<string, unknown>;
  const errors: CheckoutErrors = {};

  const lang: Lang | FieldError = locales.includes(data.lang as Lang) ? (data.lang as Lang) : 'invalid';
  const country = shippingCountries.includes(address.country as Country) ? (address.country as Country) : undefined;
  const countryField: Country | FieldError =
    country ?? (address.country === undefined || address.country === '' ? 'required' : 'invalid');

  let email = text(data.email, limits.email);
  if (!isError(email) && !emailPattern.test(email)) email = 'invalid';

  let postalCode = text(address.postalCode, 12);
  if (!isError(postalCode)) {
    postalCode = postalCode.toUpperCase();
    // senza un paese valido il CAP non si può giudicare: l'errore è sul paese
    if (country && !postalCodePatterns[country].test(postalCode)) postalCode = 'invalid';
  }

  const fields = {
    lang,
    email,
    fullName: text(address.fullName, limits.fullName),
    street: text(address.street, limits.street),
    postalCode,
    city: text(address.city, limits.city),
    country: countryField,
    items: items(data.items),
    turnstileToken: text(data.turnstileToken, limits.turnstileToken),
  };

  for (const [field, value] of Object.entries(fields)) {
    if (isError(value)) errors[field as keyof CheckoutErrors] = value;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // Qui nessun campo è un errore: i cast restringono solo il tipo
  const valid = fields as { [K in keyof typeof fields]: Exclude<(typeof fields)[K], FieldError> };
  return {
    ok: true,
    value: {
      lang: valid.lang,
      email: valid.email,
      address: {
        fullName: valid.fullName,
        street: valid.street,
        postalCode: valid.postalCode,
        city: valid.city,
        country: valid.country,
      },
      items: valid.items,
      turnstileToken: valid.turnstileToken,
    },
  };
}
