'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Shield, X, ChevronRight } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  likelihood: number;
  impact: number;
  residualLikelihood: number;
  residualImpact: number;
  controls: string[];
  treatmentPlan: string;
}

const risks: Risk[] = [
  {
    id: 'R-001',
    title: 'Ransomware attack on production systems',
    description: 'Threat actors deploy ransomware via phishing or vulnerability exploitation',
    category: 'Cyber',
    owner: 'SOC Lead',
    likelihood: 4,
    impact: 5,
    residualLikelihood: 2,
    residualImpact: 4,
    controls: ['EDR', 'Email filtering', 'Backup strategy', 'Incident response plan'],
    treatmentPlan: 'Implement immutable backups, quarterly DR drills',
  },
  {
    id: 'R-002',
    title: 'Data breach — customer PII',
    description: 'Unauthorised access or exfiltration of customer personal data',
    category: 'Data',
    owner: 'DPO',
    likelihood: 3,
    impact: 5,
    residualLikelihood: 2,
    residualImpact: 4,
    controls: ['Access controls', 'DLP', 'Encryption at rest', 'Audit logging'],
    treatmentPlan: 'Deploy advanced DLP, data classification rollout Q2',
  },
  {
    id: 'R-003',
    title: 'Third-party supply chain compromise',
    description: 'Compromise of a critical vendor or software dependency',
    category: 'Supply Chain',
    owner: 'CISO',
    likelihood: 3,
    impact: 4,
    residualLikelihood: 2,
    residualImpact: 3,
    controls: ['Vendor risk assessments', 'SCA scanning', 'SBOM tracking'],
    treatmentPlan: 'Expand vendor assessment coverage to Tier 2 suppliers',
  },
  {
    id: 'R-004',
    title: 'Insider threat — data exfiltration',
    description: 'Malicious or negligent employee leaking sensitive information',
    category: 'Insider',
    owner: 'HR Manager',
    likelihood: 2,
    impact: 4,
    residualLikelihood: 1,
    residualImpact: 3,
    controls: ['DLP', 'USB restrictions', 'Privileged access monitoring'],
    treatmentPlan: 'Implement UEBA, annual insider threat training',
  },
  {
    id: 'R-005',
    title: 'Cloud misconfiguration',
    description: 'Publicly exposed storage buckets, overly permissive IAM policies',
    category: 'Cloud',
    owner: 'Cloud Architect',
    likelihood: 4,
    impact: 4,
    residualLikelihood: 2,
    residualImpact: 3,
    controls: ['CSPM tool', 'IaC scanning', 'Least privilege reviews'],
    treatmentPlan: 'Monthly CSPM reviews, automated remediation',
  },
  {
    id: 'R-006',
    title: 'Phishing — credential compromise',
    description: 'Social engineering attacks targeting employee credentials',
    category: 'Cyber',
    owner: 'SOC Lead',
    likelihood: 5,
    impact: 3,
    residualLikelihood: 3,
    residualImpact: 2,
    controls: ['MFA', 'Security awareness training', 'Email filtering', 'Phishing simulations'],
    treatmentPlan: 'Increase phishing simulation frequency, conditional access policies',
  },
  {
    id: 'R-007',
    title: 'DDoS attack on public services',
    description: 'Volumetric or application-layer denial of service',
    category: 'Cyber',
    owner: 'Infra Lead',
    likelihood: 3,
    impact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    controls: ['CDN/WAF', 'Rate limiting', 'DDoS mitigation service'],
    treatmentPlan: 'Annual DDoS readiness test',
  },
  {
    id: 'R-008',
    title: 'Loss of key personnel',
    description: 'Critical security staff leaving without adequate knowledge transfer',
    category: 'People',
    owner: 'CISO',
    likelihood: 3,
    impact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    controls: ['Cross-training', 'Documentation', 'Succession planning'],
    treatmentPlan: 'Update succession plan, ensure 2-deep coverage',
  },
  {
    id: 'R-009',
    title: 'Regulatory non-compliance — GDPR',
    description: 'Failure to meet GDPR obligations leading to fines or enforcement',
    category: 'Compliance',
    owner: 'DPO',
    likelihood: 2,
    impact: 5,
    residualLikelihood: 1,
    residualImpact: 4,
    controls: ['DPIA process', 'Data retention policy', 'Subject access request procedure'],
    treatmentPlan: 'Quarterly compliance reviews',
  },
  {
    id: 'R-010',
    title: 'Physical security breach',
    description: 'Unauthorised access to data centre or server room',
    category: 'Physical',
    owner: 'Facilities',
    likelihood: 2,
    impact: 4,
    residualLikelihood: 1,
    residualImpact: 3,
    controls: ['Biometric access', 'CCTV', '24/7 security guard'],
    treatmentPlan: 'Upgrade to man-trap entry system',
  },
  {
    id: 'R-011',
    title: 'API vulnerability exploitation',
    description: 'Exploitation of insecure APIs exposing backend systems',
    category: 'Cyber',
    owner: 'Dev Lead',
    likelihood: 4,
    impact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    controls: ['API gateway', 'Rate limiting', 'OWASP testing', 'Input validation'],
    treatmentPlan: 'Implement API security testing in CI/CD',
  },
  {
    id: 'R-012',
    title: 'Backup failure',
    description: 'Backup jobs fail silently, no recovery possible in disaster',
    category: 'Operations',
    owner: 'Infra Lead',
    likelihood: 2,
    impact: 5,
    residualLikelihood: 1,
    residualImpact: 3,
    controls: ['Backup monitoring', 'Quarterly restore tests', 'Geo-redundant storage'],
    treatmentPlan: 'Automated backup verification, monthly restore test',
  },
];

const likelihoodLabels = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const impactLabels = ['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

function getRiskColor(score: number): string {
  if (score >= 20) return 'bg-red-600';
  if (score >= 15) return 'bg-red-500';
  if (score >= 10) return 'bg-orange-500';
  if (score >= 5) return 'bg-amber-400';
  return 'bg-green-500';
}

function getRiskLevel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 15) return 'High';
  if (score >= 10) return 'Medium';
  if (score >= 5) return 'Low';
  return 'Very Low';
}

type ViewMode = 'inherent' | 'residual';

export default function HeatMapClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('inherent');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const getRisksByCell = (likelihood: number, impact: number) => {
    return risks.filter((r) =>
      viewMode === 'inherent'
        ? r.likelihood === likelihood && r.impact === impact
        : r.residualLikelihood === likelihood && r.residualImpact === impact
    );
  };

  const criticalCount = risks.filter((r) => {
    const score =
      viewMode === 'inherent' ? r.likelihood * r.impact : r.residualLikelihood * r.residualImpact;
    return score >= 15;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk Heat Map</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Information security risk matrix — {risks.length} risks mapped
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('inherent')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'inherent' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            Inherent Risk
          </button>
          <button
            onClick={() => setViewMode('residual')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'residual' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            Residual Risk
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Risks
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{risks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            High / Critical
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Categories
          </p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">
            {new Set(risks.map((r) => r.category)).size}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            View Mode
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
            {viewMode === 'inherent' ? 'Inherent' : 'Residual'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {viewMode === 'inherent' ? 'Before controls' : 'After controls'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            5x5 Risk Matrix
          </h2>
          <div className="flex">
            {/* Y-axis label */}
            <div className="flex flex-col items-center justify-center mr-2">
              <span
                className="text-xs text-gray-500 dark:text-gray-400 font-medium writing-mode-vertical"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Likelihood →
              </span>
            </div>
            <div className="flex-1">
              {/* Grid */}
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <div key={likelihood} className="flex items-stretch">
                  <div className="w-20 flex items-center justify-end pr-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {likelihoodLabels[likelihood]}
                    </span>
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = getRisksByCell(likelihood, impact);
                    const score = likelihood * impact;
                    const isSelected = selectedCell?.l === likelihood && selectedCell?.i === impact;
                    return (
                      <button
                        key={impact}
                        onClick={() => {
                          setSelectedCell(
                            cellRisks.length > 0 ? { l: likelihood, i: impact } : null
                          );
                          setSelectedRisk(null);
                        }}
                        className={`flex-1 aspect-square m-0.5 rounded-md flex items-center justify-center text-white text-xs font-bold transition-all ${getRiskColor(score)} ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1' : ''} ${cellRisks.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-60'}`}
                      >
                        {cellRisks.length > 0 && (
                          <span className="bg-white/30 rounded-full w-6 h-6 flex items-center justify-center">
                            {cellRisks.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {/* X-axis labels */}
              <div className="flex mt-1">
                <div className="w-20" />
                {[1, 2, 3, 4, 5].map((impact) => (
                  <div key={impact} className="flex-1 text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {impactLabels[impact]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Impact →
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {[
              { label: 'Critical (20-25)', color: 'bg-red-600' },
              { label: 'High (15-19)', color: 'bg-red-500' },
              { label: 'Medium (10-14)', color: 'bg-orange-500' },
              { label: 'Low (5-9)', color: 'bg-amber-400' },
              { label: 'Very Low (1-4)', color: 'bg-green-500' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${l.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Details Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 overflow-y-auto max-h-[600px]">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {selectedCell
              ? `Risks at L${selectedCell.l} × I${selectedCell.i}`
              : selectedRisk
                ? 'Risk Details'
                : 'Select a cell'}
          </h2>
          {selectedCell && (
            <div className="space-y-2">
              {getRisksByCell(selectedCell.l, selectedCell.i).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRisk(r);
                    setSelectedCell(null);
                  }}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-600">{r.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskColor(r.likelihood * r.impact)}`}
                    >
                      {getRiskLevel(r.likelihood * r.impact)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {r.category} · {r.owner}
                  </p>
                </button>
              ))}
            </div>
          )}
          {selectedRisk && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-xs text-indigo-600 hover:underline"
              >
                ← Back
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-600">{selectedRisk.id}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">
                    {selectedRisk.category}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {selectedRisk.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedRisk.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium">Inherent</p>
                  <p className="text-lg font-bold text-red-700">
                    {selectedRisk.likelihood * selectedRisk.impact}
                  </p>
                  <p className="text-xs text-red-500">
                    L{selectedRisk.likelihood} × I{selectedRisk.impact}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Residual</p>
                  <p className="text-lg font-bold text-green-700">
                    {selectedRisk.residualLikelihood * selectedRisk.residualImpact}
                  </p>
                  <p className="text-xs text-green-500">
                    L{selectedRisk.residualLikelihood} × I{selectedRisk.residualImpact}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Controls ({selectedRisk.controls.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedRisk.controls.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Treatment Plan
                </p>
                <p className="text-sm text-gray-600">{selectedRisk.treatmentPlan}</p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Owner: {selectedRisk.owner}
              </div>
            </div>
          )}
          {!selectedCell && !selectedRisk && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click a cell on the heat map to view risks at that intersection.
            </p>
          )}
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">All Risks</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-20">
                ID
              </th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">
                Risk
              </th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                Category
              </th>
              <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-20">
                Inherent
              </th>
              <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-20">
                Residual
              </th>
              <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                Level
              </th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {risks
              .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
              .map((r) => {
                const inherent = r.likelihood * r.impact;
                const residual = r.residualLikelihood * r.residualImpact;
                return (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setSelectedRisk(r);
                      setSelectedCell(null);
                    }}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-indigo-600">{r.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                      {r.title}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {r.category}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block w-8 h-6 rounded text-xs font-bold text-white leading-6 ${getRiskColor(inherent)}`}
                      >
                        {inherent}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block w-8 h-6 rounded text-xs font-bold text-white leading-6 ${getRiskColor(residual)}`}
                      >
                        {residual}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskColor(viewMode === 'inherent' ? inherent : residual)}`}
                      >
                        {getRiskLevel(viewMode === 'inherent' ? inherent : residual)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600">{r.owner}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
