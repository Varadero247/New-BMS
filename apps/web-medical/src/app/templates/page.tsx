'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, FileText, Download, ExternalLink } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  standard: string;
  description: string;
  format: string;
  version: string;
}

const TEMPLATES: Template[] = [
  { id: '1', name: 'Design Control Plan', category: 'Design Controls', standard: 'ISO 13485 / 21 CFR 820', description: 'Master plan for design and development activities including phases, reviews, and responsibilities.', format: 'DOCX', version: '3.1' },
  { id: '2', name: 'Design Input Requirements', category: 'Design Controls', standard: 'ISO 13485 / 21 CFR 820.30', description: 'Template for documenting intended use, user needs, and design requirements.', format: 'DOCX', version: '2.4' },
  { id: '3', name: 'Design Output Specification', category: 'Design Controls', standard: 'ISO 13485 / 21 CFR 820.30', description: 'Device specifications, drawings, and manufacturing instructions.', format: 'DOCX', version: '2.1' },
  { id: '4', name: 'Design Review Record', category: 'Design Controls', standard: 'ISO 13485 7.3.5', description: 'Formal design review meeting minutes and findings.', format: 'DOCX', version: '1.8' },
  { id: '5', name: 'Verification Protocol & Report', category: 'Verification', standard: 'ISO 13485 7.3.6', description: 'Protocol and report template for design verification testing.', format: 'DOCX', version: '2.6' },
  { id: '6', name: 'Validation Protocol & Report', category: 'Validation', standard: 'ISO 13485 7.3.7', description: 'Protocol and report for design validation under simulated or actual use conditions.', format: 'DOCX', version: '2.5' },
  { id: '7', name: 'Usability Engineering File', category: 'Validation', standard: 'IEC 62366-1', description: 'Usability engineering process documentation including formative and summative evaluations.', format: 'DOCX', version: '1.3' },
  { id: '8', name: 'Risk Management File', category: 'Risk Management', standard: 'ISO 14971:2019', description: 'Risk management plan, FMEA, risk evaluation, and residual risk summary.', format: 'XLSX', version: '3.0' },
  { id: '9', name: 'FMEA Worksheet', category: 'Risk Management', standard: 'ISO 14971 / AIAG', description: 'Failure Mode and Effects Analysis for medical device risk identification.', format: 'XLSX', version: '2.2' },
  { id: '10', name: 'Software Requirements Specification', category: 'Software', standard: 'IEC 62304', description: 'Software requirements including safety classification and functional requirements.', format: 'DOCX', version: '1.9' },
  { id: '11', name: 'Software Architecture Document', category: 'Software', standard: 'IEC 62304', description: 'Software architecture description, unit decomposition, and interfaces.', format: 'DOCX', version: '1.5' },
  { id: '12', name: 'Software Anomaly Report', category: 'Software', standard: 'IEC 62304 9.1', description: 'Bug/anomaly tracking and resolution record for medical device software.', format: 'DOCX', version: '1.2' },
  { id: '13', name: 'CAPA Form', category: 'CAPA', standard: '21 CFR 820.100', description: 'Corrective and Preventive Action initiation, root cause analysis, and closure template.', format: 'DOCX', version: '2.8' },
  { id: '14', name: 'Complaint Handling Record', category: 'Complaints', standard: '21 CFR 820.198', description: 'Customer complaint intake, investigation, and MDR reportability assessment.', format: 'DOCX', version: '2.3' },
  { id: '15', name: 'MDR Reportability Decision Tree', category: 'Complaints', standard: '21 CFR 803', description: 'Step-by-step decision tree for FDA Medical Device Report reportability.', format: 'PDF', version: '1.6' },
  { id: '16', name: 'Device History Record (DHR)', category: 'Device Records', standard: '21 CFR 820.184', description: 'Production records for each manufactured device or batch.', format: 'DOCX', version: '2.0' },
  { id: '17', name: 'Device Master Record (DMR)', category: 'Device Records', standard: '21 CFR 820.181', description: 'Master record index for device specifications, procedures, and quality standards.', format: 'DOCX', version: '1.7' },
  { id: '18', name: 'UDI Assignment Worksheet', category: 'UDI', standard: 'FDA GUDID / EU MDR', description: 'Unique Device Identifier assignment, labelling requirements, and GUDID submission checklist.', format: 'XLSX', version: '1.1' },
  { id: '19', name: '510(k) Submission Checklist', category: 'Regulatory Submissions', standard: '21 CFR 807.87', description: 'FDA 510(k) premarket notification submission preparation checklist.', format: 'DOCX', version: '2.9' },
  { id: '20', name: 'PMA Application Template', category: 'Regulatory Submissions', standard: '21 CFR 814', description: 'Premarket Approval Application structure and content requirements.', format: 'DOCX', version: '1.4' },
  { id: '21', name: 'CE Technical File Index', category: 'Regulatory Submissions', standard: 'EU MDR 2017/745', description: 'Technical documentation index for EU CE marking under MDR.', format: 'DOCX', version: '1.8' },
  { id: '22', name: 'PMCF Plan & Evaluation Report', category: 'Post-Market Surveillance', standard: 'EU MDR 2017/745', description: 'Post-Market Clinical Follow-up plan and evaluation report templates.', format: 'DOCX', version: '1.3' },
  { id: '23', name: 'PMS Plan', category: 'Post-Market Surveillance', standard: 'EU MDR 2017/745 Art.84', description: 'Post-Market Surveillance plan covering data sources, evaluation criteria, and timelines.', format: 'DOCX', version: '1.6' },
  { id: '24', name: 'Traceability Matrix', category: 'Traceability', standard: 'ISO 13485 7.3', description: 'Requirements-to-verification-to-validation traceability matrix spreadsheet.', format: 'XLSX', version: '2.1' },
];

const CATEGORIES = [...new Set(TEMPLATES.map(t => t.category))];
const FORMAT_COLORS: Record<string, string> = {
  DOCX: 'bg-blue-100 text-blue-700',
  XLSX: 'bg-green-100 text-green-700',
  PDF: 'bg-red-100 text-red-700',
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = TEMPLATES.filter(t => {
    const matchSearch = !search || JSON.stringify(t).toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const stats = {
    total: TEMPLATES.length,
    categories: CATEGORIES.length,
    docx: TEMPLATES.filter(t => t.format === 'DOCX').length,
    xlsx: TEMPLATES.filter(t => t.format === 'XLSX').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Templates</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 13485 / 21 CFR 820 / MDR EU — ready-to-use document templates</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 text-teal-700 text-sm font-medium">
            {stats.total} templates available
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Templates', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Categories', value: stats.categories, color: 'text-teal-700', bg: 'bg-teal-100' },
            { label: 'Word (DOCX)', value: stats.docx, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Excel (XLSX)', value: stats.xlsx, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><FileText className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search templates..." placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {categoryFilter ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const catTemplates = filtered.filter(t => t.category === category);
              if (catTemplates.length === 0) return null;
              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    {category}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({catTemplates.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${FORMAT_COLORS[template.format] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
            {template.format}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 leading-tight">{template.name}</h3>
        <p className="text-xs text-teal-600 font-medium mb-2">{template.standard}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">{template.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">v{template.version}</span>
          <div className="flex gap-2">
            <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Preview">
              <ExternalLink className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Download">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
