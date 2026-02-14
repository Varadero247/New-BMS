'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Search, FileText, Plus, Star, Download, Play, Filter,
  Shield, Award, Leaf, Users, GitBranch, Briefcase,
} from 'lucide-react';
import api from '@/lib/api';

interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  estimatedDuration: number | null;
  usageCount: number;
  isBuiltIn: boolean;
  tags: string[];
}

const CATEGORY_ICONS: Record<string, any> = {
  ISO_COMPLIANCE: Shield,
  QUALITY: Award,
  ENVIRONMENTAL: Leaf,
  HR: Users,
  GENERAL: GitBranch,
  PROCUREMENT: Briefcase,
};

const CATEGORY_COLORS: Record<string, string> = {
  ISO_COMPLIANCE: 'bg-red-100 text-red-700',
  QUALITY: 'bg-blue-100 text-blue-700',
  ENVIRONMENTAL: 'bg-green-100 text-green-700',
  HR: 'bg-orange-100 text-orange-700',
  GENERAL: 'bg-indigo-100 text-indigo-700',
  PROCUREMENT: 'bg-amber-100 text-amber-700',
  APPROVAL: 'bg-purple-100 text-purple-700',
  CHANGE_MANAGEMENT: 'bg-cyan-100 text-cyan-700',
};

const MOCK_TEMPLATES: WorkflowTemplate[] = [
  { id: '1', code: 'WF-NCR-001', name: 'Non-Conformance Report (NCR)', description: 'Full NCR lifecycle from detection through root cause analysis to CAPA closure with sign-off.', category: 'QUALITY', triggerType: 'MANUAL', estimatedDuration: 14, usageCount: 47, isBuiltIn: true, tags: ['ISO 9001', 'NCR', 'CAPA'] },
  { id: '2', code: 'WF-CAPA-001', name: 'Corrective & Preventive Action', description: 'ISO-compliant CAPA workflow with effectiveness review and management approval gates.', category: 'QUALITY', triggerType: 'ON_CREATE', estimatedDuration: 30, usageCount: 89, isBuiltIn: true, tags: ['ISO 9001', 'CAPA'] },
  { id: '3', code: 'WF-INC-001', name: 'Incident Investigation', description: 'H&S incident reporting, investigation, root cause analysis and corrective action.', category: 'ISO_COMPLIANCE', triggerType: 'MANUAL', estimatedDuration: 7, usageCount: 34, isBuiltIn: true, tags: ['ISO 45001', 'H&S', 'Incident'] },
  { id: '4', code: 'WF-CHG-001', name: 'Change Management', description: 'Formal change request process with impact assessment, approval chain, and implementation review.', category: 'CHANGE_MANAGEMENT', triggerType: 'MANUAL', estimatedDuration: 21, usageCount: 28, isBuiltIn: true, tags: ['Change Control', 'ISO 9001'] },
  { id: '5', code: 'WF-AUD-001', name: 'Internal Audit', description: 'Plan, conduct and follow up internal audits with finding tracking and management review.', category: 'ISO_COMPLIANCE', triggerType: 'SCHEDULED', estimatedDuration: 14, usageCount: 22, isBuiltIn: true, tags: ['Audit', 'ISO 9001', 'ISO 45001'] },
  { id: '6', code: 'WF-ONB-001', name: 'Employee Onboarding', description: 'New employee onboarding tasks including induction, training assignment and equipment setup.', category: 'HR', triggerType: 'ON_CREATE', estimatedDuration: 5, usageCount: 15, isBuiltIn: true, tags: ['HR', 'Onboarding'] },
  { id: '7', code: 'WF-SUPP-001', name: 'Supplier Approval', description: 'New supplier qualification workflow including document review, assessment and approval.', category: 'PROCUREMENT', triggerType: 'MANUAL', estimatedDuration: 28, usageCount: 11, isBuiltIn: true, tags: ['Supplier', 'ISO 9001'] },
  { id: '8', code: 'WF-ENV-001', name: 'Environmental Aspect Review', description: 'Periodic environmental aspect significance assessment with management sign-off.', category: 'ENVIRONMENTAL', triggerType: 'SCHEDULED', estimatedDuration: 7, usageCount: 8, isBuiltIn: true, tags: ['ISO 14001', 'Environmental'] },
  { id: '9', code: 'WF-DOC-001', name: 'Document Control', description: 'Document creation, review, approval and controlled release workflow.', category: 'GENERAL', triggerType: 'MANUAL', estimatedDuration: 5, usageCount: 65, isBuiltIn: true, tags: ['Document Control', 'ISO 9001'] },
  { id: '10', code: 'WF-AI-001', name: 'AI Impact Assessment', description: 'ISO 42001 AI system impact assessment and risk evaluation workflow.', category: 'ISO_COMPLIANCE', triggerType: 'MANUAL', estimatedDuration: 10, usageCount: 3, isBuiltIn: true, tags: ['ISO 42001', 'AI Governance'] },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/templates');
        setTemplates(res.data.data || MOCK_TEMPLATES);
      } catch {
        setTemplates(MOCK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = templates.filter(t => {
    const matchSearch = search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === '' || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(templates.map(t => t.category))].sort();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
          <p className="text-gray-500 text-sm mt-1">Start from an ISO-compliant template or build from scratch</p>
        </div>
        <a
          href="/definitions/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Build from Scratch
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 shadow text-center">
          <p className="text-2xl font-bold text-indigo-600">{templates.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Templates</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow text-center">
          <p className="text-2xl font-bold text-indigo-600">{templates.filter(t => t.isBuiltIn).length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Built-in Templates</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow text-center">
          <p className="text-2xl font-bold text-indigo-600">{templates.reduce((s, t) => s + t.usageCount, 0)}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Deployments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No templates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => {
            const Icon = CATEGORY_ICONS[template.category] || GitBranch;
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700'}`}>
                        {template.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {template.isBuiltIn && (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Name & Code */}
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{template.code}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mt-2 flex-1 line-clamp-3">{template.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {template.estimatedDuration && (
                        <span>{template.estimatedDuration}d avg</span>
                      )}
                      <span>{template.usageCount} uses</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                        <Download className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        <Play className="h-3.5 w-3.5" />
                        Use
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
