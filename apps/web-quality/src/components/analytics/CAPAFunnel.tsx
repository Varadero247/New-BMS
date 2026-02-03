'use client';

import { useMemo } from 'react';

interface CAPAPhaseData {
  phase: string;
  count: number;
  averageDays?: number;
}

interface CAPAFunnelProps {
  data: CAPAPhaseData[];
  title?: string;
  showConversionRates?: boolean;
}

const phaseColors: Record<string, string> = {
  D1: 'bg-blue-500',
  D2: 'bg-blue-600',
  D3: 'bg-purple-500',
  D4: 'bg-purple-600',
  D5: 'bg-orange-500',
  D6: 'bg-orange-600',
  D7: 'bg-green-500',
  D8: 'bg-green-600',
  DRAFT: 'bg-gray-400',
  OPEN: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  VERIFICATION: 'bg-purple-500',
  CLOSED: 'bg-green-500',
};

const phaseLabels: Record<string, string> = {
  D1: 'D1: Team Formation',
  D2: 'D2: Problem Description',
  D3: 'D3: Containment',
  D4: 'D4: Root Cause',
  D5: 'D5: Corrective Actions',
  D6: 'D6: Implementation',
  D7: 'D7: Prevention',
  D8: 'D8: Closure',
  DRAFT: 'Draft',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  VERIFICATION: 'Verification',
  CLOSED: 'Closed',
};

export function CAPAFunnel({
  data,
  title = 'CAPA Progress Funnel',
  showConversionRates = true,
}: CAPAFunnelProps) {
  const { maxCount, conversionRates } = useMemo(() => {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    const conversionRates: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const rate = data[i - 1].count > 0
        ? (data[i].count / data[i - 1].count) * 100
        : 0;
      conversionRates.push(rate);
    }

    return { maxCount, conversionRates };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No CAPA data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">{title}</h3>
      )}

      <div className="space-y-2">
        {data.map((item, index) => {
          const widthPercent = (item.count / maxCount) * 100;
          const color = phaseColors[item.phase] || 'bg-gray-500';
          const label = phaseLabels[item.phase] || item.phase;

          return (
            <div key={item.phase}>
              {/* Funnel bar */}
              <div className="relative">
                <div
                  className="flex items-center justify-center mx-auto transition-all duration-500"
                  style={{
                    width: `${Math.max(widthPercent, 20)}%`,
                  }}
                >
                  <div
                    className={`${color} w-full py-3 px-4 rounded-lg text-white flex items-center justify-between`}
                    style={{
                      clipPath: index === data.length - 1
                        ? 'none'
                        : 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                    }}
                  >
                    <span className="font-medium text-sm truncate">{label}</span>
                    <div className="text-right">
                      <span className="font-bold text-lg">{item.count}</span>
                      {item.averageDays !== undefined && (
                        <span className="text-xs opacity-75 ml-2">
                          ({item.averageDays}d avg)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversion rate arrow */}
                {showConversionRates && index < data.length - 1 && (
                  <div className="flex justify-center -my-1 relative z-10">
                    <div className="bg-white px-2 py-0.5 rounded text-xs font-medium text-gray-600 border shadow-sm">
                      ↓ {conversionRates[index].toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data[0]?.count || 0}</p>
          <p className="text-xs text-gray-600">Started</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {data[data.length - 1]?.count || 0}
          </p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {data[0]?.count > 0
              ? ((data[data.length - 1]?.count / data[0]?.count) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-xs text-gray-600">Completion Rate</p>
        </div>
      </div>

      {/* Average time by phase */}
      {data.some(d => d.averageDays !== undefined) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Average Time per Phase</h4>
          <div className="flex gap-2 flex-wrap">
            {data.filter(d => d.averageDays !== undefined).map(item => (
              <div
                key={item.phase}
                className="bg-gray-100 rounded px-3 py-1 text-sm"
              >
                <span className="text-gray-600">{phaseLabels[item.phase]?.split(':')[0] || item.phase}:</span>
                <span className="font-medium ml-1">{item.averageDays}d</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to create standard 8D funnel data
export function create8DFunnelData(capas: Array<{ currentPhase: string }>): CAPAPhaseData[] {
  const phases = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
  const phaseOrder = new Map(phases.map((p, i) => [p, i]));

  return phases.map(phase => {
    // Count CAPAs that have reached or passed this phase
    const count = capas.filter(capa => {
      const capaPhaseIndex = phaseOrder.get(capa.currentPhase) ?? -1;
      const targetPhaseIndex = phaseOrder.get(phase) ?? -1;
      return capaPhaseIndex >= targetPhaseIndex;
    }).length;

    return { phase, count };
  });
}
