'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, AlertTriangle, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const CATEGORIES = [
  'STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL',
  'ENVIRONMENTAL', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'QUALITY', 'SUPPLY_CHAIN',
] as const;

const LIKELIHOODS = ['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN'] as const;
const CONSEQUENCES = ['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'] as const;
const TREATMENTS = ['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID', 'ESCALATE'] as const;
const STATUSES = ['IDENTIFIED', 'ASSESSED', 'TREATING', 'MONITORING', 'CLOSED'] as const;

const LIKELIHOOD_SCORES: Record<string, number> = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
const CONSEQUENCE_SCORES: Record<string, number> = { INSIGNIFICANT: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };

interface Risk {
  id: string; referenceNumber: string; title: string; description: string;
  category: string; status: string; likelihood: string; consequence: string;
  inherentScore: number; treatment: string; owner: string; ownerName: string;
  dueDate: string; createdAt: string;
}

interface RiskForm {
  title: string; description: string; category: string; source: string;
  owner: string; ownerName: string; department: string;
  likelihood: string; consequence: string;
  treatment: string; treatmentPlan: string; controls: string;
  status: string; dueDate: string; notes: string;
}

const emptyForm: RiskForm = {
  title: '', description: '', category: 'OPERATIONAL', source: '',
  owner: '', ownerName: '', department: '',
  likelihood: 'POSSIBLE', consequence: 'MODERATE',
  treatment: 'MITIGATE', treatmentPlan: '', controls: '',
  status: 'IDENTIFIED', dueDate: '', notes: '',
};

export default function RisksClient() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RiskForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRisks = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/risks', { params });
      setRisks(response.data.data || []);
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadRisks(); }, [loadRisks]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(risk: Risk) {
    setForm({
      title: risk.title, description: risk.description || '', category: risk.category,
      source: '', owner: risk.owner || '', ownerName: risk.ownerName || '', department: '',
      likelihood: risk.likelihood || 'POSSIBLE', consequence: risk.consequence || 'MODERATE',
      treatment: risk.treatment || 'MITIGATE', treatmentPlan: '', controls: '',
      status: risk.status || 'IDENTIFIED', dueDate: risk.dueDate ? risk.dueDate.split('T')[0] : '', notes: '',
    });
    setEditId(risk.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const score = (LIKELIHOOD_SCORES[form.likelihood] || 3) * (CONSEQUENCE_SCORES[form.consequence] || 3);
      const payload = { ...form, inherentScore: score, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined };
      if (editId) {
        await api.put(`/risks/${editId}`, payload);
      } else {
        await api.post('/risks', payload);
      }
      setModalOpen(false);
      loadRisks();
    } catch (err) { console.error('Failed to save risk:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this risk?')) return;
    try { await api.delete(`/risks/${id}`); loadRisks(); } catch (err) { console.error(err); }
  }

  function getRiskColor(score: number) {
    if (score >= 15) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (score >= 8) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 31000 risk identification and assessment</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Risk</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{risks.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Risks</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{risks.filter(r => r.inherentScore >= 15).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Critical</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-orange-600">{risks.filter(r => r.inherentScore >= 8 && r.inherentScore < 15).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">High</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{risks.filter(r => r.status === 'CLOSED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Closed</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search risks" placeholder="Search risks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : risks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map(risk => (
                      <TableRow key={risk.id}>
                        <TableCell className="font-mono text-xs">{risk.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{risk.title}</TableCell>
                        <TableCell><Badge variant="outline">{risk.category.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.inherentScore || 0)}`}>{risk.inherentScore || '-'}</span></TableCell>
                        <TableCell className="text-sm">{risk.treatment?.replace(/_/g, ' ') || '-'}</TableCell>
                        <TableCell><Badge variant={risk.status === 'CLOSED' ? 'secondary' : risk.status === 'TREATING' ? 'default' : 'outline'}>{risk.status?.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(risk)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(risk.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No risks found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Risk</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Risk' : 'Add Risk'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Risk title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the risk..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Likelihood</Label><Select value={form.likelihood} onChange={e => setForm(p => ({ ...p, likelihood: e.target.value }))}>{LIKELIHOODS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Consequence</Label><Select value={form.consequence} onChange={e => setForm(p => ({ ...p, consequence: e.target.value }))}>{CONSEQUENCES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Inherent Risk Score: <span className="font-bold text-lg">{(LIKELIHOOD_SCORES[form.likelihood] || 3) * (CONSEQUENCE_SCORES[form.consequence] || 3)}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Treatment</Label><Select value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))}>{TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              </div>
              <div><Label>Treatment Plan</Label><Textarea value={form.treatmentPlan} onChange={e => setForm(p => ({ ...p, treatmentPlan: e.target.value }))} rows={2} placeholder="How will this risk be treated?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Owner Name</Label><Input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="Risk owner" /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Risk' : 'Create Risk'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
