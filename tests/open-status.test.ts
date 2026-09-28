// L'orologio a tre stati, in ora legale e in ora solare.
// Gli istanti sono scritti in UTC: così il test non dipende dal fuso della macchina
// e prova che conta l'ora di Amsterdam, non quella del dispositivo.
import { describe, expect, it } from 'vitest';
import { getOpenStatus, type OpenStatus } from '../src/lib/open-status';

// ora di Amsterdam → stato atteso
const cases: [string, OpenStatus][] = [
  ['01:00', 'open'],
  ['02:00', 'takeaway'],
  ['02:15', 'takeaway'],
  ['02:45', 'closed'],
  ['03:00', 'closed'],
  ['07:59', 'closed'],
  ['08:00', 'open'],
];

// Ora legale (CEST, UTC+2) e ora solare (CET, UTC+1)
const seasons = [
  { name: 'ora legale, 15 luglio 2026', day: '2026-07-15', offsetHours: 2 },
  { name: 'ora solare, 15 gennaio 2026', day: '2026-01-15', offsetHours: 1 },
];

// "02:15" ad Amsterdam in quel giorno → istante UTC
function amsterdam(day: string, time: string, offsetHours: number): Date {
  const local = new Date(`${day}T${time}:00Z`);
  return new Date(local.getTime() - offsetHours * 3_600_000);
}

describe('getOpenStatus', () => {
  for (const season of seasons) {
    describe(season.name, () => {
      for (const [time, expected] of cases) {
        it(`alle ${time} è ${expected}`, () => {
          expect(getOpenStatus(amsterdam(season.day, time, season.offsetHours))).toBe(expected);
        });
      }
    });
  }

  // 25 ottobre 2026: alle 03:00 CEST si torna alle 02:00 CET, e le 02:30 capitano due volte
  describe('notte del cambio d\'ora, 25 ottobre 2026', () => {
    it('02:30 CEST (00:30 UTC) è solo asporto', () => {
      expect(getOpenStatus(new Date('2026-10-25T00:30:00Z'))).toBe('takeaway');
    });
    it('02:30 CET (01:30 UTC), la seconda volta, è ancora solo asporto', () => {
      expect(getOpenStatus(new Date('2026-10-25T01:30:00Z'))).toBe('takeaway');
    });
    it('03:00 CET (02:00 UTC) è chiuso', () => {
      expect(getOpenStatus(new Date('2026-10-25T02:00:00Z'))).toBe('closed');
    });
  });

  it('a mezzanotte è aperto (ore 00, non 24)', () => {
    expect(getOpenStatus(amsterdam('2026-07-15', '00:00', 2))).toBe('open');
  });
});
