import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Group, Text, TextInput } from '@mantine/core';
import { formatDateTime } from '../dates';
import type { Slot } from '../types';

interface Props {
  slot: Slot;
  onSubmit: (guestName: string) => Promise<void>;
  onCancel: () => void;
}

export function BookingForm({ slot, onSubmit, onCancel }: Props) {
  const [guestName, setGuestName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(guestName.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card withBorder radius="lg" padding="lg" mt="lg" className="form-card">
      <form onSubmit={handleSubmit} className="form">
        <Text size="sm" c="dimmed" mb="md">
          Выбранный слот: <strong>{formatDateTime(slot.startTime)}</strong>
        </Text>
        <TextInput
          label="Ваше имя"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
          autoFocus
          radius="md"
          size="md"
          mb="md"
        />
        <Group className="actions" justify="flex-start" gap="sm">
          <Button
            type="submit"
            radius="md"
            size="md"
            loading={saving}
            disabled={saving || guestName.trim() === ''}
          >
            {saving ? 'Бронирование…' : 'Забронировать'}
          </Button>
          <Button
            type="button"
            variant="default"
            radius="md"
            size="md"
            onClick={onCancel}
            disabled={saving}
          >
            Отмена
          </Button>
        </Group>
      </form>
    </Card>
  );
}
