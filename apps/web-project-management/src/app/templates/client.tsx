'use client';

import { useState, useEffect, useCallback } from 'react';
import { gateway } from '@/lib/gateway';
import { Input, Card, CardContent, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { FileText, Search, Download, Copy, Eye } from 'lucide-react';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const MODULE_FILTER = 'PROJECT_MANAGEMENT';

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
  description: string | null;
  category: string;
  module: string;
  version: string;
  fieldDefinitions: FieldDefinition[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUseModal, setShowUseModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { module: MODULE_FILTER, limit: 50 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const response = await gateway.get('/templates', { params });
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowUseModal(true);
    const initialData: Record<string, any> = {};
    template.fieldDefinitions?.forEach((field) => {
      if (field.type === 'checkbox') {
        initialData[field.name] = false;
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);
  };

  const handleSubmitUse = async () => {
    if (!selectedTemplate) return;
    try {
      await gateway.post(`/templates/${selectedTemplate.id}/use`, { filledData: formData });
      setShowUseModal(false);
      setSelectedTemplate(null);
      setFormData({});
      fetchTemplates();
    } catch (error) {
      console.error('Failed to use template:', error);
    }
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
    window.open(`${GATEWAY_URL}/api/v1/templates/${template.id}/export?format=html`, '_blank');
  };

  const renderFieldInput = (field: FieldDefinition) => {
    switch (field.type) {
      case 'section':
        return (
          <div key={field.name} className="col-span-2 mt-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
              {field.label}
            </h3>
            {field.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.name} className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              rows={4}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
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
      case 'number':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            />
          </div>
        );
      case 'date':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              checked={formData[field.name] || false}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      default:
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            />
          </div>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      FORM: 'bg-blue-100 text-blue-700',
      CHECKLIST: 'bg-green-100 text-green-700',
      REPORT: 'bg-purple-100 text-purple-700',
      ASSESSMENT: 'bg-orange-100 text-orange-700',
      PROCEDURE: 'bg-cyan-100 text-cyan-700',
      POLICY: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Project Management Templates
            </h1>
            <p className="text-cyan-600 mt-1">Project charter, closure, and planning templates</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search templates..."
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="FORM">Form</option>
              <option value="CHECKLIST">Checklist</option>
              <option value="REPORT">Report</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="PROCEDURE">Procedure</option>
              <option value="POLICY">Policy</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No templates found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {search || categoryFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No templates available for this module yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-cyan-50 text-cyan-600 text-xs font-mono">
                    {template.code}
                  </Badge>
                  <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {template.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
                  <span>v{template.version}</span>
                  <span>{template.usageCount || 0} uses</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Use
                  </button>
                  <button
                    onClick={() => handleClone(template)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Clone
                  </button>
                  <button
                    onClick={() => handleExport(template)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
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
            <div className="flex items-center gap-3">
              <Badge className="bg-cyan-50 text-cyan-600 font-mono">{selectedTemplate.code}</Badge>
              <Badge className={getCategoryColor(selectedTemplate.category)}>
                {selectedTemplate.category}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                v{selectedTemplate.version}
              </span>
            </div>

            {selectedTemplate.description && (
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Field Definitions
              </h4>
              {selectedTemplate.fieldDefinitions?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedTemplate.fieldDefinitions.map((field, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {field.label}
                          </span>
                          <Badge className="text-xs bg-gray-200 text-gray-600">{field.type}</Badge>
                          {field.required && (
                            <Badge className="text-xs bg-red-100 text-red-600">Required</Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {field.description}
                          </p>
                        )}
                        {field.options && field.options.length > 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Options: {field.options.join(', ')}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No field definitions available.
                </p>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            Close
          </Button>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={() => {
              if (selectedTemplate) handleUseTemplate(selectedTemplate);
            }}
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
              Fill in the fields below to create a document from this template.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemplate.fieldDefinitions?.map((field) => renderFieldInput(field))}
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
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmitUse}>
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
