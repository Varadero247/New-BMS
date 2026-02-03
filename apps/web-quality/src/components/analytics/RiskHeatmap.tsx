'use client';

import { useMemo } from 'react';

interface RiskItem {
  id: string;
  title: string;
  likelihood: number; // 1-5
  severity: number; // 1-5
  category?: string;
}

interface RiskHeatmapProps {
  risks: RiskItem[];
  title?: string;
  onRiskClick?: (risk: RiskItem) => void;
  showLegend?: boolean;
}

const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const severityLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

// Risk score matrix colors (likelihood x severity)
const getRiskColor = (likelihood: number, severity: number): string => {
  const score = likelihood * severity;
  if (score >= 20) return 'bg-red-600'; // Critical
  if (score >= 12) return 'bg-red-400'; // High
  if (score >= 8) return 'bg-orange-400'; // Medium-High
  if (score >= 4) return 'bg-yellow-400'; // Medium
  if (score >= 2) return 'bg-green-300'; // Low
  return 'bg-green-200'; // Very Low
};

const getRiskLevel = (likelihood: number, severity: number): string => {
  const score = likelihood * severity;
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 8) return 'Medium-High';
  if (score >= 4) return 'Medium';
  if (score >= 2) return 'Low';
  return 'Very Low';
};

export function RiskHeatmap({
  risks,
  title = 'Risk Assessment Matrix',
  onRiskClick,
  showLegend = true,
}: RiskHeatmapProps) {
  // Group risks by cell
  const risksByCell = useMemo(() => {
    const map = new Map<string, RiskItem[]>();
    risks.forEach(risk => {
      const key = `${risk.likelihood}-${risk.severity}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(risk);
    });
    return map;
  }, [risks]);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      )}

      <div className="flex">
        {/* Y-axis label */}
        <div className="flex items-center justify-center w-8">
          <span className="text-sm font-medium text-gray-700 transform -rotate-90 whitespace-nowrap">
            Likelihood →
          </span>
        </div>

        <div className="flex-1">
          {/* Matrix */}
          <div className="grid grid-cols-6 gap-1">
            {/* Empty corner */}
            <div className="h-12" />

            {/* Severity labels (top) */}
            {severityLabels.map((label, i) => (
              <div
                key={label}
                className="h-12 flex items-center justify-center text-xs font-medium text-gray-600 text-center px-1"
              >
                {i + 1}. {label}
              </div>
            ))}

            {/* Matrix rows (reversed so 5 is at top) */}
            {[5, 4, 3, 2, 1].map(likelihood => (
              <>
                {/* Likelihood label */}
                <div
                  key={`label-${likelihood}`}
                  className="h-20 flex items-center justify-end pr-2 text-xs font-medium text-gray-600"
                >
                  {likelihood}. {likelihoodLabels[likelihood - 1]}
                </div>

                {/* Cells */}
                {[1, 2, 3, 4, 5].map(severity => {
                  const cellRisks = risksByCell.get(`${likelihood}-${severity}`) || [];
                  const riskLevel = getRiskLevel(likelihood, severity);

                  return (
                    <div
                      key={`${likelihood}-${severity}`}
                      className={`h-20 ${getRiskColor(likelihood, severity)} rounded-md p-1 relative group transition-all hover:ring-2 hover:ring-blue-500`}
                      title={`${riskLevel}: ${cellRisks.length} risk(s)`}
                    >
                      {/* Risk count badge */}
                      {cellRisks.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cellRisks.length}
                        </div>
                      )}

                      {/* Risk dots */}
                      <div className="flex flex-wrap gap-1 overflow-hidden h-full">
                        {cellRisks.slice(0, 6).map(risk => (
                          <button
                            key={risk.id}
                            onClick={() => onRiskClick?.(risk)}
                            className="w-4 h-4 bg-white/80 rounded-full border-2 border-gray-700 hover:bg-white hover:scale-125 transition-transform cursor-pointer"
                            title={risk.title}
                          />
                        ))}
                        {cellRisks.length > 6 && (
                          <span className="text-xs text-gray-700 font-medium">
                            +{cellRisks.length - 6}
                          </span>
                        )}
                      </div>

                      {/* Hover tooltip */}
                      {cellRisks.length > 0 && (
                        <div className="hidden group-hover:block absolute z-10 bg-white shadow-lg rounded-lg p-2 min-w-[200px] left-full ml-2 top-0">
                          <p className="text-xs font-semibold text-gray-700 mb-1">{riskLevel} Risk</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cellRisks.map(r => (
                              <li key={r.id} className="truncate">• {r.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-sm font-medium text-gray-700">Severity →</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {[
            { color: 'bg-green-200', label: 'Very Low (1-2)' },
            { color: 'bg-green-300', label: 'Low (2-4)' },
            { color: 'bg-yellow-400', label: 'Medium (4-8)' },
            { color: 'bg-orange-400', label: 'Medium-High (8-12)' },
            { color: 'bg-red-400', label: 'High (12-20)' },
            { color: 'bg-red-600', label: 'Critical (20-25)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-red-600">
            {risks.filter(r => r.likelihood * r.severity >= 12).length}
          </p>
          <p className="text-xs text-gray-600">High/Critical Risks</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-yellow-600">
            {risks.filter(r => {
              const score = r.likelihood * r.severity;
              return score >= 4 && score < 12;
            }).length}
          </p>
          <p className="text-xs text-gray-600">Medium Risks</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">
            {risks.filter(r => r.likelihood * r.severity < 4).length}
          </p>
          <p className="text-xs text-gray-600">Low Risks</p>
        </div>
      </div>
    </div>
  );
}
