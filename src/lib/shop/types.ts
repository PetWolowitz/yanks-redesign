// Tipi condivisi tra frontend ed endpoint: se una parte cambia forma, astro check lo segnala.
// Prezzi sempre in centesimi interi, come nel database (price_cents).
import type { Lang } from '../../i18n/locales';

export type Category = 'clothing' | 'accessories' | 'smoking' | 'special';
export type Size = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

// Paesi in cui si spedisce: lista chiusa, controllata da validate.ts
export const shippingCountries = ['NL', 'BE', 'LU', 'DE', 'AT', 'FR', 'IT', 'ES'] as const;
export type Country = (typeof shippingCountries)[number];

// Una riga di merch.ts, l'unica fonte scritta a mano dei prodotti
export interface MerchItem {
  slug: string;
  category: Category;
  priceCents: number;
  // taglie disponibili; vuoto = taglia unica
  sizes: Size[];
  // pezzi dell'edizione limitata, null se non è limitata
  limited: number | null;
}

// Una variante vendibile: un prodotto in una taglia
export interface Variant {
  sku: string;
  size: Size | null;
  stock: number;
}

// Quello che restituisce getProducts(): serve al frontend per la disponibilità.
// I prezzi mostrati sono già nell'HTML statico, scritti in build da merch.ts
export interface Product {
  slug: string;
  category: Category;
  priceCents: number;
  limited: number | null;
  variants: Variant[];
}

// Il carrello contiene solo identificativi e quantità, mai prezzi
export interface CartItem {
  sku: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  postalCode: string;
  city: string;
  country: Country;
}

export interface CheckoutRequest {
  // lingua dell'acquisto: sceglie i testi dell'email e il link alla pagina ordine
  lang: Lang;
  email: string;
  address: ShippingAddress;
  items: CartItem[];
  turnstileToken: string;
}

export interface CheckoutResponse {
  // public_id dell'ordine
  id: string;
  // token d'accesso all'ordine: il browser lo salva in sessionStorage, non passa da Stripe
  token: string;
  // pagina di pagamento di Stripe (nel mock: direttamente la pagina ordine)
  redirectUrl: string;
}

export type OrderState = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface OrderStatus {
  id: string;
  status: OrderState;
  totalCents: number;
  items: { sku: string; quantity: number; priceCents: number }[];
}

// Campi del checkout e i loro errori, uguali per form e server
export type CheckoutField = 'email' | 'fullName' | 'street' | 'postalCode' | 'city' | 'country' | 'items' | 'lang' | 'turnstileToken';
export type FieldError = 'required' | 'tooLong' | 'invalid';
export type CheckoutErrors = Partial<Record<CheckoutField, FieldError>>;

// Errori che ShopApi può restituire. not_found vale anche per un token sbagliato:
// token sbagliato e ordine inesistente hanno la stessa risposta
export type ShopErrorCode = 'invalid' | 'out_of_stock' | 'not_found' | 'unavailable';

// Corpo JSON delle risposte d'errore degli endpoint
export interface ApiErrorBody {
  error: ShopErrorCode;
  fields?: CheckoutErrors;
}

// L'errore che ogni funzione di ShopApi lancia, in mock come in live
export class ShopError extends Error {
  constructor(
    readonly code: ShopErrorCode,
    readonly fields?: CheckoutErrors,
  ) {
    super(code);
    this.name = 'ShopError';
  }
}
