'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, Modal } from '@ims/ui';
import { Beaker, Search, Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface MonitoringRecord {
  id: string;
  chemicalId: string;
  chemicalName: string;
  date: string;
  location: string;
  measuredValue: number;
  welLimit: number;
  welPercentage: number;
  method: string;
  sampler: string;
  nextDueDate: string;
  status: string;
  notes: string;
}

export default function MonitoringPage() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [saving, setSaving] = useState(false);

  const [chemicals, setChemicals] = useState<{ id: string; name: string; welLimit: string }[]>([]);
  const [form, setForm] = useState({
    chemicalId: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    measuredValue: '',
    method: 'PERSONAL_SAMPLING',
    sampler: '',
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/monitoring', { params });
      setRecords(res.data.data || []);
    } catch (e: unknown) {
      setError(e.response?.status === 401 ? 'Session expired.' : 'Failed to load monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [search]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/register?fields=id,name,welLimit');
        setChemicals(res.data.data || []);
      } catch { /* non-critical */ }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.post('/monitoring', { ...form, measuredValue: Number(form.measuredValue) });
      setModalOpen(false);
      setForm({ chemicalId: '', date: new Date().toISOString().split('T')[0], location: '', measuredValue: '', method: 'PERSONAL_SAMPLING', sampler: '', notes: '' });
      fetchRecords();
    } catch (e: unknown) {
      setError(e.response?.data?.message || 'Failed to create monitoring record.');
    } finally {
      setSaving(false);
    }
  };

  const exceedanceCount = records.filter((r) => r.welPercentage >= 100).length;
  const overdueCount = records.filter((r) => r.nextDueDate && new Date(r.nextDueDate) < new Date()).length;

  if (loading && records.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exposure Monitoring</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Workplace exposure measurements and WEL compliance</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" /> Log Monitoring
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Beaker className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{records.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className={exceedanceCount > 0 ? 'border-red-200 dark:border-red-800' : ''}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${exceedanceCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <AlertTriangle className={`h-5 w-5 ${exceedanceCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">WEL Exceedances</p>
                  <p className={`text-xl font-bold ${exceedanceCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{exceedanceCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className={overdueCount > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <TrendingUp className={`h-5 w-5 ${overdueCount > 0 ? 'text-amber-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Monitoring</p>
                  <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>{overdueCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by chemical or location..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Chemical</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Location</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Measured</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">WEL</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">% of WEL</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Method</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Next Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">No monitoring records found.</td></tr>
                    ) : (
                      records.map((r) => {
                        const exceedance = r.welPercentage >= 100;
                        const overdue = r.nextDueDate && new Date(r.nextDueDate) < new Date();
                        return (
                          <tr key={r.id} className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors ${exceedance ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{new Date(r.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Beaker className={`h-4 w-4 ${exceedance ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className="font-medium text-gray-900 dark:text-gray-100">{r.chemicalName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.location}</td>
                            <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-100">{r.measuredValue} mg/m3</td>
                            <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{r.welLimit} mg/m3</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[80px]">
                                  <div
                                    className={`h-full rounded-full ${r.welPercentage >= 100 ? 'bg-red-500' : r.welPercentage >= 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(r.welPercentage, 100)}%` }}
                                  />
                                </div>
                                <span className={`font-mono font-medium text-xs ${r.welPercentage >= 100 ? 'text-red-600' : r.welPercentage >= 75 ? 'text-amber-600' : 'text-green-600'}`}>
                                  {r.welPercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{r.method?.replace('_', ' ') || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                {r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : '-'}
                                {overdue && ' (OVERDUE)'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Exposure Monitoring" size="lg">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chemical *</label>
              <select value={form.chemicalId} onChange={(e) => setForm({ ...form, chemicalId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="">Select chemical...</option>
                {chemicals.map((c) => (<option key={c.id} value={c.id}>{c.name} {c.welLimit ? `(WEL: ${c.welLimit} mg/m3)` : ''}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500" placeholder="e.g. Workshop B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Measured Value (mg/m3) *</label>
              <input type="number" step="0.01" value={form.measuredValue} onChange={(e) => setForm({ ...form, measuredValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="PERSONAL_SAMPLING">Personal Sampling</option>
                <option value="STATIC_SAMPLING">Static Sampling</option>
                <option value="REAL_TIME">Real-time Monitor</option>
                <option value="BIOLOGICAL">Biological Monitoring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sampler</label>
              <input type="text" value={form.sampler} onChange={(e) => setForm({ ...form, sampler: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500" placeholder="Name of person taking sample" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500" placeholder="Any additional observations..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.chemicalId || !form.location || !form.measuredValue} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Log Record'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
