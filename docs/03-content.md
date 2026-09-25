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
  founded: null,          // DA VERIFICARE: le fonti dicono "37 anni" o "oltre 30"
  companyFounded: 1995,   // registrazione societaria
  social: {
    facebook: "https://www.facebook.com/yankscoffeeshop",
    instagram: "https://www.instagram.com/yanksindianclub/",
  },
  cannabisMenuUrl: "https://yanks.coffeeshopmenu.nl",
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
Da esporre chiaramente, ma solo dopo verifica:
- Vietato ai minori di 18 anni, documento obbligatorio
- Massimo 5 grammi per persona al giorno
- Niente alcol nel coffeeshop

**Turisti**: ammessi. Il criterio di residenza non viene applicato, verificato
di persona. Il sito può dirlo chiaramente, perché è una delle prime domande che si
fa un turista.

**Divieto di pubblicità.** La normativa vieta di promuovere il prodotto. Il sito
parla del posto, non della merce: niente varietà, niente prezzi della cannabis.
Il menu resta sul servizio esterno, raggiungibile con un link.

## Menu food & drink

- **Tosti** — kaas, ham-kaas, vlam
- **Pizza** — salami, chorizo, margherita, hawaii, prosciutto
- **Caffetteria** — caffè 2,75 · espresso 2,75 · cappuccino 3,25 · latte
  macchiato 3,25 · caffellatte 3,25 · cioccolata 3,25 · con panna 3,75 · tè 2,75 ·
  tè alla menta fresca 3,25
- **Bibite — tutte 3,25 €**, per marca e collassate: Coca-Cola (5) · Fanta (4) ·
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
- [ ] Testo della pagina `our-story` e anno di apertura
- [ ] Prezzi di tosti e pizza
- [ ] Prezzi di cappelli e beanie
- [ ] Foto in alta risoluzione (per un concept vanno bene quelle del sito)
- [ ] Traduzioni in tedesco riviste da un madrelingua
