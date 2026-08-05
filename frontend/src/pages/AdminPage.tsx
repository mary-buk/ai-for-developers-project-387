import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Card,
  Loader,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { createEventType, listEventTypes } from '../api';
import { EventTypeForm } from '../components/EventTypeForm';
import type { EventType, EventTypeCreate } from '../types';

export function AdminPage() {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState<EventType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () =>
    listEventTypes()
      .then(setEventTypes)
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreate(data: EventTypeCreate) {
    try {
      await createEventType(data);
      navigate('/');
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      throw e;
    }
  }

  return (
    <>
      <Title order={1} mb="xs">
        Админка: типы событий
      </Title>
      <Text c="dimmed" mb="xl">
        Создавайте виды встреч, которые гости смогут забронировать.
      </Text>

      {error && (
        <Alert className="error" color="red" variant="light" mb="xl">
          {error}
        </Alert>
      )}

      <Card withBorder radius="lg" padding="xl" mb="xl">
        <Title order={2} size="h4" mb="md">
          Новый тип события
        </Title>
        <EventTypeForm onSubmit={handleCreate} />
      </Card>

      <Title order={2} size="h4" mb="md">
        Существующие типы
      </Title>
      {eventTypes === null ? (
        <Loader size="sm" />
      ) : eventTypes.length === 0 ? (
        <Text c="dimmed">Типов событий пока нет.</Text>
      ) : (
        <Table highlightOnHover withTableBorder withColumnBorders>
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Длительность</th>
            </tr>
          </thead>
          <tbody>
            {eventTypes.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.description || '—'}</td>
                <td>{t.durationMinutes} мин</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
