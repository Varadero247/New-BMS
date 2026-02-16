'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['DRAFT', 'IN_REVIEW', 'COMPLETED'] as const;

interface Scorecard {
  id: string;
  referenceNumber: string;
  supplierId: string;
  period: string;
  quality: number;
  delivery: number;
  cost: number;
  responsiveness: number;
  compliance: number;
  overallScore: number;
  status: string;
  assessor: string;
  comments: string;
  createdAt: string;
}

interface ScorecardForm {
  supplierId: string;
  period: string;
  quality: string;
  delivery: string;
  cost: string;
  responsiveness: string;
  compliance: string;
  overallScore: string;
  status: string;
  assessor: string;
  comments: string;
}

const emptyForm: ScorecardForm = {
  supplierId: '', period: '', quality: '', delivery: '',
  cost: '', responsiveness: '', compliance: '', overallScore: '',
  status: 'DRAFT', assessor: '', comments: '',
};

interface SupplierOption {
  id: string;
  name: string;
  referenceNumber: string;
}

export default function ScorecardsClient() {
  const [items, setItems] = useState<Scorecard[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ScorecardForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const [res, suppRes] = await Promise.all([
        api.get('/scorecards', { params }),
        api.get('/suppliers'),
      ]);
      setItems(res.data.data || []);
      setSuppliers(suppRes.data.data || []);
    } catch (err) {
      console.error('Failed to load scorecards:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Scorecard) {
    setForm({
      supplierId: item.supplierId || '', period: item.period || '',
      quality: item.quality != null ? String(item.quality) : '',
      delivery: item.delivery != null ? String(item.delivery) : '',
      cost: item.cost != null ? String(item.cost) : '',
      responsiveness: item.responsiveness != null ? String(item.responsiveness) : '',
      compliance: item.compliance != null ? String(item.compliance) : '',
      overallScore: item.overallScore != null ? String(item.overallScore) : '',
      status: item.status || 'DRAFT', assessor: item.assessor || '',
      comments: item.comments || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  function calcOverall(): number {
    const vals = [form.quality, form.delivery, form.cost, form.responsiveness, form.compliance]
      .map(v => parseInt(v) || 0)
      .filter(v => v > 0);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  async function handleSubmit() {
    if (!form.supplierId) return;
    setSaving(true);
    try {
      const overall = calcOverall();
      const payload: any = {
        supplierId: form.supplierId,
        period: form.period,
        quality: form.quality ? parseInt(form.quality) : undefined,
        delivery: form.delivery ? parseInt(form.delivery) : undefined,
        cost: form.cost ? parseInt(form.cost) : undefined,
        responsiveness: form.responsiveness ? parseInt(form.responsiveness) : undefined,
        compliance: form.compliance ? parseInt(form.compliance) : undefined,
        overallScore: overall,
        status: form.status,
        assessor: form.assessor,
        comments: form.comments,
      };
      if (editId) {
        await api.put(`/scorecards/${editId}`, payload);
      } else {
        await api.post('/scorecards', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save scorecard:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this scorecard?')) return;
    try { await api.delete(`/scorecards/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }

  function getSupplierName(id: string) {
    const s = suppliers.find(s => s.id === id);
    return s ? s.name : id;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Supplier Scorecards</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Performance evaluation and scoring</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Scorecard</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(i => i.status === 'COMPLETED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{items.filter(i => i.status === 'IN_REVIEW').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">In Review</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-teal-600">{items.length > 0 ? Math.round(items.reduce((a, b) => a + (b.overallScore || 0), 0) / items.length) : 0}%</p><p className="text-sm text-gray-500 dark:text-gray-400">Avg Score</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search scorecards" placeholder="Search scorecards..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{getSupplierName(item.supplierId)}</TableCell>
                        <TableCell className="text-sm">{item.period || '-'}</TableCell>
                        <TableCell className="text-sm">{item.quality != null ? `${item.quality}%` : '-'}</TableCell>
                        <TableCell className="text-sm">{item.delivery != null ? `${item.delivery}%` : '-'}</TableCell>
                        <TableCell className="text-sm">{item.cost != null ? `${item.cost}%` : '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.overallScore || 0)}`}>{item.overallScore != null ? `${item.overallScore}%` : '-'}</span></TableCell>
                        <TableCell><Badge variant={item.status === 'COMPLETED' ? 'default' : 'outline'}>{item.status?.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No scorecards found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Scorecard</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Scorecard' : 'Add Scorecard'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.referenceNumber})</option>)}
                  </Select>
                </div>
                <div><Label>Period</Label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. Q1 2026" /></div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div><Label>Quality (0-100)</Label><Input type="number" min="0" max="100" value={form.quality} onChange={e => setForm(p => ({ ...p, quality: e.target.value }))} placeholder="0" /></div>
                <div><Label>Delivery (0-100)</Label><Input type="number" min="0" max="100" value={form.delivery} onChange={e => setForm(p => ({ ...p, delivery: e.target.value }))} placeholder="0" /></div>
                <div><Label>Cost (0-100)</Label><Input type="number" min="0" max="100" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} placeholder="0" /></div>
                <div><Label>Response (0-100)</Label><Input type="number" min="0" max="100" value={form.responsiveness} onChange={e => setForm(p => ({ ...p, responsiveness: e.target.value }))} placeholder="0" /></div>
                <div><Label>Compliance (0-100)</Label><Input type="number" min="0" max="100" value={form.compliance} onChange={e => setForm(p => ({ ...p, compliance: e.target.value }))} placeholder="0" /></div>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <p className="text-sm text-teal-700 dark:text-teal-300">Overall Score: <span className="font-bold text-lg">{calcOverall()}%</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Assessor</Label><Input value={form.assessor} onChange={e => setForm(p => ({ ...p, assessor: e.target.value }))} placeholder="Assessor name" /></div>
              </div>
              <div><Label>Comments</Label><Textarea value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} rows={3} placeholder="Assessment comments..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.supplierId}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Scorecard' : 'Create Scorecard'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
