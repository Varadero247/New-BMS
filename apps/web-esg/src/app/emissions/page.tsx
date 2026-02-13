'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Cloud } from 'lucide-react';
import { api } from '@/lib/api';

interface Emission {
  id: string;
  scope: string;
  source: string;
  category: string;
  amount: number;
  unit: string;
  co2Equivalent: number;
  period: string;
  status: string;
  createdAt: string;
}

const scopeColors: Record<string, string> = {
  SCOPE_1: 'bg-emerald-100 text-emerald-700',
  SCOPE_2: 'bg-amber-100 text-amber-700',
  SCOPE_3: 'bg-orange-100 text-orange-700',
};

export default function EmissionsPage() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');

  useEffect(() => {
    loadEmissions();
  }, []);

  async function loadEmissions() {
    try {
      const res = await api.get('/emissions');
      setEmissions(res.data.data || []);
    } catch (error) {
      console.error('Error loading emissions:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = emissions.filter(e => {
    const matchesSearch = !searchTerm || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = !scopeFilter || e.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Emissions</h1>
            <p className="text-gray-500 mt-1">Track Scope 1, 2 & 3 greenhouse gas emissions</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Log Emission
          </button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search emissions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Scopes</option>
                <option value="SCOPE_1">Scope 1</option>
                <option value="SCOPE_2">Scope 2</option>
                <option value="SCOPE_3">Scope 3</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-green-600" />
              Emissions ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Scope</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">CO2e (tonnes)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(emission => (
                      <tr key={emission.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{emission.source}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${scopeColors[emission.scope] || 'bg-gray-100 text-gray-700'}`}>
                            {emission.scope?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{emission.category}</td>
                        <td className="py-3 px-4 text-right">{emission.amount} {emission.unit}</td>
                        <td className="py-3 px-4 text-right font-medium">{emission.co2Equivalent?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">{emission.period}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emission.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {emission.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emissions records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
