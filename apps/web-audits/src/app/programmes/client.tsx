'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, CalendarRange, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;

interface Programme {
  id: string;
  referenceNumber: string;
  title: string;
  year: number;
  description: string;
  status: string;
  auditIds: string[];
  createdAt: string;
}

interface ProgrammeForm {
  title: string;
  year: number;
  description: string;
  status: string;
  auditIds: string;
}

const emptyForm: ProgrammeForm = {
  title: '', year: new Date().getFullYear(), description: '', status: 'DRAFT', auditIds: '',
};

function statusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'secondary';
    case 'ACTIVE': return 'default';
    case 'ARCHIVED': return 'outline';
    default: return 'outline';
  }
}

export default function ProgrammesClient() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProgrammeForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProgrammes = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/programmes', { params });
      setProgrammes(response.data.data || []);
    } catch (err) {
      console.error('Failed to load programmes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadProgrammes(); }, [loadProgrammes]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(prog: Programme) {
    setForm({
      title: prog.title,
      year: prog.year || new Date().getFullYear(),
      description: prog.description || '',
      status: prog.status || 'DRAFT',
      auditIds: Array.isArray(prog.auditIds) ? prog.auditIds.join(', ') : '',
    });
    setEditId(prog.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        auditIds: form.auditIds ? form.auditIds.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editId) {
        await api.put(`/programmes/${editId}`, payload);
      } else {
        await api.post('/programmes', payload);
      }
      setModalOpen(false);
      loadProgrammes();
    } catch (err) { console.error('Failed to save programme:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this programme?')) return;
    try { await api.delete(`/programmes/${id}`); loadProgrammes(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audit Programmes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Annual audit programme planning and tracking</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />New Programme</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{programmes.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Programmes</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{programmes.filter(p => p.status === 'ACTIVE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Active</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{programmes.filter(p => p.status === 'COMPLETED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-gray-600">{programmes.filter(p => p.status === 'DRAFT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search programmes" placeholder="Search programmes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : programmes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Audits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programmes.map(prog => (
                      <TableRow key={prog.id}>
                        <TableCell className="font-mono text-xs">{prog.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{prog.title}</TableCell>
                        <TableCell className="text-sm">{prog.year}</TableCell>
                        <TableCell className="text-sm">{Array.isArray(prog.auditIds) ? prog.auditIds.length : 0} linked</TableCell>
                        <TableCell><Badge variant={statusVariant(prog.status)}>{prog.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(prog)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(prog.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarRange className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No audit programmes created</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First Programme</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Programme' : 'New Programme'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Programme title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Year *</Label><Input type="number" value={String(form.year)} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))} /></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Programme description..." /></div>
              <div><Label>Linked Audit IDs (comma-separated)</Label><Input value={form.auditIds} onChange={e => setForm(p => ({ ...p, auditIds: e.target.value }))} placeholder="uuid1, uuid2, ..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Programme' : 'Create Programme'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
