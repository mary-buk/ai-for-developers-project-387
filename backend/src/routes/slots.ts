import { Router } from 'express';
import { generateDaySlots, isWithinWindow } from '../domain/slotGrid.js';
import { badRequest, HttpError } from '../errors.js';
import type { BookingRepository, EventTypeRepository } from '../storage/repository.js';

function parseDateParam(raw: unknown): Date {
  if (typeof raw !== 'string') {
    throw badRequest('date query param is required (YYYY-MM-DD)');
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    throw badRequest('date must have the YYYY-MM-DD format');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw badRequest('date is not a valid calendar date');
  }
  return date;
}

export function slotsRouter(
  eventTypes: EventTypeRepository,
  bookings: BookingRepository,
): Router {
  const router = Router();

  router.get('/event-types/:eventTypeId/slots', (req, res, next) => {
    try {
      const eventType = eventTypes.findById(req.params.eventTypeId);
      if (!eventType) {
        throw new HttpError(404, 'not_found', 'Event type not found');
      }

      const date = parseDateParam(req.query.date);
      const now = new Date();
      if (!isWithinWindow(date, now)) {
        throw badRequest('date is outside the 14-day booking window');
      }

      const busy = bookings.list().map((b) => ({
        start: new Date(b.startTime),
        end: new Date(b.endTime),
      }));

      const slots = generateDaySlots(date, eventType.durationMinutes, busy, now).map(
        (s) => ({
          startTime: s.start.toISOString(),
          endTime: s.end.toISOString(),
        }),
      );
      res.json(slots);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
