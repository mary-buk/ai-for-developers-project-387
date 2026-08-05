import assert from 'node:assert/strict';
import { test } from 'node:test';
import { intervalsOverlap } from '../src/domain/conflicts.js';

const at = (hour: number, minute = 0) => new Date(2026, 7, 10, hour, minute);

test('touching intervals do not overlap (back-to-back is allowed)', () => {
  assert.equal(intervalsOverlap(at(9), at(10), at(10), at(11)), false);
  assert.equal(intervalsOverlap(at(10), at(11), at(9), at(10)), false);
});

test('partial overlaps are detected in both directions', () => {
  assert.equal(intervalsOverlap(at(9), at(10), at(9, 30), at(10, 30)), true);
  assert.equal(intervalsOverlap(at(9, 30), at(10, 30), at(9), at(10)), true);
});

test('contained intervals overlap', () => {
  assert.equal(intervalsOverlap(at(9), at(11), at(9, 30), at(10)), true);
  assert.equal(intervalsOverlap(at(9, 30), at(10), at(9), at(11)), true);
});

test('disjoint intervals do not overlap', () => {
  assert.equal(intervalsOverlap(at(9), at(10), at(11), at(12)), false);
});
