'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileCode, Play, Pause, Archive } from 'lucide-react';
import api from '@/lib/api';

interface Definition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  triggerType: string;
  status: string;
  version: number;
  createdAt: string;
}

export default function DefinitionsPage() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchDefinitions();
  }, [statusFilter, categoryFilter]);

  const fetchDefinitions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await api.get(`/definitions?${params.toString()}`);
      setDefinitions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching definitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      DEPRECATED: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-4 w-4 text-green-500" />;
      case 'DEPRECATED': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'ARCHIVED': return <Archive className="h-4 w-4 text-red-500" />;
      default: return <FileCode className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading definitions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Definitions</h1>
        <Link
          href="/definitions/new"
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>New Definition</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="DEPRECATED">Deprecated</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="APPROVAL">Approval</option>
          <option value="REVIEW">Review</option>
          <option value="CHANGE_MANAGEMENT">Change Management</option>
          <option value="INCIDENT">Incident</option>
          <option value="REQUEST">Request</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="OFFBOARDING">Offboarding</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Definition</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {definitions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <FileCode className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No workflow definitions found</p>
                </td>
              </tr>
            ) : (
              definitions.map((def) => (
                <tr key={def.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/definitions/${def.id}`} className="text-indigo-600 hover:text-indigo-900">
                      <div className="font-medium">{def.name}</div>
                      <div className="text-sm text-gray-500">{def.code}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{def.category.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{def.triggerType}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">v{def.version}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(def.status)}`}>
                      {getStatusIcon(def.status)}
                      <span>{def.status}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
