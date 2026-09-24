# Animazioni: dove guardare e cosa usare

Regola d'uso: da questi posti si prende la **tecnica**, mai il risultato.
Si guarda come è fatto un effetto, lo si rifà con i nostri colori, i nostri font
e i nostri contenuti. Copiare una pagina intera si vede, e in un portfolio è
peggio che non avere l'effetto.

## Dove studiare gli effetti

**Codrops** (tympanus.net/codrops) — la miniera vera. Ogni articolo è un effetto
spiegato con demo e codice scaricabile, licenza permissiva. Cerca "text effect",
"hover", "scroll animation", "cursor". È il primo posto dove andare.

**Awwwards** (awwwards.com) — siti premiati. Serve per capire il livello e rubare
idee di ritmo, non codice. Guarda la sezione "Sites of the Day".

**Godly** (godly.website) — selezione di siti con gusto, meno patinata di
Awwwards. Buona per la direzione estetica.

**CodePen** (codepen.io) — cerca l'effetto per nome ("split text reveal",
"magnetic button", "custom cursor"). Occhio alla licenza dei singoli pen.

**Animate UI** (animate-ui.com) — componenti animati belli e moderni, utili come
catalogo di idee per hover, pulsanti e transizioni. **Solo da guardare**: sono
componenti React con Motion, fuori dal nostro stack. Il suo MCP installa quei
componenti nel progetto, quindi non si aggiunge. Si vede l'effetto, lo si rifà
con CSS e GSAP.

**Refero** (refero.design) e **Land-book** (land-book.com) — raccolte di pagine
reali, utili per vedere come si strutturano hero e sezioni.

## Le librerie che useremo

**GSAP** con **ScrollTrigger** — lo standard per animazioni legate allo scroll.
Dalla versione 3.13 (primavera 2025) è completamente gratuito, plugin compresi e
anche per uso commerciale. Documentazione eccellente e tantissimi esempi ufficiali. È quella che ci serve per le tre cose
che vuoi: testo che si deforma, scroll che rompe le regole, sequenze complesse.

**Lenis** (lenis.darkroom.engineering) — scroll morbido. Non la usiamo: altera
lo scroll nativo, peggiora l'accessibilità e aggiunge una dipendenza per un
effetto che non serve.

**SplitText di GSAP** — spezza un titolo in lettere, parole o righe per animarle
una per una. Riscritto nel 2025: più leggero, con accessibilità per gli screen
reader già inclusa. Da preferire a Splitting.js.

**Motion** (motion.dev) — alternativa più leggera a GSAP. Non la usiamo: una
libreria di animazione basta, e GSAP copre tutto quello che ci serve.

**Lottie** (lottiefiles.com) — animazioni vettoriali esportate da After Effects.
Utile solo se hai animazioni illustrate, per noi probabilmente no.

## I tre effetti che ci servono, e come si fanno

**Testo che si deforma o scorre**
- Nastro infinito con l'orario: un `div` duplicato che trasla in loop, fermato da
  `prefers-reduced-motion`. Nessuna libreria, bastano 15 righe di CSS
- Titolo che entra lettera per lettera sfalsato: SplitText più un `stagger`
- Indian e Yankee Clipper non hanno assi variabili: niente animazione del peso,
  si usa lo sfalsamento. Lo script Indian va animato **per parola**, non per
  lettera, altrimenti le legature si spezzano

**Cursore fuori dagli schemi**
- Si nasconde il cursore con `cursor: none` e si segue il puntatore con un
  elemento fisso, interpolando la posizione per dargli inerzia
- Sopra le foto diventa un blocco pieno che inverte i colori con
  `mix-blend-mode: difference`
- **Obbligatorio**: su touch il cursore custom non esiste, va disattivato. E
  quando è attivo, i link devono restare cliccabili con la tastiera

**Scroll che rompe le regole**
- Sezioni che si incastrano: `position: sticky` più ScrollTrigger
- Parallasse leggera sulle immagini: elementi che si muovono a velocità diverse
- Scorrimento orizzontale dentro una sezione verticale: classico di ScrollTrigger

## Come si carica GSAP in Astro

Solo nelle pagine che lo usano, dentro uno `<script>` del componente. Astro lo
impacchetta e lo scarica solo lì. Ogni effetto è una funzione in `src/lib/`,
riusata dove serve: niente codice di animazione copiato tra componenti.

Prima di avviare qualsiasi animazione:
```ts
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduce) return
```

## I limiti da rispettare

- `prefers-reduced-motion: reduce` disattiva tutto. Non è cortesia, è
  accessibilità: per alcune persone queste animazioni danno nausea vera
- Si animano solo `transform` e `opacity`. Animare `width`, `top` o `margin`
  fa scattare il layout e il telefono arranca
- Su mobile si tagliano gli effetti pesanti. Il cursore custom sparisce da solo,
  la parallasse va ridotta
- Un effetto per sezione. Tre effetti contemporanei non sono contemporanei,
  sono confusione
- Il contenuto deve essere leggibile anche se il JavaScript non parte
- Il nastro con l'orario deve avere un pulsante di pausa: un contenuto che scorre
  da solo per più di cinque secondi deve poter essere fermato (WCAG 2.2.2)
