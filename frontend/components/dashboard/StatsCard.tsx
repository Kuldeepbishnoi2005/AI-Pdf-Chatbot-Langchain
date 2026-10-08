'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  accentColor?: 'purple' | 'orange' | 'pink' | 'emerald';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  accentColor = 'purple',
}) => {
  const colorMap = {
    purple: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-100',
    },
    orange: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    pink: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
  };

  const style = colorMap[accentColor];

  return (
    <div className="bg-surface rounded-2xl p-5 border border-border shadow-card hover:shadow-floating transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-subtext uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} border ${style.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-2xl font-bold text-heading tracking-tight truncate">{value}</h3>
          {badgeText && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-subtext font-normal truncate">{subtitle}</p>}
      </div>
    </div>
  );
};
