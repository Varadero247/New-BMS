'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, BookOpen, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const COMPLIANCE_STATUSES = ['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_ASSESSED', 'NOT_APPLICABLE'] as const;

interface LegalItem {
  id: string; referenceNumber: string; title: string; legislation: string;
  jurisdiction: string; applicability: string; requirements: string;
  complianceStatus: string; responsiblePerson: string;
  reviewDate: string; lastReviewDate: string; notes: string; createdAt: string;
}

interface LegalForm {
  title: string; legislation: string; jurisdiction: string;
  applicability: string; requirements: string; complianceStatus: string;
  responsiblePerson: string; reviewDate: string; lastReviewDate: string; notes: string;
}

const emptyForm: LegalForm = {
  title: '', legislation: '', jurisdiction: '', applicability: '',
  requirements: '', complianceStatus: 'NOT_ASSESSED',
  responsiblePerson: '', reviewDate: '', lastReviewDate: '', notes: '',
};

function getComplianceColor(status: string) {
  switch (status) {
    case 'COMPLIANT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'PARTIALLY_COMPLIANT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'NON_COMPLIANT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

export default function LegalRegisterClient() {
  const [items, setItems] = useState<LegalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LegalForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/legal-register', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load legal register:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: LegalItem) {
    setForm({
      title: item.title || '', legislation: item.legislation || '',
      jurisdiction: item.jurisdiction || '', applicability: item.applicability || '',
      requirements: item.requirements || '', complianceStatus: item.complianceStatus || 'NOT_ASSESSED',
      responsiblePerson: item.responsiblePerson || '',
      reviewDate: item.reviewDate ? item.reviewDate.split('T')[0] : '',
      lastReviewDate: item.lastReviewDate ? item.lastReviewDate.split('T')[0] : '',
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
        title: form.title, legislation: form.legislation || undefined,
        jurisdiction: form.jurisdiction || undefined,
        applicability: form.applicability || undefined,
        requirements: form.requirements || undefined,
        complianceStatus: form.complianceStatus || undefined,
        responsiblePerson: form.responsiblePerson || undefined,
        reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : undefined,
        lastReviewDate: form.lastReviewDate ? new Date(form.lastReviewDate).toISOString() : undefined,
        notes: form.notes || undefined,
      };
      if (editId) {
        await api.put(`/legal-register/${editId}`, payload);
      } else {
        await api.post('/legal-register', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save legal item:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this legal register entry?')) return;
    try { await api.delete(`/legal-register/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Legal Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Legislation and regulatory requirements tracking</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Entry</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(r => r.complianceStatus === 'COMPLIANT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-yellow-600">{items.filter(r => r.complianceStatus === 'PARTIALLY_COMPLIANT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Partial</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(r => r.complianceStatus === 'NON_COMPLIANT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Non-Compliant</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search legal register" placeholder="Search legal register..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by compliance status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Statuses</option>
            {COMPLIANCE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
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
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Responsible</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-sm">{item.jurisdiction || '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(item.complianceStatus)}`}>{(item.complianceStatus || '-').replace(/_/g, ' ')}</span></TableCell>
                        <TableCell className="text-sm">{item.responsiblePerson || '-'}</TableCell>
                        <TableCell className="text-sm">{item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : '-'}</TableCell>
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
                <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No legal register entries found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Entry</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Legal Register Entry' : 'Add Legal Register Entry'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Legal requirement title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Legislation</Label><Input value={form.legislation} onChange={e => setForm(p => ({ ...p, legislation: e.target.value }))} placeholder="e.g. Health & Safety at Work Act" /></div>
                <div><Label>Jurisdiction</Label><Input value={form.jurisdiction} onChange={e => setForm(p => ({ ...p, jurisdiction: e.target.value }))} placeholder="e.g. UK, EU, US" /></div>
              </div>
              <div><Label>Applicability</Label><Textarea value={form.applicability} onChange={e => setForm(p => ({ ...p, applicability: e.target.value }))} rows={2} placeholder="How does this apply to the organisation?" /></div>
              <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={3} placeholder="Key requirements..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Compliance Status</Label><Select value={form.complianceStatus} onChange={e => setForm(p => ({ ...p, complianceStatus: e.target.value }))}>{COMPLIANCE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Responsible Person</Label><Input value={form.responsiblePerson} onChange={e => setForm(p => ({ ...p, responsiblePerson: e.target.value }))} placeholder="Person responsible" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Next Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} /></div>
                <div><Label>Last Review Date</Label><Input type="date" value={form.lastReviewDate} onChange={e => setForm(p => ({ ...p, lastReviewDate: e.target.value }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Entry' : 'Create Entry'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
