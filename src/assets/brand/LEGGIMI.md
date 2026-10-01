# Logo: l'unica fonte

Questa cartella è l'unico posto dei file del logo. Non si copiano altrove e non si
usano direttamente con `<img>`: si passa sempre da `src/components/site/Logo.astro`,
così header, hero, footer, avviso d'età e scelta della lingua mostrano lo stesso logo
e cambiano insieme.

| File | Cosa | Dove |
|---|---|---|
| `yanks-badge-chiaro.svg` | logo completo, disco nero | tema chiaro, dai 160 px |
| `yanks-badge-scuro.svg` | logo completo con anello crema | tema scuro, dai 160 px |
| `yanks-indiano-chiaro.svg` | solo il volto | tema chiaro, sotto i 160 px (header) |
| `yanks-indiano-scuro.svg` | solo il volto con anello crema | tema scuro, sotto i 160 px; e `public/favicon.svg` |

Uso: `<Logo variant="badge" size={160} alt="…" />` oppure `variant="indiano"`.
Il componente sceglie da solo la versione del tema attivo.

Sorgente: `brand/sorgente/logo1-timbro.png`; confronto con il logo originale in
`brand/anteprima/confronto-logo.png`. Se il logo cambia, si sostituiscono questi
quattro file (stessi nomi) e la favicon: il resto del sito si aggiorna da solo.
