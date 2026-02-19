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
  Select,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import {
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  User,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface PEEP {
  id: string;
  referenceNumber: string;
  personName: string;
  personRole: string;
  department: string;
  premisesId: string;
  premisesName: string;
  floor: string;
  disabilityType: string;
  mobilityAid: string;
  evacuationMethod: string;
  assemblyPoint: string;
  wardenAssigned: string;
  reviewStatus: string;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  createdAt: string;
  notes: string;
}

interface PEEPForm {
  personName: string;
  personRole: string;
  department: string;
  premisesId: string;
  floor: string;
  disabilityType: string;
  mobilityAid: string;
  evacuationMethod: string;
  assemblyPoint: string;
  wardenAssigned: string;
  notes: string;
}

const DISABILITY_TYPES = [
  'MOBILITY_IMPAIRMENT',
  'VISUAL_IMPAIRMENT',
  'HEARING_IMPAIRMENT',
  'COGNITIVE_IMPAIRMENT',
  'MEDICAL_CONDITION',
  'TEMPORARY_INJURY',
  'MULTIPLE',
  'OTHER',
] as const;

const EVACUATION_METHODS = [
  'REFUGE_AREA',
  'EVAC_CHAIR',
  'ASSISTED_CARRY',
  'SELF_EVACUATION',
  'HORIZONTAL_EVACUATION',
  'OTHER',
] as const;

const emptyForm: PEEPForm = {
  personName: '',
  personRole: '',
  department: '',
  premisesId: '',
  floor: '',
  disabilityType: 'MOBILITY_IMPAIRMENT',
  mobilityAid: '',
  evacuationMethod: 'REFUGE_AREA',
  assemblyPoint: '',
  wardenAssigned: '',
  notes: '',
};

function ReviewStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CURRENT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3" /> Current
        </span>
      );
    case 'DUE_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Clock className="h-3 w-3" /> Due Review
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-3 w-3" /> Overdue
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Clock className="h-3 w-3" /> {status.replace(/_/g, ' ')}
        </span>
      );
  }
}

export default function PEEPPage() {
  const [peeps, setPeeps] = useState<PEEP[]>([]);
  const [_alerts, setAlerts] = useState<PEEP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PEEPForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const loadPEEPs = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.reviewStatus = statusFilter;
      const [peepRes, alertRes] = await Promise.all([
        api.get('/peep', { params }),
        api.get('/peep/due-review').catch(() => ({ data: { data: [] } })),
      ]);
      setPeeps(peepRes.data.data || []);
      setAlerts(alertRes.data.data || []);
    } catch {
      setError('Failed to load PEEPs.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadPEEPs();
    api
      .get('/premises')
      .then((r) => setPremises(r.data.data || []))
      .catch(() => {});
  }, [loadPEEPs]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(peep: PEEP) {
    setForm({
      personName: peep.personName || '',
      personRole: peep.personRole || '',
      department: peep.department || '',
      premisesId: peep.premisesId || '',
      floor: peep.floor || '',
      disabilityType: peep.disabilityType || 'MOBILITY_IMPAIRMENT',
      mobilityAid: peep.mobilityAid || '',
      evacuationMethod: peep.evacuationMethod || 'REFUGE_AREA',
      assemblyPoint: peep.assemblyPoint || '',
      wardenAssigned: peep.wardenAssigned || '',
      notes: peep.notes || '',
    });
    setEditId(peep.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.personName || !form.premisesId) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/peep/${editId}`, form);
      } else {
        await api.post('/peep', form);
      }
      setModalOpen(false);
      loadPEEPs();
    } catch {
      setError('Failed to save PEEP.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this PEEP? This action cannot be undone.')) return;
    try {
      await api.delete(`/peep/${id}`);
      loadPEEPs();
    } catch {
      setError('Failed to delete PEEP.');
    }
  }

  const overdue = peeps.filter((p) => p.reviewStatus === 'OVERDUE').length;
  const dueReview = peeps.filter((p) => p.reviewStatus === 'DUE_REVIEW').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">PEEP Register</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Personal Emergency Evacuation Plans for all premises
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              <Plus className="h-4 w-4" />
              New PEEP
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Alert Banner for overdue PEEPs */}
          {(overdue > 0 || dueReview > 0) && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-center gap-4"
              style={{ backgroundColor: '#FEE2E4', borderColor: '#F04B5A' }}
            >
              <AlertTriangle className="h-6 w-6 flex-shrink-0" style={{ color: '#F04B5A' }} />
              <div>
                {overdue > 0 && (
                  <p className="font-semibold" style={{ color: '#B91C2A' }}>
                    {overdue} PEEP{overdue > 1 ? 's' : ''} overdue for review
                  </p>
                )}
                {dueReview > 0 && (
                  <p className="text-sm" style={{ color: '#F04B5A' }}>
                    {dueReview} PEEP{dueReview > 1 ? 's' : ''} coming up for review
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{peeps.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total PEEPs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {peeps.filter((p) => p.reviewStatus === 'CURRENT').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">{dueReview}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#F04B5A' }}>
                  {overdue}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, premises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'CURRENT', 'DUE_REVIEW', 'OVERDUE'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === f
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  style={statusFilter === f ? { backgroundColor: '#F04B5A' } : undefined}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* PEEP Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : peeps.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Person</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Floor / Area</TableHead>
                        <TableHead>Disability Type</TableHead>
                        <TableHead>Evacuation Method</TableHead>
                        <TableHead>Warden</TableHead>
                        <TableHead>Review Status</TableHead>
                        <TableHead>Next Review</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {peeps.map((peep) => (
                        <TableRow key={peep.id}>
                          <TableCell className="font-mono text-xs">
                            {peep.referenceNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#FEE2E4' }}
                              >
                                <User className="h-4 w-4" style={{ color: '#F04B5A' }} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{peep.personName}</p>
                                <p className="text-xs text-gray-500">{peep.personRole}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{peep.premisesName}</TableCell>
                          <TableCell className="text-sm">{peep.floor || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {peep.disabilityType?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {peep.evacuationMethod?.replace(/_/g, ' ') || '-'}
                          </TableCell>
                          <TableCell className="text-sm">{peep.wardenAssigned || '-'}</TableCell>
                          <TableCell>
                            <ReviewStatusBadge status={peep.reviewStatus} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {peep.nextReviewDate ? (
                              <span
                                className={
                                  new Date(peep.nextReviewDate) < new Date()
                                    ? 'text-red-600 font-medium'
                                    : ''
                                }
                              >
                                {new Date(peep.nextReviewDate).toLocaleDateString()}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEdit(peep)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(peep.id)}
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
                  <p className="text-gray-500 dark:text-gray-400">No PEEPs found</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First PEEP
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editId ? 'Edit PEEP' : 'New PEEP'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Person Name *</Label>
                <Input
                  value={form.personName}
                  onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Role / Job Title</Label>
                <Input
                  value={form.personRole}
                  onChange={(e) => setForm((f) => ({ ...f, personRole: e.target.value }))}
                  placeholder="Job title"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="Department"
                />
              </div>
              <div>
                <Label>Premises *</Label>
                <Select
                  value={form.premisesId}
                  onChange={(e) => setForm((f) => ({ ...f, premisesId: e.target.value }))}
                >
                  <option value="">Select premises...</option>
                  {premises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Floor / Area</Label>
                <Input
                  value={form.floor}
                  onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                  placeholder="e.g. 3rd floor east"
                />
              </div>
              <div>
                <Label>Disability / Need Type</Label>
                <Select
                  value={form.disabilityType}
                  onChange={(e) => setForm((f) => ({ ...f, disabilityType: e.target.value }))}
                >
                  {DISABILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Mobility Aid</Label>
                <Input
                  value={form.mobilityAid}
                  onChange={(e) => setForm((f) => ({ ...f, mobilityAid: e.target.value }))}
                  placeholder="e.g. Wheelchair, crutches"
                />
              </div>
              <div>
                <Label>Evacuation Method</Label>
                <Select
                  value={form.evacuationMethod}
                  onChange={(e) => setForm((f) => ({ ...f, evacuationMethod: e.target.value }))}
                >
                  {EVACUATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Assembly Point</Label>
                <Input
                  value={form.assemblyPoint}
                  onChange={(e) => setForm((f) => ({ ...f, assemblyPoint: e.target.value }))}
                  placeholder="Assembly point location"
                />
              </div>
              <div>
                <Label>Warden Assigned</Label>
                <Input
                  value={form.wardenAssigned}
                  onChange={(e) => setForm((f) => ({ ...f, wardenAssigned: e.target.value }))}
                  placeholder="Warden name"
                />
              </div>
            </div>
            <div>
              <Label>Notes / Special Instructions</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Any special requirements, medical notes, or evacuation instructions..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.personName || !form.premisesId}
              className="text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                'Update PEEP'
              ) : (
                'Create PEEP'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
