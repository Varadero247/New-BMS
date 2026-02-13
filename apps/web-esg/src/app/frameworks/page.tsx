'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
  coverage: number;
  lastAssessed: string;
  requirements: number;
  metRequirements: number;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFrameworks();
  }, []);

  async function loadFrameworks() {
    try {
      const res = await api.get('/frameworks');
      setFrameworks(res.data.data || []);
    } catch (error) {
      console.error('Error loading frameworks:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = frameworks.filter(f => JSON.stringify(f).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">ESG Frameworks</h1>
            <p className="text-gray-500 mt-1">Manage reporting frameworks and standards</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search frameworks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Frameworks ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Version</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Coverage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Requirements</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Last Assessed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(fw => (
                      <tr key={fw.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{fw.name}</td>
                        <td className="py-3 px-4 text-gray-600">{fw.version}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${fw.coverage || 0}%` }} />
                            </div>
                            <span className="text-xs">{fw.coverage || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{fw.metRequirements || 0}/{fw.requirements || 0}</td>
                        <td className="py-3 px-4 text-gray-600">{fw.lastAssessed ? new Date(fw.lastAssessed).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${fw.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {fw.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No frameworks found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
