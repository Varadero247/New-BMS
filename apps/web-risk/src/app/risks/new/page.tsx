'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  X,
  FileText,
  Shield,
  ShieldCheck,
  Target,
  Activity,
  Loader2,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const CATEGORIES = [
  'STRATEGIC',
  'OPERATIONAL',
  'FINANCIAL',
  'COMPLIANCE',
  'REPUTATIONAL',
  'ENVIRONMENTAL',
  'HEALTH_SAFETY',
  'INFORMATION_SECURITY',
  'QUALITY',
  'SUPPLY_CHAIN',
  'TECHNOLOGY_CYBER',
  'PEOPLE_HR',
  'EXTERNAL_GEOPOLITICAL',
  'PROJECT_PROGRAMME',
  'OTHER',
];

const LIKELIHOODS = [
  { val: 'RARE', num: 1, label: 'Rare', desc: 'May only occur in exceptional circumstances (<2%)' },
  { val: 'UNLIKELY', num: 2, label: 'Unlikely', desc: 'Could occur but not expected (2–10%)' },
  { val: 'POSSIBLE', num: 3, label: 'Possible', desc: 'Might occur at some time (10–50%)' },
  { val: 'LIKELY', num: 4, label: 'Likely', desc: 'Will probably occur (50–90%)' },
  {
    val: 'ALMOST_CERTAIN',
    num: 5,
    label: 'Almost Certain',
    desc: 'Expected to occur in most circumstances (>90%)',
  },
];

const CONSEQUENCES = [
  { val: 'INSIGNIFICANT', num: 1, label: 'Insignificant', desc: 'No measurable impact' },
  { val: 'MINOR', num: 2, label: 'Minor', desc: 'Small impact, easily remedied' },
  {
    val: 'MODERATE',
    num: 3,
    label: 'Moderate',
    desc: 'Significant impact requiring management intervention',
  },
  { val: 'MAJOR', num: 4, label: 'Major', desc: 'Major impact, substantial loss' },
  {
    val: 'CATASTROPHIC',
    num: 5,
    label: 'Catastrophic',
    desc: 'Extreme impact, threatens viability',
  },
];

const TREATMENT_OPTIONS = [
  { val: 'ACCEPT', label: 'Accept', desc: 'Accept the risk within tolerance' },
  { val: 'MITIGATE', label: 'Mitigate', desc: 'Reduce likelihood and/or consequence' },
  {
    val: 'TRANSFER',
    label: 'Transfer',
    desc: 'Transfer risk to third party (insurance, contract)',
  },
  { val: 'AVOID', label: 'Avoid', desc: 'Eliminate the risk by not undertaking the activity' },
  {
    val: 'REDUCE_LIKELIHOOD',
    label: 'Reduce Likelihood',
    desc: 'Focus on preventing the risk event',
  },
  {
    val: 'REDUCE_CONSEQUENCE',
    label: 'Reduce Consequence',
    desc: 'Focus on limiting impact if event occurs',
  },
];

const CONTROL_TYPES = ['PREVENTIVE', 'DETECTIVE', 'REACTIVE', 'DIRECTIVE'];
const CONTROL_EFFECTIVENESS = ['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE'];
const REVIEW_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'AD_HOC'];

interface Control {
  controlType: string;
  description: string;
  effectiveness: string;
  owner?: string;
}

interface ActionItem {
  actionTitle: string;
  description: string;
  owner?: string;
  targetDate?: string;
  priority?: string;
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 20)
    return {
      label: 'CRITICAL',
      color:
        'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    };
  if (score >= 15)
    return {
      label: 'VERY HIGH',
      color:
        'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    };
  if (score >= 10)
    return {
      label: 'HIGH',
      color:
        'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    };
  if (score >= 5)
    return {
      label: 'MEDIUM',
      color:
        'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
  return {
    label: 'LOW',
    color:
      'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
  };
}

function ScoreBadge({ score }: { score: number }) {
  const { label, color } = getRiskLevel(score);
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${color}`}
    >
      <span className="text-2xl">{score}</span>
      <span className="text-sm">/25 — {label}</span>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 hover:text-red-900 dark:hover:text-red-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder || 'Type and press Enter...'}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const steps = [
  { num: 1, label: 'Identification', icon: FileText },
  { num: 2, label: 'Inherent Assessment', icon: AlertTriangle },
  { num: 3, label: 'Controls & Residual', icon: Shield },
  { num: 4, label: 'Treatment', icon: Target },
  { num: 5, label: 'Monitoring', icon: Activity },
];

export default function NewRiskPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Identification
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OPERATIONAL');
  const [description, setDescription] = useState('');
  const [causes, setCauses] = useState<string[]>([]);
  const [riskEvent, setRiskEvent] = useState('');
  const [consequences, setConsequences] = useState<string[]>([]);
  const [internalContext, setInternalContext] = useState('');
  const [externalContext, setExternalContext] = useState('');
  const [regulatoryRef, setRegulatoryRef] = useState('');
  const [source, setSource] = useState('');

  // Step 2: Inherent Assessment
  const [likelihood, setLikelihood] = useState('POSSIBLE');
  const [consequence, setConsequence] = useState('MODERATE');
  const inherentScore =
    (LIKELIHOODS.find((l) => l.val === likelihood)?.num || 3) *
    (CONSEQUENCES.find((c) => c.val === consequence)?.num || 3);

  // Step 3: Controls & Residual
  const [controls, setControls] = useState<Control[]>([]);
  const [newControl, setNewControl] = useState<Control>({
    controlType: 'PREVENTIVE',
    description: '',
    effectiveness: 'ADEQUATE',
    owner: '',
  });
  const [residualLikelihood, setResidualLikelihood] = useState('POSSIBLE');
  const [residualConsequence, setResidualConsequence] = useState('MODERATE');
  const residualScore =
    (LIKELIHOODS.find((l) => l.val === residualLikelihood)?.num || 3) *
    (CONSEQUENCES.find((c) => c.val === residualConsequence)?.num || 3);

  // Step 4: Treatment
  const [treatment, setTreatment] = useState('MITIGATE');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [newAction, setNewAction] = useState<ActionItem>({
    actionTitle: '',
    description: '',
    owner: '',
    targetDate: '',
    priority: 'MEDIUM',
  });
  const [treatmentTargetScore, setTreatmentTargetScore] = useState<number>(4);

  // Step 5: Monitoring
  const [kriName, setKriName] = useState('');
  const [kriUnit, setKriUnit] = useState('');
  const [kriFrequency, setKriFrequency] = useState('MONTHLY');
  const [reviewFrequency, setReviewFrequency] = useState('QUARTERLY');
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [owner, setOwner] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');

  function addControl() {
    if (!newControl.description.trim()) return;
    setControls((p) => [...p, { ...newControl }]);
    setNewControl({
      controlType: 'PREVENTIVE',
      description: '',
      effectiveness: 'ADEQUATE',
      owner: '',
    });
  }

  function removeControl(idx: number) {
    setControls((p) => p.filter((_, i) => i !== idx));
  }

  function addAction() {
    if (!newAction.actionTitle.trim()) return;
    setActions((p) => [...p, { ...newAction }]);
    setNewAction({
      actionTitle: '',
      description: '',
      owner: '',
      targetDate: '',
      priority: 'MEDIUM',
    });
  }

  function removeAction(idx: number) {
    setActions((p) => p.filter((_, i) => i !== idx));
  }

  function canProceed(): boolean {
    if (step === 1) return title.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Risk title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const rLNum = LIKELIHOODS.find((l) => l.val === residualLikelihood)?.num || 3;
      const rCNum = CONSEQUENCES.find((c) => c.val === residualConsequence)?.num || 3;
      const iLNum = LIKELIHOODS.find((l) => l.val === likelihood)?.num || 3;
      const iCNum = CONSEQUENCES.find((c) => c.val === consequence)?.num || 3;

      const payload: Record<string, any> = {
        title,
        category,
        description: description || undefined,
        causes: causes.length > 0 ? causes : undefined,
        riskEvent: riskEvent || undefined,
        consequences: consequences.length > 0 ? consequences : undefined,
        internalContext: internalContext || undefined,
        externalContext: externalContext || undefined,
        regulatoryRef: regulatoryRef || undefined,
        source: source || undefined,
        likelihood,
        consequence,
        inherentLikelihood: iLNum,
        inherentConsequence: iCNum,
        inherentScore,
        residualLikelihood,
        residualConsequence,
        residualLikelihoodNum: rLNum,
        residualConsequenceNum: rCNum,
        residualScore,
        treatment,
        treatmentPlan: treatmentPlan || undefined,
        treatmentDescription: treatmentDescription || undefined,
        treatmentTargetScore,
        reviewFrequency,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate).toISOString() : undefined,
        owner: owner || undefined,
        ownerName: ownerName || undefined,
        department: department || undefined,
        notes: notes || undefined,
        status: 'IDENTIFIED',
        sourceModule: 'MANUAL',
      };

      const riskRes = await api.post('/risks', payload);
      const newRiskId = riskRes.data.data?.id;

      if (newRiskId) {
        // Create controls
        for (const ctrl of controls) {
          await api.post(`/risks/${newRiskId}/controls`, ctrl).catch(() => {});
        }
        // Create actions
        for (const act of actions) {
          if (act.actionTitle && act.description) {
            await api
              .post(`/risks/${newRiskId}/actions`, {
                actionTitle: act.actionTitle,
                description: act.description,
                actionType: 'MITIGATIVE',
                owner: act.owner || undefined,
                priority: act.priority || 'MEDIUM',
                targetDate: act.targetDate
                  ? new Date(act.targetDate).toISOString()
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .catch(() => {});
          }
        }
        // Create KRI if provided
        if (kriName.trim()) {
          await api
            .post(`/risks/${newRiskId}/kri`, {
              name: kriName,
              unit: kriUnit || undefined,
              measurementFrequency: kriFrequency,
            })
            .catch(() => {});
        }
      }

      router.push(newRiskId ? `/risks/${newRiskId}` : '/risks');
    } catch (e: unknown) {
      setError(e.response?.data?.error?.message || 'Failed to create risk. Please try again.');
      setSaving(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const sectionClass =
    'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">New Risk Entry</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 31000 — 5-step structured risk assessment
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => isDone && setStep(s.num)}
                      className={`flex flex-col items-center gap-1 transition-colors ${isDone ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isDone
                            ? 'bg-red-600 border-red-600 text-white'
                            : isActive
                              ? 'bg-white dark:bg-gray-900 border-red-600 text-red-600'
                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:block ${isActive ? 'text-red-600 dark:text-red-400' : isDone ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Identification */}
          {step === 1 && (
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                Step 1: Risk Identification
              </h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Risk Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear, concise risk title..."
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c
                            .replace(/_/g, ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (x) => x.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Source / Reference</label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Audit finding, Incident..."
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the risk in detail..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Root Causes (add multiple)</label>
                  <TagInput
                    tags={causes}
                    onChange={setCauses}
                    placeholder="Add a cause and press Enter..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Risk Event</label>
                  <input
                    type="text"
                    value={riskEvent}
                    onChange={(e) => setRiskEvent(e.target.value)}
                    placeholder="What event/scenario could occur?"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Potential Consequences (add multiple)</label>
                  <TagInput
                    tags={consequences}
                    onChange={setConsequences}
                    placeholder="Add a consequence and press Enter..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Internal Context</label>
                    <textarea
                      value={internalContext}
                      onChange={(e) => setInternalContext(e.target.value)}
                      rows={2}
                      placeholder="Internal factors, organisational context..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>External Context</label>
                    <textarea
                      value={externalContext}
                      onChange={(e) => setExternalContext(e.target.value)}
                      rows={2}
                      placeholder="External environment, stakeholders..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Regulatory Reference</label>
                  <input
                    type="text"
                    value={regulatoryRef}
                    onChange={(e) => setRegulatoryRef(e.target.value)}
                    placeholder="e.g. ISO 45001 cl.6.1, GDPR Art.32..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Inherent Assessment */}
          {step === 2 && (
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Step 2: Inherent Assessment
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Assess the risk without considering any existing controls.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Likelihood
                  </label>
                  <div className="space-y-2">
                    {LIKELIHOODS.map((l) => (
                      <label
                        key={l.val}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          likelihood === l.val
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="likelihood"
                          value={l.val}
                          checked={likelihood === l.val}
                          onChange={() => setLikelihood(l.val)}
                          className="mt-0.5 accent-red-600"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                l.num >= 4
                                  ? 'bg-red-500'
                                  : l.num === 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                            >
                              {l.num}
                            </span>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {l.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {l.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Consequence
                  </label>
                  <div className="space-y-2">
                    {CONSEQUENCES.map((c) => (
                      <label
                        key={c.val}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          consequence === c.val
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="consequence"
                          value={c.val}
                          checked={consequence === c.val}
                          onChange={() => setConsequence(c.val)}
                          className="mt-0.5 accent-red-600"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                c.num >= 4
                                  ? 'bg-red-500'
                                  : c.num === 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                            >
                              {c.num}
                            </span>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {c.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {c.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calculated Inherent Risk Score
                  </p>
                  <ScoreBadge score={inherentScore} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Likelihood ({LIKELIHOODS.find((l) => l.val === likelihood)?.num}) × Consequence
                    ({CONSEQUENCES.find((c) => c.val === consequence)?.num}) = {inherentScore}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Controls & Residual */}
          {step === 3 && (
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Step 3: Controls &amp; Residual Assessment
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Document existing controls, then assess the residual risk after controls are
                applied.
              </p>

              <div className="space-y-5">
                {/* Add control */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Add Control
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Control Type
                      </label>
                      <select
                        value={newControl.controlType}
                        onChange={(e) =>
                          setNewControl((p) => ({ ...p, controlType: e.target.value }))
                        }
                        className={inputClass}
                      >
                        {CONTROL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Effectiveness
                      </label>
                      <select
                        value={newControl.effectiveness}
                        onChange={(e) =>
                          setNewControl((p) => ({ ...p, effectiveness: e.target.value }))
                        }
                        className={inputClass}
                      >
                        {CONTROL_EFFECTIVENESS.map((e) => (
                          <option key={e} value={e}>
                            {e.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={newControl.description}
                      onChange={(e) =>
                        setNewControl((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Describe the control..."
                      className={inputClass}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addControl();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newControl.owner}
                      onChange={(e) => setNewControl((p) => ({ ...p, owner: e.target.value }))}
                      placeholder="Control owner (optional)"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addControl}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>

                {controls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Controls Added ({controls.length})
                    </p>
                    {controls.map((ctrl, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                              {ctrl.controlType.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                ctrl.effectiveness === 'STRONG'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : ctrl.effectiveness === 'ADEQUATE'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {ctrl.effectiveness.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {ctrl.description}
                          </p>
                          {ctrl.owner && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              Owner: {ctrl.owner}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeControl(idx)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Residual Risk Assessment (after controls)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Residual Likelihood</label>
                      <div className="space-y-1.5">
                        {LIKELIHOODS.map((l) => (
                          <label
                            key={l.val}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                              residualLikelihood === l.val
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="res_likelihood"
                              value={l.val}
                              checked={residualLikelihood === l.val}
                              onChange={() => setResidualLikelihood(l.val)}
                              className="accent-red-600"
                            />
                            <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                              {l.num}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{l.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Residual Consequence</label>
                      <div className="space-y-1.5">
                        {CONSEQUENCES.map((c) => (
                          <label
                            key={c.val}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                              residualConsequence === c.val
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="res_consequence"
                              value={c.val}
                              checked={residualConsequence === c.val}
                              onChange={() => setResidualConsequence(c.val)}
                              className="accent-red-600"
                            />
                            <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                              {c.num}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{c.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Inherent → Residual
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <ScoreBadge score={inherentScore} />
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                          <ScoreBadge score={residualScore} />
                        </div>
                      </div>
                      {residualScore < inherentScore && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Risk reduction</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            -{inherentScore - residualScore}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Treatment */}
          {step === 4 && (
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Step 4: Treatment Plan
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Select a treatment strategy and define specific actions.
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Treatment Option *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TREATMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt.val}
                        className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          treatment === opt.val
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="treatment"
                          value={opt.val}
                          checked={treatment === opt.val}
                          onChange={() => setTreatment(opt.val)}
                          className="mt-0.5 accent-red-600 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Treatment Plan</label>
                  <textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    rows={3}
                    placeholder="Describe the overall treatment plan..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Treatment Description</label>
                  <textarea
                    value={treatmentDescription}
                    onChange={(e) => setTreatmentDescription(e.target.value)}
                    rows={2}
                    placeholder="Additional details about the treatment approach..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Target Residual Score</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={25}
                      value={treatmentTargetScore}
                      onChange={(e) => setTreatmentTargetScore(Number(e.target.value))}
                      className="flex-1 accent-red-600"
                    />
                    <ScoreBadge score={treatmentTargetScore} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Current residual: {residualScore} → Target: {treatmentTargetScore}
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Treatment Actions
                  </p>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Action Title *
                        </label>
                        <input
                          type="text"
                          value={newAction.actionTitle}
                          onChange={(e) =>
                            setNewAction((p) => ({ ...p, actionTitle: e.target.value }))
                          }
                          placeholder="What needs to be done?"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={newAction.description}
                          onChange={(e) =>
                            setNewAction((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Detailed description..."
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Owner
                        </label>
                        <input
                          type="text"
                          value={newAction.owner}
                          onChange={(e) => setNewAction((p) => ({ ...p, owner: e.target.value }))}
                          placeholder="Action owner"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Target Date
                        </label>
                        <input
                          type="date"
                          value={newAction.targetDate}
                          onChange={(e) =>
                            setNewAction((p) => ({ ...p, targetDate: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={newAction.priority}
                        onChange={(e) => setNewAction((p) => ({ ...p, priority: e.target.value }))}
                        className={`${inputClass} flex-1`}
                      >
                        <option value="LOW">Low priority</option>
                        <option value="MEDIUM">Medium priority</option>
                        <option value="HIGH">High priority</option>
                        <option value="CRITICAL">Critical priority</option>
                      </select>
                      <button
                        type="button"
                        onClick={addAction}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {actions.length > 0 && (
                    <div className="space-y-2">
                      {actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {act.actionTitle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {act.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {act.owner && <span>Owner: {act.owner}</span>}
                              {act.targetDate && <span>Due: {act.targetDate}</span>}
                              {act.priority && (
                                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                  {act.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAction(idx)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Monitoring */}
          {step === 5 && (
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-500" />
                Step 5: Monitoring &amp; Ownership
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Set up monitoring cadence, KRIs, and assign ownership.
              </p>
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Key Risk Indicator (optional)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
                        KRI Name
                      </label>
                      <input
                        type="text"
                        value={kriName}
                        onChange={(e) => setKriName(e.target.value)}
                        placeholder="e.g. Number of incidents per month..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={kriUnit}
                        onChange={(e) => setKriUnit(e.target.value)}
                        placeholder="e.g. %, #, £..."
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
                        Measurement Frequency
                      </label>
                      <select
                        value={kriFrequency}
                        onChange={(e) => setKriFrequency(e.target.value)}
                        className={inputClass}
                      >
                        {REVIEW_FREQUENCIES.map((f) => (
                          <option key={f} value={f}>
                            {f.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Review Frequency</label>
                    <select
                      value={reviewFrequency}
                      onChange={(e) => setReviewFrequency(e.target.value)}
                      className={inputClass}
                    >
                      {REVIEW_FREQUENCIES.map((f) => (
                        <option key={f} value={f}>
                          {f.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Next Review Date</label>
                    <input
                      type="date"
                      value={nextReviewDate}
                      onChange={(e) => setNextReviewDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Risk Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Full name of risk owner"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Responsible department"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional notes or context..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Risk Summary
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Title:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Inherent:</span>
                      <span className="ml-2 font-bold text-red-600 dark:text-red-400">
                        {inherentScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Residual:</span>
                      <span className="ml-2 font-bold text-orange-600 dark:text-orange-400">
                        {residualScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Treatment:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {treatment.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Controls:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {controls.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Actions:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {actions.length}
                      </span>
                    </div>
                    {kriName && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">KRI:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {kriName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep((p) => p - 1) : router.push('/risks'))}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="text-sm text-gray-400 dark:text-gray-500">
              Step {step} of {steps.length}
            </div>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => canProceed() && setStep((p) => p + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Risk...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Create Risk
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
