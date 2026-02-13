'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Wrench } from 'lucide-react';
import { api } from '@/lib/api';

interface WorkOrder {
  id: string;
  woNumber: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  assignedTo: string;
  asset: string;
  dueDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = { OPEN: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', ON_HOLD: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-red-100 text-red-700' };
const priorityColors: Record<string, string> = { CRITICAL: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' };

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try { const res = await api.get('/work-orders'); setOrders(res.data.data || []); } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  }

  const filtered = orders.filter(o => {
    const matchesSearch = !searchTerm || JSON.stringify(o).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Work Orders</h1><p className="text-gray-500 mt-1">Manage maintenance work orders</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Work Order</button>
        </div>
        <Card className="mb-6"><CardContent className="pt-6"><div className="flex flex-wrap gap-4 items-center"><div className="flex-1 min-w-[200px]"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search work orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" /></div></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="ON_HOLD">On Hold</option></select></div></CardContent></Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-amber-600" />Work Orders ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">WO #</th><th className="text-left py-3 px-4 font-medium text-gray-500">Title</th><th className="text-left py-3 px-4 font-medium text-gray-500">Type</th><th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th><th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th><th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(wo => (<tr key={wo.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono">{wo.woNumber}</td><td className="py-3 px-4 text-gray-900 font-medium">{wo.title}</td><td className="py-3 px-4 text-gray-600">{wo.type}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[wo.priority] || 'bg-gray-100 text-gray-700'}`}>{wo.priority}</span></td><td className="py-3 px-4 text-gray-600">{wo.assignedTo}</td><td className="py-3 px-4 text-gray-600">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[wo.status] || 'bg-gray-100 text-gray-700'}`}>{wo.status?.replace(/_/g, ' ')}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No work orders found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
