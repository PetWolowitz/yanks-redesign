-- Colore delle varianti (2026-10-27): NULL = il prodotto ha un colore solo.
-- Le varianti vecchie senza colore dei prodotti che ora ne hanno restano per gli
-- ordini già fatti; il seed le mette a zero pezzi (src/lib/shop/seed.ts)
ALTER TABLE variants ADD COLUMN color TEXT;
