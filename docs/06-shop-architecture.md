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
  │                             → email di conferma (Resend)
  └── POST /api/order           stato ordine: id e token nel body

Cloudflare Workers + D1 · Stripe Checkout (test) · Turnstile · Resend
```

Quattro endpoint. Nient'altro gira sul server. L'email non è un quinto
endpoint: è una chiamata in uscita fatta dal webhook.

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
  lang TEXT NOT NULL CHECK (lang IN ('nl','en','de','it','fr','es')),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','shipped','cancelled')),
  total_cents INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
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

- Nomi e descrizioni dei prodotti stanno nei file di lingua, sotto
  `shop.products.<slug>.name` e `.description`, non nel database: il database
  tiene solo quello che cambia (prezzi e giacenze)
- Il database si genera col seed da `merch.ts`, e **l'addebito si calcola solo
  da lì**. I prezzi mostrati nel catalogo sono scritti nell'HTML statico in build,
  sempre da `merch.ts`: un prezzo si cambia modificando `merch.ts`, rifacendo il
  seed e ripubblicando, così le due copie restano uguali
- `orders.lang` è la lingua in cui il cliente ha comprato: serve all'email di
  conferma per scegliere i testi e il link `/[lang]/shop/order`
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
   l'ordine `pending`, crea la sessione Stripe con `success_url` uguale a
   `/[lang]/shop/order`, **senza parametri**. Risponde con id, token e
   l'indirizzo della pagina di Stripe
4. Il browser salva id e token in `sessionStorage` (dentro `try/catch`), poi va
   su Stripe. Il cliente paga e torna alla pagina ordine
5. `api/stripe-webhook`: verifica la firma, e solo allora ordine `paid` e giacenze
   scalate, in un'unica transazione. **Dopo** la transazione invia l'email di
   conferma con Resend (sezione sotto)
6. Pagina ordine `/[lang]/shop/order`: legge id e token da `sessionStorage` e
   chiama `getOrder` (`POST /api/order`, id e token nel body)
   - se l'ordine è ancora `pending` mostra "pagamento in verifica" e ricontrolla
     per qualche secondo: il webhook può arrivare dopo il cliente
   - se `sessionStorage` è vuoto (altra scheda, altro dispositivo) rimanda al
     link nell'email di conferma, che porta `#id=…&t=…` nel fragment
   - **secondo paracadute**: quando ha id e token, mostra il link completo
     `https://…/[lang]/shop/order#id=…&t=…` con un pulsante "Copia link" e una
     riga che spiega di conservarlo, perché chi ha il link vede l'ordine. Così
     il cliente non dipende solo dall'email. Il pulsante usa
     `navigator.clipboard.writeText` dentro `try/catch`; se non funziona il link
     resta visibile e selezionabile a mano

## Email di conferma — Resend

**Obbligatoria.** È il modo in cui il cliente ritrova l'ordine da un'altra scheda
o da un altro dispositivo.

**Come si invia.** Una `fetch` all'API REST, senza pacchetto npm (sono venti
righe, KISS):

```
POST https://api.resend.com/emails
Authorization: Bearer <RESEND_API_KEY>
Content-Type: application/json
Idempotency-Key: order-confirmation/<public_id>

{ "from": "…", "to": ["<email del cliente>"], "subject": "…", "html": "…", "text": "…" }
```

- Risposta corretta: `{ "id": "…" }`. Qualsiasi altro stato è un errore
- `Idempotency-Key`: se Stripe rimanda lo stesso webhook, Resend non manda due
  email (la chiave vale 24 ore). Si aggiunge al controllo di stato che già rende
  il webhook idempotente
- Testi dell'email nei file di lingua, sotto `email.confirmation.*`, nella
  lingua di `orders.lang`. Mai scritti nel codice
- La costruzione dell'email è una funzione pura in `src/lib/shop/email.ts`,
  testata con Vitest: il link porta id e token **nel fragment**, mai nella query
- L'API di Resend va verificata sulla documentazione aggiornata prima di
  scrivere il codice: indice in `https://resend.com/docs/llms.txt`

**Quando parte.** Solo dal webhook, dopo che la transazione ha segnato l'ordine
`paid`. Mai dal checkout: un ordine non pagato non riceve conferme.

**Se fallisce.** L'ordine **resta valido**: è `paid` e le giacenze sono già
scalate. L'errore va nei log (`console.error` con `public_id` e stato HTTP di
Resend), e il webhook risponde comunque 200 a Stripe: il pagamento è andato a
buon fine, non c'è niente da ripetere. Nei log **mai** il token, il link o il
corpo dell'email. Il cliente ha comunque il link dalla pagina ordine (secondo
paracadute).

**Segreti.** `RESEND_API_KEY` nei segreti di Cloudflare
(`npx wrangler secret put RESEND_API_KEY`) e in locale in `.dev.vars`. Mai nel
codice, mai con prefisso `PUBLIC_`.

**Concept: modalità di prova di Resend.** Senza un dominio verificato si invia
da `onboarding@resend.dev` e Resend consegna **solo all'indirizzo dell'account**
(quello di Pietro). Per i test d'acquisto si usa quindi quell'indirizzo; con
qualsiasi altro l'invio fallisce e si vede in pratica il ramo "se fallisce".
Piano gratuito: 100 email al giorno, 3.000 al mese, 10 richieste al secondo.

**Cliente vero: si verifica il suo dominio.** Nel pannello di Resend si aggiunge
il dominio del cliente (per esempio `yanks.nl`) e si inseriscono nel suo DNS i
record SPF e DKIM indicati, più un record DMARC. Da lì il mittente diventa un
indirizzo del cliente (per esempio `ordini@yanks.nl`) e le email arrivano a
chiunque. Il codice non cambia: cambia solo il valore di `from`, che per questo
sta in una variabile d'ambiente (`EMAIL_FROM`), non nel codice.

## Il token d'accesso all'ordine — HMAC

**Il problema.** Il webhook deve mettere il token nel link dell'email, ma non
vede `sessionStorage` e non può leggerlo da nessuna parte. Quindi il token non
si conserva: **si ricalcola**.

**La regola.**
```
token = base64url( HMAC-SHA256( ORDER_TOKEN_SECRET, "order-access:v1:" + public_id ) )
```
- `public_id` è l'id dell'ordine che vede il browser
- il prefisso `order-access:v1:` dice a cosa serve la firma e ne fissa la
  versione: se un giorno la regola cambia, si passa a `v2`
- **lunghezza piena**: tutti i 32 byte dell'HMAC, 43 caratteri in base64url,
  **mai troncato**
- lo calcolano, con la stessa funzione, `api/checkout` (per rispondere al
  browser) e `api/stripe-webhook` (per il link nell'email). Una sola funzione in
  `src/lib/shop/token.ts`, testata con Vitest
- **solo Web Crypto** (`crypto.subtle`), che nei Workers c'è già. Nessuna
  dipendenza

**La verifica, in `api/order`.** Si decodifica il token da base64url; se non è
valido o non è lungo 32 byte, si rifiuta. Poi
`crypto.subtle.verify('HMAC', chiave, token, "order-access:v1:" + public_id)`,
che confronta **in tempo costante**. **Mai** ricalcolare e confrontare con
`===`: un confronto normale si ferma al primo carattere diverso, e dal tempo
di risposta si può indovinare il token un pezzo alla volta. Token sbagliato e
ordine inesistente danno la stessa risposta generica.

**Nel database non c'è niente del token**: la colonna `access_token_hash` non
esiste più. Un database rubato da solo non apre nessun ordine, perché senza il
segreto i token non si calcolano.

**Il segreto `ORDER_TOKEN_SECRET`.** Almeno 32 byte casuali. Si genera con Node,
in PowerShell:
```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```
Il valore uscito va nei segreti di Cloudflare e in locale in `.dev.vars`:
```powershell
npx wrangler secret put ORDER_TOKEN_SECRET
```
```
# .dev.vars
ORDER_TOKEN_SECRET=<il valore generato>
```
Due valori diversi per locale e produzione. Mai nel codice, mai con prefisso
`PUBLIC_`, mai nei log.

**Il limite, da sapere.** Non c'è revoca per singolo ordine: un link finito
nelle mani sbagliate resta valido. L'unica revoca è **cambiare il segreto**, e
questo invalida **tutti** i link di tutti gli ordini, compresi quelli nelle
email già inviate. Per un concept con ordini di prova va bene; per un cliente
vero, se servisse la revoca singola, si aggiungerebbe una colonna nel database.

**Perché il token non passa da Stripe.** Se fosse nel `success_url`, Stripe lo
conoscerebbe e lo conserverebbe nella sessione di pagamento. Così resta tra il
nostro server e il browser del cliente.

**Perché nel fragment, nel link dell'email.** La parte dopo `#` non viene mai
inviata al server: il token non finisce nei log di Cloudflare, né
nell'intestazione `Referer`. E passa nel body di una `POST`, non nell'indirizzo.

## Sicurezza — le regole

**Le quattro che contano di più**
1. **Il prezzo si calcola sul server.** Il browser manda solo identificativi e
   quantità. Se ti fidi del totale del browser, chiunque compra una felpa a un
   centesimo
2. **È pagato solo quando lo dice il webhook, con firma verificata.** Il ritorno
   del cliente sulla pagina di conferma non prova niente
3. **I segreti non stanno mai nel codice.** Chiavi Stripe, firma del webhook,
   chiave Turnstile, chiave Resend e `ORDER_TOKEN_SECRET` nelle variabili
   cifrate di Cloudflare. In locale in
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
Punto di partenza, da verificare in sviluppo. Uno script inline c'è di sicuro:
quello nell'`<head>` che imposta il tema prima del rendering. Si autorizza
aggiungendo il suo hash (`'sha256-…'`) a `script-src`; se lo script cambia,
l'hash va ricalcolato. Lo stesso vale per altri script inline di Astro: si passa
agli hash invece di allargare la policy. `'unsafe-inline'` sugli stili
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
- **I prodotti si scrivono una volta sola** in `merch.ts` (slug, categoria,
  prezzo, taglie, `limited`): lo script di seed ne genera il contenuto del
  database, e i prezzi scritti nell'HTML statico in build. `getProducts()`
  serve al frontend per la disponibilità; l'addebito lo calcola il server dal
  database
- **Senza JavaScript il catalogo si legge**, prezzi compresi. Per comprare serve
  JS: carrello e checkout lo dicono con un messaggio `<noscript>`

## Ordine di costruzione
1. **Fase 1**: tipi, `ShopApi`, `mock.ts`, `validate.ts` con i test
2. **Fase 2S**: catalogo, scheda prodotto, carrello, checkout e pagina ordine,
   tutti sul mock
3. **Fase 3**: D1 e migrazioni, seed da `merch.ts`, poi gli endpoint uno alla
   volta: `products`, `checkout`, `stripe-webhook` (con l'email di conferma),
   `order`
4. **Fase 4**: `http.ts` e passaggio a `live`. Acquisto completo con carta di
   prova, email di conferma ricevuta all'indirizzo di Pietro

## Nel portfolio
"Shop con acquisto senza registrazione su Cloudflare Workers e D1. Pagamenti
Stripe in modalità test con webhook a firma verificata, prezzi calcolati lato
server, anti-bot senza tracciamento, intestazioni di sicurezza restrittive.
Nessun dato di pagamento transita dall'applicazione. Costo di hosting: zero."
