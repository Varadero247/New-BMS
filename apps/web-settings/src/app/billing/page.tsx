// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowUpCircle, Download, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-003', period: 'March 2026',    amount: 975,  status: 'Pending' },
  { id: 'INV-2026-002', period: 'February 2026', amount: 975,  status: 'Paid'    },
  { id: 'INV-2026-001', period: 'January 2026',  amount: 975,  status: 'Paid'    },
  { id: 'INV-2025-012', period: 'December 2025', amount: 975,  status: 'Paid'    },
  { id: 'INV-2025-011', period: 'November 2025', amount: 975,  status: 'Paid'    },
];

const STATUS_BADGE: Record<Invoice['status'], string> = {
  Paid:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function BillingPage() {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? Your access will end at the next renewal date.')) {
      window.alert('Cancellation request received. Your subscription will remain active until 2026-04-07. Our team will be in touch.');
    }
  };

  const planUsers = 25;
  const planCap = 100;
  const usagePct = Math.round((planUsers / planCap) * 100);
  const monthlyTotal = 39 * planUsers; // £39/user/mo annual rate

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing &amp; Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your plan, invoices, and payment details</p>
        </div>
      </div>

      {/* Current plan card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">Current Plan</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Billed annually · £39/user/month</p>
          </div>
          <Link
            href="/billing/upgrade"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{planUsers}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">£{monthlyTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next Renewal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">7 Apr 2027</p>
          </div>
        </div>

        {/* Usage bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User seats</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{planUsers} / {planCap}</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-brand-600 h-2.5 rounded-full"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{usagePct}% of user cap used</p>
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Invoice History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Invoice #</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Period</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-right">Amount</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Status</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Download</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 font-mono text-xs text-gray-600 dark:text-gray-400">{inv.id}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">{inv.period}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 text-right font-medium text-gray-900 dark:text-white">£{inv.amount.toLocaleString()}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50">
                  <button
                    onClick={() => window.alert(`Downloading ${inv.id}...`)}
                    className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline text-xs"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-800 dark:text-red-300">Danger Zone</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Cancelling your subscription will end access to all Nexara IMS modules at your next renewal date. Your data will be retained for 90 days.
        </p>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          Cancel Subscription
        </button>
      </div>
    </div>
  );
}
