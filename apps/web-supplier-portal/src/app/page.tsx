'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { AlertOctagon, FileText, ShoppingCart, BarChart3, Ticket, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData { openNCRs: number; pendingPOs: number; sharedDocuments: number; overallScore: number; openTickets: number; completedPOs: number; }

export default function SupplierDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);
  async function loadDashboard() { try { const res = await api.get('/supplier/dashboard'); setData(res.data.data); } catch (error) { console.error('Error:', error); setData({ openNCRs: 0, pendingPOs: 0, sharedDocuments: 0, overallScore: 0, openTickets: 0, completedPOs: 0 }); } finally { setLoading(false); } }

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => (<div key={i} className="h-32 bg-gray-200 rounded" />))}</div></div></div>); }

  const kpiCards = [
    { title: 'Open NCRs', value: String(data?.openNCRs || 0), icon: AlertOctagon, iconColor: 'text-red-500', bgColor: 'bg-red-50', valueColor: 'text-red-700', href: '/ncrs' },
    { title: 'Pending POs', value: String(data?.pendingPOs || 0), icon: ShoppingCart, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', valueColor: 'text-amber-700', href: '/purchase-orders' },
    { title: 'Documents', value: String(data?.sharedDocuments || 0), icon: FileText, iconColor: 'text-blue-500', bgColor: 'bg-blue-50', valueColor: 'text-blue-700', href: '/documents' },
    { title: 'Supplier Score', value: `${data?.overallScore || 0}/100`, icon: BarChart3, iconColor: 'text-green-500', bgColor: 'bg-green-50', valueColor: 'text-green-700', href: '/scorecards' },
    { title: 'Open Tickets', value: String(data?.openTickets || 0), icon: Ticket, iconColor: 'text-cyan-500', bgColor: 'bg-cyan-50', valueColor: 'text-cyan-700', href: '/tickets' },
    { title: 'Completed POs', value: String(data?.completedPOs || 0), icon: CheckCircle, iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50', valueColor: 'text-indigo-700', href: '/purchase-orders' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Supplier Portal</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to your supplier dashboard</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {kpiCards.map((card) => { const Icon = card.icon; return (
            <Link key={card.title} href={card.href}><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p><p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p></div><div className={`p-3 rounded-full ${card.bgColor}`}><Icon className={`h-6 w-6 ${card.iconColor}`} /></div></div></CardContent></Card></Link>
          ); })}
        </div>
      </div>
    </div>
  );
}
