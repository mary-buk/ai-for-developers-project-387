import type { Booking, EventType } from '../types.js';

export interface EventTypeRepository {
  list(): EventType[];
  findById(id: string): EventType | undefined;
  add(data: Omit<EventType, 'id'>): EventType;
}

export interface BookingRepository {
  list(): Booking[];
  add(data: Omit<Booking, 'id' | 'createdAt'>): Booking;
}
