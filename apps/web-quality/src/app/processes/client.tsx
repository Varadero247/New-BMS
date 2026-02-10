'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, Workflow, Search, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Process {
  id: string;
  title: string;
  description: string;
  category?: string;
  processOwner?: string;
  status: string;
  riskLevel?: string;
  riskScore?: number;
  reviewDate?: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
}

const emptyForm = {
  title: '',
  description: '',
  category: '',
  processOwner: '',
  processInputs: '',
  processOutputs: '',
  kpis: '',
  likelihood: 3,
  severity: 3,
  detectability: 3,
  existingControls: '',
  reviewDate: '',
};

export default function ProcessesPage() {
  const searchParams = useSearchParams();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');

  // Template selector
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadProcesses();
  }, []);

  // Handle template query param
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplateAndOpen(templateId);
    }
  }, [searchParams]);

  async function loadProcesses() {
    try {
      const response = await api.get('/processes');
      setProcesses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load processes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplateAndOpen(templateId: string) {
    try {
      const response = await api.get(`/templates/${templateId}`);
      const template = response.data.data;
      if (template?.prefill) {
        setForm({ ...emptyForm, ...template.prefill });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }

  async function loadTemplates() {
    try {
      const response = await api.get('/templates?type=process');
      setTemplates(response.data.data || []);
      setShowTemplates(true);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/processes', {
        ...form,
        reviewDate: form.reviewDate || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      loadProcesses();
    } catch (error) {
      console.error('Failed to create process:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProcesses = processes.filter(p =>
    !searchQuery ||
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Process Register</h1>
            <p className="text-gray-500 mt-1">Manage quality management system processes</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Process
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{processes.length}</p>
              <p className="text-sm text-gray-500">Total Processes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {processes.filter(p => p.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {processes.filter(p => p.status === 'UNDER_REVIEW').length}
              </p>
              <p className="text-sm text-gray-500">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {processes.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
              </p>
              <p className="text-sm text-gray-500">High Risk</p>
            </CardContent>
          </Card>
        </div>

        {/* Processes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-500" />
                Processes
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search processes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredProcesses.length > 0 ? (
              <div className="space-y-4">
                {filteredProcesses.map((process) => (
                  <div
                    key={process.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {process.category && (
                            <span className="text-xs text-gray-500">{process.category}</span>
                          )}
                          <Badge variant={
                            process.status === 'ACTIVE' ? 'secondary' :
                            process.status === 'UNDER_REVIEW' ? 'warning' : 'outline'
                          }>
                            {process.status?.replace('_', ' ')}
                          </Badge>
                          {process.riskLevel && (
                            <Badge variant={
                              process.riskLevel === 'CRITICAL' || process.riskLevel === 'HIGH' ? 'destructive' :
                              process.riskLevel === 'MEDIUM' ? 'warning' : 'outline'
                            }>
                              {process.riskLevel} RISK
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{process.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{process.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          {process.processOwner && <span>Owner: {process.processOwner}</span>}
                          {process.riskScore != null && <span>Risk Score: {process.riskScore}</span>}
                          {process.reviewDate && <span>Review: {new Date(process.reviewDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No processes defined yet</p>
                <Button variant="outline" className="mt-4" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Process
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Process Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Process" size="full">
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={loadTemplates} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                From Template
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Core QMS, Engineering" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
            </div>

            <div>
              <Label htmlFor="processOwner">Process Owner</Label>
              <Input id="processOwner" value={form.processOwner} onChange={e => setForm({ ...form, processOwner: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="processInputs">Process Inputs</Label>
                <Textarea id="processInputs" value={form.processInputs} onChange={e => setForm({ ...form, processInputs: e.target.value })} rows={2} placeholder="Comma-separated inputs" />
              </div>
              <div>
                <Label htmlFor="processOutputs">Process Outputs</Label>
                <Textarea id="processOutputs" value={form.processOutputs} onChange={e => setForm({ ...form, processOutputs: e.target.value })} rows={2} placeholder="Comma-separated outputs" />
              </div>
            </div>

            <div>
              <Label htmlFor="kpis">KPIs</Label>
              <Textarea id="kpis" value={form.kpis} onChange={e => setForm({ ...form, kpis: e.target.value })} rows={2} placeholder="Key performance indicators" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="likelihood">Likelihood (1-5)</Label>
                <Select id="likelihood" value={form.likelihood} onChange={e => setForm({ ...form, likelihood: parseInt(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][n-1]}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severity (1-5)</Label>
                <Select id="severity" value={form.severity} onChange={e => setForm({ ...form, severity: parseInt(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'][n-1]}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="detectability">Detectability (1-5)</Label>
                <Select id="detectability" value={form.detectability} onChange={e => setForm({ ...form, detectability: parseInt(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {['Almost Certain', 'High', 'Moderate', 'Low', 'Very Low'][n-1]}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="existingControls">Existing Controls</Label>
              <Textarea id="existingControls" value={form.existingControls} onChange={e => setForm({ ...form, existingControls: e.target.value })} rows={2} />
            </div>

            <div>
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input id="reviewDate" type="date" value={form.reviewDate} onChange={e => setForm({ ...form, reviewDate: e.target.value })} />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Process'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Template Selector Modal */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)} title="Select Process Template" size="lg">
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
            <p className="text-center text-gray-500 py-8">No process templates available</p>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowTemplates(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
