'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  category: string;
  influence: string;
  interest: string;
  engagementMethod: string;
  contactPerson: string;
  status: string;
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStakeholders();
  }, []);

  async function loadStakeholders() {
    try {
      const res = await api.get('/stakeholders');
      setStakeholders(res.data.data || []);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = stakeholders.filter(s => JSON.stringify(s).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">Stakeholders</h1>
            <p className="text-gray-500 mt-1">Manage stakeholder engagement and communication</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Stakeholder
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search stakeholders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Stakeholders ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Influence</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Interest</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Engagement</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(sh => (
                      <tr key={sh.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{sh.name}</td>
                        <td className="py-3 px-4 text-gray-600">{sh.type}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sh.influence === 'HIGH' ? 'bg-red-100 text-red-700' : sh.influence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {sh.influence}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sh.interest === 'HIGH' ? 'bg-blue-100 text-blue-700' : sh.interest === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                            {sh.interest}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{sh.engagementMethod}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sh.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {sh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stakeholders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
