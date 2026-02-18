'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, Grid3X3, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const LEVELS = ['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED'] as const;

interface MatrixEntry {
  id: string;
  referenceNumber: string;
  competencyId: string;
  employeeId: string;
  employeeName: string;
  currentLevel: string;
  targetLevel: string;
  assessedDate: string;
  assessedBy: string;
  nextReviewDate: string;
  gap: boolean;
  notes: string;
  createdAt: string;
}

interface MatrixForm {
  competencyId: string;
  employeeId: string;
  employeeName: string;
  currentLevel: string;
  targetLevel: string;
  assessedDate: string;
  assessedBy: string;
  nextReviewDate: string;
  gap: boolean;
  notes: string;
}

const emptyForm: MatrixForm = {
  competencyId: '', employeeId: '', employeeName: '',
  currentLevel: 'NOT_STARTED', targetLevel: 'COMPETENT',
  assessedDate: '', assessedBy: '', nextReviewDate: '',
  gap: false, notes: '',
};

export default function MatrixClient() {
  const [entries, setEntries] = useState<MatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MatrixForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gapFilter, setGapFilter] = useState('all');

  const loadEntries = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (gapFilter !== 'all') params.status = gapFilter;
      const response = await api.get('/matrix', { params });
      setEntries(response.data.data || []);
    } catch (err) {
      console.error('Failed to load matrix:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, gapFilter]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(entry: MatrixEntry) {
    setForm({
      competencyId: entry.competencyId || '', employeeId: entry.employeeId || '',
      employeeName: entry.employeeName || '',
      currentLevel: entry.currentLevel || 'NOT_STARTED', targetLevel: entry.targetLevel || 'COMPETENT',
      assessedDate: entry.assessedDate ? entry.assessedDate.split('T')[0] : '',
      assessedBy: entry.assessedBy || '',
      nextReviewDate: entry.nextReviewDate ? entry.nextReviewDate.split('T')[0] : '',
      gap: entry.gap || false, notes: entry.notes || '',
    });
    setEditId(entry.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.competencyId || !form.employeeId) return;
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        assessedDate: form.assessedDate ? new Date(form.assessedDate).toISOString() : undefined,
        nextReviewDate: form.nextReviewDate ? new Date(form.nextReviewDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/matrix/${editId}`, payload);
      } else {
        await api.post('/matrix', payload);
      }
      setModalOpen(false);
      loadEntries();
    } catch (err) { console.error('Failed to save matrix entry:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this matrix entry?')) return;
    try { await api.delete(`/matrix/${id}`); loadEntries(); } catch (err) { console.error(err); }
  }

  function getLevelColor(level: string) {
    switch (level) {
      case 'EXPERT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'COMPETENT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DEVELOPING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Competency Matrix</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Employee competency tracking and gap analysis</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Entry</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{entries.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{entries.filter(e => e.gap).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">With Gaps</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{entries.filter(e => e.currentLevel === 'COMPETENT' || e.currentLevel === 'EXPERT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Competent+</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{entries.filter(e => e.currentLevel === 'DEVELOPING').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Developing</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search matrix entries" placeholder="Search by employee..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by gap status" value={gapFilter} onChange={e => setGapFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Entries</option>
            <option value="gap">With Gaps</option>
            <option value="no-gap">No Gaps</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : entries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Competency ID</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Gap</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-xs">{entry.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{entry.employeeName || entry.employeeId}</TableCell>
                        <TableCell className="text-sm font-mono text-xs">{entry.competencyId}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(entry.currentLevel)}`}>{entry.currentLevel?.replace(/_/g, ' ') || '-'}</span></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(entry.targetLevel)}`}>{entry.targetLevel?.replace(/_/g, ' ') || '-'}</span></TableCell>
                        <TableCell><Badge variant={entry.gap ? 'default' : 'secondary'}>{entry.gap ? 'Yes' : 'No'}</Badge></TableCell>
                        <TableCell className="text-sm">{entry.nextReviewDate ? new Date(entry.nextReviewDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(entry)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(entry.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No matrix entries found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Entry</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Matrix Entry' : 'Add Matrix Entry'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Competency ID *</Label><Input value={form.competencyId} onChange={e => setForm(p => ({ ...p, competencyId: e.target.value }))} placeholder="Competency ID" /></div>
                <div><Label>Employee ID *</Label><Input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} placeholder="Employee ID" /></div>
              </div>
              <div><Label>Employee Name</Label><Input value={form.employeeName} onChange={e => setForm(p => ({ ...p, employeeName: e.target.value }))} placeholder="Employee name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Current Level</Label><Select value={form.currentLevel} onChange={e => setForm(p => ({ ...p, currentLevel: e.target.value }))}>{LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Target Level</Label><Select value={form.targetLevel} onChange={e => setForm(p => ({ ...p, targetLevel: e.target.value }))}>{LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Assessed Date</Label><Input type="date" value={form.assessedDate} onChange={e => setForm(p => ({ ...p, assessedDate: e.target.value }))} /></div>
                <div><Label>Next Review Date</Label><Input type="date" value={form.nextReviewDate} onChange={e => setForm(p => ({ ...p, nextReviewDate: e.target.value }))} /></div>
              </div>
              <div><Label>Assessed By</Label><Input value={form.assessedBy} onChange={e => setForm(p => ({ ...p, assessedBy: e.target.value }))} placeholder="Assessor name" /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasGap" checked={form.gap} onChange={e => setForm(p => ({ ...p, gap: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="hasGap">Competency Gap Identified</Label>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.competencyId || !form.employeeId}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Entry' : 'Create Entry'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
