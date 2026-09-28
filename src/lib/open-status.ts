// Orologio a tre stati: aperto, solo asporto, chiuso.
// Funzione pura: riceve un istante e legge l'ora sul fuso del locale, mai su
// quello del dispositivo (chi guarda da Londra è un'ora indietro).
import { venue } from '../data/venue';

export type OpenStatus = 'open' | 'takeaway' | 'closed';

// "02:45" → 165 minuti dopo la mezzanotte
function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

// Vero se minute cade in [start, end). Se end < start l'intervallo passa la mezzanotte
function inRange(minute: number, start: number, end: number): boolean {
  return start <= end ? minute >= start && minute < end : minute >= start || minute < end;
}

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: venue.timezone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getOpenStatus(date: Date): OpenStatus {
  const parts = clock.formatToParts(date);
  const part = (type: 'hour' | 'minute') => Number(parts.find((p) => p.type === type)?.value);
  const minute = part('hour') * 60 + part('minute');

  const { open, dineInUntil, close } = venue.hours;
  if (inRange(minute, minutesOf(open), minutesOf(dineInUntil))) return 'open';
  if (inRange(minute, minutesOf(dineInUntil), minutesOf(close))) return 'takeaway';
  return 'closed';
}
