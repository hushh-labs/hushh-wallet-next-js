import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helper?: string;
  error?: string;
  className?: string;
}

const Segmented: React.FC<SegmentedProps> = ({
  options,
  value,
  onChange,
  label,
  helper,
  error,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-meta mb-2">
          {label}
        </label>
      )}
      <div className="inline-flex rounded-lg border border-g300 bg-g100 p-1">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = option.disabled;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                "focus-ring relative",
                isSelected
                  ? "bg-g900 text-g100 shadow-sm"
                  : "text-g700 hover:text-g900",
                isDisabled && "opacity-50 cursor-not-allowed",
                "tap-target min-h-[36px] min-w-[44px]"
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

export { Segmented };
