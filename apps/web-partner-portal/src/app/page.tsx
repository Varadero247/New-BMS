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
  commissionEst: number;
}

interface KPIs {
  activeDeals: number;
  commissionsEarnedMTD: number;
  commissionPipeline: number;
  nfrSeatsUsed: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function ProtectionBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  const colour = days > 30 ? 'bg-emerald-500/20 text-emerald-400' : days >= 10 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
      {days === 0 ? 'Expired' : `${days}d`}
    </span>
  );
}

export default function DashboardPage() {
  const [name, setName] = useState('Partner');
  const [tier, setTier] = useState<PartnerTierKey>('RESELLER');
  const [kpis, setKpis] = useState<KPIs>({ activeDeals: 0, commissionsEarnedMTD: 0, commissionPipeline: 0, nfrSeatsUsed: 0 });
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const storedName = localStorage.getItem('partner_name') || 'Partner';
    const storedTier = (localStorage.getItem('partner_tier') as PartnerTierKey) || 'RESELLER';
    setName(storedName);
    setTier(storedTier);

    api.get('/api/billing/partners/deals')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setDeals(Array.isArray(data) ? data : []);
        const activeDeals = Array.isArray(data) ? data.filter((d: Deal) => d.stage === 'Active').length : 0;
        const pipeline = Array.isArray(data)
          ? data.filter((d: Deal) => d.stage === 'Active').reduce((sum: number, d: Deal) => sum + estimateCommission(storedTier, d.value), 0)
          : 0;
        setKpis((prev) => ({ ...prev, activeDeals, commissionPipeline: pipeline }));
      })
      .catch(() => {});

    api.get('/api/billing/partners/commissions')
      .then((res) => {
        const data = res.data?.data || res.data || {};
        setKpis((prev) => ({ ...prev, commissionsEarnedMTD: data.mtd || 0 }));
      })
      .catch(() => {});

    api.get('/api/billing/partners/nfr')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const used = Array.isArray(data) ? data.reduce((s: number, l: { seats: number }) => s + (l.seats || 0), 0) : 0;
        setKpis((prev) => ({ ...prev, nfrSeatsUsed: used }));
      })
      .catch(() => {});
  }, []);

  const kpiCards = [
    { label: 'Active Deals', value: String(kpis.activeDeals), colour: 'text-white' },
    { label: 'Commissions Earned (MTD)', value: fmt(kpis.commissionsEarnedMTD), colour: 'text-emerald-400' },
    { label: 'Commission Pipeline', value: fmt(kpis.commissionPipeline), colour: 'text-blue-400' },
    { label: 'NFR Seats Used', value: String(kpis.nfrSeatsUsed), colour: 'text-white' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {name}</h1>
        <p className="text-gray-400 mt-1 text-sm">Here is your partner activity overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.colour}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/deals/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
          Register New Deal
        </Link>
        <Link href="/commissions" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors">
          View Commission Statement
        </Link>
        <Link href="/nfr" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors">
          Request NFR
        </Link>
      </div>

      {/* Recent Deals */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Deals</h2>
          <Link href="/deals" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View all</Link>
        </div>
        {deals.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No deals yet. <Link href="/deals/register" className="text-emerald-400 hover:underline">Register your first deal</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Customer', 'Value', 'Stage', 'Protection Expires', 'Commission Est.'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {deals.slice(0, 5).map((d) => (
                  <tr key={d.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{d.customer}</td>
                    <td className="px-6 py-4 text-gray-300">{fmt(d.value)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">{d.stage}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="mr-2">{d.protectionExpires ? new Date(d.protectionExpires).toLocaleDateString('en-GB') : '-'}</span>
                      {d.protectionExpires && <ProtectionBadge dateStr={d.protectionExpires} />}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{fmt(estimateCommission(tier, d.value))}</td>
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
