'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { FileText, Download, Eye, Copy, Search } from 'lucide-react';
import { gatewayApi } from '@/lib/gateway';

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
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-700',
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
      const res = await gatewayApi.get('/templates?module=INFOSEC');
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

  const filteredTemplates = templates.filter(t =>
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded" />)}</div></div></div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Information security document templates and forms</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </CardContent>
        </Card>

        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FileText className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{template.code}</p>
                      </div>
                    </div>
                    <Badge className={statusColors[template.status] || 'bg-gray-100 text-gray-700'}>{template.status}</Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>v{template.version}</span>
                    {template.isBuiltIn && <Badge className="bg-teal-50 text-teal-600">Built-in</Badge>}
                    {template.category && <span>{template.category}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewTemplateDetails(template)} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700">
                      <Eye className="h-3 w-3" /> View
                    </button>
                    <button onClick={() => handleClone(template.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                      <Copy className="h-3 w-3" /> Clone
                    </button>
                    <button onClick={() => handleExport(template.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                      <Download className="h-3 w-3" /> Export
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates found for InfoSec module</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={viewTemplate?.name || 'Template'} size="lg">
        {viewTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Code</p><p className="font-mono font-medium">{viewTemplate.code}</p></div>
              <div><p className="text-sm text-gray-500">Version</p><p className="font-medium">v{viewTemplate.version}</p></div>
            </div>
            {viewTemplate.description && (
              <div><p className="text-sm text-gray-500">Description</p><p className="text-gray-700">{viewTemplate.description}</p></div>
            )}
            {templateContent && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Content Preview</p>
                <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: templateContent }} />
                </div>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
          {viewTemplate && (
            <Button onClick={() => handleExport(viewTemplate.id)} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
