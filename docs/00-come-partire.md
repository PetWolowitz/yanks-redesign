# Come partire e come procedere

Guida passo passo per Windows. Per ogni passaggio trovi **cosa fa**, **il
comando**, **cosa devi vedere** e **cosa fare se va storto**. Non saltare i
controlli: un problema scoperto subito si risolve in un minuto, scoperto dopo
può costare una serata.

Lo stack e il perché delle scelte sono in `09-stack-e-principi.md`, il piano
completo in `04-build-plan.md`.

---

## Parte 0 — Il quadro generale in due minuti

**Cosa costruiamo.** Un sito in più lingue per Yanks, con uno shop funzionante.

**Come funziona**, in parole semplici:

1. Scrivi il codice sul tuo PC, in una cartella
2. **Astro** trasforma quel codice in pagine HTML pronte, una per ogni pagina e
   ogni lingua. Questa operazione si chiama **build**
3. **GitHub** conserva il codice online
4. **Cloudflare** prende il codice da GitHub, fa la build e mette il sito online.
   Questo è il **deploy**. Succede da solo a ogni `git push`
5. Lo shop ha bisogno di qualche funzione che gira sul server (ricevere un ordine,
   parlare con Stripe): sono gli **endpoint**, in `src/pages/api/`

**L'ordine di lavoro**
1. Fondamenta comuni
2. Sito statico e frontend dello shop **in parallelo**. Lo shop all'inizio usa
   **dati finti** (un *mock*): funziona tutto, carrello compreso, ma il pagamento
   è simulato
3. Backend dello shop: database, API, Stripe
4. Si cambia una sola variabile e lo shop passa dai dati finti a quelli veri

### Parole che incontrerai

| Parola | Significato |
|---|---|
| **Terminale** | La finestra dove scrivi i comandi. Su Windows usiamo PowerShell |
| **Build** | Trasformare il codice in sito pronto da pubblicare |
| **Deploy** | Mettere online la build |
| **Commit** | Una foto salvata del tuo codice, a cui puoi sempre tornare |
| **Push** | Mandare i tuoi commit su GitHub |
| **Ramo** (branch) | Una copia di lavoro separata, per provare senza rompere quella buona |
| **Endpoint** | Un indirizzo del sito che esegue codice invece di mostrare una pagina |
| **Mock** | Una versione finta di qualcosa, per lavorare prima che esista quella vera |
| **Variabile d'ambiente** | Un'impostazione tenuta fuori dal codice, come le chiavi segrete |
| **Migrazione** | Un file SQL che crea o modifica le tabelle del database |

---

## Parte 1 — Preparare il PC (una volta sola, circa 30 minuti)

Apri **PowerShell**: tasto Windows, scrivi `powershell`, Invio. Riconosci che è
PowerShell perché la riga inizia con `PS C:\`.

### 1.1 — Node.js 22 o superiore

**Cosa fa**: Node esegue gli strumenti di sviluppo. Astro 6 richiede la versione
22 o successiva.

```powershell
node -v
```

**Devi vedere**: `v22.` qualcosa o un numero più alto, per esempio `v24.8.0`.

**Se il numero è più basso o dà errore**: vai su nodejs.org, scarica la versione
**LTS** per Windows, installala con le opzioni predefinite. Poi **chiudi e riapri
PowerShell** e ricontrolla.

### 1.2 — Git

**Cosa fa**: salva la storia del codice. Claude Code su Windows lo usa anche per
eseguire i comandi.

```powershell
git --version
```

**Devi vedere**: `git version 2.` qualcosa.

**Se dà errore**: scarica **Git for Windows** da git-scm.com, installa con tutte
le opzioni predefinite, chiudi e riapri PowerShell.

Poi, una volta sola, di' a Git chi sei (usa la stessa email di GitHub):
```powershell
git config --global user.name "Pietro"
git config --global user.email "la-tua-email@esempio.com"
git config --global init.defaultBranch main
```

### 1.3 — Claude Code

**Cosa fa**: è l'assistente che lavora dentro la cartella del progetto.

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Attenzione**: questo comando funziona solo in PowerShell. Se vedi
`'irm' is not recognized`, sei nel Prompt dei comandi: apri PowerShell.

Chiudi e riapri PowerShell, poi:
```powershell
claude --version
```

**Devi vedere**: un numero di versione.

### 1.4 — GitHub CLI

**Cosa fa**: permette a te e a Claude Code di lavorare con GitHub dal terminale
(creare il repository, vedere se i controlli sono verdi) senza passare dal sito.

```powershell
winget install --id GitHub.cli
```
Chiudi e riapri PowerShell, poi collegalo al tuo account:
```powershell
gh auth login
```
Scegli **GitHub.com** → **HTTPS** → **Login with a web browser** e segui le
istruzioni.

**Devi vedere**: `gh auth status` risponde che sei collegato come `PetWolowitz`.

### 1.5 — Gli account

Tutti gratuiti. Creali ora, ti serviranno in momenti diversi:

| Account | Quando serve | Dove |
|---|---|---|
| GitHub | Fase 0 | github.com |
| Cloudflare | Fase 0 | dash.cloudflare.com |
| Stripe | Fase 3 | dashboard.stripe.com, **resta in modalità test** |

### 1.6 — Controllo finale della Parte 1

```powershell
node -v
npm -v
git --version
claude --version
gh auth status
```

Quattro numeri di versione e `gh` collegato al tuo account. Se è così, sei pronto.

---

## Parte 2 — Creare il progetto (circa 20 minuti)

### 2.1 — Crea il progetto Astro

```powershell
cd C:\Users\pie25\Progetti
npm create astro@latest yanks-redesign
```

**Cosa fa**: scarica Astro e prepara la cartella `yanks-redesign`.

Ti farà alcune domande. Rispondi così:

| Domanda (simile a) | Risposta |
|---|---|
| Come vuoi iniziare? | il modello **minimal** / vuoto |
| Installare le dipendenze? | **Sì** |
| Inizializzare un repository git? | **Sì** |
| TypeScript (se lo chiede) | **Strict** |

Se non chiede di TypeScript non è un problema: lo imposta Claude Code nella
Fase 0.

**Devi vedere**: un messaggio finale di successo con i prossimi passi.

### 2.2 — Entra nella cartella e prova

```powershell
cd yanks-redesign
npm run dev
```

**Cosa fa**: avvia il sito in locale, visibile solo a te.

**Devi vedere**: un indirizzo tipo `http://localhost:4321`. Aprilo nel browser:
c'è una pagina di benvenuto di Astro.

Fermalo con `Ctrl + C`.

### 2.3 — Copia il kit nel progetto

Estrai lo zip `yanks-redesign-kit.zip`. Dentro trovi:
```
yanks-redesign-kit\
  CLAUDE.md
  .mcp.json         gli MCP del progetto (file nascosto: in Esplora file
                    attiva Visualizza → Elementi nascosti per vederlo)
  docs\            i documenti da 00 a 10, più il diario
  public\fonts\    Indian e Yankee Clipper, con le licenze
```

Con Esplora file, copia **tutto il contenuto** di `yanks-redesign-kit\` dentro
`C:\Users\pie25\Progetti\yanks-redesign\`. Quando Windows chiede se unire la
cartella `public` con quella esistente, rispondi **sì**.

Deve risultare così:
```
yanks-redesign\
  CLAUDE.md                 ← accanto a package.json
  .mcp.json                 ← anche questo
  docs\
    00-come-partire.md
    ...
    09-stack-e-principi.md
  public\
    fonts\
      indian\
      yankee-clipper\
  src\
  package.json
```

**Controllo**:
```powershell
dir CLAUDE.md
dir .mcp.json
dir docs
dir public\fonts -Recurse
```
Devi vedere `CLAUDE.md`, `.mcp.json`, i documenti e i file dei font.

### 2.4 — I font del kit

Nel kit ci sono solo i file che servono per partire, rinominati senza spazi
(gli spazi nei nomi dei file creano problemi negli indirizzi web):

| File | Uso |
|---|---|
| `indian/indian-personal-use.ttf` | lo script: marchio e richiami caldi |
| `yankee-clipper/yankeeclipper.ttf` | il display, regolare |
| `yankee-clipper/yankeeclipperital.ttf` | il display, corsivo |

Accanto a ciascuno c'è il suo file di licenza: **non cancellarli**. Entrambi i
font sono gratuiti solo per uso personale. Se in futuro ti serve un altro taglio
di Yankee Clipper, lo prendi dallo zip originale e lo aggiungi nella stessa
cartella.

### 2.5 — Primo commit

```powershell
git add .
git commit -m "Progetto Astro con kit: documenti e font"
```

**Cosa fa**: salva la prima foto del progetto.

**Devi vedere**: un riepilogo con il numero di file salvati.

---

## Parte 3 — La prima sessione con Claude Code

### 3.1 — Avvio

Dalla cartella del progetto:
```powershell
claude
```

Al primo avvio ti chiede di accedere con il tuo account e di confermare che ti
fidi della cartella. Rispondi di sì.

**Approva gli MCP del progetto**: al primo avvio ti chiede se usare i server in
`.mcp.json`. Rispondi di sì. Poi controlla:
```
/mcp
```
Devi vedere `astro-docs`, `cloudflare-docs` e `playwright` connessi. Se uno non
lo è, leggi `docs/10-mcp-e-collegamenti.md`.

**Non usare `/init`**: crea un CLAUDE.md da zero e il tuo è già pronto.

### 3.2 — Primo messaggio: verifica che abbia capito

Copia e incolla:
```
Leggi CLAUDE.md e tutti i file in docs/. Poi riassumimi con parole tue:
1. lo stack e perché è stato scelto
2. i quattro ruoli dei font
3. come funziona l'orologio a tre stati e perché si usa Europe/Amsterdam
4. come sito statico e shop procedono in parallelo e cos'è il contratto ShopApi
5. le regole sulle dipendenze
6. le quattro regole di sicurezza dello shop
7. quali MCP hai a disposizione e quando usarli
Non scrivere codice.
```

**Controlla il riassunto punto per punto** con i documenti. Se sbaglia o salta
qualcosa, diglielo: vuol dire che quel punto va scritto più chiaro.

---

## Parte 4 — Fase 0: progetto e deploy (circa 1 ora)

Obiettivo: il sito vuoto online, con i controlli automatici attivi. Si fa
**prima di tutto il resto**, così i problemi di deploy li scopri col sito vuoto
e non alla fine.

### 4.1 — Chiedi il piano

```
Partiamo dalla Fase 0 di docs/04-build-plan.md.
Prima di toccare qualsiasi file mostrami:
- l'elenco esatto dei pacchetti che installerai, con la versione
- i file che creerai o modificherai
- l'ordine dei passi
Poi aspetta il mio ok.
```

**Controlla**: i pacchetti devono essere solo quelli elencati in
`09-stack-e-principi.md`. Se ne compare uno in più, chiedi perché.

### 4.2 — Lascia lavorare

Rispondi `ok, procedi`. Claude Code ti chiederà il permesso prima di ogni comando
e ogni file: leggi cosa sta per fare e poi conferma.

### 4.3 — Verifica tu

Quando dice di aver finito:
```powershell
npm run dev
```
Apri `http://localhost:4321/en/`: deve comparire "Yanks — in costruzione".

Poi i controlli:
```powershell
npx astro check
npx vitest run
npm run build
```

**Devi vedere**: nessun errore in nessuno dei tre. `astro check` e `vitest`
possono dire che ci sono zero test: va bene, arriveranno nella Fase 1.

### 4.4 — Commit

```powershell
git add .
git commit -m "Fase 0: Astro, Cloudflare, Tailwind, controlli, sicurezza"
```

### 4.5 — Repository su GitHub

Con `gh` basta un comando, dalla cartella del progetto:
```powershell
gh repo create yanks-redesign --public --source=. --push
```

**Cosa fa**: crea il repository `PetWolowitz/yanks-redesign`, lo collega alla
cartella e ci carica i commit.

**Pubblico** perché le verifiche automatiche sono gratuite senza limiti, perché
è un pezzo di portfolio, e perché così la chat su claude.ai può leggerlo quando
le incolli un link. I segreti non ci finiscono mai: stanno in `.dev.vars`, che è
nel `.gitignore`.

**Devi vedere**: i file sulla pagina del repository. Nella scheda **Actions**
parte il controllo automatico: dopo un paio di minuti deve diventare **verde**.

**Se diventa rosso**: clicca sul controllo fallito, copia l'errore e incollalo a
Claude Code.

### 4.6 — Deploy su Cloudflare

1. Vai su dash.cloudflare.com
2. Menu a sinistra: **Workers & Pages** → **Crea** → **Importa un repository**
3. Collega il tuo account GitHub e scegli `yanks-redesign`
4. Impostazioni di build:
   - comando di build: `npm run build`
   - comando di deploy: `npx wrangler deploy`
5. Conferma e aspetta la prima build

**Devi vedere**: un indirizzo che finisce in `.workers.dev`. Aprilo e aggiungi
`/en/`: c'è la tua pagina provvisoria.

**Ultimo passo**: comunica l'indirizzo a Claude Code, perché va scritto nel campo
`site` di `astro.config.mjs`:
```
L'indirizzo del sito è https://….workers.dev. Aggiornalo in astro.config.mjs.
```
Poi commit e push.

Da questo momento **ogni `git push` su `main` pubblica da solo**.

---

## Parte 5 — Il metodo di lavoro

### 5.1 — Un ramo per ogni pezzo

Il ramo `main` deve essere sempre funzionante, perché è quello che va online.
Ogni pezzo di lavoro si fa su un ramo separato, e si porta su `main` solo quando
funziona.

```powershell
git switch -c sito/header          # crea un ramo nuovo e ci entra
# ... lavoro con Claude Code ...
git add .
git commit -m "Header con orologio e cambio lingua"
git switch main                    # torna al ramo principale
git merge sito/header              # porta dentro il lavoro
git push                           # pubblica
git branch -d sito/header          # cancella il ramo, non serve più
```

Nomi dei rami: `sito/…` per il binario del sito, `shop/…` per lo shop. Così
vedi subito su cosa stai lavorando.

### 5.2 — Il giro per ogni pezzo

1. **Crea il ramo**
2. **Chiedi il piano**, non il codice:
   ```
   Voglio fare [la cosa], dalla Fase X di docs/04-build-plan.md.
   Descrivimi cosa farai, quali file toccherai e come lo verifico.
   Non scrivere ancora niente.
   ```
   Per i pezzi grossi usa la **modalità piano**: `Shift + Tab` finché in basso
   compare "plan mode". Propone senza modificare file
3. **Approva o correggi.** Correggere un piano costa niente, correggere 300 righe
   un pomeriggio
4. **Lascia lavorare**, leggendo ogni richiesta di permesso
5. **Verifica tu**: `npm run dev` e guarda la pagina davvero. Anche da telefono,
   con `npm run dev -- --host` e l'indirizzo che compare (telefono sulla stessa
   rete wifi)
6. **Controlli**: `npx astro check`, `npx vitest run`, `npm run build`
7. **Fatti spiegare** il pezzo più importante:
   ```
   Spiegami getOpenStatus riga per riga, come a un principiante capace.
   ```
8. **Aggiorna il diario**:
   ```
   Aggiorna docs/diario.md con la voce di questa sessione.
   ```
9. **Commit, merge su main, push**
10. **`/clear`** in Claude Code prima del pezzo successivo

### 5.3 — Come alternare sito e shop

Nella Fase 2 hai due liste, 2A (sito) e 2S (shop). Alterna: un pezzo del sito, un
pezzo dello shop. Per esempio:

| Sessione | Ramo | Cosa |
|---|---|---|
| 1 | `sito/struttura` | Header, footer, menu mobile |
| 2 | `shop/catalogo` | Pagina catalogo con dati finti |
| 3 | `sito/home-hero` | Hero e chi sono |
| 4 | `shop/carrello` | Carrello e contatore nell'header |
| 5 | `sito/home-recensioni` | Recensioni video e scritte |
| 6 | `shop/checkout` | Form di checkout e pagina ordine finta |
| … | … | … |

Alternare tiene lo shop agganciato al sito: header e carrello si incontrano
subito, non alla fine.

---

## Parte 6 — Prompt pronti per ogni fase

Uno per sessione. Dopo ognuno: verifica, commit, `/clear`.

**Fase 1 — Stile e lingue**
```
Fase 1 di docs/04-build-plan.md, parte "Stile" e "Lingue".
Token dei due temi in tokens.css come da docs/02-design-system.md, font dalla
cartella public/fonts, layout Base.astro, i tre file di lingua e il test sulle
chiavi. Prima il piano.
```

**Fase 1 — Dati e orologio**
```
Fase 1, parte "Dati". Crea i file in src/data da docs/03-content.md e la
funzione pura getOpenStatus con i test a tutti gli orari indicati, in ora
legale e in ora solare. Prima il piano.
```

**Fase 1 — Contratto dello shop**
```
Fase 1, parte "Il contratto dello shop". Tipi, interfaccia ShopApi,
implementazione mock da merch.ts, validate.ts con i test. Spiegami perché
questa struttura permette di collegare il backend dopo senza toccare i
componenti. Prima il piano.
```

**Fase 2A e 2S** — un pezzo per volta:
```
Fase 2A (oppure 2S), punto "[nome del punto]". Rispetta docs/02-design-system.md
e la lista di controllo in fondo. Prima descrivimi il layout a parole.
```

**Fase 3 — Backend**, un endpoint per sessione:
```
Fase 3, punto "api/checkout". Leggi docs/06-shop-architecture.md. Elencami
prima tutti i controlli di sicurezza che farai e in che ordine, poi aspetta
il mio ok.
```

**Fase 4 — Collegamento**
```
Fase 4. Passiamo PUBLIC_SHOP_MODE a live e facciamo un acquisto completo con
una carta di prova di Stripe. Guidami passo passo.
```

---

## Parte 7 — Comandi utili

**Nel terminale**

| Comando | A cosa serve |
|---|---|
| `npm run dev` | Sito in locale su `localhost:4321` |
| `npm run build` | Build di prova, come la farà Cloudflare |
| `npx astro check` | Controlla i tipi e gli errori |
| `npx vitest run` | Esegue i test |
| `git status` | Mostra cosa è cambiato dall'ultimo commit |
| `git log --oneline` | Elenco dei commit |
| `git switch main` | Torna al ramo principale |

**Dentro Claude Code**

| Comando | A cosa serve |
|---|---|
| `Esc` | Interrompe Claude se sta andando nella direzione sbagliata |
| `Shift + Tab` | Cambia modalità, compresa la modalità piano |
| `/clear` | Svuota la conversazione. Tra un pezzo e l'altro |
| `/compact` | Riassume la conversazione quando diventa lunga |
| `/help` | Elenco di tutti i comandi |

---

## Parte 8 — Quando qualcosa va storto

**Un errore nel terminale.** Copialo intero e incollalo a Claude Code. Non
riassumerlo: il dettaglio che sembra inutile è spesso quello che serve.

**Claude Code contraddice i documenti.** Per esempio propone un
`tailwind.config.js`, un pacchetto nuovo non richiesto, una pagina renderizzata
sul server, un `fetch` dentro un componente dello shop, un prezzo calcolato nel
browser. Premi `Esc` e scrivi:
```
Fermati. Rileggi CLAUDE.md: questa cosa è vietata. Proponi un'alternativa.
```

**npm dà errori di dipendenze.** Mai `--force`, mai `--legacy-peer-deps`.
```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```
Se persiste, incolla l'errore a Claude Code.

**Hai rotto qualcosa e non sai cosa.** Se non hai ancora fatto il commit:
```powershell
git restore .
```
Torna all'ultimo commit e butta le modifiche non salvate.

Se l'hai rotto su un ramo, torna a `main`, che è ancora buono:
```powershell
git switch main
git branch -D nome-del-ramo
```

**Il controllo su GitHub è rosso.** Il deploy non parte, quindi il sito online è
salvo. Apri la scheda Actions, copia l'errore e passalo a Claude Code.

**Claude Code gira in tondo** da tre tentativi sullo stesso errore: fermati,
`/clear`, e rispiega il problema da capo in un solo messaggio, con l'errore
completo e cosa hai già provato.

**Il piano di Claude si consuma in fretta.** Sessioni brevi su un pezzo solo,
`/clear` spesso, mai richieste tipo "rifai tutta la home".

---

## Parte 9 — Il tuo controllo di fine fase

Prima di dichiarare chiusa una fase:

- [ ] Funziona in locale e l'hai guardato davvero, anche da telefono
- [ ] Funziona nei due temi e nelle tre lingue
- [ ] `astro check`, `vitest` e `build` senza errori
- [ ] Controllo su GitHub verde e sito online aggiornato
- [ ] Sai spiegare con parole tue cosa fa il pezzo principale
- [ ] Il diario è aggiornato
- [ ] Hai fatto il commit con un messaggio che dice cosa hai fatto

L'ultimo punto conta quanto gli altri: il progetto va nel portfolio, e in un
colloquio ti chiederanno di spiegarlo.
