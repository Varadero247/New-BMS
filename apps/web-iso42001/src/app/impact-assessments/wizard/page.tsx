'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type WizardStep = 'scope' | 'stakeholders' | 'impacts' | 'mitigations' | 'review';

const STEPS: { key: WizardStep; label: string; num: number }[] = [
  { key: 'scope', label: 'Scope', num: 1 },
  { key: 'stakeholders', label: 'Stakeholders', num: 2 },
  { key: 'impacts', label: 'Impacts', num: 3 },
  { key: 'mitigations', label: 'Mitigations', num: 4 },
  { key: 'review', label: 'Review', num: 5 },
];

interface Stakeholder {
  name: string;
  role: string;
  impactType: 'positive' | 'negative' | 'both';
}

interface Impact {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high' | 'very_high';
  severity: 'negligible' | 'low' | 'moderate' | 'high' | 'very_high';
  affectedParties: string;
}

interface Mitigation {
  impactIndex: number;
  action: string;
  owner: string;
  deadline: string;
  residualRisk: 'low' | 'medium' | 'high';
}

const IMPACT_CATEGORIES = [
  'Human Rights',
  'Privacy & Data Protection',
  'Environmental',
  'Safety',
  'Fairness & Non-discrimination',
  'Transparency',
  'Accountability',
  'Economic',
  'Social Wellbeing',
  'Autonomy & Agency',
];

export default function ImpactAssessmentWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('scope');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Scope
  const [scope, setScope] = useState({
    title: '',
    system: '',
    description: '',
    assessor: '',
    purpose: '',
    dataTypes: '',
    geographies: '',
  });

  // Step 2: Stakeholders
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { name: '', role: '', impactType: 'both' },
  ]);

  // Step 3: Impacts
  const [impacts, setImpacts] = useState<Impact[]>([
    {
      category: 'Privacy & Data Protection',
      description: '',
      likelihood: 'medium',
      severity: 'moderate',
      affectedParties: '',
    },
  ]);

  // Step 4: Mitigations
  const [mitigations, setMitigations] = useState<Mitigation[]>([
    { impactIndex: 0, action: '', owner: '', deadline: '', residualRisk: 'low' },
  ]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const addStakeholder = () =>
    setStakeholders((prev) => [...prev, { name: '', role: '', impactType: 'both' }]);
  const removeStakeholder = (i: number) =>
    setStakeholders((prev) => prev.filter((_, idx) => idx !== i));
  const updateStakeholder = (i: number, field: keyof Stakeholder, value: string) =>
    setStakeholders((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const addImpact = () =>
    setImpacts((prev) => [
      ...prev,
      {
        category: 'Safety',
        description: '',
        likelihood: 'medium',
        severity: 'moderate',
        affectedParties: '',
      },
    ]);
  const removeImpact = (i: number) => setImpacts((prev) => prev.filter((_, idx) => idx !== i));
  const updateImpact = (i: number, field: keyof Impact, value: string) =>
    setImpacts((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const addMitigation = () =>
    setMitigations((prev) => [
      ...prev,
      { impactIndex: 0, action: '', owner: '', deadline: '', residualRisk: 'low' },
    ]);
  const removeMitigation = (i: number) =>
    setMitigations((prev) => prev.filter((_, idx) => idx !== i));
  const updateMitigation = (i: number, field: keyof Mitigation, value: string | number) =>
    setMitigations((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const computeImpactLevel = (): string => {
    const severityMap: Record<string, number> = {
      negligible: 1,
      low: 2,
      moderate: 3,
      high: 4,
      very_high: 5,
    };
    const likelihoodMap: Record<string, number> = { low: 1, medium: 2, high: 3, very_high: 4 };
    if (impacts.length === 0) return 'NEGLIGIBLE';
    const maxScore = impacts.reduce((max, imp) => {
      const score = (severityMap[imp.severity] || 3) * (likelihoodMap[imp.likelihood] || 2);
      return Math.max(max, score);
    }, 0);
    if (maxScore >= 15) return 'VERY_HIGH';
    if (maxScore >= 10) return 'HIGH';
    if (maxScore >= 6) return 'MODERATE';
    if (maxScore >= 3) return 'LOW';
    return 'NEGLIGIBLE';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const findings = impacts
        .map(
          (imp, _i) =>
            `[${imp.category}] ${imp.description} (Likelihood: ${imp.likelihood}, Severity: ${imp.severity})`
        )
        .join('\n');
      const recommendations = mitigations
        .map(
          (m, _i) =>
            `Impact #${m.impactIndex + 1}: ${m.action} (Owner: ${m.owner}, Deadline: ${m.deadline}, Residual: ${m.residualRisk})`
        )
        .join('\n');

      await api.post('/impact-assessments', {
        title: scope.title,
        system: scope.system,
        description: `${scope.description}\n\nPurpose: ${scope.purpose}\nData Types: ${scope.dataTypes}\nGeographies: ${scope.geographies}\n\nStakeholders:\n${stakeholders.map((s) => `- ${s.name} (${s.role}) — ${s.impactType}`).join('\n')}`,
        assessor: scope.assessor,
        impactLevel: computeImpactLevel(),
        status: 'COMPLETED',
        findings,
        recommendations,
      });
      router.push('/impact-assessments');
    } catch {
      setError('Failed to submit assessment. Please try again.');
    }
    setSubmitting(false);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'scope':
        return !!(scope.title.trim() && scope.system.trim());
      case 'stakeholders':
        return stakeholders.some((s) => s.name.trim());
      case 'impacts':
        return impacts.some((i) => i.description.trim());
      case 'mitigations':
        return mitigations.some((m) => m.action.trim());
      case 'review':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Impact Assessment Wizard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ISO 42001:2023 Clause 6.1.4 — Guided AI impact assessment
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold shrink-0 ${
                  i < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : i === currentStepIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentStepIndex ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${i === currentStepIndex ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
        {step === 'scope' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step 1: Define Scope
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Identify the AI system and scope of this impact assessment.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assessment Title *
                </label>
                <input
                  value={scope.title}
                  onChange={(e) => setScope((s) => ({ ...s, title: e.target.value }))}
                  placeholder="e.g. Customer Risk Scoring Model IA"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  AI System *
                </label>
                <input
                  value={scope.system}
                  onChange={(e) => setScope((s) => ({ ...s, system: e.target.value }))}
                  placeholder="e.g. Risk Scorer v2.1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assessor
                </label>
                <input
                  value={scope.assessor}
                  onChange={(e) => setScope((s) => ({ ...s, assessor: e.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Geographies
                </label>
                <input
                  value={scope.geographies}
                  onChange={(e) => setScope((s) => ({ ...s, geographies: e.target.value }))}
                  placeholder="e.g. UK, EU, US"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Purpose
                </label>
                <textarea
                  value={scope.purpose}
                  onChange={(e) => setScope((s) => ({ ...s, purpose: e.target.value }))}
                  placeholder="Describe what the AI system does and why..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Types Processed
                </label>
                <input
                  value={scope.dataTypes}
                  onChange={(e) => setScope((s) => ({ ...s, dataTypes: e.target.value }))}
                  placeholder="e.g. Personal data, financial records, health data"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={scope.description}
                  onChange={(e) => setScope((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Additional context about this assessment..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'stakeholders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step 2: Identify Stakeholders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              List all individuals or groups affected by this AI system.
            </p>
            {stakeholders.map((sh, i) => (
              <div
                key={i}
                className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Name / Group
                    </label>
                    <input
                      value={sh.name}
                      onChange={(e) => updateStakeholder(i, 'name', e.target.value)}
                      placeholder="e.g. End users"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Role
                    </label>
                    <input
                      value={sh.role}
                      onChange={(e) => updateStakeholder(i, 'role', e.target.value)}
                      placeholder="e.g. Data subject"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Impact Type
                    </label>
                    <select
                      value={sh.impactType}
                      onChange={(e) => updateStakeholder(i, 'impactType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                {stakeholders.length > 1 && (
                  <button
                    onClick={() => removeStakeholder(i)}
                    className="mt-5 text-red-500 hover:text-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addStakeholder}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Stakeholder
            </button>
          </div>
        )}

        {step === 'impacts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step 3: Assess Impacts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Identify and score potential impacts of the AI system.
            </p>
            {impacts.map((imp, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Impact #{i + 1}
                  </span>
                  {impacts.length > 1 && (
                    <button
                      onClick={() => removeImpact(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      value={imp.category}
                      onChange={(e) => updateImpact(i, 'category', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      {IMPACT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Affected Parties
                    </label>
                    <input
                      value={imp.affectedParties}
                      onChange={(e) => updateImpact(i, 'affectedParties', e.target.value)}
                      placeholder="Who is affected?"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={imp.description}
                      onChange={(e) => updateImpact(i, 'description', e.target.value)}
                      placeholder="Describe the potential impact..."
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm min-h-[50px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Likelihood
                    </label>
                    <select
                      value={imp.likelihood}
                      onChange={(e) => updateImpact(i, 'likelihood', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Severity
                    </label>
                    <select
                      value={imp.severity}
                      onChange={(e) => updateImpact(i, 'severity', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <option value="negligible">Negligible</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addImpact}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Impact
            </button>

            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-600">
                  Calculated Impact Level:
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    computeImpactLevel() === 'VERY_HIGH'
                      ? 'bg-red-100 text-red-700'
                      : computeImpactLevel() === 'HIGH'
                        ? 'bg-orange-100 text-orange-700'
                        : computeImpactLevel() === 'MODERATE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                  }`}
                >
                  {computeImpactLevel().replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 'mitigations' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step 4: Define Mitigations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              For each identified impact, define mitigation actions to reduce risk.
            </p>
            {mitigations.map((mit, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mitigation #{i + 1}
                  </span>
                  {mitigations.length > 1 && (
                    <button
                      onClick={() => removeMitigation(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      For Impact #
                    </label>
                    <select
                      value={mit.impactIndex}
                      onChange={(e) => updateMitigation(i, 'impactIndex', parseInt(e.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      {impacts.map((_, idx) => (
                        <option key={idx} value={idx}>
                          Impact #{idx + 1}: {impacts[idx]?.category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Owner
                    </label>
                    <input
                      value={mit.owner}
                      onChange={(e) => updateMitigation(i, 'owner', e.target.value)}
                      placeholder="Responsible person"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Mitigation Action
                    </label>
                    <textarea
                      value={mit.action}
                      onChange={(e) => updateMitigation(i, 'action', e.target.value)}
                      placeholder="Describe the mitigation measure..."
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm min-h-[50px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={mit.deadline}
                      onChange={(e) => updateMitigation(i, 'deadline', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Residual Risk
                    </label>
                    <select
                      value={mit.residualRisk}
                      onChange={(e) => updateMitigation(i, 'residualRisk', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addMitigation}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Mitigation
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step 5: Review & Submit
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review all information before submitting the assessment.
            </p>

            {/* Scope summary */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Scope</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Title:</span>{' '}
                  <span className="font-medium">{scope.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">System:</span>{' '}
                  <span className="font-medium">{scope.system}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Assessor:</span>{' '}
                  <span className="font-medium">{scope.assessor || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Geographies:</span>{' '}
                  <span className="font-medium">{scope.geographies || '—'}</span>
                </div>
                {scope.purpose && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Purpose:</span>{' '}
                    <span className="font-medium">{scope.purpose}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stakeholders summary */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Stakeholders ({stakeholders.filter((s) => s.name).length})
              </h3>
              <div className="space-y-1">
                {stakeholders
                  .filter((s) => s.name)
                  .map((s, i) => (
                    <div key={i} className="text-sm flex gap-2">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">— {s.role}</span>
                      <span
                        className={`text-xs rounded-full px-1.5 py-0.5 ${s.impactType === 'positive' ? 'bg-green-100 text-green-700' : s.impactType === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                      >
                        {s.impactType}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Impacts summary */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Impacts ({impacts.filter((i) => i.description).length})
                </h3>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    computeImpactLevel() === 'VERY_HIGH'
                      ? 'bg-red-100 text-red-700'
                      : computeImpactLevel() === 'HIGH'
                        ? 'bg-orange-100 text-orange-700'
                        : computeImpactLevel() === 'MODERATE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                  }`}
                >
                  Overall: {computeImpactLevel().replace(/_/g, ' ')}
                </span>
              </div>
              {impacts
                .filter((i) => i.description)
                .map((imp, i) => (
                  <div key={i} className="text-sm py-1 border-b last:border-0">
                    <span className="font-medium">{imp.category}:</span> {imp.description}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      (L: {imp.likelihood}, S: {imp.severity})
                    </span>
                  </div>
                ))}
            </div>

            {/* Mitigations summary */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mitigations ({mitigations.filter((m) => m.action).length})
              </h3>
              {mitigations
                .filter((m) => m.action)
                .map((mit, i) => (
                  <div key={i} className="text-sm py-1 border-b last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">
                      For Impact #{mit.impactIndex + 1}:
                    </span>{' '}
                    {mit.action}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      (Owner: {mit.owner || '—'}, Residual: {mit.residualRisk})
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStepIndex > 0 && (
            <button
              onClick={goBack}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href="/impact-assessments"
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </a>
          {step === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
