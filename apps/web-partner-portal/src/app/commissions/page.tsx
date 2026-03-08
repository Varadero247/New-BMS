// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface CommissionStatement {
  month: string;
  deals: number;
  commission: number;
  status: 'Pending' | 'Paid' | 'Processing';
  invoiceRef?: string;
}

interface CommissionSummary {
  ytd: number;
  pending: number;
  available: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-emerald-500/20 text-emerald-400',
  Processing: 'bg-blue-500/20 text-blue-400',
  Pending: 'bg-amber-500/20 text-amber-400',
};

export default function CommissionsPage() {
  const [summary, setSummary] = useState<CommissionSummary>({ ytd: 0, pending: 0, available: 0 });
  const [statements, setStatements] = useState<CommissionStatement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/billing/partners/commissions')
      .then((res) => {
        const data = res.data?.data || res.data || {};
        setSummary({
          ytd: data.ytd || 0,
          pending: data.pending || 0,
          available: data.available || 0,
        });
        setStatements(Array.isArray(data.statements) ? data.statements : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = [
    { label: 'Total Earned (YTD)', value: fmt(summary.ytd), colour: 'text-emerald-400' },
    { label: 'Pending Payment', value: fmt(summary.pending), colour: 'text-amber-400' },
    { label: 'Available to Request', value: fmt(summary.available), colour: 'text-white' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Commissions</h1>
          <p className="text-gray-400 text-sm mt-1">Track your revenue share and commission payments.</p>
        </div>
        <button
          onClick={() => window.alert('CSV export coming soon')}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
        >
          Download CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.colour}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Statement table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Commission Statement</h2>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">Loading...</div>
        ) : statements.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No commission data available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Month', 'Deals', 'Commission', 'Status', 'Invoice'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {statements.map((s) => (
                  <tr key={s.month} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{s.month}</td>
                    <td className="px-6 py-4 text-gray-300">{s.deals}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{fmt(s.commission)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status] || 'bg-gray-700 text-gray-300'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.invoiceRef ? (
                        <button
                          onClick={() => window.alert(`Invoice ${s.invoiceRef} — contact your channel manager for a copy.`)}
                          className="text-blue-400 hover:text-blue-300 text-xs underline transition-colors"
                        >
                          {s.invoiceRef}
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
