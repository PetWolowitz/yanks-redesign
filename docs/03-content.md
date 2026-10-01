# Contenuti e dati — Yanks redesign

Tutto ciò che è marcato **DA VERIFICARE** non si pubblica come fatto certo.
Non inventare contenuti che non sono qui.

## Dati del locale

```js
// src/data/venue.ts
export const venue = {
  name: "Yanks Indian Club",
  tagline: "Home of the Medicine Man",
  address: { street: "Dorpsplein 2", postalCode: "2042 JK", city: "Zandvoort", country: "NL" },
  coords: { lat: 52.3726, lng: 4.5250 },
  phone: "+31235719299",
  email: "info@yanks.nl",
  timezone: "Europe/Amsterdam",
  // Verificato di persona, settembre 2026
  hours: {
    everyday: true,
    open: "08:00",
    dineInUntil: "02:00", // dopo quest'ora solo asporto
    close: "02:45",
  },
  founded: 1984,          // 2026-10-01: ricamo "1984" sul cappellino del merch (cap/2.jpg), scelto da Pietro
  companyFounded: 1995,   // registrazione societaria
  social: {
    facebook: "https://www.facebook.com/yankscoffeeshop",
    instagram: "https://www.instagram.com/yanksindianclub/",
  },
};
```

## Vincoli legali dei coffeeshop

I coffeeshop olandesi sono **tollerati** solo se rispettano i criteri **AHOJG(I)**.
La **A** (*geen affichering*) vieta ogni reclame, oltre a una semplice
indicazione sul locale. Alcuni comuni la interpretano in modo largo: loghi,
adesivi, listini prezzi, luci verdi.

Fonti: i regolamenti comunali su lokaleregelgeving.overheid.nl.

**Zandvoort — la regola che vale per Yanks** (verificata il 25-09-2026)
*Coffeeshopbeleid 2019 gemeente Zandvoort*, **CVDR625741**, in vigore dal
1° gennaio 2019 e ancora vigente ("geldend van 05-07-2019 t/m heden"):
- **Criterio A**: *"Geen Affichering; behalve een summiere aanduiding van de
  lokaliteit mag géén reclame worden gemaakt."* Solo una indicazione sommaria
  del locale, nessuna reclame. A differenza di Wageningen non elenca esempi
  (loghi, luci, siti web): il confine si chiarisce solo con il comune
- **Chiusura** (cap. 3, punto 5): un coffeeshop può essere chiuso *"indien er
  openlijke en/of opdringerige reclame wordt gevoerd voor het gebruik van of de
  handel in verdovende middelen"*
- **Keurmerk Zandvoortse Coffeeshops** (cap. 2): un marchio di qualità a cui i
  coffeeshop di Zandvoort possono aderire, per mostrare un'impresa
  "verantwoord en veilig". Aggiunge misure su rispetto dei criteri AHOJGI,
  attenzione al cliente, formazione del personale; si assegna per un periodo
  (per esempio due anni) con un controllo annuale. **Non cambia** i requisiti
  di apertura né i criteri di chiusura; il futuro *Handhavingsbeleid* potrebbe
  prevedere sanzioni più leggere per chi lo ha. Il documento non dice se Yanks
  lo abbia: **DA VERIFICARE** prima di citarlo sul sito
- Altro: al massimo **2 coffeeshop** in centro a Zandvoort; niente alcol nei
  coffeeshop (regola nazionale dal 2007)

**Wageningen — solo un esempio di come un altro comune scrive la regola**
*Coffeeshopbeleid gemeente Wageningen 2026*, **CVDR762705**, in vigore dal
1° luglio 2026, art. 3: *"Geen affichering; reclame, anders dan een aanduiding
op de betreffende lokaliteit, is verboden."* Non si applica a Zandvoort

**Regole per il concept**
1. **Nessun prodotto di cannabis, prezzo o immagine di cannabis sul sito.** Il
   menu è solo food e drink
2. **Tono informativo, non promozionale**: orari, come arrivare, regole
   d'ingresso, uso responsabile
3. **Lo shop merch è la parte più delicata**: l'applicazione delle regole varia
   da comune a comune. Nel portfolio va scritto che per un uso reale serve una
   verifica con il comune di Zandvoort
4. **Nello shop niente accessori legati alla cannabis** (grinder, bong, rolling
   tray, glass tips): oltre al punto 1, li vieta anche Stripe (sezione Merch)

## Punti di forza da comunicare
1. **Aperto 08:00–02:45 tutti i giorni**, dalle 02:00 solo asporto
2. **A due minuti a piedi dalla spiaggia**
3. **Decenni nello stesso posto**, sulla piazza del paese
4. **Terrazza grande** con copertura apribile e lampade riscaldanti
5. **Non solo coffeeshop**: bar, biliardi, tavoli da gioco, grandi televisori,
   ordinazioni al tavolo via QR code
6. **Staff accogliente**, citato in quasi tutte le recensioni, portiere compreso
7. **Prezzi esposti** su un cartellone grande

## Come arrivare (sostituisce il lorem ipsum)
**In treno** — Da Amsterdam Centraal a Zandvoort aan Zee poco meno di
mezz'ora (verificato di persona), poi pochi minuti a piedi fino al Dorpsplein.
Il sito originale dice "20 minuti": non usarlo, scrivere "circa mezz'ora".

**In autobus** — Linea 81.

**In auto** — Parcheggio a pagamento in centro, pieno nei mesi estivi.
**DA VERIFICARE** la situazione aggiornata.

## Regole d'ingresso

**Pubblicate sul sito** — solo questa:
- **Ingresso solo dai 18 anni, con un documento d'identità valido**

**Il sito non parla di residenza**: né per dire che i turisti entrano, né per
dire il contrario.

**Contesto — NON PUBBLICARE**
- *Criterio I della politica di Zandvoort* (CVDR625741, vedi "Vincoli legali"):
  il coffeeshop è *"uitsluitend toegankelijk voor Ingezetenen van Nederland van
  18 jaar en ouder"*
- *Verifica di persona, settembre 2026*: all'ingresso il criterio di residenza
  non veniva applicato e i turisti entravano. È una pratica osservata, non una
  regola scritta, e contrasta con la politica pubblicata: per questo non va sul
  sito
- Massimo 5 grammi per persona al giorno, niente alcol nel coffeeshop (regola
  nazionale dal 2007): sono regole di vendita, non d'ingresso, e non si
  pubblicano tra le regole d'ingresso

**Divieto di pubblicità.** La normativa vieta di promuovere il prodotto. Il sito
parla del posto, non della merce: niente varietà, niente prezzi della cannabis,
**nessun link al menu della cannabis**.

## Menu food & drink

- **Tosti** — kaas, ham-kaas, vlam
- **Pizza** — salami, chorizo, margherita, hawaii, prosciutto
- **Caffetteria** (prezzi aggiornati da Pietro il 2026-10-01, da 3,00 a 3,50) —
  caffè 3,00 · espresso 3,00 · tè 3,00 · cappuccino 3,50 · latte macchiato 3,50 ·
  caffellatte 3,50 · cioccolata 3,50 · con panna 3,50 · tè alla menta fresca 3,50
- **Bibite — tutte 3,50 €** (dal 2026-10-01), per marca e collassate: Coca-Cola (5) · Fanta (4) ·
  Capri-Sun (3) · Fernandes (4) · Lipton (3) · Oasis (2) · Orangina (2) ·
  Schweppes (2) · singoli (Dr Pepper, AA energy, succo di mela, Chocomel, Fristi,
  Hawai, Poms, Taksi, Spa naturale e frizzante)
- **Funzionali** — Aloe vera (4) · Aquarius (6) · Fuze tea (4) · Maaza (3) ·
  Red Bull (4) · Sourcy (4) · Spa vitamin water (2)

Il prezzo unico si scrive una volta in testa al gruppo. Prezzi di tosti e pizza:
**DA VERIFICARE**, il sito originale non li riporta.

## Merch

```js
// Elenco rilevato da shop.yanks.nl, prezzi in euro.
// In src/data/merch.ts ogni prodotto tiene solo: slug, categoria, prezzo, taglie, limited.
// I nomi qui sotto vanno nei file di lingua, sotto shop.products.<slug>.name
// (e .description). merch.ts è l'unica fonte scritta a mano: da lì escono i
// prezzi scritti nell'HTML statico in build e il seed del database. Un prezzo si
// cambia solo qui, poi seed e nuova pubblicazione. L'addebito lo calcola il
// server dal database.
smoking: [
  { name: "Yanks Djeep Lighter", price: 3.50 },
  { name: "Yanks Clipper", price: 4.00 },
  { name: "Yanks Torch Lighter", price: 5.00 },
  { name: "Yanks Metal Cigarette Case", price: 6.00 },
  { name: "Yanks Ceramic Ashtray", price: 17.50 },
  { name: "Yanks Metal Ashtray – Zandvoort Edition", price: 17.50 },
],
clothing: [
  { name: "Yanks Indian T-shirt", price: 35.00 },
  { name: "Yanks Skull T-shirt", price: 35.00 },
  { name: "Yanks T-shirt Ton sur Ton", price: 35.00 },
  { name: "Yanks Swim Short", price: 35.00 },
  { name: "Yanks T-shirt LIMITED EDITION 1/250", price: 40.00, limited: 250 },
  { name: "Yanks Hoodies", price: 45.00 },
  { name: "Yanks Zippers", price: 45.00 },
],
special: [
  { name: "Yanks Mystery Box", price: 80.00, limited: 50 },
],
```

**Esclusi dallo shop del concept: gli accessori legati alla cannabis.** Tolti
Yanks Glass Tips, Yanks Rolling Tray, Yanks Metal Grinder, 3D Yanks Grinder e
Yanks Mini Bong / Water Pipe, anche se in vendita su shop.yanks.nl. Due motivi:
- sono accessori per consumare cannabis, e il sito non la promuove (Vincoli
  legali, regola 1)
- **Stripe non li ammette.** Nella pagina ufficiale *Prohibited and restricted
  businesses* (stripe.com/legal/restricted-businesses, aggiornata il
  22-09-2026, letta il 25-09-2026), tra le attività vietate, sotto "qualsiasi
  prodotto e servizio illecito": *attrezzature e articoli destinati alla
  produzione o all'uso di droghe* (drug paraphernalia). Nella sezione
  "Marijuana" vieta anche i prodotti a base di cannabis e *"i dispensari di
  cannabis e le attività correlate"*

Restano: abbigliamento, accendini, portasigarette, posacenere, mystery box.

**Aggiornato il 2026-09-28 da `shop.yanks.nl/products.json`** (Shopify, pubblico):
- taglie dell'abbigliamento: S, M, L, XL, 2XL, 3XL (non più DA VERIFICARE)
- aggiunti cappellino (€30) e beanie (€25), i prezzi che mancavano
- i colori (per esempio Zwart / Off White) nel concept non si scelgono: una
  variante per taglia, per tenere semplice il contratto dello shop
- foto dei prodotti: la prima di ogni prodotto, ridotta a 1000 px, in
  `src/assets/shop/`. Nessuna mostra cannabis; gli accessori mostrano tabacco.
  Gli sfondi dell'abbigliamento (tende e tramonto western) sono più "tribali"
  della direzione americana anni '50 (CLAUDE.md): sono le foto del cliente, per
  un uso reale andrebbero rifatte
- ~~non inclusi: beach bag, portachiavi, profumo per interni~~ superato il
  2026-09-29, vedi sotto

**Merch completo, 2026-09-29** (richiesta di Pietro: "tutto il merch" di
shop.yanks.nl, con le sue immagini). 21 prodotti in `merch.ts`:
- aggiunti, nella categoria nuova **Accessori**: beach bag (€17,50), portachiavi
  in metallo (€4,50), portachiavi a braccialetto (€9), profumo per interni
  Yanks x LaBlaze (€15) come **due prodotti**, Original e High Tides, perché il
  contratto dello shop conosce solo le taglie
- **esclusi, di nuovo e per gli stessi motivi** (Vincoli legali e Stripe): Rolling
  Tray, 3D Grinder, Grinders, Plastic Grinders, Mini Bong, Glass Tips, filtri
  Purize
- **tutte le foto** di ogni prodotto in `src/assets/shop/<slug>/<n>.jpg`
  (62 foto, ridotte a 1000 px): la 1 nel catalogo, tutte nella galleria della
  scheda. Escluse le sei foto del zip hoodie con un modello in primo piano:
  volti di persone non necessari
- **descrizioni** riscritte da quelle del negozio, più brevi, con i consigli di
  taglia; tolti i passaggi su "joints" e "pre-rolls"
- colori: ancora non selezionabili, citati nella descrizione

**Immagini del negozio usate fuori dallo shop** (dalla home di shop.yanks.nl):
- **logo in alta risoluzione** (`logo_main_ezrav.png`, 3200 px) in
  `src/assets/brand/yanks-logo.png` (tolto il 2026-10-01: il sito usa il logo nuovo, docs/02), ridotto a 1200 px: sostituiva il PNG da
  232 px in tutto il sito tramite `Logo.astro`. Il logo "vettoriale" di "Da
  recuperare" non serve più per il sito
- **il locale dal Dorpsplein** (`esterno.jpg`), a tutta larghezza in home e in Visit
- **l'interno con i totem** (`interno.jpg`, 720 px) accanto a "chi sono"
- **scartate**: gli interni con gli schermi del menu della cannabis sullo sfondo
  (anche se illeggibili), la foto della vetrina con i bong, le foto dei prodotti
  esclusi (grinder, bong, rolling tray, glass tips)

**Esclusi dallo shop del concept: i semi.** La vendita e la spedizione di semi
all'estero hanno regole diverse per ogni paese, e in diversi paesi dell'Unione è
vietata. Per un progetto dimostrativo non vale la pena.

Angolo narrativo: il merch è il souvenir di un posto reale. La limited edition
1/250 e la mystery box in 50 pezzi meritano spazio proprio.

## Recensioni

**Video** — schede verticali 9:16 dall'Instagram del locale. Temi: terrazza di
sera, merch, spiaggia, tavoli da gioco. Solo embed ufficiale, caricato al click.

**Scritte** — cinque recensioni Google in olandese presenti sul sito originale.
Restano in olandese, traduzione su richiesta. Altre fonti pubbliche: Tripadvisor
(la coppia che torna da 13 anni dal Brabante; il personale accogliente alla
porta) e Greenmeister. Nessuna stellina disegnata, nessun voto inventato: si cita
la fonte e si linka il profilo.

**Quali sono pubblicate** (deciso il 2026-09-28, testi in `src/data/reviews.ts`):
tre delle cinque. Escluse le due che nominano prodotti di cannabis ("weed hash",
"wiet, hasj", "edibles"), perché citarle sarebbe promozione (Vincoli legali), e
quella che è una domanda sul caricare uno scooter elettrico. Della recensione lunga
della coppia del Brabante c'è solo l'estratto su terrazza e personale, segnato con
[…]. Niente nomi degli autori. Il link porta alla scheda Google del locale.
Traduzioni: nessuna finché non c'è una rilettura.

**Riconoscimenti verificati**: Travelers' Choice di Tripadvisor, primo posto nella
vita notturna di Zandvoort. Nient'altro senza una fonte.

## Uso responsabile — le dodici schede
Dal sito originale, da riscrivere più diretto e mettere in una pagina visibile:

1. Compra nei coffeeshop, non in strada
2. Scelta tua, responsabilità tua
3. Non portarla all'estero
4. Niente guida, scuola o lavoro
5. Una tradizione antica: rilassa, dura due-quattro ore
6. Se va male: calma, posto tranquillo, qualcosa di dolce. Passa in un'ora
7. Farmaci: chiedi al medico. In gravidanza no
8. Fumo: catrame e monossido; col tabacco anche i suoi rischi
9. Alcol e cannabis non vanno d'accordo
10. Non risolve i problemi; se è quotidiana, salta qualche giorno
11. Chiedi allo staff: le potenze sono molto diverse
12. Space cake: 45-90 minuti per fare effetto, non prenderne un altro pezzo

## Da recuperare
- [x] Pagina Story (2026-10-01). **Anno di apertura: 1984**, dal ricamo sul
      cappellino del merch (src/assets/shop/cap/2.jpg); scelto da Pietro il
      2026-10-01 ("usa le fonti del merch"). Prima era 1989, letto male dalla
      stessa foto. Il testo di our-story (recuperato il 2026-09-28) è quasi tutto
      promozionale e superato: non si usa. La pagina è una cronologia con soli
      fatti (apertura, registrazione 1995, il motto sul cappellino, oggi al
      Dorpsplein 2), anni presi da venue.ts
- [x] Video per l'hero: dato da Pietro il 2026-10-01 (spiaggia di Zandvoort, 19 s).
      WebM 2,5 MB e poster WebP, vedi docs/02. Lo stesso girato, in versione
      lunga, è in Downloads come `11961033_3840_2160_30fps.mp4`: il nome è quello
      dei video di Pexels. **Fonte e licenza DA VERIFICARE con Pietro** (se è
      Pexels, la licenza permette l'uso gratuito senza attribuzione)
- [ ] Reel Instagram (2026-10-01): i due proposti da Pietro (DaoF1HCPnZn "POV: it
      is Friday high day at Yanks", DI4J5KlNTAl aftermovie del 4/20) sono
      promozionali sulla cannabis: esclusi. Le storie non si incorporano. Pietro ha
      scelto video nostri ospitati in public/video/ (vedi CLAUDE.md, Video)
- [ ] Indirizzi dei reel Instagram per le recensioni video (embed al clic)
- [x] Logo in alta risoluzione: trovato su shop.yanks.nl (3200 px), 2026-09-29
- [x] Foto dei prodotti del merch: da shop.yanks.nl, 2026-09-29
- [ ] Prezzi di tosti e pizza
- [ ] Prezzi di cappelli e beanie
- [ ] Foto in alta risoluzione (per un concept vanno bene quelle del sito)
- [ ] Traduzioni in tedesco riviste da un madrelingua
