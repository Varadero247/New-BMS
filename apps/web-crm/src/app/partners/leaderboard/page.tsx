'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@ims/ui';
import { Award, TrendingUp, DollarSign, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface PartnerRanking {
  id: string;
  accountName: string;
  account?: { name: string };
  tier: string;
  totalReferrals: number;
  totalRevenue: number;
  commissionEarned: number;
  conversionRate: number;
  status: string;
}

const tierLabels: Record<string, string> = {
  TIER_1_REFERRAL: 'Tier 1',
  TIER_2_COSELL: 'Tier 2',
  TIER_3_RESELLER: 'Tier 3',
};

const tierColors: Record<string, string> = {
  TIER_1_REFERRAL: 'bg-blue-100 text-blue-700',
  TIER_2_COSELL: 'bg-purple-100 text-purple-700',
  TIER_3_RESELLER: 'bg-amber-100 text-amber-700',
};

export default function LeaderboardPage() {
  const [partners, setPartners] = useState<PartnerRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const res = await api.get('/partners/leaderboard');
      setPartners(res.data.data || []);
    } catch {
      // Fallback: load partners and sort by referrals
      try {
        const res = await api.get('/partners');
        const data = (res.data.data || []).sort(
          (a: any, b: any) => (b.totalReferrals || 0) - (a.totalReferrals || 0)
        );
        setPartners(data);
      } catch {
        setPartners([]);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const topPartner = partners[0];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Partner Leaderboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Performance rankings across all partner tiers
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Partners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {partners.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {partners.reduce((s, p) => s + (p.totalReferrals || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Generated</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: 'GBP',
                      maximumFractionDigits: 0,
                    }).format(partners.reduce((s, p) => s + (p.totalRevenue || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Top Partner</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                    {topPartner?.account?.name || topPartner?.accountName || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-600" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-12">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Partner
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Tier
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Referrals
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Revenue
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner, index) => (
                      <tr
                        key={partner.id}
                        className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${index < 3 ? 'bg-amber-50/30' : ''}`}
                      >
                        <td className="py-3 px-4 text-center">
                          {index < 3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                index === 0
                                  ? 'bg-amber-400 text-white'
                                  : index === 1
                                    ? 'bg-gray-300 text-gray-700'
                                    : 'bg-amber-600 text-white'
                              }`}
                            >
                              {index + 1}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {partner.account?.name || partner.accountName || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              tierColors[partner.tier] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {tierLabels[partner.tier] || partner.tier}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {partner.totalReferrals || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            maximumFractionDigits: 0,
                          }).format(partner.totalRevenue || 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: 'GBP',
                            maximumFractionDigits: 0,
                          }).format(partner.commissionEarned || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No partner data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
