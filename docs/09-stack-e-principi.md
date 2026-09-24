# Stack e principi di ingegneria — Yanks redesign

Decisioni verificate a settembre 2026. Obiettivo: tutto gratuito, poche
dipendenze, pochi punti di rottura, sito veloce e trovabile.

## Lo stack in una tabella

| Livello | Scelta | Perché |
|---|---|---|
| Framework | **Astro 6** | Genera HTML statico per ogni pagina e lingua: SEO piena, zero JavaScript di default, JS solo dove serve |
| Linguaggio | **TypeScript strict** | Gli errori saltano fuori mentre scrivi, non in produzione |
| Stile | **Tailwind CSS v4** + `@tailwindcss/vite` | Token in un solo file CSS, niente configurazione separata |
| Interattività | **TypeScript puro** in `<script>` e custom element | Niente framework UI: orologio, carrello e cursore non ne hanno bisogno |
| Animazioni | **GSAP** + ScrollTrigger + SplitText | Gratuito anche per uso commerciale, caricato solo dove serve |
| Lingue | **i18n integrato di Astro** + file JSON + helper `t()` | Nessuna libreria esterna |
| Immagini | **`astro:assets`** | Conversione in AVIF e WebP al momento della build |
| Hosting | **Cloudflare Workers** (asset statici + endpoint) | File statici illimitati, 100.000 richieste al giorno per gli endpoint |
| Database | **Cloudflare D1** (SQLite) | Stesso account, nessuna connessione esterna, nessun segreto in più |
| Pagamenti | **Stripe Checkout** in modalità test | Accessibile subito senza verifica aziendale, supporta iDEAL, webhook firmati |
| Anti-bot | **Cloudflare Turnstile** | Gratuito, senza tracciamento, niente puzzle da risolvere |
| Email ordini | **Resend** (facoltativo) | Piano gratuito sufficiente. Per il concept basta la pagina di conferma |
| Controlli | **Vitest** + `astro check` + GitHub Actions | Test sulla logica critica, verifica dei tipi a ogni push |
| Aggiornamenti | **Dependabot** | Aggiornamenti raggruppati una volta a settimana |

## Perché non le scelte di prima

**Non Netlify.** Il piano gratuito funziona a crediti mensili: quando finiscono,
vanno in pausa *tutti* i progetti dell'account. Nel 2026 ci sono segnalazioni
diffuse di deploy bloccati sui piani gratuiti anche con crediti disponibili. Orma
resta su Netlify, ma separato da Yanks.

**Non React come SPA.** Una SPA manda al browser una pagina vuota e la costruisce
col JavaScript. Per un sito di contenuti in più lingue è l'opposto di quello che
serve: SEO più debole, anteprime social vuote, più codice da scaricare.

**Non Postgres esterno.** Supabase gratuito mette in pausa i progetti inattivi:
un portfolio che nessuno apre per una settimana si ritrova col database spento.
D1 vive nello stesso account di Cloudflare.

**Non Mollie per il concept.** Mollie resta la scelta giusta per un cliente
olandese vero, ma richiede un'attività registrata. Stripe in modalità test è
accessibile subito, supporta iDEAL e firma i webhook, il che rende la verifica più
semplice e più sicura.

## Come funziona il sito

- **Tutte le pagine sono pre-generate** durante la build, una per lingua
- **Solo gli endpoint `/api/*` girano sul server**: checkout, webhook, stato
  ordine, prodotti
- Il resto sono file statici serviti dalla rete di Cloudflare, senza consumare
  richieste del piano gratuito

Conseguenza: anche se il backend avesse un problema, il sito resta in piedi.

## I limiti del piano gratuito da conoscere
- Endpoint: 100.000 richieste al giorno e 10 ms di CPU per richiesta. Per uno shop
  dimostrativo è largamente sufficiente, ma **niente pagine renderizzate sul
  server**: sono tutte statiche
- D1: limiti giornalieri sulle righe lette e scritte, e da settembre 2026 una
  query oltre il limite fallisce invece di passare. Per poche decine di prodotti
  non è un problema
- I contenuti video non vanno ospitati su Cloudflare: i termini lo vietano per i
  file grandi. I video restano su Instagram tramite embed

## Principi di ingegneria

**KISS — la soluzione più semplice che funziona**
- Nessun framework UI finché non serve davvero
- Nessun ORM: SQL scritto a mano, sempre con parametri (`prepare().bind()`)
- Nessuna libreria di stato: il carrello è un modulo con `localStorage`
- Se una funzione supera le 40 righe, probabilmente fa due cose

**DRY — una sola fonte per ogni cosa**
- Colori e font: solo in `src/styles/tokens.css`
- Orari: solo in `src/data/venue.ts`, usati da orologio, footer, pagina Visit e
  dati strutturati
- Testi: solo nei file di lingua
- Prodotti: scritti a mano solo in `merch.ts` (slug, categoria, prezzo, taglie,
  `limited`); il database si genera col seed. In modalità live l'autorità sul
  prezzo è il database, e il frontend non usa i prezzi di `merch.ts`
- Nomi e descrizioni dei prodotti: nei file di lingua, sotto `shop.products.<slug>`
- Componenti riusati: una scheda prodotto, non tre varianti simili

**YAGNI — non costruire quello che non serve ancora**
- Niente account utente, niente pannello di amministrazione, niente wishlist
- Le lingue 4, 5 e 6 arrivano quando le prime tre funzionano

**Progressive enhancement**
- Senza JavaScript il sito si legge tutto: menu, orari, indirizzo, recensioni
- Il JavaScript aggiunge orologio in tempo reale, animazioni, carrello

**Fail safe**
- Se l'orologio non parte, si vede l'orario scritto
- Se un video non carica, resta il poster
- Se il checkout non risponde, il messaggio d'errore è chiaro e non rivela dettagli

## Regole sulle dipendenze (niente casini con npm)

1. **Poche dipendenze.** Lista di partenza completa: `astro`,
   `@astrojs/cloudflare`, `tailwindcss`, `@tailwindcss/vite`, `gsap`, `stripe`.
   In sviluppo: `wrangler`, `vitest`, `@astrojs/check`, `typescript`.
   Ogni pacchetto in più va motivato
2. **Versioni esatte.** File `.npmrc` con `save-exact=true`: niente aggiornamenti
   a sorpresa
3. **`package-lock.json` sempre nel repository**
4. **Mai `npm audit fix --force`** e mai `--legacy-peer-deps`: rompono le cose
   invece di aggiustarle
5. **Node 22 o superiore**, richiesto da Astro 6. Versione fissata in
   `.node-version` e in `package.json` alla voce `engines`
6. **Un aggiornamento alla volta**, con test e build prima del commit
7. **Dependabot** raggruppa gli aggiornamenti una volta a settimana: li approvi
   solo se la verifica automatica passa

## Verifica automatica a ogni push

GitHub Actions, gratuito sui repository pubblici:

```
npm ci  →  astro check  →  vitest run  →  astro build
```

Se uno dei quattro fallisce, il deploy non parte. Nessuna versione rotta arriva
online.

**Cosa si testa con Vitest** (solo la logica che può rompersi in silenzio):
- lo stato dell'orologio alle 01:00, 02:00, 02:15, 02:45, 03:00, 07:59, 08:00
- il calcolo del totale del carrello lato server
- che i tre file di lingua abbiano le stesse chiavi

Niente test sui componenti grafici: per quelli basta guardarli.

## Sicurezza — impostata dal primo giorno

Dettagli in `06-shop-architecture.md`. In sintesi:
- intestazioni HTTP in `public/_headers`, CSP restrittiva compresa
- segreti solo nelle variabili cifrate di Cloudflare; in locale in `.dev.vars`,
  escluso da git
- validazione lato server di ogni input
- totale sempre ricalcolato sul server
- webhook Stripe con verifica della firma
- Turnstile sul checkout
- nessun dato di pagamento, nessuna password, nessun account
- embed esterni caricati solo al click
