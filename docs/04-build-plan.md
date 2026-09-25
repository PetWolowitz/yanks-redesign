# Piano di lavoro — Yanks redesign

## Come è organizzato

Due binari che corrono insieme, costruiti sulle stesse fondamenta:

```
                 ┌── SITO STATICO ── Home, Menu, Visit, Story, Know before ──┐
Fondamenta ──────┤                                                            ├── Animazioni ── Rifinitura ── Lingue
(Fasi 0-1)       └── SHOP FRONTEND ── catalogo, carrello, checkout (finto) ───┘
                                          │
                                          └── SHOP BACKEND ── D1, API, Stripe ── collegamento
```

**Ordine di lavoro**
1. Fondamenta comuni: progetto, deploy, stile, lingue, dati, **contratto dello shop**
2. Sito statico e frontend dello shop in parallelo. Lo shop funziona già, ma con
   dati finti: carrello vero, checkout che simula il pagamento
3. Backend dello shop: database, API, Stripe in modalità test
4. **Collegamento**: si cambia una variabile e lo shop passa dai dati finti a
   quelli veri. Nessun componente da riscrivere

**Perché così.** Il frontend dello shop non aspetta il backend, e il backend non
viene scritto al buio: entrambi rispettano lo stesso contratto, definito nella
Fase 1. È come si lavora nei team veri, dove frontend e backend partono insieme.

**Regola**: ogni fase si chiude con qualcosa che funziona, controlli automatici
verdi e un commit. Non si passa oltre con qualcosa di rotto.

---

## Fase 0 — Progetto e deploy (1 ora)

Obiettivo: un sito vuoto ma online, con tutti i controlli automatici attivi.

**Integrazioni**
Versioni esatte installate nella Fase 0 (settembre 2026):
```bash
npm install @astrojs/cloudflare@14.3.3 tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
npm install -D vitest@5.0.1 @astrojs/check@0.9.10 typescript@6.0.3 wrangler@4.140.0
```
- `typescript` resta alla 6: `@astrojs/check` 0.9.10 accetta solo la 5 o la 6
- `gsap` si installa nella fase delle animazioni, non prima
- con npm 11.0.0 l'installazione di Vitest si blocca per un bug di npm
  (`Cannot read properties of null (reading 'edgesOut')`): si usa un npm più
  recente, per esempio `npx npm@11.20.0 install`, mai `--legacy-peer-deps`
- `workerd` (arriva con wrangler) è in `allowScripts` di `package.json`, come
  `esbuild`

**Configurazione di Astro**
```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://yanks-redesign.TUO-SOTTODOMINIO.workers.dev',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  i18n: {
    locales: ['nl', 'en', 'de'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
  vite: { plugins: [tailwindcss()] },
})
```

- `imageService: 'compile'`: le immagini si convertono in build. Senza,
  l'adapter 14 usa il servizio Cloudflare Images a ogni richiesta
- `session: false`: niente sessioni, quindi l'adapter non crea l'archivio KV
- `/` rimanda a `/en/` con `src/pages/index.astro` (`Astro.redirect`). Non si
  usa `redirectToDefaultLocale`, che in build va in conflitto con quel file, e
  il file serve comunque ad `astro check`

Tailwind v4 **non usa `tailwind.config.js` né PostCSS**. Le pagine sono statiche
per impostazione predefinita; solo gli endpoint in `src/pages/api/` dichiarano
`export const prerender = false`.

**File di progetto**
```
.npmrc           save-exact=true
.node-version    24                           (major di `node -v`, pari, >= 22.12)
.env             PUBLIC_SHOP_MODE=mock        (da decidere in Fase 1: .env è nel .gitignore)
.dev.vars        segreti locali                (nel .gitignore)
tsconfig.json    "extends": "astro/tsconfigs/strict"
```

**Struttura**
```
src/
  components/
    site/        Header, Footer, OpenStatus, ThemeToggle, LangSwitch
    shop/        ProductCard, CartButton, CartDrawer, CheckoutForm
  layouts/       Base.astro
  pages/
    [lang]/      index, menu, visit, know-before, story
    [lang]/shop/ index, [slug], cart, checkout, order
    api/         products, checkout, stripe-webhook, order
  data/          venue.ts, menu.ts, merch.ts, reviews.ts
  i18n/          nl.json, en.json, de.json, t.ts
  lib/
    open-status.ts
    shop/        types.ts, api.ts, mock.ts, http.ts, cart.ts, validate.ts
  styles/        tokens.css, fonts.css, global.css
public/
  _headers
  fonts/
migrations/
scripts/         seed.ts (genera il seed del database da merch.ts)
tests/
.github/
  workflows/     check.yml
  dependabot.yml
docs/
CLAUDE.md
```

**Da fare**
- [x] `.gitignore`: `node_modules`, `dist`, `.env`, `.dev.vars`, `.wrangler`
- [x] `wrangler.jsonc` con nome del Worker e data di compatibilità
- [x] `public/_headers` con le intestazioni di sicurezza (testo in `06`)
- [x] Una pagina provvisoria `/en/` con scritto "Yanks — in costruzione"
- [x] `.github/workflows/check.yml`: `npm ci` → `astro check` → `vitest run` →
      `astro build`, con `permissions: contents: read` e cache npm.
      `vitest run --passWithNoTests` finché non ci sono test (togliere in Fase 1)
- [x] `.github/dependabot.yml`: npm, settimanale, aggiornamenti raggruppati
- [x] Repository GitHub
- [ ] Deploy su Cloudflare collegato (Pietro, docs/00 passo 4.6), poi `site`
      in `astro.config.mjs` con l'indirizzo vero

**Fatto quando**: l'indirizzo `.workers.dev` mostra la pagina provvisoria, e su
GitHub il controllo automatico è verde.

---

## Fase 1 — Fondamenta comuni (3 ore)

Obiettivo: tutto ciò che sito e shop condividono, prima di qualsiasi pagina.

**Stile**
- [ ] `tokens.css`: colori dei due temi, scala tipografica, spaziature, con `@theme`
- [ ] `fonts.css`: `@font-face` dei quattro font, `font-display: swap`, fallback
- [ ] Layout `Base.astro`: `<html lang>`, meta, `hreflang`, tema chiaro e scuro
- [ ] Script inline nell'`<head>` che imposta il tema prima del rendering: prima
      la scelta salvata, poi l'orario `Europe/Amsterdam` (scuro dalle 20:00 alle
      08:00). Il suo hash va nella CSP di `public/_headers`

**Lingue**
- [ ] `nl.json`, `en.json`, `de.json` con le stesse chiavi
- [ ] `t.ts`: helper di traduzione, cinque righe
- [ ] Test: i tre file hanno esattamente le stesse chiavi

**Dati**
- [ ] `venue.ts`, `menu.ts`, `merch.ts`, `reviews.ts` tipizzati
- [ ] `getOpenStatus(date)` in `lib/open-status.ts`, funzione pura
- [ ] Test dell'orologio alle 01:00, 02:00, 02:15, 02:45, 03:00, 07:59, 08:00, con
      date sia in ora legale sia in ora solare

**Il contratto dello shop** — il pezzo che rende possibile il lavoro in parallelo
- [ ] `lib/shop/types.ts`: `Product`, `Variant`, `CartItem`, `CheckoutRequest`,
      `CheckoutResponse`, `OrderStatus`
- [ ] `lib/shop/api.ts`: l'interfaccia `ShopApi` con tre funzioni:
      `getProducts()`, `createCheckout(req)`, `getOrder(id, token)`,
      e la scelta tra implementazione finta e vera in base a `PUBLIC_SHOP_MODE`
- [ ] `data/merch.ts`: solo slug, categoria, prezzo, taglie, `limited`. Nomi e
      descrizioni nei file di lingua, sotto `shop.products.<slug>.name` e
      `.description`
- [ ] `lib/shop/mock.ts`: implementazione finta che legge `merch.ts`, simula le
      giacenze e restituisce un ordine "pagato" dopo un finto reindirizzamento
- [ ] `lib/shop/validate.ts`: le regole di validazione di email, indirizzo e
      quantità, **usate sia dal form sia dal server**. Scritte una volta sola
- [ ] Test della validazione

**Fatto quando**: i test passano, il layout vuoto si vede nei due temi e nelle
tre lingue, e `ShopApi` in modalità finta restituisce i prodotti.

---

## Fase 2 — Sito statico e frontend dello shop (in parallelo)

Due rami di git, uno per binario. Si alterna tra i due, una sessione alla volta.

### 2A — Sito statico (12 ore)

**Struttura comune** (3 ore)
- [ ] Header: logo, navigazione, orologio, lingua, tema, icona carrello
- [ ] Orologio: orario scritto nell'HTML statico, stato in tempo reale col JS
- [ ] Footer: indirizzo, orari, social veri, disclaimer
- [ ] Menu mobile
- [ ] Redirect da `/` alla lingua del browser, con inglese come ripiego

**Home** (4 ore)
- [ ] Hero: video su desktop, poster su mobile, script sopra display
- [ ] Chi sono, breve
- [ ] Le tre cose che contano: orario, mare, terrazza
- [ ] Anteprima menu
- [ ] Anteprima dello shop: limited edition e mystery box
- [ ] Recensioni video: schede 9:16, embed al click
- [ ] Recensioni scritte: griglia sfalsata, olandese con traduzione su richiesta
- [ ] Mappa: anteprima statica, mappa vera al click

**Pagine interne** (5 ore)
- [ ] Visit: come arrivare, orari nei tre stati, mappa, regole d'ingresso
- [ ] Menu: filtri, bibite per marca, prezzo unico scritto una volta
- [ ] Know before you go: le dodici schede
- [ ] Story: solo quando c'è il testo originale

### 2S — Frontend dello shop, con dati finti (8 ore)

Tutto passa da `ShopApi`. **Nessun componente chiama `fetch` direttamente.**

- [ ] Catalogo `/[lang]/shop/`: per categoria, limited edition e mystery box
      in evidenza. Prezzi scritti nell'HTML statico in build da `merch.ts`; il
      JS aggiorna solo la disponibilità con `getProducts()`
- [ ] Senza JS il catalogo si legge; carrello e checkout mostrano un messaggio
      `<noscript>`: per comprare serve JavaScript
- [ ] Scheda prodotto `/[lang]/shop/[slug]`: foto, taglie, quantità, aggiunta
- [ ] Carrello: modulo `cart.ts` con `localStorage` dentro `try/catch`, pannello
      laterale, contatore nell'header aggiornato in tutte le pagine
- [ ] Checkout: form con email e indirizzo, validazione da `validate.ts`,
      spazio per Turnstile, riepilogo
- [ ] Checkout: `createCheckout` restituisce id e token, salvati in
      `sessionStorage` (dentro `try/catch`) prima del redirect
- [ ] Pagina di stato ordine `/[lang]/shop/order`: legge id e token da
      `sessionStorage`, oppure dal fragment `#id=…&t=…` del link nell'email, e
      chiama `getOrder(id, token)`. Se non trova niente, rimanda al link
      nell'email. Se l'ordine è `pending`, "pagamento in verifica" e nuovo
      controllo per qualche secondo
- [ ] Pagina ordine: link completo con il fragment e pulsante "Copia link"
      (`navigator.clipboard` dentro `try/catch`, link comunque selezionabile)
- [ ] Errori chiari: prodotto esaurito, campo sbagliato, servizio non raggiungibile

**Fatto quando**: in modalità finta si può fare un acquisto completo, dal
catalogo alla pagina "ordine pagato", senza backend.

---

## Fase 3 — Backend dello shop (8 ore)

Leggere `06-shop-architecture.md` prima di iniziare.

**Database**
- [ ] `npx wrangler d1 create yanks-db` e binding in `wrangler.jsonc`
- [ ] `migrations/0001_init.sql` con lo schema
- [ ] `scripts/seed.ts` che genera il seed da `merch.ts`: i prodotti si scrivono
      una volta sola
- [ ] Migrazioni applicate in locale e poi in remoto

**Endpoint**
- [ ] `api/products`: prodotti attivi e giacenze
- [ ] `api/checkout`: Turnstile verificato lato server → `validate.ts` → prezzi
      letti dal database → totale ricalcolato → giacenze controllate → ordine
      `pending` → sessione Stripe con `success_url` senza parametri → risposta
      con id, token e indirizzo di Stripe
- [ ] `api/stripe-webhook`: firma verificata → ordine `paid` e giacenze scalate
      in un'unica transazione, idempotente → poi email di conferma con Resend
      (`fetch`, `Idempotency-Key`); se fallisce, ordine valido ed errore nei log
- [ ] `lib/shop/token.ts`: token HMAC-SHA256 con Web Crypto, con i test
- [ ] `api/order`: `POST` con id e token nel body, token verificato con
      `crypto.subtle.verify` (tempo costante), mai con `===`

**Stripe e Turnstile**
- [ ] Account Stripe in modalità test, chiavi nei segreti di Cloudflare
- [ ] Webhook di Stripe verso `/api/stripe-webhook`; in locale con Stripe CLI
- [ ] Sito Turnstile creato, chiavi nei segreti
- [ ] Account Resend, `RESEND_API_KEY` nei segreti e in `.dev.vars`,
      `EMAIL_FROM=onboarding@resend.dev` (modalità di prova)
- [ ] `ORDER_TOKEN_SECRET` generato (comando in `06-shop-architecture.md`),
      valori diversi nei segreti e in `.dev.vars`

**Test obbligatori**
- [ ] Un prezzo modificato dal browser non cambia l'addebito
- [ ] L'ordine resta `pending` finché il webhook non conferma
- [ ] Lo stesso webhook due volte non scala le giacenze due volte
- [ ] Un webhook con firma sbagliata viene rifiutato
- [ ] Una quantità superiore alla giacenza viene rifiutata
- [ ] Con Resend che risponde errore l'ordine resta `paid` e il webhook
      risponde 200; nei log non compare il token
- [ ] Un token troncato, di un altro ordine o firmato con un altro segreto
      viene rifiutato con la stessa risposta di un ordine inesistente

## Fase 4 — Collegamento (1 ora)

- [ ] `PUBLIC_SHOP_MODE=live` in locale: acquisto completo con carta di prova
- [ ] Stesso test online
- [ ] Il frontend non è cambiato: se è servito toccare un componente, il
      contratto della Fase 1 era incompleto. Annotarlo

---

## Fase 5 — Animazioni (3 ore)

Leggere `08-animazioni-risorse.md` prima.
- [ ] Titoli sfalsati con SplitText (lo script Indian per parola, non per lettera)
- [ ] Nastro con l'orario, con pulsante di pausa
- [ ] Cursore custom, spento su touch
- [ ] Sezioni che si incastrano con ScrollTrigger
- [ ] Tutto spento con `prefers-reduced-motion`

## Fase 6 — Rifinitura, SEO e sicurezza (4 ore)

- [ ] Immagini con `astro:assets`, dimensioni esplicite
- [ ] Meta per pagina e per lingua, Open Graph, `hreflang`
- [ ] JSON-LD `LocalBusiness` generato da `venue.ts`
- [ ] Sitemap
- [ ] CSP rifinita: niente `unsafe-inline` dove si può evitare; hash dello script
      del tema aggiornato
- [ ] Verifica su securityheaders.com
- [ ] `npm audit`
- [ ] Lighthouse su entrambi i temi: 90+ prestazioni, 95+ accessibilità
- [ ] Navigazione completa da tastiera
- [ ] Prova da telefono vero
- [ ] Informativa privacy e condizioni di vendita
- [ ] README con il caso studio

## Fase 7 — Altre lingue

Italiano, francese, spagnolo: un file JSON in `src/i18n/` e una voce in
`astro.config.mjs` ciascuna. Se le fondamenta sono fatte bene, non si tocca un
componente.

---

## Tempo stimato

| Fase | Ore |
|---|---|
| 0 Progetto e deploy | 1 |
| 1 Fondamenta comuni | 3 |
| 2A Sito statico | 12 |
| 2S Frontend shop | 8 |
| 3 Backend shop | 8 |
| 4 Collegamento | 1 |
| 5 Animazioni | 3 |
| 6 Rifinitura | 4 |
| **Totale** | **circa 40** |

Tre-quattro settimane senza forzare.

## Trappole note

- **Fuso orario**: stesso fuso tra Italia e Paesi Bassi, ma chi guarda da Londra
  è un'ora indietro. Sempre `Europe/Amsterdam`
- **Ora legale**: il cambio d'ora di fine ottobre e fine marzo fa saltare i
  calcoli fatti a mano. Per questo si usa `Intl` e si testa in entrambi i periodi
- **Tailwind v4**: se Claude Code propone `npx tailwindcss init -p` o un
  `tailwind.config.js`, fermalo
- **Pagine renderizzate sul server**: consumano la quota gratuita. Tutto statico,
  tranne `/api/*`
- **Componenti che chiamano `fetch`**: rompono il contratto. Tutto passa da
  `ShopApi`
- **Validazione duplicata**: le regole stanno in `validate.ts`, usate dal form e
  dal server. Mai riscriverle
- **Dipendenze**: nessun pacchetto nuovo senza chiedere. Mai `--force` o
  `--legacy-peer-deps`
- **Video**: un solo autoplay per schermata, poster su mobile
- **Dark mode**: mai invertire i colori in automatico
- **Embed esterni**: solo al click
- **Chiavi**: tutto ciò che inizia con `PUBLIC_` arriva al browser. I segreti mai
