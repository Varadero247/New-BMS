'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Hazard {
  id: string;
  name: string;
  type: string;
  description?: string;
  severity: string;
  likelihood: string;
  riskLevel: string;
  controls?: string;
  status: string;
  createdAt: string;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const initialForm = { name: '', type: 'BIOLOGICAL', description: '', severity: 'MEDIUM', likelihood: 'POSSIBLE', controls: '', status: 'IDENTIFIED' };

export default function HazardsPage() {
  const [items, setItems] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Hazard | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const res = await api.get('/hazards'); setItems(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(initialForm); setFormError(''); setModalOpen(true); }
  function openEdit(h: Hazard) {
    setEditing(h);
    setForm({ name: h.name, type: h.type, description: h.description || '', severity: h.severity, likelihood: h.likelihood, controls: h.controls || '', status: h.status });
    setFormError(''); setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true);
    try {
      if (editing) { await api.put(`/hazards/${editing.id}`, form); }
      else { await api.post('/hazards', form); }
      setModalOpen(false); load();
    } catch (e: any) { setFormError(e?.response?.data?.error?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this hazard?')) return;
    try { await api.delete(`/hazards/${id}`); load(); } catch (e: any) { alert(e?.response?.data?.error?.message || 'Failed'); }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (!typeFilter || i.type === typeFilter)
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Hazard Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">HACCP hazard identification and analysis</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Add Hazard
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['BIOLOGICAL','CHEMICAL','PHYSICAL','ALLERGENIC'].map(type => (
            <Card key={type}><CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{type}</p><p className="text-2xl font-bold">{items.filter(i => i.type === type).length}</p></div>
                <AlertTriangle className={`h-8 w-8 ${type === 'BIOLOGICAL' ? 'text-blue-500' : type === 'CHEMICAL' ? 'text-red-500' : type === 'PHYSICAL' ? 'text-gray-500 dark:text-gray-400' : 'text-orange-500'}`} />
              </div>
            </CardContent></Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" aria-label="Search hazards..." placeholder="Search hazards..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
              <option value="">All Types</option>
              <option value="BIOLOGICAL">Biological</option>
              <option value="CHEMICAL">Chemical</option>
              <option value="PHYSICAL">Physical</option>
              <option value="ALLERGENIC">Allergenic</option>
            </select>
          </div>
        </CardContent></Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Hazards ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Likelihood</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(h => (
                      <tr key={h.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{h.name}</p>
                          {h.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{h.description}</p>}
                        </td>
                        <td className="py-3 px-4"><Badge variant="outline">{h.type}</Badge></td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityColors[h.severity] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{h.severity}</span></td>
                        <td className="py-3 px-4 text-gray-600">{h.likelihood}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityColors[h.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{h.riskLevel}</span></td>
                        <td className="py-3 px-4"><Badge className={h.status === 'CONTROLLED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{h.status}</Badge></td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(h)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No hazards found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Hazard</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Hazard' : 'Add Hazard'} size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Hazard Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="BIOLOGICAL">Biological</option>
                <option value="CHEMICAL">Chemical</option>
                <option value="PHYSICAL">Physical</option>
                <option value="ALLERGENIC">Allergenic</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="IDENTIFIED">Identified</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="CONTROLLED">Controlled</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Likelihood</label>
              <select value={form.likelihood} onChange={e => setForm({...form, likelihood: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="RARE">Rare</option>
                <option value="UNLIKELY">Unlikely</option>
                <option value="POSSIBLE">Possible</option>
                <option value="LIKELY">Likely</option>
                <option value="ALMOST_CERTAIN">Almost Certain</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Control Measures</label>
            <textarea value={form.controls} onChange={e => setForm({...form, controls: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
