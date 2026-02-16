'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, ShieldCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = ['CORRECTIVE', 'PREVENTIVE'] as const;
const SOURCES = ['AUDIT', 'INCIDENT', 'COMPLAINT', 'RISK_ASSESSMENT', 'MANAGEMENT_REVIEW', 'REGULATORY', 'CUSTOMER_FEEDBACK', 'INTERNAL_REVIEW'] as const;
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'OVERDUE'] as const;

interface Capa {
  id: string; referenceNumber: string; title: string; description: string;
  type: string; source: string; priority: string; status: string;
  assigneeName: string; rootCause: string; actionPlan: string;
  dueDate: string; completedDate: string; createdAt: string;
}

interface CapaForm {
  title: string; description: string; type: string; source: string;
  priority: string; status: string; assigneeName: string;
  rootCause: string; actionPlan: string; verificationMethod: string;
  dueDate: string; notes: string;
}

const emptyForm: CapaForm = {
  title: '', description: '', type: 'CORRECTIVE', source: 'INTERNAL_REVIEW',
  priority: 'MEDIUM', status: 'OPEN', assigneeName: '',
  rootCause: '', actionPlan: '', verificationMethod: '',
  dueDate: '', notes: '',
};

export default function CapaClient() {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CapaForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCapas = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/capa', { params });
      setCapas(response.data.data || []);
    } catch (err) { console.error('Failed to load CAPAs:', err); }
    finally { setLoading(false); }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadCapas(); }, [loadCapas]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(capa: Capa) {
    setForm({
      title: capa.title, description: capa.description || '', type: capa.type,
      source: capa.source || 'INTERNAL_REVIEW', priority: capa.priority || 'MEDIUM',
      status: capa.status || 'OPEN', assigneeName: capa.assigneeName || '',
      rootCause: capa.rootCause || '', actionPlan: capa.actionPlan || '',
      verificationMethod: '', dueDate: capa.dueDate ? capa.dueDate.split('T')[0] : '', notes: '',
    });
    setEditId(capa.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.type) return;
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined };
      if (editId) { await api.put(`/capa/${editId}`, payload); }
      else { await api.post('/capa', payload); }
      setModalOpen(false); loadCapas();
    } catch (err) { console.error('Failed to save CAPA:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this CAPA?')) return;
    try { await api.delete(`/capa/${id}`); loadCapas(); } catch (err) { console.error(err); }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CAPA Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Corrective and Preventive Actions</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add CAPA</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{capas.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total CAPAs</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{capas.filter(c => c.status === 'OPEN' || c.status === 'OVERDUE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Open / Overdue</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{capas.filter(c => c.status === 'IN_PROGRESS').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{capas.filter(c => c.status === 'CLOSED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Closed</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search CAPAs" placeholder="Search CAPAs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
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
            ) : capas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capas.map(capa => (
                      <TableRow key={capa.id}>
                        <TableCell className="font-mono text-xs">{capa.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{capa.title}</TableCell>
                        <TableCell><Badge variant="outline">{capa.type}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(capa.priority)}`}>{capa.priority}</span></TableCell>
                        <TableCell className="text-sm">{capa.assigneeName || '-'}</TableCell>
                        <TableCell className="text-sm">{capa.dueDate ? new Date(capa.dueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell><Badge variant={capa.status === 'CLOSED' ? 'secondary' : capa.status === 'OVERDUE' ? 'destructive' : 'default'}>{capa.status?.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(capa)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(capa.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No CAPAs found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First CAPA</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit CAPA' : 'Add CAPA'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="CAPA title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type *</Label><Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                <div><Label>Source</Label><Select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>{SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the issue..." /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Priority</Label><Select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</Select></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              </div>
              <div><Label>Assignee Name</Label><Input value={form.assigneeName} onChange={e => setForm(p => ({ ...p, assigneeName: e.target.value }))} placeholder="Assigned to" /></div>
              <div><Label>Root Cause</Label><Textarea value={form.rootCause} onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} rows={2} placeholder="Root cause analysis..." /></div>
              <div><Label>Action Plan</Label><Textarea value={form.actionPlan} onChange={e => setForm(p => ({ ...p, actionPlan: e.target.value }))} rows={2} placeholder="Planned corrective/preventive actions..." /></div>
              <div><Label>Verification Method</Label><Textarea value={form.verificationMethod} onChange={e => setForm(p => ({ ...p, verificationMethod: e.target.value }))} rows={2} placeholder="How will effectiveness be verified?" /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update CAPA' : 'Create CAPA'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
