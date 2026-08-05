/**
 * Half-open interval overlap: [aStart, aEnd) intersects [bStart, bEnd).
 * Touching boundaries (aEnd === bStart) are NOT a conflict, so back-to-back
 * bookings are allowed.
 */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
