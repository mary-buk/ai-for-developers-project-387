import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generateDaySlots,
  isSlotOnGrid,
  isWithinWindow,
} from '../src/domain/slotGrid.js';

// The slot window is anchored to UTC calendar days (see slotGrid.ts).
const day = (d: number, h = 0, m = 0) => new Date(Date.UTC(2026, 7, d, h, m));

test('grid: 30-minute steps inside 09:00-18:00', () => {
  const slots = generateDaySlots(day(11), 30, [], day(10));
  assert.equal(slots.length, 18); // 9 working hours * 2 slots per hour
  assert.deepEqual(
    slots.map((s) => [s.start.getUTCHours(), s.start.getUTCMinutes()]),
    Array.from({ length: 18 }, (_, i) => [9 + Math.floor(i / 2), (i % 2) * 30]),
  );
});

test('a slot is offered only if it fits into the working window', () => {
  const slots = generateDaySlots(day(11), 60, [], day(10));
  const last = slots.at(-1)!;
  assert.equal(last.start.getUTCHours(), 17);
  assert.equal(last.start.getUTCMinutes(), 0); // 17:00 + 60min = 18:00, fits
});

test('busy intervals are excluded', () => {
  const busy = [{ start: day(11, 9, 30), end: day(11, 10, 0) }];
  const slots = generateDaySlots(day(11), 30, busy, day(10));
  assert.equal(
    slots.some((s) => s.start.getUTCHours() === 9 && s.start.getUTCMinutes() === 30),
    false,
  );
  assert.equal(slots.length, 17);
});

test('past slots of today are excluded', () => {
  const slots = generateDaySlots(day(11), 30, [], day(11, 15, 0));
  assert.ok(slots.length > 0);
  assert.ok(slots.every((s) => s.start >= day(11, 15, 0)));
});

test('booking window boundaries', () => {
  const now = day(10);
  assert.equal(isWithinWindow(day(10), now), true); // today
  assert.equal(isWithinWindow(day(23), now), true); // +13 days
  assert.equal(isWithinWindow(day(24), now), false); // +14 days
  assert.equal(isWithinWindow(day(9), now), false); // yesterday
});

test('isSlotOnGrid', () => {
  assert.equal(isSlotOnGrid(day(11, 9, 30), 60), true);
  assert.equal(isSlotOnGrid(day(11, 9, 15), 60), false); // off the 30-min grid
  assert.equal(isSlotOnGrid(day(11, 17, 30), 60), false); // would end 18:30
  assert.equal(isSlotOnGrid(day(11, 8, 30), 30), false); // before 09:00
});
