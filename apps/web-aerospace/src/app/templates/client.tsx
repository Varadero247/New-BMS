'use client';

import { useState, useEffect, useCallback } from 'react';
import { gateway } from '@/lib/gateway';
import { Input, Card, CardContent, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { FileText, Search, Download, Copy, Eye } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  version: string;
  fieldDefinitions: FieldDefinition[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODULE_FILTER = 'AEROSPACE';
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'AS9100', label: 'AS9100D' },
  { value: 'FAI', label: 'First Article Inspection' },
  { value: 'CONFIGURATION', label: 'Configuration Management' },
  { value: 'SPECIAL_PROCESS', label: 'Special Processes' },
  { value: 'FOD', label: 'FOD Prevention' },
  { value: 'COUNTERFEIT', label: 'Counterfeit Parts' },
  { value: 'MRO', label: 'MRO / Work Orders' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'GENERAL', label: 'General' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUseModal, setShowUseModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // ---- Fetch templates ----
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await gateway.get('/templates', {
        params: {
          module: MODULE_FILTER,
          search: search || undefined,
          category: categoryFilter || undefined,
          limit: 50,
        },
      });
      const data = response.data.data;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ---- Actions ----
  const handleClone = async (id: string) => {
    try {
      await gateway.post(`/templates/${id}/clone`);
      fetchTemplates();
    } catch (err) {
      console.error('Clone failed:', err);
    }
  };

  const handleExport = (id: string) => {
    window.open(`${GATEWAY_URL}/api/v1/templates/${id}/export?format=html`, '_blank');
  };

  const handleOpenUse = (template: Template) => {
    setSelectedTemplate(null);
    setShowUseModal(true);
    setFormData({});
    setSelectedTemplate(template);
  };

  const handleSubmitUse = async () => {
    if (!selectedTemplate) return;
    try {
      await gateway.post(`/templates/${selectedTemplate.id}/use`, { filledData: formData });
      setShowUseModal(false);
      setFormData({});
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (err) {
      console.error('Use template failed:', err);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---- Render helpers ----
  const renderFieldInput = (field: FieldDefinition) => {
    switch (field.type) {
      case 'section':
        return (
          <h3
            key={field.name}
            className="text-lg font-semibold text-gray-800 mt-4 mb-2 border-b pb-1"
          >
            {field.label}
          </h3>
        );
      case 'textarea':
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
            )}
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              rows={3}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
            )}
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              <option value="">-- Select --</option>
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
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
            )}
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder={field.placeholder}
              value={formData[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case 'date':
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
            )}
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.name} className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              checked={!!formData[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      default:
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
            )}
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
    }
  };

  // ---- Main render ----
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-7 w-7 text-sky-600" />
          Aerospace Templates
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AS9100D and FAI templates</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search templates..."
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-sky-500 focus:border-sky-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading templates...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">No templates found.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}

      {/* Template Grid */}
      {!loading && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-sky-100 text-sky-700 text-xs">{template.code}</Badge>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    v{template.version}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {template.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Used {template.usageCount} times
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t pt-3">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowUseModal(false);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-sky-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => handleOpenUse(template)}
                    className="flex items-center gap-1 text-xs text-white bg-sky-600 hover:bg-sky-700 px-2 py-1 rounded transition-colors"
                    title="Use Template"
                  >
                    <FileText className="h-3.5 w-3.5" /> Use
                  </button>
                  <button
                    onClick={() => handleClone(template.id)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-sky-600 transition-colors"
                    title="Clone"
                  >
                    <Copy className="h-3.5 w-3.5" /> Clone
                  </button>
                  <button
                    onClick={() => handleExport(template.id)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-sky-600 transition-colors"
                    title="Export"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
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
        title={selectedTemplate ? `Preview: ${selectedTemplate.name}` : 'Preview'}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-sky-100 text-sky-700">{selectedTemplate.code}</Badge>
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600">
                {selectedTemplate.category}
              </Badge>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Version {selectedTemplate.version}
              </span>
            </div>

            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Field Definitions</h4>
              <ul className="space-y-2">
                {selectedTemplate.fieldDefinitions?.map((field, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    {field.type === 'section' ? (
                      <span className="font-semibold text-gray-800 mt-2">{field.label}</span>
                    ) : (
                      <>
                        <span className="inline-block bg-sky-50 text-sky-600 text-xs px-2 py-0.5 rounded font-mono">
                          {field.type}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
                        {field.required && <span className="text-red-500 text-xs">(required)</span>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            Close
          </Button>
          <Button
            className="bg-sky-600 hover:bg-sky-700 text-white"
            onClick={() => selectedTemplate && handleOpenUse(selectedTemplate)}
          >
            Use Template
          </Button>
        </ModalFooter>
      </Modal>

      {/* Use Template Modal */}
      <Modal
        isOpen={showUseModal && !!selectedTemplate}
        onClose={() => {
          setShowUseModal(false);
          setSelectedTemplate(null);
          setFormData({});
        }}
        title={selectedTemplate ? `Use: ${selectedTemplate.name}` : 'Use Template'}
        size="lg"
      >
        {selectedTemplate && (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Fill in the fields below to create a record from this template.
            </p>
            {selectedTemplate.fieldDefinitions?.map((field) => renderFieldInput(field))}
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
          <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSubmitUse}>
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
