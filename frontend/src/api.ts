import type {
  Booking,
  BookingCreate,
  EventType,
  EventTypeCreate,
  Slot,
} from './types';

// Empty base = same-origin requests (dev: Vite proxies them, see vite.config.ts).
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // Response has no JSON body; keep statusText.
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

/** GET /event-types — public catalog, also used by the admin page. */
export function listEventTypes(): Promise<EventType[]> {
  return request<EventType[]>('/event-types');
}

/** POST /event-types — owner only. */
export function createEventType(data: EventTypeCreate): Promise<EventType> {
  return request<EventType>('/event-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** GET /event-types/{id}/slots?date=YYYY-MM-DD */
export function listSlots(eventTypeId: string, date: string): Promise<Slot[]> {
  return request<Slot[]>(
    `/event-types/${eventTypeId}/slots?date=${date}`,
  );
}

/** POST /bookings — throws ApiError(409) when the slot is already taken. */
export function createBooking(data: BookingCreate): Promise<Booking> {
  return request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** GET /bookings — upcoming bookings of all event types, owner only. */
export function listUpcomingBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings');
}
