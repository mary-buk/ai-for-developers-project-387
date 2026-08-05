// Mirrors the TypeSpec models in ../tsp/models.tsp (kept in sync manually).
// All datetimes travel as ISO 8601 strings (utcDateTime in the spec).

export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeCreate {
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface BookingCreate {
  eventTypeId: string;
  startTime: string;
  guestName: string;
}

export interface ErrorBody {
  code: string;
  message: string;
}
