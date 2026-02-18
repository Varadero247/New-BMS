'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Award,
  Target,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ScorecardData {
  overallScore: number;
  overallGrade: string;
  trend: string;
  qualityScore: number;
  deliveryScore: number;
  responseScore: number;
  complianceScore: number;
  pricingScore: number;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  qualityIssues: number;
  returnRate: number;
  lastUpdated: string;
}

interface ScoreHistory {
  month: string;
  score: number;
}

interface PeriodMetric {
  label: string;
  current: number;
  previous: number;
  unit: string;
  higherIsBetter: boolean;
}

const DEFAULT_SCORECARD: ScorecardData = {
  overallScore: 0,
  overallGrade: 'N/A',
  trend: 'STABLE',
  qualityScore: 0,
  deliveryScore: 0,
  responseScore: 0,
  complianceScore: 0,
  pricingScore: 0,
  totalOrders: 0,
  onTimeDeliveries: 0,
  lateDeliveries: 0,
  qualityIssues: 0,
  returnRate: 0,
  lastUpdated: '',
};

function gradeColor(grade: string) {
  if (grade === 'A+' || grade === 'A') return 'text-green-700 bg-green-100';
  if (grade === 'A-' || grade === 'B+') return 'text-teal-700 bg-teal-100';
  if (grade === 'B' || grade === 'B-') return 'text-blue-700 bg-blue-100';
  if (grade === 'C+' || grade === 'C') return 'text-yellow-700 bg-yellow-100';
  return 'text-red-700 bg-red-100';
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-700';
  if (score >= 80) return 'text-teal-700';
  if (score >= 70) return 'text-blue-700';
  if (score >= 60) return 'text-yellow-700';
  return 'text-red-700';
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 90
      ? 'bg-green-500'
      : score >= 80
        ? 'bg-teal-500'
        : score >= 70
          ? 'bg-blue-500'
          : score >= 60
            ? 'bg-yellow-500'
            : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-semibold ${scoreColor(score)}`}>
          {score > 0 ? `${score}/100` : 'N/A'}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ScorecardDashboardPage() {
  const [scorecard, setScorecard] = useState<ScorecardData>(DEFAULT_SCORECARD);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '12M'>('3M');

  const SCORE_HISTORY: ScoreHistory[] = [
    { month: 'Mar', score: 76 },
    { month: 'Apr', score: 79 },
    { month: 'May', score: 82 },
    { month: 'Jun', score: 80 },
    { month: 'Jul', score: 84 },
    { month: 'Aug', score: 87 },
    { month: 'Sep', score: 85 },
    { month: 'Oct', score: 88 },
    { month: 'Nov', score: 91 },
    { month: 'Dec', score: 89 },
    { month: 'Jan', score: 92 },
    { month: 'Feb', score: scorecard.overallScore || 92 },
  ];

  const periodMap = { '1M': 1, '3M': 3, '6M': 6, '12M': 12 };
  const visibleHistory = SCORE_HISTORY.slice(-periodMap[selectedPeriod]);

  const PERIOD_METRICS: PeriodMetric[] = [
    {
      label: 'On-Time Delivery Rate',
      current:
        scorecard.totalOrders > 0
          ? Math.round((scorecard.onTimeDeliveries / scorecard.totalOrders) * 100)
          : 0,
      previous: 91,
      unit: '%',
      higherIsBetter: true,
    },
    {
      label: 'Quality Acceptance Rate',
      current: scorecard.qualityScore,
      previous: 88,
      unit: '%',
      higherIsBetter: true,
    },
    {
      label: 'Return Rate',
      current: scorecard.returnRate,
      previous: 2.1,
      unit: '%',
      higherIsBetter: false,
    },
    {
      label: 'Quality Issues',
      current: scorecard.qualityIssues,
      previous: 4,
      unit: 'issues',
      higherIsBetter: false,
    },
  ];

  const CERTIFICATIONS = [
    { name: 'ISO 9001:2015', status: 'VALID', expiry: '2025-12-31' },
    { name: 'ISO 14001:2015', status: 'VALID', expiry: '2025-09-30' },
    { name: 'IATF 16949', status: 'EXPIRING_SOON', expiry: '2025-03-31' },
    { name: 'AS9100D', status: 'EXPIRED', expiry: '2024-06-30' },
  ];

  const certStatusColor = (s: string) =>
    s === 'VALID'
      ? 'bg-green-100 text-green-700'
      : s === 'EXPIRING_SOON'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-red-100 text-red-700';

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/scorecard');
      setScorecard(res.data.data || DEFAULT_SCORECARD);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const TrendIcon =
    scorecard.trend === 'UP' ? TrendingUp : scorecard.trend === 'DOWN' ? TrendingDown : Minus;
  const trendColor =
    scorecard.trend === 'UP'
      ? 'text-green-600'
      : scorecard.trend === 'DOWN'
        ? 'text-red-600'
        : 'text-gray-500 dark:text-gray-400';

  const maxScore = Math.max(...visibleHistory.map((h) => h.score), 1);
  const minScore = Math.min(...visibleHistory.map((h) => h.score), 0);
  const scoreRange = maxScore - minScore || 1;

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Scorecard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your performance metrics and quality ratings
              {scorecard.lastUpdated
                ? ` — updated ${new Date(scorecard.lastUpdated).toLocaleDateString()}`
                : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            <div
              className={`text-4xl font-bold px-4 py-2 rounded-xl ${gradeColor(scorecard.overallGrade)}`}
            >
              {scorecard.overallGrade}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Overall Score',
              value: scorecard.overallScore > 0 ? `${scorecard.overallScore}` : 'N/A',
              suffix: scorecard.overallScore > 0 ? '/100' : '',
              color: scoreColor(scorecard.overallScore),
              bg: 'bg-teal-100',
              Icon: Star,
            },
            {
              label: 'Total Orders',
              value: String(scorecard.totalOrders),
              suffix: '',
              color: 'text-gray-900 dark:text-gray-100',
              bg: 'bg-gray-100 dark:bg-gray-800',
              Icon: Package,
            },
            {
              label: 'On-Time Deliveries',
              value: String(scorecard.onTimeDeliveries),
              suffix: '',
              color: 'text-green-700',
              bg: 'bg-green-100',
              Icon: Clock,
            },
            {
              label: 'Quality Issues',
              value: String(scorecard.qualityIssues),
              suffix: '',
              color:
                scorecard.qualityIssues > 5
                  ? 'text-red-700'
                  : scorecard.qualityIssues > 0
                    ? 'text-orange-700'
                    : 'text-green-700',
              bg:
                scorecard.qualityIssues > 5
                  ? 'bg-red-100'
                  : scorecard.qualityIssues > 0
                    ? 'bg-orange-100'
                    : 'bg-green-100',
              Icon: AlertTriangle,
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>
                      {s.value}
                      <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
                        {s.suffix}
                      </span>
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${s.bg}`}>
                    <s.Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-teal-600" />
                    Score History
                  </CardTitle>
                  <div className="flex gap-1">
                    {(['1M', '3M', '6M', '12M'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${selectedPeriod === p ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-40">
                  {visibleHistory.map((item, idx) => {
                    const heightPct = ((item.score - minScore) / scoreRange) * 80 + 10;
                    const barColor =
                      item.score >= 90
                        ? 'bg-green-500'
                        : item.score >= 80
                          ? 'bg-teal-500'
                          : item.score >= 70
                            ? 'bg-blue-500'
                            : 'bg-yellow-500';
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {item.score}
                        </span>
                        <div
                          className={`w-full rounded-t ${barColor} transition-all`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 90-100 Excellent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-teal-500 inline-block" /> 80-89 Good
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> 70-79 Average
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Below 70
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  Category Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ScoreBar score={scorecard.qualityScore} label="Quality" />
                  <ScoreBar score={scorecard.deliveryScore} label="Delivery" />
                  <ScoreBar score={scorecard.responseScore} label="Responsiveness" />
                  <ScoreBar score={scorecard.complianceScore} label="Compliance" />
                  <ScoreBar score={scorecard.pricingScore} label="Pricing" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Period Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PERIOD_METRICS.map((m) => {
                  const diff = m.current - m.previous;
                  const improved = m.higherIsBetter ? diff >= 0 : diff <= 0;
                  const neutral = diff === 0;
                  return (
                    <div
                      key={m.label}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{m.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {m.previous}
                          {m.unit}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">→</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {m.current}
                          {m.unit}
                        </span>
                        {!neutral && (
                          <span
                            className={`flex items-center gap-0.5 text-xs font-medium ${improved ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {improved ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {Math.abs(diff)}
                            {m.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CERTIFICATIONS.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {cert.status === 'VALID' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : cert.status === 'EXPIRING_SOON' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cert.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Exp: {new Date(cert.expiry).toLocaleDateString()}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${certStatusColor(cert.status)}`}
                      >
                        {cert.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-teal-50 rounded-lg text-xs text-teal-700">
                Keep your certifications up to date to maintain a high compliance score. Upload
                updated certificates in the Documents section.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
