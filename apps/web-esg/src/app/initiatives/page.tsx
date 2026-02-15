'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Modal } from '@ims/ui';
import {
  Leaf, TrendingUp, DollarSign, Clock, CheckCircle, AlertTriangle,
  ChevronDown, ChevronRight, Search, Plus, Pencil, Trash2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Initiative {
  id: string;
  name: string;
  description?: string;
  pillar: string;
  priority: string;
  status: string;
  owner: string;
  startDate?: string;
  targetDate?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  sdgs?: number[];
  tags?: string[];
}

type FormData = Omit<Initiative, 'id' | 'sdgs' | 'tags'> & { sdgList: string; tagList: string };

const statusConfig: Record<string, { label: string; color: string }> = {
  PLANNED: { label: 'Planned', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  ON_HOLD: { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
};

const pillarConfig: Record<string, { label: string; color: string; prog: string }> = {
  ENVIRONMENTAL: { label: 'Environmental', color: 'bg-green-100 text-green-700', prog: 'bg-green-500' },
  SOCIAL: { label: 'Social', color: 'bg-blue-100 text-blue-700', prog: 'bg-blue-500' },
  GOVERNANCE: { label: 'Governance', color: 'bg-purple-100 text-purple-700', prog: 'bg-purple-500' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  LOW: { label: 'Low', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
};

const empty: FormData = {
  name: '',
  description: '',
  pillar: 'ENVIRONMENTAL',
  priority: 'HIGH',
  status: 'PLANNED',
  owner: '',
  startDate: new Date().toISOString().split('T')[0],
  targetDate: '',
  budget: 0,
  spent: 0,
  progress: 0,
  sdgList: '',
  tagList: '',
};

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [pillarFilter, setPillarFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadInitiatives(); }, []);

  async function loadInitiatives() {
    try {
      const res = await api.get('/initiatives');
      setInitiatives(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(ini: Initiative) {
    setEditing(ini);
    setForm({
      name: ini.name,
      description: ini.description || '',
      pillar: ini.pillar,
      priority: ini.priority,
      status: ini.status,
      owner: ini.owner,
      startDate: ini.startDate?.split('T')[0] || '',
      targetDate: ini.targetDate?.split('T')[0] || '',
      budget: ini.budget || 0,
      spent: ini.spent || 0,
      progress: ini.progress || 0,
      sdgList: (ini.sdgs || []).join(', '),
      tagList: (ini.tags || []).join(', '),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sdgs: form.sdgList ? form.sdgList.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [],
        tags: form.tagList ? form.tagList.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editing) {
        const res = await api.put(`/initiatives/${editing.id}`, payload);
        setInitiatives(prev => prev.map(i => i.id === editing.id ? res.data.data : i));
      } else {
        const res = await api.post('/initiatives', payload);
        setInitiatives(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/initiatives/${id}`);
      setInitiatives(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const filtered = initiatives.filter(i => {
    const matchesStatus = !statusFilter || i.status === statusFilter;
    const matchesPillar = !pillarFilter || i.pillar === pillarFilter;
    const matchesSearch = !searchTerm || JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPillar && matchesSearch;
  });

  const totalBudget = initiatives.reduce((s, i) => s + (i.budget || 0), 0);
  const totalSpent = initiatives.reduce((s, i) => s + (i.spent || 0), 0);
  const completedCount = initiatives.filter(i => i.status === 'COMPLETED').length;
  const avgProgress = initiatives.length > 0 ? Math.round(initiatives.reduce((s, i) => s + (i.progress || 0), 0) / initiatives.length) : 0;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ESG Initiatives</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track sustainability improvement projects across Environmental, Social and Governance pillars</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors text-sm">
          <Plus className="h-4 w-4" /> New Initiative
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Initiatives</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{initiatives.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Avg Progress</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{avgProgress}%</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Budget</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {totalBudget >= 1000000 ? `£${(totalBudget / 1000000).toFixed(1)}M` : totalBudget >= 1000 ? `£${(totalBudget / 1000).toFixed(0)}k` : `£${totalBudget}`}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Budget Spent</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">
            {totalSpent >= 1000000 ? `£${(totalSpent / 1000000).toFixed(1)}M` : totalSpent >= 1000 ? `£${(totalSpent / 1000).toFixed(0)}k` : `£${totalSpent}`}
          </p>
          {totalBudget > 0 && <p className="text-xs text-gray-400 dark:text-gray-500">{Math.round((totalSpent / totalBudget) * 100)}% utilised</p>}
        </div>
      </div>

      {/* Pillar Summary — clickable filter */}
      {initiatives.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']).map(p => {
            const pillarInits = initiatives.filter(i => i.pillar === p);
            if (pillarInits.length === 0) return null;
            const pillarProgress = Math.round(pillarInits.reduce((s, i) => s + (i.progress || 0), 0) / pillarInits.length);
            const cfg = pillarConfig[p] || { label: p, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700', prog: 'bg-gray-500' };
            return (
              <button key={p} onClick={() => setPillarFilter(pillarFilter === p ? '' : p)}
                className={`bg-white dark:bg-gray-900 border rounded-xl p-4 text-left transition-colors ${pillarFilter === p ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-sm font-medium text-gray-600">{pillarInits.length} initiatives</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>Progress</span><span>{pillarProgress}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${cfg.prog}`} style={{ width: `${pillarProgress}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search initiatives, tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2">
          {[{ v: '', l: 'All' }, { v: 'IN_PROGRESS', l: 'In Progress' }, { v: 'PLANNED', l: 'Planned' }, { v: 'COMPLETED', l: 'Completed' }, { v: 'ON_HOLD', l: 'On Hold' }].map(s => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s.v ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>{s.l}</button>
          ))}
        </div>
      </div>

      {/* Initiatives List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(ini => {
            const isExpanded = expanded.has(ini.id);
            const budgetPct = ini.budget && ini.budget > 0 ? Math.round(((ini.spent || 0) / ini.budget) * 100) : 0;
            const prog = ini.progress || 0;
            const cfg = pillarConfig[ini.pillar] || { label: ini.pillar, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700', prog: 'bg-gray-500' };
            const priCfg = priorityConfig[ini.priority] || { label: ini.priority, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' };
            const stCfg = statusConfig[ini.status] || { label: ini.status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };
            return (
              <div key={ini.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center w-full p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                  <button onClick={() => toggleExpand(ini.id)} className="mr-3 flex-shrink-0">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(ini.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{ini.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priCfg.color}`}>{priCfg.label}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stCfg.color}`}>{stCfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{ini.owner}{ini.targetDate ? ` · Due ${new Date(ini.targetDate).toLocaleDateString()}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="w-24 hidden sm:block">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{prog}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${prog === 100 ? 'bg-green-500' : prog >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(ini)} className="text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors p-1"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(ini.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                    {ini.description && <p className="text-sm text-gray-600">{ini.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ini.budget != null && ini.budget > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Budget</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {ini.budget >= 1000000 ? `£${(ini.budget / 1000000).toFixed(1)}M` : `£${(ini.budget / 1000).toFixed(0)}k`}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {ini.spent && ini.spent >= 1000 ? `£${(ini.spent / 1000).toFixed(0)}k` : `£${ini.spent || 0}`} spent ({budgetPct}%)
                          </p>
                        </div>
                      )}
                      {(ini.sdgs || []).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">SDG Alignment</p>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {(ini.sdgs || []).map(s => (
                              <span key={s} className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Timeline</p>
                        {ini.startDate && <p className="text-xs text-gray-600">Start: {new Date(ini.startDate).toLocaleDateString()}</p>}
                        {ini.targetDate && <p className="text-xs text-gray-600">Target: {new Date(ini.targetDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    {(ini.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(ini.tags || []).map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded text-xs">{t}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center text-gray-500 dark:text-gray-400">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No initiatives found</p>
          <p className="text-sm mt-1">Click "New Initiative" to create your first ESG initiative</p>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Initiative' : 'New ESG Initiative'} size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initiative Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Carbon Neutrality Programme" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pillar</label>
              <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
              <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Responsible person" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Budget (£)</label>
              <input type="number" min="0" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Spent (£)</label>
              <input type="number" min="0" value={form.spent} onChange={e => setForm(f => ({ ...f, spent: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SDG Numbers (comma-separated)</label>
            <input value={form.sdgList} onChange={e => setForm(f => ({ ...f, sdgList: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 7, 13, 15" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
            <input value={form.tagList} onChange={e => setForm(f => ({ ...f, tagList: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Net Zero, Science-Based Target" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Initiative objectives and approach..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Initiative'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Initiative" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this initiative? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
