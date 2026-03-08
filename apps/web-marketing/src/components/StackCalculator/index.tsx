// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

interface Tool {
  name: string;
  category: string;
  avgPricePerUser: number;
}

const DEFAULT_TOOLS: Tool[] = [
  { name: 'ISO 9001 QMS software', category: 'Quality', avgPricePerUser: 25 },
  { name: 'ISO 14001 EMS software', category: 'Environment', avgPricePerUser: 20 },
  { name: 'ISO 45001 H&S software', category: 'Health & Safety', avgPricePerUser: 22 },
  { name: 'ISO 27001 InfoSec software', category: 'Information Security', avgPricePerUser: 28 },
  { name: 'HR Management System', category: 'HR', avgPricePerUser: 18 },
  { name: 'Incident Management', category: 'Operations', avgPricePerUser: 15 },
  { name: 'Document Control', category: 'Operations', avgPricePerUser: 12 },
  { name: 'Audit Management', category: 'Compliance', avgPricePerUser: 15 },
  { name: 'Supplier Portal', category: 'Supply Chain', avgPricePerUser: 10 },
  { name: 'Training Management', category: 'HR', avgPricePerUser: 12 },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function StackCalculator() {
  const [userCount, setUserCount] = useState(25);
  const [enabled, setEnabled] = useState<boolean[]>(DEFAULT_TOOLS.map(() => true));

  function toggle(i: number) {
    setEnabled((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  const stackTotalPerUser = DEFAULT_TOOLS.reduce(
    (sum, tool, i) => sum + (enabled[i] ? tool.avgPricePerUser : 0),
    0,
  );

  const stackMonthly = stackTotalPerUser * userCount;
  const stackAnnual = stackMonthly * 12;

  const nexaraMonthly = PRICING.tiers.PROFESSIONAL.listPriceMonthly * userCount;
  const nexaraAnnual = nexaraMonthly * 12;

  const annualSaving = Math.max(0, stackAnnual - nexaraAnnual);
  const savingPct = stackAnnual > 0 ? Math.round((annualSaving / stackAnnual) * 100) : 0;

  const enabledCount = enabled.filter(Boolean).length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">Stack Cost Calculator</h3>
        <p className="text-gray-400 text-sm">
          Toggle the tools you currently pay for and drag the slider to match your team size.
          See exactly how much Nexara would save you.
        </p>
      </div>

      {/* User count slider */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Number of users</label>
          <span className="text-lg font-bold text-white">{userCount}</span>
        </div>
        <input
          type="range"
          min={5}
          max={500}
          step={5}
          value={userCount}
          onChange={(e) => setUserCount(Number(e.target.value))}
          className="w-full accent-[#1B3A6B] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>5 users</span>
          <span>500 users</span>
        </div>
      </div>

      {/* Tool toggles */}
      <div className="mb-7">
        <p className="text-sm text-gray-400 mb-3">
          {enabledCount} of {DEFAULT_TOOLS.length} tools selected &mdash; {PRICING.symbol}{stackTotalPerUser}/user/mo combined
        </p>
        <div className="space-y-2.5">
          {DEFAULT_TOOLS.map((tool, i) => (
            <label
              key={i}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition ${
                enabled[i]
                  ? 'border-[#1B3A6B]/60 bg-[#1B3A6B]/10'
                  : 'border-white/5 bg-white/3 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Toggle switch */}
                <div
                  className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
                    enabled[i] ? 'bg-[#1B3A6B]' : 'bg-white/10'
                  }`}
                  onClick={() => toggle(i)}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      enabled[i] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">{tool.name}</p>
                  <p className="text-xs text-gray-500">{tool.category}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-medium ${enabled[i] ? 'text-white' : 'text-gray-600'}`}>
                  {PRICING.symbol}{tool.avgPricePerUser}/user/mo
                </p>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={enabled[i]}
                onChange={() => toggle(i)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-white/10 bg-[#091628] p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current stack annual cost</p>
            <p className="text-2xl font-bold text-red-400">{fmt(stackAnnual)}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {PRICING.symbol}{stackTotalPerUser}/user/mo &times; {userCount} users
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Nexara Professional annual</p>
            <p className="text-2xl font-bold text-[#60A5FA]">{fmt(nexaraAnnual)}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {PRICING.symbol}{PRICING.tiers.PROFESSIONAL.listPriceMonthly}/user/mo &times; {userCount} users
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Annual saving</p>
            {annualSaving > 0 ? (
              <>
                <p className="text-2xl font-bold text-green-400">{fmt(annualSaving)}</p>
                <p className="text-xs text-green-600 mt-0.5">{savingPct}% reduction</p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-400">Add more tools</p>
            )}
          </div>
        </div>

        {annualSaving > 0 && (
          <div className="border-t border-white/5 pt-4 text-sm text-gray-400">
            Replacing {enabledCount} tool{enabledCount !== 1 ? 's' : ''} with Nexara saves{' '}
            <strong className="text-white">{fmt(annualSaving)}/year</strong> ({savingPct}%).
            Annual billing saves a further{' '}
            <strong className="text-white">{PRICING.tiers.PROFESSIONAL.annualDiscountPct}%</strong>.
          </div>
        )}
      </div>

      {annualSaving > 0 ? (
        <Link
          href="/lp/free-trial"
          className="block w-full text-center py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
        >
          Save {fmt(annualSaving)}/year &mdash; book a demo &rarr;
        </Link>
      ) : (
        <Link
          href="/lp/free-trial"
          className="block w-full text-center py-3 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
        >
          Start your {PRICING.trial.durationDays}-day free trial &rarr;
        </Link>
      )}

      <p className="text-xs text-gray-600 mt-3 text-center">
        Prices are market averages. Actual savings depend on your vendor contracts.
        Nexara Professional list price used; annual billing saves {PRICING.tiers.PROFESSIONAL.annualDiscountPct}% more.
      </p>
    </div>
  );
}
