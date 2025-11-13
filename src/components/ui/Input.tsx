import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helper, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-meta mb-2" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "input focus-ring",
            error && "border-g800",
            className
          )}
          ref={ref}
          {...props}
        />
        {helper && !error && (
          <p className="text-tiny mt-1">{helper}</p>
        )}
        {error && (
          <p className="text-tiny mt-1 text-g800 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
