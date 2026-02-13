'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Mail, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Sequence {
  id: string;
  name: string;
  stepsCount: number;
  enrolledCount: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSequences();
  }, []);

  async function loadSequences() {
    try {
      setError(null);
      const res = await api.get('/sequences');
      setSequences(res.data.data || []);
    } catch (err) {
      setError('Failed to load email sequences.');
    } finally {
      setLoading(false);
    }
  }

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Sequences</h1>
            <p className="text-gray-500 mt-1">Automated email outreach sequences</p>
          </div>
          <Button variant="outline" onClick={loadSequences} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-600" />
              Sequences ({sequences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sequences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Steps</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Enrolled</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sequences.map((seq) => (
                      <tr key={seq.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{seq.name}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{seq.stepsCount || 0}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{seq.enrolledCount || 0}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[seq.status] || 'bg-gray-100 text-gray-700'}>{seq.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{new Date(seq.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No email sequences found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
