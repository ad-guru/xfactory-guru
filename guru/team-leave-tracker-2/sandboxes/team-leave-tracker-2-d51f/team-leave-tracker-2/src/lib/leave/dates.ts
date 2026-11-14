// Pure date helpers on YYYY-MM-DD strings, computed in UTC to avoid DST drift.
const DAY = 86_400_000;

export function parse(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}

export function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  return fmt(new Date(parse(iso).getTime() + n * DAY));
}

export function todayIso(): string {
  const now = new Date();
  const local = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return fmt(local);
}

/** Sunday of the week (Sun–Sat) containing `iso`. */
export function weekStart(iso: string): string {
  const dow = parse(iso).getUTCDay(); // 0 = Sun
  return addDays(iso, -dow);
}

export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function overlaps(start: string, end: string, from: string, to: string): boolean {
  return start <= to && end >= from;
}

export function dayCount(start: string, end: string): number {
  return Math.round((parse(end).getTime() - parse(start).getTime()) / DAY) + 1;
}

const opts = (o: Intl.DateTimeFormatOptions) => ({ ...o, timeZone: "UTC" });

export function shortDate(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", opts({ month: "short", day: "numeric" }));
}

export function longDate(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", opts({ month: "short", day: "numeric", year: "numeric" }));
}

export function weekdayLetter(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", opts({ weekday: "short" }));
}

export function rangeLabel(start: string, end: string): string {
  if (start === end) return longDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${sameYear ? shortDate(start) : longDate(start)} – ${longDate(end)}`;
}
