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
| `--bg` | `#F7F0E4` crema | `#151310` | fondo |
| `--surface` | `#F1E4CC` sabbia | `#221E1A` | blocchi |
| `--text` | `#2B2724` inchiostro | `#F0E8DA` | testo |
| `--muted` | `#6B645C` | `#A79E90` | testo secondario |
| `--red` | `#C75B4A` | `#E0705A` | superfici, bordi, testo grande |
| `--gold` | `#E3BE72` | `#E3BE72` | dettagli |
| `--sage` | `#6E8F85` | `#8FB0A5` | superfici, bordi, testo grande |
| `--red-text` | `#A54C3D` | = `--red` | **testo** rosso |
| `--sage-text` | `#526B64` | = `--sage` | **testo** salvia |

**Contrasto misurato** (minimo 4.5:1 per il testo normale):
- tema chiaro: `--red` fa 3.69 su crema e 3.33 su sabbia, `--sage` 3.13 e 2.82,
  quindi **non passano come testo**. Per il testo si usano `--red-text` (5.01 e
  4.51) e `--sage-text` (5.08 e 4.58)
- tema scuro: passano tutti; `--red-text` e `--sage-text` coincidono con
  `--red` e `--sage`

**Regole d'uso**
- Testo rosso o salvia: sempre `--red-text` e `--sage-text`, mai `--red` e
  `--sage`
- Rosso: stato "solo asporto", un pulsante per schermata, prezzi in evidenza
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

| Ruolo | Font | Uso |
|---|---|---|
| Script | Indian (Billy Argel) | marchio, nome, richiami caldi. Mai paragrafi |
| Display | Yankee Clipper (Iconian) | titoli di sezione, etichette, hero |
| Testo | Literata | paragrafi, menu, recensioni |
| Dati | Martian Mono | orari, prezzi, indirizzo |

Literata e Martian Mono sono OFL, in `public/fonts/` come `.woff2` locali con la
licenza accanto: solo sottoinsieme latin e solo i pesi usati (Literata regolare,
corsivo e grassetto 700; Martian Mono regolare). Si precarica solo Literata
regolare. Indian e Yankee Clipper restano `.ttf` per ora (conversione in
`.woff2` nella Fase 6).

**Yankee Clipper non va mai nel testo lungo**: è un display, in un menu o in un
paragrafo diventa illeggibile.

L'accoppiata forte è **script caldo sopra display pesante**: "Home of the" in
corsivo, "MEDICINE MAN" in blocco. È il linguaggio delle insegne americane.

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
- Bordi spessi (2-6 px) nel colore del testo, nessuna ombra, angoli al massimo 2 px

## L'orologio a tre stati

```
APERTO · consumo sul posto fino alle 02:00     (salvia)
SOLO ASPORTO · chiude tra 23 minuti            (rosso)
CHIUSO · apre alle 08:00                       (muted)
```

**Gli stati non si distinguono mai solo col colore**: ognuno ha sempre anche il
suo testo e la sua icona, così si leggono anche senza vedere i colori.

Sempre visibile in header. Calcolato su `Europe/Amsterdam` con
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
