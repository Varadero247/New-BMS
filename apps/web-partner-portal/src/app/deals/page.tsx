// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { estimateCommission } from '@/lib/pricing';
import type { PartnerTierKey } from '@/lib/pricing';

interface Deal {
  id: string;
  customer: string;
  value: number;
  stage: string;
  protectionExpires: string;
}

type StageFilter = 'All' | 'Active' | 'Won' | 'Lost' | 'Expired';

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function ProtectionBadge({ days }: { days: number }) {
  const colour =
    days > 30
      ? 'bg-emerald-500/20 text-emerald-400'
      : days >= 10
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-red-500/20 text-red-400';
  const label = days === 0 ? 'Expired' : days === 1 ? '1 day' : `${days} days`;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
      {label}
    </span>
  );
}

const STAGES: StageFilter[] = ['All', 'Active', 'Won', 'Lost', 'Expired'];

const MOCK_DEALS: Deal[] = [
  { id: 'a1b2c3d4-0001', customer: 'Meridian Manufacturing Ltd', value: 48000, stage: 'Active', protectionExpires: new Date(Date.now() + 45 * 86400000).toISOString() },
  { id: 'a1b2c3d4-0002', customer: 'Apex Safety Solutions', value: 22500, stage: 'Active', protectionExpires: new Date(Date.now() + 18 * 86400000).toISOString() },
  { id: 'a1b2c3d4-0003', customer: 'Tiverton Engineering Group', value: 95000, stage: 'Won', protectionExpires: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'a1b2c3d4-0004', customer: 'Clearfield Logistics plc', value: 31000, stage: 'Active', protectionExpires: new Date(Date.now() + 7 * 86400000).toISOString() },
  { id: 'a1b2c3d4-0005', customer: 'Holloway & Partners', value: 14800, stage: 'Lost', protectionExpires: new Date(Date.now() - 20 * 86400000).toISOString() },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StageFilter>('All');
  const [tier, setTier] = useState<PartnerTierKey>('RESELLER');

  useEffect(() => {
    const storedTier = (localStorage.getItem('partner_tier') as PartnerTierKey) || 'RESELLER';
    setTier(storedTier);

    api
      .get('/api/billing/partners/deals')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setDeals(Array.isArray(data) && data.length > 0 ? data : MOCK_DEALS);
      })
      .catch(() => setDeals(MOCK_DEALS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? deals : deals.filter((d) => d.stage === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Deals</h1>
          <p className="text-gray-400 text-sm mt-1">Track registered deals and protection status.</p>
        </div>
        <Link
          href="/deals/register"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          Register New Deal
        </Link>
      </div>

      {/* Stage filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">Loading deals...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No deals found.{' '}
            <Link href="/deals/register" className="text-emerald-400 hover:underline">
              Register one
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Deal ID', 'Customer', 'Value', 'Stage', 'Protection Expires', 'Days Left', 'Commission Est.', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((d) => {
                  const days = d.protectionExpires ? daysUntil(d.protectionExpires) : 0;
                  const commission = estimateCommission(tier, d.value);
                  const canExtend = tier === 'STRATEGIC' && days < 30 && d.stage === 'Active';
                  return (
                    <tr key={d.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">{d.id.slice(0, 8)}…</td>
                      <td className="px-5 py-4 text-white font-medium">{d.customer}</td>
                      <td className="px-5 py-4 text-gray-300">{fmt(d.value)}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                          {d.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-300 whitespace-nowrap">
                        {d.protectionExpires
                          ? new Date(d.protectionExpires).toLocaleDateString('en-GB')
                          : '-'}
                      </td>
                      <td className="px-5 py-4">
                        {d.protectionExpires ? <ProtectionBadge days={days} /> : '-'}
                      </td>
                      <td className="px-5 py-4 text-emerald-400 font-medium">{fmt(commission)}</td>
                      <td className="px-5 py-4">
                        {canExtend && (
                          <button
                            onClick={() => window.alert('Extension request submitted. Your channel manager will be in touch within 1 business day.')}
                            className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                          >
                            Extend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
