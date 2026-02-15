'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, ShieldAlert, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface RiskItem {
  id: string;
  riskNumber: string;
  hazard: string;
  hazardousSituation: string;
  harm: string;
  severity: number;
  probability: number;
  riskLevel: string;
  status: string;
  mitigationMeasure: string;
  residualRiskLevel: string;
  deviceName: string;
  owner: string;
}

const RISK_LEVELS = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'UNACCEPTABLE'];
const STATUSES = ['OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED'];
const riskColor = (r: string) => r === 'NEGLIGIBLE' ? 'bg-green-100 text-green-700' : r === 'LOW' ? 'bg-blue-100 text-blue-700' : r === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : r === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
const statusColor = (s: string) => s === 'ACCEPTED' || s === 'CLOSED' ? 'bg-green-100 text-green-700' : s === 'MITIGATED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

const emptyForm = { hazard: '', hazardousSituation: '', harm: '', severity: 3, probability: 3, riskLevel: 'MEDIUM', status: 'OPEN', mitigationMeasure: '', residualRiskLevel: 'LOW', deviceName: '', owner: '' };

export default function RiskManagementPage() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<RiskItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/risk-management'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: RiskItem) {
    setEditItem(item);
    setForm({ hazard: item.hazard, hazardousSituation: item.hazardousSituation || '', harm: item.harm || '', severity: item.severity || 3, probability: item.probability || 3, riskLevel: item.riskLevel, status: item.status, mitigationMeasure: item.mitigationMeasure || '', residualRiskLevel: item.residualRiskLevel || 'LOW', deviceName: item.deviceName || '', owner: item.owner || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/risk-management/${editItem.id}`, form);
      else await api.post('/risk-management', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/risk-management/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchRisk = !riskFilter || item.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const stats = { total: items.length, open: items.filter(i => i.status === 'OPEN').length, high: items.filter(i => i.riskLevel === 'HIGH' || i.riskLevel === 'UNACCEPTABLE').length, closed: items.filter(i => i.status === 'CLOSED' || i.status === 'ACCEPTED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Management</h1><p className="text-gray-500 dark:text-gray-400 mt-1">ISO 14971 risk analysis — hazard identification and control</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Risk</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Risks', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Open', value: stats.open, color: 'text-yellow-700', bg: 'bg-yellow-100' },
            { label: 'High / Unacceptable', value: stats.high, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Closed / Accepted', value: stats.closed, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><ShieldAlert className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search risks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Risk Levels</option>{RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-teal-600" />Risk Register ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Hazard</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Harm</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">S</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">P</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Residual</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.riskNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{item.hazard}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">{item.harm || '-'}</td>
                    <td className="py-3 px-4 text-center font-mono text-sm">{item.severity}</td>
                    <td className="py-3 px-4 text-center font-mono text-sm">{item.probability}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${riskColor(item.riskLevel)}`}>{item.riskLevel}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${riskColor(item.residualRiskLevel || 'LOW')}`}>{item.residualRiskLevel || '-'}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No risks found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Risk' : 'Add Risk'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hazard *</label><input type="text" value={form.hazard} onChange={e => setForm({...form, hazard: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hazardous Situation</label><input type="text" value={form.hazardousSituation} onChange={e => setForm({...form, hazardousSituation: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harm</label><input type="text" value={form.harm} onChange={e => setForm({...form, harm: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity (1-5)</label><input type="number" min={1} max={5} value={form.severity} onChange={e => setForm({...form, severity: parseInt(e.target.value) || 1})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Probability (1-5)</label><input type="number" min={1} max={5} value={form.probability} onChange={e => setForm({...form, probability: parseInt(e.target.value) || 1})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level</label><select value={form.riskLevel} onChange={e => setForm({...form, riskLevel: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigation Measure</label><textarea value={form.mitigationMeasure} onChange={e => setForm({...form, mitigationMeasure: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Residual Risk Level</label><select value={form.residualRiskLevel} onChange={e => setForm({...form, residualRiskLevel: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.hazard || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Risk'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Risk?</h2>
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
