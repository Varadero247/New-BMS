'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Compliance Gauge Component
interface ComplianceGaugeProps {
  value: number;
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ComplianceGauge({ value, label, color, size = 'md' }: ComplianceGaugeProps) {
  const sizes = {
    sm: { width: 120, height: 120, fontSize: 'text-xl' },
    md: { width: 160, height: 160, fontSize: 'text-3xl' },
    lg: { width: 200, height: 200, fontSize: 'text-4xl' },
  };

  const data = {
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: sizes[size].width, height: sizes[size].height }}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${sizes[size].fontSize}`} style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// Risk Matrix Component
interface RiskMatrixProps {
  data: {
    [key: string]: { id: string; title: string; riskScore?: number }[];
  };
  onCellClick?: (likelihood: number, severity: number) => void;
}

export function RiskMatrix({ data, onCellClick }: RiskMatrixProps) {
  const getCellColor = (likelihood: number, severity: number): string => {
    const score = likelihood * severity;
    if (score <= 4) return 'bg-green-100 hover:bg-green-200';
    if (score <= 9) return 'bg-yellow-100 hover:bg-yellow-200';
    if (score <= 15) return 'bg-orange-100 hover:bg-orange-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-xs"></th>
            {[1, 2, 3, 4, 5].map((s) => (
              <th key={s} className="p-2 text-xs text-center font-medium">
                {s}
              </th>
            ))}
          </tr>
          <tr>
            <th className="p-2 text-xs font-medium text-muted-foreground">Likelihood</th>
            <th colSpan={5} className="p-2 text-xs text-center font-medium text-muted-foreground">
              Severity
            </th>
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((l) => (
            <tr key={l}>
              <td className="p-2 text-xs text-center font-medium">{l}</td>
              {[1, 2, 3, 4, 5].map((s) => {
                const key = `${l}-${s}`;
                const cellData = data[key] || [];
                return (
                  <td
                    key={s}
                    className={`p-1 border cursor-pointer transition-colors ${getCellColor(l, s)}`}
                    onClick={() => onCellClick?.(l, s)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {cellData.length > 0 && (
                        <span className="text-xs font-bold">{cellData.length}</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 rounded" /> Low
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-200 rounded" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-200 rounded" /> High
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 rounded" /> Critical
        </span>
      </div>
    </div>
  );
}

// Monthly Trend Chart
interface TrendChartProps {
  data: { month: number; value: number }[];
  label: string;
  color: string;
  type?: 'line' | 'bar';
}

export function TrendChart({ data, label, color, type = 'line' }: TrendChartProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = {
    labels: data.map((d) => months[d.month - 1]),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: type === 'line' ? `${color}20` : color,
        fill: type === 'line',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="h-64">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
}

// Pareto Chart
interface ParetoChartProps {
  data: { category: string; count: number; cumulative: number }[];
}

export function ParetoChart({ data }: ParetoChartProps) {
  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Count',
        data: data.map((d) => d.count),
        backgroundColor: '#3b82f6',
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Cumulative %',
        data: data.map((d) => d.cumulative),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="h-80">
      {/* @ts-expect-error - mixed chart types */}
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Pie Chart for action status
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

export function PieChart({ data }: PieChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

// COPQ Breakdown Bar Chart
interface COPQChartProps {
  prevention: number;
  appraisal: number;
  internalFailure: number;
  externalFailure: number;
}

export function COPQChart({ prevention, appraisal, internalFailure, externalFailure }: COPQChartProps) {
  const data = {
    labels: ['Prevention', 'Appraisal', 'Internal Failure', 'External Failure'],
    datasets: [
      {
        data: [prevention, appraisal, internalFailure, externalFailure],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
}
