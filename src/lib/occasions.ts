// Calendar helpers for birthday/anniversary lists. The church is in India,
// so "today" and "this week" are always worked out in Indian time -- the
// server itself runs in UTC, where Sunday 6 AM IST is still Saturday night.

export const CHURCH_TIME_ZONE = "Asia/Kolkata";

/** A calendar date with no time of day; `date` is that day at 00:00 UTC. */
export interface CalendarDay {
  year: number;
  month: number; // 1-12
  day: number;
  date: Date;
}

function fromUtc(date: Date): CalendarDay {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    date,
  };
}

/** Today's date in `timeZone`. */
export function todayIn(timeZone = CHURCH_TIME_ZONE): CalendarDay {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return fromUtc(new Date(Date.UTC(get("year"), get("month") - 1, get("day"))));
}

/** The Sunday-to-Saturday week containing `day`, shifted by `offsetWeeks`. */
export function weekOf(day: CalendarDay, offsetWeeks = 0): CalendarDay[] {
  const sunday = day.date.getUTCDate() - day.date.getUTCDay() + offsetWeeks * 7;
  return Array.from({ length: 7 }, (_, i) =>
    fromUtc(new Date(Date.UTC(day.year, day.month - 1, sunday + i)))
  );
}

/** "2026-10-25" -> that CalendarDay, or null if it isn't a real date. */
export function parseIsoDay(value: string | null | undefined): CalendarDay | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return fromUtc(date);
}

/** CalendarDay -> "2026-10-25", the format of <input type="date">. */
export function toIsoDay(day: CalendarDay) {
  return day.date.toISOString().slice(0, 10);
}

/** `day` moved by `count` days. */
export function addDays(day: CalendarDay, count: number): CalendarDay {
  return fromUtc(new Date(Date.UTC(day.year, day.month - 1, day.day + count)));
}

/** Every day from `from` to `to`, both included (empty if `to` is before `from`). */
export function daysBetween(from: CalendarDay, to: CalendarDay): CalendarDay[] {
  const count = Math.round((to.date.getTime() - from.date.getTime()) / 86_400_000) + 1;
  return Array.from({ length: Math.max(0, count) }, (_, i) => addDays(from, i));
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Whether a yearly occasion on `day`/`month` falls on `on`. 29 February is
 * celebrated on 28 February in non-leap years so it isn't skipped.
 */
export function fallsOn(day: number | null, month: number | null, on: CalendarDay): boolean {
  if (!day || !month) return false;
  if (day === on.day && month === on.month) return true;
  return day === 29 && month === 2 && on.month === 2 && on.day === 28 && !isLeapYear(on.year);
}

const WEEKDAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });
const DAY_MONTH = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** "Sun 18 Oct" */
export function formatDay(day: CalendarDay) {
  return `${WEEKDAY.format(day.date)} ${DAY_MONTH.format(day.date)}`;
}

/** "Sun 18 Oct – Sat 24 Oct 2026" */
export function formatWeek(days: CalendarDay[]) {
  const last = days[days.length - 1];
  return `${formatDay(days[0])} – ${formatDay(last)} ${last.year}`;
}
