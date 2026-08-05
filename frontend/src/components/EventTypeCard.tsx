import { Badge, Card, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { EventType } from '../types';

interface Props {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: Props) {
  return (
    <Card className="card" padding="lg" radius="lg" withBorder>
      <div className="card-body">
        <Text className="card-title" fw={600} size="lg" mb="xs">
          {eventType.title}
        </Text>
        <Text className="card-description" c="dimmed" size="sm" mb="md" lineClamp={2}>
          {eventType.description || 'Без описания'}
        </Text>
        <Group justify="space-between" align="center" mt="auto">
          <Badge variant="light" size="md" className="duration-badge">
            Длительность: {eventType.durationMinutes} мин
          </Badge>
          <Link
            to={`/event-types/${eventType.id}`}
            className="card-link stretched-link"
            aria-label="Выбрать слот"
          >
            Выбрать слот
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </Group>
      </div>
    </Card>
  );
}
