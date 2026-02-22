'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Target, Plus, Search, Globe, ChevronDown, ChevronUp, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Competitor {
  id: string;
  name: string;
  website?: string;
  category?: string;
  createdAt: string;
}

interface IntelEntry {
  id: string;
  type: string;
  detail: string;
  createdAt: string;
}

const MOCK_COMPETITORS: Competitor[] = [
  { id: '1', name: 'Intelex Technologies', website: 'https://www.intelex.com', category: 'QHSE Software', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Cority', website: 'https://www.cority.com', category: 'QHSE Software', createdAt: '2026-01-01T00:00:00Z' },
  { id: '3', name: 'Ideagen', website: 'https://www.ideagen.com', category: 'Compliance Software', createdAt: '2026-01-01T00:00:00Z' },
  { id: '4', name: 'Benchmark Gensuite', website: 'https://www.benchmarkgensuite.com', category: 'EHS Software', createdAt: '2026-01-01T00:00:00Z' },
  { id: '5', name: 'Enablon', website: 'https://enablon.com', category: 'ESG & EHS', createdAt: '2026-01-01T00:00:00Z' },
];

const MOCK_INTEL: Record<string, IntelEntry[]> = {
  '1': [{ id: 'i1', type: 'PRICING', detail: 'Enterprise tier £80-150/user/month', createdAt: '2026-02-01T00:00:00Z' }, { id: 'i2', type: 'FEATURE', detail: 'No native ISO 42001 or ISO 37001 support', createdAt: '2026-02-05T00:00:00Z' }],
  '2': [{ id: 'i3', type: 'MARKET', detail: 'Strong in North America, limited EMEA presence', createdAt: '2026-01-20T00:00:00Z' }],
};

const INTEL_TYPES = ['PRICING', 'FEATURE', 'MARKET', 'WIN', 'LOSS', 'NEWS', 'PARTNERSHIP', 'OTHER'];

const CATEGORY_COLORS: Record<string, string> = {
  'QHSE Software': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Compliance Software': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'EHS Software': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'ESG & EHS': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [intel, setIntel] = useState<Record<string, IntelEntry[]>>(MOCK_INTEL);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddComp, setShowAddComp] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', website: '', category: '' });
  const [intelForms, setIntelForms] = useState<Record<string, { type: string; detail: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/competitors');
        setCompetitors(r.data.data?.competitors || MOCK_COMPETITORS);
      } catch {
        setCompetitors(MOCK_COMPETITORS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addCompetitor() {
    if (!newComp.name) return;
    setSaving(true);
    try {
      const r = await api.post('/competitors', { name: newComp.name, website: newComp.website || undefined, category: newComp.category || undefined });
      setCompetitors((prev) => [...prev, r.data.data]);
      setNewComp({ name: '', website: '', category: '' });
      setShowAddComp(false);
    } catch {
      setCompetitors((prev) => [...prev, { id: Date.now().toString(), name: newComp.name, website: newComp.website || undefined, category: newComp.category || undefined, createdAt: new Date().toISOString() }]);
      setShowAddComp(false);
    } finally {
      setSaving(false);
    }
  }

  async function addIntel(competitorId: string) {
    const f = intelForms[competitorId];
    if (!f?.type || !f?.detail) return;
    try {
      await api.post(`/competitors/${competitorId}/intel`, { type: f.type, detail: f.detail });
      setIntel((prev) => ({ ...prev, [competitorId]: [...(prev[competitorId] || []), { id: Date.now().toString(), type: f.type, detail: f.detail, createdAt: new Date().toISOString() }] }));
      setIntelForms((prev) => ({ ...prev, [competitorId]: { type: 'PRICING', detail: '' } }));
    } catch { }
  }

  const filtered = competitors.filter((c) => searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.category || '').toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Competitor Intelligence</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track competitor activity, pricing, and market positioning</p>
          </div>
          <button onClick={() => setShowAddComp(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Competitor
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300">
            <p className="text-2xl font-bold">{competitors.length}</p>
            <p className="text-sm font-medium mt-0.5">Total Competitors</p>
          </div>
          <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
            <p className="text-2xl font-bold">{Object.values(intel).flat().length}</p>
            <p className="text-sm font-medium mt-0.5">Intel Entries</p>
          </div>
          <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
            <p className="text-2xl font-bold">{[...new Set(competitors.map((c) => c.category).filter(Boolean))].length}</p>
            <p className="text-sm font-medium mt-0.5">Categories</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search competitors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
        </div>

        {/* Competitor Cards */}
        <div className="space-y-3">
          {filtered.map((comp) => {
            const compIntel = intel[comp.id] || [];
            const isExpanded = expandedId === comp.id;
            const intelForm = intelForms[comp.id] || { type: 'PRICING', detail: '' };
            const catColor = CATEGORY_COLORS[comp.category || ''] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

            return (
              <Card key={comp.id}>
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg" onClick={() => setExpandedId(isExpanded ? null : comp.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{comp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {comp.category && <span className={`text-xs px-2 py-0.5 rounded font-medium ${catColor}`}>{comp.category}</span>}
                          {comp.website && (
                            <a href={comp.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <Globe className="h-3 w-3" /> Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{compIntel.length} intel entries</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <CardContent className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    {compIntel.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {compIntel.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded mt-0.5 shrink-0">{entry.type}</span>
                            <p className="text-gray-700 dark:text-gray-300">{entry.detail}</p>
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-auto">{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <select value={intelForm.type} onChange={(e) => setIntelForms((prev) => ({ ...prev, [comp.id]: { ...intelForm, type: e.target.value } }))} className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                        {INTEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" value={intelForm.detail} onChange={(e) => setIntelForms((prev) => ({ ...prev, [comp.id]: { ...intelForm, detail: e.target.value } }))} placeholder="Add intelligence note..." className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                      <button onClick={() => addIntel(comp.id)} disabled={!intelForm.detail} className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">Add</button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No competitors found.</p>
          </div>
        )}
      </div>

      {showAddComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Competitor</h2>
              <button onClick={() => setShowAddComp(false)}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Competitor name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input type="url" value={newComp.website} onChange={(e) => setNewComp({ ...newComp, website: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input type="text" value={newComp.category} onChange={(e) => setNewComp({ ...newComp, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. QHSE Software" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddComp(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={addCompetitor} disabled={saving || !newComp.name} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Competitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
