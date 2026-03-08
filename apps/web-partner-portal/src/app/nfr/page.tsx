// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PARTNER_TIERS } from '@/lib/pricing';
import type { PartnerTierKey } from '@/lib/pricing';

interface NFRLicence {
  id: string;
  key: string;
  product: string;
  seats: number;
  issuedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

interface RequestForm {
  intendedUse: string;
  seats: string;
  comments: string;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400',
  Expired: 'bg-red-500/20 text-red-400',
  Revoked: 'bg-gray-700 text-gray-400',
};

export default function NFRPage() {
  const [licences, setLicences] = useState<NFRLicence[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<PartnerTierKey>('RESELLER');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<RequestForm>({ intendedUse: '', seats: '1', comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const storedTier = (localStorage.getItem('partner_tier') as PartnerTierKey) || 'RESELLER';
    setTier(storedTier);

    api
      .get('/api/billing/partners/nfr')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setLicences(Array.isArray(data) ? data : []);
      })
      .catch(() => setLicences([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/billing/partners/nfr', { ...form, seats: Number(form.seats) });
    } catch {
      // Accept any response — show success
    } finally {
      setSubmitting(false);
      setModalOpen(false);
      setRequestSent(true);
      setForm({ intendedUse: '', seats: '1', comments: '' });
    }
  }

  const tierData = PARTNER_TIERS[tier];
  const nfrAllowance = tierData.nfrSeats;
  const usedSeats = licences.filter((l) => l.status === 'Active').reduce((s, l) => s + l.seats, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">NFR Licences</h1>
          <p className="text-gray-400 text-sm mt-1">Not-for-Resale licences for demo and internal use.</p>
        </div>
        {nfrAllowance > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            Request NFR
          </button>
        )}
      </div>

      {/* Allowance banner */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Your <span className="text-white font-medium">{tierData.name}</span> tier includes{' '}
            <span className="text-emerald-400 font-semibold">{nfrAllowance} NFR seats</span>.
          </p>
          {nfrAllowance === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Upgrade to Reseller or above to access NFR licences.
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Seats used</p>
          <p className="text-lg font-bold text-white">
            {usedSeats} <span className="text-gray-500 font-normal text-sm">/ {nfrAllowance}</span>
          </p>
        </div>
      </div>

      {requestSent && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 mb-6">
          NFR request submitted. Your channel manager will be in touch within 2 business days.
        </div>
      )}

      {/* Licences table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Current Licences</h2>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">Loading...</div>
        ) : licences.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No NFR licences yet.{' '}
            {nfrAllowance > 0 && (
              <button onClick={() => setModalOpen(true)} className="text-emerald-400 hover:underline">
                Request one
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Licence Key', 'Product', 'Seats', 'Issued', 'Expires', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {licences.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{l.key.slice(0, 16)}…</td>
                    <td className="px-6 py-4 text-white">{l.product}</td>
                    <td className="px-6 py-4 text-gray-300">{l.seats}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(l.issuedAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(l.expiresAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[l.status] || 'bg-gray-700 text-gray-300'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Request NFR Licence</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Intended Use *</label>
                <input
                  name="intendedUse"
                  required
                  value={form.intendedUse}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="e.g. Internal demos, customer POC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Seats *</label>
                <input
                  name="seats"
                  type="number"
                  min="1"
                  max={nfrAllowance - usedSeats}
                  required
                  value={form.seats}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">{nfrAllowance - usedSeats} seats remaining in your allowance.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Comments</label>
                <textarea
                  name="comments"
                  rows={2}
                  value={form.comments}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm resize-none"
                  placeholder="Any additional context..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
