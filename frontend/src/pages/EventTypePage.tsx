import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  Text,
  Title,
} from '@mantine/core';
import { ApiError, createBooking, listEventTypes, listSlots } from '../api';
import { BookingForm } from '../components/BookingForm';
import { DaySlotsGrid } from '../components/DaySlotsGrid';
import {
  formatDateTime,
  nextDays,
  toISODate,
} from '../dates';
import type { Booking, EventType, Slot } from '../types';

const WINDOW_DAYS = 14;

function dayButtonText(d: Date) {
  const day = d.getDate();
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
  const month = d.toLocaleDateString('ru-RU', { month: 'short' });
  return { day, label: `${day} ${weekday}, ${month}` };
}

export function EventTypePage() {
  const { id } = useParams<{ id: string }>();
  const days = useMemo(() => nextDays(WINDOW_DAYS), []);

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    listEventTypes()
      .then((types) => {
        const found = types.find((t) => t.id === id) ?? null;
        setEventType(found);
        setNotFound(!found);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setSelectedSlot(null);
    setBooking(null);
    setSlots(null);
    listSlots(id, toISODate(selectedDate))
      .then(setSlots)
      .catch((e: Error) => setError(e.message));
  }, [id, selectedDate]);

  async function handleBook(guestName: string) {
    if (!id || !selectedSlot) return;
    setError(null);
    try {
      const created = await createBooking({
        eventTypeId: id,
        startTime: selectedSlot.startTime,
        guestName,
      });
      setBooking(created);
      setSelectedSlot(null);
      setSlots(await listSlots(id, toISODate(selectedDate)));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('Этот слот уже занят. Выберите другой.');
        setSelectedSlot(null);
        setSlots(await listSlots(id, toISODate(selectedDate)));
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  if (notFound) {
    return (
      <Alert className="error" color="red" variant="light">
        Тип события не найден. <Link to="/">Вернуться к списку</Link>
      </Alert>
    );
  }

  if (!eventType) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <>
      <Title order={1} mb="xs">
        {eventType.title}
      </Title>
      <Text c="dimmed" mb="xl">
        {eventType.description || 'Выберите удобный день и время.'}
      </Text>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="lg" padding="xl" className="info-card">
            <Badge variant="light" size="lg" mb="md">
              Длительность: {eventType.durationMinutes} мин
            </Badge>
            <Text size="sm" c="dimmed">
              Рабочее окно: 09:00 – 18:00. Запись на ближайшие 14 дней.
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Text fw={500} mb="sm">
            Выберите день
          </Text>
          <div className="days">
            {days.map((d) => {
              const isActive = d.toDateString() === selectedDate.toDateString();
              const { day, label } = dayButtonText(d);
              return (
                <button
                  key={d.toDateString()}
                  type="button"
                  className={isActive ? 'day-button active' : 'day-button'}
                  onClick={() => setSelectedDate(d)}
                  aria-pressed={isActive}
                >
                  <span className="day-button__day">{day}</span>
                  <span className="day-button__meta">{label.slice(String(day).length)}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <Alert className="error" color="red" variant="light" mb="md">
              {error}
            </Alert>
          )}

          {booking ? (
            <Alert className="success" color="teal" variant="light" mb="md">
              Бронирование подтверждено на {formatDateTime(booking.startTime)}.
            </Alert>
          ) : (
            <>
              <Text fw={500} mb="sm">
                Свободные слоты
              </Text>
              {slots === null ? (
                <Group justify="center" p="md">
                  <Loader size="sm" />
                </Group>
              ) : (
                <DaySlotsGrid
                  slots={slots}
                  selected={selectedSlot}
                  onSelect={setSelectedSlot}
                />
              )}
              {selectedSlot && (
                <BookingForm
                  slot={selectedSlot}
                  onSubmit={handleBook}
                  onCancel={() => setSelectedSlot(null)}
                />
              )}
            </>
          )}

          {booking && (
            <Button
              component={Link}
              to="/"
              variant="light"
              size="md"
              radius="md"
              mt="md"
            >
              Вернуться к списку
            </Button>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}
