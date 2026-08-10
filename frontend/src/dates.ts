// Date helpers for the booking window (UTC calendar day for transport,
// local time for display).

const DAY_MS = 86_400_000;

/** YYYY-MM-DD for the slots query param — the UTC calendar day of `d`. */
export function toISODate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Next `count` days starting from today (inclusive), anchored to the UTC
 * calendar day: the server validates the window in UTC, so the day strip must
 * match regardless of the browser timezone.
 */
export function nextDays(count: number): Date[] {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from({ length: count }, (_, i) => new Date(today + i * DAY_MS));
}

export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}
