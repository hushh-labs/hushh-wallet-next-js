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
      className={`preference-chip ${selected ? 'selected' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
