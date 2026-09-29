// Cursore personalizzato (docs/08): un punto che inverte i colori, più grande sopra
// link e pulsanti, un blocco pieno sopra le foto. Solo con un mouse vero e senza
// prefers-reduced-motion: su touch e con il movimento ridotto resta quello di sistema.
// Si muove solo con transform. La tastiera non cambia: i link restano raggiungibili.

const INTERACTIVE = 'a, button, label, select, summary, [role="button"], input[type="radio"], input[type="checkbox"]';

export function initCursor() {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!cursor || !fine || reduce) return;

  document.documentElement.dataset.cursor = '';
  let x = -100;
  let y = -100;
  let shownX = x;
  let shownY = y;
  let frame = 0;

  // Leggera inerzia: il punto insegue il puntatore, ma resta preciso
  const draw = () => {
    shownX += (x - shownX) * 0.45;
    shownY += (y - shownY) * 0.45;
    cursor.style.transform = `translate3d(${shownX}px, ${shownY}px, 0)`;
    frame = Math.abs(x - shownX) + Math.abs(y - shownY) > 0.1 ? requestAnimationFrame(draw) : 0;
  };

  addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.dataset.visible = '';
      const target = event.target instanceof Element ? event.target : null;
      cursor.dataset.mode = target?.closest('img, picture, video') ? 'image' : target?.closest(INTERACTIVE) ? 'link' : '';
      if (!frame) frame = requestAnimationFrame(draw);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => delete cursor.dataset.visible);
  addEventListener('pointerdown', () => (cursor.dataset.pressed = ''));
  addEventListener('pointerup', () => delete cursor.dataset.pressed);
}
