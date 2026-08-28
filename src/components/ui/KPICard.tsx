'use client';

import { KPIData } from '@/types';

interface KPICardProps {
  data: KPIData;
  className?: string;
}

export default function KPICard({ data, className = '' }: KPICardProps) {
  const borderColors = {
    navy: 'border-l-[var(--color-gov-navy)]',
    ochre: 'border-l-[var(--color-gov-ochre)]',
    green: 'border-l-[var(--color-land-green)]',
    red: 'border-l-[var(--color-status-error)]',
    tertiary: 'border-l-[var(--color-gov-tertiary-container)]',
  };

  return (
    <div className={`gov-card p-5 border-l-4 ${borderColors[data.color || 'navy']} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">
            {data.label}
          </div>
          <div className="text-[32px] font-bold text-[var(--color-on-surface)] leading-tight">
            {data.value}
          </div>
          {data.subtitle && (
            <div className="text-[13px] text-[var(--color-on-surface-variant)] mt-1">{data.subtitle}</div>
          )}
        </div>
        {data.icon && (
          <span className="material-symbols-outlined text-[var(--color-gov-navy)] text-[28px] opacity-40">
            {data.icon}
          </span>
        )}
      </div>
      {data.trend && (
        <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${
          data.trend === 'up' ? 'text-[var(--color-land-green)]' : data.trend === 'down' ? 'text-[var(--color-status-error)]' : 'text-[var(--color-on-surface-variant)]'
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {data.trend === 'up' ? 'trending_up' : data.trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
          {data.trendValue}
        </div>
      )}
    </div>
  );
}
