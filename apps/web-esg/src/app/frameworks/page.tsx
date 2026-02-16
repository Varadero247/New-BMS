'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Search, BookOpen, Pencil, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
  coverage: number;
  lastAssessed: string;
  requirements: number;
  metRequirements: number;
  website?: string;
}

type FormData = Omit<Framework, 'id'>;

const frameworkData = [
  { name: 'GRI Standards', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', description: 'Global Reporting Initiative - most widely used ESG reporting framework' },
  { name: 'TCFD', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', description: 'Task Force on Climate-related Financial Disclosures' },
  { name: 'SASB', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', description: 'Sustainability Accounting Standards Board' },
  { name: 'CDP', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', description: 'Carbon Disclosure Project' },
  { name: 'CSRD', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', description: 'Corporate Sustainability Reporting Directive (EU)' },
  { name: 'SFDR', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', description: 'Sustainable Finance Disclosure Regulation (EU)' },
];

const empty: FormData = {
  name: '',
  version: '',
  description: '',
  status: 'ACTIVE',
  coverage: 0,
  lastAssessed: new Date().toISOString().split('T')[0],
  requirements: 0,
  metRequirements: 0,
  website: '',
};

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Framework | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFrameworks(); }, []);

  async function loadFrameworks() {
    try {
      const res = await api.get('/frameworks');
      setFrameworks(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openEdit(f: Framework) {
    setEditing(f);
    setForm({ name: f.name, version: f.version, description: f.description, status: f.status, coverage: f.coverage, lastAssessed: f.lastAssessed?.split('T')[0] || '', requirements: f.requirements, metRequirements: f.metRequirements, website: f.website || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/frameworks/${editing.id}`, form);
        setFrameworks(prev => prev.map(fw => fw.id === editing.id ? res.data.data : fw));
      } else {
        const res = await api.post('/frameworks', form);
        setFrameworks(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const filtered = frameworks.filter(f => !searchTerm || JSON.stringify(f).toLowerCase().includes(searchTerm.toLowerCase()));
  const active = frameworks.filter(f => f.status === 'ACTIVE').length;
  const avgCoverage = frameworks.length > 0 ? Math.round(frameworks.reduce((s, f) => s + (f.coverage || 0), 0) / frameworks.length) : 0;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ESG Frameworks</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage reporting frameworks, standards coverage, and compliance assessments</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Frameworks Tracked', value: frameworks.length, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'Active', value: active, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Avg Coverage', value: `${avgCoverage}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Available Frameworks', value: frameworkData.length, color: 'text-purple-700', bg: 'bg-purple-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Available Frameworks Info Cards */}
        {frameworks.length === 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Available ESG Frameworks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frameworkData.map(fw => (
                <div key={fw.name} className={`border rounded-xl p-4 ${fw.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${fw.badge}`}>{fw.name}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">{fw.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search frameworks..." placeholder="Search frameworks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-600" />Frameworks ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Framework</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Coverage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Requirements</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Assessed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(fw => (
                      <tr key={fw.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{fw.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{fw.description}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{fw.version}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${fw.coverage || 0}%` }} /></div>
                            <span className="text-xs font-medium">{fw.coverage || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="font-medium text-green-700">{fw.metRequirements || 0}</span>
                          <span className="text-gray-400 dark:text-gray-500"> / {fw.requirements || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{fw.lastAssessed ? new Date(fw.lastAssessed).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${fw.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{fw.status}</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => openEdit(fw)} className="text-gray-400 dark:text-gray-500 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No frameworks configured</p>
                <p className="text-sm mt-1">Contact your ESG team to configure reporting frameworks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Framework Assessment" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Framework Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 2021, 2.1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coverage %</label>
              <input type="number" min="0" max="100" value={form.coverage} onChange={e => setForm(f => ({ ...f, coverage: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Requirements</label>
              <input type="number" value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: parseInt(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Met Requirements</label>
              <input type="number" value={form.metRequirements} onChange={e => setForm(f => ({ ...f, metRequirements: parseInt(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Assessed</label>
              <input type="date" value={form.lastAssessed} onChange={e => setForm(f => ({ ...f, lastAssessed: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PLANNED">Planned</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
