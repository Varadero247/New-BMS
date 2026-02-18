'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, Users, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface ToolboxTalk {
  id: string;
  referenceNumber: string;
  topic: string;
  permitId: string;
  content: string;
  presenter: string;
  presenterName: string;
  scheduledDate: string;
  conductedDate: string;
  attendees: string[];
  attendeeCount: number;
  notes: string;
  createdAt: string;
}

interface ToolboxTalkForm {
  topic: string;
  permitId: string;
  content: string;
  presenterName: string;
  scheduledDate: string;
  conductedDate: string;
  attendeeCount: number;
  notes: string;
}

const emptyForm: ToolboxTalkForm = {
  topic: '',
  permitId: '',
  content: '',
  presenterName: '',
  scheduledDate: '',
  conductedDate: '',
  attendeeCount: 0,
  notes: '',
};

export default function ToolboxTalksClient() {
  const [items, setItems] = useState<ToolboxTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ToolboxTalkForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/toolbox-talks', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load toolbox talks:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(item: ToolboxTalk) {
    setForm({
      topic: item.topic || '',
      permitId: item.permitId || '',
      content: item.content || '',
      presenterName: item.presenterName || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      conductedDate: item.conductedDate ? item.conductedDate.split('T')[0] : '',
      attendeeCount: item.attendeeCount || 0,
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.topic) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        conductedDate: form.conductedDate ? new Date(form.conductedDate).toISOString() : undefined,
        permitId: form.permitId || undefined,
      };
      if (editId) {
        await api.put(`/toolbox-talks/${editId}`, payload);
      } else {
        await api.post('/toolbox-talks', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save toolbox talk:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this toolbox talk?')) return;
    try {
      await api.delete(`/toolbox-talks/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Toolbox Talks</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Safety briefings and toolbox talk records
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Toolbox Talk
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Talks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((i) => i.conductedDate).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conducted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {items.filter((i) => i.scheduledDate && !i.conductedDate).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search toolbox talks"
              placeholder="Search toolbox talks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Presenter</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Conducted</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {item.topic}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {item.presenterName || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.conductedDate ? (
                            <span className="text-green-600 dark:text-green-400">
                              {new Date(item.conductedDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.attendeeCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No toolbox talks found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Toolbox Talk
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Toolbox Talk' : 'Add Toolbox Talk'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Topic *</Label>
                <Input
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  placeholder="Toolbox talk topic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Permit ID (optional)</Label>
                  <Input
                    value={form.permitId}
                    onChange={(e) => setForm((p) => ({ ...p, permitId: e.target.value }))}
                    placeholder="Link to permit ID"
                  />
                </div>
                <div>
                  <Label>Presenter Name</Label>
                  <Input
                    value={form.presenterName}
                    onChange={(e) => setForm((p) => ({ ...p, presenterName: e.target.value }))}
                    placeholder="Presenter name"
                  />
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={4}
                  placeholder="Talk content and key points..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Conducted Date</Label>
                  <Input
                    type="date"
                    value={form.conductedDate}
                    onChange={(e) => setForm((p) => ({ ...p, conductedDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Attendee Count</Label>
                <Input
                  type="number"
                  value={form.attendeeCount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, attendeeCount: parseInt(e.target.value) || 0 }))
                  }
                  min={0}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !form.topic}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Talk'
                ) : (
                  'Create Talk'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
