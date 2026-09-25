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

## 2026-09-25 — Prima della Fase 0, email di conferma obbligatoria
Fatto:        aggiornati CLAUDE.md, 04, 06, 09, 10. Aggiunti .dev.vars e
              .wrangler/ al .gitignore (erano previsti in Fase 0, ma la chiave
              Resend va in .dev.vars). .mcp.json NON modificato (vedi Problemi)
Decisioni:    CHIUSO — email di conferma: obbligatoria, con Resend chiamato via
              fetch a https://api.resend.com/emails, nessun pacchetto npm.
              - parte dal webhook, dopo la transazione che segna l'ordine paid
              - RESEND_API_KEY nei segreti Cloudflare e in .dev.vars;
                mittente in EMAIL_FROM
              - Idempotency-Key "order-confirmation/<public_id>" contro i
                webhook ripetuti
              - se fallisce: ordine resta paid, webhook risponde 200, errore
                nei log con public_id e stato HTTP, mai token né corpo
              - testi in email.confirmation.* dei file di lingua; aggiunta la
                colonna orders.lang per lingua e link
              - concept in modalità di prova (onboarding@resend.dev, consegna
                solo all'indirizzo di Pietro); cliente vero: dominio verificato
                con SPF, DKIM e DMARC, cambia solo EMAIL_FROM
              - secondo paracadute: la pagina ordine mostra il link completo
                col fragment e un pulsante "Copia link"
              - MCP Resend (https://mcp.resend.com/mcp) personale come Stripe,
                solo per controllare invii e log
Problemi:     - NUOVO, da decidere prima della Fase 3: il webhook deve mettere
                il token nel link dell'email, ma nel DB c'è solo l'hash.
                Proposta in docs/06: token = HMAC-SHA256(ORDER_TOKEN_SECRET,
                public_id), ricalcolabile da checkout, webhook e api/order;
                via la colonna access_token_hash. Da confermare
              - .mcp.json: richiesto di aggiornarlo, ma l'MCP di Resend accede
                all'account e docs/10 tiene fuori dal repository gli MCP con
                account (come Stripe). Lasciato com'è: da confermare
Prossimo:     decidere sul token HMAC, poi Fase 0 di docs/04-build-plan.md
Ramo/commit:  docs/email-conferma — "Docs: email di conferma obbligatoria con
              Resend", poi merge su main

## 2026-09-25 — Prima della Fase 0, tolto l'MCP cloudflare-docs
Fatto:        rimosso cloudflare-docs da .mcp.json (e dalla lista locale in
              .claude/settings.local.json, fuori da git). Aggiornati
              CLAUDE.md, docs/00 e docs/10
Decisioni:    CHIUSO — MCP cloudflare-docs: il server risponde "Dynamic Client
              Registration rejected (HTTP 404)", incompatibilità client/server
              non risolvibile da noi. La documentazione Cloudflare si legge dal
              web: developers.cloudflare.com/<prodotto>/llms.txt come indice,
              pagine in Markdown con index.md. Resta obbligatorio verificare
              lì prima di scrivere config per Workers, D1, Turnstile, wrangler
Problemi:     - ancora aperto: email di conferma obbligatoria o no, e con quale
                strumento (vedi voce precedente)
Prossimo:     Fase 0 di docs/04-build-plan.md, prima il piano
Ramo/commit:  docs/rimuovi-cloudflare-mcp — "Docs: tolto MCP cloudflare-docs,
              documentazione Cloudflare dal web", poi merge su main

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
