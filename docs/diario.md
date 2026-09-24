# Diario di lavoro

Aggiornato da Claude Code alla fine di ogni sessione, voce più recente in alto.
Serve a Pietro per riprendere il filo, e a Claude nella chat su claude.ai per
sapere a che punto è il progetto senza dover ricostruire tutto.

Formato di ogni voce:

```
## AAAA-MM-GG — Fase X, [pezzo]
Fatto:        cosa è stato completato
Decisioni:    scelte prese e perché
Problemi:     cosa non funziona o è rimasto in sospeso
Prossimo:     il passo successivo
Ramo/commit:  nome del ramo e messaggio dell'ultimo commit
```

---

## 2026-09-24 — Prima della Fase 0, chiusi i due problemi aperti
Fatto:        aggiornati CLAUDE.md, 03, 04, 06, 09 con le due decisioni sotto.
              Nessun codice dell'applicazione
Decisioni:    1. CHIUSO — token e Stripe: il token non passa mai da Stripe.
                 createCheckout restituisce id e token, salvati in
                 sessionStorage prima del redirect; success_url è
                 /[lang]/shop/order senza parametri. Se sessionStorage è vuoto
                 si rimanda al link nell'email (fragment #id=…&t=…). Ordine
                 pending → "pagamento in verifica" e nuovo controllo per qualche
                 secondo
              2. CHIUSO — prezzi senza JS: prezzi nell'HTML statico in build da
                 merch.ts; un prezzo si cambia solo in merch.ts + seed + nuova
                 pubblicazione. Il JS aggiorna la disponibilità. Addebito sempre
                 dal database. Senza JS il catalogo si legge; per comprare serve
                 JS, con messaggio <noscript>
Problemi:     - la decisione 1 si appoggia all'email di conferma, ma 06 e 09 la
                danno ancora come facoltativa (Resend). Da decidere se diventa
                obbligatoria, e con quale strumento
              - MCP cloudflare-docs ancora da ricontrollare
Prossimo:     Fase 0 di docs/04-build-plan.md, prima il piano
Ramo/commit:  docs/decisioni-contratto — "Docs: token fuori da Stripe, prezzi
              nell'HTML statico", poi merge su main

## 2026-09-24 — Prima della Fase 0, allineamento documenti
Fatto:        letti CLAUDE.md e docs/. Risolte cinque incongruenze aggiornando
              CLAUDE.md, 02, 03, 04, 05, 06, 09. Nessun codice dell'applicazione
Decisioni:    1. ShopApi ha tre funzioni: getProducts, createCheckout, getOrder
              2. merch.ts unica fonte scritta a mano (slug, categoria, prezzo,
                 taglie, limited), DB generato col seed; in live l'autorità sul
                 prezzo è il DB e il frontend non usa i prezzi di merch.ts
              3. nomi e descrizioni in i18n: shop.products.<slug>.name/.description
              4. pagina ordine /[lang]/shop/order#id=…&t=…, token nel fragment;
                 la pagina chiama POST /api/order con id e token nel body
              5. tema: scelta salvata, poi orario Amsterdam (scuro 20:00–08:00);
                 script inline nell'head prima del rendering, hash nella CSP
Problemi:     - l'MCP cloudflare-docs non si è connesso (timeout): da ricontrollare
              - da decidere in Fase 3: come arrivano id e token alla pagina ordine
                dopo Stripe (nel success_url passerebbero da Stripe)
              - in live i prezzi del catalogo arrivano solo via getProducts(),
                quindi senza JavaScript non si vedono: va bene o serve un ripiego?
Prossimo:     Fase 0 di docs/04-build-plan.md, prima il piano
Ramo/commit:  docs/decisioni-contratto — "Docs: decisioni su ShopApi, prezzi,
              nomi prodotti, pagina ordine e tema"
