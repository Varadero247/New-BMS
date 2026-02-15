'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, GraduationCap, Users, Calendar, CheckCircle, Search, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

const TRAINING_TYPES = [
  { value: 'INDUCTION', label: 'Induction' },
  { value: 'REFRESHER', label: 'Refresher' },
  { value: 'COMPETENCY', label: 'Competency' },
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'TOOLBOX_TALK', label: 'Toolbox Talk' },
  { value: 'FIRE_SAFETY', label: 'Fire Safety' },
  { value: 'FIRST_AID', label: 'First Aid' },
  { value: 'PPE', label: 'PPE' },
  { value: 'MANUAL_HANDLING', label: 'Manual Handling' },
  { value: 'OTHER', label: 'Other' },
] as const;

const STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800' },
] as const;

interface Training {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  trainingType: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  trainer?: string;
  location?: string;
  participants: number;
  passMark?: number;
  duration?: number;
  notes?: string;
  createdAt: string;
}

interface TrainingForm {
  title: string;
  description: string;
  trainingType: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  trainer: string;
  location: string;
  participants: number;
  passMark: string;
  duration: string;
  notes: string;
}

const emptyForm: TrainingForm = {
  title: '', description: '', trainingType: 'INDUCTION', status: 'SCHEDULED',
  scheduledDate: new Date().toISOString().split('T')[0], completedDate: '',
  trainer: '', location: '', participants: 0, passMark: '', duration: '', notes: '',
};

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TrainingForm>({ ...emptyForm });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTrainings = useCallback(async () => {
    try {
      const response = await api.get('/training').catch(() => ({ data: { data: [] } }));
      setTrainings(response.data.data || []);
    } catch (err) {
      console.error('Failed to load trainings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTrainings(); }, [loadTrainings]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(t: Training) {
    setForm({
      title: t.title, description: t.description || '',
      trainingType: t.trainingType, status: t.status,
      scheduledDate: t.scheduledDate ? t.scheduledDate.split('T')[0] : '',
      completedDate: t.completedDate ? t.completedDate.split('T')[0] : '',
      trainer: t.trainer || '', location: t.location || '',
      participants: t.participants || 0, passMark: t.passMark?.toString() || '',
      duration: t.duration?.toString() || '', notes: t.notes || '',
    });
    setEditingId(t.id);
    setModalOpen(true);
  }

  function updateForm(field: keyof TrainingForm, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.trainingType) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description || undefined,
        trainingType: form.trainingType, status: form.status,
        scheduledDate: form.scheduledDate || undefined,
        completedDate: form.completedDate || undefined,
        trainer: form.trainer || undefined, location: form.location || undefined,
        participants: form.participants || 0,
        passMark: form.passMark ? parseInt(form.passMark) : undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
        notes: form.notes || undefined,
      };
      if (editingId) {
        await api.put(`/training/${editingId}`, payload);
      } else {
        await api.post('/training', payload);
      }
      setModalOpen(false);
      setEditingId(null);
      loadTrainings();
    } catch (err) {
      console.error('Failed to save training:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/training/${id}`);
      setDeleteConfirm(null);
      loadTrainings();
    } catch (err) {
      console.error('Failed to delete training:', err);
    }
  }

  const filtered = trainings.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all' && t.trainingType !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.trainer?.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const s = STATUSES.find(st => st.value === status);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const counts = {
    total: trainings.length,
    scheduled: trainings.filter(t => t.status === 'SCHEDULED').length,
    completed: trainings.filter(t => t.status === 'COMPLETED').length,
    totalParticipants: trainings.reduce((acc, t) => acc + (t.participants || 0), 0),
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Training Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">OHS training and competency tracking</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Training
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p><p className="text-2xl font-bold">{counts.total}</p></div>
                <div className="p-3 bg-purple-100 rounded-full"><GraduationCap className="h-6 w-6 text-purple-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p><p className="text-2xl font-bold text-blue-600">{counts.scheduled}</p></div>
                <div className="p-3 bg-blue-100 rounded-full"><Calendar className="h-6 w-6 text-blue-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-green-600">{counts.completed}</p></div>
                <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Trained</p><p className="text-2xl font-bold">{counts.totalParticipants}</p></div>
                <div className="p-3 bg-orange-100 rounded-full"><Users className="h-6 w-6 text-orange-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search training..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Types</option>
            {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle>Training Register ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-gray-50 dark:bg-gray-800">
                      <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{t.referenceNumber || '-'}</TableCell>
                      <TableCell>
                        <p className="font-medium">{t.title}</p>
                        {t.location && <p className="text-xs text-gray-400 dark:text-gray-500">{t.location}</p>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{t.trainingType.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">{t.trainer || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-sm text-center">{t.participants || 0}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>{t.status}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(t)} className="text-gray-400 dark:text-gray-500 hover:text-blue-600 p-1 text-xs border rounded hover:border-blue-300">Edit</button>
                          <button onClick={() => setDeleteConfirm(t.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No training sessions found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Schedule First Training</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Training Session' : 'Schedule Training Session'} size="lg">
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="e.g., Fire Safety Awareness" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Training Type *</Label>
                <Select value={form.trainingType} onChange={e => updateForm('trainingType', e.target.value)}>
                  {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={e => updateForm('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Scheduled Date</Label><Input type="date" value={form.scheduledDate} onChange={e => updateForm('scheduledDate', e.target.value)} /></div>
              <div><Label>Completed Date</Label><Input type="date" value={form.completedDate} onChange={e => updateForm('completedDate', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Trainer</Label><Input value={form.trainer} onChange={e => updateForm('trainer', e.target.value)} placeholder="Trainer name" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => updateForm('location', e.target.value)} placeholder="e.g., Training Room A" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Participants</Label><Input type="number" value={form.participants} onChange={e => updateForm('participants', parseInt(e.target.value) || 0)} min="0" /></div>
              <div><Label>Pass Mark (%)</Label><Input type="number" value={form.passMark} onChange={e => updateForm('passMark', e.target.value)} min="0" max="100" placeholder="e.g., 80" /></div>
              <div><Label>Duration (mins)</Label><Input type="number" value={form.duration} onChange={e => updateForm('duration', e.target.value)} min="0" placeholder="e.g., 60" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={2} placeholder="Training objectives and overview..." /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={2} placeholder="Additional notes..." /></div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.title}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editingId ? 'Update Session' : 'Schedule Session'}
            </Button>
          </ModalFooter>
        </Modal>

        {deleteConfirm && (
          <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Training Session" size="sm">
            <p className="text-gray-600">Are you sure you want to delete this training session? This action cannot be undone.</p>
            <ModalFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
