'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Shield } from 'lucide-react';
import { api } from '@/lib/api';

interface GovernanceMetric {
  id: string;
  category: string;
  indicator: string;
  value: string;
  compliance: string;
  lastReview: string;
  nextReview: string;
  responsible: string;
  status: string;
}

export default function GovernancePage() {
  const [metrics, setMetrics] = useState<GovernanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const res = await api.get('/governance');
      setMetrics(res.data.data || []);
    } catch (error) {
      console.error('Error loading governance metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = metrics.filter(m => JSON.stringify(m).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
            <p className="text-gray-500 mt-1">Track governance metrics and compliance</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Metric
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search governance metrics..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Governance Metrics ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Indicator</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Compliance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Responsible</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(metric => (
                      <tr key={metric.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{metric.category}</td>
                        <td className="py-3 px-4 text-gray-600">{metric.indicator}</td>
                        <td className="py-3 px-4 text-gray-600">{metric.value}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${metric.compliance === 'COMPLIANT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {metric.compliance}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{metric.responsible}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${metric.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {metric.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No governance metrics found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
