# Proposta per Yanks — documento NL/EN (2026-10-29, aggiornato il 2026-11-02)

Da allegare all'email (docs/11, punto 2), come PDF. Da rileggere **tutto** da
Pietro prima dell'invio; l'olandese l'ha scritto Claude: meglio farlo rileggere da
chi lo parla.

## Note per Pietro (non mandare)

**Prezzi verificati il 2026-11-02 sulle pagine ufficiali** (prima verifica il
2026-10-29: Stripe e Shopify sono invariati; da ricontrollare il giorno dell'invio,
se passa più di qualche settimana):
- Shopify NL, https://www.shopify.com/nl/prijzen (dall'Italia rimanda a `/it/prezzi`:
  aprire `?country=nl&lang=nl`): Basic 27 €/mese (mensile) o
  19 €/mese (annuale); Grow 74 o 56. Shopify Payments, carte online e iDEAL:
  Basic 1,9% + 0,25 €, Grow 1,8% + 0,25 €. Provider esterno: +2% (Basic), +1%
  (Grow). Prova: 3 giorni gratis, poi 1 €/mese per 3 mesi. **A schermo la pagina
  non dice se i prezzi sono con o senza IVA**
- Stripe NL, https://stripe.com/nl/pricing: carte EER standard 1,5% + 0,25 €,
  premium 2,8% + 0,25 €, VK 2,5% + 0,25 €, internazionali 3,15% + 0,25 €, +2% se
  serve il cambio; nessun costo fisso o mensile
- Stripe, metodi locali, https://stripe.com/en-nl/pricing/local-payment-methods:
  iDEAL | Wero 0,29 €, Bancontact 0,35 €, Klarna (NL, BE, DE) 2,99% + 0,35 €,
  PayPal 0,2% + 0,10 € più le commissioni PayPal, Revolut Pay e Amazon Pay
  1,5% + 0,25 €
- PayPal NL, https://www.paypal.com/nl/business/paypal-business-fees (la pagina
  dice "Laatst bijgewerkt: 15 juli 2026"): pagamento con conto PayPal 3,40% +
  0,35 €; carta di chi non ha un conto PayPal 1,80% + 0,35 €; nessun sovrapprezzo
  dentro il SEE; iDEAL, come "altro metodo di pagamento" (APM), 0,29 €; nessun
  costo mensile; contestazione 14 €. La pagina non parla di IVA. La pagina legale
  https://www.paypal.com/nl/legalhub/paypal/merchant-fees dà errore 404
- iDEAL via PayPal, https://developer.paypal.com/ideal e
  https://developer.paypal.com/api/orders-v2/ideal (aggiornate il 14/10/2026):
  disponibile per un'attività olandese, ma **va chiesto e approvato a parte**,
  dopo aver accettato l'accordo APM
- PayPal Acceptable Use Policy,
  https://www.paypal.com/nl/legalhub/paypal/acceptableuse-full (aggiornata il
  17/07/2023): vietati "narcotics", "drug paraphernalia" (in olandese "aan
  verboden middelen verwante artikelen"), "cigarettes"; serve approvazione per
  "Non-cigarette tobacco products, e-cigarettes, cigars". **Accendini, posacenere e
  portasigarette non sono nominati**, e nemmeno la cannabis
- Cloudflare, piano gratuito: Workers 100.000 richieste al giorno
  (https://developers.cloudflare.com/workers/platform/pricing/), D1 5 GB in totale,
  5 milioni di righe lette e 100.000 scritte al giorno
  (https://developers.cloudflare.com/d1/platform/limits/)
- Resend, piano gratuito: 3.000 email al mese, 100 al giorno
  (https://resend.com/pricing)

**Il punto delicato: il pagamento.** Stripe vieta "Cannabis dispensaries and
related businesses", anche dove è legale (https://stripe.com/legal/restricted-businesses,
ricontrollata il 2026-11-02; la pagina non ha data). Non prevede eccezioni per chi
vende solo merch, ma **non lo scrive nemmeno**, e le FAQ collegate non parlano di
merch: nel documento c'è "un no è probabile", non "è sicuro".
Anche Shopify Payments esclude "cannabis and related products"
(https://help.shopify.com/en/manual/payments/shopify-payments/eligibility), e un
membro dello staff di Shopify nella community dice che esclude anche prodotti e
accessori per fumatori (accendini, posacenere): **non è una pagina ufficiale**. Con
Shopify, quindi, quasi certamente servirebbe un provider esterno, con il +2% di
Shopify. Il nostro shop è scritto per Stripe: se Stripe non accetta Yanks, la parte
del pagamento (checkout e webhook) va riscritta per un altro provider. Il documento
lo dice apertamente: meglio che lo sappiano da noi.

**Piano B: PayPal diretto.** La policy di PayPal elenca prodotti, non tipi di
locale: per il merch neutro un sì è più probabile, ma non promesso. Da chiedere a
PayPal prima del lancio, con il catalogo: accendini, posacenere, portasigarette e
mystery box. Due cose da non confondere: oggi PayPal è nello shop **tramite
Stripe** (se Stripe dice no, sparisce anche quello); e iDEAL, il metodo più usato
in Olanda, con PayPal costa uguale ma va approvato a parte. Nel piano semplice con
PayPal restano iDEAL (se approvato) e il pulsante PayPal (conto o carta). Klarna è
tra i metodi alternativi della pagina tariffe di PayPal NL (2,99% + 0,35 €);
Apple Pay, Google Pay, Bancontact, Revolut Pay e Amazon Pay con PayPal **non li ho
verificati**: nel documento non si dice che si perdono.

**Da decidere tu prima dell'invio:**
- l'offerta: ho scritto "regalo, e se volete un contributo libero". Se preferisci
  solo regalo o solo offerta libera, si toglie una frase
- se offrirti di fare tu i passi per il lancio (ho scritto "posso aiutare", senza
  promettere tempi né prezzi)
- licenze dei font: il prezzo non l'ho verificato, il documento non dà cifre

**Esempio di calcolo** (felpa da 45 € + spedizione NL 6,95 € = 51,95 €). La
commissione si arrotonda al centesimo per ogni ordine, poi si moltiplica per 100:
- iDEAL: Stripe 0,29 € (PayPal uguale, se approvato); Shopify Payments 1,9% ×
  51,95 + 0,25 = 1,23705 → 1,24 €. Cento ordini: 29 € contro 124 € + 228 € di
  abbonamento Basic annuale = 352 €. Differenza circa 323 €
- conto PayPal (PayPal diretto): 3,40% × 51,95 + 0,35 = 2,1163 → 2,12 €; su
  Shopify più il 2%, 2% × 51,95 = 1,039 → 1,04 €, quindi 3,16 €. Cento ordini:
  212 € contro 316 € + 228 € = 544 €. Differenza circa 332 €. Oggi, con PayPal
  dentro Stripe, si aggiungono 0,2% + 0,10 € = 0,2039 → 0,20 €: circa 2,32 €
- nel documento: "ruim € 320" (le due differenze sono 323 e 332 €)
- non verificato se l'iDEAL di PayPal funzioni dentro Shopify: sarebbe 1,04 +
  0,29 = 1,33 € a ordine, 361 € l'anno. Nel documento non c'è

---

## Nederlands

# Een nieuw ontwerp voor yanks.nl

Bekijken: https://yanks-redesign.pietro-costa25.workers.dev/nl/

De site staat in testmodus: er wordt niets afgerekend of verzonden, en Google
toont de pagina's niet. Het is een persoonlijk project, geen opdracht.

## Wat er klaarstaat

- **De hele site in het Nederlands, Engels en Duits**, met een licht en een donker
  thema. 's Avonds (20:00–08:00) gaat het donkere thema vanzelf aan.
- **De openingstijden live**, altijd op Nederlandse tijd: open, alleen afhalen
  (02:00–02:45) of gesloten. Ook voor wie vanuit Londen of Lissabon kijkt.
- **Menu, route, huisregels** en de twaalf kaarten over verantwoord gebruik,
  goed leesbaar op de telefoon.
- **Een werkende webshop voor de merch**: productpagina's met kleur en maat,
  winkelwagen en afrekenen via Stripe (iDEAL | Wero, kaart, Apple Pay, Google Pay,
  PayPal, Klarna, Bancontact, Amazon Pay, Revolut Pay). De klant krijgt een
  bevestigingsmail; jullie krijgen bij elke bestelling een melding met het
  verzendadres.
- **Verzendkosten per land**, algemene voorwaarden, herroepingsrecht met
  modelformulier en privacy, op één pagina.
- **Reviews van gasten**: de nieuwste Google-reviews op de homepage, in hun eigen
  taal.
- **Geen cookies en geen cookiebanner**: Google Maps en Instagram laden pas als
  iemand erop klikt.
- **Snel en toegankelijk**: in Lighthouse, de meting van Google, 94–100 voor
  snelheid en 100 voor toegankelijkheid.

## Wat de shop kost, vergeleken met Shopify

Prijzen van 2 november 2026, van de officiële pagina's van Shopify, Stripe en
PayPal.

**Voorbeeld:** een hoodie van € 45 met verzending in Nederland (€ 6,95), samen
€ 51,95. Wat jullie per bestelling betalen, en bij honderd van zulke bestellingen
per jaar:

| Betaald met | Deze shop | Shopify Basic |
|---|---|---|
| iDEAL | € 0,29 (Stripe; bij PayPal hetzelfde, als PayPal iDEAL goedkeurt) | € 1,24 (Shopify Payments\*) |
| PayPal-rekening | € 2,12 (PayPal, rechtstreeks gekoppeld) | € 3,16 (€ 1,04 voor Shopify en € 2,12 voor PayPal) |
| Abonnement | € 0 | € 228 per jaar (€ 19 per maand bij jaarbetaling, € 27 bij maandbetaling) |
| **100 bestellingen per jaar met iDEAL** | **ongeveer € 29** | **ongeveer € 352** |
| **100 bestellingen per jaar met PayPal** | **ongeveer € 212** | **ongeveer € 544** |

**Bij honderd bestellingen per jaar kost deze shop ruim € 320 minder dan
Shopify**, met welke betaalmethode de klant ook betaalt. Hoe meer bestellingen,
hoe groter het verschil.

\* Shopify Payments sluit cannabis en gerelateerde producten uit: voor Yanks is het
waarschijnlijk niet beschikbaar. Met een andere betaalprovider rekent Shopify Basic
2% extra per bestelling, naast de kosten van de provider.

Een kaart uit de EU kost 1,5% + € 0,25 bij Stripe (standaardkaart), 1,80% + € 0,35
bij PayPal (zonder PayPal-rekening) en 1,9% + € 0,25 bij Shopify Payments.

Shopify vermeldt op de prijspagina niet of de prijzen inclusief btw zijn.

De hosting, de server en de database draaien op gratis abonnementen van
Cloudflare; de e-mails op het gratis abonnement van Resend (3.000 per maand).
Voor een merchshop is dat ruim voldoende. Wat overblijft: de domeinnaam die
jullie al hebben, en een licentie voor twee lettertypes als de site echt online
gaat.

## Eerlijk gezegd: de betaalprovider

Stripe accepteert geen "cannabis dispensaries and related businesses", ook niet
waar cannabis legaal is, en maakt geen uitzondering voor een shop met alleen
merch. Het account zou op naam van Yanks staan, dus een nee is waarschijnlijk;
zeker weten doe je het pas als Stripe antwoordt. Shopify Payments sluit cannabis
en gerelateerde producten ook uit.

**Het plan B is PayPal.** De regels van PayPal gaan over producten, niet over het
soort bedrijf: verboden zijn onder meer drugs, "aan verboden middelen verwante
artikelen" en sigaretten, en voor andere tabaksproducten is toestemming nodig.
Kleding en neutrale accessoires vallen daar niet onder, dus de kans op een ja is
groter. Een belofte is het niet. Aanstekers, asbakken en de sigarettenkoker
worden in die regels niet genoemd: dat moet vóór de lancering aan PayPal worden
gevraagd, met de hele catalogus erbij.

Goed om te weten:
- PayPal zit nu al in de shop, maar via Stripe. Zegt Stripe nee, dan verdwijnt
  dat ook. Het plan B is een eigen PayPal-account, rechtstreeks gekoppeld.
- iDEAL, in Nederland de meest gebruikte manier om online te betalen, kan ook via
  PayPal, voor hetzelfde bedrag (€ 0,29). PayPal moet het wel apart goedkeuren.
- Met PayPal moet het betaalgedeelte van de shop worden aangepast; de rest blijft
  hetzelfde. In de eenvoudigste opzet blijven iDEAL en de PayPal-knop (met een
  PayPal-rekening of een kaart) over. Klarna staat ook in de tarieven van PayPal
  Nederland. Of Apple Pay, Google Pay, Bancontact, Revolut Pay en Amazon Pay, die
  nu via Stripe werken, ook via PayPal kunnen, is nog niet nagekeken.

Bij Shopify zou je in dat geval ook een andere provider nodig hebben, plus 2%
extra voor Shopify.

## Wat er nog moet gebeuren voor een echte lancering

- De bedrijfsgegevens in de voorwaarden: rechtsvorm en naam, KvK, btw-nummer,
  e-mailadres, retouradres, wie de retourzending betaalt en de levertijd. Daarna
  een controle door een jurist.
- Een eigen account voor Yanks bij Stripe of PayPal, nadat zij hebben bevestigd
  dat de shop wordt geaccepteerd (zie hierboven).
- Jullie domein verifiëren bij Resend, zodat de e-mails van jullie adres komen.
  Nu gaan ze alleen naar mij, in testmodus.
- Een licentie voor de lettertypes Indian en Yankee Clipper, of andere
  lettertypes kiezen.
- De Nederlandse en Duitse teksten laten nalezen door een moedertaalspreker.
- De site vindbaar maken in Google. Dat staat nu bewust uit, zodat het ontwerp
  niet voor jullie officiële site wordt aangezien, en gaat alleen aan met
  jullie akkoord.
- Als jullie willen: de reviews op de homepage vanzelf laten bijwerken via jullie
  eigen Google-bedrijfsprofiel. Nu zet ik er met de hand de nieuwste op.

## Mijn aanbod

Het ontwerp is een cadeau: jullie mogen het gebruiken zonder iets te betalen.
Willen jullie toch iets teruggeven, dan bepalen jullie zelf het bedrag. Als
jullie willen, help ik met de stappen hierboven.

Alles kan anders: teksten, foto's, kleuren, producten, prijzen, talen en
onderdelen. Op de site staat een nieuw logo, maar jullie kunnen ook gewoon jullie
eigen logo houden. Het is jullie site: het logo, de foto's en de teksten blijven
van jullie, en zonder jullie toestemming wordt er niets gepubliceerd.

Pietro Costa · [telefono / Instagram]

---

## English

# A new design for yanks.nl

Have a look: https://yanks-redesign.pietro-costa25.workers.dev/en/

The site runs in test mode: nothing is charged or shipped, and Google does not
show the pages. It is a personal project, not a commission.

## What is ready

- **The whole site in Dutch, English and German**, with a light and a dark theme.
  In the evening (20:00–08:00) the dark theme switches on by itself.
- **Opening hours live**, always on Dutch time: open, takeaway only
  (02:00–02:45) or closed. Also for someone looking from London or Lisbon.
- **Menu, directions, house rules** and the twelve cards on responsible use,
  easy to read on a phone.
- **A working shop for the merch**: product pages with colour and size, cart and
  checkout through Stripe (iDEAL | Wero, card, Apple Pay, Google Pay, PayPal,
  Klarna, Bancontact, Amazon Pay, Revolut Pay). The customer gets a confirmation
  email; you get a notice with the shipping address for every order.
- **Shipping costs per country**, terms of sale, right of withdrawal with the
  model form, and privacy, on one page.
- **Guest reviews**: the latest Google reviews on the homepage, in their own
  language.
- **No cookies and no cookie banner**: Google Maps and Instagram only load when
  someone clicks them.
- **Fast and accessible**: in Lighthouse, Google's measurement, 94–100 for speed
  and 100 for accessibility.

## What the shop costs, compared with Shopify

Prices of 2 November 2026, from the official Shopify, Stripe and PayPal pages.

**Example:** a € 45 hoodie with shipping in the Netherlands (€ 6.95), € 51.95 in
total. What you pay per order, and for a hundred such orders a year:

| Paid with | This shop | Shopify Basic |
|---|---|---|
| iDEAL | € 0.29 (Stripe; the same with PayPal, if PayPal approves iDEAL) | € 1.24 (Shopify Payments\*) |
| PayPal account | € 2.12 (PayPal, connected directly) | € 3.16 (€ 1.04 for Shopify and € 2.12 for PayPal) |
| Subscription | € 0 | € 228 a year (€ 19 a month billed yearly, € 27 billed monthly) |
| **100 orders a year with iDEAL** | **about € 29** | **about € 352** |
| **100 orders a year with PayPal** | **about € 212** | **about € 544** |

**With a hundred orders a year, this shop costs more than € 320 less than
Shopify**, whichever payment method the customer uses. The more orders, the bigger
the difference.

\* Shopify Payments excludes cannabis and related products, so it is probably not
available to Yanks. With another payment provider, Shopify Basic charges 2% extra
per order, on top of the provider's fees.

An EU card costs 1.5% + € 0.25 with Stripe (standard card), 1.80% + € 0.35 with
PayPal (without a PayPal account) and 1.9% + € 0.25 with Shopify Payments.

Shopify's pricing page does not say whether its prices include VAT.

Hosting, server and database run on Cloudflare's free plans; the emails on
Resend's free plan (3,000 a month). For a merch shop that is plenty. What
remains: the domain you already have, and a licence for two fonts if the site
really goes live.

## To be honest: the payment provider

Stripe does not accept "cannabis dispensaries and related businesses", not even
where cannabis is legal, and makes no exception for a shop that only sells merch.
The account would be in Yanks' name, so a no is likely; you only know for sure
once Stripe answers. Shopify Payments also excludes cannabis and related products.

**Plan B is PayPal.** PayPal's rules are about products, not about the kind of
business: among other things they prohibit narcotics, drug paraphernalia and
cigarettes, and other tobacco products need approval. Clothing and neutral
accessories do not fall under these, so a yes is more likely. It is not a
promise. Lighters, ashtrays and the cigarette case are not mentioned in those
rules: that needs to be checked with PayPal before the launch, with the whole
catalogue.

Good to know:
- PayPal is already in the shop, but through Stripe. If Stripe says no, that goes
  too. Plan B is a PayPal account of your own, connected directly.
- iDEAL, the most used way to pay online in the Netherlands, also works through
  PayPal, for the same fee (€ 0.29). PayPal has to approve it separately, though.
- With PayPal, the payment part of the shop has to be adapted; everything else
  stays the same. In the simplest set-up, iDEAL and the PayPal button (with a
  PayPal account or a card) remain. Klarna is also listed in PayPal Netherlands'
  fees. Whether Apple Pay, Google Pay, Bancontact, Revolut Pay and Amazon Pay,
  which now work through Stripe, can also go through PayPal has not been checked
  yet.

With Shopify you would then also need another provider, plus 2% extra for
Shopify.

## What is still needed for a real launch

- The company details in the terms: legal form and name, KvK, VAT number, email
  address, return address, who pays for returns and the delivery time. Then a
  check by a lawyer.
- An account of your own with Stripe or PayPal, once they have confirmed that
  they accept the shop (see above).
- Verifying your domain with Resend, so the emails come from your address. Now
  they only reach me, in test mode.
- A licence for the fonts Indian and Yankee Clipper, or choosing other fonts.
- Having the Dutch and German texts proofread by a native speaker.
- Making the site findable on Google. That is switched off on purpose for now, so
  the design is not mistaken for your official site, and it only goes on with
  your approval.
- If you like: letting the reviews on the homepage update by themselves through
  your own Google Business Profile. For now I add the latest ones by hand.

## My offer

The design is a gift: you can use it without paying anything. If you would still
like to give something back, you choose the amount. If you want, I can help with
the steps above.

Everything can change: texts, photos, colours, products, prices, languages and
sections. The site has a new logo, but you can also simply keep your own. It's
your site: the logo, photos and texts stay yours, and nothing gets published
without your permission.

Pietro Costa · [telefono / Instagram]
