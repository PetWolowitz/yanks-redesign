# Design system — Yanks redesign

## Concetto
**Il club americano sulla piazza di una località balneare olandese, aperto fino
alle tre di notte.** Tre parole: caldo, notturno, schietto.

Struttura contemporanea (bordi netti, blocchi pieni, zero decorazione) che fa da
cornice a un marchio d'epoca. Il contrasto tra i due è il punto.

## Il marchio
- **Il logo resta.** Nel sito attuale è annegato in un template: qui diventa
  l'elemento forte, grande, isolato, su fondi ampi
- Un solo segno importante per schermata
- Nessuna clipart a tema come riempitivo
- Le proposte di evoluzione del marchio (vedi `07-prompt-loghi.md`) si mostrano
  accanto all'originale, non al suo posto

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
| Titolo | Indian (Billy Argel) | `--font-title` · `font-title` | h1 e titoli hero. **Solo titoli brevi, mai frasi lunghe** |
| Intestazione | Yankee Clipper (Iconian) | `--font-heading` · `font-heading` | h2 e h3, **sempre in maiuscolo** (`text-transform: uppercase`) |
| Interfaccia | Martian Mono | `--font-ui` · `font-ui` | navigazione, pulsanti, etichette, prezzi, orari. È il font predefinito del `body` |
| Prosa | Literata | `--font-prose` · `font-prose` | **solo i paragrafi lunghi**: storia, recensioni, descrizioni. Si segnano con la classe `font-prose` |

h1, h2 e h3 prendono il loro font da soli (stili di base in `global.css`).

**Caratteri disponibili** (controllati sulla tabella `cmap` dei file):
- tutti e quattro i font hanno le lettere del tedesco (`ä ö ü ß`) e delle lingue
  future (`à è é ì ò ù ç ñ`, maiuscole accentate, `€`)
- **a Indian mancano `– — ‘ ’ “ ” …`**: il browser li prende dal font di riserva e
  si vede. Negli h1 niente trattini, virgolette curve o puntini di sospensione
- **Indian scende molto sotto la riga** (lo svolazzo della "Y"): sotto un titolo
  in Indian serve spazio, circa `0.3em`, altrimenti copre la riga dopo
- **Yankee Clipper minuscolo**: la "u" ha un uncino che la fa sembrare "ú", e
  la "ß" è disegnata come una beta e si legge quasi "B" ("STRAßE"). Per questo
  h2 e h3 sono sempre in maiuscolo: si usano solo le maiuscole, che sono pulite,
  e il browser scrive "ß" come "SS". Se usi `font-heading` fuori da h2/h3,
  aggiungi la classe `uppercase`

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

**Scala**
```css
--step-display: clamp(3rem, 12vw, 9rem);
--step-h2:      clamp(2rem, 5vw, 3.5rem);
--step-h3:      clamp(1.25rem, 2.5vw, 1.75rem);
--step-body:    clamp(1rem, 1.1vw, 1.125rem);
--step-small:   0.875rem;
```

## Spaziatura e layout
- Scala: 0.5 · 1 · 2 · 4 · 8 · 12 rem
- Griglia a 12 colonne usata in modo asimmetrico: mai tre schede uguali in fila
- Immagini a filo del bordo dello schermo
- Testo largo al massimo 65 caratteri
- Bordi spessi (2-6 px) nel colore del testo, nessuna ombra (unica eccezione:
  l'alone al neon dell'orologio nel tema scuro), angoli al massimo 2 px

## L'orologio a tre stati

```
[● APERTO] · fino alle 02:00               (verde neon, --neon-open)
[◐ SOLO ASPORTO] · chiude tra 23 min       (ambra,      --neon-takeaway)
[○ CHIUSO] · apre alle 08:00               (rosso,      --neon-closed)
```

**Stile insegna al neon**, anni '50-'80: icona e stato dentro un bordo di 2 px
nel colore dello stato; il dettaglio dopo il punto resta `--muted`.
- **Tema scuro**: il tubo si accende. Alone con `text-shadow` sul testo,
  `drop-shadow` sull'icona e `box-shadow` sul bordo. È **l'unica ombra
  ammessa nel sito**: è luce, non profondità
- **Tema chiaro**: etichetta colorata con bordo, **senza alone**
- **Accensione**: un tremolio solo al primo caricamento, 1.2 secondi, solo
  `opacity`, meno di tre lampi al secondo. **Niente del tutto con
  `prefers-reduced-motion`**. I cambi di stato successivi non tremano

**Gli stati non si distinguono mai solo col colore**: ognuno ha sempre anche il
suo testo e la sua icona (cerchio pieno, mezzo, vuoto), così si leggono anche
senza vedere i colori.

Sempre visibile in header (su mobile nella striscia sotto la fascia). Calcolato su `Europe/Amsterdam` con
`Intl.DateTimeFormat`, mai sull'orologio del dispositivo: Italia e Paesi Bassi
hanno lo stesso fuso, ma chi guarda da Londra è un'ora indietro.

## Lista di controllo prima di ogni commit
- [ ] Nessun gradiente, nessun glassmorphism, nessuna emoji nell'interfaccia
- [ ] Nessuna foglia di cannabis decorativa, nessuna clipart a tema
- [ ] Nessuna immagine stock
- [ ] Nessun hero centrato con titolo e sottotitolo grigio
- [ ] Nessuna scheda con ombra e angoli arrotondati
- [ ] Yankee Clipper usato solo per titoli
- [ ] Contrasto verificato in entrambi i temi

## Navigazione (Fase 2A)
**Desktop** (da 1024 px): logo a sinistra, voci del menu al centro, a destra
orologio, lingua, tema e carrello. Header fisso, che si rimpicciolisce
scorrendo. Tra 1024 e 1280 px l'orologio mostra solo icona e stato ("SOLO
ASPORTO"), senza dettaglio: in tedesco la fascia completa non ci sta.

**Mobile** (sotto 1024 px): logo, carrello e ☰ sulla fascia; sotto, una
striscia sottile a tutta larghezza con l'orologio, sempre visibile. Il ☰ apre
un menu a tutto schermo con pagine, lingue e tema.
- Il menu mobile funziona **senza JavaScript** (`<details>` o `popover`): il JS
  aggiunge solo le animazioni
- Il carrello mostra il numero di articoli; senza JS è un link alla pagina
  carrello

**Footer**: indirizzo, orari, link alle pagine, lingue, disclaimer del concept.
