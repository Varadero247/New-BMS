'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, UserCheck, Pencil, Trash2, Users, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  category: string;
  influence: string;
  interest: string;
  engagementMethod: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  engagementFrequency?: string;
  notes?: string;
  status: string;
}

type FormData = Omit<Stakeholder, 'id'>;

const influenceColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const interestColors: Record<string, string> = {
  HIGH: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const categoryColors: Record<string, string> = {
  INVESTOR: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
  SUPPLIER: 'bg-orange-100 text-orange-700',
  REGULATOR: 'bg-red-100 text-red-700',
  COMMUNITY: 'bg-emerald-100 text-emerald-700',
  NGO: 'bg-teal-100 text-teal-700',
  MEDIA: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const empty: FormData = {
  name: '',
  type: 'EXTERNAL',
  category: 'INVESTOR',
  influence: 'MEDIUM',
  interest: 'MEDIUM',
  engagementMethod: '',
  contactPerson: '',
  email: '',
  phone: '',
  engagementFrequency: 'QUARTERLY',
  notes: '',
  status: 'ACTIVE',
};

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [influenceFilter, setInfluenceFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stakeholder | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadStakeholders(); }, []);

  async function loadStakeholders() {
    try {
      const res = await api.get('/stakeholders');
      setStakeholders(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(s: Stakeholder) {
    setEditing(s);
    setForm({ name: s.name, type: s.type, category: s.category, influence: s.influence, interest: s.interest, engagementMethod: s.engagementMethod, contactPerson: s.contactPerson, email: s.email || '', phone: s.phone || '', engagementFrequency: s.engagementFrequency || 'QUARTERLY', notes: s.notes || '', status: s.status });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/stakeholders/${editing.id}`, form);
        setStakeholders(prev => prev.map(s => s.id === editing.id ? res.data.data : s));
      } else {
        const res = await api.post('/stakeholders', form);
        setStakeholders(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/stakeholders/${id}`);
      setStakeholders(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = stakeholders.filter(s => {
    const matchesSearch = !searchTerm || JSON.stringify(s).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    const matchesInfluence = !influenceFilter || s.influence === influenceFilter;
    return matchesSearch && matchesCategory && matchesInfluence;
  });

  const active = stakeholders.filter(s => s.status === 'ACTIVE').length;
  const highInfluence = stakeholders.filter(s => s.influence === 'HIGH').length;
  const categories = [...new Set(stakeholders.map(s => s.category))].length;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stakeholders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage stakeholder engagement, influence mapping, and communication strategies</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Stakeholder
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Stakeholders', value: stakeholders.length, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'Active', value: active, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'High Influence', value: highInfluence, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Categories', value: categories, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search stakeholders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Categories</option>
              <option value="INVESTOR">Investor</option>
              <option value="CUSTOMER">Customer</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="REGULATOR">Regulator</option>
              <option value="COMMUNITY">Community</option>
              <option value="NGO">NGO</option>
              <option value="MEDIA">Media</option>
            </select>
            <select value={influenceFilter} onChange={e => setInfluenceFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Influence Levels</option>
              <option value="HIGH">High Influence</option>
              <option value="MEDIUM">Medium Influence</option>
              <option value="LOW">Low Influence</option>
            </select>
          </div>
        </CardContent></Card>

        {/* Influence / Interest Matrix Preview */}
        {stakeholders.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Manage Closely', sub: 'High influence, High interest', influence: 'HIGH', interest: 'HIGH', color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
              { label: 'Keep Satisfied', sub: 'High influence, Low interest', influence: 'HIGH', interest: 'LOW', color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
              { label: 'Keep Informed', sub: 'Low influence, High interest', influence: 'LOW', interest: 'HIGH', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
              { label: 'Monitor', sub: 'Low influence, Low interest', influence: 'LOW', interest: 'LOW', color: 'border-gray-200 dark:border-gray-700 bg-gray-50', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
            ].map(quadrant => {
              const count = stakeholders.filter(s => s.influence === quadrant.influence && s.interest === quadrant.interest).length;
              return (
                <div key={quadrant.label} className={`border rounded-xl p-3 ${quadrant.color}`}>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${quadrant.badge}`}>{count} stakeholders</span>
                  <p className="font-semibold text-gray-800 mt-2 text-sm">{quadrant.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{quadrant.sub}</p>
                </div>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-600" />Stakeholders ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Influence</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Interest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Engagement</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{s.type}</p>
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[s.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{s.category}</span></td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${influenceColors[s.influence] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{s.influence}</span></td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${interestColors[s.interest] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{s.interest}</span></td>
                        <td className="py-3 px-4 text-gray-600">
                          <p>{s.engagementMethod}</p>
                          {s.engagementFrequency && <p className="text-xs text-gray-400 dark:text-gray-500">{s.engagementFrequency}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <p className="font-medium">{s.contactPerson}</p>
                          {s.email && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">{s.email}</p>}
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{s.status}</span></td>
                        <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(s)} className="text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(s.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No stakeholders found</p>
                <p className="text-sm mt-1">Click "Add Stakeholder" to map your first stakeholder</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Stakeholder' : 'Add Stakeholder'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Organisation or individual name" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="INVESTOR">Investor</option>
                <option value="CUSTOMER">Customer</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="REGULATOR">Regulator</option>
                <option value="COMMUNITY">Community</option>
                <option value="NGO">NGO</option>
                <option value="MEDIA">Media</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Influence</label>
              <select value={form.influence} onChange={e => setForm(f => ({ ...f, influence: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest</label>
              <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Primary contact name" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="contact@example.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engagement Method</label>
              <input value={form.engagementMethod} onChange={e => setForm(f => ({ ...f, engagementMethod: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Quarterly meetings, Surveys" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engagement Frequency</label>
              <select value={form.engagementFrequency} onChange={e => setForm(f => ({ ...f, engagementFrequency: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="AD_HOC">Ad Hoc</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+1 555 000 0000" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Key interests, concerns, or engagement notes..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Stakeholder'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Stakeholder" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to remove this stakeholder? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Remove</button>
        </div>
      </Modal>
    </div>
  );
}
