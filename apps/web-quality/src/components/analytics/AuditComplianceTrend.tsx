'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ComplianceDataPoint {
  period: string;
  compliance: number; // Percentage 0-100
  auditsCompleted?: number;
  findings?: number;
  majorFindings?: number;
}

interface AuditComplianceTrendProps {
  data: ComplianceDataPoint[];
  title?: string;
  target?: number;
  showFindings?: boolean;
}

export function AuditComplianceTrend({
  data,
  title = 'Audit Compliance Trend',
  target = 95,
  showFindings = true,
}: AuditComplianceTrendProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const datasets: any[] = [
      {
        type: 'line',
        label: 'Compliance %',
        data: data.map(d => d.compliance),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        yAxisID: 'y',
        pointBackgroundColor: data.map(d =>
          d.compliance >= target ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ];

    if (showFindings) {
      datasets.push({
        type: 'bar',
        label: 'Total Findings',
        data: data.map(d => d.findings || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      });

      if (data.some(d => d.majorFindings !== undefined)) {
        datasets.push({
          type: 'bar',
          label: 'Major Findings',
          data: data.map(d => d.majorFindings || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        });
      }
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.period),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            position: 'top',
          },
          annotation: {
            annotations: {
              targetLine: {
                type: 'line',
                yMin: target,
                yMax: target,
                yScaleID: 'y',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Target: ${target}%`,
                  position: 'end',
                },
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Period',
            },
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Compliance %',
            },
            min: 0,
            max: 100,
          },
          ...(showFindings && {
            y1: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Findings Count',
              },
              min: 0,
              grid: {
                drawOnChartArea: false,
              },
            },
          }),
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title, target, showFindings]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No audit compliance data available
      </div>
    );
  }

  // Calculate summary stats
  const latestCompliance = data[data.length - 1]?.compliance || 0;
  const avgCompliance = data.reduce((sum, d) => sum + d.compliance, 0) / data.length;
  const trend = data.length >= 2
    ? data[data.length - 1].compliance - data[data.length - 2].compliance
    : 0;
  const totalFindings = data.reduce((sum, d) => sum + (d.findings || 0), 0);
  const totalMajor = data.reduce((sum, d) => sum + (d.majorFindings || 0), 0);

  return (
    <div className="w-full">
      <div className="h-80">
        <canvas ref={chartRef} />
      </div>

      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold ${latestCompliance >= target ? 'text-green-600' : 'text-red-600'}`}>
            {latestCompliance.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">Current</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgCompliance.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Average</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">Trend</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalFindings}</p>
          <p className="text-xs text-gray-600">Total Findings</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{totalMajor}</p>
          <p className="text-xs text-gray-600">Major Findings</p>
        </div>
      </div>

      {/* Performance indicator */}
      <div className="mt-4 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Performance</span>
          <span className={`text-sm font-bold ${avgCompliance >= target ? 'text-green-600' : 'text-red-600'}`}>
            {avgCompliance >= target ? 'Meeting Target' : 'Below Target'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${avgCompliance >= target ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(avgCompliance, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>Target: {target}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
