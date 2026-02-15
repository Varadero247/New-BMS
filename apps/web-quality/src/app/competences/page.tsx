'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Competence {
  id: string;
  referenceNumber: string;
  employeeName: string;
  employeeId: string | null;
  role: string | null;
  department: string | null;
  competencyArea: string;
  requiredLevel: string | null;
  currentLevel: string | null;
  status: string;
  trainingCompleted: string | null;
  certifications: string | null;
  assessmentDate: string | null;
  nextReviewDate: string | null;
  assessor: string | null;
  evidence: string | null;
  gapAnalysis: string | null;
  actionPlan: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUSES = ['COMPETENT', 'IN_TRAINING', 'NOT_COMPETENT', 'EXPIRED'] as const;
const statusColors: Record<string, string> = { COMPETENT: 'success', IN_TRAINING: 'info', NOT_COMPETENT: 'danger', EXPIRED: 'warning' };

export default function CompetencesPage() {
  const [items, setItems] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Competence | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [form, setForm] = useState({
    employeeName: '', employeeId: '', role: '', department: '', competencyArea: '',
    requiredLevel: '', currentLevel: '', status: 'IN_TRAINING',
    trainingCompleted: '', certifications: '', assessmentDate: '', nextReviewDate: '',
    assessor: '', evidence: '', gapAnalysis: '', actionPlan: '', notes: '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '25' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/competences', { params });
      setItems(res.data.data);
      setPagination(p => ({ ...p, total: res.data.pagination.total, totalPages: res.data.pagination.totalPages }));
    } catch { /* empty */ }
    setLoading(false);
  }, [pagination.page, search, filterStatus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ employeeName: '', employeeId: '', role: '', department: '', competencyArea: '', requiredLevel: '', currentLevel: '', status: 'IN_TRAINING', trainingCompleted: '', certifications: '', assessmentDate: '', nextReviewDate: '', assessor: '', evidence: '', gapAnalysis: '', actionPlan: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (item: Competence) => {
    setEditItem(item);
    setForm({
      employeeName: item.employeeName, employeeId: item.employeeId || '', role: item.role || '',
      department: item.department || '', competencyArea: item.competencyArea,
      requiredLevel: item.requiredLevel || '', currentLevel: item.currentLevel || '',
      status: item.status, trainingCompleted: item.trainingCompleted || '',
      certifications: item.certifications || '', assessmentDate: item.assessmentDate?.slice(0, 10) || '',
      nextReviewDate: item.nextReviewDate?.slice(0, 10) || '', assessor: item.assessor || '',
      evidence: item.evidence || '', gapAnalysis: item.gapAnalysis || '',
      actionPlan: item.actionPlan || '', notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) { await api.put(`/competences/${editItem.id}`, form); }
      else { await api.post('/competences', form); }
      setModalOpen(false);
      fetchItems();
    } catch { /* empty */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this competence record?')) return;
    try { await api.delete(`/competences/${id}`); fetchItems(); } catch { /* empty */ }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Competence Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO 9001:2015 §7.2 — Competence</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Record</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{pagination.total}</div><div className="text-sm text-gray-500 dark:text-gray-400">Total Records</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'COMPETENT').length}</div><div className="text-sm text-gray-500 dark:text-gray-400">Competent</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'IN_TRAINING').length}</div><div className="text-sm text-gray-500 dark:text-gray-400">In Training</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{items.filter(i => i.status === 'NOT_COMPETENT' || i.status === 'EXPIRED').length}</div><div className="text-sm text-gray-500 dark:text-gray-400">Gaps</div></CardContent></Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input placeholder="Search employees or competency areas..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="pl-10" />
        </div>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </Select>
        <Button variant="outline" onClick={fetchItems}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Reference</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Employee</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Department</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Competency Area</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Next Review</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">No competence records found</td></tr>
                ) : items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="p-3 font-mono text-xs text-blue-600">{item.referenceNumber}</td>
                    <td className="p-3 font-medium">{item.employeeName}</td>
                    <td className="p-3 text-gray-600">{item.department || '—'}</td>
                    <td className="p-3 text-gray-600">{item.competencyArea}</td>
                    <td className="p-3"><Badge variant={statusColors[item.status] as any}>{item.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="p-3 text-gray-600">{item.nextReviewDate ? new Date(item.nextReviewDate).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Competence Record' : 'Add Competence Record'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Employee Name *</Label><Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
          <div><Label>Employee ID</Label><Input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} /></div>
          <div><Label>Role</Label><Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
          <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
          <div><Label>Competency Area *</Label><Input value={form.competencyArea} onChange={e => setForm(f => ({ ...f, competencyArea: e.target.value }))} /></div>
          <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
          <div><Label>Required Level</Label><Input value={form.requiredLevel} onChange={e => setForm(f => ({ ...f, requiredLevel: e.target.value }))} /></div>
          <div><Label>Current Level</Label><Input value={form.currentLevel} onChange={e => setForm(f => ({ ...f, currentLevel: e.target.value }))} /></div>
          <div><Label>Assessment Date</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
          <div><Label>Next Review Date</Label><Input type="date" value={form.nextReviewDate} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
          <div><Label>Assessor</Label><Input value={form.assessor} onChange={e => setForm(f => ({ ...f, assessor: e.target.value }))} /></div>
          <div><Label>Certifications</Label><Input value={form.certifications} onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Training Completed</Label><Textarea value={form.trainingCompleted} onChange={e => setForm(f => ({ ...f, trainingCompleted: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Gap Analysis</Label><Textarea value={form.gapAnalysis} onChange={e => setForm(f => ({ ...f, gapAnalysis: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Action Plan</Label><Textarea value={form.actionPlan} onChange={e => setForm(f => ({ ...f, actionPlan: e.target.value }))} /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editItem ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
