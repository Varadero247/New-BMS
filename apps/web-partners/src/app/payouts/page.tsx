'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Payout { id: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  requestedAt: string;
  paidAt: string | null; }

export default function PayoutsPage() { const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login');
      return; }
    fetchPayouts(); }, [router]);

  const fetchPayouts = async () => { try { const response = await api.get('/api/payouts');
      const data = response.data.data || {};
      setPayouts(data.payouts || []);
      setAvailableBalance(data.availablePayout || data.availableBalance || 0); } catch { /* Handle error silently */ } finally { setLoading(false); } };

  const handleRequestPayout = async () => { setRequesting(true);
    setSuccess('');

    try { await api.post('/api/payouts/request', { amount: availableBalance });
      setSuccess(
        'Payout request submitted successfully. You will receive payment within 5-10 business days.'
      );
      fetchPayouts(); } catch { /* Handle error silently */ } finally { setRequesting(false); } };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const statusColor: Record<string, string> = { PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    PAID: 'bg-green-500/20 text-green-400',
    REJECTED: 'bg-red-500/20 text-red-400' };

  const canRequestPayout = availableBalance >= 100;

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
          <h1 className="text-2xl font-bold text-white mb-8">Payouts</h1>

          {/* Balance Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(availableBalance)}</p>
                {!canRequestPayout && availableBalance > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Minimum payout threshold is {formatCurrency(100)}. You need{' '}
                    {formatCurrency(100 - availableBalance)} more.
                  </p>
                )}
                {availableBalance === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Commission from closed deals will appear here once confirmed.
                  </p>
                )}
              </div>
              <button
                onClick={handleRequestPayout}
                disabled={!canRequestPayout || requesting}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${ canRequestPayout
                    ? 'bg-[#1B3A6B] hover:bg-[#244d8a] text-white'
                    : 'bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' } disabled:opacity-50`}
              >
                {requesting ? 'Requesting...' : 'Request Payout'}
              </button>
            </div>

            {success && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Payout History</h2>
            </div>

            {payouts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No payout history yet. Payouts will appear here once you request them.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm text-white font-mono">
                          {payout.reference}
                        </td>
                        <td className="py-3 px-6 text-sm text-white font-medium">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400 dark:text-gray-500">
                          {payout.method || 'Bank Transfer'}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[payout.status] || 'bg-gray-500/20 text-gray-400'}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400 dark:text-gray-500">
                          {new Date(payout.requestedAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400 dark:text-gray-500">
                          {payout.paidAt
                            ? new Date(payout.paidAt).toLocaleDateString('en-GB')
                            : '-'}
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
