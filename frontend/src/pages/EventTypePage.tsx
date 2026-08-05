import { useEffect, useState } from 'react';
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

// The day strip is anchored to UTC calendar days (same as the server window),
// so labels must be derived from the UTC parts too.
function dayButtonText(d: Date) {
  const day = d.getUTCDate();
  const weekday = d.toLocaleDateString('ru-RU', {
    weekday: 'short',
    timeZone: 'UTC',
  });
  const month = d.toLocaleDateString('ru-RU', { month: 'short', timeZone: 'UTC' });
  return { day, label: `${day} ${weekday}, ${month}` };
}

export function EventTypePage() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState<Date[]>(() => nextDays(WINDOW_DAYS));

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => nextDays(WINDOW_DAYS)[0]);
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

  // A page left open over midnight keeps a stale "today" that the server will
  // reject; recompute the window whenever the tab regains focus.
  useEffect(() => {
    const refresh = () => setDays(nextDays(WINDOW_DAYS));
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  // If the window moved, reset a selection that is no longer offered.
  useEffect(() => {
    if (!days.some((d) => toISODate(d) === toISODate(selectedDate))) {
      setSelectedDate(days[0]);
    }
  }, [days, selectedDate]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setSelectedSlot(null);
    setBooking(null);
    setSlots(null);
    listSlots(id, toISODate(selectedDate), controller.signal)
      .then(setSlots)
      .catch((e: Error) => {
        if (e.name === 'AbortError') return;
        setSlots([]);
        setError(e.message);
      });
    return () => controller.abort();
  }, [id, selectedDate]);

  async function refreshSlots(): Promise<Slot[]> {
    if (!id) return [];
    try {
      return await listSlots(id, toISODate(selectedDate));
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message);
      }
      return [];
    }
  }

  async function handleBook(guestName: string) {
    if (!id || !selectedSlot) return;
    setError(null);
    try {
      // The slot may have expired while the guest was typing their name.
      if (new Date(selectedSlot.startTime) <= new Date()) {
        setSelectedSlot(null);
        setSlots(await refreshSlots());
        setError('Время этого слота уже прошло. Выберите другой.');
        return;
      }
      const created = await createBooking({
        eventTypeId: id,
        startTime: selectedSlot.startTime,
        guestName,
      });
      setBooking(created);
      setSelectedSlot(null);
      setSlots(await refreshSlots());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 400)) {
        const nextSlots = await refreshSlots();
        setSelectedSlot(null);
        setSlots(nextSlots);
        setError(
          e.status === 409
            ? 'Этот слот уже занят. Выберите другой.'
            : 'Этот слот больше недоступен. Выберите другой.',
        );
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
              const iso = toISODate(d);
              const isActive = iso === toISODate(selectedDate);
              const { day, label } = dayButtonText(d);
              return (
                <button
                  key={iso}
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
