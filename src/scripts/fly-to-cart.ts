// Aggiunta al carrello: una copia della foto del prodotto vola con un arco fino
// all'icona del carrello nell'header e sparisce. Web Animations API, solo transform
// e opacity. Con prefers-reduced-motion non vola niente: restano il numero sul
// carrello e il messaggio di conferma.

export function flyToCart(source: HTMLImageElement | null) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !source) return;
  // L'icona visibile: su mobile e desktop è la stessa, nell'header
  const target = document.querySelector<HTMLElement>('[data-cart-link]');
  if (!target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = source.cloneNode() as HTMLImageElement;
  clone.removeAttribute('srcset');
  clone.src = source.currentSrc || source.src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: '0',
    objectFit: 'cover',
    borderRadius: '1rem',
    zIndex: '60',
    pointerEvents: 'none',
  });
  document.body.append(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const end = Math.max(0.05, 32 / from.width);
  clone
    .animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(${(1 + end) / 2.4}) rotate(-8deg)`, opacity: 0.95, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(6deg)`, opacity: 0.3 },
      ],
      { duration: 1000, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
    )
    .finished.finally(() => clone.remove());
}
