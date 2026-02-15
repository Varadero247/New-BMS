'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Deal {
  id: string;
  companyName: string;
  contactName: string;
  value: number;
  commission: number;
  status: string;
  createdAt: string;
}

interface PayoutSummary {
  totalCommission: number;
  pendingCommission: number;
  availablePayout: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary>({
    totalCommission: 0,
    pendingCommission: 0,
    availablePayout: 0,
  });
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [dealsRes, payoutsRes] = await Promise.allSettled([
          api.get('/api/deals'),
          api.get('/api/payouts'),
        ]);

        if (dealsRes.status === 'fulfilled') {
          const dealsData = dealsRes.value.data.data || [];
          setDeals(dealsData);
        }

        if (payoutsRes.status === 'fulfilled') {
          const payoutData = payoutsRes.value.data.data || {};
          setPayoutSummary({
            totalCommission: payoutData.totalCommission || 0,
            pendingCommission: payoutData.pendingCommission || 0,
            availablePayout: payoutData.availablePayout || 0,
          });
        }

        setReferralLink(`${window.location.origin}/register?ref=${token.slice(-8)}`);
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalDeals = deals.length;
  const inProgress = deals.filter((d) => d.status === 'IN_PROGRESS' || d.status === 'NEGOTIATION').length;
  const closedWon = deals.filter((d) => d.status === 'CLOSED_WON').length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const statusColor: Record<string, string> = {
    NEW: 'bg-blue-500/20 text-blue-400',
    IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
    NEGOTIATION: 'bg-purple-500/20 text-purple-400',
    CLOSED_WON: 'bg-green-500/20 text-green-400',
    CLOSED_LOST: 'bg-red-500/20 text-red-400',
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
          <h1 className="text-2xl font-bold text-white mb-8">Partner Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Total Deals</p>
              <p className="text-2xl font-bold text-white">{totalDeals}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{inProgress}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Closed Won</p>
              <p className="text-2xl font-bold text-green-400">{closedWon}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Total Commission</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(payoutSummary.totalCommission)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Pending Commission</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(payoutSummary.pendingCommission)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">Available Payout</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(payoutSummary.availablePayout)}</p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">Your Referral Link</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with potential customers. You will earn commission on all deals closed through your referral.
            </p>
          </div>

          {/* Recent Deals */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Recent Deals</h2>
            </div>
            {deals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No deals yet. Share your referral link to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {deals.slice(0, 10).map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm text-white">{deal.companyName}</td>
                        <td className="py-3 px-6 text-sm text-gray-400">{deal.contactName}</td>
                        <td className="py-3 px-6 text-sm text-white">{formatCurrency(deal.value)}</td>
                        <td className="py-3 px-6 text-sm text-green-400">{formatCurrency(deal.commission)}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[deal.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {deal.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400">
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
  );
}
