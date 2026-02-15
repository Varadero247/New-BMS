'use client';

import { Check } from 'lucide-react';

interface ComplianceRow {
  label: string;
  percent: number;
  barColor: string;
  dotColor: string;
}

const complianceRows: ComplianceRow[] = [
  { label: 'ISO 9001', percent: 92, barColor: 'bg-success-500', dotColor: 'bg-success-500' },
  { label: 'ISO 45001', percent: 88, barColor: 'bg-success-500', dotColor: 'bg-success-500' },
  { label: 'ISO 14001', percent: 74, barColor: 'bg-warning-500', dotColor: 'bg-warning-500' },
  { label: 'ISO 27001', percent: 81, barColor: 'bg-success-500', dotColor: 'bg-success-500' },
  { label: 'ISO 22001', percent: 61, barColor: 'bg-critical', dotColor: 'bg-critical' },
  { label: 'ISO 42001', percent: 70, barColor: 'bg-warning-500', dotColor: 'bg-warning-500' },
];

// 5x5 risk heatmap colour matrix (row 0 = top)
// higher row = higher consequence, higher col = higher likelihood
const heatmapColors: string[][] = [
  ['bg-warning-500/25', 'bg-critical/35', 'bg-critical/50', 'bg-critical/50', 'bg-critical/50'],
  ['bg-warning-500/25', 'bg-warning-500/35', 'bg-critical/35', 'bg-critical/50', 'bg-critical/50'],
  ['bg-success-500/15', 'bg-warning-500/25', 'bg-warning-500/35', 'bg-critical/35', 'bg-critical/35'],
  ['bg-success-500/15', 'bg-success-500/15', 'bg-warning-500/25', 'bg-warning-500/35', 'bg-critical/35'],
  ['bg-success-500/15', 'bg-success-500/15', 'bg-success-500/15', 'bg-warning-500/25', 'bg-warning-500/25'],
];

const bullets = [
  'Real-time compliance score across all active standards',
  'Automated gap detection with recommended remediation steps',
  'Board-ready reports generated in one click',
];

export default function ComplianceTracker() {
  return (
    <section className="max-w-7xl mx-auto py-24 px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* LEFT COLUMN */}
        <div>
          <p className="font-mono text-teal text-sm uppercase tracking-wider">
            Live Compliance Data
          </p>
          <h2 className="font-display text-4xl font-bold text-white mt-4 leading-tight">
            Track every standard in real time
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mt-4 max-w-md font-body leading-relaxed">
            Nexara continuously monitors your compliance posture across every active standard.
            No spreadsheets. No guesswork. Just a live, auditable view your whole team can trust.
          </p>

          {/* Feature bullets */}
          <ul className="mt-8 space-y-4">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-teal" />
                </div>
                <span className="text-gray-300 font-body text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Compliance Matrix Widget */}
          <div className="bg-surface-dark-alt rounded-2xl p-6 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-display font-semibold">Compliance Overview</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                <span className="text-success-500 text-sm font-mono">Live</span>
              </div>
            </div>

            {/* Compliance rows */}
            <div className="mt-6 space-y-4">
              {complianceRows.map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="font-mono text-sm text-gray-300 w-20 flex-shrink-0">
                    {row.label}
                  </span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.barColor} transition-all duration-700`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm text-white w-12 text-right flex-shrink-0">
                    {row.percent}%
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.dotColor}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Risk Heatmap Widget */}
          <div className="bg-surface-dark-alt rounded-2xl p-6 border border-white/10">
            <h3 className="font-display text-white font-semibold">Risk Heatmap</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-mono mt-1">
              Consequence (↑) vs Likelihood (→)
            </p>

            {/* 5x5 grid */}
            <div className="grid grid-cols-5 gap-1 mt-4">
              {heatmapColors.map((row, ri) =>
                row.map((cellColor, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`w-full aspect-square rounded ${cellColor}`}
                  />
                ))
              )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-success-500/25" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-body">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warning-500/35" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-body">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-critical/50" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-body">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
