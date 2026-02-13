'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Zap } from 'lucide-react';
import { api } from '@/lib/api';

interface EnergyRecord {
  id: string;
  source: string;
  type: string;
  consumption: number;
  unit: string;
  facility: string;
  period: string;
  cost: number;
  renewable: boolean;
  status: string;
}

export default function EnergyPage() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await api.get('/energy');
      setRecords(res.data.data || []);
    } catch (error) {
      console.error('Error loading energy records:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = records.filter(r => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">Energy Consumption</h1>
            <p className="text-gray-500 mt-1">Track energy usage and renewable sources</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Log Energy
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search energy records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Energy Records ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Consumption</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Facility</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Renewable</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(record => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{record.source}</td>
                        <td className="py-3 px-4 text-gray-600">{record.type}</td>
                        <td className="py-3 px-4 text-right">{record.consumption} {record.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{record.facility}</td>
                        <td className="py-3 px-4 text-gray-600">{record.period}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.renewable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {record.renewable ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No energy records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
