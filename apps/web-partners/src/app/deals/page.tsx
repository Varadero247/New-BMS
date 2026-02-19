'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Deal { id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  value: number;
  commission: number;
  status: string;
  notes: string;
  createdAt: string; }

type SortField = 'companyName' | 'value' | 'commission' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function DealsPage() { const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [form, setForm] = useState({ companyName: '',
    contactName: '',
    contactEmail: '',
    value: '',
    notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login');
      return; }
    fetchDeals(); }, [router]);

  const fetchDeals = async () => { try { const response = await api.get('/api/deals');
      setDeals(response.data.data || []); } catch { /* Handle error silently */ } finally { setLoading(false); } };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
    setError('');
    setSubmitting(true);

    try { await api.post('/api/deals', { companyName: form.companyName,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        value: parseFloat(form.value),
        notes: form.notes });
      setShowForm(false);
      setForm({ companyName: '', contactName: '', contactEmail: '', value: '', notes: '' });
      fetchDeals(); } catch (err) { setError((axios.isAxiosError(err) && err.response?.data?.message) || 'Failed to submit deal'); } finally { setSubmitting(false); } };

  const handleSort = (field: SortField) => { if (sortField === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } else { setSortField(field);
      setSortDir('asc'); } };

  const sortedDeals = [...deals].sort((a, b) => { const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'value' || sortField === 'commission') { return (a[sortField] - b[sortField]) * dir; }
    if (sortField === 'createdAt') { return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir; }
    return a[sortField].localeCompare(b[sortField]) * dir; });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const statusColor: Record<string, string> = { NEW: 'bg-blue-500/20 text-blue-400',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
    NEGOTIATION: 'bg-purple-500/20 text-purple-400',
    CLOSED_WON: 'bg-green-500/20 text-green-400',
    CLOSED_LOST: 'bg-red-500/20 text-red-400' };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u2195'}
    </span>
  );

  if (loading) { return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">Loading...</div>
        </main>
      </div>
    ); }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Deals</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showForm ? 'Cancel' : 'Submit New Deal'}
            </button>
          </div>

          {/* New Deal Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Submit a New Deal</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    placeholder="Prospect company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    placeholder="Decision maker name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Estimated Deal Value
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none"
                    placeholder="Any additional context about this deal..."
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Deal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Deals Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {deals.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No deals yet. Click &quot;Submit New Deal&quot; to register your first referral.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th
                        onClick={() => handleSort('companyName')}
                        className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                      >
                        Company <SortIcon field="companyName" />
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th
                        onClick={() => handleSort('value')}
                        className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                      >
                        Value <SortIcon field="value" />
                      </th>
                      <th
                        onClick={() => handleSort('commission')}
                        className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                      >
                        Commission <SortIcon field="commission" />
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                      >
                        Status <SortIcon field="status" />
                      </th>
                      <th
                        onClick={() => handleSort('createdAt')}
                        className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                      >
                        Date <SortIcon field="createdAt" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {sortedDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm text-white font-medium">
                          {deal.companyName}
                        </td>
                        <td className="py-3 px-6">
                          <div className="text-sm text-white">{deal.contactName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {deal.contactEmail}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-sm text-white">
                          {formatCurrency(deal.value)}
                        </td>
                        <td className="py-3 px-6 text-sm text-green-400">
                          {formatCurrency(deal.commission)}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[deal.status] || 'bg-gray-500/20 text-gray-400'}`}
                          >
                            {deal.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400 dark:text-gray-500">
                          {new Date(deal.createdAt).toLocaleDateString('en-GB')}
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
  ); }
