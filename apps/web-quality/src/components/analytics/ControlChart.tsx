'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

interface DataPoint {
  date: string | Date;
  value: number;
  label?: string;
}

interface ControlChartProps {
  data: DataPoint[];
  title?: string;
  chartType?: 'xbar' | 'r' | 'p' | 'c' | 'i-mr';
  ucl?: number; // Upper Control Limit
  lcl?: number; // Lower Control Limit
  target?: number; // Center line / target
  usl?: number; // Upper Specification Limit
  lsl?: number; // Lower Specification Limit
  showRules?: boolean; // Show Western Electric rules violations
}

// Western Electric Rules for detecting out-of-control conditions
function detectRuleViolations(
  data: number[],
  ucl: number,
  lcl: number,
  mean: number
): Map<number, string[]> {
  const violations = new Map<number, string[]>();
  const sigma = (ucl - mean) / 3;
  const zone1Upper = mean + sigma;
  const zone1Lower = mean - sigma;
  const zone2Upper = mean + 2 * sigma;
  const zone2Lower = mean - 2 * sigma;

  const addViolation = (index: number, rule: string) => {
    if (!violations.has(index)) {
      violations.set(index, []);
    }
    violations.get(index)!.push(rule);
  };

  data.forEach((value, i) => {
    // Rule 1: Point beyond 3 sigma
    if (value > ucl || value < lcl) {
      addViolation(i, 'Rule 1: Beyond 3σ');
    }

    // Rule 2: 9 points in a row on same side of center
    if (i >= 8) {
      const last9 = data.slice(i - 8, i + 1);
      if (last9.every((v) => v > mean) || last9.every((v) => v < mean)) {
        addViolation(i, 'Rule 2: 9 points same side');
      }
    }

    // Rule 3: 6 points in a row, all increasing or decreasing
    if (i >= 5) {
      const last6 = data.slice(i - 5, i + 1);
      let increasing = true,
        decreasing = true;
      for (let j = 1; j < last6.length; j++) {
        if (last6[j] <= last6[j - 1]) increasing = false;
        if (last6[j] >= last6[j - 1]) decreasing = false;
      }
      if (increasing || decreasing) {
        addViolation(i, 'Rule 3: 6 points trend');
      }
    }

    // Rule 4: 14 points alternating up and down
    if (i >= 13) {
      const last14 = data.slice(i - 13, i + 1);
      let alternating = true;
      for (let j = 2; j < last14.length; j++) {
        const prevDir = last14[j - 1] > last14[j - 2] ? 1 : -1;
        const currDir = last14[j] > last14[j - 1] ? 1 : -1;
        if (prevDir === currDir) {
          alternating = false;
          break;
        }
      }
      if (alternating) {
        addViolation(i, 'Rule 4: 14 points alternating');
      }
    }

    // Rule 5: 2 of 3 points beyond 2 sigma (same side)
    if (i >= 2) {
      const last3 = data.slice(i - 2, i + 1);
      const above2Sigma = last3.filter((v) => v > zone2Upper).length;
      const below2Sigma = last3.filter((v) => v < zone2Lower).length;
      if (above2Sigma >= 2 || below2Sigma >= 2) {
        addViolation(i, 'Rule 5: 2/3 beyond 2σ');
      }
    }
  });

  return violations;
}

export function ControlChart({
  data,
  title = 'Control Chart',
  chartType = 'i-mr',
  ucl: customUcl,
  lcl: customLcl,
  target: customTarget,
  usl,
  lsl,
  showRules = true,
}: ControlChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { mean, stdDev, ucl, lcl, violations } = useMemo(() => {
    const values = data.map((d) => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    );

    const ucl = customUcl ?? mean + 3 * stdDev;
    const lcl = customLcl ?? mean - 3 * stdDev;

    const violations = showRules
      ? detectRuleViolations(values, ucl, lcl, customTarget ?? mean)
      : new Map();

    return { mean, stdDev, ucl, lcl, violations };
  }, [data, customUcl, customLcl, customTarget, showRules]);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((d) =>
      typeof d.date === 'string' ? d.date : d.date.toLocaleDateString()
    );
    const values = data.map((d) => d.value);

    // Determine point colors based on violations
    const pointColors = values.map((_, i) => {
      if (violations.has(i)) return 'rgba(239, 68, 68, 1)';
      return 'rgba(59, 130, 246, 1)';
    });

    const annotations: Record<string, any> = {
      uclLine: {
        type: 'line',
        yMin: ucl,
        yMax: ucl,
        borderColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          display: true,
          content: `UCL: ${ucl.toFixed(2)}`,
          position: 'end',
        },
      },
      lclLine: {
        type: 'line',
        yMin: lcl,
        yMax: lcl,
        borderColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          display: true,
          content: `LCL: ${lcl.toFixed(2)}`,
          position: 'end',
        },
      },
      centerLine: {
        type: 'line',
        yMin: customTarget ?? mean,
        yMax: customTarget ?? mean,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 2,
        label: {
          display: true,
          content: `CL: ${(customTarget ?? mean).toFixed(2)}`,
          position: 'end',
        },
      },
    };

    // Add specification limits if provided
    if (usl !== undefined) {
      annotations.uslLine = {
        type: 'line',
        yMin: usl,
        yMax: usl,
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 2,
        label: {
          display: true,
          content: `USL: ${usl.toFixed(2)}`,
          position: 'start',
        },
      };
    }

    if (lsl !== undefined) {
      annotations.lslLine = {
        type: 'line',
        yMin: lsl,
        yMax: lsl,
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 2,
        label: {
          display: true,
          content: `LSL: ${lsl.toFixed(2)}`,
          position: 'start',
        },
      };
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Value',
            data: values,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: pointColors,
            pointBorderColor: pointColors,
            pointRadius: 5,
            pointHoverRadius: 8,
          },
        ],
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
            display: false,
          },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex;
                if (violations.has(index)) {
                  return ['', '⚠️ ' + violations.get(index)!.join(', ')];
                }
                return [];
              },
            },
          },
          annotation: {
            annotations,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Sample / Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Measurement',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, ucl, lcl, mean, customTarget, usl, lsl, violations, title]);

  // Process capability indices
  const { cp, cpk, ppk } = useMemo(() => {
    if (usl === undefined || lsl === undefined) return { cp: null, cpk: null, ppk: null };

    const cp = (usl - lsl) / (6 * stdDev);
    const cpupper = (usl - mean) / (3 * stdDev);
    const cplower = (mean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpupper, cplower);
    const ppk = cpk; // For now, same as Cpk (would differ with short-term vs long-term sigma)

    return { cp, cpk, ppk };
  }, [usl, lsl, mean, stdDev]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available for control chart
      </div>
    );
  }

  const outOfControlCount = Array.from(violations.keys()).length;

  return (
    <div className="w-full">
      <div className="h-80">
        <canvas ref={chartRef} />
      </div>

      {/* Statistics summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{mean.toFixed(3)}</p>
          <p className="text-xs text-gray-600">Mean (X̄)</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stdDev.toFixed(3)}</p>
          <p className="text-xs text-gray-600">Std Dev (σ)</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p
            className={`text-lg font-bold ${outOfControlCount > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {outOfControlCount}
          </p>
          <p className="text-xs text-gray-600">Out of Control</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
          <p className="text-xs text-gray-600">Samples</p>
        </div>
      </div>

      {/* Process capability (if spec limits provided) */}
      {cp !== null && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p
              className={`text-lg font-bold ${cp >= 1.33 ? 'text-green-600' : cp >= 1 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {cp.toFixed(3)}
            </p>
            <p className="text-xs text-gray-600">Cp</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p
              className={`text-lg font-bold ${cpk! >= 1.33 ? 'text-green-600' : cpk! >= 1 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {cpk!.toFixed(3)}
            </p>
            <p className="text-xs text-gray-600">Cpk</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p
              className={`text-lg font-bold ${ppk! >= 1.33 ? 'text-green-600' : ppk! >= 1 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {ppk!.toFixed(3)}
            </p>
            <p className="text-xs text-gray-600">Ppk</p>
          </div>
        </div>
      )}
    </div>
  );
}
