// Spese di spedizione (docs/06): una tariffa fissa per paese, IVA compresa, in centesimi.
// Unica fonte: la usano il server per l'addebito, il checkout e la pagina legale per
// mostrarle. Record su Country: un paese nuovo senza tariffa non passa astro check.
// Base del 2026-10-22: tariffe PostNL per aziende 2026 (pacco: NL da 7,40, BE 8,75,
// DE 8,45, FR 12,25, ES 9,90, IT 12,40, IVA esclusa), arrotondate per zona.
// Le cifre vere le decide il locale.
import type { Country } from './types';

export const shippingCents: Record<Country, number> = {
  NL: 695,
  BE: 995,
  LU: 995,
  DE: 995,
  AT: 1395,
  FR: 1395,
  IT: 1395,
  ES: 1395,
};
