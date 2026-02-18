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
import { Plus, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] as const;

interface Inspection {
  id: string;
  referenceNumber: string;
  assetId: string;
  inspector: string;
  inspectorName: string;
  scheduledDate: string;
  completedDate: string;
  condition: string;
  passed: boolean;
  findings: string;
  recommendations: string;
  nextInspection: string;
  notes: string;
  createdAt: string;
}

interface InspectionForm {
  assetId: string;
  inspector: string;
  inspectorName: string;
  scheduledDate: string;
  completedDate: string;
  condition: string;
  passed: string;
  findings: string;
  recommendations: string;
  nextInspection: string;
  notes: string;
}

const emptyForm: InspectionForm = {
  assetId: '',
  inspector: '',
  inspectorName: '',
  scheduledDate: '',
  completedDate: '',
  condition: 'GOOD',
  passed: 'true',
  findings: '',
  recommendations: '',
  nextInspection: '',
  notes: '',
};

export default function InspectionsClient() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InspectionForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (conditionFilter !== 'all') params.status = conditionFilter;
      const response = await api.get('/inspections', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, conditionFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item: Inspection) {
    setForm({
      assetId: item.assetId || '',
      inspector: item.inspector || '',
      inspectorName: item.inspectorName || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      completedDate: item.completedDate ? item.completedDate.split('T')[0] : '',
      condition: item.condition || 'GOOD',
      passed: item.passed ? 'true' : 'false',
      findings: item.findings || '',
      recommendations: item.recommendations || '',
      nextInspection: item.nextInspection ? item.nextInspection.split('T')[0] : '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.assetId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        passed: form.passed === 'true',
        scheduledDate: form.scheduledDate || undefined,
        completedDate: form.completedDate || undefined,
        nextInspection: form.nextInspection || undefined,
      };
      if (editId) {
        await api.put(`/inspections/${editId}`, payload);
      } else {
        await api.post('/inspections', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save inspection:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this inspection?')) return;
    try {
      await api.delete(`/inspections/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  function getConditionColor(condition: string) {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'POOR':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inspections</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Asset inspection records and scheduling
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Inspection
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((i) => i.passed).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {items.filter((i) => i.passed === false).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {items.filter((i) => i.condition === 'CRITICAL' || i.condition === 'POOR').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Poor/Critical</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search inspections"
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by condition"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-mono text-xs">{item.assetId}</TableCell>
                        <TableCell className="text-sm">{item.inspectorName || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
                          >
                            {item.condition || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.passed ? 'default' : 'destructive'}>
                            {item.passed ? 'PASSED' : 'FAILED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.nextInspection
                            ? new Date(item.nextInspection).toLocaleDateString()
                            : '-'}
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
                <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No inspections found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Inspection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Inspection' : 'Add Inspection'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Asset ID *</Label>
                <Input
                  value={form.assetId}
                  onChange={(e) => setForm((p) => ({ ...p, assetId: e.target.value }))}
                  placeholder="Asset ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inspector ID</Label>
                  <Input
                    value={form.inspector}
                    onChange={(e) => setForm((p) => ({ ...p, inspector: e.target.value }))}
                    placeholder="Inspector ID"
                  />
                </div>
                <div>
                  <Label>Inspector Name</Label>
                  <Input
                    value={form.inspectorName}
                    onChange={(e) => setForm((p) => ({ ...p, inspectorName: e.target.value }))}
                    placeholder="Inspector name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Completed Date</Label>
                  <Input
                    type="date"
                    value={form.completedDate}
                    onChange={(e) => setForm((p) => ({ ...p, completedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Next Inspection</Label>
                  <Input
                    type="date"
                    value={form.nextInspection}
                    onChange={(e) => setForm((p) => ({ ...p, nextInspection: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Condition</Label>
                  <Select
                    value={form.condition}
                    onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Result</Label>
                  <Select
                    value={form.passed}
                    onChange={(e) => setForm((p) => ({ ...p, passed: e.target.value }))}
                  >
                    <option value="true">PASSED</option>
                    <option value="false">FAILED</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Findings</Label>
                <Textarea
                  value={form.findings}
                  onChange={(e) => setForm((p) => ({ ...p, findings: e.target.value }))}
                  rows={2}
                  placeholder="Inspection findings..."
                />
              </div>
              <div>
                <Label>Recommendations</Label>
                <Textarea
                  value={form.recommendations}
                  onChange={(e) => setForm((p) => ({ ...p, recommendations: e.target.value }))}
                  rows={2}
                  placeholder="Recommendations..."
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
              <Button onClick={handleSubmit} disabled={saving || !form.assetId}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Inspection'
                ) : (
                  'Create Inspection'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
