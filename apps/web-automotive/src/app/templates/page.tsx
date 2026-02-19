'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { Search, FileText, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  format: string;
  version: string;
  downloadUrl: string;
  createdAt: string;
}

const CATEGORIES = [
  'APQP',
  'PPAP',
  'FMEA',
  'CONTROL_PLAN',
  'MSA',
  'SPC',
  'EIGHT_D',
  'LPA',
  'SUPPLIER',
  'GENERAL',
];
const catColor = (c: string) =>
  c === 'FMEA'
    ? 'bg-orange-100 text-orange-700'
    : c === 'PPAP'
      ? 'bg-blue-100 text-blue-700'
      : c === 'APQP'
        ? 'bg-purple-100 text-purple-700'
        : c === 'EIGHT_D'
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700';

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Templates</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              IATF 16949 document and form templates
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search templates..."
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-8 w-8 text-orange-600 mt-0.5" />
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${catColor(item.category)}`}
                    >
                      {item.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      v{item.version} · {item.format}
                    </span>
                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No templates found</p>
            <p className="text-sm mt-1">Templates will appear here when added to the system</p>
          </div>
        )}
      </div>
    </div>
  );
}
