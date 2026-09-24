# Architettura, sicurezza e privacy — Yanks redesign

Obiettivo: shop funzionante in modalità test, acquisto senza registrazione,
database minimo, nessun dato sensibile sul nostro server, tutto gratuito.

## Principio di fondo
**I dati della carta non toccano mai il nostro codice.** Il cliente paga sulla
pagina di Stripe e torna indietro. Noi riceviamo un identificativo e l'esito.
Così si resta fuori dal perimetro PCI-DSS.

La sicurezza qui non è aggiungere strati: è **ridurre la superficie d'attacco**.
Pagine statiche, niente account, niente password, niente carte. Quello che non
esiste non si può rubare.

## Architettura

```
Browser
  │  pagine statiche (HTML, CSS, font, immagini)   ← nessun costo, nessun rischio
  │
  ├── GET  /api/products        prodotti e giacenze da D1
  ├── POST /api/checkout        Turnstile → validazione → totale dal DB
  │                             → ordine "pending" → sessione Stripe
  ├── POST /api/stripe-webhook  firma verificata → ordine "paid" → giacenze
  └── GET  /api/order/[token]   stato ordine tramite link firmato

Cloudflare Workers + D1   ·   Stripe Checkout (test)   ·   Turnstile
```

Quattro endpoint. Nient'altro gira sul server.

## Pagamenti — Stripe Checkout in modalità test
- Accessibile subito, senza verifica aziendale
- Supporta iDEAL, il metodo più usato nei Paesi Bassi, più carte e wallet
- **I webhook sono firmati**: si verifica la firma con la chiave del webhook, con
  il provider crittografico compatibile con i Workers
- Carte di prova, nessun addebito reale

Per un cliente olandese vero si valuta **Mollie**, che richiede un'attività
registrata. L'architettura non cambia.

## Database — Cloudflare D1

```sql
-- migrations/0001_init.sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE variants (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  size TEXT,
  sku TEXT UNIQUE NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','shipped','cancelled')),
  total_cents INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  access_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  variant_id INTEGER NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  price_cents INTEGER NOT NULL
);
CREATE TABLE shipping_addresses (
  order_id INTEGER PRIMARY KEY REFERENCES orders(id),
  full_name TEXT NOT NULL, street TEXT NOT NULL, postal_code TEXT NOT NULL,
  city TEXT NOT NULL, country TEXT NOT NULL
);
```

- Nomi e descrizioni dei prodotti stanno nei file di lingua, non nel database:
  il database tiene solo quello che cambia (prezzi e giacenze)
- I vincoli `CHECK` sono la seconda linea di difesa dopo la validazione
- **Mai in tabella**: numeri di carta, CVV, password, IBAN
- SQL sempre con parametri: `db.prepare('… WHERE id = ?').bind(id)`. Mai stringhe
  concatenate
- Migrazioni versionate in `migrations/`, applicate con `wrangler d1 migrations`

## Flusso d'acquisto senza registrazione
1. Carrello in `localStorage`, dentro `try/catch`, solo identificativi e quantità
2. Checkout: email, indirizzo, verifica Turnstile invisibile
3. `api/checkout`: verifica Turnstile lato server, valida i campi, **legge i
   prezzi dal database e ricalcola il totale**, controlla le giacenze, crea
   l'ordine `pending`, crea la sessione Stripe
4. Il cliente paga su Stripe e torna alla pagina di conferma
5. `api/stripe-webhook`: verifica la firma, e solo allora ordine `paid` e giacenze
   scalate, in un'unica transazione
6. Pagina di stato con link firmato: `/en/order/abc123?t=…`

Il token del link si salva **solo come hash**: se il database uscisse, i link non
funzionerebbero comunque.

## Sicurezza — le regole

**Le quattro che contano di più**
1. **Il prezzo si calcola sul server.** Il browser manda solo identificativi e
   quantità. Se ti fidi del totale del browser, chiunque compra una felpa a un
   centesimo
2. **È pagato solo quando lo dice il webhook, con firma verificata.** Il ritorno
   del cliente sulla pagina di conferma non prova niente
3. **I segreti non stanno mai nel codice.** Chiavi Stripe, firma del webhook e
   chiave Turnstile nelle variabili cifrate di Cloudflare. In locale in
   `.dev.vars`, escluso da git dal primo commit
4. **Validazione lato server di tutto**: email, CAP, paese da una lista chiusa,
   quantità intere tra 1 e 10, lunghezze massime su ogni campo

**Robustezza**
- Idempotenza: lo stesso webhook ricevuto due volte non scala le giacenze due
  volte. Si controlla lo stato prima di aggiornare
- Giacenze scalate solo a pagamento confermato
- Errori generici verso l'utente, dettagli solo nei log

**Anti-abuso**
- Turnstile sul checkout: ferma i bot senza puzzle e senza tracciamento
- Se serve, una regola di limitazione delle richieste dal pannello Cloudflare
- Protezione DDoS e firewall di Cloudflare inclusi anche nel piano gratuito

**Intestazioni HTTP** in `public/_headers`
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://www.instagram.com https://www.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; form-action 'self' https://checkout.stripe.com; base-uri 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin
```
Punto di partenza, da verificare in sviluppo: se Astro inserisce script inline,
si passa agli hash invece di allargare la policy. `'unsafe-inline'` sugli stili
va tolto se la build lo consente. Le eccezioni per Instagram e Maps servono solo
agli embed caricati al click. Verifica finale su securityheaders.com.

**Dipendenze**
- Poche, versioni esatte, `package-lock.json` nel repository
- Dependabot settimanale, `npm audit` prima di ogni pubblicazione
- Ogni pacchetto è codice di qualcun altro che gira sul tuo sito

## Privacy (GDPR)
- **Nessun cookie di tracciamento**, nessun analytics invasivo. Se servono
  statistiche, Cloudflare Web Analytics funziona senza cookie
- **Embed di Instagram e Google Maps caricati solo al click**, con anteprima
  statica prima. Senza questo, Meta e Google tracciano chi apre la pagina e
  servirebbe un banner cookie
- Informativa privacy vera: quali dati, perché, per quanto tempo
- Procedura per cancellare un ordine su richiesta
- Ordini di prova cancellati periodicamente

## Accesso ai contenuti
I siti dei coffeeshop olandesi mostrano di solito un avviso di età. Per il concept
è consigliato un avviso semplice, che ricorda la scelta e non blocca i motori di
ricerca.

## Esclusi dallo shop del concept
**I semi**: regole di vendita e spedizione diverse in ogni paese, in diversi paesi
dell'Unione vietata.

## Il contratto: come frontend e backend procedono in parallelo

Lo shop non è opzionale e non aspetta il backend. Tutto il frontend parla con
un'unica interfaccia, `ShopApi`, definita nella Fase 1:

```ts
// src/lib/shop/api.ts
export interface ShopApi {
  getProducts(): Promise<Product[]>
  createCheckout(req: CheckoutRequest): Promise<CheckoutResponse>
  getOrder(id: string, token: string): Promise<OrderStatus>
}
```

Due implementazioni della stessa interfaccia:
- `mock.ts` — legge `merch.ts`, simula giacenze e pagamento. Serve per costruire
  e provare tutto il frontend subito
- `http.ts` — chiama gli endpoint veri in `/api/*`

Quale si usa lo decide `PUBLIC_SHOP_MODE` (`mock` oppure `live`). Il giorno del
collegamento si cambia quella variabile e basta.

Regole che tengono in piedi il contratto:
- **Nessun componente chiama `fetch` direttamente.** Tutto passa da `ShopApi`
- **I tipi stanno in `types.ts`** e sono usati sia dal frontend sia dagli
  endpoint: se il backend cambia la forma di una risposta, il controllo dei tipi
  lo segnala subito
- **Le regole di validazione stanno in `validate.ts`**, usate dal form per
  l'esperienza utente e dal server per la sicurezza. Scritte una volta sola
- **I prodotti si scrivono una volta sola** in `merch.ts`: lo script di seed ne
  genera il contenuto del database

## Ordine di costruzione
1. **Fase 1**: tipi, `ShopApi`, `mock.ts`, `validate.ts` con i test
2. **Fase 2S**: catalogo, scheda prodotto, carrello, checkout e pagina ordine,
   tutti sul mock
3. **Fase 3**: D1 e migrazioni, seed da `merch.ts`, poi gli endpoint uno alla
   volta: `products`, `checkout`, `stripe-webhook`, `order`
4. **Fase 4**: `http.ts` e passaggio a `live`. Acquisto completo con carta di prova
5. Email di conferma con Resend, facoltativa

## Nel portfolio
"Shop con acquisto senza registrazione su Cloudflare Workers e D1. Pagamenti
Stripe in modalità test con webhook a firma verificata, prezzi calcolati lato
server, anti-bot senza tracciamento, intestazioni di sicurezza restrittive.
Nessun dato di pagamento transita dall'applicazione. Costo di hosting: zero."
