'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
  Button,
} from '@ims/ui';
import { ShieldCheck, Plus, Loader2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

// Base URL for the risk service is /api/risk (see apps/web-risk/src/lib/api.ts)
// Controls are accessed at /api/risk/:riskId/controls

interface Risk {
  id: string;
  referenceNumber: string;
  title: string;
  category: string;
  status: string;
}

interface Control {
  id: string;
  controlType: 'PREVENTIVE' | 'DETECTIVE' | 'REACTIVE' | 'DIRECTIVE';
  description: string;
  owner?: string;
  effectiveness?: 'STRONG' | 'ADEQUATE' | 'WEAK' | 'NONE_EFFECTIVE';
  lastTestedDate?: string;
  testingFrequency?: string;
  nextTestDate?: string;
  isActive: boolean;
}

interface ControlForm {
  controlType: string;
  description: string;
  owner: string;
  effectiveness: string;
  testingFrequency: string;
}

const CONTROL_TYPES = ['PREVENTIVE', 'DETECTIVE', 'REACTIVE', 'DIRECTIVE'] as const;
const EFFECTIVENESS_LEVELS = ['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE'] as const;

const CONTROL_TYPE_COLORS: Record<string, string> = {
  PREVENTIVE: 'bg-blue-100 text-blue-700',
  DETECTIVE: 'bg-yellow-100 text-yellow-700',
  REACTIVE: 'bg-red-100 text-red-700',
  DIRECTIVE: 'bg-purple-100 text-purple-700',
};

const EFFECTIVENESS_COLORS: Record<string, string> = {
  STRONG: 'bg-green-100 text-green-700',
  ADEQUATE: 'bg-blue-100 text-blue-700',
  WEAK: 'bg-yellow-100 text-yellow-700',
  NONE_EFFECTIVE: 'bg-red-100 text-red-700',
};

const emptyForm: ControlForm = {
  controlType: 'PREVENTIVE',
  description: '',
  owner: '',
  effectiveness: 'ADEQUATE',
  testingFrequency: '',
};

function formatLabel(val: string): string {
  return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ControlsClient() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [risksLoading, setRisksLoading] = useState(true);
  const [selectedRiskId, setSelectedRiskId] = useState<string>('');
  const [controls, setControls] = useState<Control[]>([]);
  const [controlsLoading, setControlsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ControlForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Fetch all risks for the dropdown
  const loadRisks = useCallback(async () => {
    setRisksLoading(true);
    try {
      const response = await api.get('/risks');
      const risksData: Risk[] = response.data.data?.risks ?? response.data.data ?? [];
      setRisks(risksData);
      if (risksData.length > 0 && !selectedRiskId) {
        setSelectedRiskId(risksData[0].id);
      }
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setRisksLoading(false);
    }
  }, [selectedRiskId]);

  // Fetch controls for the selected risk
  const loadControls = useCallback(async (riskId: string) => {
    if (!riskId) return;
    setControlsLoading(true);
    try {
      const response = await api.get(`/${riskId}/controls`);
      setControls(response.data.data ?? []);
    } catch (err) {
      console.error('Failed to load controls:', err);
      setControls([]);
    } finally {
      setControlsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  useEffect(() => {
    if (selectedRiskId) {
      loadControls(selectedRiskId);
    }
  }, [selectedRiskId, loadControls]);

  const selectedRisk = risks.find((r) => r.id === selectedRiskId);

  function openAddModal() {
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.description || !selectedRiskId) return;
    setSaving(true);
    try {
      await api.post(`/${selectedRiskId}/controls`, {
        controlType: form.controlType,
        description: form.description,
        owner: form.owner || undefined,
        effectiveness: form.effectiveness || undefined,
        testingFrequency: form.testingFrequency || undefined,
      });
      setModalOpen(false);
      loadControls(selectedRiskId);
    } catch (err) {
      console.error('Failed to create control:', err);
    } finally {
      setSaving(false);
    }
  }

  const activeControls = controls.filter((c) => c.isActive !== false);
  const inactiveControls = controls.filter((c) => c.isActive === false);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Risk Controls
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Preventive, detective, reactive, and directive controls by risk
              </p>
            </div>
          </div>
          <Button
            onClick={openAddModal}
            disabled={!selectedRiskId}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Control
          </Button>
        </div>

        {/* Risk selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4 text-gray-400" />
                <Label>Select Risk</Label>
              </div>
              {risksLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading risks…
                </div>
              ) : (
                <select
                  aria-label="Select a risk"
                  value={selectedRiskId}
                  onChange={(e) => setSelectedRiskId(e.target.value)}
                  className="flex-1 max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {risks.length === 0 && (
                    <option value="">No risks found</option>
                  )}
                  {risks.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.referenceNumber} — {r.title}
                    </option>
                  ))}
                </select>
              )}
              {selectedRisk && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedRisk.category.replace(/_/g, ' ')}</Badge>
                  <Badge
                    variant={
                      selectedRisk.status === 'CLOSED'
                        ? 'secondary'
                        : selectedRisk.status === 'TREATING'
                          ? 'default'
                          : 'outline'
                    }
                  >
                    {selectedRisk.status}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary stats */}
        {selectedRiskId && !controlsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {CONTROL_TYPES.map((ct) => {
              const count = controls.filter((c) => c.controlType === ct).length;
              return (
                <Card key={ct}>
                  <CardContent className="pt-5 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${CONTROL_TYPE_COLORS[ct] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {formatLabel(ct)}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Controls table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {selectedRisk
                ? `Controls for: ${selectedRisk.referenceNumber} — ${selectedRisk.title}`
                : 'Select a risk to view its controls'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedRiskId ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                Choose a risk from the dropdown above to view associated controls.
              </div>
            ) : controlsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : controls.length === 0 ? (
              <div className="text-center py-16">
                <ShieldCheck className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No controls recorded for this risk.
                </p>
                <Button variant="outline" className="mt-4" onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Control
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Effectiveness</TableHead>
                      <TableHead>Testing Frequency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...activeControls, ...inactiveControls].map((ctrl) => (
                      <TableRow key={ctrl.id} className={ctrl.isActive === false ? 'opacity-50' : ''}>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CONTROL_TYPE_COLORS[ctrl.controlType] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {formatLabel(ctrl.controlType)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-800 dark:text-gray-200 max-w-xs">
                          {ctrl.description}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {ctrl.owner ?? '—'}
                        </TableCell>
                        <TableCell>
                          {ctrl.effectiveness ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${EFFECTIVENESS_COLORS[ctrl.effectiveness] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                              {formatLabel(ctrl.effectiveness)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not rated</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {ctrl.testingFrequency ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ctrl.isActive !== false ? 'default' : 'secondary'}>
                            {ctrl.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Control Modal */}
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Add Risk Control"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Control Type *</Label>
                <Select
                  value={form.controlType}
                  onChange={(e) => setForm((p) => ({ ...p, controlType: e.target.value }))}
                >
                  {CONTROL_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {formatLabel(ct)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the control and how it mitigates the risk…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner</Label>
                  <Input
                    value={form.owner}
                    onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))}
                    placeholder="Control owner name or role"
                  />
                </div>
                <div>
                  <Label>Effectiveness</Label>
                  <Select
                    value={form.effectiveness}
                    onChange={(e) => setForm((p) => ({ ...p, effectiveness: e.target.value }))}
                  >
                    {EFFECTIVENESS_LEVELS.map((el) => (
                      <option key={el} value={el}>
                        {formatLabel(el)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Testing Frequency</Label>
                <Input
                  value={form.testingFrequency}
                  onChange={(e) => setForm((p) => ({ ...p, testingFrequency: e.target.value }))}
                  placeholder="e.g. Monthly, Quarterly, Annually"
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !form.description}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  'Add Control'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
