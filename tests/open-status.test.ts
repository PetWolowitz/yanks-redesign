// L'orologio a tre stati, in ora legale e in ora solare.
// Gli istanti sono scritti in UTC: così il test non dipende dal fuso della macchina
// e prova che conta l'ora di Amsterdam, non quella del dispositivo.
import { describe, expect, it } from 'vitest';
import { getOpenStatus, minutesUntilChange, type OpenStatus } from '../src/lib/open-status';

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

  // 25 ottobre 2026: alle 03:00 CEST si torna alle 02:00 CET, e la fascia
  // 02:00-02:45 capita due volte. Conta l'orologio sul muro: tutte e due le volte
  // è solo asporto, e in mezzo (02:45-03:00 CEST) è chiuso
  describe('notte del cambio d\'ora, 25 ottobre 2026', () => {
    it('02:30 CEST (00:30 UTC) è solo asporto', () => {
      expect(getOpenStatus(new Date('2026-10-25T00:30:00Z'))).toBe('takeaway');
    });
    it('02:50 CEST (00:50 UTC) è chiuso', () => {
      expect(getOpenStatus(new Date('2026-10-25T00:50:00Z'))).toBe('closed');
    });
    it('02:30 CET (01:30 UTC), la seconda volta, è di nuovo solo asporto', () => {
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

describe('minutesUntilChange', () => {
  for (const season of seasons) {
    describe(season.name, () => {
      it('alle 02:15 mancano 30 minuti alla chiusura', () => {
        expect(minutesUntilChange(amsterdam(season.day, '02:15', season.offsetHours))).toBe(30);
      });
      it('alle 02:44:30 manca 1 minuto (arrotondato per eccesso)', () => {
        const date = new Date(amsterdam(season.day, '02:44', season.offsetHours).getTime() + 30_000);
        expect(minutesUntilChange(date)).toBe(1);
      });
      it('alle 23:30 passa la mezzanotte: 150 minuti alle 02:00', () => {
        expect(minutesUntilChange(amsterdam(season.day, '23:30', season.offsetHours))).toBe(150);
      });
      it('alle 03:00 mancano 5 ore all\'apertura', () => {
        expect(minutesUntilChange(amsterdam(season.day, '03:00', season.offsetHours))).toBe(300);
      });
    });
  }

  // 29 marzo 2026: alle 02:00 CET si salta alle 03:00 CEST. Le 02:00-02:45 non
  // esistono: quella notte si passa da aperto a chiuso, senza solo asporto
  it('passaggio all\'ora legale: alle 01:30 CET si chiude tra 30 minuti', () => {
    const date = new Date('2026-03-29T00:30:00Z');
    expect(minutesUntilChange(date)).toBe(30);
    expect(getOpenStatus(new Date('2026-03-29T01:00:00Z'))).toBe('closed');
  });

  // 25 ottobre 2026: le 02:45 CEST arrivano alle 00:45 UTC
  it('ritorno all\'ora solare: alle 02:30 CEST mancano 15 minuti', () => {
    expect(minutesUntilChange(new Date('2026-10-25T00:30:00Z'))).toBe(15);
  });
});
