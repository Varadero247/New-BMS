'use client';

import { useState } from 'react';
import { Card, CardContent, Badge } from '@ims/ui';

interface DataCategory {
  id: string;
  name: string;
  type: 'personal' | 'sensitive' | 'special-category';
  sources: string[];
  processors: string[];
  legalBasis: string;
  retention: string;
  transfers: string[];
  subjects: string[];
  volume: string;
}

const CATEGORIES: DataCategory[] = [
  {
    id: 'dc-1',
    name: 'Employee Personal Data',
    type: 'personal',
    sources: ['HR System', 'Recruitment Portal'],
    processors: ['HR Team', 'Payroll Provider'],
    legalBasis: 'Contract Performance (Art. 6(1)(b))',
    retention: '7 years post-employment',
    transfers: ['Payroll SaaS (EU)', 'Benefits Provider (EU)'],
    subjects: ['Employees', 'Contractors'],
    volume: '~2,500 records',
  },
  {
    id: 'dc-2',
    name: 'Customer Contact Data',
    type: 'personal',
    sources: ['CRM', 'Website Forms', 'Sales Calls'],
    processors: ['Sales Team', 'Marketing Team'],
    legalBasis: 'Legitimate Interest (Art. 6(1)(f))',
    retention: '3 years post-last interaction',
    transfers: ['Email SaaS (US - SCCs)', 'CRM SaaS (EU)'],
    subjects: ['Customers', 'Prospects'],
    volume: '~18,000 records',
  },
  {
    id: 'dc-3',
    name: 'Health & Safety Records',
    type: 'sensitive',
    sources: ['H&S Module', 'Incident Reports'],
    processors: ['H&S Team', 'Occupational Health'],
    legalBasis: 'Legal Obligation (Art. 6(1)(c)) + Art. 9(2)(b)',
    retention: '40 years (injury records)',
    transfers: ['None (on-premise)'],
    subjects: ['Employees', 'Visitors'],
    volume: '~850 records',
  },
  {
    id: 'dc-4',
    name: 'Supplier Due Diligence',
    type: 'personal',
    sources: ['Supplier Portal', 'Background Checks'],
    processors: ['Procurement', 'Compliance'],
    legalBasis: 'Legitimate Interest (Art. 6(1)(f))',
    retention: '5 years post-contract',
    transfers: ['Background Check Provider (UK)'],
    subjects: ['Supplier Contacts', 'Directors'],
    volume: '~1,200 records',
  },
  {
    id: 'dc-5',
    name: 'CCTV Footage',
    type: 'personal',
    sources: ['CCTV Cameras'],
    processors: ['Security Team'],
    legalBasis: 'Legitimate Interest (Art. 6(1)(f))',
    retention: '30 days rolling',
    transfers: ['Cloud Storage (EU)'],
    subjects: ['Employees', 'Visitors', 'Public'],
    volume: '~90 TB/year',
  },
  {
    id: 'dc-6',
    name: 'Training & Competence Records',
    type: 'personal',
    sources: ['HR Module', 'LMS', 'External Certifications'],
    processors: ['HR Team', 'Managers'],
    legalBasis: 'Legal Obligation (Art. 6(1)(c))',
    retention: '6 years post-employment',
    transfers: ['LMS SaaS (EU)'],
    subjects: ['Employees'],
    volume: '~4,500 records',
  },
  {
    id: 'dc-7',
    name: 'Whistleblower Reports',
    type: 'special-category',
    sources: ['Anonymous Reporting Portal'],
    processors: ['Compliance Officer', 'Legal'],
    legalBasis: 'Legal Obligation (Art. 6(1)(c)) + Art. 9(2)(g)',
    retention: '10 years',
    transfers: ['None (air-gapped)'],
    subjects: ['Reporters', 'Subjects of Reports'],
    volume: '~15 records',
  },
];

const typeConfig = {
  personal: { label: 'Personal', bg: 'bg-blue-100 text-blue-700' },
  sensitive: { label: 'Sensitive', bg: 'bg-orange-100 text-orange-700' },
  'special-category': { label: 'Special Category', bg: 'bg-red-100 text-red-700' },
};

export default function DataMapPage() {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(null);
  const [filter, setFilter] = useState<'all' | 'personal' | 'sensitive' | 'special-category'>(
    'all'
  );

  const filtered = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.type === filter);

  const stats = {
    total: CATEGORIES.length,
    personal: CATEGORIES.filter((c) => c.type === 'personal').length,
    sensitive: CATEGORIES.filter((c) => c.type === 'sensitive').length,
    special: CATEGORIES.filter((c) => c.type === 'special-category').length,
    transfers: new Set(CATEGORIES.flatMap((c) => c.transfers)).size,
    processors: new Set(CATEGORIES.flatMap((c) => c.processors)).size,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GDPR Data Map</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Processing activities and data flow inventory (ROPA)
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-6 gap-3">
        {[
          {
            label: 'Data Categories',
            value: stats.total,
            color: 'text-gray-900 dark:text-gray-100',
          },
          { label: 'Personal', value: stats.personal, color: 'text-blue-600' },
          { label: 'Sensitive', value: stats.sensitive, color: 'text-orange-600' },
          { label: 'Special Category', value: stats.special, color: 'text-red-600' },
          { label: 'Transfer Destinations', value: stats.transfers, color: 'text-purple-600' },
          { label: 'Processors', value: stats.processors, color: 'text-teal-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'personal', 'sensitive', 'special-category'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
              filter === f
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-gray-900 text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all'
              ? 'All'
              : f === 'special-category'
                ? 'Special Category'
                : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Data Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cat) => {
          const tc = typeConfig[cat.type];
          return (
            <Card
              key={cat.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${selectedCategory?.id === cat.id ? 'ring-2 ring-teal-500' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {cat.name}
                  </h3>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tc.bg}`}
                  >
                    {tc.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Legal Basis:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                      {cat.legalBasis.split('(')[0].trim()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Retention:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                      {cat.retention}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Volume:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                      {cat.volume}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Subjects:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                      {cat.subjects.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedCategory?.id === cat.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Data Sources
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {cat.sources.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Processors
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {cat.processors.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        International Transfers
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {cat.transfers.map((t) => (
                          <Badge
                            key={t}
                            variant={t.includes('US') ? 'destructive' : 'secondary'}
                            className="text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Full Legal Basis
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{cat.legalBasis}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
