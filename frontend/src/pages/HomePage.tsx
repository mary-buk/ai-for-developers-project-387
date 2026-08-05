import { useEffect, useState } from 'react';
import { Text, Title } from '@mantine/core';
import { listEventTypes } from '../api';
import { EventTypeCard } from '../components/EventTypeCard';
import type { EventType } from '../types';

export function HomePage() {
  const [eventTypes, setEventTypes] = useState<EventType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEventTypes()
      .then(setEventTypes)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return <p className="error">Не удалось загрузить список: {error}</p>;
  }
  if (eventTypes === null) {
    return <p className="muted">Загрузка…</p>;
  }

  return (
    <>
      <Title order={1} mb="xs">
        Записаться на встречу
      </Title>
      <Text c="dimmed" mb="xl">
        Выберите подходящий тип встречи и забронируйте удобное время.
      </Text>
      {eventTypes.length === 0 ? (
        <p className="muted">Пока нет доступных видов брони.</p>
      ) : (
        <div className="event-type-grid">
          {eventTypes.map((t) => (
            <EventTypeCard key={t.id} eventType={t} />
          ))}
        </div>
      )}
    </>
  );
}
