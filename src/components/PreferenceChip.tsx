'use client';

import { useState } from 'react';

interface PreferenceChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PreferenceChip({ label, selected, onToggle, disabled = false }: PreferenceChipProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      type="button"
      className={`chip ${selected ? 'selected' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
