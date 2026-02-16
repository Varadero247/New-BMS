'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Search, Bell, AlertTriangle, CheckCircle, Eye, Trash2, Plus, Zap, Gauge, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface Alert {
  id: string;
  message?: string;
  title?: string;
  type: string;
  severity: string;
  status: string;
  meterId?: string;
  meterName?: string;
  threshold?: number;
  actualValue?: number;
  unit?: string;
  createdAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

const ALERT_TYPES = ['CONSUMPTION_EXCEEDED', 'DEMAND_PEAK', 'ANOMALY', 'THRESHOLD', 'METER_FAULT', 'BILLING', 'COMPLIANCE'];
const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUS_OPTIONS = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'];

const severityConfig: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-red-100 text-red-700' },
  ACKNOWLEDGED: { label: 'Acknowledged', className: 'bg-blue-100 text-blue-700' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-700' },
  DISMISSED: { label: 'Dismissed', className: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
};

const empty: Partial<Alert> = { title: '', type: 'THRESHOLD', severity: 'MEDIUM', status: 'OPEN', notes: '' };

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Alert>>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/alerts'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const ms2 = !filterSeverity || i.severity === filterSeverity;
    return m && ms && ms2;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'OPEN').length,
    critical: items.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length,
    resolved: items.filter(i => i.status === 'RESOLVED').length,
  };

  const acknowledge = async (id: string) => {
    try { await api.patch(`/alerts/${id}`, { status: 'ACKNOWLEDGED' }); await load(); } catch (e) { console.error(e); }
  };
  const resolve = async (id: string) => {
    try { await api.patch(`/alerts/${id}`, { status: 'RESOLVED' }); await load(); } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/alerts', editItem);
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/alerts/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Alerts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Consumption alerts and anomaly detection</p>
          </div>
          <button onClick={() => { setEditItem({ ...empty }); setModalOpen(true); }} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Create Alert
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><Bell className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Open</p><p className="text-2xl font-bold text-red-700">{stats.open}</p></div><div className="p-3 bg-red-50 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Critical Open</p><p className="text-2xl font-bold text-orange-700">{stats.critical}</p></div><div className="p-3 bg-orange-50 rounded-full"><Zap className="h-6 w-6 text-orange-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p><p className="text-2xl font-bold text-green-700">{stats.resolved}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search alerts..." placeholder="Search alerts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Filter by severity" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Severities</option>
            {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-yellow-600" />Alerts ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Alert</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Meter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.OPEN;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title || item.message || '-'}</p>
                            {item.threshold != null && item.actualValue != null && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">Threshold: {item.threshold} {item.unit} | Actual: {item.actualValue} {item.unit}</p>
                            )}
                          </td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">{item.type?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${severityConfig[item.severity] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{item.severity}</span></td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.meterName || item.meterId || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}>{sc.label}</span></td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-1 justify-end">
                              {item.status === 'OPEN' && (
                                <button onClick={() => acknowledge(item.id)} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1" title="Acknowledge">
                                  <Eye className="h-3 w-3" /> Ack
                                </button>
                              )}
                              {(item.status === 'OPEN' || item.status === 'ACKNOWLEDGED') && (
                                <button onClick={() => resolve(item.id)} className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1" title="Resolve">
                                  <CheckCircle className="h-3 w-3" /> Resolve
                                </button>
                              )}
                              <button onClick={() => { setDeleteId(item.id); setDeleteModal(true); }} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No alerts found</p>
                <p className="text-sm mt-1">All clear — no energy alerts at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Alert" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Title *</label>
            <input value={editItem.title || ''} onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. High consumption threshold exceeded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={editItem.type || 'THRESHOLD'} onChange={e => setEditItem(p => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {ALERT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
              <select value={editItem.severity || 'MEDIUM'} onChange={e => setEditItem(p => ({ ...p, severity: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold</label>
              <input type="number" value={editItem.threshold || ''} onChange={e => setEditItem(p => ({ ...p, threshold: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actual Value</label>
              <input type="number" value={editItem.actualValue || ''} onChange={e => setEditItem(p => ({ ...p, actualValue: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={editItem.notes || ''} onChange={e => setEditItem(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.title} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            Create Alert
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Alert" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this alert?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
