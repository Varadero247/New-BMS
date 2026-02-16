'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, FolderKanban, Search, Clock, CheckCircle, AlertTriangle, RefreshCw, Eye, Edit2 } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApqpProject {
  id: string;
  referenceNumber?: string;
  name: string;
  description: string;
  productName: string;
  productNumber: string;
  customerName: string;
  currentPhase: number;
  status: string;
  targetDate: string;
  startDate: string;
  teamMembers: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APQP_PHASES: Record<number, string> = {
  1: 'Planning',
  2: 'Product Design',
  3: 'Process Design',
  4: 'Validation',
  5: 'Production',
};

const APQP_STATUSES = [
  'DRAFT',
  'PLANNING',
  'IN_PROGRESS',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
] as const;

const phaseColors: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-indigo-100 text-indigo-700',
  3: 'bg-violet-100 text-violet-700',
  4: 'bg-amber-100 text-amber-700',
  5: 'bg-green-100 text-green-700',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  ACTIVE: 'bg-orange-100 text-orange-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const emptyForm = {
  name: '',
  description: '',
  productName: '',
  productNumber: '',
  customerName: '',
  currentPhase: 1,
  status: 'DRAFT' as string,
  targetDate: '',
  startDate: new Date().toISOString().split('T')[0],
  teamMembers: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ApqpClient() {
  // Data state
  const [projects, setProjects] = useState<ApqpProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail modal
  const [selectedProject, setSelectedProject] = useState<ApqpProject | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (phaseFilter !== 'all') params.append('phase', phaseFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/apqp/projects?${params.toString()}`);
      setProjects(response.data.data || []);
    } catch (err) {
      console.error('Failed to load APQP projects:', err);
      setError('Failed to load APQP projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phaseFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // -------------------------------------------------------------------------
  // Create / Edit Project
  // -------------------------------------------------------------------------

  function openCreateModal() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  function openEditModal(project: ApqpProject) {
    setForm({
      name: project.name || '',
      description: project.description || '',
      productName: project.productName || '',
      productNumber: project.productNumber || '',
      customerName: project.customerName || '',
      currentPhase: project.currentPhase || 1,
      status: project.status || 'DRAFT',
      targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      teamMembers: project.teamMembers || '',
      notes: project.notes || '',
    });
    setEditingId(project.id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        currentPhase: Number(form.currentPhase),
        targetDate: form.targetDate || undefined,
        startDate: form.startDate || undefined,
      };

      if (editingId) {
        await api.put(`/apqp/projects/${editingId}`, payload);
      } else {
        await api.post('/apqp/projects', payload);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      console.error('Failed to save APQP project:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Detail View
  // -------------------------------------------------------------------------

  function openDetail(project: ApqpProject) {
    setSelectedProject(project);
    setShowDetail(true);
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const filtered = projects
    .filter(p => phaseFilter === 'all' || String(p.currentPhase) === phaseFilter)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p =>
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    overdueCount: projects.filter(p => {
      if (!p.targetDate || p.status === 'COMPLETED' || p.status === 'CANCELLED') return false;
      return new Date(p.targetDate) < new Date();
    }).length,
  }), [projects]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  function isOverdue(project: ApqpProject): boolean {
    if (!project.targetDate || project.status === 'COMPLETED' || project.status === 'CANCELLED') return false;
    return new Date(project.targetDate) < new Date();
  }

  // -------------------------------------------------------------------------
  // Phase Progress Bar
  // -------------------------------------------------------------------------

  function PhaseProgressBar({ currentPhase }: { currentPhase: number }) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((phase) => (
          <div key={phase} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                phase < currentPhase
                  ? 'bg-green-500 text-white'
                  : phase === currentPhase
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {phase < currentPhase ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                phase
              )}
            </div>
            {phase < 5 && (
              <div
                className={`w-4 h-0.5 ${
                  phase < currentPhase ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">APQP Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Advanced Product Quality Planning</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadProjects} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Hold</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.onHold}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdueCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadProjects}>Retry</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search by name, reference, customer, product..." placeholder="Search by name, reference, customer, product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">APQP Phase</Label>
                <Select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)}>
                  <option value="all">All Phases</option>
                  {Object.entries(APQP_PHASES).map(([num, name]) => (
                    <option key={num} value={num}>Phase {num}: {name}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {APQP_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-orange-500" />
                APQP Projects ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Project #</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Phase</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Target Date</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((project) => (
                      <tr
                        key={project.id}
                        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition-colors ${
                          isOverdue(project) ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {project.referenceNumber || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[250px]">{project.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{project.productName || '-'}</p>
                            {project.productNumber && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">{project.productNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {project.customerName || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={phaseColors[project.currentPhase] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                              P{project.currentPhase}: {APQP_PHASES[project.currentPhase] || 'Unknown'}
                            </Badge>
                            <PhaseProgressBar currentPhase={project.currentPhase} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={statusColors[project.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                            {project.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isOverdue(project) && (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className={`text-sm ${isOverdue(project) ? 'text-red-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {formatDate(project.targetDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              type="button"
                              onClick={() => openDetail(project)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(project)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                              title="Edit project"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <FolderKanban className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No APQP projects found</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || phaseFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first APQP project.'}
                </p>
                {!searchQuery && phaseFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4" />
                    Create First Project
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* CREATE / EDIT MODAL                                               */}
      {/* ================================================================= */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingId(null); }}
        title={editingId ? 'Edit APQP Project' : 'New APQP Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="apqp-name">Project Name *</Label>
              <Input
                id="apqp-name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. New Brake Assembly - Model X"
              />
            </div>

            <div>
              <Label htmlFor="apqp-description">Description</Label>
              <Textarea
                id="apqp-description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Brief description of the APQP project scope and objectives"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apqp-productName">Product Name *</Label>
                <Input
                  id="apqp-productName"
                  value={form.productName}
                  onChange={e => setForm({ ...form, productName: e.target.value })}
                  required
                  placeholder="e.g. Brake Caliper Assembly"
                />
              </div>
              <div>
                <Label htmlFor="apqp-productNumber">Product / Part Number</Label>
                <Input
                  id="apqp-productNumber"
                  value={form.productNumber}
                  onChange={e => setForm({ ...form, productNumber: e.target.value })}
                  placeholder="e.g. BC-2026-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apqp-customerName">Customer Name *</Label>
                <Input
                  id="apqp-customerName"
                  value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                  required
                  placeholder="e.g. Toyota Motor Corp"
                />
              </div>
              <div>
                <Label htmlFor="apqp-currentPhase">Current Phase</Label>
                <Select
                  id="apqp-currentPhase"
                  value={String(form.currentPhase)}
                  onChange={e => setForm({ ...form, currentPhase: parseInt(e.target.value) })}
                >
                  {Object.entries(APQP_PHASES).map(([num, name]) => (
                    <option key={num} value={num}>Phase {num}: {name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apqp-status">Status</Label>
                <Select
                  id="apqp-status"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {APQP_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="apqp-startDate">Start Date</Label>
                <Input
                  id="apqp-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="apqp-targetDate">Target Date</Label>
              <Input
                id="apqp-targetDate"
                type="date"
                value={form.targetDate}
                onChange={e => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="apqp-teamMembers">Team Members</Label>
              <Textarea
                id="apqp-teamMembers"
                value={form.teamMembers}
                onChange={e => setForm({ ...form, teamMembers: e.target.value })}
                rows={2}
                placeholder="List team members (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="apqp-notes">Notes</Label>
              <Textarea
                id="apqp-notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingId(null); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedProject?.name || 'APQP Project Detail'}
        size="lg"
      >
        {selectedProject ? (
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedProject.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{selectedProject.referenceNumber}</span>
              )}
              <Badge className={phaseColors[selectedProject.currentPhase] || 'bg-gray-100 dark:bg-gray-800'}>
                Phase {selectedProject.currentPhase}: {APQP_PHASES[selectedProject.currentPhase] || 'Unknown'}
              </Badge>
              <Badge className={statusColors[selectedProject.status] || 'bg-gray-100 dark:bg-gray-800'}>
                {selectedProject.status?.replace(/_/g, ' ')}
              </Badge>
              {isOverdue(selectedProject) && (
                <Badge className="bg-red-100 text-red-700">Overdue</Badge>
              )}
            </div>

            {/* Phase Progress */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">APQP Phase Progress</h3>
              <div className="flex items-center justify-between mb-3">
                {[1, 2, 3, 4, 5].map((phase) => (
                  <div key={phase} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                        phase < selectedProject.currentPhase
                          ? 'bg-green-500 text-white'
                          : phase === selectedProject.currentPhase
                          ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {phase < selectedProject.currentPhase ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        phase
                      )}
                    </div>
                    <p className={`text-xs text-center ${
                      phase === selectedProject.currentPhase ? 'font-semibold text-orange-700' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {APQP_PHASES[phase]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${((selectedProject.currentPhase - 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Project Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product Name</p>
                  <p className="text-sm font-medium">{selectedProject.productName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product / Part Number</p>
                  <p className="text-sm font-medium font-mono">{selectedProject.productNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="text-sm font-medium">{selectedProject.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-sm">{formatDate(selectedProject.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target Date</p>
                  <p className={`text-sm ${isOverdue(selectedProject) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(selectedProject.targetDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDate(selectedProject.createdAt)}</p>
                </div>
              </div>

              {selectedProject.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
              )}

              {selectedProject.teamMembers && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team Members</p>
                  <p className="text-sm mt-1">{selectedProject.teamMembers}</p>
                </div>
              )}

              {selectedProject.notes && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProject.notes}</p>
                </div>
              )}
            </div>

            {/* APQP Phase Deliverables Checklist */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Phase {selectedProject.currentPhase} Deliverables: {APQP_PHASES[selectedProject.currentPhase]}
              </h3>
              <div className="space-y-2">
                {getPhaseDeliverables(selectedProject.currentPhase).map((deliverable, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center bg-white dark:bg-gray-900">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          {selectedProject && (
            <Button
              onClick={() => { setShowDetail(false); openEditModal(selectedProject); }}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Project
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Phase Deliverables
// ---------------------------------------------------------------------------

function getPhaseDeliverables(phase: number): string[] {
  switch (phase) {
    case 1:
      return [
        'Voice of the Customer research',
        'Business Plan / Marketing Strategy',
        'Product / Process Benchmark Data',
        'Product / Process Assumptions',
        'Product Reliability Studies',
        'Customer Inputs',
        'Design Goals',
        'Reliability and Quality Goals',
        'Preliminary Bill of Materials',
        'Preliminary Process Flow Chart',
        'Preliminary Product & Process Special Characteristics',
        'Product Assurance Plan',
        'Management Support',
      ];
    case 2:
      return [
        'Design FMEA (DFMEA)',
        'Design for Manufacturability & Assembly',
        'Design Verification',
        'Design Reviews',
        'Prototype Build - Control Plan',
        'Engineering Drawings',
        'Engineering Specifications',
        'Material Specifications',
        'Drawing and Specification Changes',
        'New Equipment, Tooling & Facilities Requirements',
        'Special Product & Process Characteristics',
        'Gages / Testing Equipment Requirements',
        'Team Feasibility Commitment & Management Support',
      ];
    case 3:
      return [
        'Packaging Standards & Specifications',
        'Product / Process Quality System Review',
        'Process Flow Chart',
        'Floor Plan Layout',
        'Characteristics Matrix',
        'Process FMEA (PFMEA)',
        'Pre-Launch Control Plan',
        'Process Instructions',
        'Measurement Systems Analysis Plan',
        'Preliminary Process Capability Study Plan',
        'Management Support',
      ];
    case 4:
      return [
        'Significant Production Run',
        'Measurement Systems Evaluation',
        'Preliminary Process Capability Study',
        'Production Part Approval (PPAP)',
        'Production Validation Testing',
        'Packaging Evaluation',
        'Production Control Plan',
        'Quality Planning Sign-Off and Management Support',
      ];
    case 5:
      return [
        'Reduced Variation',
        'Improved Customer Satisfaction',
        'Improved Delivery and Service',
        'Effective Use of Lessons Learned / Best Practices',
        'Continuous Improvement Actions',
      ];
    default:
      return [];
  }
}
