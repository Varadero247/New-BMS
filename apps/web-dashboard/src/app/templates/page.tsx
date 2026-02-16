'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, FileText, Star, Download, Eye, Plus, XCircle, Tag } from 'lucide-react';
import { api } from '@/lib/api';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  standard: string;
  description: string;
  format: string;
  isBuiltIn: boolean;
  usageCount: number;
  lastUpdated: string;
  tags: string[];
  version: string;
}

const MOCK_TEMPLATES: TemplateItem[] = [
  { id: '1', name: 'Internal Audit Report', category: 'Audit', standard: 'ISO 9001 / 14001 / 45001', description: 'Structured report for documenting internal audit findings, observations and recommendations', format: 'DOCX', isBuiltIn: true, usageCount: 142, lastUpdated: '2026-01-15', tags: ['Audit', 'ISO', 'Internal'], version: '3.2' },
  { id: '2', name: 'Corrective Action (CAPA) Form', category: 'Quality', standard: 'ISO 9001:2015', description: 'Formal CAPA form including root cause analysis section, containment actions, and effectiveness review', format: 'DOCX', isBuiltIn: true, usageCount: 389, lastUpdated: '2026-01-20', tags: ['CAPA', 'NCR', 'Quality'], version: '2.1' },
  { id: '3', name: 'Incident Investigation Report', category: 'H&S', standard: 'ISO 45001:2018', description: 'Full incident investigation with timeline, contributing factors, corrective actions and witness statements', format: 'DOCX', isBuiltIn: true, usageCount: 201, lastUpdated: '2026-02-01', tags: ['Incident', 'H&S', 'Safety'], version: '4.0' },
  { id: '4', name: 'Risk Assessment (5x5 Matrix)', category: 'Risk', standard: 'ISO 31000 / ISO 45001', description: 'Risk register template with 5×5 likelihood/consequence matrix and control measures', format: 'XLSX', isBuiltIn: true, usageCount: 178, lastUpdated: '2026-01-10', tags: ['Risk', 'Matrix', 'Assessment'], version: '2.5' },
  { id: '5', name: 'Management Review Minutes', category: 'Management', standard: 'ISO 9001 / 14001 / 45001', description: 'Template for recording management review meeting agenda, attendance, decisions and actions', format: 'DOCX', isBuiltIn: true, usageCount: 96, lastUpdated: '2026-01-05', tags: ['Management', 'Review', 'ISO'], version: '1.8' },
  { id: '6', name: 'Supplier Evaluation Form', category: 'Supply Chain', standard: 'ISO 9001:2015 cl.8.4', description: 'Initial and periodic supplier evaluation scoring criteria with weighted scoring', format: 'XLSX', isBuiltIn: true, usageCount: 67, lastUpdated: '2025-12-15', tags: ['Supplier', 'Procurement', 'Evaluation'], version: '2.0' },
  { id: '7', name: 'Environmental Aspect Register', category: 'Environment', standard: 'ISO 14001:2015', description: 'Register of environmental aspects and their impacts with significance scoring', format: 'XLSX', isBuiltIn: true, usageCount: 54, lastUpdated: '2025-11-20', tags: ['Environment', 'Aspect', 'ISO 14001'], version: '1.5' },
  { id: '8', name: 'AI Impact Assessment', category: 'AI Governance', standard: 'ISO 42001:2023', description: 'Template for assessing risks and impacts of AI system deployment', format: 'DOCX', isBuiltIn: true, usageCount: 28, lastUpdated: '2026-02-10', tags: ['AI', 'ISO 42001', 'Assessment'], version: '1.0' },
  { id: '9', name: 'Change Management Request', category: 'Quality', standard: 'ISO 9001:2015 cl.6.3', description: 'Formal change request form for controlled changes to processes, products, or systems', format: 'DOCX', isBuiltIn: true, usageCount: 113, lastUpdated: '2026-01-08', tags: ['Change', 'Quality', 'Control'], version: '3.1' },
  { id: '10', name: 'GHG Inventory Worksheet', category: 'ESG', standard: 'GHG Protocol', description: 'Scope 1, 2 and 3 emissions data collection worksheet with built-in emission factor lookups', format: 'XLSX', isBuiltIn: true, usageCount: 45, lastUpdated: '2025-12-01', tags: ['ESG', 'Emissions', 'GHG'], version: '2.3' },
  { id: '11', name: 'Training Needs Analysis', category: 'HR', standard: 'ISO 9001:2015 cl.7.2', description: 'Competence gap analysis and training needs assessment per role and department', format: 'XLSX', isBuiltIn: false, usageCount: 32, lastUpdated: '2026-02-05', tags: ['Training', 'HR', 'Competence'], version: '1.2' },
  { id: '12', name: 'Document Control Register', category: 'Document Control', standard: 'ISO 9001:2015 cl.7.5', description: 'Master document register with version control, approval status and review dates', format: 'XLSX', isBuiltIn: true, usageCount: 89, lastUpdated: '2026-01-18', tags: ['Document', 'Control', 'Register'], version: '2.7' },
];

const CATEGORY_STYLES: Record<string, string> = {
  Audit: 'bg-blue-100 text-blue-700',
  Quality: 'bg-indigo-100 text-indigo-700',
  'H&S': 'bg-red-100 text-red-700',
  Risk: 'bg-orange-100 text-orange-700',
  Management: 'bg-purple-100 text-purple-700',
  'Supply Chain': 'bg-amber-100 text-amber-700',
  Environment: 'bg-green-100 text-green-700',
  'AI Governance': 'bg-violet-100 text-violet-700',
  ESG: 'bg-teal-100 text-teal-700',
  HR: 'bg-pink-100 text-pink-700',
  'Document Control': 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const FORMAT_STYLES: Record<string, string> = {
  DOCX: 'bg-blue-50 text-blue-600',
  XLSX: 'bg-green-50 text-green-600',
  PDF: 'bg-red-50 text-red-600',
};

export default function TemplatesPage() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [showBuiltInOnly, setShowBuiltInOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/templates');
        setItems(r.data.data || MOCK_TEMPLATES);
      } catch {
        setItems(MOCK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === '' || i.category === categoryFilter;
    const matchFormat = formatFilter === '' || i.format === formatFilter;
    const matchBuiltIn = !showBuiltInOnly || i.isBuiltIn;
    return matchSearch && matchCategory && matchFormat && matchBuiltIn;
  });

  const categories = [...new Set(items.map(i => i.category))].sort();
  const builtIn = items.filter(i => i.isBuiltIn).length;
  const totalUsage = items.reduce((s, i) => s + i.usageCount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Templates</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO-compliant document templates for all IMS modules</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Upload Template
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Templates', value: items.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Built-in Templates', value: builtIn, color: 'bg-green-50 text-green-700' },
            { label: 'Total Downloads', value: totalUsage.toLocaleString(), color: 'bg-purple-50 text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search templates, standards, tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Formats</option>
            <option value="DOCX">DOCX</option>
            <option value="XLSX">XLSX</option>
            <option value="PDF">PDF</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showBuiltInOnly}
              onChange={e => setShowBuiltInOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Built-in only
          </label>
        </div>

        {/* Templates grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No templates match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(tpl => (
              <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_STYLES[tpl.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {tpl.category}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${FORMAT_STYLES[tpl.format] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                        {tpl.format}
                      </span>
                    </div>
                    {tpl.isBuiltIn && (
                      <span title="Built-in template"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" /></span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-1">{tpl.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{tpl.description}</p>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                    <span className="font-medium text-gray-600">Standard:</span> {tpl.standard}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tpl.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded flex items-center gap-0.5">
                        <Tag className="h-2.5 w-2.5" />{t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      <p>v{tpl.version} · {tpl.usageCount} uses</p>
                      <p>Updated {new Date(tpl.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-blue-100 text-blue-600" title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
