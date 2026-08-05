import { Router } from 'express';
import { intervalsOverlap } from '../domain/conflicts.js';
import { isSlotOnGrid, isWithinWindow } from '../domain/slotGrid.js';
import { badRequest, HttpError } from '../errors.js';
import type { BookingRepository, EventTypeRepository } from '../storage/repository.js';
import type { BookingCreate } from '../types.js';

const MINUTE_MS = 60_000;

// Validation mirrors BookingCreate from tsp/models.tsp.
function parseBookingCreate(body: unknown): BookingCreate {
  if (typeof body !== 'object' || body === null) {
    throw badRequest('Body must be a JSON object');
  }
  const { eventTypeId, startTime, guestName } = body as Record<string, unknown>;

  if (typeof eventTypeId !== 'string' || eventTypeId.trim() === '') {
    throw badRequest('eventTypeId must be a non-empty string');
  }
  if (typeof startTime !== 'string' || Number.isNaN(Date.parse(startTime))) {
    throw badRequest('startTime must be a valid ISO datetime string');
  }
  if (typeof guestName !== 'string' || guestName.trim() === '') {
    throw badRequest('guestName must be a non-empty string');
  }

  return { eventTypeId, startTime, guestName: guestName.trim() };
}

export function bookingsRouter(
  eventTypes: EventTypeRepository,
  bookings: BookingRepository,
): Router {
  const router = Router();

  router.post('/bookings', (req, res, next) => {
    try {
      const data = parseBookingCreate(req.body);

      const eventType = eventTypes.findById(data.eventTypeId);
      if (!eventType) {
        // The spec has no 404 on this op: unknown type is a 400.
        throw badRequest('Unknown eventTypeId');
      }

      const start = new Date(data.startTime);
      const now = new Date();
      if (!isWithinWindow(start, now)) {
        throw badRequest('startTime is outside the 14-day booking window');
      }
      if (start < now) {
        throw badRequest('startTime is in the past');
      }
      if (!isSlotOnGrid(start, eventType.durationMinutes)) {
        throw badRequest(
          'startTime is not a valid slot (30-minute grid, must fit into 09:00-18:00)',
        );
      }

      const end = new Date(start.getTime() + eventType.durationMinutes * MINUTE_MS);
      // Global busy rule: overlap with ANY booking, whatever the event type.
      const taken = bookings
        .list()
        .some((b) =>
          intervalsOverlap(start, end, new Date(b.startTime), new Date(b.endTime)),
        );
      if (taken) {
        throw new HttpError(409, 'conflict', 'The slot is already booked');
      }

      const booking = bookings.add({
        eventTypeId: eventType.id,
        guestName: data.guestName,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  });

  // Upcoming bookings of all event types in a single list, soonest first.
  router.get('/bookings', (_req, res) => {
    const now = new Date();
    const upcoming = bookings
      .list()
      .filter((b) => new Date(b.startTime) >= now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    res.json(upcoming);
  });

  return router;
}
