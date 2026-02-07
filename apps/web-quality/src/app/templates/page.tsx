'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Badge } from '@ims/ui';
import { FileText, Workflow, AlertOctagon, ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'process' | 'nc' | 'action';
}

const typeConfig = {
  process: {
    label: 'Process',
    icon: Workflow,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'default' as const,
    route: '/processes',
  },
  nc: {
    label: 'Nonconformance',
    icon: AlertOctagon,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'destructive' as const,
    route: '/nonconformances',
  },
  action: {
    label: 'Action',
    icon: ClipboardList,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'secondary' as const,
    route: '/actions',
  },
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function useTemplate(template: Template) {
    const config = typeConfig[template.type];
    router.push(`${config.route}?template=${template.id}`);
  }

  const filteredTemplates = typeFilter === 'all'
    ? templates
    : templates.filter(t => t.type === typeFilter);

  const typeCounts = {
    all: templates.length,
    process: templates.filter(t => t.type === 'process').length,
    nc: templates.filter(t => t.type === 'nc').length,
    action: templates.filter(t => t.type === 'action').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ISO 9001 Templates</h1>
          <p className="text-gray-500 mt-1">Pre-defined templates to quickly create processes, NCs, and actions</p>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'all', label: 'All Templates', icon: FileText },
            { key: 'process', label: 'Processes', icon: Workflow },
            { key: 'nc', label: 'Nonconformances', icon: AlertOctagon },
            { key: 'action', label: 'Actions', icon: ClipboardList },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label} ({typeCounts[tab.key as keyof typeof typeCounts]})
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const config = typeConfig[template.type];
              const Icon = config.icon;
              return (
                <Card key={template.id} className={`hover:shadow-md transition-shadow border ${config.border}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={config.badge}>{config.label}</Badge>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{template.description}</p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => useTemplate(template)}
                    >
                      Use Template
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No templates found</p>
            <p className="text-gray-400 text-sm mt-1">Templates will appear here once the API is running</p>
          </div>
        )}
      </div>
    </div>
  );
}
