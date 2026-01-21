'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, Leaf, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface Aspect {
  id: string;
  referenceNumber: string;
  title: string;
  activity: string;
  aspect: string;
  impact: string;
  controlMeasures: string;
  likelihood: number;
  severity: number;
  frequency: number;
  significanceScore: number;
  significanceLevel: string;
  status: string;
  createdAt: string;
}

export default function AspectsPage() {
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAspects();
  }, []);

  async function loadAspects() {
    try {
      const response = await api.get('/aspects');
      setAspects(response.data.data || []);
    } catch (error) {
      console.error('Failed to load aspects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAspects = filter === 'all'
    ? aspects
    : aspects.filter(a => a.significanceLevel === filter);

  const counts = {
    all: aspects.length,
    SIGNIFICANT: aspects.filter(a => a.significanceLevel === 'SIGNIFICANT').length,
    MODERATE: aspects.filter(a => a.significanceLevel === 'MODERATE').length,
    LOW: aspects.filter(a => a.significanceLevel === 'LOW').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Environmental Aspects</h1>
            <p className="text-gray-500 mt-1">Aspects and impacts register</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Aspect
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'SIGNIFICANT', 'MODERATE', 'LOW'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === level
                  ? level === 'SIGNIFICANT' ? 'bg-red-600 text-white' :
                    level === 'MODERATE' ? 'bg-yellow-500 text-white' :
                    level === 'LOW' ? 'bg-green-500 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level === 'all' ? 'All' : level} ({counts[level]})
            </button>
          ))}
        </div>

        {/* Aspects List */}
        <Card>
          <CardHeader>
            <CardTitle>Aspects ({filteredAspects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredAspects.length > 0 ? (
              <div className="space-y-4">
                {filteredAspects.map((aspect) => (
                  <div
                    key={aspect.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{aspect.referenceNumber}</span>
                          <Badge variant={
                            aspect.significanceLevel === 'SIGNIFICANT' ? 'destructive' :
                            aspect.significanceLevel === 'MODERATE' ? 'warning' : 'secondary'
                          }>
                            {aspect.significanceLevel}
                          </Badge>
                          <Badge variant="outline">{aspect.status}</Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">{aspect.title}</h3>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Activity: </span>
                            <span className="text-gray-700">{aspect.activity}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Impact: </span>
                            <span className="text-gray-700">{aspect.impact}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>L: {aspect.likelihood}</span>
                          <span>S: {aspect.severity}</span>
                          <span>F: {aspect.frequency}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-300">{aspect.significanceScore}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No aspects found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
