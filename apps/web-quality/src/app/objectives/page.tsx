'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, Target } from 'lucide-react';
import { api } from '@/lib/api';

interface Objective {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  dueDate: string;
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObjectives();
  }, []);

  async function loadObjectives() {
    try {
      const response = await api.get('/objectives').catch(() => ({ data: { data: [] } }));
      setObjectives(response.data.data || []);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  }

  function getProgressPercentage(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Objectives</h1>
            <p className="text-gray-500 mt-1">Track and monitor quality targets</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Objective
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{objectives.length}</p>
              <p className="text-sm text-gray-500">Total Objectives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {objectives.filter(o => o.status === 'ACHIEVED').length}
              </p>
              <p className="text-sm text-gray-500">Achieved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {objectives.filter(o => o.status === 'ON_TRACK').length}
              </p>
              <p className="text-sm text-gray-500">On Track</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {objectives.filter(o => o.status === 'AT_RISK' || o.status === 'BEHIND').length}
              </p>
              <p className="text-sm text-gray-500">At Risk</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Quality Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-gray-200 rounded" />
                ))}
              </div>
            ) : objectives.length > 0 ? (
              <div className="space-y-4">
                {objectives.map((obj) => {
                  const progress = getProgressPercentage(obj.currentValue, obj.targetValue);
                  return (
                    <div key={obj.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">{obj.referenceNumber}</span>
                            <Badge variant={
                              obj.status === 'ACHIEVED' ? 'secondary' :
                              obj.status === 'ON_TRACK' ? 'default' :
                              obj.status === 'AT_RISK' ? 'warning' : 'destructive'
                            }>
                              {obj.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-900">{obj.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{obj.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-700">{progress}%</p>
                          <p className="text-xs text-gray-400">{obj.currentValue} / {obj.targetValue} {obj.unit}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 70 ? 'bg-blue-500' :
                            progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Due: {new Date(obj.dueDate).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No objectives defined yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
