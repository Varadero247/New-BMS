'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';
import {
  Plus,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Wand2,
  ChevronLeft,
  ChevronRight,
  UserCheck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ImpactAssessment {
  id: string;
  title: string;
  description?: string;
  system: string;
  impactLevel: string;
  status: string;
  assessor?: string;
  findings?: string;
  recommendations?: string;
  accuracyScore?: number;
  biasScore?: number;
  privacyScore?: number;
  safetyScore?: number;
  autonomyScore?: number;
  humanRightsImpact?: string;
  humanRightsNotes?: string;
  safetyImpact?: string;
  safetyNotes?: string;
  privacyImpact?: string;
  privacyNotes?: string;
  biasImpact?: string;
  biasNotes?: string;
  transparencyImpact?: string;
  transparencyNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  signedOffBy?: string;
  signedOffAt?: string;
  createdAt: string;
  updatedAt: string;
}

const impactLevelOptions = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
const statusOptions = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'ARCHIVED'];

const impactColors: Record<string, string> = {
  NEGLIGIBLE:
    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MODERATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  VERY_HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };

const statusColors: Record<string, string> = {
  DRAFT:
    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  APPROVED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ARCHIVED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };

const dimensions = [
  {
    key: 'accuracyScore',
    label: 'Accuracy',
    description: 'Risk of incorrect or unreliable outputs',
    color: '#6366F1' },
  {
    key: 'biasScore',
    label: 'Bias',
    description: 'Risk of discriminatory or unfair outcomes',
    color: '#F59E0B' },
  {
    key: 'privacyScore',
    label: 'Privacy',
    description: 'Risk to personal data and privacy rights',
    color: '#8B5CF6' },
  {
    key: 'safetyScore',
    label: 'Safety',
    description: 'Risk to physical or psychological safety',
    color: '#DC2626' },
  {
    key: 'autonomyScore',
    label: 'Autonomy',
    description: 'Risk to human autonomy and decision-making',
    color: '#0EA5E9' },
] as const;

type _DimensionKey = (typeof dimensions)[number]['key'];

type FormData = {
  title: string;
  description: string;
  system: string;
  impactLevel: string;
  status: string;
  assessor: string;
  findings: string;
  recommendations: string;
  accuracyScore: number;
  biasScore: number;
  privacyScore: number;
  safetyScore: number;
  autonomyScore: number;
  humanRightsNotes: string;
  safetyNotes: string;
  privacyNotes: string;
  biasNotes: string;
  transparencyNotes: string;
};

const defaultForm: FormData = {
  title: '',
  description: '',
  system: '',
  impactLevel: 'MODERATE',
  status: 'DRAFT',
  assessor: '',
  findings: '',
  recommendations: '',
  accuracyScore: 1,
  biasScore: 1,
  privacyScore: 1,
  safetyScore: 1,
  autonomyScore: 1,
  humanRightsNotes: '',
  safetyNotes: '',
  privacyNotes: '',
  biasNotes: '',
  transparencyNotes: '' };

/* ------------------------------------------------------------------ */
/*  Risk Heatmap                                                       */
/* ------------------------------------------------------------------ */

function RiskHeatmap({
  assessments,
  controlStatuses: _controlStatuses }: {
  assessments: ImpactAssessment[];
  controlStatuses?: never;
}) {
  const getScoreColor = (score: number) => {
    if (score <= 1) return 'bg-green-200 dark:bg-green-900/40';
    if (score <= 2) return 'bg-green-300 dark:bg-green-800/60';
    if (score <= 3) return 'bg-yellow-300 dark:bg-yellow-800/60';
    if (score <= 4) return 'bg-orange-300 dark:bg-orange-800/60';
    return 'bg-red-400 dark:bg-red-800/60';
  };

  if (assessments.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        No assessments with risk scores yet. Create an assessment with 5-dimension scoring to see
        the heatmap.
      </div>
    );
  }

  const displayAssessments = assessments.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">AI System</th>
            {dimensions.map((d) => (
              <th key={d.key} className="text-center py-2 px-2 text-muted-foreground font-medium">
                {d.label}
              </th>
            ))}
            <th className="text-center py-2 px-2 text-muted-foreground font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {displayAssessments.map((a) => {
            const total =
              (a.accuracyScore || 1) +
              (a.biasScore || 1) +
              (a.privacyScore || 1) +
              (a.safetyScore || 1) +
              (a.autonomyScore || 1);
            const _avg = total / 5;
            return (
              <tr key={a.id} className="border-t border-border">
                <td className="py-2 px-3 text-foreground font-medium truncate max-w-[150px]">
                  {a.system || a.title}
                </td>
                {dimensions.map((d) => {
                  const score = ((a as Record<string, any>)[d.key] as number) || 1;
                  return (
                    <td key={d.key} className="py-2 px-2 text-center">
                      <span
                        className={`inline-flex w-8 h-8 items-center justify-center rounded-md font-bold text-foreground ${getScoreColor(score)}`}
                      >
                        {score}
                      </span>
                    </td>
                  );
                })}
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded-md font-bold text-foreground ${getScoreColor(avg)}`}
                  >
                    {avg.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 px-3 pb-2">
        <span className="text-[10px] text-muted-foreground">Risk Level:</span>
        {[1, 2, 3, 4, 5].map((score) => (
          <div key={score} className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded ${getScoreColor(score)}`} />
            <span className="text-[10px] text-muted-foreground">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Slider                                                       */
/* ------------------------------------------------------------------ */

function ScoreSlider({
  label,
  description,
  value,
  onChange,
  color }: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const riskLabel =
    value <= 1
      ? 'Negligible'
      : value <= 2
        ? 'Low'
        : value <= 3
          ? 'Moderate'
          : value <= 4
            ? 'High'
            : 'Critical';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground ml-1">/5</span>
          <p className="text-[10px] text-muted-foreground">{riskLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 h-8 rounded-md text-xs font-bold transition-all ${
              score <= value
                ? 'text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 dark:bg-gray-800 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={
              score <= value
                ? { backgroundColor: color, opacity: 0.6 + (score / value) * 0.4 }
                : undefined
            }
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ImpactAssessmentsPage() {
  const [assessments, setAssessments] = useState<ImpactAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [signOffOpen, setSignOffOpen] = useState(false);

  const [editingAssessment, setEditingAssessment] = useState<ImpactAssessment | null>(null);
  const [viewAssessment, setViewAssessment] = useState<ImpactAssessment | null>(null);
  const [signOffAssessment, setSignOffAssessment] = useState<ImpactAssessment | null>(null);
  const [signOffName, setSignOffName] = useState('');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterImpact, setFilterImpact] = useState('');

  const [form, setForm] = useState<FormData>(defaultForm);
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      setError(null);
      const res = await api.get('/impact-assessments');
      setAssessments(res.data.data || []);
    } catch {
      setError('Failed to load impact assessments.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(defaultForm);
  }

  function openWizard() {
    setEditingAssessment(null);
    resetForm();
    setWizardStep(0);
    setWizardOpen(true);
  }

  function openQuickCreate() {
    setEditingAssessment(null);
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(assessment: ImpactAssessment) {
    setEditingAssessment(assessment);
    setForm({
      title: assessment.title,
      description: assessment.description || '',
      system: assessment.system,
      impactLevel: assessment.impactLevel,
      status: assessment.status,
      assessor: assessment.assessor || '',
      findings: assessment.findings || '',
      recommendations: assessment.recommendations || '',
      accuracyScore: assessment.accuracyScore || 1,
      biasScore: assessment.biasScore || 1,
      privacyScore: assessment.privacyScore || 1,
      safetyScore: assessment.safetyScore || 1,
      autonomyScore: assessment.autonomyScore || 1,
      humanRightsNotes: assessment.humanRightsNotes || '',
      safetyNotes: assessment.safetyNotes || '',
      privacyNotes: assessment.privacyNotes || '',
      biasNotes: assessment.biasNotes || '',
      transparencyNotes: assessment.transparencyNotes || '' });
    setModalOpen(true);
  }

  function openView(a: ImpactAssessment) {
    setViewAssessment(a);
    setViewOpen(true);
  }

  function openSignOff(a: ImpactAssessment) {
    setSignOffAssessment(a);
    setSignOffName('');
    setSignOffOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAssessment) {
        await api.put(`/impact-assessments/${editingAssessment.id}`, form);
      } else {
        await api.post('/impact-assessments', form);
      }
      setModalOpen(false);
      setWizardOpen(false);
      loadAssessments();
    } catch {
      setError('Failed to save impact assessment.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOff() {
    if (!signOffAssessment || !signOffName) return;
    setSaving(true);
    try {
      await api.put(`/impact-assessments/${signOffAssessment.id}`, {
        status: 'APPROVED',
        approvedBy: signOffName,
        signedOffBy: signOffName });
      setSignOffOpen(false);
      loadAssessments();
    } catch {
      setError('Failed to sign off assessment.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await api.delete(`/impact-assessments/${id}`);
      loadAssessments();
    } catch {
      setError('Failed to delete assessment.');
    }
  }

  const filteredAssessments = assessments.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterImpact && a.impactLevel !== filterImpact) return false;
    return true;
  });

  const totalScore = (a: ImpactAssessment) =>
    (a.accuracyScore || 1) +
    (a.biasScore || 1) +
    (a.privacyScore || 1) +
    (a.safetyScore || 1) +
    (a.autonomyScore || 1);

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  const wizardSteps = ['General', 'Risk Scoring', 'Impact Notes', 'Review'];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Impact Assessments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI system impact assessments per ISO 42001 Clause 6.1.4
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openWizard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4" /> Guided Wizard
            </button>
            <button
              onClick={openQuickCreate}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" /> Quick Create
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {impactLevelOptions.map((level) => {
            const count = assessments.filter((a) => a.impactLevel === level).length;
            return (
              <div key={level} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <div className="text-xs text-muted-foreground">{level.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>

        {/* Risk Heatmap */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Risk Heatmap -- 5-Dimension Scoring
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each dimension scored 1 (negligible) to 5 (critical)
            </p>
          </div>
          <RiskHeatmap assessments={assessments.filter((a) => (a.accuracyScore || 0) > 0)} />
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by impact level"
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Impact Levels</option>
              {impactLevelOptions.map((l) => (
                <option key={l} value={l}>
                  {l.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {(filterStatus || filterImpact) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterImpact('');
                }}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Assessment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((a) => {
              return (
                <div key={a.id} className="bg-card border border-border rounded-xl shadow-sm">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {a.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{a.system}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${impactColors[a.impactLevel]}`}
                        >
                          {a.impactLevel.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[a.status]}`}
                        >
                          {a.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Mini risk scores */}
                    {(a.accuracyScore || 0) > 0 && (
                      <div className="grid grid-cols-5 gap-1 mb-3">
                        {dimensions.map((d) => {
                          const score = ((a as Record<string, any>)[d.key] as number) || 1;
                          return (
                            <div key={d.key} className="text-center">
                              <div
                                className="w-full h-2 rounded-full"
                                style={{
                                  background: `linear-gradient(to right, ${d.color}40, ${d.color})`,
                                  width: `${(score / 5) * 100}%`,
                                  minWidth: '20%' }}
                              />
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {d.label}: {score}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {a.assessor && (
                      <p className="text-xs text-muted-foreground mb-2">Assessor: {a.assessor}</p>
                    )}

                    {/* Sign-off status */}
                    {a.signedOffBy ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed off by {a.signedOffBy}
                      </div>
                    ) : a.status === 'COMPLETED' ? (
                      <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Awaiting sign-off
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openView(a)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {a.status === 'COMPLETED' && !a.signedOffBy && (
                      <button
                        onClick={() => openSignOff(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Sign Off
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-card border border-border rounded-xl p-16 text-center">
              <Scale className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No impact assessments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Impact Assessment Wizard"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {wizardSteps.map((step, idx) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    idx <= wizardStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`ml-2 text-xs font-medium hidden sm:block ${idx <= wizardStep ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {step}
                </span>
                {idx < wizardSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${idx < wizardStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: General */}
          {wizardStep === 0 && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    AI System <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.system}
                    onChange={(e) => setForm({ ...form, system: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Assessor</label>
                  <input
                    type="text"
                    value={form.assessor}
                    onChange={(e) => setForm({ ...form, assessor: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Overall Impact Level</label>
                  <select
                    value={form.impactLevel}
                    onChange={(e) => setForm({ ...form, impactLevel: e.target.value })}
                    className={inputClass}
                  >
                    {impactLevelOptions.map((l) => (
                      <option key={l} value={l}>
                        {l.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputClass}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Risk Scoring */}
          {wizardStep === 1 && (
            <div className="space-y-5">
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                  <strong>5-Dimension Risk Scoring:</strong> Rate each dimension from 1 (negligible
                  risk) to 5 (critical risk). The overall impact level should reflect the
                  highest-scoring dimension.
                </p>
              </div>
              {dimensions.map((d) => (
                <ScoreSlider
                  key={d.key}
                  label={d.label}
                  description={d.description}
                  value={form[d.key]}
                  onChange={(v) => setForm({ ...form, [d.key]: v })}
                  color={d.color}
                />
              ))}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Risk Score</span>
                  <span className="text-xl font-bold text-foreground">
                    {form.accuracyScore +
                      form.biasScore +
                      form.privacyScore +
                      form.safetyScore +
                      form.autonomyScore}
                    <span className="text-sm text-muted-foreground">/25</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Impact Notes */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Human Rights Impact Notes</label>
                <textarea
                  value={form.humanRightsNotes}
                  onChange={(e) => setForm({ ...form, humanRightsNotes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Impacts on dignity, autonomy, non-discrimination..."
                />
              </div>
              <div>
                <label className={labelClass}>Safety Impact Notes</label>
                <textarea
                  value={form.safetyNotes}
                  onChange={(e) => setForm({ ...form, safetyNotes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Risks to physical or psychological safety..."
                />
              </div>
              <div>
                <label className={labelClass}>Privacy Impact Notes</label>
                <textarea
                  value={form.privacyNotes}
                  onChange={(e) => setForm({ ...form, privacyNotes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Data protection risks, personal data processing..."
                />
              </div>
              <div>
                <label className={labelClass}>Bias & Fairness Notes</label>
                <textarea
                  value={form.biasNotes}
                  onChange={(e) => setForm({ ...form, biasNotes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Bias testing methodology, identified biases..."
                />
              </div>
              <div>
                <label className={labelClass}>Transparency Notes</label>
                <textarea
                  value={form.transparencyNotes}
                  onChange={(e) => setForm({ ...form, transparencyNotes: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Explainability measures, disclosure mechanisms..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Findings</label>
                <textarea
                  value={form.findings}
                  onChange={(e) => setForm({ ...form, findings: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder="Key findings from this impact assessment..."
                />
              </div>
              <div>
                <label className={labelClass}>Recommendations</label>
                <textarea
                  value={form.recommendations}
                  onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder="Recommended mitigations and controls..."
                />
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Assessment Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">System:</span>{' '}
                    <span className="text-foreground font-medium">{form.system || '--'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact Level:</span>{' '}
                    <span className="text-foreground font-medium">
                      {form.impactLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assessor:</span>{' '}
                    <span className="text-foreground font-medium">{form.assessor || '--'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score:</span>{' '}
                    <span className="text-foreground font-medium">
                      {form.accuracyScore +
                        form.biasScore +
                        form.privacyScore +
                        form.safetyScore +
                        form.autonomyScore}
                      /25
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {dimensions.map((d) => (
                    <div key={d.key} className="text-center">
                      <div className="text-lg font-bold text-foreground">{form[d.key]}</div>
                      <div className="text-[10px] text-muted-foreground">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              {wizardStep > 0 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              {wizardStep < wizardSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : editingAssessment ? 'Update' : 'Create Assessment'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Quick Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAssessment ? 'Edit Assessment' : 'Quick Create Assessment'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                AI System <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.system}
                onChange={(e) => setForm({ ...form, system: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Impact Level</label>
              <select
                value={form.impactLevel}
                onChange={(e) => setForm({ ...form, impactLevel: e.target.value })}
                className={inputClass}
              >
                {impactLevelOptions.map((l) => (
                  <option key={l} value={l}>
                    {l.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assessor</label>
              <input
                type="text"
                value={form.assessor}
                onChange={(e) => setForm({ ...form, assessor: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Risk Scoring (1-5)
            </p>
            <div className="grid grid-cols-5 gap-3">
              {dimensions.map((d) => (
                <div key={d.key}>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {d.label}
                  </label>
                  <select
                    value={form[d.key]}
                    onChange={(e) => setForm({ ...form, [d.key]: parseInt(e.target.value) })}
                    className={inputClass}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Findings</label>
            <textarea
              value={form.findings}
              onChange={(e) => setForm({ ...form, findings: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>Recommendations</label>
            <textarea
              value={form.recommendations}
              onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : editingAssessment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={viewAssessment?.title || 'Assessment Details'}
        size="xl"
      >
        {viewAssessment && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${impactColors[viewAssessment.impactLevel]}`}
              >
                {viewAssessment.impactLevel.replace(/_/g, ' ')}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[viewAssessment.status]}`}
              >
                {viewAssessment.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">AI System</span>
                <p className="font-medium text-foreground">{viewAssessment.system}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Assessor</span>
                <p className="font-medium text-foreground">{viewAssessment.assessor || '--'}</p>
              </div>
            </div>
            {(viewAssessment.accuracyScore || 0) > 0 && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Risk Scores
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {dimensions.map((d) => {
                    const score =
                      ((viewAssessment as Record<string, any>)[d.key] as number) || 1;
                    return (
                      <div key={d.key} className="text-center">
                        <div className="text-2xl font-bold" style={{ color: d.color }}>
                          {score}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{d.label}</div>
                        <div className="w-full h-1.5 mt-1 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(score / 5) * 100}%`, backgroundColor: d.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-3 pt-3 border-t border-border">
                  <span className="text-lg font-bold text-foreground">
                    {totalScore(viewAssessment)}
                  </span>
                  <span className="text-sm text-muted-foreground">/25 total risk score</span>
                </div>
              </div>
            )}
            {viewAssessment.findings && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Findings</p>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {viewAssessment.findings}
                </p>
              </div>
            )}
            {viewAssessment.recommendations && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recommendations</p>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {viewAssessment.recommendations}
                </p>
              </div>
            )}
            {viewAssessment.signedOffBy && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Signed off by <strong>{viewAssessment.signedOffBy}</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setViewOpen(false);
                  openEditModal(viewAssessment);
                }}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sign-off Modal */}
      <Modal
        isOpen={signOffOpen}
        onClose={() => setSignOffOpen(false)}
        title="Sign Off Assessment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium text-foreground">{signOffAssessment?.title}</p>
            <p className="text-xs text-muted-foreground">System: {signOffAssessment?.system}</p>
          </div>
          <div>
            <label className={labelClass}>
              Signatory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signOffName}
              onChange={(e) => setSignOffName(e.target.value)}
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            By signing off, you confirm that this impact assessment has been reviewed and the
            findings are accurate.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              onClick={() => setSignOffOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOff}
              disabled={saving || !signOffName}
              className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {saving ? 'Signing...' : 'Confirm Sign-Off'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
