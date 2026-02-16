'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, FileText, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const SOURCES = ['GOVERNMENT', 'REGULATOR', 'STANDARDS_BODY', 'INDUSTRY', 'EU_UK', 'OTHER'] as const;
const STATUSES = ['NEW', 'UNDER_REVIEW', 'ASSESSED', 'IMPLEMENTED', 'NOT_APPLICABLE', 'MONITORING'] as const;
const IMPACTS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;

interface Change {
  id: string; referenceNumber: string; title: string; description: string;
  source: string; sourceUrl: string; publishedDate: string; effectiveDate: string;
  status: string; impact: string; affectedAreas: string[];
  assigneeName: string; assessment: string; actionRequired: string;
  completedDate: string; notes: string; createdAt: string;
}

interface ChangeForm {
  title: string; description: string; source: string; sourceUrl: string;
  publishedDate: string; effectiveDate: string; status: string; impact: string;
  affectedAreas: string; assigneeName: string; assessment: string;
  actionRequired: string; completedDate: string; notes: string;
}

const emptyForm: ChangeForm = {
  title: '', description: '', source: 'GOVERNMENT', sourceUrl: '',
  publishedDate: '', effectiveDate: '', status: 'NEW', impact: 'MEDIUM',
  affectedAreas: '', assigneeName: '', assessment: '',
  actionRequired: '', completedDate: '', notes: '',
};

function getImpactColor(impact: string) {
  switch (impact) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

export default function ChangesClient() {
  const [items, setItems] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ChangeForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/changes', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load changes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Change) {
    setForm({
      title: item.title || '', description: item.description || '',
      source: item.source || 'GOVERNMENT', sourceUrl: item.sourceUrl || '',
      publishedDate: item.publishedDate ? item.publishedDate.split('T')[0] : '',
      effectiveDate: item.effectiveDate ? item.effectiveDate.split('T')[0] : '',
      status: item.status || 'NEW', impact: item.impact || 'MEDIUM',
      affectedAreas: (item.affectedAreas || []).join(', '),
      assigneeName: item.assigneeName || '', assessment: item.assessment || '',
      actionRequired: item.actionRequired || '',
      completedDate: item.completedDate ? item.completedDate.split('T')[0] : '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload: any = {
        title: form.title, description: form.description || undefined,
        source: form.source, sourceUrl: form.sourceUrl || undefined,
        publishedDate: form.publishedDate ? new Date(form.publishedDate).toISOString() : undefined,
        effectiveDate: form.effectiveDate ? new Date(form.effectiveDate).toISOString() : undefined,
        status: form.status, impact: form.impact,
        affectedAreas: form.affectedAreas ? form.affectedAreas.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        assigneeName: form.assigneeName || undefined, assessment: form.assessment || undefined,
        actionRequired: form.actionRequired || undefined,
        completedDate: form.completedDate ? new Date(form.completedDate).toISOString() : undefined,
        notes: form.notes || undefined,
      };
      if (editId) {
        await api.put(`/changes/${editId}`, payload);
      } else {
        await api.post('/changes', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save change:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this regulatory change?')) return;
    try { await api.delete(`/changes/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Regulatory Changes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and assess regulatory changes</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Change</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Changes</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(r => r.impact === 'CRITICAL' || r.impact === 'HIGH').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">High/Critical Impact</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-sky-600">{items.filter(r => r.status === 'NEW' || r.status === 'UNDER_REVIEW').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(r => r.status === 'IMPLEMENTED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Implemented</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search changes" placeholder="Search changes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell><Badge variant="outline">{(item.source || '-').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(item.impact)}`}>{item.impact || '-'}</span></TableCell>
                        <TableCell><Badge variant={item.status === 'IMPLEMENTED' ? 'secondary' : item.status === 'ASSESSED' ? 'default' : 'outline'}>{(item.status || '-').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell className="text-sm">{item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString() : '-'}</TableCell>
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
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No regulatory changes found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Change</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Regulatory Change' : 'Add Regulatory Change'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Change title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Source</Label><Select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>{SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the regulatory change..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Impact</Label><Select value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))}>{IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}</Select></div>
                <div><Label>Source URL</Label><Input value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Published Date</Label><Input type="date" value={form.publishedDate} onChange={e => setForm(p => ({ ...p, publishedDate: e.target.value }))} /></div>
                <div><Label>Effective Date</Label><Input type="date" value={form.effectiveDate} onChange={e => setForm(p => ({ ...p, effectiveDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Assignee Name</Label><Input value={form.assigneeName} onChange={e => setForm(p => ({ ...p, assigneeName: e.target.value }))} placeholder="Person responsible" /></div>
                <div><Label>Completed Date</Label><Input type="date" value={form.completedDate} onChange={e => setForm(p => ({ ...p, completedDate: e.target.value }))} /></div>
              </div>
              <div><Label>Affected Areas (comma separated)</Label><Input value={form.affectedAreas} onChange={e => setForm(p => ({ ...p, affectedAreas: e.target.value }))} placeholder="e.g. Quality, Environment, H&S" /></div>
              <div><Label>Assessment</Label><Textarea value={form.assessment} onChange={e => setForm(p => ({ ...p, assessment: e.target.value }))} rows={2} placeholder="Impact assessment..." /></div>
              <div><Label>Action Required</Label><Textarea value={form.actionRequired} onChange={e => setForm(p => ({ ...p, actionRequired: e.target.value }))} rows={2} placeholder="Required actions..." /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Change' : 'Create Change'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
