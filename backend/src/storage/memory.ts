import { randomUUID } from 'node:crypto';
import type { Booking, EventType } from '../types.js';
import type { BookingRepository, EventTypeRepository } from './repository.js';

// In-memory storage: state lives in the process and resets on restart
// (accepted project decision for the study project).

export class InMemoryEventTypeRepository implements EventTypeRepository {
  private readonly items: EventType[] = [];

  list(): EventType[] {
    return [...this.items];
  }

  findById(id: string): EventType | undefined {
    return this.items.find((item) => item.id === id);
  }

  add(data: Omit<EventType, 'id'>): EventType {
    const item: EventType = { id: randomUUID(), ...data };
    this.items.push(item);
    return item;
  }
}

export class InMemoryBookingRepository implements BookingRepository {
  private readonly items: Booking[] = [];

  list(): Booking[] {
    return [...this.items];
  }

  add(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const booking: Booking = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.items.push(booking);
    return booking;
  }
}
