'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Modal } from '@ims/ui';
import { Shield, CheckCircle, AlertTriangle, XCircle, BarChart3, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FactorScore {
  name: string;
  label: string;
  score: number;
  weight: number;
}

interface StandardScore {
  code: string;
  label: string;
  score: number;
  status: 'RED' | 'AMBER' | 'GREEN';
  factors: FactorScore[];
  weight: number;
}

interface ComplianceData {
  overall: {
    score: number;
    status: 'RED' | 'AMBER' | 'GREEN';
  };
  standards: StandardScore[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Color and icon helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; light: string }> = {
  GREEN: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200', light: 'bg-green-50' },
  AMBER: { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  RED: { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', light: 'bg-red-50' },
};

const STANDARD_COLORS: Record<string, { gradient: string; icon: string; badge: string }> = {
  ISO_9001: { gradient: 'from-blue-500 to-blue-600', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
  ISO_45001: { gradient: 'from-red-500 to-red-600', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' },
  ISO_14001: { gradient: 'from-green-500 to-green-600', icon: 'text-green-600', badge: 'bg-green-100 text-green-800' },
  IATF_16949: { gradient: 'from-purple-500 to-purple-600', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
  ISO_13485: { gradient: 'from-teal-500 to-teal-600', icon: 'text-teal-600', badge: 'bg-teal-100 text-teal-800' },
  AS9100D: { gradient: 'from-indigo-500 to-indigo-600', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
};

function StatusIcon({ status, size = 'h-5 w-5' }: { status: string; size?: string }) {
  if (status === 'GREEN') return <CheckCircle className={`${size} text-green-500`} />;
  if (status === 'AMBER') return <AlertTriangle className={`${size} text-amber-500`} />;
  return <XCircle className={`${size} text-red-500`} />;
}

function TrafficLight({ status }: { status: string }) {
  return (
    <div className="flex gap-1.5 items-center">
      <div className={`w-3 h-3 rounded-full ${status === 'RED' ? 'bg-red-500' : 'bg-red-200'}`} />
      <div className={`w-3 h-3 rounded-full ${status === 'AMBER' ? 'bg-amber-500' : 'bg-amber-200'}`} />
      <div className={`w-3 h-3 rounded-full ${status === 'GREEN' ? 'bg-green-500' : 'bg-green-200'}`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gauge Component
// ---------------------------------------------------------------------------

function ComplianceGaugeWidget({ score, status, label, size = 'lg' }: { score: number; status: string; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 100, md: 140, lg: 200 };
  const dimension = sizeMap[size];
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  const statusColor = status === 'GREEN' ? '#22c55e' : status === 'AMBER' ? '#f59e0b' : '#ef4444';
  const fontSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const labelSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} className="transform -rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color: statusColor }}>{score.toFixed(1)}%</span>
          <TrafficLight status={status} />
        </div>
      </div>
      <p className={`mt-2 ${labelSize} font-medium text-gray-700`}>{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Factor Bar Component
// ---------------------------------------------------------------------------

function FactorBar({ factor }: { factor: FactorScore }) {
  const barColor = factor.score >= 85 ? 'bg-green-500' : factor.score >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{factor.label}</span>
        <span className="font-medium">{factor.score.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, factor.score)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">Weight: {(factor.weight * 100).toFixed(0)}%</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ComplianceScoresPage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<StandardScore | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchScores = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/api/dashboard/compliance-scores');
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load compliance scores');
      console.error('Compliance scores error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleStandardClick = (standard: StandardScore) => {
    setSelectedStandard(standard);
    setShowDetail(true);
  };

  // Count by status
  const greenCount = data?.standards.filter(s => s.status === 'GREEN').length || 0;
  const amberCount = data?.standards.filter(s => s.status === 'AMBER').length || 0;
  const redCount = data?.standards.filter(s => s.status === 'RED').length || 0;

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Multi-Standard Compliance</h1>
              <p className="text-gray-500 mt-1">Live compliance scores across all IMS standards</p>
            </div>
            {data?.generatedAt && (
              <p className="text-xs text-gray-400">
                Last calculated: {new Date(data.generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Overall IMS Score */}
              <Card className="border-2 border-gray-200">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 flex justify-center">
                      <ComplianceGaugeWidget
                        score={data.overall.score}
                        status={data.overall.status}
                        label="Overall IMS Compliance"
                        size="lg"
                      />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="h-6 w-6 text-blue-600" />
                          IMS Health Summary
                        </h2>
                        <p className="text-gray-500 text-sm mb-4">
                          Weighted compliance across {data.standards.length} active management system standards
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700">GREEN</span>
                          </div>
                          <p className="text-2xl font-bold text-green-700">{greenCount}</p>
                          <p className="text-xs text-green-600">standards</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">AMBER</span>
                          </div>
                          <p className="text-2xl font-bold text-amber-700">{amberCount}</p>
                          <p className="text-xs text-amber-600">standards</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">RED</span>
                          </div>
                          <p className="text-2xl font-bold text-red-700">{redCount}</p>
                          <p className="text-xs text-red-600">standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Standard Cards */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  Standard Compliance Scores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.standards.map(standard => {
                    const colors = STANDARD_COLORS[standard.code] || STANDARD_COLORS.ISO_9001;
                    const statusStyle = STATUS_STYLES[standard.status];

                    return (
                      <Card
                        key={standard.code}
                        className={`cursor-pointer hover:shadow-lg transition-shadow border ${statusStyle.border}`}
                        onClick={() => handleStandardClick(standard)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${statusStyle.light}`}>
                                <StatusIcon status={standard.status} size="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-sm font-semibold">{standard.label}</CardTitle>
                                <Badge className={colors.badge}>{standard.code.replace(/_/g, ' ')}</Badge>
                              </div>
                            </div>
                            <TrafficLight status={standard.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center mb-4">
                            <ComplianceGaugeWidget
                              score={standard.score}
                              status={standard.status}
                              label=""
                              size="sm"
                            />
                          </div>

                          {/* Mini factor bars */}
                          <div className="space-y-2">
                            {standard.factors.map(factor => {
                              const barColor = factor.score >= 85 ? 'bg-green-400' : factor.score >= 70 ? 'bg-amber-400' : 'bg-red-400';
                              return (
                                <div key={factor.name} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-28 truncate" title={factor.label}>
                                    {factor.label.split(' ').slice(0, 3).join(' ')}
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${barColor}`}
                                      style={{ width: `${Math.min(100, factor.score)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium w-10 text-right">{factor.score.toFixed(0)}%</span>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-xs text-gray-400 mt-3 text-center">
                            Click for detailed breakdown
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-8 justify-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-gray-600">GREEN: &gt;= 85%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="text-gray-600">AMBER: 70% - 84.9%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-gray-600">RED: &lt; 70%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Standard Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedStandard ? `${selectedStandard.label} -- Compliance Breakdown` : 'Standard Details'}
        size="lg"
      >
        {selectedStandard && (
          <div className="space-y-6">
            {/* Score overview */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                <ComplianceGaugeWidget
                  score={selectedStandard.score}
                  status={selectedStandard.status}
                  label=""
                  size="md"
                />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <StatusIcon status={selectedStandard.status} size="h-6 w-6" />
                  <span className={`text-lg font-bold ${STATUS_STYLES[selectedStandard.status].text}`}>
                    {selectedStandard.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Standard Weight: {(selectedStandard.weight * 100).toFixed(0)}%
                </p>
                <Badge className={STANDARD_COLORS[selectedStandard.code]?.badge || 'bg-gray-100 text-gray-800'}>
                  {selectedStandard.code.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Factor breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Factor Breakdown
              </h3>
              <div className="space-y-4">
                {selectedStandard.factors.map(factor => (
                  <FactorBar key={factor.name} factor={factor} />
                ))}
              </div>
            </div>

            {/* Thresholds */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Threshold Definitions</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600">RED: &lt; 70%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-gray-600">AMBER: 70% - 84.9%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">GREEN: &gt;= 85%</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Areas for Improvement</h4>
              <div className="space-y-2">
                {selectedStandard.factors
                  .filter(f => f.score < 85)
                  .sort((a, b) => a.score - b.score)
                  .map(factor => (
                    <div key={factor.name} className="flex items-center gap-3 p-2 bg-amber-50 rounded border border-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm text-amber-800">
                        <strong>{factor.label}</strong> is at {factor.score.toFixed(1)}% (target: 85%+)
                      </span>
                    </div>
                  ))}
                {selectedStandard.factors.filter(f => f.score < 85).length === 0 && (
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">All factors are meeting the GREEN threshold. Excellent performance.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
