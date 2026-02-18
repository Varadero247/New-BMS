'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ParetoData {
  category: string;
  count: number;
}

interface ParetoDiagramProps {
  data: ParetoData[];
  title?: string;
  barColor?: string;
  lineColor?: string;
  threshold?: number; // Default 80%
}

export function ParetoDiagram({
  data,
  title = 'Pareto Analysis',
  barColor = 'rgba(59, 130, 246, 0.8)',
  lineColor = 'rgba(239, 68, 68, 1)',
  threshold = 80,
}: ParetoDiagramProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Sort data by count descending
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    // Calculate cumulative percentages
    const total = sortedData.reduce((sum, item) => sum + item.count, 0);
    let cumulative = 0;
    const cumulativePercentages = sortedData.map((item) => {
      cumulative += item.count;
      return (cumulative / total) * 100;
    });

    // Find the vital few (items that make up threshold%)
    const vitalFewIndex = cumulativePercentages.findIndex((p) => p >= threshold);

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedData.map((d) => d.category),
        datasets: [
          {
            type: 'bar',
            label: 'Count',
            data: sortedData.map((d) => d.count),
            backgroundColor: sortedData.map((_, i) =>
              i <= vitalFewIndex ? barColor : 'rgba(156, 163, 175, 0.5)'
            ),
            borderColor: sortedData.map((_, i) =>
              i <= vitalFewIndex ? barColor.replace('0.8', '1') : 'rgba(156, 163, 175, 0.8)'
            ),
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Cumulative %',
            data: cumulativePercentages,
            borderColor: lineColor,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: lineColor,
            pointRadius: 4,
            yAxisID: 'y1',
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
            position: 'top',
          },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const index = items[0].dataIndex;
                if (index <= vitalFewIndex) {
                  return ['', '⭐ Vital Few (Top 80%)'];
                }
                return ['', 'Trivial Many'];
              },
            },
          },
          annotation: {
            annotations: {
              thresholdLine: {
                type: 'line',
                yMin: threshold,
                yMax: threshold,
                yScaleID: 'y1',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `${threshold}%`,
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
              text: 'Category',
            },
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Count',
            },
            beginAtZero: true,
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Cumulative %',
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
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
  }, [data, title, barColor, lineColor, threshold]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available for Pareto analysis
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <canvas ref={chartRef} />
    </div>
  );
}
