'use client';

import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Shield, Filter, Eye, EyeOff } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  inherentLikelihood: number;
  inherentSeverity: number;
  residualLikelihood: number;
  residualSeverity: number;
  controls: string[];
  residualRating: string;
}

const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'Fire in warehouse',
    description: 'Flammable materials stored without proper containment',
    category: 'Fire',
    owner: 'John Smith',
    inherentLikelihood: 3,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Fire detection system', 'Regular inspections', 'Staff training'],
    residualRating: 'High',
  },
  {
    id: '2',
    title: 'Chemical exposure',
    description: 'Handling of hazardous chemicals without adequate PPE',
    category: 'Chemical',
    owner: 'Sarah Johnson',
    inherentLikelihood: 4,
    inherentSeverity: 5,
    residualLikelihood: 2,
    residualSeverity: 5,
    controls: ['PPE requirements', 'Safety data sheets', 'Training program'],
    residualRating: 'High',
  },
  {
    id: '3',
    title: 'Manual handling injury',
    description: 'Risk of back strain from lifting heavy objects',
    category: 'Manual Handling',
    owner: 'Mike Davis',
    inherentLikelihood: 5,
    inherentSeverity: 3,
    residualLikelihood: 2,
    residualSeverity: 3,
    controls: ['Lifting equipment', 'Ergonomic training', 'Load limits'],
    residualRating: 'Medium',
  },
  {
    id: '4',
    title: 'Electrical shock',
    description: 'Contact with live electrical equipment',
    category: 'Electrical',
    owner: 'Elena Rodriguez',
    inherentLikelihood: 2,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Isolation procedures', 'Testing regime', 'Lockout systems'],
    residualRating: 'Very High',
  },
  {
    id: '5',
    title: 'Fall from height',
    description: 'Working on elevated surfaces without fall protection',
    category: 'Working at Height',
    owner: 'David Chen',
    inherentLikelihood: 3,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Harnesses', 'Guard rails', 'Safety nets', 'Training'],
    residualRating: 'High',
  },
  {
    id: '6',
    title: 'Machinery entanglement',
    description: 'Hair or clothing caught in rotating machinery',
    category: 'Machinery',
    owner: 'James Wilson',
    inherentLikelihood: 2,
    inherentSeverity: 4,
    residualLikelihood: 1,
    residualSeverity: 4,
    controls: ['Guards', 'Lock-out tag-out', 'Training'],
    residualRating: 'High',
  },
  {
    id: '7',
    title: 'Slip and fall',
    description: 'Wet or uneven surfaces causing falls',
    category: 'Fire',
    owner: 'Lisa Martinez',
    inherentLikelihood: 4,
    inherentSeverity: 2,
    residualLikelihood: 2,
    residualSeverity: 2,
    controls: ['Cleaning schedule', 'Warning signs', 'Non-slip surfaces'],
    residualRating: 'Low',
  },
  {
    id: '8',
    title: 'Chemical burn',
    description: 'Direct contact with corrosive substances',
    category: 'Chemical',
    owner: 'Robert Kim',
    inherentLikelihood: 3,
    inherentSeverity: 4,
    residualLikelihood: 1,
    residualSeverity: 4,
    controls: ['PPE', 'Secondary containment', 'First aid supplies'],
    residualRating: 'High',
  },
  {
    id: '9',
    title: 'Arc flash incident',
    description: 'Thermal burn from electrical arc',
    category: 'Electrical',
    owner: 'Angela Foster',
    inherentLikelihood: 1,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Arc flash study', 'PPE', 'Procedures'],
    residualRating: 'Very High',
  },
  {
    id: '10',
    title: 'Struck by object',
    description: 'Impact injury from falling or moving objects',
    category: 'Machinery',
    owner: 'Kevin Lee',
    inherentLikelihood: 3,
    inherentSeverity: 3,
    residualLikelihood: 2,
    residualSeverity: 3,
    controls: ['Hard hats', 'Barriers', 'Warning systems'],
    residualRating: 'Medium',
  },
  {
    id: '11',
    title: 'Repetitive strain',
    description: 'Cumulative trauma from repetitive tasks',
    category: 'Manual Handling',
    owner: 'Patricia Brown',
    inherentLikelihood: 4,
    inherentSeverity: 2,
    residualLikelihood: 2,
    residualSeverity: 2,
    controls: ['Job rotation', 'Ergonomic assessment', 'Stretching program'],
    residualRating: 'Low',
  },
  {
    id: '12',
    title: 'Scaffold collapse',
    description: 'Failure of temporary work platform',
    category: 'Working at Height',
    owner: 'Henry Taylor',
    inherentLikelihood: 1,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Competent inspections', 'Load calculations', 'Standards'],
    residualRating: 'Very High',
  },
  {
    id: '13',
    title: 'Vehicle impact',
    description: 'Being struck by moving vehicles in work area',
    category: 'Fire',
    owner: 'Monica Garcia',
    inherentLikelihood: 2,
    inherentSeverity: 5,
    residualLikelihood: 1,
    residualSeverity: 5,
    controls: ['Traffic management', 'Visibility aids', 'Speed limits'],
    residualRating: 'Very High',
  },
  {
    id: '14',
    title: 'Chemical splash',
    description: 'Splashing of hazardous liquid during transfer',
    category: 'Chemical',
    owner: 'Steven White',
    inherentLikelihood: 3,
    inherentSeverity: 3,
    residualLikelihood: 1,
    residualSeverity: 3,
    controls: ['Spill trays', 'Eye wash stations', 'PPE'],
    residualRating: 'Medium',
  },
  {
    id: '15',
    title: 'Ladder failure',
    description: 'Structural failure of ladder during use',
    category: 'Working at Height',
    owner: 'Nancy Anderson',
    inherentLikelihood: 2,
    inherentSeverity: 4,
    residualLikelihood: 1,
    residualSeverity: 4,
    controls: ['Regular inspection', 'Proper training', 'Certification'],
    residualRating: 'High',
  },
];

const categories = [
  'Fire',
  'Chemical',
  'Manual Handling',
  'Electrical',
  'Working at Height',
  'Machinery',
];

const likelihoodLevels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const severityLevels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

const getRiskColor = (likelihood: number, severity: number): string => {
  const score = likelihood * severity;
  if (score <= 3) return 'bg-green-100 border-green-300';
  if (score <= 6) return 'bg-yellow-100 border-yellow-300';
  if (score <= 12) return 'bg-orange-100 border-orange-300';
  if (score <= 20) return 'bg-red-200 border-red-400';
  return 'bg-red-900 border-red-900';
};

const getRiskLevel = (likelihood: number, severity: number): string => {
  const score = likelihood * severity;
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  if (score <= 12) return 'High';
  if (score <= 20) return 'Very High';
  return 'Extreme';
};

const getRiskLevelBgColor = (level: string): string => {
  switch (level) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Very High':
      return 'bg-red-200 text-red-800';
    case 'Extreme':
      return 'bg-red-900 text-red-100';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const getCellDotColor = (likelihood: number, severity: number, isResidual: boolean): string => {
  const score = likelihood * severity;
  if (score <= 3)
    return isResidual ? 'border-green-500 bg-green-400' : 'border-green-600 bg-green-300';
  if (score <= 6)
    return isResidual ? 'border-yellow-500 bg-yellow-400' : 'border-yellow-600 bg-yellow-300';
  if (score <= 12)
    return isResidual ? 'border-orange-500 bg-orange-400' : 'border-orange-600 bg-orange-300';
  if (score <= 20) return isResidual ? 'border-red-500 bg-red-400' : 'border-red-700 bg-red-500';
  return isResidual ? 'border-red-600 bg-red-700' : 'border-red-900 bg-red-800';
};

export default function RiskMatrixClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; severity: number } | null>(
    null
  );
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showInherent, setShowInherent] = useState(true);
  const [showResidual, setShowResidual] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const filteredRisks = useMemo(() => {
    if (!selectedCategory) return mockRisks;
    return mockRisks.filter((risk) => risk.category === selectedCategory);
  }, [selectedCategory]);

  const cellRisks = useMemo(() => {
    if (!selectedCell) return [];
    return filteredRisks.filter((risk) => {
      const inherentMatch =
        showInherent &&
        risk.inherentLikelihood === selectedCell.likelihood &&
        risk.inherentSeverity === selectedCell.severity;
      const residualMatch =
        showResidual &&
        risk.residualLikelihood === selectedCell.likelihood &&
        risk.residualSeverity === selectedCell.severity;
      return inherentMatch || residualMatch;
    });
  }, [selectedCell, showInherent, showResidual, filteredRisks]);

  const riskLevelCounts = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, 'Very High': 0, Extreme: 0 };
    mockRisks.forEach((risk) => {
      const level = getRiskLevel(risk.residualLikelihood, risk.residualSeverity);
      counts[level as keyof typeof counts]++;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
            Risk Matrix
          </h1>
          <p className="text-slate-600">
            5x5 risk assessment matrix with inherent and residual risk positioning
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Risks */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border-l-4 border-slate-400">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Risks</p>
            <p className="text-3xl font-bold text-slate-900">{mockRisks.length}</p>
          </div>

          {/* Low */}
          <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-green-700 mb-1">Low</p>
            <p className="text-3xl font-bold text-green-900">{riskLevelCounts.Low}</p>
          </div>

          {/* Medium */}
          <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-yellow-700 mb-1">Medium</p>
            <p className="text-3xl font-bold text-yellow-900">{riskLevelCounts.Medium}</p>
          </div>

          {/* High */}
          <div className="bg-orange-50 rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-orange-700 mb-1">High</p>
            <p className="text-3xl font-bold text-orange-900">{riskLevelCounts.High}</p>
          </div>

          {/* Very High + Extreme */}
          <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-600">
            <p className="text-sm font-medium text-red-700 mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-900">
              {riskLevelCounts['Very High'] + riskLevelCounts.Extreme}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Risk Matrix */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Risk Assessment Matrix</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInherent(!showInherent)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      showInherent ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Inherent
                  </button>
                  <button
                    onClick={() => setShowResidual(!showResidual)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      showResidual ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Residual
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setSelectedCell(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Matrix Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-24 h-24 border border-slate-300 bg-slate-50 p-0 text-xs font-bold text-center">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div>Likelihood</div>
                        <div className="text-slate-500">→</div>
                      </div>
                    </th>
                    {[1, 2, 3, 4, 5].map((likelihood) => (
                      <th
                        key={likelihood}
                        className="h-24 w-24 border border-slate-300 bg-slate-100 p-1 text-xs font-semibold text-center"
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-slate-700">{likelihoodLevels[likelihood - 1]}</div>
                          <div className="text-xs text-slate-500">({likelihood})</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((severity) => (
                    <tr key={severity}>
                      <td className="w-24 border border-slate-300 bg-slate-100 p-1 font-semibold text-xs">
                        <div className="flex flex-col items-center justify-center h-24">
                          <div className="text-center text-slate-700">
                            {severityLevels[severity - 1]}
                          </div>
                          <div className="text-xs text-slate-500">({severity})</div>
                        </div>
                      </td>
                      {[1, 2, 3, 4, 5].map((likelihood) => {
                        const cellRiskCount = filteredRisks.filter((risk) => {
                          const inherentMatch =
                            showInherent &&
                            risk.inherentLikelihood === likelihood &&
                            risk.inherentSeverity === severity;
                          const residualMatch =
                            showResidual &&
                            risk.residualLikelihood === likelihood &&
                            risk.residualSeverity === severity;
                          return inherentMatch || residualMatch;
                        }).length;

                        const isSelected =
                          selectedCell?.likelihood === likelihood &&
                          selectedCell?.severity === severity;

                        return (
                          <td
                            key={`${likelihood}-${severity}`}
                            onClick={() => setSelectedCell({ likelihood, severity })}
                            className={`h-24 w-24 border border-slate-300 p-2 cursor-pointer hover:shadow-inset transition-all ${getRiskColor(
                              likelihood,
                              severity
                            )} ${isSelected ? 'ring-2 ring-orange-600 ring-inset' : ''}`}
                          >
                            <div className="flex flex-col items-center justify-center h-full relative">
                              {cellRiskCount > 0 && (
                                <div
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm border-2 ${getCellDotColor(
                                    likelihood,
                                    severity,
                                    false
                                  )}`}
                                >
                                  {cellRiskCount}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-300 border border-green-600"></div>
                <span className="text-slate-700">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-300 border border-yellow-600"></div>
                <span className="text-slate-700">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-300 border border-orange-600"></div>
                <span className="text-slate-700">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 border border-red-700"></div>
                <span className="text-slate-700">Very High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-800 border border-red-900"></div>
                <span className="text-slate-100">Extreme</span>
              </div>
            </div>
          </div>

          {/* Side Panel - Selected Cell or Risk Details */}
          <div className="lg:col-span-1">
            {selectedRisk ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 sticky top-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 pr-2">{selectedRisk.title}</h3>
                  <button
                    onClick={() => setSelectedRisk(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mb-4">{selectedRisk.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase">Category</p>
                    <p className="text-sm text-slate-900">{selectedRisk.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase">Owner</p>
                    <p className="text-sm text-slate-900">{selectedRisk.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase">
                      Residual Rating
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getRiskLevelBgColor(selectedRisk.residualRating)}`}
                    >
                      {selectedRisk.residualRating}
                    </span>
                  </div>
                </div>

                {/* Risk Position */}
                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs font-semibold text-orange-900 mb-2 uppercase">
                    Risk Position
                  </p>
                  <div className="text-xs text-orange-800">
                    <p>
                      Inherent: {likelihoodLevels[selectedRisk.inherentLikelihood - 1]} ×{' '}
                      {severityLevels[selectedRisk.inherentSeverity - 1]}
                    </p>
                    <p>
                      Residual: {likelihoodLevels[selectedRisk.residualLikelihood - 1]} ×{' '}
                      {severityLevels[selectedRisk.residualSeverity - 1]}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">
                    Controls in Place
                  </p>
                  <ul className="space-y-1">
                    {selectedRisk.controls.map((control, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <Shield className="w-3 h-3 text-emerald-600 mt-1 flex-shrink-0" />
                        <span>{control}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : selectedCell ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 sticky top-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {likelihoodLevels[selectedCell.likelihood - 1]} ×{' '}
                    {severityLevels[selectedCell.severity - 1]}
                  </h3>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className={`p-3 rounded-lg mb-4 ${getRiskColor(selectedCell.likelihood, selectedCell.severity)}`}
                >
                  <p className="text-sm font-bold">
                    {getRiskLevel(selectedCell.likelihood, selectedCell.severity)} Risk
                  </p>
                </div>

                <p className="text-xs text-slate-600 mb-4">
                  {cellRisks.length} risk{cellRisks.length !== 1 ? 's' : ''} in this cell
                </p>

                <div className="space-y-2">
                  {cellRisks.map((risk) => (
                    <button
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-colors group"
                    >
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-700 transition-colors">
                        {risk.title}
                      </p>
                      <p className="text-xs text-slate-600 group-hover:text-orange-600 line-clamp-2">
                        {risk.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6 border-2 border-dashed border-orange-200 sticky top-8 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-semibold text-slate-900 mb-2">Select a Cell</p>
                <p className="text-xs text-slate-600">
                  Click on a cell in the matrix to view risks at that risk level
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
