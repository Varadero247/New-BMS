// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import { useEffect, useState } from 'react';
import { fetchComplianceReport, type ComplianceRow } from '@/lib/api';

const DIMENSIONS = [
  { key: 'gdprEquivalent', label: 'GDPR Equiv.' },
  { key: 'antiCorruptionLaw', label: 'Anti-Corruption' },
  { key: 'amlRegulations', label: 'AML' },
  { key: 'modernSlaveryAct', label: 'Modern Slavery' },
  { key: 'whistleblowerProtection', label: 'Whistleblower' },
  { key: 'esgRequirements', label: 'ESG' },
  { key: 'dueDiligenceRequirements', label: 'Due Diligence' },
] as const;

type DimKey = typeof DIMENSIONS[number]['key'];

function Cell({ value }: { value: boolean | string | null }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-300">—</span>;
  }
  if (typeof value === 'boolean') {
    return value
      ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold">✓</span>
      : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">✗</span>;
  }
  return <span className="text-xs text-gray-600 max-w-[180px] block truncate" title={value}>{value}</span>;
}

export default function CompliancePage() {
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlight, setHighlight] = useState<DimKey | null>(null);

  useEffect(() => {
    fetchComplianceReport()
      .then(setRows)
      .catch(() => setError('Failed to load compliance data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading compliance matrix…</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const trueCount = (key: DimKey) => rows.filter((r) => (r as unknown as Record<string, unknown>)[key] === true).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Matrix</h1>
        <p className="text-gray-500 text-sm mt-1">Regulatory compliance dimensions across all 20 APAC markets</p>
      </div>

      {/* Dimension coverage summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DIMENSIONS.map((d) => {
          const count = trueCount(d.key);
          const active = highlight === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setHighlight(active ? null : d.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              <span>{d.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}/20</span>
            </button>
          );
        })}
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 font-medium sticky left-0 bg-gray-50 z-10 min-w-[140px]">Country</th>
              <th className="px-4 py-2.5 font-medium">Authority</th>
              {DIMENSIONS.map((d) => (
                <th
                  key={d.key}
                  onClick={() => setHighlight(highlight === d.key ? null : d.key)}
                  className={`px-3 py-2.5 font-medium text-center cursor-pointer whitespace-nowrap transition-colors ${highlight === d.key ? 'text-indigo-700 bg-indigo-50' : 'hover:text-indigo-600'}`}
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.countryCode} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors">
                <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                  <span className="font-medium">{r.countryName}</span>
                  <span className="ml-2 text-xs text-gray-400">{r.countryCode}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px]">
                  <span className="block truncate" title={r.dataProtectionAuthority ?? ''}>
                    {r.dataProtectionAuthority ?? <span className="text-gray-300">—</span>}
                  </span>
                </td>
                {DIMENSIONS.map((d) => {
                  const val = (r as unknown as Record<string, unknown>)[d.key];
                  return (
                    <td
                      key={d.key}
                      className={`px-3 py-2.5 text-center ${highlight === d.key ? 'bg-indigo-50/40' : ''}`}
                    >
                      <Cell value={val as boolean | string | null} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200 text-xs font-medium text-gray-500">
              <td className="px-4 py-2 sticky left-0 bg-gray-50 z-10" colSpan={2}>Coverage</td>
              {DIMENSIONS.map((d) => {
                const count = trueCount(d.key);
                const pct = Math.round((count / rows.length) * 100);
                return (
                  <td key={d.key} className={`px-3 py-2 text-center ${highlight === d.key ? 'bg-indigo-50' : ''}`}>
                    <span className={`font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {pct}%
                    </span>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
