// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import { useEffect, useState } from 'react';
import { fetchTaxReport, type TaxReportData, type RankedRow } from '@/lib/api';

type Tab = 'corpTax' | 'gst' | 'withholding' | 'easeOfBusiness';

const tabs: { key: Tab; label: string; field: keyof RankedRow; format: (v: number) => string }[] = [
  { key: 'corpTax', label: 'Corporate Tax', field: 'corporateTaxRate', format: (v) => `${(v * 100).toFixed(2)}%` },
  { key: 'gst', label: 'GST / VAT', field: 'gstVatRate', format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: 'withholding', label: 'Withholding (Div)', field: 'withholdingDividends', format: (v) => `${(v * 100).toFixed(0)}%` },
  { key: 'easeOfBusiness', label: 'Ease of Business', field: 'easeOfDoingBusinessRank', format: (v) => `#${v}` },
];

const barColor = ['bg-emerald-500', 'bg-green-400', 'bg-lime-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400'];

export default function TaxesPage() {
  const [data, setData] = useState<TaxReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('corpTax');

  useEffect(() => {
    fetchTaxReport()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="p-8 text-gray-500">Loading tax data…</div>;

  const tabMap: Record<Tab, RankedRow[]> = {
    corpTax: data.rankedByCorpTax,
    gst: data.rankedByGst,
    withholding: data.rankedByWithholdingDividends,
    easeOfBusiness: data.rankedByEaseOfBusiness,
  };
  const currentTab = tabs.find((t) => t.key === tab)!;
  const rows = tabMap[tab];
  const values = rows.map((r) => (r[currentTab.field] as number) ?? 0).filter((v) => v > 0);
  const max = Math.max(...values, 1);

  const { summary } = data;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax League Table</h1>
        <p className="text-gray-500 text-sm mt-1">All 20 APAC markets ranked by tax dimensions</p>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Lowest Corp Tax', name: summary.lowestCorpTax.countryName, value: `${(summary.lowestCorpTax.corporateTaxRate * 100).toFixed(1)}%` },
          { label: 'Highest Corp Tax', name: summary.highestCorpTax.countryName, value: `${(summary.highestCorpTax.corporateTaxRate * 100).toFixed(1)}%` },
          { label: 'Lowest GST/VAT', name: summary.lowestGst.countryName, value: `${(summary.lowestGst.gstVatRate * 100).toFixed(1)}%` },
          { label: 'Highest GST/VAT', name: summary.highestGst.countryName, value: `${(summary.highestGst.gstVatRate * 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">{s.label}</div>
            <div className="text-xl font-bold text-indigo-700">{s.value}</div>
            <div className="text-xs text-gray-400">{s.name}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bar chart table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2.5">
        {rows.map((r, i) => {
          const v = (r[currentTab.field] as number) ?? 0;
          const pct = max > 0 ? (v / max) * 100 : 0;
          const color = barColor[Math.min(i, barColor.length - 1)];
          return (
            <div key={r.countryCode} className="flex items-center gap-3">
              <span className="w-5 text-xs text-gray-400 text-right shrink-0">#{r.rank}</span>
              <span className="w-28 text-sm font-medium truncate shrink-0">{r.countryName}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-5 rounded-full ${color} transition-all`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-mono text-gray-700 shrink-0">
                {v ? currentTab.format(v) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
