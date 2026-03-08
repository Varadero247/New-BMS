// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Calculator, Download } from 'lucide-react';

interface StackCalculatorSession {
  id: string;
  sessionToken: string;
  toolsCount: number;
  totalStackCost: number;
  nexaraSaving: number;
  converted: boolean;
  createdAt: string;
}

const MOCK_SESSIONS: StackCalculatorSession[] = [
  {
    id: '1',
    sessionToken: 'sc_nxr_8A2kQpLmZ9',
    toolsCount: 7,
    totalStackCost: 142000,
    nexaraSaving: 116000,
    converted: true,
    createdAt: '2026-03-01T09:14:22Z',
  },
  {
    id: '2',
    sessionToken: 'sc_nxr_3RwYtBvX4j',
    toolsCount: 5,
    totalStackCost: 98000,
    nexaraSaving: 74000,
    converted: false,
    createdAt: '2026-03-02T14:33:05Z',
  },
  {
    id: '3',
    sessionToken: 'sc_nxr_7MnKcFgH1e',
    toolsCount: 9,
    totalStackCost: 215000,
    nexaraSaving: 189000,
    converted: false,
    createdAt: '2026-03-03T11:02:48Z',
  },
  {
    id: '4',
    sessionToken: 'sc_nxr_2TqVsJdP6m',
    toolsCount: 4,
    totalStackCost: 72000,
    nexaraSaving: 46000,
    converted: true,
    createdAt: '2026-03-05T08:55:19Z',
  },
  {
    id: '5',
    sessionToken: 'sc_nxr_5XuOaCbW0r',
    toolsCount: 6,
    totalStackCost: 130000,
    nexaraSaving: 105000,
    converted: false,
    createdAt: '2026-03-07T16:20:33Z',
  },
];

function exportCsv(rows: StackCalculatorSession[]) {
  const headers = ['Session Token', 'Tools Count', 'Total Stack Cost (£)', 'Nexara Saving (£)', 'Converted', 'Created At'];
  const csvRows = rows.map((r) => [
    r.sessionToken,
    r.toolsCount,
    r.totalStackCost,
    r.nexaraSaving,
    r.converted ? 'Yes' : 'No',
    new Date(r.createdAt).toLocaleString('en-GB'),
  ]);
  const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stack-calculator-sessions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function StackCalculatorSessionsPage() {
  const [sessions] = useState<StackCalculatorSession[]>(MOCK_SESSIONS);

  const fmtGbp = (v: number) => `£${v.toLocaleString()}`;
  const conversionRate = Math.round((sessions.filter((s) => s.converted).length / sessions.length) * 100);

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#B8860B]/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#B8860B]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Stack Calculator Sessions</h1>
              <p className="text-gray-400 text-sm">Tracks prospects who used the ROI / stack replacement calculator</p>
            </div>
          </div>
          <button
            onClick={() => exportCsv(sessions)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Sessions', value: sessions.length, color: 'text-white' },
            { label: 'Converted', value: sessions.filter((s) => s.converted).length, color: 'text-green-400' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-[#B8860B]' },
            { label: 'Avg. Saving Shown', value: fmtGbp(Math.round(sessions.reduce((sum, s) => sum + s.nexaraSaving, 0) / sessions.length)), color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#112240] border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">Session Token</th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">Tools</th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">Total Stack Cost</th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">Nexara Saving</th>
                  <th className="text-center px-5 py-3 text-gray-400 font-medium">Converted</th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 font-mono text-xs text-gray-300">{session.sessionToken}</td>
                    <td className="px-5 py-3 text-right text-gray-200">{session.toolsCount}</td>
                    <td className="px-5 py-3 text-right text-gray-200">{fmtGbp(session.totalStackCost)}</td>
                    <td className="px-5 py-3 text-right text-green-400 font-semibold">{fmtGbp(session.nexaraSaving)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        session.converted
                          ? 'bg-green-900/30 text-green-400 border border-green-700'
                          : 'bg-gray-700/40 text-gray-400 border border-gray-600'
                      }`}>
                        {session.converted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(session.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
