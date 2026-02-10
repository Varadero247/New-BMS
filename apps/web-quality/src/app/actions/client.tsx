'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, ClipboardList, Clock, AlertCircle, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Action {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  owner?: { firstName: string; lastName: string };
  incident?: { id: string; title: string; referenceNumber: string };
}

interface NC {
  id: string;
  title: string;
  referenceNumber: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
}

const ACTION_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'IMMEDIATE', 'LONG_TERM'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const emptyForm = {
  title: '',
  description: '',
  type: 'CORRECTIVE' as string,
  priority: 'MEDIUM' as string,
  dueDate: '',
  incidentId: '',
};

export default function ActionsPage() {
  const searchParams = useSearchParams();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [openNCs, setOpenNCs] = useState<NC[]>([]);

  // Template selector
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadActions();
  }, []);

  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplateAndOpen(templateId);
    }
  }, [searchParams]);

  async function loadActions() {
    try {
      const response = await api.get('/actions');
      setActions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadOpenNCs() {
    try {
      const response = await api.get('/nonconformances?status=OPEN');
      setOpenNCs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load NCs:', error);
    }
  }

  async function loadTemplateAndOpen(templateId: string) {
    try {
      const response = await api.get(`/templates/${templateId}`);
      const template = response.data.data;
      if (template?.prefill) {
        setForm({ ...emptyForm, ...template.prefill });
        setShowModal(true);
        loadOpenNCs();
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }

  async function loadTemplates() {
    try {
      const response = await api.get('/templates?type=action');
      setTemplates(response.data.data || []);
      setShowTemplates(true);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  function openCreateModal() {
    setForm(emptyForm);
    setShowModal(true);
    loadOpenNCs();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/actions', {
        ...form,
        incidentId: form.incidentId || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      loadActions();
    } catch (error) {
      console.error('Failed to create action:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const filteredActions = filter === 'all'
    ? actions
    : filter === 'overdue'
    ? actions.filter(a => isOverdue(a.dueDate) && a.status !== 'COMPLETED' && a.status !== 'VERIFIED')
    : actions.filter(a => a.status === filter);

  const counts = {
    all: actions.length,
    OPEN: actions.filter(a => a.status === 'OPEN').length,
    IN_PROGRESS: actions.filter(a => a.status === 'IN_PROGRESS').length,
    COMPLETED: actions.filter(a => a.status === 'COMPLETED' || a.status === 'VERIFIED').length,
    overdue: actions.filter(a => isOverdue(a.dueDate) && a.status !== 'COMPLETED' && a.status !== 'VERIFIED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Actions</h1>
            <p className="text-gray-500 mt-1">Corrective and preventive actions</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Action
          </Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'OPEN', label: 'Open' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? item.key === 'overdue' ? 'bg-red-600 text-white' :
                    item.key === 'COMPLETED' ? 'bg-green-600 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label} ({counts[item.key as keyof typeof counts]})
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Actions ({filteredActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredActions.length > 0 ? (
              <div className="space-y-4">
                {filteredActions.map((action) => {
                  const overdue = isOverdue(action.dueDate) && action.status !== 'COMPLETED' && action.status !== 'VERIFIED';
                  return (
                    <div
                      key={action.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">{action.referenceNumber}</span>
                            <Badge variant={
                              action.status === 'COMPLETED' || action.status === 'VERIFIED' ? 'secondary' :
                              action.status === 'IN_PROGRESS' ? 'default' : 'outline'
                            }>
                              {action.status?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={
                              action.priority === 'CRITICAL' ? 'destructive' :
                              action.priority === 'HIGH' ? 'warning' : 'outline'
                            }>
                              {action.priority}
                            </Badge>
                            <Badge variant="outline">
                              {action.type?.replace(/_/g, ' ')}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{action.description}</p>
                          {action.incident && (
                            <p className="text-xs text-blue-600 mt-1">
                              Linked to: {action.incident.referenceNumber} - {action.incident.title}
                            </p>
                          )}
                          {action.owner && (
                            <p className="text-xs text-gray-400 mt-1">
                              Owner: {action.owner.firstName} {action.owner.lastName}
                            </p>
                          )}
                        </div>
                        <div className={`text-sm text-right ${overdue ? 'text-red-600' : 'text-gray-400'}`}>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(action.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No actions found</p>
                <Button variant="outline" className="mt-4" onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Action
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Action Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Action" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={loadTemplates} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                From Template
              </Button>
            </div>

            <div>
              <Label htmlFor="act-title">Title *</Label>
              <Input id="act-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Action title" />
            </div>

            <div>
              <Label htmlFor="act-description">Description *</Label>
              <Textarea id="act-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required placeholder="Describe the action to be taken" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="act-type">Type</Label>
                <Select id="act-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {ACTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="act-priority">Priority</Label>
                <Select id="act-priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="act-dueDate">Due Date *</Label>
              <Input id="act-dueDate" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
            </div>

            <div>
              <Label htmlFor="act-incidentId">Linked Nonconformance (optional)</Label>
              <Select id="act-incidentId" value={form.incidentId} onChange={e => setForm({ ...form, incidentId: e.target.value })}>
                <option value="">None</option>
                {openNCs.map(nc => (
                  <option key={nc.id} value={nc.id}>{nc.referenceNumber} - {nc.title}</option>
                ))}
              </Select>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Action'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Template Selector Modal */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)} title="Select Action Template" size="lg">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {templates.map(template => (
            <button
              key={template.id}
              type="button"
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={async () => {
                await loadTemplateAndOpen(template.id);
                setShowTemplates(false);
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
          {templates.length === 0 && (
            <p className="text-center text-gray-500 py-8">No action templates available</p>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowTemplates(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
