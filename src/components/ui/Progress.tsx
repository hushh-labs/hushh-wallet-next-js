import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  percentage: number;
  label?: string;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ percentage, label, className }) => {
  return (
    <div className={cn("progress-pill", className)}>
      {label && <span>{label}</span>}
      <span>{percentage}% complete</span>
    </div>
  );
};

export { Progress };
