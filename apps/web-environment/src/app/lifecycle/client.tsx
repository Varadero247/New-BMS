'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Recycle, Plus, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface LifeCycleAssessment {
  id: string;
  refNumber: string;
  title: string;
  productProcess: string;
  description?: string;
  status: string;
  stages: LifeCycleStage[];
  createdAt: string;
}

interface LifeCycleStage {
  id: string;
  assessmentId: string;
  stageName: string;
  aspects?: string;
  impacts?: string;
  severity?: number;
  controls?: string;
  supplierReqs?: string;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

const STAGE_LABELS: Record<string, string> = {
  RAW_MATERIAL_EXTRACTION: 'Raw Material Extraction',
  MANUFACTURING: 'Manufacturing',
  DISTRIBUTION: 'Distribution',
  USE: 'Use Phase',
  END_OF_LIFE: 'End of Life / Disposal',
};

const SEVERITY_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

export default function LifeCycleAssessmentPage() {
  const [assessments, setAssessments] = useState<LifeCycleAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<LifeCycleAssessment | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', productProcess: '', description: '' });

  const [editingStage, setEditingStage] = useState<LifeCycleStage | null>(null);
  const [stageForm, setStageForm] = useState({ aspects: '', impacts: '', severity: 1, controls: '', supplierReqs: '', notes: '' });

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await api.get('/lifecycle/assessments');
      setAssessments(res.data.data || []);
    } catch { setAssessments([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAssessments().finally(() => setLoading(false));
  }, [fetchAssessments]);

  const handleCreate = async () => {
    try {
      await api.post('/lifecycle/assessments', createForm);
      setShowCreateModal(false);
      setCreateForm({ title: '', productProcess: '', description: '' });
      fetchAssessments();
    } catch (err) { console.error('Failed to create LCA', err); }
  };

  const handleSelectAssessment = async (id: string) => {
    try {
      const res = await api.get(`/lifecycle/assessments/${id}`);
      setSelectedAssessment(res.data.data);
    } catch { setSelectedAssessment(null); }
  };

  const handleUpdateStage = async () => {
    if (!selectedAssessment || !editingStage) return;
    try {
      await api.put(`/lifecycle/assessments/${selectedAssessment.id}/stages/${editingStage.stageName}`, stageForm);
      setEditingStage(null);
      handleSelectAssessment(selectedAssessment.id);
    } catch (err) { console.error('Failed to update stage', err); }
  };

  const openStageEdit = (stage: LifeCycleStage) => {
    setEditingStage(stage);
    setStageForm({
      aspects: stage.aspects || '',
      impacts: stage.impacts || '',
      severity: stage.severity || 1,
      controls: stage.controls || '',
      supplierReqs: stage.supplierReqs || '',
      notes: stage.notes || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Life Cycle Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">ISO 14001 Clause 8.1 - Life cycle perspective</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" /> New Assessment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Recycle className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Total Assessments</p><p className="text-2xl font-bold">{assessments.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Recycle className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold">{assessments.filter(a => a.status === 'IN_PROGRESS').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Recycle className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold">{assessments.filter(a => a.status === 'COMPLETED').length}</p></div></div></CardContent></Card>
      </div>

      {selectedAssessment ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedAssessment.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{selectedAssessment.refNumber} - {selectedAssessment.productProcess}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedAssessment(null)}>Back to List</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 mb-6 py-4 bg-gray-50 rounded-lg overflow-x-auto">
              {(selectedAssessment.stages || []).map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    onClick={() => openStageEdit(stage)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium text-center min-w-[140px] transition-colors hover:ring-2 hover:ring-green-300 ${stage.aspects ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600 border'}`}
                  >
                    <div>{STAGE_LABELS[stage.stageName] || stage.stageName}</div>
                    {stage.severity && <Badge className={`mt-1 text-xs ${SEVERITY_COLORS[stage.severity] || ''}`}>Severity: {stage.severity}</Badge>}
                  </button>
                  {i < (selectedAssessment.stages?.length || 0) - 1 && <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">Click a stage to edit its environmental aspects, impacts, and controls.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Assessments</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : assessments.length === 0 ? <p className="text-gray-500 text-center py-8">No assessments found.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Ref</th><th className="pb-2 pr-4">Title</th><th className="pb-2 pr-4">Product/Process</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Created</th></tr></thead>
                  <tbody>
                    {assessments.map(a => (
                      <tr key={a.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectAssessment(a.id)}>
                        <td className="py-3 pr-4 font-mono text-xs">{a.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{a.title}</td>
                        <td className="py-3 pr-4">{a.productProcess}</td>
                        <td className="py-3 pr-4"><Badge className={STATUS_COLORS[a.status] || 'bg-gray-100'}>{a.status.replace(/_/g, ' ')}</Badge></td>
                        <td className="py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Life Cycle Assessment" size="lg">
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={createForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, title: e.target.value })} /></div>
          <div><Label>Product/Process *</Label><Input value={createForm.productProcess} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, productProcess: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={createForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm({ ...createForm, description: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!createForm.title || !createForm.productProcess}>Create Assessment</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!editingStage} onClose={() => setEditingStage(null)} title={editingStage ? `Edit Stage: ${STAGE_LABELS[editingStage.stageName] || editingStage.stageName}` : ''} size="lg">
        <div className="space-y-4">
          <div><Label>Environmental Aspects</Label><Textarea rows={2} value={stageForm.aspects} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStageForm({ ...stageForm, aspects: e.target.value })} placeholder="Energy use, emissions, waste generation..." /></div>
          <div><Label>Environmental Impacts</Label><Textarea rows={2} value={stageForm.impacts} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStageForm({ ...stageForm, impacts: e.target.value })} placeholder="Climate change, resource depletion, pollution..." /></div>
          <div>
            <Label>Severity (1-5)</Label>
            <Select value={String(stageForm.severity)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStageForm({ ...stageForm, severity: parseInt(e.target.value) })}>
              <option value="1">1 - Negligible</option><option value="2">2 - Low</option><option value="3">3 - Moderate</option><option value="4">4 - Significant</option><option value="5">5 - Critical</option>
            </Select>
          </div>
          <div><Label>Controls</Label><Textarea rows={2} value={stageForm.controls} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStageForm({ ...stageForm, controls: e.target.value })} /></div>
          <div><Label>Supplier Requirements</Label><Textarea rows={2} value={stageForm.supplierReqs} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStageForm({ ...stageForm, supplierReqs: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea rows={2} value={stageForm.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStageForm({ ...stageForm, notes: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditingStage(null)}>Cancel</Button>
          <Button onClick={handleUpdateStage}>Save Stage</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
