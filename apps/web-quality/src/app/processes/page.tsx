'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, Workflow, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Process {
  id: string;
  referenceNumber: string;
  name: string;
  description: string;
  owner: string;
  status: string;
  riskLevel: string;
  lastReviewDate: string;
  nextReviewDate: string;
  createdAt: string;
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcesses();
  }, []);

  async function loadProcesses() {
    try {
      const response = await api.get('/processes');
      setProcesses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load processes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Process Register</h1>
            <p className="text-gray-500 mt-1">Manage quality management system processes</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Process
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{processes.length}</p>
              <p className="text-sm text-gray-500">Total Processes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {processes.filter(p => p.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {processes.filter(p => p.status === 'UNDER_REVIEW').length}
              </p>
              <p className="text-sm text-gray-500">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {processes.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
              </p>
              <p className="text-sm text-gray-500">High Risk</p>
            </CardContent>
          </Card>
        </div>

        {/* Processes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-500" />
                Processes
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search processes..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : processes.length > 0 ? (
              <div className="space-y-4">
                {processes.map((process) => (
                  <div
                    key={process.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{process.referenceNumber}</span>
                          <Badge variant={
                            process.status === 'ACTIVE' ? 'secondary' :
                            process.status === 'UNDER_REVIEW' ? 'warning' : 'outline'
                          }>
                            {process.status.replace('_', ' ')}
                          </Badge>
                          {process.riskLevel && (
                            <Badge variant={
                              process.riskLevel === 'CRITICAL' || process.riskLevel === 'HIGH' ? 'destructive' :
                              process.riskLevel === 'MEDIUM' ? 'warning' : 'outline'
                            }>
                              {process.riskLevel} RISK
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{process.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{process.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Owner: {process.owner}</span>
                          <span>Next Review: {new Date(process.nextReviewDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No processes defined yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Process
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
