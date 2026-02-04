'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookTemplate, FileCode, Users, Package } from 'lucide-react';
import api from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  industry: string | null;
  version: string;
  isActive: boolean;
  icon: string | null;
  color: string | null;
  tags: string[];
  _count: { definitions: number };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('isActive', 'true');

      const response = await api.get(`/templates?${params.toString()}`);
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'APPROVAL':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'ONBOARDING':
      case 'OFFBOARDING':
        return <Users className="h-8 w-8 text-green-500" />;
      case 'PROCUREMENT':
        return <Package className="h-8 w-8 text-purple-500" />;
      default:
        return <FileCode className="h-8 w-8 text-indigo-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      APPROVAL: 'bg-blue-100 text-blue-800',
      ONBOARDING: 'bg-green-100 text-green-800',
      OFFBOARDING: 'bg-orange-100 text-orange-800',
      PROCUREMENT: 'bg-purple-100 text-purple-800',
      INCIDENT: 'bg-red-100 text-red-800',
      CHANGE_REQUEST: 'bg-yellow-100 text-yellow-800',
      SERVICE_REQUEST: 'bg-teal-100 text-teal-800',
      QUALITY: 'bg-cyan-100 text-cyan-800',
      COMPLIANCE: 'bg-indigo-100 text-indigo-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
        <Link
          href="/templates/new"
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Template</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="APPROVAL">Approval</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="OFFBOARDING">Offboarding</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="INCIDENT">Incident</option>
          <option value="CHANGE_REQUEST">Change Request</option>
          <option value="SERVICE_REQUEST">Service Request</option>
          <option value="QUALITY">Quality</option>
          <option value="COMPLIANCE">Compliance</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <BookTemplate className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Total Templates</p>
              <p className="text-xl font-semibold">{templates.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Approval Templates</p>
              <p className="text-xl font-semibold">
                {templates.filter((t) => t.category === 'APPROVAL').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Procurement Templates</p>
              <p className="text-xl font-semibold">
                {templates.filter((t) => t.category === 'PROCUREMENT').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <FileCode className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Definitions</p>
              <p className="text-xl font-semibold">
                {templates.reduce((sum, t) => sum + t._count.definitions, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <div className="col-span-full rounded-lg bg-white p-12 text-center shadow">
            <BookTemplate className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates found</h3>
            <p className="mt-2 text-gray-500">Get started by creating a workflow template.</p>
          </div>
        ) : (
          templates.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="group rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(template.category)}
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">v{template.version}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryBadge(template.category)}`}>
                  {template.category.replace(/_/g, ' ')}
                </span>
              </div>

              {template.description && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">{template.description}</p>
              )}

              {template.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">
                  {template._count.definitions} definitions
                </span>
                {template.industry && (
                  <span className="text-sm text-gray-500">{template.industry}</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
