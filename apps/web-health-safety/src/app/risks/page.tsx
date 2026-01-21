'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { RiskMatrix } from '@ims/charts';
import { Plus, Filter, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Risk {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  likelihood: number;
  severity: number;
  detectability: number;
  riskScore: number;
  riskLevel: string;
  status: string;
  createdAt: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRisks();
  }, []);

  async function loadRisks() {
    try {
      const response = await api.get('/risks');
      setRisks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRisks = filter === 'all'
    ? risks
    : risks.filter(r => r.riskLevel === filter);

  const riskCounts = {
    all: risks.length,
    CRITICAL: risks.filter(r => r.riskLevel === 'CRITICAL').length,
    HIGH: risks.filter(r => r.riskLevel === 'HIGH').length,
    MEDIUM: risks.filter(r => r.riskLevel === 'MEDIUM').length,
    LOW: risks.filter(r => r.riskLevel === 'LOW').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Register</h1>
            <p className="text-gray-500 mt-1">Manage occupational health and safety risks</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Risk
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === level
                  ? level === 'CRITICAL' ? 'bg-red-600 text-white' :
                    level === 'HIGH' ? 'bg-orange-500 text-white' :
                    level === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                    level === 'LOW' ? 'bg-green-500 text-white' :
                    'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level === 'all' ? 'All' : level} ({riskCounts[level]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Risks ({filteredRisks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : filteredRisks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">{risk.referenceNumber}</span>
                              <Badge variant={
                                risk.riskLevel === 'CRITICAL' ? 'destructive' :
                                risk.riskLevel === 'HIGH' ? 'warning' :
                                risk.riskLevel === 'MEDIUM' ? 'default' : 'secondary'
                              }>
                                {risk.riskLevel}
                              </Badge>
                              <Badge variant="outline">{risk.status}</Badge>
                            </div>
                            <h3 className="font-medium text-gray-900">{risk.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{risk.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>L: {risk.likelihood}</span>
                              <span>S: {risk.severity}</span>
                              <span>D: {risk.detectability}</span>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-gray-300">{risk.riskScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No risks found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Matrix */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Risk Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrix
                  risks={risks.map(r => ({
                    id: r.id,
                    likelihood: r.likelihood,
                    severity: r.severity,
                    title: r.title,
                  }))}
                  onCellClick={(l, s) => console.log('Cell clicked:', l, s)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
