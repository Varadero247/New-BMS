'use client';

import { cn } from './utils';

export interface GaugeProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  sublabel?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'auto';
  showValue?: boolean;
  thickness?: number;
  className?: string;
}

const sizeConfig = {
  sm: { dim: 64, textSize: 'text-sm', subSize: 'text-[8px]' },
  md: { dim: 96, textSize: 'text-xl', subSize: 'text-[10px]' },
  lg: { dim: 128, textSize: 'text-2xl', subSize: 'text-xs' },
  xl: { dim: 160, textSize: 'text-3xl', subSize: 'text-sm' },
};

const colorMap = {
  blue: 'stroke-blue-500',
  green: 'stroke-green-500',
  yellow: 'stroke-yellow-500',
  red: 'stroke-red-500',
  purple: 'stroke-purple-500',
};

function getAutoColor(pct: number): string {
  if (pct >= 80) return 'stroke-green-500';
  if (pct >= 60) return 'stroke-yellow-500';
  if (pct >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

export function Gauge({
  value,
  max = 100,
  size = 'md',
  label,
  sublabel,
  color = 'auto',
  showValue = true,
  thickness = 8,
  className,
}: GaugeProps) {
  const config = sizeConfig[size];
  const dim = config.dim;
  const radius = (dim - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;
  const strokeColor = color === 'auto' ? getAutoColor(pct) : colorMap[color];

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth={thickness}
          />
          {/* Value arc */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            className={cn(strokeColor, 'transition-all duration-500 ease-out')}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold text-gray-900 dark:text-gray-100', config.textSize)}>
              {Math.round(pct)}%
            </span>
            {sublabel && (
              <span className={cn('text-gray-500 dark:text-gray-400', config.subSize)}>
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
          {label}
        </span>
      )}
    </div>
  );
}
