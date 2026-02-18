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
  CalendarCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Timer,
  Users,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Drill {
  id: string;
  referenceNumber: string;
  premisesId: string;
  premisesName: string;
  drillDate: string;
  drillType: string;
  scenario: string;
  participantCount: number;
  evacuationTime: number | null;
  targetEvacuationTime: number | null;
  outcome: string;
  findings: string;
  recommendations: string;
  conductedBy: string;
  nextDrillDate: string | null;
  createdAt: string;
}

interface DrillAnalytics {
  totalDrills: number;
  passRate: number;
  avgEvacuationTime: number;
  overdueCount: number;
  recentDrills: Drill[];
}

interface DrillForm {
  premisesId: string;
  drillDate: string;
  drillType: string;
  scenario: string;
  participantCount: number;
  evacuationTime: number | null;
  targetEvacuationTime: number | null;
  outcome: string;
  findings: string;
  recommendations: string;
  conductedBy: string;
  nextDrillDate: string;
}

const DRILL_TYPES = [
  'FULL_EVACUATION',
  'PARTIAL_EVACUATION',
  'DESKTOP_EXERCISE',
  'FIRE_WARDEN_EXERCISE',
  'LOCKDOWN_DRILL',
  'OTHER',
] as const;

const emptyForm: DrillForm = {
  premisesId: '',
  drillDate: new Date().toISOString().split('T')[0],
  drillType: 'FULL_EVACUATION',
  scenario: '',
  participantCount: 0,
  evacuationTime: null,
  targetEvacuationTime: null,
  outcome: 'PASS',
  findings: '',
  recommendations: '',
  conductedBy: '',
  nextDrillDate: '',
};

export default function DrillsPage() {
  const [analytics, setAnalytics] = useState<DrillAnalytics | null>(null);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DrillForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (outcomeFilter !== 'ALL') params.outcome = outcomeFilter;
      const [analyticsRes, drillsRes] = await Promise.all([
        api.get('/drills/analytics'),
        api.get('/drills', { params }),
      ]);
      setAnalytics(analyticsRes.data.data);
      setDrills(drillsRes.data.data || []);
    } catch {
      setError('Failed to load drill data.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, outcomeFilter]);

  useEffect(() => {
    load();
    api
      .get('/premises')
      .then((r) => setPremises(r.data.data || []))
      .catch(() => {});
  }, [load]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(drill: Drill) {
    setForm({
      premisesId: drill.premisesId || '',
      drillDate: drill.drillDate ? drill.drillDate.split('T')[0] : '',
      drillType: drill.drillType || 'FULL_EVACUATION',
      scenario: drill.scenario || '',
      participantCount: drill.participantCount || 0,
      evacuationTime: drill.evacuationTime,
      targetEvacuationTime: drill.targetEvacuationTime,
      outcome: drill.outcome || 'PASS',
      findings: drill.findings || '',
      recommendations: drill.recommendations || '',
      conductedBy: drill.conductedBy || '',
      nextDrillDate: drill.nextDrillDate ? drill.nextDrillDate.split('T')[0] : '',
    });
    setEditId(drill.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.premisesId || !form.drillDate) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        drillDate: new Date(form.drillDate).toISOString(),
        nextDrillDate: form.nextDrillDate ? new Date(form.nextDrillDate).toISOString() : null,
      };
      if (editId) {
        await api.put(`/drills/${editId}`, payload);
      } else {
        await api.post('/drills', payload);
      }
      setModalOpen(false);
      load();
    } catch {
      setError('Failed to save drill.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this drill record?')) return;
    try {
      await api.delete(`/drills/${id}`);
      load();
    } catch {
      setError('Failed to delete drill.');
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Evacuation Drills
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Drill schedule, results and performance analytics
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              <Plus className="h-4 w-4" />
              Record Drill
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Analytics cards */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{analytics.totalDrills}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Total Drills
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#FEE2E4' }}
                    >
                      <CalendarCheck className="h-5 w-5" style={{ color: '#F04B5A' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        {analytics.passRate != null ? `${Math.round(analytics.passRate)}%` : '-'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pass Rate</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics.avgEvacuationTime != null
                          ? `${Math.round(analytics.avgEvacuationTime)}m`
                          : '-'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Avg Evacuation Time
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: analytics.overdueCount > 0 ? '#F04B5A' : '#10B981' }}
                      >
                        {analytics.overdueCount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Drills Overdue
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: analytics.overdueCount > 0 ? '#FEE2E4' : '#ECFDF5',
                      }}
                    >
                      <AlertTriangle
                        className="h-5 w-5"
                        style={{ color: analytics.overdueCount > 0 ? '#F04B5A' : '#10B981' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'PASS', 'FAIL', 'PARTIAL'].map((f) => (
                <button
                  key={f}
                  onClick={() => setOutcomeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    outcomeFilter === f
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  style={outcomeFilter === f ? { backgroundColor: '#F04B5A' } : undefined}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Drills Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : drills.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Evacuation Time</TableHead>
                        <TableHead>Target Time</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Next Drill</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drills.map((drill) => {
                        const timeMet =
                          drill.evacuationTime != null &&
                          drill.targetEvacuationTime != null &&
                          drill.evacuationTime <= drill.targetEvacuationTime;
                        return (
                          <TableRow key={drill.id}>
                            <TableCell className="font-mono text-xs">
                              {drill.referenceNumber}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(drill.drillDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm">{drill.premisesName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{drill.drillType?.replace(/_/g, ' ')}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span>{drill.participantCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {drill.evacuationTime != null ? (
                                <div className="flex items-center gap-1">
                                  <Timer className="h-4 w-4 text-gray-400" />
                                  <span
                                    className={
                                      timeMet
                                        ? 'text-green-600 font-medium'
                                        : 'text-red-600 font-medium'
                                    }
                                  >
                                    {drill.evacuationTime} mins
                                  </span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {drill.targetEvacuationTime != null
                                ? `${drill.targetEvacuationTime} mins`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {drill.outcome === 'PASS' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : drill.outcome === 'FAIL' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span
                                  className={
                                    drill.outcome === 'PASS'
                                      ? 'text-green-600 font-medium'
                                      : drill.outcome === 'FAIL'
                                        ? 'text-red-600 font-medium'
                                        : 'text-amber-600 font-medium'
                                  }
                                >
                                  {drill.outcome}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {drill.nextDrillDate ? (
                                <span
                                  className={
                                    new Date(drill.nextDrillDate) < new Date()
                                      ? 'text-red-600 font-medium'
                                      : ''
                                  }
                                >
                                  {new Date(drill.nextDrillDate).toLocaleDateString()}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(drill)}>
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(drill.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No drills recorded yet</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Drill
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
          title={editId ? 'Edit Drill Record' : 'Record Evacuation Drill'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Drill Date *</Label>
                <Input
                  type="date"
                  value={form.drillDate}
                  onChange={(e) => setForm((f) => ({ ...f, drillDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Drill Type</Label>
                <Select
                  value={form.drillType}
                  onChange={(e) => setForm((f) => ({ ...f, drillType: e.target.value }))}
                >
                  {DRILL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Outcome</Label>
                <Select
                  value={form.outcome}
                  onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
                >
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                  <option value="PARTIAL">Partial</option>
                </Select>
              </div>
              <div>
                <Label>Number of Participants</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.participantCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, participantCount: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div>
                <Label>Conducted By</Label>
                <Input
                  value={form.conductedBy}
                  onChange={(e) => setForm((f) => ({ ...f, conductedBy: e.target.value }))}
                  placeholder="Name of drill controller"
                />
              </div>
              <div>
                <Label>Actual Evacuation Time (mins)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.evacuationTime ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      evacuationTime: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Minutes to complete"
                />
              </div>
              <div>
                <Label>Target Evacuation Time (mins)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.targetEvacuationTime ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetEvacuationTime: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Target in minutes"
                />
              </div>
            </div>
            <div>
              <Label>Scenario / Description</Label>
              <Input
                value={form.scenario}
                onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
                placeholder="e.g. Simulated kitchen fire, ground floor"
              />
            </div>
            <div>
              <Label>Findings</Label>
              <Textarea
                value={form.findings}
                onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
                rows={3}
                placeholder="Key observations and findings from the drill..."
              />
            </div>
            <div>
              <Label>Recommendations</Label>
              <Textarea
                value={form.recommendations}
                onChange={(e) => setForm((f) => ({ ...f, recommendations: e.target.value }))}
                rows={2}
                placeholder="Recommended improvements..."
              />
            </div>
            <div>
              <Label>Next Drill Date</Label>
              <Input
                type="date"
                value={form.nextDrillDate}
                onChange={(e) => setForm((f) => ({ ...f, nextDrillDate: e.target.value }))}
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.premisesId || !form.drillDate}
              className="text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                'Update Drill'
              ) : (
                'Record Drill'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
