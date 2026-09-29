# Logo a badge — proposta (2026-09-29)

**In anteprima, non ancora nel sito.** Il sito usa ancora il logo originale
(`src/assets/brand/yanks-logo.png`). Si sostituisce solo dopo l'ok di Pietro.

## File
- `sorgente/illustrazione-indiano.png` — l'illustrazione di Pietro
  (`sfondo nero..png`, 3950 px), ridotta a 2000 px
- `badge/yanks-badge-scuro-A.svg`, `-scuro-B.svg` — badge completo, per fondo scuro
  (anello crema)
- `badge/yanks-badge-chiaro-A.svg`, `-chiaro-B.svg` — badge completo, per fondo
  chiaro (anello scuro con filo crema: un anello crema sparirebbe sul crema)
- `badge/yanks-indiano-scuro.svg`, `-chiaro.svg` — solo l'indiano, per favicon e
  header piccolo
- `anteprima/confronto-logo.png` — vecchio logo accanto alle varianti, e prova
  di leggibilità a 48, 56, 96, 160 px
- `anteprima/favicon-16-32-48.png` — la versione solo indiano, ingrandita

## A e B: la riga piccola
- **A**: "Medicine Man · Since" in Indian, "1989" in Literata corsivo
- **B**: "MEDICINE MAN · SINCE 1989" in Martian Mono maiuscolo spaziato
Indian non può scrivere "1989": nella versione personal use le cifre sono un
marchio "PERSONAL USE". E in maiuscolo le lettere corsive si accavallano, quindi
"Zandvoort", non "ZANDVOORT".

## Come è fatto
- illustrazione: due maschere (crema e rosso) dentro il disco, tracciate in bianco
  e nero con vtracer; il fondo è un cerchio piatto `#1F1B17`, quindi i due puntini
  e le lettere fantasma dell'originale spariscono per costruzione
- anello e disco: cerchi SVG perfetti, non tracciati
- testi: glifi convertiti in tracciati con opentype.js, posati ad arco
- colori: `#1F1B17` (quasi nero), `#DDD2C0` (crema), `#E0705A` (rosso), dai token
- ottimizzati con SVGO: 20–37 KB a variante
- strumenti usati una volta sola, fuori dal progetto: nessuna dipendenza nuova
