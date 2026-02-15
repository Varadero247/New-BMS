'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Cloud,
  Target,
  TrendingUp,
  Leaf,
  Users,
  Shield,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalEmissions: number;
  targetProgress: number;
  esgScore: number;
  scope1: number;
  scope2: number;
  scope3: number;
  activeTargets: number;
  overdueTargets: number;
}

export default function ESGDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setData({
        totalEmissions: 0,
        targetProgress: 0,
        esgScore: 0,
        scope1: 0,
        scope2: 0,
        scope3: 0,
        activeTargets: 0,
        overdueTargets: 0,
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
      title: 'Total Emissions',
      value: `${(data?.totalEmissions || 0).toLocaleString()} tCO2e`,
      subtitle: 'Scope 1 + 2 + 3',
      icon: Cloud,
      iconColor: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      valueColor: 'text-gray-700 dark:text-gray-300',
      href: '/emissions',
    },
    {
      title: 'Target Progress',
      value: `${data?.targetProgress || 0}%`,
      subtitle: 'Reduction targets',
      icon: Target,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      valueColor: 'text-green-700',
      href: '/targets',
    },
    {
      title: 'ESG Score',
      value: `${data?.esgScore || 0}/100`,
      subtitle: 'Overall rating',
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-700',
      href: '/reports',
    },
    {
      title: 'Scope 1',
      value: `${(data?.scope1 || 0).toLocaleString()} tCO2e`,
      subtitle: 'Direct emissions',
      icon: Leaf,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-700',
      href: '/emissions',
    },
    {
      title: 'Scope 2',
      value: `${(data?.scope2 || 0).toLocaleString()} tCO2e`,
      subtitle: 'Indirect - energy',
      icon: Cloud,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-700',
      href: '/emissions',
    },
    {
      title: 'Scope 3',
      value: `${(data?.scope3 || 0).toLocaleString()} tCO2e`,
      subtitle: 'Value chain',
      icon: Cloud,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      valueColor: 'text-orange-700',
      href: '/emissions',
    },
    {
      title: 'Active Targets',
      value: String(data?.activeTargets || 0),
      subtitle: 'In progress',
      icon: Users,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      valueColor: 'text-indigo-700',
      href: '/targets',
    },
    {
      title: 'Overdue Targets',
      value: String(data?.overdueTargets || 0),
      subtitle: 'Require attention',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      valueColor: 'text-red-700',
      href: '/targets',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ESG Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Environmental, Social & Governance overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/emissions" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Cloud className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Log Emissions</span>
                </Link>
                <Link href="/targets" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Target</span>
                </Link>
                <Link href="/reports" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate Report</span>
                </Link>
                <Link href="/frameworks" className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <Shield className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Frameworks</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                ESG Pillars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Environmental</span>
                  </div>
                  <span className="text-sm text-green-700 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Social</span>
                  </div>
                  <span className="text-sm text-blue-700 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Governance</span>
                  </div>
                  <span className="text-sm text-purple-700 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
