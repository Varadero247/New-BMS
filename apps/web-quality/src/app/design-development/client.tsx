'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Layers, Plus, Search, CheckCircle, Clock, ArrowRight, ChevronRight, XCircle, Pause } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DesignStage {
  id: string;
  projectId: string;
  stage: string;
  status: string;
  deliverables?: string;
  notes?: string;
  attachments?: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  createdAt: string;
}

interface DesignProject {
  id: string;
  refNumber: string;
  title: string;
  description?: string;
  productName: string;
  projectManager?: string;
  priority: string;
  status: string;
  currentStage: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  requirements?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  stages?: DesignStage[];
}

const STAGES = ['PLANNING', 'INPUTS', 'OUTPUTS', 'REVIEW', 'VERIFICATION', 'VALIDATION', 'TRANSFER'];

const STAGE_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  INPUTS: 'Design Inputs',
  OUTPUTS: 'Design Outputs',
  REVIEW: 'Design Review',
  VERIFICATION: 'Verification',
  VALIDATION: 'Validation',
  TRANSFER: 'Transfer',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STAGE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-200 text-gray-600',
  IN_PROGRESS: 'bg-blue-200 text-blue-800',
  SUBMITTED: 'bg-yellow-200 text-yellow-800',
  APPROVED: 'bg-green-200 text-green-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DesignDevelopmentPage() {
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', productName: '', projectManager: '',
    priority: 'MEDIUM', plannedStartDate: '', plannedEndDate: '', requirements: '',
  });

  // Detail modal
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (stageFilter) params.stage = stageFilter;
      if (search) params.search = search;
      const res = await api.get('/design-development', { params });
      setProjects(res.data.data.items || []);
    } catch {
      setProjects([]);
    }
  }, [statusFilter, stageFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchProjects().finally(() => setLoading(false));
  }, [fetchProjects]);

  const handleCreate = async () => {
    try {
      await api.post('/design-development', createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: '', description: '', productName: '', projectManager: '',
        priority: 'MEDIUM', plannedStartDate: '', plannedEndDate: '', requirements: '',
      });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleViewDetail = async (project: DesignProject) => {
    try {
      const res = await api.get(`/design-development/${project.id}`);
      setSelectedProject(res.data.data);
      setShowDetailModal(true);
    } catch {
      setSelectedProject(project);
      setShowDetailModal(true);
    }
  };

  const handleSubmitStage = async (projectId: string, stage: string) => {
    try {
      await api.post(`/design-development/${projectId}/stages/${stage}/submit`, {
        deliverables: 'Stage deliverables submitted',
      });
      // Refresh detail
      const res = await api.get(`/design-development/${projectId}`);
      setSelectedProject(res.data.data);
      fetchProjects();
    } catch (err) {
      console.error('Failed to submit stage', err);
    }
  };

  const handleApproveStage = async (projectId: string, stage: string) => {
    try {
      await api.post(`/design-development/${projectId}/stages/${stage}/approve`, {
        approvalNotes: 'Gate review approved',
      });
      const res = await api.get(`/design-development/${projectId}`);
      setSelectedProject(res.data.data);
      fetchProjects();
    } catch (err) {
      console.error('Failed to approve stage', err);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this design project?')) return;
    try {
      await api.delete(`/design-development/${projectId}`);
      setShowDetailModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const getStageProgress = (project: DesignProject) => {
    const idx = STAGES.indexOf(project.currentStage);
    return Math.round(((idx) / STAGES.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design & Development</h1>
          <p className="text-sm text-gray-500 mt-1">ISO 9001:2015 Clause 8.3 -- Stage-gate product development workflow</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Design Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Layers className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{completedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><ArrowRight className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Stages</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Design Projects</CardTitle>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
            <Select value={stageFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStageFilter(e.target.value)}>
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No design projects found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Ref</th>
                    <th className="pb-2 pr-4">Title</th>
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Current Stage</th>
                    <th className="pb-2 pr-4">Progress</th>
                    <th className="pb-2 pr-4">Priority</th>
                    <th className="pb-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetail(project)}
                    >
                      <td className="py-3 pr-4 font-mono text-xs">{project.refNumber}</td>
                      <td className="py-3 pr-4 font-medium">{project.title}</td>
                      <td className="py-3 pr-4">{project.productName}</td>
                      <td className="py-3 pr-4">
                        <Badge className={STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={STAGE_STATUS_COLORS['IN_PROGRESS']}>
                          {STAGE_LABELS[project.currentStage] || project.currentStage}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all"
                              style={{ width: `${getStageProgress(project)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{getStageProgress(project)}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={PRIORITY_COLORS[project.priority] || 'bg-gray-100'}>
                          {project.priority}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Design Project" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Project Title *</Label><Input value={createForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, title: e.target.value })} /></div>
            <div><Label>Product Name *</Label><Input value={createForm.productName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, productName: e.target.value })} /></div>
            <div><Label>Project Manager</Label><Input value={createForm.projectManager} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, projectManager: e.target.value })} /></div>
            <div>
              <Label>Priority</Label>
              <Select value={createForm.priority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateForm({ ...createForm, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <div><Label>Planned Start</Label><Input type="date" value={createForm.plannedStartDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, plannedStartDate: e.target.value })} /></div>
            <div><Label>Planned End</Label><Input type="date" value={createForm.plannedEndDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, plannedEndDate: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={createForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm({ ...createForm, description: e.target.value })} /></div>
          <div><Label>Requirements</Label><Textarea rows={2} value={createForm.requirements} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm({ ...createForm, requirements: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!createForm.title || !createForm.productName}>Create Project</Button>
        </ModalFooter>
      </Modal>

      {/* DETAIL MODAL with Stage Pipeline */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedProject ? `${selectedProject.refNumber} -- ${selectedProject.title}` : 'Project Details'} size="lg">
        {selectedProject && (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Product:</span> <span className="font-medium">{selectedProject.productName}</span></div>
              <div><span className="text-gray-500">Manager:</span> <span className="font-medium">{selectedProject.projectManager || '-'}</span></div>
              <div><span className="text-gray-500">Status:</span> <Badge className={STATUS_COLORS[selectedProject.status] || 'bg-gray-100'}>{selectedProject.status}</Badge></div>
              <div><span className="text-gray-500">Priority:</span> <Badge className={PRIORITY_COLORS[selectedProject.priority] || 'bg-gray-100'}>{selectedProject.priority}</Badge></div>
              <div><span className="text-gray-500">Start:</span> <span className="font-medium">{selectedProject.plannedStartDate ? new Date(selectedProject.plannedStartDate).toLocaleDateString() : '-'}</span></div>
              <div><span className="text-gray-500">End:</span> <span className="font-medium">{selectedProject.plannedEndDate ? new Date(selectedProject.plannedEndDate).toLocaleDateString() : '-'}</span></div>
            </div>

            {selectedProject.description && (
              <div>
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedProject.description}</p>
              </div>
            )}

            {/* Stage Pipeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Stage Gate Pipeline</h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {STAGES.map((stage, idx) => {
                  const stageData = selectedProject.stages?.find(s => s.stage === stage);
                  const stageStatus = stageData?.status || 'NOT_STARTED';
                  const isCurrent = selectedProject.currentStage === stage;

                  return (
                    <div key={stage} className="flex items-center">
                      <div className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[100px] ${isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          stageStatus === 'APPROVED' ? 'bg-green-500 text-white' :
                          stageStatus === 'SUBMITTED' ? 'bg-yellow-500 text-white' :
                          stageStatus === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {stageStatus === 'APPROVED' ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span className="text-xs font-medium mt-1 text-center">{STAGE_LABELS[stage]}</span>
                        <Badge className={`mt-1 text-[10px] ${STAGE_STATUS_COLORS[stageStatus] || 'bg-gray-200'}`}>
                          {stageStatus.replace(/_/g, ' ')}
                        </Badge>

                        {/* Action buttons for current stage */}
                        {isCurrent && stageData && (
                          <div className="flex gap-1 mt-2">
                            {stageData.status === 'IN_PROGRESS' && (
                              <button
                                className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={(e) => { e.stopPropagation(); handleSubmitStage(selectedProject.id, stage); }}
                              >
                                Submit
                              </button>
                            )}
                            {stageData.status === 'SUBMITTED' && (
                              <button
                                className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={(e) => { e.stopPropagation(); handleApproveStage(selectedProject.id, stage); }}
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {idx < STAGES.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Details */}
            {selectedProject.stages && selectedProject.stages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Stage Details</h3>
                <div className="space-y-2">
                  {selectedProject.stages.filter(s => s.status !== 'NOT_STARTED').map(stage => (
                    <div key={stage.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                        <Badge className={STAGE_STATUS_COLORS[stage.status] || 'bg-gray-200'}>
                          {stage.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {stage.deliverables && <p className="text-gray-600 mt-1">Deliverables: {stage.deliverables}</p>}
                      {stage.notes && <p className="text-gray-600 mt-1">Notes: {stage.notes}</p>}
                      {stage.approvedBy && <p className="text-gray-500 mt-1 text-xs">Approved: {stage.approvedAt ? new Date(stage.approvedAt).toLocaleDateString() : ''}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              {selectedProject.status !== 'COMPLETED' && selectedProject.status !== 'CANCELLED' && (
                <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedProject.id)}>Delete</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
