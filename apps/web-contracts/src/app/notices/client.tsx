'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, Bell, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

interface Notice {
  id: string;
  referenceNumber: string;
  contractId: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  acknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedAt: string;
  createdAt: string;
}

interface NoticeForm {
  contractId: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  acknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedAt: string;
}

const emptyForm: NoticeForm = {
  contractId: '', title: '', description: '', priority: 'MEDIUM',
  dueDate: '', acknowledged: false, acknowledgedBy: '', acknowledgedAt: '',
};

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function NoticesClient() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NoticeForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (priorityFilter !== 'all') params.status = priorityFilter;
      const response = await api.get('/notices', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, priorityFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Notice) {
    setForm({
      contractId: item.contractId || '', title: item.title || '',
      description: item.description || '', priority: item.priority || 'MEDIUM',
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      acknowledged: item.acknowledged || false,
      acknowledgedBy: item.acknowledgedBy || '',
      acknowledgedAt: item.acknowledgedAt ? item.acknowledgedAt.split('T')[0] : '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.contractId || !form.title || !form.dueDate) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        acknowledgedAt: form.acknowledgedAt ? new Date(form.acknowledgedAt).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/notices/${editId}`, payload);
      } else {
        await api.post('/notices', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save notice:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try { await api.delete(`/notices/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  function isDueOrOverdue(dueDate: string) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notices</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Contract notice tracking and acknowledgements</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Notice</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Notices</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(n => n.priority === 'CRITICAL').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Critical</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{items.filter(n => isDueOrOverdue(n.dueDate) && !n.acknowledged).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Due Soon</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(n => n.acknowledged).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Acknowledged</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search notices" placeholder="Search notices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
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
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Acknowledged</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id} className={isDueOrOverdue(item.dueDate) && !item.acknowledged ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span></TableCell>
                        <TableCell className="text-sm">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          {item.acknowledged
                            ? <Badge variant="secondary">Yes</Badge>
                            : <Badge variant="outline">No</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
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
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notices found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Notice</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Notice' : 'Add Notice'} size="lg">
            <div className="space-y-4">
              <div><Label>Contract ID *</Label><Input value={form.contractId} onChange={e => setForm(p => ({ ...p, contractId: e.target.value }))} placeholder="Contract ID" /></div>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Notice description..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label><Select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</Select></div>
                <div><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="acknowledged" checked={form.acknowledged} onChange={e => setForm(p => ({ ...p, acknowledged: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                  <Label htmlFor="acknowledged">Acknowledged</Label>
                </div>
                <div><Label>Acknowledged By</Label><Input value={form.acknowledgedBy} onChange={e => setForm(p => ({ ...p, acknowledgedBy: e.target.value }))} placeholder="User ID" /></div>
                <div><Label>Acknowledged At</Label><Input type="date" value={form.acknowledgedAt} onChange={e => setForm(p => ({ ...p, acknowledgedAt: e.target.value }))} /></div>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.contractId || !form.title || !form.dueDate}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Notice' : 'Create Notice'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
