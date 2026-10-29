# Proposta per Yanks — documento NL/EN (2026-10-29)

Da allegare all'email (docs/11, punto 2), come PDF. Da rileggere **tutto** da
Pietro prima dell'invio; l'olandese l'ha scritto Claude: meglio farlo rileggere da
chi lo parla.

## Note per Pietro (non mandare)

**Prezzi verificati il 2026-10-29 sulle pagine ufficiali** (da ricontrollare il
giorno dell'invio, se passa più di qualche settimana):
- Shopify NL, https://www.shopify.com/nl/prijzen: Basic 27 €/mese (mensile) o
  19 €/mese (annuale); Grow 74 o 56. Shopify Payments, carte online e iDEAL:
  Basic 1,9% + 0,25 €, Grow 1,8% + 0,25 €. Provider esterno: +2% (Basic), +1%
  (Grow). Prova: 3 giorni gratis, poi 1 €/mese per 3 mesi. **La pagina non dice se
  i prezzi sono con o senza IVA**
- Stripe NL, https://stripe.com/nl/pricing: carte EER standard 1,5% + 0,25 €,
  premium 2,8% + 0,25 €, VK 2,5% + 0,25 €, internazionali 3,15% + 0,25 €, +2% se
  serve il cambio; nessun costo fisso o mensile
- Stripe, metodi locali, https://stripe.com/en-nl/pricing/local-payment-methods:
  iDEAL | Wero 0,29 €, Bancontact 0,35 €, Klarna (NL, BE, DE) 2,99% + 0,35 €,
  PayPal 0,2% + 0,10 € più le commissioni PayPal, Revolut Pay e Amazon Pay
  1,5% + 0,25 €
- Cloudflare, piano gratuito: Workers 100.000 richieste al giorno
  (https://developers.cloudflare.com/workers/platform/pricing/), D1 5 GB in totale,
  5 milioni di righe lette e 100.000 scritte al giorno
  (https://developers.cloudflare.com/d1/platform/limits/)
- Resend, piano gratuito: 3.000 email al mese, 100 al giorno
  (https://resend.com/pricing)

**Il punto delicato: il pagamento.** Stripe vieta "Cannabis dispensaries and
related businesses", anche dove è legale (https://stripe.com/legal/restricted-businesses).
Anche Shopify Payments esclude "cannabis and related products"
(https://help.shopify.com/en/manual/payments/shopify-payments/eligibility), e un
membro dello staff di Shopify nella community dice che esclude anche prodotti e
accessori per fumatori (accendini, posacenere): **non è una pagina ufficiale**. Con
Shopify, quindi, quasi certamente servirebbe un provider esterno, con il +2% di
Shopify. Il nostro shop è scritto per Stripe: se Stripe non accetta Yanks, la parte
del pagamento (checkout e webhook) va riscritta per un altro provider. Il documento
lo dice apertamente: meglio che lo sappiano da noi.

**Da decidere tu prima dell'invio:**
- l'offerta: ho scritto "regalo, e se volete un contributo libero". Se preferisci
  solo regalo o solo offerta libera, si toglie una frase
- se offrirti di fare tu i passi per il lancio (ho scritto "posso aiutare", senza
  promettere tempi né prezzi)
- licenze dei font: il prezzo non l'ho verificato, il documento non dà cifre

**Esempio di calcolo** (iDEAL, felpa da 45 € + spedizione NL 6,95 € = 51,95 €):
Stripe 0,29 €; Shopify Payments 1,9% × 51,95 + 0,25 = 1,24 €. Cento ordini così in
un anno: 29 € contro 124 € di commissioni, più 228 € di abbonamento Basic annuale
(352 € in tutto). Con un provider esterno, Shopify aggiunge 1,04 € (2%) a ordine,
oltre al costo del provider.

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
- **Geen cookies en geen cookiebanner**: Google Maps en Instagram laden pas als
  iemand erop klikt.
- **Snel en toegankelijk**: in Lighthouse, de meting van Google, 94–100 voor
  snelheid en 100 voor toegankelijkheid.

## Wat de shop kost, vergeleken met Shopify

Prijzen van 29 oktober 2026, van de officiële pagina's van Shopify en Stripe.

| | Deze shop | Shopify Basic |
|---|---|---|
| Abonnement | € 0 | € 19 per maand bij jaarbetaling (€ 228 per jaar), € 27 per maand bij maandbetaling |
| iDEAL \| Wero | € 0,29 per betaling (Stripe) | 1,9% + € 0,25 (Shopify Payments) |
| Kaart uit de EU | 1,5% + € 0,25 (Stripe, standaardkaart) | 1,9% + € 0,25 (Shopify Payments) |
| Met een andere betaalprovider | — | 2% extra per bestelling, naast de kosten van de provider |

Shopify vermeldt niet of de prijzen inclusief btw zijn.

**Voorbeeld.** Een hoodie van € 45 met verzending in Nederland (€ 6,95), samen
€ 51,95, betaald met iDEAL: € 0,29 bij Stripe, € 1,24 bij Shopify Payments. Bij
honderd van zulke bestellingen per jaar: ongeveer € 29 tegenover € 352 (€ 228
abonnement en € 124 transactiekosten).

De hosting, de server en de database draaien op gratis abonnementen van
Cloudflare; de e-mails op het gratis abonnement van Resend (3.000 per maand).
Voor een merchshop is dat ruim voldoende. Wat overblijft: de domeinnaam die
jullie al hebben, en een licentie voor twee lettertypes als de site echt online
gaat.

## Eerlijk gezegd: de betaalprovider

Stripe accepteert geen cannabisbedrijven en "gerelateerde bedrijven", ook niet
waar het legaal is. Shopify Payments sluit cannabis en gerelateerde producten
ook uit. Voor allebei moet dus eerst worden nagevraagd of een shop met alleen
merch wordt geaccepteerd. Zegt Stripe nee, dan moet het betaalgedeelte van de
shop worden aangepast aan een andere provider. Bij Shopify zou je in dat geval
ook een andere provider nodig hebben, plus 2% extra voor Shopify.

## Wat er nog moet gebeuren voor een echte lancering

- De bedrijfsgegevens in de voorwaarden: rechtsvorm en naam, KvK, btw-nummer,
  e-mailadres, retouradres, wie de retourzending betaalt en de levertijd. Daarna
  een controle door een jurist.
- Een eigen Stripe-account voor Yanks (of een andere provider, zie hierboven).
- Jullie domein verifiëren bij Resend, zodat de e-mails van jullie adres komen.
  Nu gaan ze alleen naar mij, in testmodus.
- Een licentie voor de lettertypes Indian en Yankee Clipper, of andere
  lettertypes kiezen.
- De Nederlandse en Duitse teksten laten nalezen door een moedertaalspreker.
- Een fout herstellen: drie producten met kleuren (hoodie, Ton sur Ton en
  Clipper) staan in de catalogus ten onrechte als "uitverkocht".
- De site vindbaar maken in Google. Dat staat nu bewust uit, zodat het ontwerp
  niet voor jullie officiële site wordt aangezien, en gaat alleen aan met
  jullie akkoord.

## Mijn aanbod

Het ontwerp is een cadeau: jullie mogen het gebruiken zonder iets te betalen.
Willen jullie toch iets teruggeven, dan bepalen jullie zelf het bedrag. Als
jullie willen, help ik met de stappen hierboven.

Het logo, de foto's en de teksten blijven van jullie, en zonder jullie
toestemming wordt er niets gepubliceerd.

[il tuo nome] · [telefono / Instagram]

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
- **No cookies and no cookie banner**: Google Maps and Instagram only load when
  someone clicks them.
- **Fast and accessible**: in Lighthouse, Google's measurement, 94–100 for speed
  and 100 for accessibility.

## What the shop costs, compared with Shopify

Prices of 29 October 2026, from the official Shopify and Stripe pages.

| | This shop | Shopify Basic |
|---|---|---|
| Subscription | € 0 | € 19 a month billed yearly (€ 228 a year), € 27 a month billed monthly |
| iDEAL \| Wero | € 0.29 per payment (Stripe) | 1.9% + € 0.25 (Shopify Payments) |
| EU card | 1.5% + € 0.25 (Stripe, standard card) | 1.9% + € 0.25 (Shopify Payments) |
| With another payment provider | — | 2% extra per order, on top of the provider's fees |

Shopify does not say whether its prices include VAT.

**Example.** A € 45 hoodie with shipping in the Netherlands (€ 6.95), € 51.95 in
total, paid with iDEAL: € 0.29 with Stripe, € 1.24 with Shopify Payments. With a
hundred such orders a year: about € 29 against € 352 (€ 228 subscription and
€ 124 transaction fees).

Hosting, server and database run on Cloudflare's free plans; the emails on
Resend's free plan (3,000 a month). For a merch shop that is plenty. What
remains: the domain you already have, and a licence for two fonts if the site
really goes live.

## To be honest: the payment provider

Stripe does not accept cannabis businesses and "related businesses", not even
where it is legal. Shopify Payments also excludes cannabis and related products.
For both, it has to be checked first whether a shop with only merch is accepted.
If Stripe says no, the payment part of the shop has to be adapted to another
provider. With Shopify you would then also need another provider, plus 2% extra
for Shopify.

## What is still needed for a real launch

- The company details in the terms: legal form and name, KvK, VAT number, email
  address, return address, who pays for returns and the delivery time. Then a
  check by a lawyer.
- A Stripe account of your own (or another provider, see above).
- Verifying your domain with Resend, so the emails come from your address. Now
  they only reach me, in test mode.
- A licence for the fonts Indian and Yankee Clipper, or choosing other fonts.
- Having the Dutch and German texts proofread by a native speaker.
- Fixing a bug: three products with colours (hoodie, Ton sur Ton and Clipper)
  wrongly show as "sold out" in the catalogue.
- Making the site findable on Google. That is switched off on purpose for now, so
  the design is not mistaken for your official site, and it only goes on with
  your approval.

## My offer

The design is a gift: you can use it without paying anything. If you would still
like to give something back, you choose the amount. If you want, I can help with
the steps above.

The logo, photos and texts stay yours, and nothing gets published without your
permission.

[il tuo nome] · [telefono / Instagram]
