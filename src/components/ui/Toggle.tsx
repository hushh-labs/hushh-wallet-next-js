import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  helper,
  error,
  disabled = false,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-meta font-medium">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
            "focus-ring tap-target",
            checked ? "bg-g900" : "bg-g300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
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

export { Toggle };
