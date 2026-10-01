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

## 2026-10-01 — Pagina Story
Fatto:        /[lang]/story/: cronologia (apertura, 1995 registrazione, il motto
              Home of the Medicine Man col cappellino, oggi al Dorpsplein 2),
              testi nl/en/de, voce "Verhaal" nella navigazione e nel footer.
              Navbar: spazio tra le voci 16 px sotto i 1280 px, così il tedesco
              ci sta a 1024
Decisioni:    anni da venue.ts (un numero solo da cambiare); nessun testo
              promozionale, solo fatti
Problemi:     il ricamo sul cappellino (cap/2.jpg) dice 1984, non 1989: anno da
              riconfermare con Pietro. PR non unita finché non risponde
Prossimo:     pannello laterale del carrello, recensioni video
Ramo/commit:  feat/pagina-story

## 2026-10-01 — Ritocchi di layout, prezzi delle bevande
Fatto:        prezzi aggiornati da Pietro (caffè, espresso e tè 3,00; le altre
              bevande calde 3,50; bibite 3,50) in menu.ts e docs/03. Margine
              laterale unico --page-x (20-56 px) con utility px-page su tutti i
              contenitori. Navbar allineata a sinistra. Footer riordinato su 12
              colonne (logo e indirizzo, orari, pagine, lingue, social, poi
              disclaimer). Ombra morbida sopra ogni sezione e sopra il footer.
              Hero: Yanks centrato, più staccato dal motto, "Sinds 1989" sotto.
              Tolto il tremolio al neon dei titoli, l'entrata laterale resta
Decisioni:    - quali bevande a 3,00 e quali a 3,50: interpretazione di "da 3 a
                3,5" (le semplici 3,00, quelle con latte o panna 3,50)
Problemi:     npm audit fix ancora da fare a server spento
Prossimo:     pagina Story, pannello laterale del carrello, recensioni video
Ramo/commit:  design/ritocchi-layout

## 2026-10-01 — h1 in Indian, titoli al neon, documenti e sicurezza
Fatto:        h1 in Indian (il font più vicino alla scritta del logo, che non è
              un font), h2 e h3 di nuovo in Yankee Clipper maiuscolo; la riga
              dell'hero in Yankee Clipper. Titoli che entrano di lato e poi si
              accendono come un neon (sola opacity, una volta); tutte le
              animazioni più lente (titoli 1.1-1.4 s, blocchi 1.1 s, volo nel
              carrello 1 s). README del progetto riscritto (stato, stack,
              struttura, logo, font per uso personale, sicurezza);
              src/assets/brand/LEGGIMI.md; CLAUDE.md, docs/02, 04, 06, 08.
              Sicurezza verificata online; wrangler 4.140.0 → 4.145.0
              (vulnerabilità di undici). 81 pagine senza sforamenti
Decisioni:    - navbar e favicon restano con il solo indiano (Pietro)
              - niente GSAP: neon e entrata laterale in CSS
              - docs/06 ha ora la sezione "Stato della sicurezza"
Problemi:     - npm audit: 4 segnalazioni restano (undici dentro
                @astrojs/cloudflare, strumenti di build): npm audit fix fallisce
                con EBUSY perché astro dev di Pietro tiene aperti i file. Da
                rifare a server spento
              - style-src 'unsafe-inline' resta per gli attributi style
Prossimo:     npm audit fix a server spento; Fase 3 (backend dello shop)
Ramo/commit:  design/h1-indian-neon

## 2026-10-01 — Logo nuovo: il timbro (Logo1) nel sito
Fatto:        Pietro ha scelto Logo1.png (il timbro della proposta 01: "Yanks"
              in corsivo, indiano con fascia e piuma, anello aperto, onde).
              Vettorializzato con la palette dei token, fondo piatto, SVGO
              (16-25 KB). Varianti badge e solo indiano, chiara e scura, in
              src/assets/brand/. Logo.astro: badge dai 160 px (hero 448,
              footer 160, avviso d'età 160, scelta lingua 160), solo indiano
              nell'header (56) e come favicon (svg + ico 16/32/48). Tolto il
              vecchio PNG; l'originale del locale resta in public/brand/.
              Confronto in brand/anteprima/confronto-logo.png. "Since 1989"
              confermato: venue.founded = 1989, docs/03. verify verde
Decisioni:    - il badge Canva (ramo brand/logo-nuovo) e la prima proposta
                (brand/logo-badge) restano non uniti, superati da Logo1
              - nel tema scuro le versioni hanno un anello crema esterno nel
                file stesso: tolto l'anello aggiunto via CSS
Problemi:     - font TAN New York: nessuna demo gratuita ufficiale; i
                download portano alla licenza a pagamento su Creative Market,
                le copie dirette sono ridistribuzioni non autorizzate. In
                attesa di Pietro (licenza o alternativa OFL)
Prossimo:     decisione sul font degli h1; poi Fase 3
Ramo/commit:  brand/logo-timbro — "Logo nuovo: il timbro nel sito"

## 2026-09-29 — Font dei titoli invertiti; logo nuovo in anteprima
Fatto:        h1 in Yankee Clipper maiuscolo ("YANKS" compreso), h2 e h3 in
              Indian, mai in maiuscolo. Token rinominati per font:
              font-sign (Yankee Clipper), font-script (Indian). Indian senza
              cifre (unicode-range, le fa Literata); font-size-adjust 0.56.
              Schede della home che si allungavano: corrette. 81 pagine
              controllate a 360/390/1440 px in nl/en/de: nessun titolo sfora.
              Logo a badge: vettorializzato e montato, anteprima in
              brand/anteprima/ (ramo brand/logo-badge), NON sostituito
Decisioni:    - Indian personal use: al posto delle cifre c'è il marchio
                "PERSONAL USE · COMPLETE SET". Vale per sito e logo
              - Indian in maiuscolo non si legge: "Zandvoort", non "ZANDVOORT"
              - opentype.js scrive NaN nella "o" di Indian: i glifi del logo si
                disegnano dal contorno grezzo (scratchpad, glyph.mjs)
Problemi:     - logo: la riga piccola non si legge sotto i 96 px (header):
                proposta a Pietro, in attesa della sua scelta
              - "Since 1989": docs/03 ha ancora l'anno DA VERIFICARE; la fonte
                è il ricamo "1989" sul cappellino di shop.yanks.nl
Prossimo:     scelta di Pietro sul logo (A o B, versione per l'header)
Ramo/commit:  design/font-titoli-invertiti

## 2026-09-29 — Design: schede, animazioni, cursore, neon, angoli arrotondati
Fatto:        richieste di Pietro. Schede nuove (catalogo, anteprima shop,
              recensioni, blocchi della home): angoli arrotondati, foto con
              zoom, pillole su foto e prezzo, ombra piena sfalsata al
              passaggio. Angoli arrotondati ovunque (36 elementi). Neon
              acceso su tavola scura anche nel tema chiaro. Hero: "Yanks"
              rosso, "Home of the Medicine Man" nero opaco. Titoli h1-h3 in
              ingresso sfalsati, blocchi che salgono, volo della foto nel
              carrello con salto del numero, lettere del footer che si
              scompongono, cursore personalizzato, freccia per tornare su.
              verify verde, 183 test
Decisioni:    - niente GSAP: CSS, IntersectionObserver e Web Animations API
                bastano, nessuna dipendenza nuova (docs/08)
              - senza JS e con reduced motion si vede tutto e non si muove
                niente; rete di sicurezza: titoli visibili dopo 2.5 s se lo
                script non parte; niente lampi su ciò che è già a schermo
              - font: Indian resta per gli h1 (e "Yanks"), Yankee Clipper per
                h2, h3 e il resto, come in CLAUDE.md
              - regole nuove in docs/02 (angoli, ombre, neon, hero, Movimento)
                e in CLAUDE.md (Animazioni). theme-init.js mette data-js:
                hash della CSP aggiornato
Problemi:     - in una prova Playwright la pagina è scorsa da sola; non si
                riproduce e il codice non scorre: probabilmente input reale
                sulla finestra visibile del browser di test
              - da fare con GSAP, se servirà: nastro con l'orario, sezioni che
                si incastrano
Prossimo:     come prima: Fase 3, lingue it/fr/es, spedizione, colori
Ramo/commit:  design/card-animazioni-cursore

## 2026-09-29 — Shop, merch completo e immagini di shop.yanks.nl
Fatto:        esplorato shop.yanks.nl (27 prodotti, 81 foto, 30 immagini in
              home). merch.ts da 16 a 21 prodotti, categoria Accessori;
              galleria con tutte le foto nella scheda prodotto; descrizioni
              riscritte da quelle del negozio. Logo in alta risoluzione
              (3200 px) al posto di quello da 232 px, grande nell'hero.
              Esterno del locale a tutta larghezza in home e Visit, interno
              accanto a "chi sono". 88 pagine, 182 test
Decisioni:    esclusi di nuovo i 7 accessori per la cannabis; profumo in due
              prodotti (Original, High Tides); escluse le foto con il modello
              e gli interni con gli schermi del menu. Dettagli in docs/03
Problemi:     colori dei prodotti ancora non selezionabili
Prossimo:     come nella voce precedente (decisioni su Fase 3, GSAP, lingue,
              spedizione)
Ramo/commit:  shop/merch-completo — "Shop: tutto il merch e le immagini di
              shop.yanks.nl"

## 2026-09-28 — Fasi 2A e 2S in autonomia: sito statico e frontend dello shop
Fatto:        PR #3 footer (indirizzo, orari, pagine, lingue, social,
              disclaimer di docs/05) e / verso la lingua del browser.
              PR #4 home: hero tipografico, chi sono, terrazza, orario,
              spiaggia, anteprime di menu e shop, tre recensioni Google,
              mappa al clic. PR #5 Visit, Menu, Know before you go, e cifre
              di Yankee Clipper passate a Impact. PR #6 catalogo, scheda
              prodotto, carrello (cart.ts), contatore nell'header. PR #7
              checkout e pagina ordine: acquisto completo in modalità mock.
              Tutte unite con check e Workers Builds verdi. 73 pagine,
              167 test, nessun link interno rotto (test nuovo)
Decisioni:    - materiali dal sito attuale: foto della terrazza, testi delle
                dodici schede, recensioni; foto e taglie dei prodotti da
                shop.yanks.nl/products.json (S-3XL, cappellino, beanie).
                Scelte ed esclusioni in docs/03
              - hero senza video: il sito attuale non ne ha e la foto larga
                mostra il menu della cannabis. Logo a 232 px al massimo
              - recensioni: 3 su 5, escluse quelle che nominano prodotti di
                cannabis; niente nomi; nessuna traduzione senza rilettura
              - Story ancora fuori: il testo di our-story è promozionale
              - Yankee Clipper senza cifre (unicode-range): l'8 sembrava 0,
                "18" si leggeva "10". Regola in docs/02
              - h1 della scheda prodotto in Yankee Clipper (nomi lunghi)
              - prezzi con Intl (formatPrice), sempre da centesimi
              - catalogo per il browser preparato in build e passato in un
                attributo data- (non script inline: CSP)
              - mappa e futuri embed con ClickToLoad (iframe solo al clic)
              - in Visit niente auto: parcheggi DA VERIFICARE
Problemi:     - DA RECUPERARE (docs/03): video e poster dell'hero, indirizzi
                dei reel Instagram, logo vettoriale, anno di apertura
              - carrello senza pannello laterale (solo pagina e contatore)
              - costi di spedizione non definiti: il checkout non li mostra
              - foto dell'abbigliamento con sfondi "tribali" (tende): sono
                del cliente, per un uso reale andrebbero rifatte
              - testi nl e de, schede di Know before you go comprese, DA
                RILEGGERE da un madrelingua
              - nei test Playwright, locator.click() dopo un focus che fa
                scorrere la pagina può cadere sui link dell'header fisso:
                usare requestSubmit() o mouse.click() su coordinate fresche
Prossimo:     decisioni di Pietro: Fase 3 (Stripe, D1, Resend, segreti),
              GSAP per la Fase 5, lingue it/fr/es con rilettura, costi di
              spedizione. Poi i controlli manuali approfonditi tutti insieme
Ramo/commit:  PR #3-#7 unite su main; questo diario su docs/diario-fase-2

## 2026-09-28 — Fase 2A, tema scuro, orologio al neon, logo originale
Fatto:        tema scuro ritarato (bg #1F1B17, surface #2A251F, text
              #DDD2C0). Orologio a insegna al neon con tre token --neon-* per
              tema, alone solo nello scuro, tremolio all'accensione. Logo
              originale scaricato da yanks.nl (YANKS_rond-copy.png, 232 px)
              in public/brand/yanks-originale.png e messo nell'header.
              docs/02 aggiornato. npm run verify verde, 67 test su 67.
              Playwright: 24 casi su 24 ok, contrasti letti dalla pagina
Decisioni:    - text scuro 11.45:1 su bg (richiesta: tra 10 e 13), 10.16 su
                surface; tutte le coppie sopra 4.5 (la più bassa: --red su
                surface, 4.80). Tabella in docs/02
              - neon chiaro: verde #176B37 (il primo, #1D7A40, faceva 4.27
                su sabbia), ambra #8A5700, rosso #B3261E
              - l'alone al neon è l'unica ombra ammessa nel sito (docs/02)
              - tremolio: 1.2 s, una volta, solo opacity, tre cali di luce,
                meno di tre lampi al secondo; niente con reduced motion; i
                cambi di stato dopo l'accensione non tremano
              - logo come <img> da public/ (40 KB PNG), non con astro:assets:
                così resta il file di riferimento citato da docs/07. WebP e
                astro:assets nella Fase 6
              - poi, su richiesta: tabella colori di CLAUDE.md allineata a
                docs/02 (con i --neon-*); anello crema di 2 px intorno al
                logo solo nel tema scuro (outline in --text, 11.45:1 sul
                fondo). Playwright rifatto: 24 casi su 24 ok
              - age gate approvato da Pietro e fatto: components/site/
                AgeGate.astro, <dialog> modale; theme-init.js mette anche
                data-age="ask"/"ok" (hash CSP aggiornato); si salva solo il
                sì; "Nee" mostra una frase e "Ik vergiste me". Test
                tests/theme-init.test.ts (lo script vero in un contesto
                finto). Regole in CLAUDE.md e docs/06
              - cookie: nessuno. Nessun Set-Cookie nelle risposte, nel codice
                solo localStorage (tema scelto, ordini finti del mock)
Problemi:     - design-guidelines.md nei Download contraddice CLAUDE.md
                (Inter, tema di default, grigi, cookie banner, calm mode,
                age gate, Yankee Clipper negli h1): non adottato
Prossimo:     Pietro approva la PR; decisione sull'age gate; poi la home
Ramo/commit:  sito/tema-scuro-neon-logo — "Anello del logo nel tema scuro,
              colori in CLAUDE.md" e "Avviso d'età 18+": PR #2, unita
              il 2026-09-28

## 2026-09-28 — Fase 2A, header e navigazione
Fatto:        components/site: Header, OpenStatus, ThemeToggle, LangSwitch;
              header in Base.astro per tutte le pagine. minutesUntilChange()
              in lib/open-status.ts con i test (mezzanotte, ora legale e
              solare, notti del cambio d'ora). t() con segnaposto {nome} e
              test che siano uguali nelle tre lingue. docs/02: corretta la
              contraddizione sull'orologio su mobile. docs/07 (prompt dei
              loghi) aggiornato e unito. npm run verify verde, 67 test su 67.
              Playwright sulla build: nl/en/de × 390/1024/1280/1440 × chiaro/
              scuro, 24 casi su 24 ok; menu ☰, Esc, tema dal menu, Tab,
              "salta al contenuto" e pagina senza JS provati a mano
Decisioni:    - desktop da 1024 px; tra 1024 e 1280 l'orologio mostra solo
                icona e stato (prop compact). Misurato: in tedesco, con
                "Nur zum Mitnehmen · schließt in 23 Min.", a 1024 px la
                fascia completa sforava di 138 px
              - mobile: orologio in una striscia sotto la fascia, sempre
                visibile; menu ☰ con popover, funziona senza JS
              - Story fuori dalla navigazione finché la pagina non esiste
              - conto alla rovescia: avanza un minuto alla volta chiedendo lo
                stato a getOpenStatus, così mezzanotte e cambi d'ora sono già
                gestiti. Nell'header solo in "solo asporto" ("chiude tra N
                min"); aperto "fino alle 02:00", chiuso "apre alle 08:00"
              - la notte del ritorno all'ora solare la fascia 02:00-02:45
                capita due volte e l'orologio segue il muro: solo asporto,
                chiuso per 15 minuti, di nuovo solo asporto. Accettato
              - vite.build.assetsInlineLimit: 0. Astro metteva inline gli
                script piccoli, e la CSP (senza unsafe-inline) li bloccava:
                ora sono file in /_astro/, coperti da 'self'
              - variante dark: di Tailwind legata a data-theme, non al tema
                del sistema
              - nomi delle lingue nella loro lingua in locales.ts
                (languageNames); link con lang, hreflang, aria-current
Problemi:     - LOGO ORIGINALE NON TROVATO. Nei Download non c'è
                YANKS_rond-copy…; ci sono due PNG "il-logo-originale-disco-
                nero-…" creati oggi, ma sono immagini generate (onde della
                proposta 01, scritta "ORITTLE" sulla collana), non l'originale.
                public/brand/ non esiste: nell'header c'è la scritta "Yanks"
                in Indian come segnaposto. docs/07 cita già il percorso
              - i link del menu (menu, visit, shop, know-before) e del
                carrello portano a pagine non ancora fatte (404)
              - il numero nel carrello arriva con cart.ts (Fase 2S)
              - Chrome segnala il preload di Martian Mono come "non usato",
                ma il font si scarica una volta sola dal preload e risulta
                caricato: falso allarme, c'era già dalla Fase 1
              - testi nl e de dell'header da rileggere da un madrelingua
              - nel browser di Playwright era aperta una scheda di
                adtrafficquality.google: non viene dal sito (la CSP non lo
                permetterebbe), probabilmente dal profilo del browser MCP
Prossimo:     logo originale in public/brand/, poi la home (Fase 2A)
Ramo/commit:  sito/fase-2a-header — "Fase 2A: header e navigazione"

## 2026-09-28 — Fase 1, orologio, dati e contratto dello shop
Fatto:        cancellata la prova di stile non tracciata (src/pages/en/).
              src/data: venue.ts, menu.ts, merch.ts, reviews.ts.
              lib/open-status.ts: getOpenStatus(date) su Europe/Amsterdam,
              testato alle 7 ore richieste in ora legale e solare, più la
              notte del cambio d'ora e la mezzanotte. lib/shop: types.ts,
              api.ts (ShopApi, tre funzioni), mock.ts, validate.ts.
              Testi di menu e prodotti in en/nl/de. npm run verify verde,
              54 test su 54
Decisioni:    - PUBLIC_SHOP_MODE con astro:env (envField.enum, default
                mock): niente .env da creare in CI e su Cloudflare, un valore
                sbagliato blocca la build. live lancia un errore finché non
                c'è http.ts (Fase 4)
              - prezzi in centesimi interi (priceCents), come nel database
              - SKU = slug + taglia ("hoodie-m"), solo slug per la taglia
                unica: skuOf() in merch.ts, una regola sola
              - ShopError in types.ts, non in api.ts: evita un import
                circolare con mock.ts
              - validateCheckout accetta qualsiasi input e restituisce la
                richiesta pulita o gli errori per campo; scarta i campi in
                più (un prezzo mandato dal browser sparisce). CAP controllato
                per paese; paesi di spedizione: NL BE LU DE AT FR IT ES
              - mock: ordini in localStorage (con ripiego in memoria),
                pending per 2 secondi poi paid; giacenze finte con un
                esaurito (skull-t-shirt-xl) e due quasi finiti
              - menu: nomi da tradurre nei file di lingua, marchi delle
                bibite nei dati (nomi propri)
Problemi:     DA VERIFICARE, scritti nei dati come null o con un commento:
              - taglie dell'abbigliamento (messe S, M, L, XL)
              - prezzi di tosti, pizza e bevande funzionali (null)
              - "tosti vlam" lasciato non tradotto; "con panna" letto come
                cioccolata con panna; "Zippers" tradotto come felpa con zip
              - descrizioni dei prodotti: frasi minime ricavate dal nome,
                da rileggere (nl e de anche da un madrelingua)
              - reviews.ts vuoto: mancano i testi delle cinque recensioni
                Google del sito originale
Prossimo:     merge su main e push; poi Fase 2A (descrivere il layout
              dell'header prima di scriverlo)
Ramo/commit:  sito/fase-1-dati-e-shop — "Fase 1: dati del menu e contratto
              dello shop", unito su main il 2026-09-28 (GitHub e Workers
              Builds verdi)

## 2026-09-28 — Fase 1, lingue: verifica e merge
Fatto:        verifica Playwright della build (astro preview) su /nl/, /en/,
              /de/ a 390 e 1440 px, tema chiaro e scuro: 12 casi su 12 ok.
              <html lang> giusto, canonical e 4 hreflang (nl, en, de,
              x-default=en) assoluti con barra finale, CSP presente, console
              pulita, niente scroll orizzontale. npm run verify verde (11/11).
              Merge su main, push; GitHub Actions e Workers Builds verdi,
              /de/ online con lang="de"
Decisioni:    verifica fatta su un worktree pulito del commit, non sulla
              cartella di lavoro (vedi Problemi)
Problemi:     - testi nl e de ancora DA RILEGGERE DA UN MADRELINGUA
Prossimo:     Fase 1 punto 3, partendo da un piano
Ramo/commit:  sito/fase-1-lingue — "Fase 1: lingue, verify e ruoli dei font",
              unito su main ("Merge ramo sito/fase-1-lingue")

## 2026-09-25 — Fase 1, lingue (unita su main il 2026-09-28)
Fatto:        src/i18n/locales.ts (unica lista delle lingue, usata anche da
              astro.config.mjs), en/nl/de.json a chiavi piatte, t.ts,
              pagina src/pages/[lang]/index.astro (/nl/, /en/, /de/),
              Base.astro con canonical, hreflang e x-default,
              tests/i18n.test.ts. Nello stesso ramo: script verify, ruoli dei
              font (h2/h3 maiuscolo, preload Martian Mono), struttura della
              navigazione in docs/02. npm run verify verde, 11 test su 11
Decisioni:    chiavi piatte; hreflang calcolati dall'URL reale della pagina
              (con barra finale), non dagli helper di astro:i18n
Problemi:     - testi nl e de scritti da Claude: DA RILEGGERE DA UN
                MADRELINGUA PRIMA DI MOSTRARE IL SITO
              - manca la verifica Playwright (3 lingue, 390/1440, due temi):
                sessione interrotta per limite d'uso
Prossimo:     verifica Playwright, poi merge su main, push, controllo CI
Ramo/commit:  sito/fase-1-lingue — "Fase 1: lingue, verify e ruoli dei font"
              (non ancora unito)

## 2026-09-25 — Documenti, regole d'ingresso e provider di pagamento
Fatto:        chiusi i tre contrasti della voce precedente. docs/03: regole
              d'ingresso riscritte, tolti cannabisMenuUrl e il link al menu
              esterno. docs/05: nota sul provider di pagamento
Decisioni:    1. CHIUSO — residenza: il sito non ne parla, né in un senso né
                 nell'altro. Pubblicata solo "ingresso dai 18 anni con
                 documento valido". Criterio I di Zandvoort e verifica di
                 persona (turisti ammessi in pratica) restano in docs/03 come
                 contesto, marcati NON PUBBLICARE. Anche 5 grammi e niente
                 alcol spostati lì: sono regole di vendita, non d'ingresso
              2. CHIUSO — nessun link al menu della cannabis
              3. CHIUSO — nel portfolio, accanto alla verifica con il comune:
                 per un uso reale va verificata l'accettazione con il provider
                 di pagamento (Stripe esclude le attività legate alla
                 cannabis). Il portasigarette resta nel merch
Problemi:     nessuno nuovo
Prossimo:     Fase 1 punto 2 (i18n) sul ramo sito/fase-1-lingue, insieme a
              verify, ruoli dei font e struttura della navigazione in docs/02
Ramo/commit:  docs/ingresso-e-pagamenti — "Docs: regole d'ingresso, niente
              menu cannabis, provider di pagamento", poi merge su main

## 2026-09-25 — Documenti, fonti di Zandvoort e merch senza accessori
Fatto:        docs/03: tolta gmb-2026-274642 (pubblicazione della stessa
              politica di Wageningen); aggiunta e verificata CVDR625741,
              Coffeeshopbeleid 2019 di Zandvoort, separata dall'esempio di
              Wageningen. Merch: tolti Glass Tips, Rolling Tray, Metal Grinder,
              3D Grinder, Mini Bong. docs/05, punto 7: al posto del menu
              cannabis, integrazione con i sistemi del locale solo per
              informazioni non promozionali, previa verifica con il comune
Decisioni:    - Zandvoort, criterio A: "behalve een summiere aanduiding van de
                lokaliteit mag géén reclame worden gemaakt". Chiusura possibile
                per "openlijke en/of opdringerige reclame". Keurmerk Zandvoortse
                Coffeeshops: adesione volontaria, non cambia requisiti né
                chiusura; se Yanks lo abbia è DA VERIFICARE
              - Stripe (Prohibited and restricted businesses, aggiornata
                22-09-2026): vietati gli articoli per produrre o usare droghe,
                i prodotti a base di cannabis e "i dispensari di cannabis e le
                attività correlate"
              - restano abbigliamento, accendini, portasigarette, posacenere,
                mystery box
Problemi:     da decidere con Pietro, NON modificati:
              a. docs/03, "Regole d'ingresso": dice "Turisti ammessi, il
                 criterio di residenza non viene applicato, verificato di
                 persona". La politica di Zandvoort vigente (CVDR625741) ha il
                 criterio I: "uitsluitend toegankelijk voor Ingezetenen van
                 Nederland". Il sito non può affermare il contrario di un
                 regolamento pubblicato
              b. docs/03: venue ha cannabisMenuUrl e "il menu resta sul
                 servizio esterno, raggiungibile con un link". Un link al menu
                 della cannabis contrasta con la regola 1
              c. Stripe vieta anche "le attività correlate" ai dispensari di
                 cannabis: per un uso reale lo shop merch di un coffeeshop
                 potrebbe non essere accettato. In modalità test non cambia
                 niente; da scrivere nel portfolio accanto alla verifica con il
                 comune
Prossimo:     decisioni sui punti sopra; poi, sul ramo sito/fase-1-lingue,
              h2/h3 in maiuscolo e preload di Martian Mono (approvati), poi
              Fase 1 punto 2 (i18n)
Ramo/commit:  docs/fonti-zandvoort-merch — "Docs: fonti di Zandvoort e merch
              senza accessori", poi merge su main

## 2026-09-25 — Documenti, vincoli legali dei coffeeshop
Fatto:        sezione "Vincoli legali dei coffeeshop" in docs/03, paragrafo
              nelle decisioni del caso studio in docs/05, riga in CLAUDE.md
              (Contenuti): nessun contenuto promozionale sulla cannabis
Decisioni:    criteri AHOJG(I), la "A" vieta la reclame. Regole del concept:
              1. niente prodotti, prezzi o immagini di cannabis; menu solo food
                 e drink
              2. tono informativo, non promozionale
              3. shop merch = parte delicata: per un uso reale serve una
                 verifica con il comune di Zandvoort (scritto nel portfolio)
Problemi:     - fonte CVDR762705 verificata: è il Coffeeshopbeleid di
                Wageningen 2026 (art. 3, criterio A), esempio di un altro
                comune. gmb-2026-274642 non si apre (errore SSL): segnata DA
                VERIFICARE in docs/03
              - da decidere con Pietro, NON modificati:
                a. docs/05, punto 7 "cosa farei con un cliente vero", cita il
                   "collegamento al sistema del menu cannabis": contrasta con
                   la regola 1
                b. docs/03, merch, categoria "smoking": grinder, bong/water
                   pipe, rolling tray, glass tips. Sono accessori per la cannabis:
                   da valutare se tenerli nel catalogo del concept
              - in sospeso sul ramo sito/fase-1-lingue (stash): script verify e
                nuovi ruoli dei font, in attesa di due decisioni (h2/h3 in
                maiuscolo, preload di Martian Mono)
Prossimo:     decisioni sui punti sopra, poi Fase 1 punto 2 (i18n)
Ramo/commit:  docs/vincoli-legali — "Docs: vincoli legali dei coffeeshop",
              poi merge su main

## 2026-09-25 — Fase 1, stile: token, font, tema
Fatto:        tokens.css (colori dei due temi, @theme inline verso Tailwind,
              palette e font predefiniti di Tailwind azzerati), fonts.css
              (7 @font-face, swap), Literata 400/400i/700 e Martian Mono 400
              in woff2 latin con licenza OFL (74 KB), Base.astro con preload
              di Literata regolare e script del tema inline da
              src/scripts/theme-init.js, hash nella CSP di public/_headers,
              tests/csp-hash.test.ts sull'HTML in dist/, pagina /en/ con prova
              di stile. docs/02 e CLAUDE.md aggiornati. @types/node 24.13.6
              (dev). CI ora: check → build → test; tolto --passWithNoTests.
              Verificato con Playwright a 390 e 1440 px nei due temi, nessun
              errore CSP. Tema automatico con page.clock, browser sul fuso di
              Londra: 19:59 chiaro, 20:00 scuro, 07:59 scuro, 08:00 chiaro,
              sia in ora legale sia in ora solare (8 casi su 8)
Decisioni:    - --red-text #A54C3D e --sage-text #526B64 per il testo nel tema
                chiaro (rosso e salvia normali non arrivano a 4.5:1); nel
                tema scuro coincidono con --red e --sage
              - stati dell'orologio mai solo col colore: sempre testo e icona
              - Literata e Martian Mono locali, solo latin e pesi usati
              - il test della CSP controlla ogni script inline di dist/, non
                solo il sorgente
Problemi:     - Chrome a volte avvisa che il preload di Literata "non è stato
                usato in tempo", solo su visite ripetute col font in cache.
                Alla prima visita nessun avviso e il preload è usato (il CSS
                non lo richiede di nuovo). Non è un errore; da riguardare con
                Lighthouse in Fase 6
              - Indian e Yankee Clipper ancora .ttf: woff2 in Fase 6
              - in locale i controlli si lanciano con `npm run verify`
                (astro check → build → test), aggiunto nel ramo del punto 2
Prossimo:     Fase 1, punto 2: i18n (nl/en/de, t.ts, test delle chiavi,
              hreflang in Base.astro, struttura delle pagine), prima il piano
Ramo/commit:  sito/fase-1-stile — "Fase 1: token, font e tema con hash nella
              CSP", poi merge su main

## 2026-09-25 — Fase 0 chiusa, sito online su Cloudflare
Fatto:        Pietro ha collegato il repository a Cloudflare Workers: il sito
              è su https://yanks-redesign.pietro-costa25.workers.dev.
              site aggiornato in astro.config.mjs; in wrangler.jsonc
              "workers_dev": true e "preview_urls": true espliciti, per
              togliere i due avvisi del deploy. Deploy spuntato in docs/04.
              Verificato online con Playwright: "/" rimanda a "/en/", pagina
              corretta a 390 e 1440 px, console senza messaggi, le sei
              intestazioni di sicurezza arrivano
Decisioni:    nessuna nuova: i due valori in wrangler.jsonc sono quelli
              predefiniti, scritti per esteso
Problemi:     nessuno aperto. Restano i promemoria delle voci precedenti
              (--passWithNoTests in Fase 1, intestazioni degli endpoint in
              Fase 3, eccezione su typescript in dependabot.yml)
Prossimo:     Fase 1 di docs/04-build-plan.md, parte "Stile" e "Lingue",
              prima il piano
Ramo/commit:  sito/deploy-cloudflare — "Deploy: indirizzo del sito e
              wrangler.jsonc espliciti", poi merge su main

## 2026-09-25 — Fase 0, Dependabot e TypeScript 7
Fatto:        in .github/dependabot.yml le versioni major di typescript sono
              ignorate. Chiusa la PR #1 di Dependabot (typescript 6.0.3 →
              7.0.2) con un commento che spiega il motivo
Decisioni:    si resta su TypeScript 6.0.3: @astrojs/check 0.9.10 accetta solo
              TypeScript 5 o 6, e con la 7 `npm ci` fallisce (ERESOLVE). I
              controlli su GitHub l'hanno bloccata come dovevano
Problemi:     nessuno nuovo
Promemoria:   togliere l'eccezione su typescript in dependabot.yml quando
              @astrojs/check supporterà TypeScript 7 (controllare il suo
              peerDependencies con `npm view @astrojs/check peerDependencies`)
Prossimo:     Pietro collega Cloudflare (docs/00, passo 4.6), poi site con
              l'indirizzo vero; poi Fase 1
Ramo/commit:  sito/dependabot-typescript — "Dependabot: ignora le major di
              TypeScript", poi merge su main

## 2026-09-25 — Fase 0, progetto e controlli (manca il deploy)
Fatto:        pacchetti a versione esatta (@astrojs/cloudflare 14.3.3,
              tailwindcss e @tailwindcss/vite 4.3.3, vitest 5.0.1,
              @astrojs/check 0.9.10, typescript 6.0.3, wrangler 4.140.0).
              astro.config.mjs, wrangler.jsonc, .npmrc, .node-version (24),
              public/_headers, pagina /en/ provvisoria, "/" → "/en/",
              workflow check.yml, dependabot.yml. Tolti i file d'esempio.
              astro check 0 errori, vitest ok (nessun test), build 2 pagine.
              Anteprima nel motore di Cloudflare: le 6 intestazioni arrivano,
              screenshot a 390 e 1440 px ok, console pulita
Decisioni:    - typescript 6.0.3, non 7: @astrojs/check accetta solo 5 o 6
              - gsap rimandato alla fase delle animazioni
              - imageService 'compile' (immagini in build, niente Cloudflare
                Images a pagamento) e session: false (niente KV)
              - "/" con Astro.redirect in src/pages/index.astro, senza
                redirectToDefaultLocale (conflitto in build)
              - workerd in allowScripts accanto a esbuild
              - workflow: permissions contents read, setup-node con
                .node-version e cache npm, actions v7
              - PUBLIC_SHOP_MODE rimandato alla Fase 1
Problemi:     - npm 11.0.0 sul PC va in errore installando Vitest ("edgesOut"):
                usato npx npm@11.20.0. Conviene aggiornare npm sul PC
              - site in astro.config.mjs è provvisorio fino al deploy
Promemoria Fase 3:
              - public/_headers vale solo per gli asset statici. Le risposte
                degli endpoint /api/ devono impostare le intestazioni di
                sicurezza nel codice
              - togliere --passWithNoTests appena arrivano i test (Fase 1)
Prossimo:     Pietro collega Cloudflare (docs/00, passo 4.6), poi site con
              l'indirizzo vero; poi Fase 1
Ramo/commit:  sito/fase-0 — "Fase 0: Astro, Cloudflare, Tailwind, controlli,
              sicurezza", poi merge su main

## 2026-09-25 — Prima della Fase 0, si resta su Astro 7
Fatto:        "Astro 6" → "Astro 7" in CLAUDE.md, 00, 09, 10. Versione esatta
              in package.json: "astro": "7.3.5" (tolto il ^), lock allineato
Decisioni:    CHIUSO — si resta su Astro 7.3.5, già installato. Verificato
              sulla guida ufficiale "Upgrade to Astro v7": Vite 8 e compilatore
              in Rust, nessun impatto su un progetto nuovo. Node richiesto
              22.12 o superiore (installato 24.21.0)
Problemi:     nessuno aperto
Prossimo:     Fase 0 di docs/04-build-plan.md, prima il piano con pacchetti e
              versioni esatte
Ramo/commit:  docs/astro-7 — "Docs: si resta su Astro 7, versione esatta",
              poi merge su main

## 2026-09-25 — Prima della Fase 0, token HMAC e Resend senza MCP
Fatto:        aggiornati CLAUDE.md, 06, 09, 10 e, per coerenza, 04 (la riga
              "token confrontato come hash" era diventata sbagliata)
Decisioni:    1. CHIUSO — token d'accesso all'ordine:
                 base64url(HMAC-SHA256(ORDER_TOKEN_SECRET,
                 "order-access:v1:" + public_id)), lunghezza piena. Verifica
                 solo con crypto.subtle.verify, mai ===. Solo Web Crypto.
                 Tolta la colonna access_token_hash. Segreto di almeno 32 byte,
                 comando per generarlo in docs/06. Limite documentato: niente
                 revoca per singolo ordine, cambiare il segreto invalida tutti
                 i link
              2. CHIUSO — Resend fuori da .mcp.json e non installato: basta la
                 dashboard. In docs/10 resta una riga, si valuterà se servirà
Problemi:     - astro installato è 7.3.5 (^7.3.5 in package.json), i documenti
                dicono Astro 6: da decidere prima della Fase 0. Il ^ va tolto
                comunque (versioni esatte)
Prossimo:     decidere Astro 6 o 7, poi Fase 0 di docs/04-build-plan.md
              (Parte 4 di docs/00), prima il piano. Cloudflare si collega
              dopo, al passo 4.6
Ramo/commit:  docs/token-hmac — "Docs: token d'accesso HMAC, Resend senza MCP",
              poi merge su main

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
