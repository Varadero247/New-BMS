'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, CalendarCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface PreventivePlan {
  id: string;
  name: string;
  asset: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  assignedTo: string;
  status: string;
}

export default function PreventivePlansPage() {
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadPlans(); }, []);
  async function loadPlans() { try { const res = await api.get('/preventive-plans'); setPlans(res.data.data || []); } catch (error) { console.error('Error:', error); } finally { setLoading(false); } }
  const filtered = plans.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance Plans</h1><p className="text-gray-500 mt-1">Schedule and manage preventive maintenance</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Plan</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search plans..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-amber-600" />PM Plans ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th><th className="text-left py-3 px-4 font-medium text-gray-500">Frequency</th><th className="text-left py-3 px-4 font-medium text-gray-500">Last Completed</th><th className="text-left py-3 px-4 font-medium text-gray-500">Next Due</th><th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(plan => (<tr key={plan.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 text-gray-900 font-medium">{plan.name}</td><td className="py-3 px-4 text-gray-600">{plan.asset}</td><td className="py-3 px-4 text-gray-600">{plan.frequency}</td><td className="py-3 px-4 text-gray-600">{plan.lastCompleted ? new Date(plan.lastCompleted).toLocaleDateString() : '-'}</td><td className="py-3 px-4 text-gray-600">{plan.nextDue ? new Date(plan.nextDue).toLocaleDateString() : '-'}</td><td className="py-3 px-4 text-gray-600">{plan.assignedTo}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{plan.status}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No preventive plans found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
