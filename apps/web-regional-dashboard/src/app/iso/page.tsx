// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import { useState } from 'react';
import { fetchISOComparison, type ISOComparisonData } from '@/lib/api';

const POPULAR_STANDARDS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001',
  'ISO 37001', 'ISO 50001', 'ISO 22000', 'ISO 13485', 'ISO 42001',
];

const statusColor: Record<string, string> = {
  ADOPTED: 'bg-green-100 text-green-700',
  ADOPTED_WITH_MODIFICATIONS: 'bg-blue-100 text-blue-700',
  EQUIVALENT_STANDARD: 'bg-purple-100 text-purple-700',
  PARTIALLY_ADOPTED: 'bg-yellow-100 text-yellow-700',
  UNDER_CONSIDERATION: 'bg-orange-100 text-orange-700',
  NOT_ADOPTED: 'bg-gray-100 text-gray-400',
};

export default function ISOPage() {
  const [query, setQuery] = useState('ISO 9001');
  const [input, setInput] = useState('ISO 9001');
  const [data, setData] = useState<ISOComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (standard: string) => {
    setLoading(true);
    setError('');
    try {
      const d = await fetchISOComparison(standard);
      setData(d);
      setQuery(standard);
    } catch {
      setError('Failed to load ISO comparison data');
    } finally {
      setLoading(false);
    }
  };

  const adopted = data?.comparison.filter((c) => c.adoptionStatus !== 'NOT_ADOPTED') ?? [];
  const notAdopted = data?.comparison.filter((c) => c.adoptionStatus === 'NOT_ADOPTED') ?? [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ISO Standards Adoption</h1>
        <p className="text-gray-500 text-sm mt-1">Compare ISO standard adoption across all 20 APAC countries</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="e.g. ISO 9001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search(input)}
        />
        <button
          onClick={() => search(input)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Compare
        </button>
      </div>

      {/* Quick-select chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {POPULAR_STANDARDS.map((s) => (
          <button
            key={s}
            onClick={() => { setInput(s); search(s); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${query === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {loading && <div className="text-gray-500 text-sm">Loading…</div>}

      {data && !loading && (
        <>
          {/* Stats */}
          <div className="flex gap-4 mb-5">
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-green-700">{data.adoptedCount}</div>
              <div className="text-xs text-green-600">countries adopted {data.isoStandard}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-gray-500">{data.totalCountries - data.adoptedCount}</div>
              <div className="text-xs text-gray-500">not adopted</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-indigo-700">{Math.round((data.adoptedCount / data.totalCountries) * 100)}%</div>
              <div className="text-xs text-indigo-600">adoption rate</div>
            </div>
          </div>

          {/* Adopted */}
          {adopted.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="px-5 py-3 bg-green-50 border-b border-gray-200">
                <h2 className="font-semibold text-green-800 text-sm">Adopted ({adopted.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {adopted.map((c) => (
                  <div key={c.countryCode} className="px-5 py-3 flex items-start gap-4">
                    <div className="w-32 shrink-0">
                      <div className="font-medium text-sm">{c.countryName}</div>
                      <div className="text-xs text-gray-400">{c.countryCode}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[c.adoptionStatus] ?? statusColor.NOT_ADOPTED}`}>
                      {c.adoptionStatus.replace(/_/g, ' ')}
                    </span>
                    {c.localStandard && (
                      <span className="text-xs text-gray-500 shrink-0">Local: {c.localStandard}</span>
                    )}
                    {c.certificationBodies.length > 0 && (
                      <div className="text-xs text-gray-400 flex-1 truncate">
                        {c.certificationBodies.slice(0, 3).join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not adopted */}
          {notAdopted.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-600 text-sm">Not Adopted ({notAdopted.length})</h2>
              </div>
              <div className="px-5 py-3 flex flex-wrap gap-2">
                {notAdopted.map((c) => (
                  <span key={c.countryCode} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    {c.countryName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
