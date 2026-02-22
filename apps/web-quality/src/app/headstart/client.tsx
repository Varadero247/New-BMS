'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ClipboardCheck, Plus, X, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type AssessmentStatus = 'IN_PROGRESS' | 'COMPLETED';

interface HeadstartAssessment {
  id: string;
  standardId: string;
  standardName: string;
  organisationName: string;
  sector: string;
  status: AssessmentStatus;
  score: number;
  gapCount: number;
  createdAt: string;
}

const AVAILABLE_STANDARDS = [
  { id: 'ISO_9001_2015', name: 'ISO 9001:2015 — Quality Management' },
  { id: 'ISO_14001_2015', name: 'ISO 14001:2015 — Environmental Management' },
  { id: 'ISO_45001_2018', name: 'ISO 45001:2018 — Occupational H&S' },
  { id: 'ISO_27001_2022', name: 'ISO 27001:2022 — Information Security' },
];

const MOCK_ASSESSMENTS: HeadstartAssessment[] = [
  {
    id: '1',
    standardId: 'ISO_9001_2015',
    standardName: 'ISO 9001:2015',
    organisationName: 'Nexara IMS Ltd',
    sector: 'Technology',
    status: 'COMPLETED',
    score: 72,
    gapCount: 8,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: '2',
    standardId: 'ISO_14001_2015',
    standardName: 'ISO 14001:2015',
    organisationName: 'Nexara IMS Ltd',
    sector: 'Technology',
    status: 'IN_PROGRESS',
    score: 45,
    gapCount: 15,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: '3',
    standardId: 'ISO_45001_2018',
    standardName: 'ISO 45001:2018',
    organisationName: 'Nexara H&S Division',
    sector: 'Manufacturing',
    status: 'COMPLETED',
    score: 88,
    gapCount: 3,
    createdAt: '2026-02-10T00:00:00Z',
  },
];

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="mt-[-68px] text-xl font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: AssessmentStatus }) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <CheckCircle className="h-3 w-3" /> Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
      <Clock className="h-3 w-3" /> In Progress
    </span>
  );
}

export default function HeadstartClient() {
  const [assessments, setAssessments] = useState<HeadstartAssessment[]>(MOCK_ASSESSMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    standardId: 'ISO_9001_2015',
    organisationName: '',
    sector: '',
  });

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const r = await api.get('/headstart');
        setAssessments(r.data.data);
      } catch {
        // Use mock data on failure
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organisationName.trim() || !form.sector.trim()) {
      setError('Organisation name and sector are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await api.post('/headstart', form);
      setAssessments((prev) => [r.data.data, ...prev]);
      setModalOpen(false);
      setForm({ standardId: 'ISO_9001_2015', organisationName: '', sector: '' });
    } catch {
      setError('Failed to start assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const completed = assessments.filter((a) => a.status === 'COMPLETED').length;
  const inProgress = assessments.filter((a) => a.status === 'IN_PROGRESS').length;
  const avgScore =
    assessments.length > 0
      ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
      : 0;
  const totalGaps = assessments.reduce((sum, a) => sum + a.gapCount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-green-600" />
            HeadStart Assessment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-implementation gap analysis for ISO management system standards
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Start New Assessment
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Assessments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{assessments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Score</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{avgScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Gaps</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totalGaps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardCheck className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No assessments yet</p>
          <p className="text-sm">Start a HeadStart assessment to identify gaps before implementation.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((a) => (
            <Card key={a.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-gray-900 truncate">
                      {a.standardName}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{a.organisationName}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ScoreRing score={a.score} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span><span className="font-semibold text-gray-900">{a.gapCount}</span> gaps identified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Sector: <span className="font-medium">{a.sector}</span></span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Started {new Date(a.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Compliance Score</span>
                    <span>{a.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${a.score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Start New Assessment</h2>
              <button
                onClick={() => { setModalOpen(false); setError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.standardId}
                  onChange={(e) => setForm((f) => ({ ...f, standardId: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {AVAILABLE_STANDARDS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.organisationName}
                  onChange={(e) => setForm((f) => ({ ...f, organisationName: e.target.value }))}
                  placeholder="e.g. Nexara IMS Ltd"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                  placeholder="e.g. Technology, Manufacturing"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setError(null); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Starting...' : 'Start Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
