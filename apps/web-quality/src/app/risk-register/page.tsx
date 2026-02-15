'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, AlertTriangle, Shield, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Risk {
  id: string;
  riskNumber: string;
  title: string;
  description: string;
  riskCategory: string;
  riskType: string;
  status: string;
  likelihood: number;
  impact: number;
  currentRiskScore?: number;
  currentRiskLevel?: string;
  residualRiskScore?: number;
  residualRiskLevel?: string;
  ownerId?: string;
  nextReviewDate?: string;
  _count?: { assessments: number; controls: number; treatments: number };
}

const riskLevelColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  EXTREME: 'bg-red-100 text-red-700 border-red-300',
};

const statusColors: Record<string, string> = {
  IDENTIFIED: 'bg-blue-100 text-blue-700',
  BEING_ASSESSED: 'bg-purple-100 text-purple-700',
  ASSESSED: 'bg-cyan-100 text-cyan-700',
  TREATMENT_PLANNED: 'bg-yellow-100 text-yellow-700',
  TREATMENT_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  MONITORED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ACCEPTED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

const categoryIcons: Record<string, string> = {
  STRATEGIC: '🎯',
  OPERATIONAL: '⚙️',
  FINANCIAL: '💰',
  COMPLIANCE: '📋',
  REPUTATIONAL: '⭐',
  TECHNICAL: '🔧',
  MARKET: '📊',
  SUPPLY_CHAIN: '🔗',
  SAFETY: '🛡️',
};

export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    loadRisks();
  }, [levelFilter, categoryFilter]);

  async function loadRisks() {
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.append('currentRiskLevel', levelFilter);
      if (categoryFilter) params.append('riskCategory', categoryFilter);

      const res = await api.get(`/qms-risks?${params.toString()}`);
      setRisks(res.data.data || []);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: risks.length,
    extreme: risks.filter(r => r.currentRiskLevel === 'EXTREME').length,
    high: risks.filter(r => r.currentRiskLevel === 'HIGH').length,
    medium: risks.filter(r => r.currentRiskLevel === 'MEDIUM').length,
    low: risks.filter(r => r.currentRiskLevel === 'LOW').length,
    withTreatments: risks.filter(r => (r._count?.treatments || 0) > 0).length,
  };

  // Create risk matrix data
  const riskMatrix = Array(5).fill(null).map(() => Array(5).fill(0));
  risks.forEach(risk => {
    if (risk.likelihood && risk.impact) {
      riskMatrix[5 - risk.likelihood][risk.impact - 1]++;
    }
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Enterprise risk management and treatment tracking</p>
          </div>
          <Link href="/risk-register/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Risk
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Risks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Extreme</p>
                  <p className="text-2xl font-bold text-red-600">{stats.extreme}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Medium</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
                  <p className="text-2xl font-bold text-green-600">{stats.low}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">With Treatment</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.withTreatments}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Heatmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-2 -rotate-90 w-20">Likelihood →</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-end mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Impact →</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {riskMatrix.map((row, rowIdx) =>
                    row.map((count, colIdx) => {
                      const score = (5 - rowIdx) * (colIdx + 1);
                      let bgColor = 'bg-green-100';
                      if (score > 15) bgColor = 'bg-red-200';
                      else if (score > 10) bgColor = 'bg-orange-200';
                      else if (score > 5) bgColor = 'bg-yellow-200';

                      return (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className={`${bgColor} h-12 flex items-center justify-center rounded text-sm font-medium ${count > 0 ? 'text-gray-800' : 'text-gray-400'}`}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Risk Levels</option>
                <option value="EXTREME">Extreme</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="STRATEGIC">Strategic</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="FINANCIAL">Financial</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="TECHNICAL">Technical</option>
                <option value="SUPPLY_CHAIN">Supply Chain</option>
                <option value="SAFETY">Safety</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Risks List */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Register</CardTitle>
          </CardHeader>
          <CardContent>
            {risks.length > 0 ? (
              <div className="space-y-4">
                {risks.map((risk) => (
                  <Link key={risk.id} href={`/risk-register/${risk.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{categoryIcons[risk.riskCategory] || '⚠️'}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{risk.title}</span>
                            {risk.currentRiskLevel && (
                              <Badge className={riskLevelColors[risk.currentRiskLevel] || 'bg-gray-100 dark:bg-gray-800'}>
                                {risk.currentRiskLevel}
                              </Badge>
                            )}
                            <Badge className={statusColors[risk.status] || 'bg-gray-100 dark:bg-gray-800'}>
                              {risk.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{risk.riskNumber}</span>
                            <span>•</span>
                            <span>{risk.riskCategory.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Score: {risk.currentRiskScore || 'N/A'}</span>
                            {risk.residualRiskScore && (
                              <>
                                <span>→</span>
                                <span className="text-green-600">Residual: {risk.residualRiskScore}</span>
                              </>
                            )}
                            {risk._count && (
                              <>
                                <span>•</span>
                                <span>{risk._count.controls} controls</span>
                                <span>•</span>
                                <span>{risk._count.treatments} treatments</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          L: {risk.likelihood} × I: {risk.impact}
                        </div>
                        {risk.nextReviewDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Review: {new Date(risk.nextReviewDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No risks found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
