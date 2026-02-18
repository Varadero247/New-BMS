'use client';

import { useEffect, useState } from 'react';
import { gatewayApi } from '@/lib/gateway';

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}

interface Template {
  id: string;
  code: string;
  name: string;
  description?: string;
  module: string;
  category?: string;
  version: number;
  isBuiltIn: boolean;
  status: string;
  content?: string;
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<Template | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setError(null);
      const res = await gatewayApi.get('/templates?module=ISO37001');
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }

  async function viewTemplateDetails(template: Template) {
    setViewTemplate(template);
    setTemplateContent('');
    setViewModalOpen(true);
    try {
      const res = await gatewayApi.get(`/templates/${template.id}`);
      const data = res.data.data;
      setViewTemplate(data);
      setTemplateContent(data.content || data.htmlContent || '');
    } catch (err) {
      console.error('Error loading template details:', err);
    }
  }

  async function handleClone(id: string) {
    try {
      await gatewayApi.post(`/templates/${id}/clone`);
      loadTemplates();
    } catch (err) {
      console.error('Error cloning template:', err);
    }
  }

  async function handleExport(id: string) {
    try {
      const res = await gatewayApi.get(`/templates/${id}/export`);
      const data = res.data.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting template:', err);
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO 37001 document templates and forms
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              aria-label="Search templates..."
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <svg
                        className="h-5 w-5 text-rose-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {template.code}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[template.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                  >
                    {template.status}
                  </span>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
                  <span>v{template.version}</span>
                  {template.isBuiltIn && (
                    <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      Built-in
                    </span>
                  )}
                  {template.category && <span>{template.category}</span>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => viewTemplateDetails(template)}
                    className="text-sm text-rose-600 hover:text-rose-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleClone(template.id)}
                    className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-300"
                  >
                    Clone
                  </button>
                  <button
                    onClick={() => handleExport(template.id)}
                    className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-300"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="h-12 w-12 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No templates found for ISO 37001 module</p>
          </div>
        )}
      </div>

      {viewModalOpen && viewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setViewModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {viewTemplate.name}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Code</p>
                    <p className="font-mono font-medium">{viewTemplate.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                    <p className="font-medium">v{viewTemplate.version}</p>
                  </div>
                </div>
                {viewTemplate.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-gray-700 dark:text-gray-300">{viewTemplate.description}</p>
                  </div>
                )}
                {templateContent && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Content Preview</p>
                    <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800 max-h-96 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(templateContent) }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handleExport(viewTemplate.id)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
