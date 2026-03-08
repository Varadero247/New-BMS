// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import { useEffect, useState, useMemo } from 'react';
import { fetchComparison, type ComparisonRow } from '@/lib/api';

type SortKey = keyof Pick<ComparisonRow, 'countryName' | 'corporateTaxRate' | 'gstVatRate' | 'withholdingDividends' | 'isoStandardsCount' | 'easeOfDoingBusinessRank'>;

const REGIONS = ['All', 'ASEAN', 'ANZ', 'East Asia', 'South Asia'];

export default function CountriesPage() {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('All');
  const [sort, setSort] = useState<SortKey>('countryName');
  const [asc, setAsc] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchComparison()
      .then((d) => setRows(d.countries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = rows;
    if (region !== 'All') r = r.filter((c) => c.region === region);
    if (search) r = r.filter((c) => c.countryName.toLowerCase().includes(search.toLowerCase()) || c.countryCode.includes(search.toUpperCase()));
    return [...r].sort((a, b) => {
      const av = a[sort] ?? 999;
      const bv = b[sort] ?? 999;
      if (typeof av === 'string' && typeof bv === 'string') return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      return asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [rows, region, sort, asc, search]);

  const handleSort = (k: SortKey) => {
    if (sort === k) setAsc(!asc);
    else { setSort(k); setAsc(true); }
  };
  const sortIcon = (k: SortKey) => sort === k ? (asc ? ' ↑' : ' ↓') : '';

  if (loading) return <div className="p-8 text-gray-500">Loading country data…</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Country Explorer</h1>
        <p className="text-gray-500 text-sm mt-1">Compare all 20 APAC markets side by side</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Search country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${region === r ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} countries</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              {([
                ['countryName', 'Country'],
                ['corporateTaxRate', 'Corp Tax'],
                ['gstVatRate', 'GST/VAT'],
                ['withholdingDividends', 'WHT Div'],
                ['isoStandardsCount', 'ISO Stds'],
                ['easeOfDoingBusinessRank', 'EoDB Rank'],
              ] as [SortKey, string][]).map(([k, label]) => (
                <th
                  key={k}
                  onClick={() => handleSort(k)}
                  className="px-4 py-2.5 font-medium cursor-pointer hover:text-indigo-600 select-none whitespace-nowrap"
                >
                  {label}{sortIcon(k)}
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">Payroll Tax</th>
              <th className="px-4 py-2.5 font-medium">Incorporation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.countryCode} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                <td className="px-4 py-2.5">
                  <span className="font-medium">{c.countryName}</span>
                  <span className="ml-2 text-xs text-gray-400">{c.countryCode}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-indigo-700">{(c.corporateTaxRate * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 font-mono">{(c.gstVatRate * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 font-mono">{(c.withholdingDividends * 100).toFixed(0)}%</td>
                <td className="px-4 py-2.5 text-center">{c.isoStandardsCount}</td>
                <td className="px-4 py-2.5 text-center text-gray-600">{c.easeOfDoingBusinessRank ?? '—'}</td>
                <td className="px-4 py-2.5">
                  {c.hasPayrollTax
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c.payrollTaxName ?? 'Yes'} {c.payrollEmployeeRate ? `${(c.payrollEmployeeRate * 100).toFixed(0)}%+${(c.payrollEmployerRate! * 100).toFixed(0)}%` : ''}</span>
                    : <span className="text-xs text-gray-400">None</span>
                  }
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.incorporationTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
