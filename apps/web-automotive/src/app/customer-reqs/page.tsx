'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Users, X, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface CustomerReq {
  id: string;
  reqNumber: string;
  customerName: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  owner: string;
  effectiveDate: string;
  reviewDate: string;
  createdAt: string;
}

const CATEGORIES = ['QUALITY_MANAGEMENT', 'PRODUCT_APPROVAL', 'DELIVERY', 'DOCUMENTATION', 'TRACEABILITY', 'SUPPLIER_MANAGEMENT', 'PRODUCTION', 'ENGINEERING'];
const STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'IMPLEMENTED', 'PENDING', 'EXPIRED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusColor = (s: string) => s === 'IMPLEMENTED' ? 'bg-green-100 text-green-700' : s === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : s === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' : s === 'EXPIRED' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700';
const priorityColor = (p: string) => p === 'CRITICAL' ? 'bg-red-100 text-red-700' : p === 'HIGH' ? 'bg-orange-100 text-orange-700' : p === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';

const emptyForm = { customerName: '', title: '', description: '', category: 'QUALITY_MANAGEMENT', status: 'ACTIVE', priority: 'MEDIUM', owner: '', effectiveDate: '', reviewDate: '' };

export default function CustomerReqsPage() {
  const [items, setItems] = useState<CustomerReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomerReq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/customer-reqs'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: CustomerReq) {
    setEditItem(item);
    setForm({ customerName: item.customerName, title: item.title, description: item.description || '', category: item.category, status: item.status, priority: item.priority || 'MEDIUM', owner: item.owner || '', effectiveDate: item.effectiveDate ? item.effectiveDate.slice(0, 10) : '', reviewDate: item.reviewDate ? item.reviewDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/customer-reqs/${editItem.id}`, form);
      else await api.post('/customer-reqs', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/customer-reqs/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const customers = [...new Set(items.map(i => i.customerName))].filter(Boolean);
  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchCustomer = !customerFilter || item.customerName === customerFilter;
    return matchSearch && matchCustomer;
  });

  const stats = { total: items.length, active: items.filter(i => i.status === 'ACTIVE').length, critical: items.filter(i => i.priority === 'CRITICAL' || i.priority === 'HIGH').length, pendingReview: items.filter(i => i.status === 'UNDER_REVIEW').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Customer Specific Requirements</h1><p className="text-gray-500 mt-1">IATF 16949 customer-specific requirements register</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Requirement</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Requirements', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-100', icon: Users },
            { label: 'Active', value: stats.active, color: 'text-blue-700', bg: 'bg-blue-100', icon: Users },
            { label: 'High/Critical', value: stats.critical, color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
            { label: 'Under Review', value: stats.pendingReview, color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Users },
          ].map(s => { const Icon = s.icon; return (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ); })}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search requirements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Customers</option>{customers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-orange-600" />Customer Requirements ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Req #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Review Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{item.reqNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.customerName}</td>
                    <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.category.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColor(item.priority)}`}>{item.priority}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No customer requirements found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Requirement' : 'Add Customer Requirement'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label><input type="date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label><input type="date" value={form.reviewDate} onChange={e => setForm({...form, reviewDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.customerName || !form.title || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Requirement'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Requirement?</h2>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
