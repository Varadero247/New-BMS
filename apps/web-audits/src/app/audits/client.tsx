'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = ['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'CERTIFICATION', 'SURVEILLANCE', 'PROCESS'] as const;
const STATUSES = ['PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

interface Audit {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  status: string;
  standard: string;
  scope: string;
  department: string;
  leadAuditorName: string;
  scheduledDate: string;
  startDate: string;
  endDate: string;
  conclusion: string;
  createdAt: string;
}

interface AuditForm {
  title: string;
  description: string;
  type: string;
  status: string;
  standard: string;
  scope: string;
  department: string;
  leadAuditorName: string;
  scheduledDate: string;
  startDate: string;
  endDate: string;
  conclusion: string;
  notes: string;
}

const emptyForm: AuditForm = {
  title: '', description: '', type: 'INTERNAL', status: 'PLANNED',
  standard: '', scope: '', department: '', leadAuditorName: '',
  scheduledDate: '', startDate: '', endDate: '', conclusion: '', notes: '',
};

function statusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'secondary';
    case 'IN_PROGRESS': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
}

export default function AuditsClient() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AuditForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAudits = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/audits', { params });
      setAudits(response.data.data || []);
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadAudits(); }, [loadAudits]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(audit: Audit) {
    setForm({
      title: audit.title,
      description: audit.description || '',
      type: audit.type || 'INTERNAL',
      status: audit.status || 'PLANNED',
      standard: audit.standard || '',
      scope: audit.scope || '',
      department: audit.department || '',
      leadAuditorName: audit.leadAuditorName || '',
      scheduledDate: audit.scheduledDate ? audit.scheduledDate.split('T')[0] : '',
      startDate: audit.startDate ? audit.startDate.split('T')[0] : '',
      endDate: audit.endDate ? audit.endDate.split('T')[0] : '',
      conclusion: audit.conclusion || '',
      notes: '',
    });
    setEditId(audit.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/audits/${editId}`, payload);
      } else {
        await api.post('/audits', payload);
      }
      setModalOpen(false);
      loadAudits();
    } catch (err) { console.error('Failed to save audit:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this audit?')) return;
    try { await api.delete(`/audits/${id}`); loadAudits(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage internal and external audits</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />New Audit</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{audits.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Audits</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{audits.filter(a => a.status === 'COMPLETED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{audits.filter(a => a.status === 'IN_PROGRESS').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{audits.filter(a => a.status === 'PLANNED' || a.status === 'SCHEDULED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search audits" placeholder="Search audits..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
            ) : audits.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Lead Auditor</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map(audit => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-mono text-xs">{audit.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{audit.title}</TableCell>
                        <TableCell><Badge variant="outline">{audit.type?.replace(/_/g, ' ') || '-'}</Badge></TableCell>
                        <TableCell className="text-sm">{audit.standard || '-'}</TableCell>
                        <TableCell className="text-sm">{audit.leadAuditorName || '-'}</TableCell>
                        <TableCell className="text-sm">{audit.scheduledDate ? new Date(audit.scheduledDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell><Badge variant={statusVariant(audit.status)}>{audit.status?.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(audit)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(audit.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
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
                <p className="text-gray-500 dark:text-gray-400">No audits found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Schedule First Audit</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Audit' : 'New Audit'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Audit title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Audit description..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Standard</Label><Input value={form.standard} onChange={e => setForm(p => ({ ...p, standard: e.target.value }))} placeholder="e.g. ISO 9001:2015" /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" /></div>
              </div>
              <div><Label>Scope</Label><Textarea value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} rows={2} placeholder="Audit scope..." /></div>
              <div><Label>Lead Auditor</Label><Input value={form.leadAuditorName} onChange={e => setForm(p => ({ ...p, leadAuditorName: e.target.value }))} placeholder="Lead auditor name" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Scheduled Date</Label><Input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} /></div>
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
              </div>
              <div><Label>Conclusion</Label><Textarea value={form.conclusion} onChange={e => setForm(p => ({ ...p, conclusion: e.target.value }))} rows={2} placeholder="Audit conclusion..." /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Audit' : 'Create Audit'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
