'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Grid3X3 } from 'lucide-react';
import { api } from '@/lib/api';

interface MaterialityTopic {
  id: string;
  topic: string;
  category: string;
  stakeholderImportance: number;
  businessImpact: number;
  priority: string;
  description: string;
  status: string;
}

export default function MaterialityPage() {
  const [topics, setTopics] = useState<MaterialityTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const res = await api.get('/materiality');
      setTopics(res.data.data || []);
    } catch (error) {
      console.error('Error loading materiality topics:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = topics.filter(t => JSON.stringify(t).toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h1 className="text-3xl font-bold text-gray-900">Materiality Matrix</h1>
            <p className="text-gray-500 mt-1">Assess and prioritize ESG topics by stakeholder importance and business impact</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Topic
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search topics..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-green-600" />
              Materiality Topics ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Topic</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Stakeholder Importance</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Business Impact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(topic => (
                      <tr key={topic.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{topic.topic}</td>
                        <td className="py-3 px-4 text-gray-600">{topic.category}</td>
                        <td className="py-3 px-4 text-center">{topic.stakeholderImportance}/5</td>
                        <td className="py-3 px-4 text-center">{topic.businessImpact}/5</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${topic.priority === 'HIGH' ? 'bg-red-100 text-red-700' : topic.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {topic.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${topic.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {topic.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No materiality topics found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
