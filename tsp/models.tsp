using TypeSpec.Http;

namespace CalendarBooking;

/** Payload for creating an event type. */
model EventTypeCreate {
  /** Human-readable title. */
  @minLength(1)
  title: string;

  /** Free-form description shown on the public page. */
  description: string;

  /** Duration of a single booking in minutes. */
  @minValue(1)
  durationMinutes: int32;
}

/** A type of event the owner offers for booking. */
model EventType {
  /** Unique identifier. */
  id: string;

  /** Human-readable title. */
  title: string;

  /** Free-form description. */
  description: string;

  /** Duration of a single booking in minutes. */
  durationMinutes: int32;
}

/** Payload for creating a booking. */
model BookingCreate {
  /** The event type being booked. */
  eventTypeId: string;

  /** Desired slot start (UTC). Must be a free slot within the 14-day booking window. */
  startTime: utcDateTime;

  /** Guest-provided name; no account or login is required. */
  @minLength(1)
  guestName: string;
}

/** A booking of a slot for an event type. */
model Booking {
  /** Unique identifier. */
  id: string;

  /** The event type this booking belongs to. */
  eventTypeId: string;

  /** Guest-provided name. */
  guestName: string;

  /** Slot start (UTC). */
  startTime: utcDateTime;

  /** Slot end (startTime + event type duration), UTC. */
  endTime: utcDateTime;

  /** When the booking was created (UTC). */
  createdAt: utcDateTime;
}

/**
 * A free slot offered to the guest.
 * Slots are generated on a 30-minute grid within 09:00-18:00
 * for the next 14 days starting from the current date.
 * A slot is offered only if it fits into the working window:
 * startTime + event type duration must not exceed 18:00.
 */
model Slot {
  /** Slot start (UTC). */
  startTime: utcDateTime;

  /** Slot end (UTC). */
  endTime: utcDateTime;
}

/** Standard error body. */
model ErrorBody {
  code: string;
  message: string;
}

model BadRequestError {
  @statusCode statusCode: 400;
  @body body: ErrorBody;
}

model NotFoundError {
  @statusCode statusCode: 404;
  @body body: ErrorBody;
}

model ConflictError {
  @statusCode statusCode: 409;
  @body body: ErrorBody;
}

model Ok<T> {
  @statusCode statusCode: 200;
  @body body: T;
}

model Created<T> {
  @statusCode statusCode: 201;
  @body body: T;
}
