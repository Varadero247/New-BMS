'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, AlertOctagon, Search, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Nonconformance {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  dateOccurred: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
}

const NC_TYPES = [
  'NON_CONFORMANCE',
  'CUSTOMER_COMPLAINT',
  'SUPPLIER_ISSUE',
  'PROCESS_DEVIATION',
  'PRODUCT_DEFECT',
  'AUDIT_FINDING',
] as const;

const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'] as const;

const emptyForm = {
  title: '',
  description: '',
  type: 'NON_CONFORMANCE' as string,
  severity: 'MODERATE' as string,
  category: '',
  location: '',
  dateOccurred: new Date().toISOString().split('T')[0],
  productAffected: '',
  customerImpact: '',
};

export default function NonconformancesPage() {
  const searchParams = useSearchParams();
  const [ncs, setNcs] = useState<Nonconformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Template selector
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadNCs();
  }, []);

  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplateAndOpen(templateId);
    }
  }, [searchParams]);

  async function loadNCs() {
    try {
      const response = await api.get('/nonconformances');
      setNcs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load nonconformances:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplateAndOpen(templateId: string) {
    try {
      const response = await api.get(`/templates/${templateId}`);
      const template = response.data.data;
      if (template?.prefill) {
        setForm({ ...emptyForm, ...template.prefill, dateOccurred: emptyForm.dateOccurred });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }

  async function loadTemplates() {
    try {
      const response = await api.get('/templates?type=nc');
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
      await api.post('/nonconformances', form);
      setShowModal(false);
      setForm(emptyForm);
      loadNCs();
    } catch (error) {
      console.error('Failed to create NC:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredNCs = ncs
    .filter(nc => statusFilter === 'all' || nc.status === statusFilter)
    .filter(nc => typeFilter === 'all' || nc.type === typeFilter)
    .filter(nc =>
      !searchQuery ||
      nc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nc.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const statusCounts = {
    all: ncs.length,
    OPEN: ncs.filter(nc => nc.status === 'OPEN').length,
    UNDER_INVESTIGATION: ncs.filter(nc => nc.status === 'UNDER_INVESTIGATION').length,
    CLOSED: ncs.filter(nc => nc.status === 'CLOSED').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nonconformance Register</h1>
            <p className="text-gray-500 mt-1">Track and manage nonconformances and deviations</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report NC
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'OPEN', 'UNDER_INVESTIGATION', 'CLOSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? status === 'OPEN' ? 'bg-red-600 text-white' :
                    status === 'UNDER_INVESTIGATION' ? 'bg-yellow-500 text-white' :
                    status === 'CLOSED' ? 'bg-green-500 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace(/_/g, ' ')} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...NC_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* NCs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Nonconformances ({filteredNCs.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search NCs..."
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
            ) : filteredNCs.length > 0 ? (
              <div className="space-y-4">
                {filteredNCs.map((nc) => (
                  <div
                    key={nc.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{nc.referenceNumber}</span>
                          <Badge variant={
                            nc.status === 'OPEN' ? 'destructive' :
                            nc.status === 'UNDER_INVESTIGATION' ? 'warning' : 'secondary'
                          }>
                            {nc.status?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {nc.type?.replace(/_/g, ' ')}
                          </Badge>
                          {nc.severity && (
                            <Badge variant={
                              nc.severity === 'CRITICAL' || nc.severity === 'CATASTROPHIC' ? 'destructive' :
                              nc.severity === 'MAJOR' ? 'warning' : 'default'
                            }>
                              {nc.severity}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{nc.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{nc.description}</p>
                      </div>
                      <div className="text-sm text-gray-400 text-right">
                        <div>{new Date(nc.dateOccurred || nc.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">Detected</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertOctagon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No nonconformances found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report NC Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Nonconformance" size="full">
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={loadTemplates} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                From Template
              </Button>
            </div>

            <div>
              <Label htmlFor="nc-title">Title *</Label>
              <Input id="nc-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Brief description of the nonconformance" />
            </div>

            <div>
              <Label htmlFor="nc-description">Description *</Label>
              <Textarea id="nc-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required placeholder="Detailed description of what was found" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nc-type">Type *</Label>
                <Select id="nc-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {NC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="nc-severity">Severity</Label>
                <Select id="nc-severity" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nc-category">Category</Label>
                <Input id="nc-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Product Quality, Process" />
              </div>
              <div>
                <Label htmlFor="nc-location">Location</Label>
                <Input id="nc-location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Where the NC was detected" />
              </div>
            </div>

            <div>
              <Label htmlFor="nc-dateOccurred">Date Occurred *</Label>
              <Input id="nc-dateOccurred" type="date" value={form.dateOccurred} onChange={e => setForm({ ...form, dateOccurred: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nc-productAffected">Product Affected</Label>
                <Input id="nc-productAffected" value={form.productAffected} onChange={e => setForm({ ...form, productAffected: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="nc-customerImpact">Customer Impact</Label>
                <Textarea id="nc-customerImpact" value={form.customerImpact} onChange={e => setForm({ ...form, customerImpact: e.target.value })} rows={2} />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Reporting...' : 'Report NC'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Template Selector Modal */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)} title="Select NC Template" size="lg">
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
            <p className="text-center text-gray-500 py-8">No NC templates available</p>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowTemplates(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
