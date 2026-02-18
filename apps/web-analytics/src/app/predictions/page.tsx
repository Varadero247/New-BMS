'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CapaOverrun {
  capaId: string;
  title: string;
  daysOpen: number;
  targetDays: number;
  overrunProbability: number;
  daysAtRisk: number;
  recommendation: string;
  owner: string;
  module: string;
}

interface AuditClause {
  clause: string;
  title: string;
  likelyFinding: string;
  confidence: number;
  rationale: string;
}

interface NcrForecast {
  currentMonth: { month: string; actualCount: number; forecastCount: number; accuracy: number };
  nextMonthForecast: {
    month: string;
    forecastCount: number;
    confidenceInterval: { low: number; high: number };
    trend: string;
    trendReason: string;
  };
  topRiskCategories: {
    category: string;
    forecastCount: number;
    percentOfTotal: number;
    trend: string;
  }[];
  topRiskSuppliers: { supplier: string; riskScore: number; recentNcrs: number; trend: string }[];
  historicalTrend: { month: string; count: number }[];
}

type TabId = 'capa' | 'audit' | 'ncr';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function probabilityColor(p: number): string {
  if (p >= 0.7) return 'text-red-600 bg-red-100';
  if (p >= 0.4) return 'text-orange-600 bg-orange-100';
  return 'text-green-600 bg-green-100';
}

function findingColor(f: string): string {
  if (f === 'MAJOR_NC') return 'bg-red-100 text-red-700';
  if (f === 'MINOR_NC') return 'bg-orange-100 text-orange-700';
  if (f === 'OBSERVATION') return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function findingLabel(f: string): string {
  if (f === 'MAJOR_NC') return 'Major NC';
  if (f === 'MINOR_NC') return 'Minor NC';
  if (f === 'OBSERVATION') return 'Observation';
  return 'Clear';
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'INCREASING' || trend === 'HIGH_RISK')
    return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (trend === 'DECREASING' || trend === 'LOW_RISK')
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('capa');
  const [capaData, setCapaData] = useState<{
    predictions: CapaOverrun[];
    summary: any;
    aiDisclosure: any;
  } | null>(null);
  const [auditData, setAuditData] = useState<{
    clauses: AuditClause[];
    summary: any;
    aiDisclosure: any;
    standard: string;
    auditDate: string;
  } | null>(null);
  const [ncrData, setNcrData] = useState<(NcrForecast & { aiDisclosure: any }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [capaRes, auditRes, ncrRes] = await Promise.all([
          api.get('/predictions/capa-overrun').catch(() => null),
          api.get('/predictions/audit-forecast').catch(() => null),
          api.get('/predictions/ncr-forecast').catch(() => null),
        ]);
        if (capaRes) setCapaData(capaRes.data.data);
        if (auditRes) setAuditData(auditRes.data.data);
        if (ncrRes) setNcrData(ncrRes.data.data);
      } catch {
        // graceful fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'capa', label: 'CAPA Overrun' },
    { id: 'audit', label: 'Audit Forecast' },
    { id: 'ncr', label: 'NCR Forecast' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Predictive Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI-powered predictions for CAPA overruns, audit outcomes, and NCR rates
          </p>
        </div>

        {/* AI Disclosure Banner */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">AI Disclosure:</span> Predictions are generated by IMS
            Predictive Engine (ims-predict-v1). Results should be reviewed by a qualified
            professional before making decisions.
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CAPA Overrun Tab */}
        {activeTab === 'capa' && capaData && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg p-4 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                <p className="text-2xl font-bold">{capaData.summary.totalCapasAnalysed}</p>
                <p className="text-sm font-medium mt-0.5">CAPAs Analysed</p>
              </div>
              <div className="rounded-lg p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <p className="text-2xl font-bold">{capaData.summary.highRisk}</p>
                <p className="text-sm font-medium mt-0.5">High Risk</p>
              </div>
              <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                <p className="text-2xl font-bold">{capaData.summary.moderateRisk}</p>
                <p className="text-sm font-medium mt-0.5">Moderate Risk</p>
              </div>
              <div className="rounded-lg p-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                <p className="text-2xl font-bold">{capaData.summary.alreadyOverdue}</p>
                <p className="text-sm font-medium mt-0.5">Already Overdue</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  CAPA Overrun Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          CAPA ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Days Open
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Target
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Overrun Risk
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Owner
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Recommendation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {capaData.predictions.map((capa) => (
                        <tr
                          key={capa.capaId}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {capa.capaId}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate">
                            {capa.title}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={
                                capa.daysOpen > capa.targetDays
                                  ? 'text-red-600 font-bold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }
                            >
                              {capa.daysOpen}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">
                            {capa.targetDays}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${probabilityColor(capa.overrunProbability)}`}
                            >
                              {Math.round(capa.overrunProbability * 100)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                            {capa.owner}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                            <p className="line-clamp-2">{capa.recommendation}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Audit Forecast Tab */}
        {activeTab === 'audit' && auditData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="rounded-lg p-4 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                <p className="text-2xl font-bold">{auditData.summary.totalClauses}</p>
                <p className="text-sm font-medium mt-0.5">Clauses Assessed</p>
              </div>
              <div className="rounded-lg p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <p className="text-2xl font-bold">{auditData.summary.predictedClear}</p>
                <p className="text-sm font-medium mt-0.5">Likely Clear</p>
              </div>
              <div className="rounded-lg p-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                <p className="text-2xl font-bold">{auditData.summary.predictedObservations}</p>
                <p className="text-sm font-medium mt-0.5">Observations</p>
              </div>
              <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                <p className="text-2xl font-bold">{auditData.summary.predictedMinorNCs}</p>
                <p className="text-sm font-medium mt-0.5">Minor NCs</p>
              </div>
              <div className="rounded-lg p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <p className="text-2xl font-bold">{auditData.summary.overallReadiness}%</p>
                <p className="text-sm font-medium mt-0.5">Readiness Score</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  {auditData.standard} Audit Forecast &mdash; {auditData.auditDate}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Clause
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Likely Finding
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Confidence
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Rationale
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditData.clauses.map((clause) => (
                        <tr
                          key={clause.clause}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                            {clause.clause}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {clause.title}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${findingColor(clause.likelyFinding)}`}
                            >
                              {findingLabel(clause.likelyFinding)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">
                            {Math.round(clause.confidence * 100)}%
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-md">
                            <p className="line-clamp-2">{clause.rationale}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* NCR Forecast Tab */}
        {activeTab === 'ncr' && ncrData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg p-4 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                <p className="text-2xl font-bold">{ncrData.nextMonthForecast.forecastCount}</p>
                <p className="text-sm font-medium mt-0.5">
                  {ncrData.nextMonthForecast.month} Forecast
                </p>
              </div>
              <div className="rounded-lg p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <p className="text-2xl font-bold">
                  {ncrData.nextMonthForecast.confidenceInterval.low}-
                  {ncrData.nextMonthForecast.confidenceInterval.high}
                </p>
                <p className="text-sm font-medium mt-0.5">Confidence Range</p>
              </div>
              <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                <p className="text-2xl font-bold flex items-center gap-1">
                  <TrendIcon trend={ncrData.nextMonthForecast.trend} />{' '}
                  {ncrData.nextMonthForecast.trend}
                </p>
                <p className="text-sm font-medium mt-0.5">Trend</p>
              </div>
              <div className="rounded-lg p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <p className="text-2xl font-bold">{ncrData.currentMonth.accuracy}%</p>
                <p className="text-sm font-medium mt-0.5">Model Accuracy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Risk Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Risk Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ncrData.topRiskCategories.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendIcon trend={cat.trend} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {cat.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {cat.forecastCount} NCRs ({cat.percentOfTotal}%)
                          </span>
                          <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${cat.percentOfTotal}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Risk Suppliers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Risk Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ncrData.topRiskSuppliers.map((sup) => (
                      <div key={sup.supplier} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {sup.supplier}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {sup.recentNcrs} recent NCR(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              sup.trend === 'HIGH_RISK'
                                ? 'bg-red-100 text-red-700'
                                : sup.trend === 'MODERATE_RISK'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            Risk: {Math.round(sup.riskScore * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NCR Historical Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-40">
                  {ncrData.historicalTrend.map((point) => {
                    const maxCount = Math.max(...ncrData.historicalTrend.map((p) => p.count));
                    const heightPct = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
                    return (
                      <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {point.count}
                        </span>
                        <div
                          className="w-full bg-purple-200 dark:bg-purple-800 rounded-t"
                          style={{ height: `${heightPct}%`, minHeight: '4px' }}
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {point.month.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 italic">
                  {ncrData.nextMonthForecast.trendReason}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
