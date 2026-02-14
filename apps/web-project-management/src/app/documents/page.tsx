'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, FileText, Edit, Trash2, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface Document {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  projectId?: string;
  projectName?: string;
  version?: string;
  author?: string;
  approvedBy?: string;
  fileUrl?: string;
  fileName?: string;
  tags?: string;
  status: string;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  PLAN: 'bg-blue-100 text-blue-700',
  REPORT: 'bg-green-100 text-green-700',
  SPECIFICATION: 'bg-purple-100 text-purple-700',
  CHARTER: 'bg-orange-100 text-orange-700',
  MINUTES: 'bg-yellow-100 text-yellow-700',
  RISK_LOG: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  SUPERSEDED: 'bg-gray-100 text-gray-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const initialForm = {
  title: '', description: '', type: 'PLAN', category: '', projectName: '',
  version: '1.0', author: '', approvedBy: '', tags: '', status: 'DRAFT',
};

export default function DocumentsPage() {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/documents${params}`);
      setItems(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(initialForm); setFormError(''); setModalOpen(true); }
  function openEdit(d: Document) {
    setEditing(d);
    setForm({
      title: d.title || d.name || '',
      description: d.description || '',
      type: d.type || d.category || 'PLAN',
      category: d.category || '',
      projectName: d.projectName || '',
      version: d.version || '1.0',
      author: d.author || '',
      approvedBy: d.approvedBy || '',
      tags: d.tags || '',
      status: d.status,
    });
    setFormError(''); setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.title.trim()) { setFormError('Document title is required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, type: form.type, status: form.status };
      if (form.description) payload.description = form.description;
      if (form.projectName) payload.projectName = form.projectName;
      if (form.version) payload.version = form.version;
      if (form.author) payload.author = form.author;
      if (form.approvedBy) payload.approvedBy = form.approvedBy;
      if (form.tags) payload.tags = form.tags;
      if (editing) { await api.put(`/documents/${editing.id}`, payload); }
      else { await api.post('/documents', payload); }
      setModalOpen(false); load();
    } catch (e: any) { setFormError(e?.response?.data?.error?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${id}`); load(); } catch { alert('Failed'); }
  }

  const filtered = items.filter(i => {
    const title = i.title || i.name || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || (i.author || '').toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || (i.type || i.category || '') === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500 mt-1">Project document library and version control</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Document</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Documents</p><p className="text-2xl font-bold">{items.length}</p></div><FileText className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Approved</p><p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'APPROVED').length}</p></div><FileText className="h-8 w-8 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Drafts</p><p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.status === 'DRAFT').length}</p></div><FileText className="h-8 w-8 text-yellow-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Under Review</p><p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'UNDER_REVIEW').length}</p></div><FileText className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All Types</option>
              <option value="PLAN">Plan</option>
              <option value="REPORT">Report</option>
              <option value="SPECIFICATION">Specification</option>
              <option value="CHARTER">Charter</option>
              <option value="MINUTES">Minutes</option>
              <option value="RISK_LOG">Risk Log</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="SUPERSEDED">Superseded</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Documents ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Author</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr key={d.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{d.title || d.name || '—'}</p>
                          {d.description && <p className="text-xs text-gray-500 truncate max-w-xs">{d.description}</p>}
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColors[d.type || d.category || ''] || 'bg-gray-100 text-gray-700'}`}>{(d.type || d.category || '—').replace(/_/g,' ')}</span></td>
                        <td className="py-3 px-4 text-gray-600">{d.projectName || '—'}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">v{d.version || '1.0'}</td>
                        <td className="py-3 px-4 text-gray-500">{d.author || '—'}</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[d.status] || 'bg-gray-100 text-gray-700'}`}>{d.status.replace(/_/g,' ')}</span></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2">
                          {d.fileUrl && <Button variant="ghost" size="sm" onClick={() => window.open(d.fileUrl, '_blank')}><Download className="h-4 w-4" /></Button>}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No documents found</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Document</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Document' : 'Add Document'} size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Document Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Project Charter v1.0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="PLAN">Plan</option>
                <option value="REPORT">Report</option>
                <option value="SPECIFICATION">Specification</option>
                <option value="CHARTER">Charter</option>
                <option value="MINUTES">Minutes</option>
                <option value="RISK_LOG">Risk Log</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="SUPERSEDED">Superseded</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <input value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" placeholder="1.0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input value={form.author} onChange={e => setForm({...form, author: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Approved By</label>
              <input value={form.approvedBy} onChange={e => setForm({...form, approvedBy: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. planning, phase-1, stakeholder" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
