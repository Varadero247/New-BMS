'use client';

import { Card, CardContent } from '@ims/ui';
import { TrendingUp, Clock, Award, CreditCard } from 'lucide-react';
import type { RoiResults as RoiResultsType } from './types';
import { PLAN_PRICES } from '@/lib/roi/calculations';

interface Props {
  results: RoiResultsType;
}

const formatGBP = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);

const metrics = [
  {
    key: 'totalValue' as const,
    label: 'Annual Value Delivered',
    icon: TrendingUp,
    format: (r: RoiResultsType) => formatGBP(r.totalValue),
    color: 'text-secondary',
  },
  {
    key: 'roiPercent' as const,
    label: 'Year-1 ROI',
    icon: Award,
    format: (r: RoiResultsType) => `${r.roiPercent}%`,
    color: 'text-primary',
  },
  {
    key: 'paybackMonths' as const,
    label: 'Payback Period',
    icon: Clock,
    format: (r: RoiResultsType) => `${r.paybackMonths} months`,
    color: 'text-warning',
  },
  {
    key: 'recommendedPlan' as const,
    label: 'Recommended Plan',
    icon: CreditCard,
    format: (r: RoiResultsType) =>
      `${r.recommendedPlan} at ${formatGBP(PLAN_PRICES[r.recommendedPlan])}/mo`,
    color: 'text-info',
  },
];

export function RoiResults({ results }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="ROI calculation results">
      {metrics.map(({ key, label, icon: Icon, format, color }) => (
        <Card key={key} className="border-border bg-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className={`rounded-lg bg-muted p-2 ${color}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold ${color}`} aria-live="polite">
                {format(results)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
