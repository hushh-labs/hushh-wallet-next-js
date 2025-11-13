import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ChipsProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  helper?: string;
  error?: string;
  maxSelection?: number;
  className?: string;
}

const Chips: React.FC<ChipsProps> = ({
  options,
  value = [],
  onChange,
  label,
  helper,
  error,
  maxSelection,
  className
}) => {
  const handleChipToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    let newValue: string[];

    if (isSelected) {
      newValue = value.filter(v => v !== optionValue);
    } else {
      if (maxSelection && value.length >= maxSelection) {
        return; // Don't allow selection if max reached
      }
      newValue = [...value, optionValue];
    }

    onChange(newValue);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-meta mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          const isDisabled = option.disabled || 
            (maxSelection && !isSelected && value.length >= maxSelection);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && handleChipToggle(option.value)}
              disabled={!!isDisabled}
              className={cn(
                "px-3 py-2 rounded-full text-sm font-medium transition-all duration-150",
                "border focus-ring",
                isSelected
                  ? "bg-g900 text-g100 border-g900"
                  : "bg-g100 text-g700 border-g300 hover:border-g400",
                isDisabled && "opacity-50 cursor-not-allowed",
                "tap-target min-h-[36px]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {helper && !error && (
        <p className="text-tiny mt-2">{helper}</p>
      )}
      {error && (
        <p className="text-tiny mt-2 text-g800 font-medium">{error}</p>
      )}
    </div>
  );
};

export { Chips };
