import { request } from '@playwright/test';
import type { Page } from '@playwright/test';

const API_URL = 'http://localhost:3000';

export interface EventTypeSeed {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface SlotSeed {
  startTime: string;
  endTime: string;
}

/**
 * Seeds an event type through the real backend API (no mocks).
 * A random suffix keeps titles unique across reruns on a reused server.
 */
export async function seedEventType(
  baseTitle = 'Тестовое событие',
  durationMinutes = 60,
  description = 'Создано из e2e-теста',
): Promise<EventTypeSeed> {
  const title = `${baseTitle} ${Math.random().toString(36).slice(2, 8)}`;
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const res = await ctx.post('/event-types', {
      data: { title, description, durationMinutes },
    });
    if (!res.ok()) {
      throw new Error(`Failed to seed event type: ${res.status()} ${await res.text()}`);
    }
    return (await res.json()) as EventTypeSeed;
  } finally {
    await ctx.dispose();
  }
}

/** Books a slot through the real backend API; returns status + body. */
export async function seedBooking(
  eventTypeId: string,
  startTime: string,
  guestName: string,
): Promise<{ status: number; body: unknown }> {
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const res = await ctx.post('/bookings', {
      data: { eventTypeId, startTime, guestName },
    });
    return { status: res.status(), body: await res.json() };
  } finally {
    await ctx.dispose();
  }
}

/** Fetches free slots for a date through the real backend API. */
export async function fetchSlots(eventTypeId: string, date: string): Promise<SlotSeed[]> {
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const res = await ctx.get(`/event-types/${eventTypeId}/slots?date=${date}`);
    if (!res.ok()) {
      throw new Error(`Failed to fetch slots: ${res.status()} ${await res.text()}`);
    }
    return (await res.json()) as SlotSeed[];
  } finally {
    await ctx.dispose();
  }
}

function tomorrowDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Tests always use TOMORROW, never today: today's slots depend on the time of
 * day (past slots are excluded), tomorrow's are stable.
 */
export function tomorrowISODate(): string {
  const d = tomorrowDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Day-of-month of tomorrow, for clicking the calendar strip button. */
export function tomorrowDayNumber(): number {
  return tomorrowDate().getDate();
}

/** Locates a day button in the 14-day calendar strip by its day-of-month. */
export function dayButton(page: Page, day: number) {
  return page.locator('.days button').filter({ hasText: new RegExp(`^${day}\\D`) });
}
