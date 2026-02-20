'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  Chart,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Legend, Title, Tooltip);

interface COQCategory {
  category: string;
  subcategory?: string;
  amount: number;
  type: 'prevention' | 'appraisal' | 'internal_failure' | 'external_failure';
}

interface COQDashboardProps {
  data: COQCategory[];
  title?: string;
  totalRevenue?: number;
  currency?: string;
}

const typeColors = {
  prevention: { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(34, 197, 94, 1)' },
  appraisal: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },
  internal_failure: { bg: 'rgba(251, 191, 36, 0.7)', border: 'rgba(251, 191, 36, 1)' },
  external_failure: { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' },
};

const typeLabels = {
  prevention: 'Prevention Costs',
  appraisal: 'Appraisal Costs',
  internal_failure: 'Internal Failure Costs',
  external_failure: 'External Failure Costs',
};

const typeDescriptions = {
  prevention: 'Training, quality planning, process control, supplier quality programs',
  appraisal: 'Inspection, testing, audits, calibration, quality assessments',
  internal_failure: 'Scrap, rework, re-inspection, failure analysis, downtime',
  external_failure: 'Warranty, returns, complaints, recalls, lost sales, liability',
};

export function COQDashboard({
  data,
  title = 'Cost of Quality Analysis',
  totalRevenue,
  currency = '$',
}: COQDashboardProps) {
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  const summary = useMemo(() => {
    const byType = {
      prevention: 0,
      appraisal: 0,
      internal_failure: 0,
      external_failure: 0,
    };

    data.forEach((item) => {
      byType[item.type] += item.amount;
    });

    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    const conformanceCost = byType.prevention + byType.appraisal;
    const nonConformanceCost = byType.internal_failure + byType.external_failure;
    const coqRatio = totalRevenue ? (total / totalRevenue) * 100 : null;

    return { byType, total, conformanceCost, nonConformanceCost, coqRatio };
  }, [data, totalRevenue]);

  // Pie chart
  useEffect(() => {
    if (!pieChartRef.current) return;

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }

    const ctx = pieChartRef.current.getContext('2d');
    if (!ctx) return;

    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(summary.byType).map((k) => typeLabels[k as keyof typeof typeLabels]),
        datasets: [
          {
            data: Object.values(summary.byType),
            backgroundColor: Object.keys(summary.byType).map(
              (k) => typeColors[k as keyof typeof typeColors].bg
            ),
            borderColor: Object.keys(summary.byType).map(
              (k) => typeColors[k as keyof typeof typeColors].border
            ),
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percentage = ((value / summary.total) * 100).toFixed(1);
                return `${context.label}: ${currency}${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, [summary, currency]);

  // Bar chart by category
  useEffect(() => {
    if (!barChartRef.current || data.length === 0) return;

    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    const ctx = barChartRef.current.getContext('2d');
    if (!ctx) return;

    // Group by category
    const categories = [...new Set(data.map((d) => d.category))];
    const dataByCategory = categories.map((cat) => {
      const items = data.filter((d) => d.category === cat);
      return {
        category: cat,
        prevention: items.filter((i) => i.type === 'prevention').reduce((s, i) => s + i.amount, 0),
        appraisal: items.filter((i) => i.type === 'appraisal').reduce((s, i) => s + i.amount, 0),
        internal_failure: items
          .filter((i) => i.type === 'internal_failure')
          .reduce((s, i) => s + i.amount, 0),
        external_failure: items
          .filter((i) => i.type === 'external_failure')
          .reduce((s, i) => s + i.amount, 0),
      };
    });

    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Prevention',
            data: dataByCategory.map((d) => d.prevention),
            backgroundColor: typeColors.prevention.bg,
            borderColor: typeColors.prevention.border,
            borderWidth: 1,
          },
          {
            label: 'Appraisal',
            data: dataByCategory.map((d) => d.appraisal),
            backgroundColor: typeColors.appraisal.bg,
            borderColor: typeColors.appraisal.border,
            borderWidth: 1,
          },
          {
            label: 'Internal Failure',
            data: dataByCategory.map((d) => d.internal_failure),
            backgroundColor: typeColors.internal_failure.bg,
            borderColor: typeColors.internal_failure.border,
            borderWidth: 1,
          },
          {
            label: 'External Failure',
            data: dataByCategory.map((d) => d.external_failure),
            backgroundColor: typeColors.external_failure.bg,
            borderColor: typeColors.external_failure.border,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: `Cost (${currency})`,
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, [data, currency]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No Cost of Quality data available
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="w-full space-y-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
          {title}
        </h3>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Prevention</p>
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(summary.byType.prevention)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {((summary.byType.prevention / summary.total) * 100).toFixed(1)}% of COQ
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Appraisal</p>
          <p className="text-2xl font-bold text-blue-800">
            {formatCurrency(summary.byType.appraisal)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {((summary.byType.appraisal / summary.total) * 100).toFixed(1)}% of COQ
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-700 font-medium">Internal Failure</p>
          <p className="text-2xl font-bold text-yellow-800">
            {formatCurrency(summary.byType.internal_failure)}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {((summary.byType.internal_failure / summary.total) * 100).toFixed(1)}% of COQ
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">External Failure</p>
          <p className="text-2xl font-bold text-red-800">
            {formatCurrency(summary.byType.external_failure)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {((summary.byType.external_failure / summary.total) * 100).toFixed(1)}% of COQ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Cost Distribution
          </h4>
          <div className="h-64">
            <canvas ref={pieChartRef} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Costs by Category
          </h4>
          <div className="h-64">
            <canvas ref={barChartRef} />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(summary.total)}
          </p>
          <p className="text-sm text-gray-600">Total Cost of Quality</p>
          {summary.coqRatio !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summary.coqRatio.toFixed(2)}% of Revenue
            </p>
          )}
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-700">
            {formatCurrency(summary.conformanceCost)}
          </p>
          <p className="text-sm text-gray-600">Conformance Costs</p>
          <p className="text-xs text-green-600 mt-1">Prevention + Appraisal</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-700">
            {formatCurrency(summary.nonConformanceCost)}
          </p>
          <p className="text-sm text-gray-600">Non-Conformance Costs</p>
          <p className="text-xs text-red-600 mt-1">Internal + External Failure</p>
        </div>
      </div>

      {/* Optimal balance indicator */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cost Balance Analysis
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Conformance</span>
              <span>Non-Conformance</span>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(summary.conformanceCost / summary.total) * 100}%` }}
              />
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(summary.nonConformanceCost / summary.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{((summary.conformanceCost / summary.total) * 100).toFixed(1)}%</span>
              <span>{((summary.nonConformanceCost / summary.total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {summary.conformanceCost > summary.nonConformanceCost
            ? '✓ Good balance: Investing more in prevention and appraisal typically reduces failure costs over time.'
            : '⚠ Consider increasing prevention investments to reduce failure costs.'}
        </p>
      </div>

      {/* Type descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {Object.entries(typeLabels).map(([key, label]) => (
          <div key={key} className="flex items-start gap-2">
            <div
              className="w-3 h-3 rounded mt-1 flex-shrink-0"
              style={{ backgroundColor: typeColors[key as keyof typeof typeColors].border }}
            />
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {typeDescriptions[key as keyof typeof typeDescriptions]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
