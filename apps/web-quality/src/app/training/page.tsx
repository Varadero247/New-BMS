'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, GraduationCap, Users, Calendar, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Training {
  id: string;
  title: string;
  description: string;
  trainingType: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  participants: number;
}

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainings();
  }, []);

  async function loadTrainings() {
    try {
      const response = await api.get('/training').catch(() => ({ data: { data: [] } }));
      setTrainings(response.data.data || []);
    } catch (error) {
      console.error('Failed to load trainings:', error);
    } finally {
      setLoading(false);
    }
  }

  const upcomingTrainings = trainings.filter(t => t.status === 'SCHEDULED');
  const completedTrainings = trainings.filter(t => t.status === 'COMPLETED');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Training</h1>
            <p className="text-gray-500 mt-1">Quality awareness and competency training</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Training
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold">{trainings.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{upcomingTrainings.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTrainings.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Trained</p>
                  <p className="text-2xl font-bold">
                    {trainings.reduce((acc, t) => acc + (t.participants || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : upcomingTrainings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTrainings.map((training) => (
                    <div key={training.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="default">{training.trainingType}</Badge>
                          <h3 className="font-medium text-gray-900 mt-1">{training.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="text-blue-600 font-medium">
                            {new Date(training.scheduledDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">{training.participants} participants</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming training scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : completedTrainings.length > 0 ? (
                <div className="space-y-4">
                  {completedTrainings.slice(0, 5).map((training) => (
                    <div key={training.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{training.trainingType}</Badge>
                            <Badge variant="outline" className="text-green-600">Completed</Badge>
                          </div>
                          <h3 className="font-medium text-gray-900 mt-1">{training.title}</h3>
                        </div>
                        <div className="text-sm text-right">
                          <p className="text-gray-600">
                            {training.completedDate
                              ? new Date(training.completedDate).toLocaleDateString()
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">{training.participants} trained</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed training records</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
