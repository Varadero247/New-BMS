'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, MessagesSquare, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const DIRECTIONS = ['INBOUND', 'OUTBOUND'] as const;
const CHANNELS = ['EMAIL', 'PHONE', 'LETTER', 'IN_PERSON', 'PORTAL'] as const;

interface Communication {
  id: string;
  referenceNumber: string;
  complaintId: string;
  direction: string;
  channel: string;
  subject: string;
  content: string;
  sentAt: string;
  sentBy: string;
  createdAt: string;
}

interface CommForm {
  complaintId: string;
  direction: string;
  channel: string;
  subject: string;
  content: string;
  sentAt: string;
  sentBy: string;
}

const emptyForm: CommForm = {
  complaintId: '', direction: 'OUTBOUND', channel: 'EMAIL', subject: '', content: '', sentAt: '', sentBy: '',
};

export default function CommunicationsClient() {
  const [items, setItems] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CommForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (directionFilter !== 'all') params.status = directionFilter;
      const response = await api.get('/communications', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load communications:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, directionFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Communication) {
    setForm({
      complaintId: item.complaintId || '', direction: item.direction || 'OUTBOUND',
      channel: item.channel || 'EMAIL', subject: item.subject || '',
      content: item.content || '',
      sentAt: item.sentAt ? item.sentAt.split('T')[0] : '',
      sentBy: item.sentBy || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.complaintId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        sentAt: form.sentAt ? new Date(form.sentAt).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/communications/${editId}`, payload);
      } else {
        await api.post('/communications', payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) { console.error('Failed to save communication:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this communication?')) return;
    try { await api.delete(`/communications/${id}`); loadData(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Communications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track all complaint-related communications</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Log Communication</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Communications</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{items.filter(i => i.direction === 'INBOUND').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Inbound</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-orange-600">{items.filter(i => i.direction === 'OUTBOUND').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Outbound</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search communications" placeholder="Search communications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by direction" value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Directions</option>
            {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
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
                      <TableHead>Subject</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Sent By</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[250px] truncate">{item.subject || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={item.direction === 'INBOUND' ? 'default' : 'outline'}>
                            {item.direction || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{(item.channel || '').replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-sm">{item.sentBy || '-'}</TableCell>
                        <TableCell className="text-sm">{item.sentAt ? new Date(item.sentAt).toLocaleDateString() : '-'}</TableCell>
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
                <MessagesSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No communications found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Log First Communication</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Communication' : 'Log Communication'} size="lg">
            <div className="space-y-4">
              <div><Label>Complaint ID *</Label><Input value={form.complaintId} onChange={e => setForm(p => ({ ...p, complaintId: e.target.value }))} placeholder="Complaint UUID" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Direction</Label><Select value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value }))}>{DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}</Select></div>
                <div><Label>Channel</Label><Select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>{CHANNELS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Communication subject" /></div>
              <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5} placeholder="Communication content..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sent By</Label><Input value={form.sentBy} onChange={e => setForm(p => ({ ...p, sentBy: e.target.value }))} placeholder="Sender name" /></div>
                <div><Label>Sent At</Label><Input type="date" value={form.sentAt} onChange={e => setForm(p => ({ ...p, sentAt: e.target.value }))} /></div>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.complaintId}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update' : 'Log Communication'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
