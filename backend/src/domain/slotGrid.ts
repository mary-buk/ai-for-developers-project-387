import { intervalsOverlap } from './conflicts.js';

// Booking rules from the TypeSpec spec / project decisions:
// 30-minute grid inside 09:00-18:00, booking window = next 14 days from today.
export const SLOT_STEP_MINUTES = 30;
export const WINDOW_DAYS = 14;
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export interface Interval {
  start: Date;
  end: Date;
}

export function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

function workdayBounds(date: Date): Interval {
  const day = startOfDay(date);
  const start = new Date(day);
  start.setHours(WORK_START_HOUR, 0, 0, 0);
  const end = new Date(day);
  end.setHours(WORK_END_HOUR, 0, 0, 0);
  return { start, end };
}

/** date is inside [today, today + WINDOW_DAYS - 1], comparing calendar days. */
export function isWithinWindow(date: Date, now: Date): boolean {
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
  return diffDays >= 0 && diffDays < WINDOW_DAYS;
}

/**
 * start aligns to the SLOT_STEP_MINUTES grid and
 * [start, start + duration) fits into the working window of that day.
 */
export function isSlotOnGrid(start: Date, durationMinutes: number): boolean {
  if (start.getMinutes() % SLOT_STEP_MINUTES !== 0) return false;
  if (start.getSeconds() !== 0 || start.getMilliseconds() !== 0) return false;

  const { start: workStart, end: workEnd } = workdayBounds(start);
  const end = new Date(start.getTime() + durationMinutes * MINUTE_MS);
  return start >= workStart && end <= workEnd;
}

/**
 * Free slots for one day: the 30-minute grid minus past slots,
 * slots that would end after 18:00, and busy intervals.
 */
export function generateDaySlots(
  date: Date,
  durationMinutes: number,
  busy: Interval[],
  now: Date,
): Interval[] {
  const { start: workStart, end: workEnd } = workdayBounds(date);
  const durationMs = durationMinutes * MINUTE_MS;

  const slots: Interval[] = [];
  for (
    let t = workStart.getTime();
    t + durationMs <= workEnd.getTime();
    t += SLOT_STEP_MINUTES * MINUTE_MS
  ) {
    const start = new Date(t);
    if (start < now) continue;
    const end = new Date(t + durationMs);
    const taken = busy.some((b) => intervalsOverlap(start, end, b.start, b.end));
    if (!taken) slots.push({ start, end });
  }
  return slots;
}
