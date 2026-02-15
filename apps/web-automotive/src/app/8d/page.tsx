'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FileText, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Report8D {
  id: string;
  reportNumber: string;
  title: string;
  customerName: string;
  partNumber: string;
  severity: string;
  status: string;
  openDate: string;
  closedDate: string;
  owner: string;
  d3Team: string;
  d4RootCause: string;
  d5Actions: string;
  createdAt: string;
}

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'D1_TEAM', 'D2_PROBLEM', 'D3_INTERIM', 'D4_ROOT_CAUSE', 'D5_ACTIONS', 'D6_VERIFY', 'D7_PREVENT', 'D8_CLOSED'];
const statusColor = (s: string) => s === 'D8_CLOSED' ? 'bg-green-100 text-green-700' : s === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';
const sevColor = (s: string) => s === 'CRITICAL' ? 'bg-red-100 text-red-700' : s === 'HIGH' ? 'bg-orange-100 text-orange-700' : s === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
const getPhase = (s: string) => { const phases: Record<string, string> = { 'OPEN': 'Open', 'D1_TEAM': 'D1: Team', 'D2_PROBLEM': 'D2: Problem', 'D3_INTERIM': 'D3: Interim', 'D4_ROOT_CAUSE': 'D4: Root Cause', 'D5_ACTIONS': 'D5: Actions', 'D6_VERIFY': 'D6: Verify', 'D7_PREVENT': 'D7: Prevent', 'D8_CLOSED': 'D8: Closed' }; return phases[s] || s; };

const emptyForm = { title: '', customerName: '', partNumber: '', severity: 'HIGH', status: 'OPEN', openDate: new Date().toISOString().slice(0, 10), closedDate: '', owner: '', d3Team: '', d4RootCause: '', d5Actions: '' };

export default function EightDPage() {
  const [items, setItems] = useState<Report8D[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Report8D | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/8d'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: Report8D) {
    setEditItem(item);
    setForm({ title: item.title, customerName: item.customerName || '', partNumber: item.partNumber || '', severity: item.severity, status: item.status, openDate: item.openDate ? item.openDate.slice(0, 10) : '', closedDate: item.closedDate ? item.closedDate.slice(0, 10) : '', owner: item.owner || '', d3Team: item.d3Team || '', d4RootCause: item.d4RootCause || '', d5Actions: item.d5Actions || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/8d/${editItem.id}`, form);
      else await api.post('/8d', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/8d/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, open: items.filter(i => i.status !== 'D8_CLOSED').length, critical: items.filter(i => i.severity === 'CRITICAL').length, closed: items.filter(i => i.status === 'D8_CLOSED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">8D Problem Solving</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Eight Disciplines corrective action reports</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New 8D Report</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Reports', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Open', value: stats.open, color: 'text-orange-700', bg: 'bg-orange-100' },
            { label: 'Critical', value: stats.critical, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Closed', value: stats.closed, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><FileText className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search 8D reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Phases</option>{STATUSES.map(s => <option key={s} value={s}>{getPhase(s)}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-orange-600" />8D Reports ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Report #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phase</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Opened</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.reportNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                    <td className="py-3 px-4 text-gray-600">{item.customerName || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sevColor(item.severity)}`}>{item.severity}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{getPhase(item.status)}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.owner || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.openDate ? new Date(item.openDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><FileText className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No 8D reports found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit 8D Report' : 'New 8D Report'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Problem Statement *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number</label><input type="text" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phase</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{getPhase(s)}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Open Date</label><input type="date" value={form.openDate} onChange={e => setForm({...form, openDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">D3: Team Members</label><input type="text" value={form.d3Team} onChange={e => setForm({...form, d3Team: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">D4: Root Cause</label><textarea value={form.d4RootCause} onChange={e => setForm({...form, d4RootCause: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">D5: Corrective Actions</label><textarea value={form.d5Actions} onChange={e => setForm({...form, d5Actions: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create 8D'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete 8D Report?</h2>
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
