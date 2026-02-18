'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  AlertTriangle,
  Crosshair,
  Activity,
  ClipboardCheck,
  Package,
  RotateCcw,
  BarChart3,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalHazards: number;
  criticalCCPs: number;
  activeMonitoring: number;
  openNCRs: number;
  pendingAudits: number;
  activeRecalls: number;
  supplierCount: number;
  complianceScore: number;
}

export default function FoodSafetyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);
  async function loadDashboard() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Error:', error);
      setError('Unable to load data. Please check your connection and try again.');
      setData({
        totalHazards: 0,
        criticalCCPs: 0,
        activeMonitoring: 0,
        openNCRs: 0,
        pendingAudits: 0,
        activeRecalls: 0,
        supplierCount: 0,
        complianceScore: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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
  }

  const kpiCards = [
    {
      title: 'Hazards Identified',
      value: String(data?.totalHazards || 0),
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      valueColor: 'text-red-700',
      href: '/hazards',
    },
    {
      title: 'Critical CCPs',
      value: String(data?.criticalCCPs || 0),
      icon: Crosshair,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      valueColor: 'text-orange-700',
      href: '/ccps',
    },
    {
      title: 'Active Monitoring',
      value: String(data?.activeMonitoring || 0),
      icon: Activity,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      valueColor: 'text-blue-700',
      href: '/monitoring',
    },
    {
      title: 'Open NCRs',
      value: String(data?.openNCRs || 0),
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900',
      valueColor: 'text-amber-700',
      href: '/ncrs',
    },
    {
      title: 'Pending Audits',
      value: String(data?.pendingAudits || 0),
      icon: ClipboardCheck,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900',
      valueColor: 'text-indigo-700',
      href: '/audits',
    },
    {
      title: 'Active Recalls',
      value: String(data?.activeRecalls || 0),
      icon: RotateCcw,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      valueColor: 'text-red-700',
      href: '/recalls',
    },
    {
      title: 'Approved Suppliers',
      value: String(data?.supplierCount || 0),
      icon: Package,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      valueColor: 'text-green-700',
      href: '/suppliers',
    },
    {
      title: 'Compliance Score',
      value: `${data?.complianceScore || 0}%`,
      icon: Shield,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900',
      valueColor: 'text-teal-700',
      href: '/audits',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Food Safety Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            HACCP-based food safety management overview
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/hazards"
                className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
              >
                <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hazard Analysis
                </span>
              </Link>
              <Link
                href="/ccps"
                className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              >
                <Crosshair className="h-8 w-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CCP Management
                </span>
              </Link>
              <Link
                href="/monitoring"
                className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <Activity className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monitoring
                </span>
              </Link>
              <Link
                href="/audits"
                className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
              >
                <ClipboardCheck className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audits</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
