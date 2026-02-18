'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Referral {
  id: string;
  referralCode: string;
  prospectEmail: string;
  prospectName: string | null;
  clickedAt: string | null;
  signedUpAt: string | null;
  convertedAt: string | null;
  createdAt: string;
}

interface ReferralStats {
  total: number;
  clicked: number;
  signedUp: number;
  converted: number;
  conversionRate: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [refRes, statsRes] = await Promise.allSettled([
        api.get('/api/referrals'),
        api.get('/api/referrals/stats'),
      ]);
      if (refRes.status === 'fulfilled') setReferrals(refRes.value.data.data || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    } catch (err) {
      console.error('Failed to load referrals', err);
      setError('Failed to load referrals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/referrals/track', {
        prospectEmail: formEmail,
        prospectName: formName || undefined,
      });
      setFormEmail('');
      setFormName('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to track referral', err);
      setError('Failed to submit referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (r: Referral) => {
    if (r.convertedAt)
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
          Converted
        </span>
      );
    if (r.signedUpAt)
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
          Signed Up
        </span>
      );
    if (r.clickedAt)
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
          Clicked
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Sent</span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Referrals</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Track Referral
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-300 ml-4 text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Clicked</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.clicked}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Signed Up</p>
                <p className="text-2xl font-bold text-blue-400">{stats.signedUp}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Converted</p>
                <p className="text-2xl font-bold text-green-400">{stats.converted}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(stats.conversionRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Quick Add Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Track New Referral</h2>
              <form onSubmit={handleSubmit} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-400 mb-1 block">Prospect Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="prospect@company.com"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-400 mb-1 block">Prospect Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="Jane Smith"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
              </form>
            </div>
          )}

          {/* Referrals Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">All Referrals</h2>
            </div>
            {referrals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No referrals tracked yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Prospect
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-800/50">
                        <td className="py-3 px-6 text-sm text-white">{r.prospectName || '—'}</td>
                        <td className="py-3 px-6 text-sm text-gray-400">{r.prospectEmail}</td>
                        <td className="py-3 px-6">{statusBadge(r)}</td>
                        <td className="py-3 px-6 text-sm text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
