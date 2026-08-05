import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, NumberInput, Textarea, TextInput } from '@mantine/core';
import type { EventTypeCreate } from '../types';

interface Props {
  onSubmit: (data: EventTypeCreate) => Promise<void>;
}

export function EventTypeForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | string>(60);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        durationMinutes: Number(durationMinutes),
      });
      setTitle('');
      setDescription('');
      setDurationMinutes(60);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <TextInput
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        radius="md"
        size="md"
        mb="md"
      />
      <Textarea
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        radius="md"
        size="md"
        mb="md"
      />
      <NumberInput
        label="Длительность (мин)"
        value={durationMinutes}
        onChange={(value) => setDurationMinutes(value ?? '')}
        min={1}
        required
        radius="md"
        size="md"
        mb="md"
      />
      <Button
        type="submit"
        radius="md"
        size="md"
        loading={saving}
        disabled={saving}
      >
        {saving ? 'Сохранение…' : 'Создать тип события'}
      </Button>
    </form>
  );
}
