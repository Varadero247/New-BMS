'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Zap, Gauge, Target, TrendingDown, BarChart3, Bell, Receipt, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalConsumption: number;
  activeMeters: number;
  energyTargets: number;
  baselineVariance: number;
  activeSEUs: number;
  openAlerts: number;
  monthlyBill: number;
  enpiScore: number;
}

export default function EnergyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function loadDashboard() {
    try {
      const r = await api.get('/dashboard');
      setData(r.data.data);
    } catch (e) {
      console.error(e);
      setError('Unable to load data. Please check your connection and try again.');
      setData({
        totalConsumption: 0,
        activeMeters: 0,
        energyTargets: 0,
        baselineVariance: 0,
        activeSEUs: 0,
        openAlerts: 0,
        monthlyBill: 0,
        enpiScore: 0,
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadDashboard();
  }, []);
  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );

  const kpis = [
    {
      title: 'Total Consumption',
      value: `${(data?.totalConsumption || 0).toLocaleString()} kWh`,
      icon: Zap,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900',
      valueColor: 'text-yellow-700',
      href: '/readings',
    },
    {
      title: 'Active Meters',
      value: String(data?.activeMeters || 0),
      icon: Gauge,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      valueColor: 'text-blue-700',
      href: '/meters',
    },
    {
      title: 'Energy Targets',
      value: String(data?.energyTargets || 0),
      icon: Target,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      valueColor: 'text-green-700',
      href: '/targets',
    },
    {
      title: 'Baseline Variance',
      value: `${data?.baselineVariance || 0}%`,
      icon: TrendingDown,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900',
      valueColor: 'text-indigo-700',
      href: '/baselines',
    },
    {
      title: 'Active SEUs',
      value: String(data?.activeSEUs || 0),
      icon: Activity,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      valueColor: 'text-orange-700',
      href: '/seus',
    },
    {
      title: 'Open Alerts',
      value: String(data?.openAlerts || 0),
      icon: Bell,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      valueColor: 'text-red-700',
      href: '/alerts',
    },
    {
      title: 'Monthly Bill',
      value: `$${(data?.monthlyBill || 0).toLocaleString()}`,
      icon: Receipt,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900',
      valueColor: 'text-emerald-700',
      href: '/bills',
    },
    {
      title: 'EnPI Score',
      value: `${data?.enpiScore || 0}`,
      icon: BarChart3,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      valueColor: 'text-purple-700',
      href: '/enpis',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO 50001 energy management overview
          </p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                loadDashboard();
              }}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
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
      </div>
    </div>
  );
}
