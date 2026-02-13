'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Target } from 'lucide-react';
import { api } from '@/lib/api';

interface ESGTarget {
  id: string;
  name: string;
  category: string;
  baselineYear: number;
  targetYear: number;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  progress: number;
}

const statusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-yellow-100 text-yellow-700',
  BEHIND: 'bg-red-100 text-red-700',
  ACHIEVED: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-gray-100 text-gray-700',
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<ESGTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTargets();
  }, []);

  async function loadTargets() {
    try {
      const res = await api.get('/targets');
      setTargets(res.data.data || []);
    } catch (error) {
      console.error('Error loading targets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = targets.filter(t => JSON.stringify(t).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">ESG Targets</h1>
            <p className="text-gray-500 mt-1">Track sustainability targets and progress</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Target
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search targets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Targets ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Baseline</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(target => (
                      <tr key={target.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{target.name}</td>
                        <td className="py-3 px-4 text-gray-600">{target.category}</td>
                        <td className="py-3 px-4 text-gray-600">{target.baselineValue} {target.unit} ({target.baselineYear})</td>
                        <td className="py-3 px-4 text-gray-600">{target.targetValue} {target.unit} ({target.targetYear})</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(target.progress || 0, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium">{target.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[target.status] || 'bg-gray-100 text-gray-700'}`}>
                            {target.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No targets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
