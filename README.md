# Yanks Indian Club — concept redesign

Redesign **non ufficiale** del sito di Yanks Indian Club, coffeeshop sul Dorpsplein di
Zandvoort (NL), con uno shop di merch funzionante in modalità di prova. Progetto
personale da portfolio: non è un lavoro commissionato, non è affiliato né approvato
da Yanks Indian Club.

**Online**: https://yanks-redesign.pietro-costa25.workers.dev (nl, en, de)

## Stato (2026-10-21)

| Fase | Stato |
|---|---|
| 0 · Progetto e deploy | fatta |
| 1 · Fondamenta: stile, lingue, dati, contratto dello shop | fatta |
| 2A · Sito: header, footer, home, Visit, Menu, Know before you go | fatta, con Story e video dell'hero; mancano le recensioni video (servono i reel) |
| 2S · Shop sui dati finti: catalogo, scheda, carrello, checkout, ordine | fatta, compreso il pannello laterale del carrello |
| 3 · Backend dello shop: D1, Stripe, Turnstile, Resend | fatta |
| 4 · Collegamento mock → live | fatta: shop vero online, in modalità test, acquisto completo verificato |
| 5 · Animazioni | in parte: titoli, blocchi, cursore, carrello, footer. Mancano nastro con l'orario e sezioni che si incastrano |
| 5C · Design definitivo, variante C | deciso il 2026-10-21, da applicare pagina per pagina |
| 5S · Shop pronto per un locale (iDEAL, email al negozio, pagine legali, test dei flussi) | da fare |
| 6 · Rifinitura, SEO, sicurezza | in parte: intestazioni A+ e CSP con hash. Mancano Lighthouse, JSON-LD, sitemap, Open Graph, informativa privacy |
| 6P · Proposta al locale (email e documento NL/EN) | da fare, per ultima |
| 7 · Altre lingue (it, fr, es) | da fare, servono traduzioni rilette |

Dettaglio fase per fase in `docs/04-build-plan.md`, cronologia in `docs/diario.md`.

## Stack

Astro 7 con TypeScript strict, pagine tutte statiche (88) · Tailwind CSS v4 (token in
CSS, niente config) · nessun framework UI: TypeScript e custom element ·
Cloudflare Workers e D1 · Stripe Checkout, Turnstile e Resend chiamati con `fetch`, senza
pacchetti · Vitest · deploy da GitHub. Animazioni in CSS, `IntersectionObserver`
e Web Animations API, senza librerie. Motivazioni in `docs/09-stack-e-principi.md`.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | sito in locale su `localhost:4321` |
| `npm run verify` | `astro check`, build e test: va verde prima di ogni merge |
| `npm run test:e2e` | flussi dello shop nel browser (Playwright, build mock): rifà `dist/` in modalità mock |
| `npm run build` | build in `dist/` |
| `npm run preview` | anteprima della build |

## Dove sta cosa

```text
src/
  assets/brand/   il logo, unica fonte (vedi sotto)
  assets/shop/    foto dei prodotti, una cartella per prodotto
  components/     site/ (header, footer, logo…), home/, shop/
  data/           venue.ts, menu.ts, merch.ts, reviews.ts, pages.ts
  i18n/           nl.json, en.json, de.json, t.ts
  lib/            open-status.ts, format.ts, shop/ (contratto, mock e live, validazione, carrello, endpoint)
  pages/[lang]/   le pagine, una per lingua
  scripts/        animazioni, cursore, script del tema nell'<head>
  styles/         tokens.css, fonts.css, global.css
public/           _headers (sicurezza), fonts/, favicon, brand/ (logo originale)
brand/            sorgenti e anteprime del logo
docs/             i documenti di progetto, da 00 a 10, e il diario
tests/            Vitest
```

## Il logo

Unica fonte: `src/assets/brand/`, sempre usata tramite `src/components/site/Logo.astro`
(header, hero, footer, avviso d'età, scelta della lingua). Due varianti, ognuna per
tema chiaro e scuro: **badge** completo dai 160 px in su, **solo indiano** sotto i 160 px
e come favicon. Il logo originale del locale è in `public/brand/` per il confronto.
Regole in `docs/02-design-system.md`, sezione Il marchio.

## Font: licenze per uso personale

- **Indian** (Billy Argel) e **Yankee Clipper** (Iconian) sono versioni **gratuite per uso
  personale**, usate qui solo come portfolio. Per un cliente vero serve la licenza
  commerciale. La versione personal use di Indian non ha le cifre (al loro posto c'è un
  marchio): nel sito le disegna Literata
- **TAN New York** (TanType) era stato proposto per gli h1, ma **non è nel progetto**:
  non esiste una demo gratuita distribuita dall'autore, solo la licenza a pagamento
- **Literata** e **Martian Mono** sono OFL, liberi

## Sicurezza

Quello che c'è già, e quello che arriva con il backend: `docs/06-shop-architecture.md`,
sezione Stato della sicurezza. In breve: nessun cookie, nessun dato di pagamento sul
nostro codice, CSP senza `unsafe-inline` per gli script, intestazioni di sicurezza su
ogni pagina, embed di terze parti solo al clic.

## Disclaimer

Concept redesign non richiesto. Progetto personale a scopo dimostrativo, non affiliato né
approvato da Yanks Indian Club. Logo, contenuti e immagini appartengono ai rispettivi
proprietari. I pagamenti sono in modalità test: nessuna transazione reale viene elaborata.
