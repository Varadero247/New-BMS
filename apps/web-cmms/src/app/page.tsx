'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Wrench, Server, Clock, AlertCircle, CheckCircle, BarChart3, CalendarCheck, Package } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalAssets: number;
  activeWorkOrders: number;
  overdueWorkOrders: number;
  completedThisMonth: number;
  mtbf: number;
  mttr: number;
  pmCompliance: number;
  lowStockParts: number;
}

export default function CMMSDashboard() {
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
      setData({ totalAssets: 0, activeWorkOrders: 0, overdueWorkOrders: 0, completedThisMonth: 0, mtbf: 0, mttr: 0, pmCompliance: 0, lowStockParts: 0 });
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
            {[1, 2, 3, 4].map(i => (<div key={i} className="h-32 bg-gray-200 rounded" />))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Assets', value: String(data?.totalAssets || 0), subtitle: 'Registered assets', icon: Server, iconColor: 'text-blue-500', bgColor: 'bg-blue-50', valueColor: 'text-blue-700', href: '/assets' },
    { title: 'Active Work Orders', value: String(data?.activeWorkOrders || 0), subtitle: 'In progress', icon: Wrench, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', valueColor: 'text-amber-700', href: '/work-orders' },
    { title: 'Overdue WOs', value: String(data?.overdueWorkOrders || 0), subtitle: 'Past due date', icon: AlertCircle, iconColor: 'text-red-500', bgColor: 'bg-red-50', valueColor: 'text-red-700', href: '/work-orders' },
    { title: 'Completed (Month)', value: String(data?.completedThisMonth || 0), subtitle: 'This month', icon: CheckCircle, iconColor: 'text-green-500', bgColor: 'bg-green-50', valueColor: 'text-green-700', href: '/work-orders' },
    { title: 'MTBF', value: `${data?.mtbf || 0}h`, subtitle: 'Mean time between failures', icon: Clock, iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50', valueColor: 'text-indigo-700', href: '/kpis' },
    { title: 'MTTR', value: `${data?.mttr || 0}h`, subtitle: 'Mean time to repair', icon: Clock, iconColor: 'text-purple-500', bgColor: 'bg-purple-50', valueColor: 'text-purple-700', href: '/kpis' },
    { title: 'PM Compliance', value: `${data?.pmCompliance || 0}%`, subtitle: 'Preventive maintenance', icon: CalendarCheck, iconColor: 'text-teal-500', bgColor: 'bg-teal-50', valueColor: 'text-teal-700', href: '/preventive-plans' },
    { title: 'Low Stock Parts', value: String(data?.lowStockParts || 0), subtitle: 'Below reorder point', icon: Package, iconColor: 'text-orange-500', bgColor: 'bg-orange-50', valueColor: 'text-orange-700', href: '/parts' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CMMS Dashboard</h1>
          <p className="text-gray-500 mt-1">Maintenance management overview and key metrics</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/work-orders" className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <Wrench className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Create Work Order</span>
              </Link>
              <Link href="/assets" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Server className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Register Asset</span>
              </Link>
              <Link href="/preventive-plans" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <CalendarCheck className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">PM Schedule</span>
              </Link>
              <Link href="/kpis" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View KPIs</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
