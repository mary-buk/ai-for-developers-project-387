import { Badge, Table } from '@mantine/core';
import { formatDateTime } from '../dates';
import type { Booking, EventType } from '../types';

interface Props {
  bookings: Booking[];
  eventTypes: EventType[];
}

export function UpcomingBookingsList({ bookings, eventTypes }: Props) {
  if (bookings.length === 0) {
    return <p className="muted">Предстоящих встреч нет.</p>;
  }

  const titleById = new Map(eventTypes.map((t) => [t.id, t.title]));

  return (
    <Table highlightOnHover withTableBorder withColumnBorders>
      <thead>
        <tr>
          <th>Время</th>
          <th>Тип события</th>
          <th>Гость</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{formatDateTime(booking.startTime)}</td>
            <td>
              <Badge variant="light" size="sm">
                {titleById.get(booking.eventTypeId) ?? booking.eventTypeId}
              </Badge>
            </td>
            <td>{booking.guestName}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
