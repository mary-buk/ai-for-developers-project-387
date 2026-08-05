import { Text } from '@mantine/core';
import { formatTime } from '../dates';
import type { Slot } from '../types';

interface Props {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
}

export function DaySlotsGrid({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <Text c="dimmed" size="sm" className="muted">
        На этот день свободных слотов нет.
      </Text>
    );
  }

  return (
    <div className="slots">
      {slots.map((slot) => {
        const isSelected = selected?.startTime === slot.startTime;
        return (
          <button
            key={slot.startTime}
            type="button"
            className={isSelected ? 'slot selected' : 'slot'}
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
          >
            {formatTime(slot.startTime)}
          </button>
        );
      })}
    </div>
  );
}
