# Design system — Yanks redesign

## Concetto
**Il club americano sulla piazza di una località balneare olandese, aperto fino
alle tre di notte.** Tre parole: caldo, notturno, schietto.

Struttura contemporanea (bordi netti, blocchi pieni, zero decorazione) che fa da
cornice a un marchio d'epoca. Il contrasto tra i due è il punto.

## Direzione definitiva: variante C (decisa e applicata il 2026-10-21)
Pietro ha confrontato cinque prove della home (attuale; A "Notte al neon", rosso e
foto in duotono; B "Mare del Nord", verde mare, grana analogica, con Bricolage
Grotesque o Familjen Grotesk; C) e ha scelto **C: il sito di oggi con palette
nuova, onde e shop blu**. Le prove erano CSS iniettato con Playwright, senza
toccare il codice. **Applicata a tutte le pagine lo stesso giorno**: dove le
sezioni più sotto (Colori, Spaziatura, Navigazione) dicono altro, vale questa.

| Cosa | Oggi | Variante C |
|---|---|---|
| Fondo | crema `#F7F0E4` | bianco caldo `#FBFAF7` con grana da sabbia quasi invisibile; grigio caldo `#EFEEEB` solo come accento (crema `#F3EEE4` fino al 2026-10-22) |
| Sezioni | tutte crema o sabbia, riga nera da 3 px e ombra sopra | alternate: bianco, inchiostro `#1C1B1A`, shop in blu Mare del Nord `#34566F` |
| Divisori | riga nera spessa | **onde del badge** (bordo superiore ondulato della sezione), l'unico elemento grafico firma |
| Card | bordo 3 px | bordo 1.5 px, titoli più piccoli e spaziati; l'ombra piena al passaggio resta |
| Testi non titoli | scala del 2026-10-21 | un po' più piccoli: prosa 15-17 px, introduzioni 16-18, etichette e pulsanti 12.5-13.5 |
| Font | quattro ruoli | invariati (Bricolage e Familjen provati e scartati) |
| Foto | naturali | naturali (duotono e grana provati e scartati) |
| Footer | nomi delle lingue, scritte social | bandiere al posto dei nomi delle lingue (dal 2026-10-22, su ogni dispositivo; nella navbar restano i codici), icone social da 32 px; le lettere che si scompongono restano (sottolineatura rossa provata e scartata) |

Contrasti misurati (tutti sopra 4.5:1; i valori accanto ai token in
`tokens.css`): testo bianco sul blu 7.43, secondario sul blu 6.13; sul fondo
chiaro testo 16.48, secondario 6.32, rosso 5.44. Testo chiaro sull'inchiostro
`#D9D0C2`: 11.26:1 (nella prova era 14.89, sopra il tetto di 13).

Bandiere: provate il 2026-10-21, tolte lo stesso giorno e **rimesse il
2026-10-22 su richiesta di Pietro, nel footer su ogni dispositivo** (nella navbar restano i codici NL EN DE; `Flag.astro`,
SVG nostri, Regno Unito per l'inglese). Il nome della lingua nella sua lingua
resta per i lettori di schermo e nel `title`, perché una bandiera indica un
Paese, non una lingua. Al clic la bandiera sventola (360 ms, solo `transform`),
poi si cambia pagina; con movimento ridotto si cambia subito. Su telefono,
nel footer, lingue e social stanno sulla stessa riga.

**Onde, regola delle intersezioni**: sempre colore della sezione sopra → onda →
sezione sotto, senza fasce in mezzo, nei due temi. L'onda è il bordo superiore
della sezione sotto (`wave-top`) e si sovrappone al fondo di quella sopra. Lo
spazio prima del footer è il `padding-bottom` del `<main>` (4rem), che si annulla
quando il main finisce con una sezione piena (`tone-*`): così sulla home l'onda
crema del footer sale direttamente sul nero della mappa.

**Come è costruita**:
- `tokens.css`: palette C nei due temi, colori delle sezioni piene (`--ink*`,
  `--sea*`), onda (`--wave`, `--wave-h`) e grana (`--grain`, niente nel tema scuro)
- `global.css`, nel layer components:
  - `tone-ink`, `tone-sea`, `tone-cream`: sezioni piene che **ridefiniscono i
    token al loro interno**, così card, pulsanti e link seguono il fondo da soli
  - `wave-top`: l'onda del badge come bordo superiore della sezione, nel colore
    della sezione stessa (maschera CSS con un SVG `data:`, ammesso dalla CSP)
  - `card-title`: titoli delle card, Yankee Clipper più piccolo e spaziato
- misure più piccole dei testi non titoli direttamente nella scala dei token
  (`--text-body` 15-17, `--text-lead` 16-18, `--text-small` e `--text-btn`
  12.5-13.5)
- componente `SocialIcon.astro` (Instagram, Facebook a tratto), decorativo: il
  nome lo dà il link (`sr-only`)
- bordo di card, campi, riquadri e righe interne: `border-[1.5px]` (pulsanti,
  header e tubo al neon restano com'erano). L'ombra sopra le sezioni
  (`edge-shadow`) non c'è più
- home: hero bianca, foto dell'esterno, "chi siamo" `tone-ink`, menu bianco,
  shop `tone-sea`, recensioni bianche, mappa `tone-ink`; footer `tone-cream`
  con l'onda, su tutte le pagine
- shop (dal 2026-10-29): tutte le sue pagine e il pannello del carrello in
  `tone-sea`, a tutta larghezza; il footer ci scende sopra con l'onda
- `LangSwitch`: su una pagina senza lingua nell'indirizzo (la 404) il selettore
  porta alla home della lingua
- 404 (`src/pages/404.astro`): logo grande e un riquadro per lingua, ognuno col
  suo `lang`; testi in `notFound.*` (riletti il 2026-10-21: "la pagina non
  esiste o si è spostata", "torna alla home")
- toast della pagina ordine: regione `role="status"` sempre presente e vuota (il
  testo che entra viene annunciato), riquadro `tone-ink` in basso a destra; su
  telefono in alto sotto l'header, per non coprire il pulsante "Copia link", chiusura dopo 6 s o con la X. Compare
  una volta sola: stessa condizione che svuota il carrello (pagato, appena
  tornati da Stripe, chiave in `sessionStorage`). Testi `order.toast.*`

**Styleguide**: `/en/styleguide/` (`src/pages/[lang]/styleguide.astro`), generata
anche in nl e de solo perché il selettore della lingua porta alla stessa pagina.
`noindex`, fuori dal menu e dalla sitemap. **Eccezione voluta alla regola
dei testi**: le etichette della guida sono scritte nella pagina, perché è uno
strumento di lavoro e non contenuto; gli esempi usano i testi veri dei file di
lingua. Mostra colori (con il valore letto dal tema attivo), tipografia, sezioni e
onde, pulsanti, card, orologio, pezzi del footer, movimento.

## Il marchio
- **Logo nuovo dal 2026-10-01**, scelto da Pietro: il "timbro" della proposta 01
  di `07-prompt-loghi.md` (`brand/sorgente/logo1-timbro.png`): disco nero, "Yanks"
  in corsivo rosso, l'indiano con fascia e piuma, anello crema aperto, onde del
  Mare del Nord. Vettorializzato con la palette dei token (`#1F1B17`, `#DDD2C0`,
  `#E0705A`), fondo piatto, SVGO: 16-25 KB. Confronto con il vecchio in
  `brand/anteprima/confronto-logo.png`
- Sempre tramite `Logo.astro`, con due varianti:
  - **badge** (logo completo) **dai 160 px in su**: hero, footer, avviso d'età,
    scelta della lingua
  - **indiano** (solo il volto) **sotto i 160 px**: header; e la favicon
  - ognuna in versione chiara (disco nero) e scura (anello crema che stacca il
    disco dal fondo marrone); si mostra quella del tema attivo
- Il logo originale del locale resta come riferimento in
  `public/brand/yanks-originale.png`, per il confronto nel portfolio
- È il segno forte: grande, isolato, su fondi ampi
- Un solo segno importante per schermata
- Nessuna clipart a tema come riempitivo
- Le proposte di evoluzione del marchio (vedi `07-prompt-loghi.md`) si mostrano
  accanto all'originale. La proposta 01 è diventata il logo del sito per scelta di
  Pietro; nel portfolio va mostrata accanto all'originale

## Colori
I loro rosso e oro, ammorbiditi verso il pastello: il rosso perde il fuoco e
diventa terracotta, l'oro perde il metallo e diventa miele. La salvia è l'unico
colore aggiunto e lega il tutto al mare.

I valori stanno **solo** in `src/styles/tokens.css`. Le variabili cambiano col
tema, e `@theme inline` le collega alle classi di Tailwind (`bg-bg`,
`text-red-text`, `font-display`…): il colore di una classe segue il tema da solo.

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `--bg` | `#F7F0E4` crema | `#1F1B17` marrone caldo | fondo |
| `--surface` | `#F1E4CC` sabbia | `#2A251F` | blocchi |
| `--text` | `#2B2724` inchiostro | `#DDD2C0` | testo |
| `--muted` | `#6B645C` | `#A79E90` | testo secondario |
| `--red` | `#C75B4A` | `#E0705A` | superfici, bordi, testo grande |
| `--gold` | `#E3BE72` | `#E3BE72` | dettagli |
| `--sage` | `#6E8F85` | `#8FB0A5` | superfici, bordi, testo grande |
| `--red-text` | `#A54C3D` | = `--red` | **testo** rosso |
| `--sage-text` | `#526B64` | = `--sage` | **testo** salvia |
| `--neon-open` | `#176B37` | `#5DF28C` | orologio: aperto |
| `--neon-takeaway` | `#8A5700` | `#FFB547` | orologio: solo asporto |
| `--neon-closed` | `#B3261E` | `#FF6B5E` | orologio: chiuso |

**Contrasto misurato** (minimo 4.5:1 per il testo normale; testo principale
tra 10:1 e 13:1, abbastanza per leggere senza abbagliare):
- tema chiaro: `--red` fa 3.69 su crema e 3.33 su sabbia, `--sage` 3.13 e 2.82,
  quindi **non passano come testo**. Per il testo si usano `--red-text` (5.01 e
  4.51) e `--sage-text` (5.08 e 4.58). Neon: aperto 5.80 e 5.23, asporto 5.38 e
  4.85, chiuso 5.77 e 5.20
- tema scuro (ritarato il 2026-09-28: il `#151310` con testo a 15:1 affaticava
  gli occhi): `--text` 11.45 su fondo e 10.16 su surface, `--muted` 6.47 e
  5.74, `--red` 5.41 e 4.80, `--sage` 7.27 e 6.45, `--gold` 9.67 e 8.59. Neon:
  aperto 11.85 e 10.52, asporto 9.74 e 8.64, chiuso 6.12 e 5.44.
  `--red-text` e `--sage-text` coincidono con `--red` e `--sage`

**Regole d'uso**
- Testo rosso o salvia: sempre `--red-text` e `--sage-text`, mai `--red` e
  `--sage`
- Rosso: un pulsante per schermata, prezzi in evidenza
- I tre `--neon-*` solo per l'orologio, mai altrove
- Oro: dettagli, sottolineature, lo script sui fondi scuri. **Mai testo piccolo
  su fondo crema**: il contrasto è troppo basso
- `--muted` solo per testo secondario, mai per il testo principale
- Nessun gradiente

**Dark mode**
- Ordine di scelta del tema: prima la scelta salvata dall'utente, poi l'orario
  `Europe/Amsterdam`, scuro dalle 20:00 alle 08:00
- Interruttore sempre in header; la scelta dell'utente si ricorda e vince
  sull'automatismo
- Il tema lo imposta uno script inline nell'`<head>` prima del rendering, per
  evitare il lampo del tema sbagliato. Autorizzato nella CSP tramite hash (vedi
  `06-shop-architecture.md`)
- Foto e video più contrastati sul fondo scuro
- Lighthouse su entrambi i temi

## Tipografia

| Ruolo | Font | Token / classe | Uso |
|---|---|---|---|
| Titolo | Indian (Billy Argel) | `--font-script` · `font-script` | tutti gli **h1**, "Yanks" compreso: il font più vicino alla scritta del logo. **Mai in maiuscolo**. Eccezione: l'h1 della scheda prodotto, nome lungo, è in Yankee Clipper |
| Intestazione | Yankee Clipper (Iconian) | `--font-sign` · `font-sign` | **h2 e h3**, **sempre in maiuscolo**. Anche la riga "Home of the Medicine Man", le legende del checkout e le etichette da insegna: nomi nelle schede, "1/250", la regola d'ingresso |
| Interfaccia | Martian Mono | `--font-ui` · `font-ui` | navigazione, pulsanti, etichette, prezzi, orari. È il font predefinito del `body` |
| Prosa | Literata | `--font-prose` · `font-prose` | **solo i paragrafi lunghi**: storia, recensioni, descrizioni. Si segnano con la classe `font-prose` |

h1, h2 e h3 prendono il loro font da soli (stili di base in `global.css`).
**Storia delle scelte**: in partenza h1 in Indian e h2/h3 in Yankee Clipper; il
2026-09-29 invertiti su richiesta di Pietro; il 2026-10-01 di nuovo h1 in Indian,
perché è il font più vicino alla scritta "Yanks" del logo nuovo (la scritta del logo
non è un font: è un disegno con le sole lettere Y-a-n-k-s). TAN New York è stato
valutato e scartato: esiste solo a pagamento. I token hanno il nome del font
(`font-sign`, `font-script`), non del ruolo, così non mentono se i ruoli cambiano.
Controllato: nessun titolo sfora a 360, 390 e 1440 px, in nl, en, de.

**Caratteri disponibili** (controllati sulla tabella `cmap` dei file):
- tutti e quattro i font hanno le lettere del tedesco (`ä ö ü ß`) e delle lingue
  future (`à è é ì ò ù ç ñ`, maiuscole accentate, `€`)
- **a Indian mancano `– — ‘ ’ “ ” …`**: il browser li prende dal font di riserva e
  si vede. Negli h1 niente trattini, virgolette curve o puntini di sospensione
- **Indian scende molto sotto la riga** (lo svolazzo della "Y"): gli h1 hanno
  `line-height: 1` e `padding-bottom: 0.45em` (dal 2026-10-21; con 0.25em la "Y"
  di "Your order" toccava il paragrafo sotto)
- **Indian in maiuscolo non si legge**: le maiuscole corsive si accavallano
  ("ZANDVOORT"). Sempre con la sola iniziale maiuscola
- **Indian personal use, niente cifre**: al posto di 0-9 c'è il marchio
  "PERSONAL USE · COMPLETE SET · billyargel.com". In `fonts.css` un
  `unicode-range` le esclude e le disegna Literata. Scoperto il 2026-09-29 sul
  logo ("Since 1984")
- **Yankee Clipper minuscolo**: la "u" ha un uncino che la fa sembrare "ú", e
  la "ß" è disegnata come una beta e si legge quasi "B" ("STRAßE"). Per questo
  h2 e h3 sono sempre in maiuscolo: si usano solo le maiuscole, che sono pulite,
  e il browser scrive "ß" come "SS". Se usi `font-sign` fuori dagli h1,
  aggiungi la classe `uppercase` (l'unico h1 in Yankee Clipper è quello della
  scheda prodotto)
- **Yankee Clipper, cifre illeggibili**: l'8 sembra uno 0 ("18" si legge "10"),
  il 9 è deformato. In `fonts.css` il font ha un `unicode-range` che esclude le
  cifre: le disegna il font successivo della pila, Impact (poi Arial Narrow).
  Scoperto il 2026-09-28 su "ingresso dai 18 anni"

Literata e Martian Mono sono OFL, in `public/fonts/` come `.woff2` locali con la
licenza accanto: solo sottoinsieme latin e solo i pesi usati (Literata regolare,
corsivo e grassetto 700; Martian Mono regolare). Si precarica solo **Martian Mono**
regolare: è il font dell'interfaccia e del `body`, quindi il più usato. Literata
serve solo ai paragrafi lunghi, spesso più in basso nella pagina. Indian e Yankee Clipper restano `.ttf` per ora (conversione in
`.woff2` nella Fase 6).

**Indian e Yankee Clipper non vanno mai nel testo lungo**: in un menu o in un
paragrafo diventano illeggibili.

Nell'hero l'accoppiata forte è **script caldo sopra display pesante**: il
titolo in Indian, sopra o sotto una riga breve in Yankee Clipper. È il
linguaggio delle insegne americane.

**Licenze**: Indian e Yankee Clipper sono gratuiti solo per uso personale. Per un
cliente vero serve la licenza commerciale. Sostituti liberi: Yellowtail (script),
Syne (display), Literata (testo), Martian Mono (dati).

**Scala fluida** (2026-10-19, variante C scelta da Pietro; **ridotta il
2026-10-21**: la prosa d'introduzione arrivava a 28 px, gli h1 a 144). Tutto
cresce con lo schermo tra il telefono da 320 px e circa 1400 px; la parte in rem
segue lo zoom del browser. Valori solo in `tokens.css`:
```css
--text-display: clamp(3rem, 2rem + 5vw, 6rem);          /* 48-96 px, solo la hero */
--text-h1:      clamp(2.5rem, 1.9rem + 2.6vw, 4rem);    /* 40-64 px, h1 delle pagine */
--text-h2:      clamp(1.625rem, 1.2rem + 2vw, 2.5rem);  /* 26-40 px */
--text-h3:      clamp(1.125rem, 1rem + 0.5vw, 1.375rem);/* 18-22 px */
--text-lead:    clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);/* 17-20 px, introduzioni */
--text-body:    clamp(1rem, 0.95rem + 0.2vw, 1.125rem); /* 16-18 px */
--text-small:   clamp(0.8125rem, 0.78rem + 0.12vw, 0.875rem);
--text-xs:      clamp(0.72rem, 0.69rem + 0.15vw, 0.8125rem);
--text-btn:     clamp(0.8125rem, 0.78rem + 0.12vw, 0.875rem);
--btn-x:        clamp(1rem, 0.7rem + 1.5vw, 1.75rem);   /* spazio ai lati dei pulsanti */
```
I paragrafi d'introduzione sono `font-prose text-lead`, mai `text-h3`. Gli h1 in
Indian hanno sotto `padding-bottom: 0.45em`: le code (la "Y") scendono di quasi
mezza altezza e con meno toccano la riga sotto.

**Pulsanti**: classi `btn` (bordo, si riempie al passaggio) e `btn-solid` (pieno,
si svuota), definite una volta in `global.css`. Testo e spazio ai lati fluidi,
altezza minima sempre 44 px. Non si riscrive la fila di classi a mano.

## Spaziatura e layout
- Scala: 0.5 · 1 · 2 · 4 · 8 · 12 rem
- Griglia a 12 colonne usata in modo asimmetrico: mai tre schede uguali in fila
- Immagini a filo del bordo dello schermo
- Testo largo al massimo 65 caratteri
- Bordi spessi (2-6 px) nel colore del testo
- **Angoli sempre arrotondati** (richiesta di Pietro, 2026-09-29): pulsanti,
  pillole e selettori `rounded-full`; campi dei moduli `rounded-xl`; schede,
  riquadri e immagini `rounded-2xl`. Restano dritte solo le linee che separano
  le sezioni e, unica eccezione (Pietro, 2026-10-01), il riquadro della mappa:
  l'iframe di Google sborderebbe dagli angoli tondi
- **Ombre**: tre. L'alone del neon (è luce); **al passaggio sulle schede**,
  un'ombra piena sfalsata di 6 px nel colore del testo, con la scheda che si
  solleva: un adesivo anni '50; e dal 2026-10-01 un'**ombra morbida sopra ogni
  sezione**, su tutte le pagine (utility `edge-shadow`, colore
  `--section-shadow`), così le sezioni si staccano come fogli sovrapposti
- **Margine laterale** (dal 2026-10-01): un solo token, `--page-x`
  (`clamp(1.25rem, 4.5vw, 3.5rem)`, 20 px su telefono, 56 px a 1440), usato con
  l'utility `px-page` da tutti i contenitori. Niente più `px-4` sui contenitori
- **Schede**: foto con zoom leggero al passaggio, etichette a pillola sopra la
  foto (edizione "1/250" in oro sulla tavola scura, disponibilità), prezzo in una
  pillola che si riempie al passaggio

## L'orologio a tre stati

```
[● APERTO] · fino alle 02:00               (verde neon, --neon-open)
[◐ SOLO ASPORTO] · chiude tra 23 min       (ambra,      --neon-takeaway)
[○ CHIUSO] · apre alle 08:00               (rosso,      --neon-closed)
```

**Stile insegna al neon**, anni '50-'80: icona e stato dentro un tubo a
pillola nel colore dello stato; il dettaglio dopo il punto resta `--muted`.
- **Uguale nei due temi** (dal 2026-09-29: nel tema chiaro l'etichetta con
  bordo non si vedeva): tubi al neon accesi su una tavola scura
  (`--neon-board`), con alone (`text-shadow` sul testo, `drop-shadow`
  sull'icona, `box-shadow` sul bordo). È luce, non profondità
- Senza JS non c'è uno stato: niente tavola, solo l'orario nel colore del testo
- **Accensione**: un tremolio solo al primo caricamento, 1.2 secondi, solo
  `opacity`, meno di tre lampi al secondo. **Niente del tutto con
  `prefers-reduced-motion`**. I cambi di stato successivi non tremano

**Gli stati non si distinguono mai solo col colore**: ognuno ha sempre anche il
suo testo e la sua icona (cerchio pieno, mezzo, vuoto), così si leggono anche
senza vedere i colori.

Sempre visibile in header, anche su telefono sulla stessa fascia del logo (dal
2026-10-19; prima stava in una striscia sotto). Calcolato su `Europe/Amsterdam` con
`Intl.DateTimeFormat`, mai sull'orologio del dispositivo: Italia e Paesi Bassi
hanno lo stesso fuso, ma chi guarda da Londra è un'ora indietro.

## Hero della home

"Yanks" (h1) in Indian e in `--red` (3.69:1 su crema: testo grande, minimo 3:1),
come la scritta del logo; "HOME OF THE MEDICINE MAN" in Yankee Clipper e in
`--matte`, nero opaco
(`#1C1B1A`, 15.18:1 su crema). Nel tema scuro `--matte` è il colore del
testo: il nero sparirebbe. Accanto, il logo grande.

**Sfondo** (dal 2026-10-01): la spiaggia di Zandvoort, video di Pietro.
Fotogramma fisso (`src/assets/home/hero-spiaggia.jpg`, WebP in build) sempre;
video (`public/video/hero-spiaggia.webm`, VP9 1600 px, 2,5 MB, senza audio) solo da
1024 px, senza movimento ridotto e senza risparmio dati, fermo quando esce di
vista. Sopra, un velo nel colore `--bg`: 85% su telefono e tablet, da sinistra
(90%) a destra (30%) su desktop, così il testo resta leggibile nei due temi.

**Componente**: `LoopVideo.astro`. Oggi lo usa solo l'hero: il video della spiaggia
nella Story è stato provato e tolto (Pietro, 2026-10-02).

## La sezione del club (bento)

Dal 2026-10-01 "De club aan het plein" è una griglia a bento: tutte le tessere
con lo stesso bordo e lo stesso spazio (16 px, 24 da desktop). Telefono: una
colonna. Tablet: due, l'interno alto quanto le schede orario e spiaggia. Desktop:
tre, il testo largo due colonne in alto, la terrazza alta quanto tutta la griglia.

"Wat gasten zeggen" è la stessa idea **rovesciata**: la recensione più lunga è
la tessera alta a sinistra, titolo e recensione breve in alto a destra, sotto
l'estratto largo e il premio Tripadvisor su una tavola scura (oro su
`--neon-board`, come l'orologio).

## Misure dello schermo (controllo del 2026-10-02)

Provato su 14 larghezze (320, 360, 390, 414, 600, 768, 834, 1024, 1180, 1280,
1366, 1536, 1920, 2560 px), 22 pagine nelle tre lingue, più il telefono in
orizzontale (740×360, 667×375, 568×320). Controlli automatici con Playwright:
niente scorrimento laterale, niente elementi che escono dal proprio contenitore,
nessun testo sotto i 12 px, bersagli di tocco di almeno 40 px sotto i 1024 px.
Regole che ne sono uscite:
- `html, body { overflow-x: clip }`: le tessere che entrano "da destra" non
  fanno scorrere la pagina di lato (clip, non hidden, per non rompere lo sticky)
- `.grid` senza colonne dichiarate ha `minmax(0, 1fr)`; `fieldset` ha
  `min-width: 0`: su telefono niente si allarga più dello schermo
- nomi lunghi (carrello, schede, riepilogo): `break-words hyphens-auto`, la
  sillabazione segue il `lang` della pagina
- link del footer: a capo solo tra le parole (lettere raggruppate per parola)
- footer: una colonna, due da tablet, cinque a 1024 (logo e indirizzo sopra),
  dodici da 1280
- bibite del menu su una colonna tra 1024 e 1279 px
- anteprima della mappa: si allunga se il testo non sta nella proporzione 16:9
- avviso d'età su schermi bassi (max-height 480 px): il solo volto a 80 px e meno
  spazio, così tutto resta in vista
- oltre i 1440 px il contenuto resta centrato su 1440 (max-w-360)

## Story a bento (dal 2026-10-22)

La cronologia è una griglia a bento, in ordine di tempo da sinistra a destra e
dall'alto in basso. Dal 2026-10-02 scorreva in orizzontale con scroll-snap e
pulsanti ← →: a Pietro non piaceva; lo scorrimento automatico è stato scartato
(serve un pulsante di pausa, WCAG 2.2.2, e le schede scappano mentre si legge).
Telefono: una colonna. Tablet: due colonne, 1984 e 1995 affiancate, le tappe
con foto a tutta larghezza. Desktop: tre colonne, l'insegna con la foto sopra
alta quanto la griglia a destra, "oggi" largo due colonne con la foto a lato.
Ogni tessera entra con un movimento suo (`data-anim`), niente JavaScript proprio.

## Movimento (dal 2026-09-29)

Tutto in CSS e poco TypeScript, senza librerie (docs/08). `prefers-reduced-motion`
spegne tutto; si animano solo `transform` e `opacity`; senza JS si vede tutto.
- **Titoli in ingresso** (h1, h2, h3 di pagina e footer, `scripts/motion.ts`),
  dal 2026-10-01: ogni pezzo entra **da sinistra**, inclinato, e si raddrizza;
  Indian per parola, Yankee Clipper per lettera (tempi sotto).
  Nessun tremolio dopo l'ingresso (provato e tolto il 2026-10-01). Gli screen
  reader leggono il titolo intero (`sr-only`)
- **Tempi** (rallentati il 2026-10-22 su richiesta di Pietro, a metà tra quelli
  del 2026-10-21 e la PR #38 chiusa): titoli 1.8 s per lettera (75 ms l'una) e
  2.3 s per parola (Indian, 280 ms l'una), blocchi 1.6 s (130 ms l'uno, spostamenti
  40-72 px), volo nel carrello 1 s, toast 0.4 s, lettere del footer 0.25 s
- **L'h1 della hero non si anima** (`data-static`): "Yanks" è visibile al primo
  disegno della pagina, senza aspettare lo script
- **Blocchi in ingresso**: schede, foto, citazioni e moduli sotto la piega salgono
  quando arrivano in vista. Quello che è a schermo al caricamento non si anima.
  Nelle bento ogni tessera ha un movimento suo (`data-anim`: left, right, up,
  down, zoom, tilt), sempre solo transform e opacity. Un blocco dentro un altro
  blocco animato non si anima due volte
- **Aggiunta al carrello**: la foto vola con un arco fino all'icona del carrello,
  il numero salta, il pulsante mostra "✓ Aggiunto" per 1.6 s
- **Footer**: al passaggio del mouse le lettere dei link delle pagine si
  scompongono e tornano a posto quando esce (`ScatterText.astro`, solo CSS).
  Le icone social non hanno lettere, quindi non si scompongono
- **Cursore**: un punto che inverte i colori, più grande su link e pulsanti, un
  blocco pieno sulle foto. Solo con un mouse vero; nei campi di testo resta il
  cursore di testo; con avviso d'età o menu aperti torna quello di sistema
- **Foto a tutto schermo** (scheda prodotto, dal 2026-10-27, `ProductGallery.astro`):
  ogni foto è un link alla versione grande; con JS si apre in un `<dialog>` scuro
  (`tone-ink`), con X, Esc, clic sul fondo, frecce ← → e scorrimento col dito.
  Dissolvenza di 0.25 s, spenta con movimento ridotto
- **Freccia per tornare su**: compare negli ultimi 600 px delle pagine lunghe;
  riporta in cima e mette il focus sul titolo della pagina

## Lista di controllo prima di ogni commit
- [ ] Nessun gradiente, nessun glassmorphism, nessuna emoji nell'interfaccia
- [ ] Nessuna foglia di cannabis decorativa, nessuna clipart a tema
- [ ] Nessuna immagine stock
- [ ] Nessun hero centrato con titolo e sottotitolo grigio
- [ ] Schede: angoli arrotondati, ombra solo quella piena al passaggio
- [ ] Yankee Clipper usato solo per titoli
- [ ] Contrasto verificato in entrambi i temi

## Navigazione (Fase 2A)
**Capsula** (2026-10-19, variante A scelta da Pietro): in cima alla pagina
l'header è una fascia piatta col bordo sotto; appena si scorre il fondo sparisce
e compare una capsula staccata dai bordi (sabbia, bordo, ombra netta spostata da
adesivo). Logo e icone non si spostano: la capsula sporge di 0.75rem oltre il
contenuto. Si animano solo opacity e transform.

**Desktop** (da 1024 px): logo a sinistra, voci del menu al centro, a destra
orologio, lingue e tema in un'unica pillola, carrello. La pagina attiva ha una
**pillola rossa** dietro il link; al passaggio del mouse la pillola si accende sul
link puntato e si spegne su quello attivo (solo CSS). Tra 1024 e 1280 px
l'orologio mostra solo icona e stato, senza dettaglio: in tedesco non ci sta.

**Mobile** (sotto 1024 px): logo, orologio, carrello e ☰ sulla stessa fascia.
Sotto 640 px l'orologio mostra solo icona e stato ("GEÖFFNET"), dal tablet anche
il dettaglio. Il ☰ apre un menu a tutto schermo: le voci grandi in **Yankee
Clipper**, numerate 01–05, che entrano di lato una dopo l'altra; in fondo
orologio, orari, lingue e tema. Le voci in Yankee Clipper sono un'eccezione alla
regola "navigazione in Martian Mono", scelta da Pietro il 2026-10-19: sono
etichette da insegna, corte e in maiuscolo.
- Il menu mobile funziona **senza JavaScript** (`<details>` o `popover`): il JS
  aggiunge solo le animazioni
- Il carrello mostra il numero di articoli; senza JS è un link alla pagina
  carrello

**Footer** (variante C): grigio caldo (`--surface`) con l'onda sopra; indirizzo, orari, link alle
pagine, lingue (nomi nella loro lingua), icone social, disclaimer del concept.
