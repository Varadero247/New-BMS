'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, Download, Copy, Eye, Filter, ChevronDown } from 'lucide-react';
import { gateway } from '@/lib/gateway';
import { Input, Card, CardContent, Badge, Button, Modal, ModalFooter } from '@ims/ui';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox' | 'section';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  module: string;
  status: string;
  version: string;
  usageCount: number;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  'All',
  'AUDIT',
  'CAPA',
  'CERTIFICATION',
  'COMPLIANCE',
  'CUSTOMER',
  'DESIGN_DEVELOPMENT',
  'GENERAL',
  'INCIDENT_INVESTIGATION',
  'INSPECTION',
  'MANAGEMENT_REVIEW',
  'PLANNING',
  'PROCESS_CONTROL',
  'REGULATORY',
  'REPORTING',
  'RISK_ASSESSMENT',
  'SUPPLIER',
  'TRAINING',
];
const STATUSES = ['All', 'ACTIVE', 'DRAFT', 'ARCHIVED'];

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUseModal, setShowUseModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 200 };
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      const response = await gateway.get('/templates', { params });
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUse = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({});
    setShowUseModal(true);
  };

  const handleClone = async (template: Template) => {
    try {
      await gateway.post(`/templates/${template.id}/clone`);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const handleExport = (template: Template) => {
    window.open(`${gateway.defaults.baseURL}/templates/${template.id}/export?format=html`);
  };

  const handleSubmitUse = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      await gateway.post(`/templates/${selectedTemplate.id}/use`, { filledData: formData });
      setShowUseModal(false);
      setSelectedTemplate(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to use template:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const getModuleBadgeColor = (mod: string) => {
    const colors: Record<string, string> = {
      HEALTH_SAFETY: 'bg-red-100 text-red-700',
      ENVIRONMENT: 'bg-green-100 text-green-700',
      QUALITY: 'bg-blue-100 text-blue-700',
      INVENTORY: 'bg-sky-100 text-sky-700',
      HR: 'bg-orange-100 text-orange-700',
    };
    return colors[mod] || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  const renderFormField = (field: FieldDefinition) => {
    if (field.type === 'section') {
      return (
        <div
          key={field.name}
          className="col-span-2 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{field.label}</h3>
          {field.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder={field.placeholder}
            value={(formData[field.name] as string) || ''}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
          />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={(formData[field.name] as string) || ''}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.name} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={field.name}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            checked={!!formData[field.name]}
            onChange={(e) => handleFormChange(field.name, e.target.checked)}
          />
          <label
            htmlFor={field.name}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {field.label}
          </label>
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          placeholder={field.placeholder}
          value={(formData[field.name] as string) || ''}
          onChange={(e) => handleFormChange(field.name, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Template Library
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Browse and use templates across all IMS modules
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search templates..."
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-purple-100 text-purple-700 text-xs font-mono">
                      {template.code}
                    </Badge>
                    <Badge className={getModuleBadgeColor(template.module)}>
                      {template.module.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {template.usageCount} uses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleUse(template)}
                    >
                      Use
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleClone(template)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(template)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No templates found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          isOpen={!!selectedTemplate && !showUseModal}
          onClose={() => setSelectedTemplate(null)}
          title={selectedTemplate?.name || 'Template Preview'}
          size="lg"
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700 font-mono">
                  {selectedTemplate.code}
                </Badge>
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="outline">{selectedTemplate.status}</Badge>
              </div>
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Field Definitions
                </h4>
                <div className="space-y-2">
                  {selectedTemplate.fields?.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {field.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({field.type})
                        </span>
                        {field.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {field.required && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                        )}
                        {field.options && (
                          <Badge variant="outline" className="text-xs">
                            {field.options.length} options
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Version {selectedTemplate.version} | Used {selectedTemplate.usageCount} times
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Close
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => selectedTemplate && handleUse(selectedTemplate)}
            >
              Use Template
            </Button>
          </ModalFooter>
        </Modal>

        {/* Use Template Modal */}
        <Modal
          isOpen={showUseModal}
          onClose={() => {
            setShowUseModal(false);
            setSelectedTemplate(null);
            setFormData({});
          }}
          title={`Use Template: ${selectedTemplate?.name || ''}`}
          size="lg"
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTemplate.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.fields?.map((field) => renderFormField(field))}
              </div>
            </div>
          )}
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUseModal(false);
                setSelectedTemplate(null);
                setFormData({});
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSubmitUse}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
