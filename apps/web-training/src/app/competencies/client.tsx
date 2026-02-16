'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, Award, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const LEVELS = ['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED'] as const;

interface Competency {
  id: string;
  referenceNumber: string;
  name: string;
  description: string;
  department: string;
  role: string;
  requiredLevel: string;
  assessmentMethod: string;
  isActive: boolean;
  createdAt: string;
}

interface CompetencyForm {
  name: string;
  description: string;
  department: string;
  role: string;
  requiredLevel: string;
  assessmentMethod: string;
  isActive: boolean;
}

const emptyForm: CompetencyForm = {
  name: '', description: '', department: '', role: '',
  requiredLevel: 'COMPETENT', assessmentMethod: '', isActive: true,
};

export default function CompetenciesClient() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompetencyForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const loadCompetencies = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (levelFilter !== 'all') params.status = levelFilter;
      const response = await api.get('/competencies', { params });
      setCompetencies(response.data.data || []);
    } catch (err) {
      console.error('Failed to load competencies:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, levelFilter]);

  useEffect(() => { loadCompetencies(); }, [loadCompetencies]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(comp: Competency) {
    setForm({
      name: comp.name || '', description: comp.description || '',
      department: comp.department || '', role: comp.role || '',
      requiredLevel: comp.requiredLevel || 'COMPETENT',
      assessmentMethod: comp.assessmentMethod || '',
      isActive: comp.isActive !== false,
    });
    setEditId(comp.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/competencies/${editId}`, form);
      } else {
        await api.post('/competencies', form);
      }
      setModalOpen(false);
      loadCompetencies();
    } catch (err) { console.error('Failed to save competency:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this competency?')) return;
    try { await api.delete(`/competencies/${id}`); loadCompetencies(); } catch (err) { console.error(err); }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Competencies</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Define and manage competency requirements</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Competency</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{competencies.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Competencies</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-purple-600">{competencies.filter(c => c.requiredLevel === 'EXPERT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Expert Level</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{competencies.filter(c => c.requiredLevel === 'COMPETENT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Competent Level</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{competencies.filter(c => c.isActive !== false).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Active</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search competencies" placeholder="Search competencies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by level" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : competencies.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Required Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competencies.map(comp => (
                      <TableRow key={comp.id}>
                        <TableCell className="font-mono text-xs">{comp.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{comp.name}</TableCell>
                        <TableCell className="text-sm">{comp.department || '-'}</TableCell>
                        <TableCell className="text-sm">{comp.role || '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(comp.requiredLevel)}`}>{comp.requiredLevel?.replace(/_/g, ' ') || '-'}</span></TableCell>
                        <TableCell><Badge variant={comp.isActive !== false ? 'default' : 'secondary'}>{comp.isActive !== false ? 'Active' : 'Inactive'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(comp)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(comp.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No competencies found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Competency</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Competency' : 'Add Competency'} size="lg">
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Competency name" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe this competency..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" /></div>
                <div><Label>Role</Label><Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Job role" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Required Level</Label><Select value={form.requiredLevel} onChange={e => setForm(p => ({ ...p, requiredLevel: e.target.value }))}>{LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Assessment Method</Label><Input value={form.assessmentMethod} onChange={e => setForm(p => ({ ...p, assessmentMethod: e.target.value }))} placeholder="e.g. Practical assessment" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="compActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="compActive">Active</Label>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.name}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Competency' : 'Create Competency'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
