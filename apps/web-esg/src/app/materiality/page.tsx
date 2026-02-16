'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Grid3X3, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface MaterialityTopic {
  id: string;
  topic: string;
  category: string;
  stakeholderImportance: number;
  businessImpact: number;
  priority: string;
  description: string;
  status: string;
}

type FormData = Omit<MaterialityTopic, 'id'>;

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const categoryColors: Record<string, string> = {
  ENVIRONMENTAL: 'bg-green-100 text-green-700',
  SOCIAL: 'bg-blue-100 text-blue-700',
  GOVERNANCE: 'bg-purple-100 text-purple-700',
  ECONOMIC: 'bg-amber-100 text-amber-700',
};

const empty: FormData = {
  topic: '',
  category: 'ENVIRONMENTAL',
  stakeholderImportance: 3,
  businessImpact: 3,
  priority: 'MEDIUM',
  description: '',
  status: 'ACTIVE',
};

export default function MaterialityPage() {
  const [topics, setTopics] = useState<MaterialityTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [view, setView] = useState<'table' | 'matrix'>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialityTopic | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadTopics(); }, []);

  async function loadTopics() {
    try {
      const res = await api.get('/materiality');
      setTopics(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(t: MaterialityTopic) {
    setEditing(t);
    setForm({ topic: t.topic, category: t.category, stakeholderImportance: t.stakeholderImportance, businessImpact: t.businessImpact, priority: t.priority, description: t.description, status: t.status });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/materiality/${editing.id}`, form);
        setTopics(prev => prev.map(t => t.id === editing.id ? res.data.data : t));
      } else {
        const res = await api.post('/materiality', form);
        setTopics(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/materiality/${id}`);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = topics.filter(t => {
    const matchesSearch = !searchTerm || JSON.stringify(t).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const high = topics.filter(t => t.priority === 'HIGH').length;
  const medium = topics.filter(t => t.priority === 'MEDIUM').length;
  const avgStakeholder = topics.length > 0 ? (topics.reduce((s, t) => s + (t.stakeholderImportance || 0), 0) / topics.length).toFixed(1) : '0';

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Materiality Matrix</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Identify and prioritise material ESG topics by stakeholder importance and business impact</p>
          </div>
          <div className="flex gap-3">
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('table')} className={`px-3 py-2 text-sm font-medium ${view === 'table' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50'}`}>Table</button>
              <button onClick={() => setView('matrix')} className={`px-3 py-2 text-sm font-medium ${view === 'matrix' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50'}`}>Matrix</button>
            </div>
            <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
              <Plus className="h-5 w-5" /> Add Topic
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Topics', value: topics.length, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'High Priority', value: high, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Medium Priority', value: medium, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Avg Stakeholder Score', value: `${avgStakeholder}/5`, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        {view === 'matrix' && topics.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-green-600" />Materiality Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="relative" style={{ height: '320px' }}>
                {/* Axes */}
                <div className="absolute left-0 bottom-0 top-0 w-8 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 -rotate-90 whitespace-nowrap">Business Impact</span>
                </div>
                <div className="absolute bottom-0 left-8 right-0 h-6 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Stakeholder Importance</span>
                </div>
                {/* Grid area */}
                <div className="absolute left-8 right-0 top-0 bottom-6 bg-gradient-to-tr from-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-2 text-xs text-gray-400 dark:text-gray-500">Monitor</div>
                  <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500 text-right">Manage Closely</div>
                  <div className="absolute bottom-2 left-2 text-xs text-gray-400 dark:text-gray-500">Low Priority</div>
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 text-right">Engage & Report</div>
                  {/* Topics plotted */}
                  {topics.map(t => {
                    const x = ((t.stakeholderImportance - 1) / 4) * 90 + 5;
                    const y = 100 - (((t.businessImpact - 1) / 4) * 90 + 5);
                    const dotColor = t.priority === 'HIGH' ? 'bg-red-500' : t.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                      <div key={t.id} title={t.topic} className="absolute group" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={`w-3 h-3 rounded-full ${dotColor} cursor-pointer ring-2 ring-white`} />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {t.topic}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                {[{ label: 'High', color: 'bg-red-500' }, { label: 'Medium', color: 'bg-yellow-500' }, { label: 'Low', color: 'bg-green-500' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${l.color}`} /><span className="text-xs text-gray-600">{l.label} Priority</span></div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" aria-label="Search topics..." placeholder="Search topics..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select aria-label="Filter by priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-green-600" />Materiality Topics ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Topic</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Stakeholder</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Business Impact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t.topic}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{t.description}</p>
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[t.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{t.category?.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {[1,2,3,4,5].map(n => <div key={n} className={`w-2 h-2 rounded-full ${n <= t.stakeholderImportance ? 'bg-blue-500' : 'bg-gray-200'}`} />)}
                            <span className="ml-1 text-xs font-medium">{t.stakeholderImportance}/5</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {[1,2,3,4,5].map(n => <div key={n} className={`w-2 h-2 rounded-full ${n <= t.businessImpact ? 'bg-green-500' : 'bg-gray-200'}`} />)}
                            <span className="ml-1 text-xs font-medium">{t.businessImpact}/5</span>
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColors[t.priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{t.priority}</span></td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${t.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{t.status}</span></td>
                        <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(t)} className="text-gray-400 dark:text-gray-500 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(t.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No materiality topics found</p>
                <p className="text-sm mt-1">Click "Add Topic" to begin your materiality assessment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Topic' : 'Add Materiality Topic'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Name *</label>
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Climate Change, Data Privacy" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
                <option value="ECONOMIC">Economic</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stakeholder Importance (1-5)</label>
              <input type="number" min="1" max="5" value={form.stakeholderImportance} onChange={e => setForm(f => ({ ...f, stakeholderImportance: parseInt(e.target.value) || 1 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Impact (1-5)</label>
              <input type="number" min="1" max="5" value={form.businessImpact} onChange={e => setForm(f => ({ ...f, businessImpact: parseInt(e.target.value) || 1 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe the topic and its relevance..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ARCHIVED">Archived</option>
            </select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.topic} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Topic'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Topic" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this materiality topic?</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
