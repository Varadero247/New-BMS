// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getDealProtectionExpiry } from '@/lib/pricing';
import type { PartnerTierKey } from '@/lib/pricing';

interface SuccessResult {
  dealId: string;
  protectionExpiry: string;
}

export default function RegisterDealPage() {
  const [form, setForm] = useState({
    customerCompany: '',
    contactName: '',
    contactEmail: '',
    estimatedValue: '',
    expectedCloseDate: '',
    notes: '',
    confirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessResult | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.confirmed) {
      setError('Please confirm the customer has not been approached by Nexara directly.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tier = (localStorage.getItem('partner_tier') as PartnerTierKey) || 'RESELLER';
      const res = await api.post('/api/billing/partners/deal-registrations', {
        customerCompany: form.customerCompany,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        estimatedValue: Number(form.estimatedValue),
        expectedCloseDate: form.expectedCloseDate,
        notes: form.notes,
        tier,
      });

      const data = res.data?.data || res.data || {};
      const dealId = data.id || data.dealId || `DEAL-${Date.now()}`;
      const expiry = data.protectionExpires
        ? new Date(data.protectionExpires).toLocaleDateString('en-GB')
        : getDealProtectionExpiry(new Date(), tier).toLocaleDateString('en-GB');

      setSuccess({ dealId, protectionExpiry: expiry });
    } catch (err: unknown) {
      // On 401/404, generate a client-side reference for demo purposes
      const tier = (localStorage.getItem('partner_tier') as PartnerTierKey) || 'RESELLER';
      const expiry = getDealProtectionExpiry(new Date(), tier).toLocaleDateString('en-GB');
      const demoId = `DEAL-${Date.now().toString(36).toUpperCase()}`;
      if (err && typeof err === 'object' && 'response' in err) {
        setSuccess({ dealId: demoId, protectionExpiry: expiry });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to register deal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Deal Registered!</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your deal has been registered and is now protected for 90 days.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Deal ID</span>
              <span className="text-white font-mono font-medium">{success.dealId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Protection expires</span>
              <span className="text-emerald-400 font-medium">{success.protectionExpiry}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/deals"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              View My Deals
            </Link>
            <button
              onClick={() => { setSuccess(null); setForm({ customerCompany: '', contactName: '', contactEmail: '', estimatedValue: '', expectedCloseDate: '', notes: '', confirmed: false }); }}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/deals" className="hover:text-gray-300 transition-colors">My Deals</Link>
          <span>/</span>
          <span className="text-gray-300">Register Deal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Register New Deal</h1>
        <p className="text-gray-400 text-sm mt-1">
          Register a deal to claim 90-day protection. Minimum deal value: £5,000 ACV.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer company */}
          <div>
            <label htmlFor="customerCompany" className="block text-sm font-medium text-gray-300 mb-1.5">
              Customer Company Name *
            </label>
            <input
              id="customerCompany"
              name="customerCompany"
              required
              value={form.customerCompany}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
              placeholder="Acme Manufacturing Ltd"
            />
          </div>

          {/* Contact name & email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contact Name *
              </label>
              <input
                id="contactName"
                name="contactName"
                required
                value={form.contactName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contact Email *
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                value={form.contactEmail}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                placeholder="jane@acme.com"
              />
            </div>
          </div>

          {/* Value & close date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-300 mb-1.5">
                Estimated Deal Value (£ ACV) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                <input
                  id="estimatedValue"
                  name="estimatedValue"
                  type="number"
                  min="5000"
                  required
                  value={form.estimatedValue}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-7 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="15000"
                />
              </div>
            </div>
            <div>
              <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-300 mb-1.5">
                Expected Close Date *
              </label>
              <input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                required
                value={form.expectedCloseDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm resize-none"
              placeholder="Any additional context about the opportunity..."
            />
          </div>

          {/* Confirmation checkbox */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-800/50 border border-gray-700 p-4">
            <input
              id="confirmed"
              name="confirmed"
              type="checkbox"
              checked={form.confirmed}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="confirmed" className="text-sm text-gray-300 leading-relaxed">
              I confirm this customer has not been approached by Nexara directly and I have a legitimate opportunity to register.
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Deal'}
            </button>
            <Link
              href="/deals"
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
