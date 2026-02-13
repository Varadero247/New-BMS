'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, ClipboardCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface Audit {
  id: string;
  title: string;
  type: string;
  scope: string;
  auditor: string;
  scheduledDate: string;
  completedDate: string;
  findings: number;
  status: string;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    try {
      const res = await api.get('/audits');
      setAudits(res.data.data || []);
    } catch (error) {
      console.error('Error loading audits:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = audits.filter(a => JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">ESG Audits</h1>
            <p className="text-gray-500 mt-1">Plan and track ESG audits and assessments</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Schedule Audit
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search audits..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              Audits ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Auditor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Scheduled</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Findings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(audit => (
                      <tr key={audit.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{audit.title}</td>
                        <td className="py-3 px-4 text-gray-600">{audit.type}</td>
                        <td className="py-3 px-4 text-gray-600">{audit.auditor}</td>
                        <td className="py-3 px-4 text-gray-600">{audit.scheduledDate ? new Date(audit.scheduledDate).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4 text-center">{audit.findings || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${audit.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : audit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {audit.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audits found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
