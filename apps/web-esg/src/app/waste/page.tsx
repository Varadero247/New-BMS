'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface WasteRecord {
  id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  recycledPercentage: number;
  facility: string;
  date: string;
  status: string;
}

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await api.get('/waste');
      setRecords(res.data.data || []);
    } catch (error) {
      console.error('Error loading waste records:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
            <p className="text-gray-500 mt-1">Track waste generation and disposal</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Log Waste
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search waste records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-green-600" />
              Waste Records ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Disposal Method</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Recycled %</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Facility</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(record => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{record.type}</td>
                        <td className="py-3 px-4 text-gray-600">{record.category}</td>
                        <td className="py-3 px-4 text-right">{record.quantity} {record.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{record.disposalMethod}</td>
                        <td className="py-3 px-4 text-right">{record.recycledPercentage}%</td>
                        <td className="py-3 px-4 text-gray-600">{record.facility}</td>
                        <td className="py-3 px-4 text-gray-600">{record.date ? new Date(record.date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No waste records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
