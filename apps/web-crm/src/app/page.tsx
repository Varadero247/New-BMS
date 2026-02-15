'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Users,
  Building2,
  
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  UserPlus,
  Briefcase,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalContacts: number;
  totalAccounts: number;
  openDeals: number;
  pipelineValue: number;
  wonThisMonth: number;
  conversionRate: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    entityType?: string;
  }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CRMDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setData({
        totalContacts: 0,
        totalAccounts: 0,
        openDeals: 0,
        pipelineValue: 0,
        wonThisMonth: 0,
        conversionRate: 0,
        recentActivities: [],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Contacts',
      value: String(data?.totalContacts || 0),
      subtitle: 'All contacts',
      icon: Users,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50',
      valueColor: 'text-violet-700',
      href: '/contacts',
    },
    {
      title: 'Total Accounts',
      value: String(data?.totalAccounts || 0),
      subtitle: 'Active accounts',
      icon: Building2,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-700',
      href: '/accounts',
    },
    {
      title: 'Open Deals',
      value: String(data?.openDeals || 0),
      subtitle: 'In pipeline',
      icon: DollarSign,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-700',
      href: '/deals',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(data?.pipelineValue || 0),
      subtitle: 'Total open value',
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      valueColor: 'text-green-700',
      href: '/pipeline',
    },
    {
      title: 'Won This Month',
      value: formatCurrency(data?.wonThisMonth || 0),
      subtitle: 'Closed won',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-700',
      href: '/deals',
    },
    {
      title: 'Conversion Rate',
      value: `${(data?.conversionRate || 0).toFixed(1)}%`,
      subtitle: 'Lead to deal',
      icon: Target,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      valueColor: 'text-purple-700',
      href: '/reports',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-500 mt-1">Customer relationship overview and key metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                      </div>
                      <div className={`p-3 rounded-full ${card.bgColor}`}>
                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/contacts"
                className="flex flex-col items-center p-4 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <UserPlus className="h-8 w-8 text-violet-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Contact</span>
              </Link>
              <Link
                href="/deals"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Briefcase className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">New Deal</span>
              </Link>
              <Link
                href="/pipeline"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Pipeline</span>
              </Link>
              <Link
                href="/reports"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Sales Reports</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivities.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                            {activity.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{activity.description}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
