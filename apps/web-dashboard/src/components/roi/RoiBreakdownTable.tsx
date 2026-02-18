'use client';

import type { RoiResults } from './types';

interface Props {
  results: RoiResults;
}

const formatGBP = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);

export function RoiBreakdownTable({ results }: Props) {
  const rows = [
    {
      label: 'Admin time recovery',
      value: results.adminValueSaved,
      detail: `${Math.round(results.adminHoursSaved)} hours/year recovered`,
    },
    {
      label: 'Audit preparation',
      value: results.auditPrepValueSaved,
      detail: `${results.auditDaysSaved} days saved per year`,
    },
    {
      label: 'Supplier onboarding',
      value: results.supplierValue,
      detail: 'Improved completion rate per supplier',
    },
    {
      label: 'Audit risk reduction',
      value: results.auditRiskValue,
      detail: 'Probability-weighted NCR and re-audit avoidance',
    },
  ];

  if (results.contractValue > 0) {
    rows.push({
      label: 'Contract readiness',
      value: results.contractValue,
      detail: 'Option value of compliance-ready status',
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm" aria-label="Value breakdown">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Value</th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
              Detail
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border">
              <td className="px-4 py-3 text-foreground">{row.label}</td>
              <td className="px-4 py-3 text-right font-medium text-secondary">
                {formatGBP(row.value)}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{row.detail}</td>
            </tr>
          ))}
          <tr className="border-b border-border bg-secondary/5">
            <td className="px-4 py-3 font-semibold text-foreground">TOTAL</td>
            <td className="px-4 py-3 text-right font-bold text-secondary">
              {formatGBP(results.totalValue)}
            </td>
            <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
              {results.roiPercent}% Year-1 ROI
            </td>
          </tr>
          <tr className="border-b border-border bg-muted/30">
            <td className="px-4 py-3 text-muted-foreground">Nexara annual cost</td>
            <td className="px-4 py-3 text-right font-medium text-destructive">
              -{formatGBP(results.nexaraCost)}
            </td>
            <td className="hidden px-4 py-3 sm:table-cell" />
          </tr>
          <tr>
            <td className="px-4 py-3 font-bold text-foreground">Net Year-1 benefit</td>
            <td className="px-4 py-3 text-right text-lg font-bold text-primary">
              {formatGBP(results.netBenefit)}
            </td>
            <td className="hidden px-4 py-3 sm:table-cell" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
