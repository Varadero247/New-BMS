'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, FileText, Download, Pencil, Trash2, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface Report {
  id: string;
  title: string;
  type: string;
  framework: string;
  period: string;
  status: string;
  generatedAt: string;
  generatedBy: string;
  description?: string;
}

type FormData = Omit<Report, 'id' | 'generatedAt'>;

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const frameworkColors: Record<string, string> = {
  GRI: 'bg-green-100 text-green-700',
  TCFD: 'bg-blue-100 text-blue-700',
  SASB: 'bg-purple-100 text-purple-700',
  CDP: 'bg-emerald-100 text-emerald-700',
  CSRD: 'bg-orange-100 text-orange-700',
  SFDR: 'bg-indigo-100 text-indigo-700',
  CUSTOM: 'bg-gray-100 text-gray-700',
};

const empty: FormData = {
  title: '',
  type: 'ANNUAL',
  framework: 'GRI',
  period: '',
  status: 'DRAFT',
  generatedBy: '',
  description: '',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    try {
      const res = await api.get('/reports');
      setReports(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(r: Report) {
    setEditing(r);
    setForm({ title: r.title, type: r.type, framework: r.framework, period: r.period, status: r.status, generatedBy: r.generatedBy, description: r.description || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/reports/${editing.id}`, form);
        setReports(prev => prev.map(r => r.id === editing.id ? res.data.data : r));
      } else {
        const res = await api.post('/reports', form);
        setReports(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = reports.filter(r => {
    const matchesSearch = !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesFramework = !frameworkFilter || r.framework === frameworkFilter;
    return matchesSearch && matchesStatus && matchesFramework;
  });

  const published = reports.filter(r => r.status === 'PUBLISHED').length;
  const drafts = reports.filter(r => r.status === 'DRAFT').length;
  const frameworks = [...new Set(reports.map(r => r.framework))].length;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ESG Reports</h1>
            <p className="text-gray-500 mt-1">Generate and manage ESG disclosure reports across frameworks</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Generate Report
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Reports', value: reports.length, color: 'text-gray-800', bg: 'bg-gray-50' },
            { label: 'Published', value: published, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Drafts', value: drafts, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Frameworks Used', value: frameworks, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={frameworkFilter} onChange={e => setFrameworkFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Frameworks</option>
              <option value="GRI">GRI</option>
              <option value="TCFD">TCFD</option>
              <option value="SASB">SASB</option>
              <option value="CDP">CDP</option>
              <option value="CSRD">CSRD</option>
              <option value="SFDR">SFDR</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />Reports ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Framework</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Generated</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{r.title}</p>
                          <p className="text-xs text-gray-400">{r.generatedBy}</p>
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${frameworkColors[r.framework] || 'bg-gray-100 text-gray-700'}`}>{r.framework}</span></td>
                        <td className="py-3 px-4 text-gray-600">{r.type?.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-gray-600">{r.period}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status?.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-4 text-gray-600">{r.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Download"><Download className="h-4 w-4" /></button>
                          {r.status === 'DRAFT' && <button className="text-gray-400 hover:text-green-600 transition-colors" title="Publish"><Send className="h-4 w-4" /></button>}
                          <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No reports found</p>
                <p className="text-sm mt-1">Click "Generate Report" to create your first ESG report</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Report' : 'Generate ESG Report'} size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Report Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Annual Sustainability Report 2025" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ANNUAL">Annual Report</option>
                <option value="QUARTERLY">Quarterly Report</option>
                <option value="INTERIM">Interim Report</option>
                <option value="DISCLOSURE">Regulatory Disclosure</option>
                <option value="BENCHMARK">Benchmarking Report</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
              <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="GRI">GRI Standards</option>
                <option value="TCFD">TCFD</option>
                <option value="SASB">SASB</option>
                <option value="CDP">CDP</option>
                <option value="CSRD">CSRD</option>
                <option value="SFDR">SFDR</option>
                <option value="CUSTOM">Custom</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Reporting Period</label>
              <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. FY 2025, Q1 2026" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prepared By</label>
              <input value={form.generatedBy} onChange={e => setForm(f => ({ ...f, generatedBy: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Name or team" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="PUBLISHED">Published</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Report scope and summary..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Report'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Report" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
