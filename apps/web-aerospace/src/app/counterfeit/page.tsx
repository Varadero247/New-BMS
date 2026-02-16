'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, AlertOctagon, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CounterfeitPart {
  id: string;
  reportNumber: string;
  partNumber: string;
  partName: string;
  suspectedSource: string;
  riskLevel: string;
  status: string;
  detectionMethod: string;
  reportedBy: string;
  quantity: number;
  dispositionAction: string;
  createdAt: string;
}

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['REPORTED', 'UNDER_INVESTIGATION', 'CONFIRMED', 'CLEARED', 'QUARANTINED', 'DISPOSED'];
const DETECTION_METHODS = ['VISUAL_INSPECTION', 'TESTING', 'DOCUMENTATION_REVIEW', 'SUPPLIER_ALERT', 'INDUSTRY_NOTIFICATION'];
const riskColor = (r: string) => r === 'CRITICAL' ? 'bg-red-100 text-red-700' : r === 'HIGH' ? 'bg-orange-100 text-orange-700' : r === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
const statusColor = (s: string) => s === 'CLEARED' || s === 'DISPOSED' ? 'bg-green-100 text-green-700' : s === 'CONFIRMED' || s === 'QUARANTINED' ? 'bg-red-100 text-red-700' : s === 'UNDER_INVESTIGATION' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

const emptyForm = { partNumber: '', partName: '', suspectedSource: '', riskLevel: 'HIGH', status: 'REPORTED', detectionMethod: 'VISUAL_INSPECTION', reportedBy: '', quantity: 1, dispositionAction: '' };

export default function CounterfeitPartsPage() {
  const [items, setItems] = useState<CounterfeitPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CounterfeitPart | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/counterfeit'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: CounterfeitPart) {
    setEditItem(item);
    setForm({ partNumber: item.partNumber, partName: item.partName, suspectedSource: item.suspectedSource || '', riskLevel: item.riskLevel, status: item.status, detectionMethod: item.detectionMethod, reportedBy: item.reportedBy || '', quantity: item.quantity || 1, dispositionAction: item.dispositionAction || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/counterfeit/${editItem.id}`, form);
      else await api.post('/counterfeit', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/counterfeit/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchRisk = !riskFilter || item.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const stats = { total: items.length, confirmed: items.filter(i => i.status === 'CONFIRMED').length, quarantined: items.filter(i => i.status === 'QUARANTINED').length, critical: items.filter(i => i.riskLevel === 'CRITICAL' || i.riskLevel === 'HIGH').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Counterfeit Parts Prevention</h1><p className="text-gray-500 dark:text-gray-400 mt-1">AS9100D counterfeit parts detection and control</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Report Suspect Part</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Reports', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Confirmed Counterfeit', value: stats.confirmed, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'In Quarantine', value: stats.quarantined, color: 'text-orange-700', bg: 'bg-orange-100' },
            { label: 'High/Critical Risk', value: stats.critical, color: 'text-red-700', bg: 'bg-red-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><AlertOctagon className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search reports..." placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by risk level" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Risk Levels</option>{RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-indigo-600" />Suspect/Counterfeit Part Reports ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Report #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Part Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Part Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Qty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Detection Method</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.reportNumber}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">{item.partNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.partName}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${riskColor(item.riskLevel)}`}>{item.riskLevel}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.detectionMethod.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><AlertOctagon className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No counterfeit part reports found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Update Report' : 'Report Suspect/Counterfeit Part'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number *</label><input type="text" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Name *</label><input type="text" value={form.partName} onChange={e => setForm({...form, partName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level</label><select value={form.riskLevel} onChange={e => setForm({...form, riskLevel: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detection Method</label><select value={form.detectionMethod} onChange={e => setForm({...form, detectionMethod: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{DETECTION_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suspected Source</label><input type="text" value={form.suspectedSource} onChange={e => setForm({...form, suspectedSource: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reported By</label><input type="text" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disposition Action</label><textarea value={form.dispositionAction} onChange={e => setForm({...form, dispositionAction: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.partNumber || !form.partName || saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Update' : 'Submit Report'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Report?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
