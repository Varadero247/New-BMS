'use client';
import axios from 'axios';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Activity,
  Target,
  GitBranch,
  ClipboardList,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Plus,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface RiskControl {
  id: string;
  controlType: string;
  description: string;
  effectiveness: string;
  owner?: string;
  lastTestedDate?: string;
  nextTestDate?: string;
  testingNotes?: string;
}

interface RiskKri {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  currentValue?: number;
  currentStatus?: string;
  greenThreshold?: number;
  amberThreshold?: number;
  redThreshold?: number;
  thresholdDirection?: string;
  measurementFrequency?: string;
  nextMeasurementDue?: string;
  lastMeasuredAt?: string;
}

interface RiskAction {
  id: string;
  actionTitle: string;
  description: string;
  actionType: string;
  owner?: string;
  targetDate: string;
  priority?: string;
  status: string;
  completedDate?: string;
}

interface RiskReview {
  id: string;
  referenceNumber?: string;
  reviewerName?: string;
  scheduledDate: string;
  completedDate?: string;
  status: string;
  previousScore?: number;
  newScore?: number;
  findings?: string;
  recommendations?: string;
}

interface RiskBowtie {
  id: string;
  topEvent: string;
  threats: { id: string; description: string; likelihood?: number }[];
  preventionBarriers: {
    id: string;
    description: string;
    type?: string;
    effectiveness?: string;
    owner?: string;
  }[];
  consequences: { id: string; description: string; severity?: number }[];
  mitigationBarriers: {
    id: string;
    description: string;
    type?: string;
    effectiveness?: string;
    owner?: string;
  }[];
  escalationFactors?: string[];
  criticalPath?: string;
  keyGaps?: string;
  version: string;
}

interface Risk {
  id: string;
  referenceNumber: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  ownerName?: string;
  owner?: string;
  department?: string;
  likelihood?: string;
  consequence?: string;
  inherentScore?: number;
  inherentRiskLevel?: string;
  inherentLikelihood?: number;
  inherentConsequence?: number;
  residualLikelihood?: string;
  residualConsequence?: string;
  residualScore?: number;
  residualRiskLevel?: string;
  residualLikelihoodNum?: number;
  residualConsequenceNum?: number;
  appetiteStatus?: string;
  treatment?: string;
  treatmentPlan?: string;
  causes?: string[];
  riskEvent?: string;
  consequences?: string[];
  internalContext?: string;
  externalContext?: string;
  regulatoryRef?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  raisedDate?: string;
  tags?: string[];
  notes?: string;
  riskControls?: RiskControl[];
  keyRiskIndicators?: RiskKri[];
  treatmentActions?: RiskAction[];
  reviews?: RiskReview[];
  bowtie?: RiskBowtie;
}

type TabKey = 'overview' | 'controls' | 'kris' | 'actions' | 'bowtie' | 'reviews';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: ClipboardList },
  { key: 'controls', label: 'Controls', icon: Shield },
  { key: 'kris', label: 'KRIs', icon: Activity },
  { key: 'actions', label: 'Treatment & Actions', icon: Target },
  { key: 'bowtie', label: 'Bow-Tie', icon: GitBranch },
  { key: 'reviews', label: 'Review History', icon: Calendar },
];

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  VERY_HIGH:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  HIGH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  MEDIUM:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' };

const STATUS_COLORS: Record<string, string> = {
  IDENTIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ASSESSED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  TREATING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  MONITORING: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };

const APPETITE_COLORS: Record<string, string> = {
  WITHIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  APPROACHING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  EXCEEDS: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };

const KRI_STATUS_COLORS: Record<string, string> = {
  RED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  AMBER:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  GREEN:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' };

const EFFECTIVENESS_COLORS: Record<string, string> = {
  STRONG: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ADEQUATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  WEAK: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  NONE_EFFECTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };

const ACTION_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };

function MiniHeatmapCell({ l, c, highlight }: { l: number; c: number; highlight?: boolean }) {
  const score = l * c;
  const bg =
    score >= 15
      ? 'bg-red-500'
      : score >= 10
        ? 'bg-orange-400'
        : score >= 5
          ? 'bg-yellow-400'
          : 'bg-green-400';
  return (
    <div
      className={`${bg} relative w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${score >= 5 ? 'text-white' : 'text-gray-800'}`}
    >
      {score}
      {highlight && (
        <div className="absolute inset-0 rounded ring-2 ring-white dark:ring-gray-900 ring-offset-1" />
      )}
    </div>
  );
}

function MiniHeatmap({ iL, iC, rL, rC }: { iL?: number; iC?: number; rL?: number; rC?: number }) {
  return (
    <div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'auto repeat(5, 2rem)' }}>
        <div />
        {[1, 2, 3, 4, 5].map((c) => (
          <div
            key={c}
            className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium pb-0.5"
          >
            {c}
          </div>
        ))}
        {[5, 4, 3, 2, 1].map((l) => (
          <>
            <div
              key={`l${l}`}
              className="flex items-center justify-end pr-1 text-xs text-gray-400 dark:text-gray-500 font-medium"
            >
              {l}
            </div>
            {[1, 2, 3, 4, 5].map((c) => (
              <MiniHeatmapCell
                key={`${l}-${c}`}
                l={l}
                c={c}
                highlight={(l === iL && c === iC) || (l === rL && c === rC)}
              />
            ))}
          </>
        ))}
      </div>
      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
        {iL && iC && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-gray-400" />
            Inherent ({iL * iC})
          </span>
        )}
        {rL && rC && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-gray-700 dark:bg-gray-300" />
            Residual ({rL * rC})
          </span>
        )}
      </div>
    </div>
  );
}

export default function RiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [creatingBowtie, setCreatingBowtie] = useState(false);

  async function loadRisk() {
    setLoading(true);
    setError('');
    try {
      const r = await api.get(`/risks/${id}`);
      setRisk(r.data.data || null);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) setError('Risk not found.');
      else if (axios.isAxiosError(e) && e.response?.status === 401) setError('Session expired. Please log in.');
      else setError('Failed to load risk details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRisk();
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );

  if (error || !risk)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error || 'Risk not found'}
              </p>
              <Link
                href="/risks"
                className="mt-4 inline-block text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Return to Risk Register
              </Link>
            </div>
          </div>
        </main>
      </div>
    );

  const tabBadge = {
    controls: risk.riskControls?.length || 0,
    kris: risk.keyRiskIndicators?.length || 0,
    actions: risk.treatmentActions?.length || 0,
    reviews: risk.reviews?.length || 0 };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <Link
              href="/risks"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Risk Register
            </Link>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {risk.referenceNumber}
            </span>
          </div>

          {/* Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                      {risk.referenceNumber}
                    </span>
                    {risk.residualRiskLevel && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${LEVEL_COLORS[risk.residualRiskLevel] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {risk.residualRiskLevel}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[risk.status] || STATUS_COLORS.IDENTIFIED}`}
                    >
                      {risk.status.replace(/_/g, ' ')}
                    </span>
                    {risk.appetiteStatus && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${APPETITE_COLORS[risk.appetiteStatus] || ''}`}
                      >
                        Appetite: {risk.appetiteStatus}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {risk.title}
                  </h1>
                  {risk.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {risk.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={loadRisk}
                  className="shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {risk.category
                        .replace(/_/g, ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>
                </div>
                {risk.ownerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Owner</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {risk.ownerName}
                      </p>
                    </div>
                  </div>
                )}
                {risk.nextReviewDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Next Review</p>
                      <p
                        className={`text-sm font-medium ${new Date(risk.nextReviewDate) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {new Date(risk.nextReviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {risk.treatment && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Treatment</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {risk.treatment.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-0 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tabBadge[tab.key as keyof typeof tabBadge] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.key
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cause → Event → Consequence */}
              {(risk.causes?.length || risk.riskEvent || risk.consequences?.length) && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                      Cause — Event — Consequence
                    </h3>
                    <div className="flex gap-2 items-start">
                      {risk.causes && risk.causes.length > 0 && (
                        <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                            Causes
                          </p>
                          <ul className="space-y-1">
                            {risk.causes.map((c, i) => (
                              <li
                                key={i}
                                className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-1.5"
                              >
                                <span className="text-blue-400 mt-0.5">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {risk.riskEvent && (
                        <>
                          <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 mt-3" />
                          <div className="flex-1 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/40">
                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Event
                            </p>
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                              {risk.riskEvent}
                            </p>
                          </div>
                        </>
                      )}
                      {risk.consequences && risk.consequences.length > 0 && (
                        <>
                          <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 mt-3" />
                          <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/40">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider mb-2">
                              Consequences
                            </p>
                            <ul className="space-y-1">
                              {risk.consequences.map((c, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-red-800 dark:text-red-200 flex items-start gap-1.5"
                                >
                                  <span className="text-red-400 mt-0.5">•</span>
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Score Cards + Mini Heatmap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Inherent Risk
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {risk.inherentScore ?? '—'}
                    </p>
                    {risk.inherentRiskLevel && (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${LEVEL_COLORS[risk.inherentRiskLevel] || ''}`}
                      >
                        {risk.inherentRiskLevel}
                      </span>
                    )}
                    {(risk.inherentLikelihood || risk.inherentConsequence) && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        L{risk.inherentLikelihood} × C{risk.inherentConsequence}
                        {risk.likelihood &&
                          ` (${risk.likelihood.replace(/_/g, ' ')} / ${risk.consequence?.replace(/_/g, ' ')})`}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Residual Risk
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {risk.residualScore ?? '—'}
                    </p>
                    {risk.residualRiskLevel && (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${LEVEL_COLORS[risk.residualRiskLevel] || ''}`}
                      >
                        {risk.residualRiskLevel}
                      </span>
                    )}
                    {(risk.residualLikelihoodNum || risk.residualConsequenceNum) && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        L{risk.residualLikelihoodNum} × C{risk.residualConsequenceNum}
                        {risk.residualLikelihood &&
                          ` (${risk.residualLikelihood.replace(/_/g, ' ')} / ${risk.residualConsequence?.replace(/_/g, ' ')})`}
                      </p>
                    )}
                    {risk.inherentScore && risk.residualScore && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        -{risk.inherentScore - risk.residualScore} reduction
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      5x5 Position
                    </p>
                    <MiniHeatmap
                      iL={risk.inherentLikelihood}
                      iC={risk.inherentConsequence}
                      rL={risk.residualLikelihoodNum}
                      rC={risk.residualConsequenceNum}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Context + Other Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risk.internalContext && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Internal Context
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {risk.internalContext}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {risk.externalContext && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        External Context
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {risk.externalContext}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {risk.regulatoryRef && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Regulatory Reference
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {risk.regulatoryRef}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {risk.treatmentPlan && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Treatment Plan
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {risk.treatmentPlan}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {risk.notes && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {risk.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Risk Controls ({risk.riskControls?.length || 0})
                </h3>
              </div>
              {!risk.riskControls?.length ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Shield className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No controls recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {risk.riskControls.map((ctrl) => (
                    <Card key={ctrl.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                {ctrl.controlType.replace(/_/g, ' ')}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${EFFECTIVENESS_COLORS[ctrl.effectiveness] || ''}`}
                              >
                                {ctrl.effectiveness.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                              {ctrl.description}
                            </p>
                            {ctrl.owner && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Owner: {ctrl.owner}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-400 dark:text-gray-500 shrink-0">
                            {ctrl.lastTestedDate && (
                              <p>Tested: {new Date(ctrl.lastTestedDate).toLocaleDateString()}</p>
                            )}
                            {ctrl.nextTestDate && (
                              <p>Next test: {new Date(ctrl.nextTestDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        {ctrl.testingNotes && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2">
                            {ctrl.testingNotes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KRIs Tab */}
          {activeTab === 'kris' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Key Risk Indicators ({risk.keyRiskIndicators?.length || 0})
                </h3>
              </div>
              {!risk.keyRiskIndicators?.length ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No KRIs configured</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risk.keyRiskIndicators.map((kri) => (
                    <Card
                      key={kri.id}
                      className={`border-2 ${KRI_STATUS_COLORS[kri.currentStatus || 'GREEN']?.includes('green') ? 'border-green-200 dark:border-green-800' : kri.currentStatus === 'RED' ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {kri.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${KRI_STATUS_COLORS[kri.currentStatus || 'GREEN']}`}
                          >
                            {kri.currentStatus || 'GREEN'}
                          </span>
                        </div>
                        {kri.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            {kri.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Current value</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {kri.currentValue !== null
                                ? `${kri.currentValue}${kri.unit ? ` ${kri.unit}` : ''}`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Green / Amber / Red</span>
                            <span>
                              {kri.greenThreshold ?? '—'} / {kri.amberThreshold ?? '—'} /{' '}
                              {kri.redThreshold ?? '—'}
                              {kri.unit ? ` ${kri.unit}` : ''}
                            </span>
                          </div>
                          {kri.thresholdDirection && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                              {kri.thresholdDirection === 'INCREASING_IS_WORSE' ? (
                                <>
                                  <TrendingUp className="h-3 w-3" />
                                  Higher values are worse
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-3 w-3" />
                                  Lower values are worse
                                </>
                              )}
                            </div>
                          )}
                          {kri.nextMeasurementDue && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">
                                Next reading due
                              </span>
                              <span
                                className={
                                  new Date(kri.nextMeasurementDue) < new Date()
                                    ? 'text-red-600 dark:text-red-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400'
                                }
                              >
                                {new Date(kri.nextMeasurementDue).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {kri.measurementFrequency && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Frequency: {kri.measurementFrequency.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Treatment & Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {(risk.treatment || risk.treatmentPlan) && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                      Treatment Strategy
                    </h3>
                    {risk.treatment && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                          {risk.treatment.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    {risk.treatmentPlan && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {risk.treatmentPlan}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Actions ({risk.treatmentActions?.length || 0})
                </h3>
                {!risk.treatmentActions?.length ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Target className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No actions recorded</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="overflow-x-auto">
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Action
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Owner
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Target Date
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            {risk.treatmentActions.map((action) => {
                              const overdue =
                                action.status !== 'COMPLETED' &&
                                new Date(action.targetDate) < new Date();
                              return (
                                <tr
                                  key={action.id}
                                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 ${overdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                >
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                      {action.actionTitle}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">
                                      {action.description}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                    {action.owner || '—'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={
                                        overdue
                                          ? 'text-red-600 dark:text-red-400 font-medium'
                                          : 'text-gray-700 dark:text-gray-300'
                                      }
                                    >
                                      {new Date(action.targetDate).toLocaleDateString()}
                                    </span>
                                    {overdue && <p className="text-xs text-red-500">Overdue</p>}
                                  </td>
                                  <td className="px-4 py-3">
                                    {action.priority && (
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {action.priority}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_STATUS_COLORS[action.status] || ''}`}
                                    >
                                      {action.status.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bow-Tie Tab */}
          {activeTab === 'bowtie' && (
            <div>
              {!risk.bowtie ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                      No bow-tie analysis yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-sm mx-auto">
                      Bow-tie analysis is available for HIGH, VERY HIGH and CRITICAL risks. It maps
                      threats through prevention barriers to the top event, then through mitigation
                      barriers to consequences.
                    </p>
                    {['HIGH', 'VERY_HIGH', 'CRITICAL'].includes(risk.residualRiskLevel || '') && (
                      <button
                        onClick={() => setCreatingBowtie(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Create Bow-Tie Analysis
                      </button>
                    )}
                    {creatingBowtie && (
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Bow-tie creation can be done via the API: POST /risks/{id}/bowtie
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Bow-Tie Analysis
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Version {risk.bowtie.version}
                      </p>
                    </div>
                  </div>

                  {/* Top Event */}
                  <Card className="border-2 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                          Top Event
                        </p>
                      </div>
                      <p className="text-base font-bold text-orange-900 dark:text-orange-100">
                        {risk.bowtie.topEvent}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Threats | Prevention Barriers → Event ← Mitigation Barriers | Consequences */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Threats */}
                    <div className="lg:col-span-1">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider mb-2 text-center">
                        Threats ({risk.bowtie.threats?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {(risk.bowtie.threats || []).map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg"
                          >
                            <p className="text-xs text-red-800 dark:text-red-200">
                              {t.description}
                            </p>
                            {t.likelihood !== null && (
                              <p className="text-xs text-red-400 mt-0.5">L={t.likelihood}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prevention Barriers */}
                    <div className="lg:col-span-1">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider mb-2 text-center">
                        Prevention Barriers ({risk.bowtie.preventionBarriers?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {(risk.bowtie.preventionBarriers || []).map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg"
                          >
                            <p className="text-xs text-green-800 dark:text-green-200">
                              {b.description}
                            </p>
                            {b.effectiveness && (
                              <p
                                className={`text-xs mt-0.5 font-medium ${b.effectiveness === 'STRONG' ? 'text-green-600 dark:text-green-400' : b.effectiveness === 'ADEQUATE' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}
                              >
                                {b.effectiveness.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Center arrow indicator */}
                    <div className="lg:col-span-1 flex items-center justify-center">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full border-2 border-orange-200 dark:border-orange-800">
                        <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>

                    {/* Mitigation Barriers */}
                    <div className="lg:col-span-1">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2 text-center">
                        Mitigation Barriers ({risk.bowtie.mitigationBarriers?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {(risk.bowtie.mitigationBarriers || []).map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg"
                          >
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                              {b.description}
                            </p>
                            {b.effectiveness && (
                              <p
                                className={`text-xs mt-0.5 font-medium ${b.effectiveness === 'STRONG' ? 'text-green-600 dark:text-green-400' : b.effectiveness === 'ADEQUATE' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}
                              >
                                {b.effectiveness.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consequences */}
                    <div className="lg:col-span-1">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2 text-center">
                        Consequences ({risk.bowtie.consequences?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {(risk.bowtie.consequences || []).map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-lg"
                          >
                            <p className="text-xs text-purple-800 dark:text-purple-200">
                              {c.description}
                            </p>
                            {c.severity !== null && (
                              <p className="text-xs text-purple-400 mt-0.5">
                                Severity={c.severity}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(risk.bowtie.criticalPath ||
                    risk.bowtie.keyGaps ||
                    risk.bowtie.escalationFactors?.length) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {risk.bowtie.criticalPath && (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Critical Path
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {risk.bowtie.criticalPath}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {risk.bowtie.keyGaps && (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Key Gaps
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {risk.bowtie.keyGaps}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {risk.bowtie.escalationFactors?.length && (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Escalation Factors
                            </p>
                            <ul className="space-y-1">
                              {risk.bowtie.escalationFactors.map((f, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5"
                                >
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Review History ({risk.reviews?.length || 0})
                </h3>
              </div>
              {!risk.reviews?.length ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No reviews recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    {risk.reviews.map((review, _idx) => (
                      <div key={review.id} className="relative pl-10">
                        <div
                          className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 top-4 ${
                            review.status === 'COMPLETED'
                              ? 'bg-green-500'
                              : review.status === 'CANCELLED'
                                ? 'bg-red-500'
                                : 'bg-blue-400'
                          }`}
                        />
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                {review.referenceNumber && (
                                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                                    {review.referenceNumber}
                                  </span>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      review.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : review.status === 'CANCELLED'
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}
                                  >
                                    {review.status.replace(/_/g, ' ')}
                                  </span>
                                  {review.reviewerName && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {review.reviewerName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                                <p>{new Date(review.scheduledDate).toLocaleDateString()}</p>
                                {review.completedDate && (
                                  <p>
                                    Completed: {new Date(review.completedDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Score change */}
                            {(review.previousScore !== null || review.newScore !== null) && (
                              <div className="flex items-center gap-2 my-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {review.previousScore !== null && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskLevelColor(review.previousScore ?? 0)}`}
                                  >
                                    {review.previousScore}
                                  </span>
                                )}
                                {review.previousScore != null && review.newScore != null && (
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                                {review.newScore !== null && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskLevelColor(review.newScore ?? 0)}`}
                                  >
                                    {review.newScore}
                                  </span>
                                )}
                                {review.previousScore != null && review.newScore != null && (
                                  <span
                                    className={`text-xs font-medium ${review.newScore < review.previousScore ? 'text-green-600 dark:text-green-400' : review.newScore > review.previousScore ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                                  >
                                    {review.newScore < review.previousScore
                                      ? `Improved by ${review.previousScore - review.newScore}`
                                      : review.newScore > review.previousScore
                                        ? `Worsened by ${review.newScore - review.previousScore}`
                                        : 'No change'}
                                  </span>
                                )}
                              </div>
                            )}

                            {review.findings && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                  Findings
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {review.findings}
                                </p>
                              </div>
                            )}
                            {review.recommendations && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                  Recommendations
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {review.recommendations}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getRiskLevelColor(score: number): string {
  if (score >= 15) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (score >= 10)
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  if (score >= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
}
