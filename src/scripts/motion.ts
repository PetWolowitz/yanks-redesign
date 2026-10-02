// Animazioni d'ingresso (docs/08): titoli che entrano di lato, sfalsati; blocchi che salgono
// quando arrivano in vista. Solo transform e opacity, niente librerie.
// - prefers-reduced-motion: niente di tutto questo, il CSS mostra tutto subito
// - senza JS: i titoli restano visibili (il CSS li nasconde solo con html[data-js])
// - quello che è già a schermo al caricamento non si nasconde per poi rianimarlo

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lo script Indian (h1) si anima per parola: per lettera si spezzano le legature.
// Yankee Clipper per lettera, dentro parole indivisibili per non andare a capo a metà
function split(heading: HTMLElement, index: { value: number }) {
  const text = heading.textContent ?? '';
  const byWord = getComputedStyle(heading).fontFamily.includes('Indian');
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  for (const [w, word] of text.trim().split(/\s+/).entries()) {
    if (w > 0) visual.append(' ');
    const wordSpan = document.createElement('span');
    wordSpan.className = 'split-word';
    const parts = byWord ? [word] : [...word];
    for (const part of parts) {
      const piece = document.createElement('span');
      piece.className = 'split-piece';
      piece.textContent = part;
      piece.style.setProperty('--i', String(index.value++));
      wordSpan.append(piece);
    }
    visual.append(wordSpan);
  }
  // Il testo vero resta per gli screen reader, intero
  const readable = document.createElement('span');
  readable.className = 'sr-only';
  readable.textContent = text;
  heading.replaceChildren(readable, visual);
}

function reveal(elements: Iterable<HTMLElement>) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const element of elements) observer.observe(element);
}

export function initMotion() {
  const all = [...document.querySelectorAll<HTMLElement>(':is(main, footer) :is(h1, h2, h3)')];
  // Solo titoli di solo testo: quelli con elementi dentro (per esempio un numero
  // d'ordine) restano come sono. "off" li rende subito visibili (global.css)
  const headings = all.filter((heading) => heading.children.length === 0 && (heading.textContent ?? '').trim() !== '');
  for (const heading of all) if (reduce || !headings.includes(heading)) heading.dataset.split = 'off';
  if (reduce) return;

  for (const heading of headings) {
    split(heading, { value: 0 });
    heading.dataset.split = '';
  }
  reveal(headings);

  // Blocchi in ingresso: solo quelli ancora sotto la piega, per non far lampeggiare il resto.
  // Nelle griglie un piccolo ritardo per elemento. data-anim sceglie il movimento
  // (le tessere delle bento ne hanno uno diverso ciascuna, global.css); senza, salgono.
  // Un blocco dentro un altro blocco animato non si anima due volte
  const candidates = [...document.querySelectorAll<HTMLElement>('main :is([data-anim], [data-card], figure, blockquote, img, form, aside)')];
  const blocks = candidates.filter((block) => !candidates.some((other) => other !== block && other.contains(block)));
  const below = blocks.filter((block) => block.getBoundingClientRect().top > innerHeight);
  below.forEach((block) => {
    const siblings = block.parentElement ? [...block.parentElement.children] : [];
    block.style.setProperty('--i', String(Math.min(siblings.indexOf(block), 6)));
    block.dataset.reveal = block.dataset.anim ?? 'up';
  });
  reveal(below);
}
