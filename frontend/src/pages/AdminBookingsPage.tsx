import { useEffect, useState } from 'react';
import { Alert, Loader, Text, Title } from '@mantine/core';
import { listEventTypes, listUpcomingBookings } from '../api';
import { UpcomingBookingsList } from '../components/UpcomingBookingsList';
import type { Booking, EventType } from '../types';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUpcomingBookings()
      .then((items) =>
        setBookings(
          [...items].sort((a, b) => a.startTime.localeCompare(b.startTime)),
        ),
      )
      .catch((e: Error) => setError(e.message));
    listEventTypes()
      .then(setEventTypes)
      .catch(() => {
        // Titles are a nicety; fall back to raw ids if the list fails.
      });
  }, []);

  if (error) {
    return (
      <Alert className="error" color="red" variant="light">
        Не удалось загрузить встречи: {error}
      </Alert>
    );
  }

  return (
    <>
      <Title order={1} mb="xs">
        Предстоящие встречи
      </Title>
      <Text c="dimmed" mb="xl">
        Список всех подтверждённых бронирований по всем типам событий.
      </Text>
      {bookings === null ? (
        <Loader size="sm" />
      ) : (
        <UpcomingBookingsList bookings={bookings} eventTypes={eventTypes} />
      )}
    </>
  );
}

