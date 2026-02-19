'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const STEPS = [
  'Chemical & Activity',
  'Exposure Details',
  'Inherent Risk',
  'Controls & PPE',
  'Residual Risk & Review',
];

const RISK_LABELS = ['Negligible', 'Low', 'Medium', 'High', 'Very High'];
const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

function getRiskColor(score: number): string {
  if (score <= 4) return 'bg-green-500 text-white';
  if (score <= 9) return 'bg-amber-400 text-black';
  if (score <= 16) return 'bg-orange-500 text-white';
  return 'bg-red-600 text-white';
}

function getRiskLevel(score: number): string {
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'VERY_HIGH';
}

interface ChemicalOption {
  id: string;
  name: string;
  casNumber: string;
}

const EXPOSURE_ROUTES = ['Inhalation', 'Skin Absorption', 'Ingestion', 'Eye Contact', 'Injection'];
const CONTROL_HIERARCHY = [
  'Elimination',
  'Substitution',
  'Engineering Controls',
  'Administrative Controls',
  'PPE',
];
const PPE_OPTIONS = [
  'Safety Goggles',
  'Face Shield',
  'Chemical Gloves',
  'Protective Clothing',
  'Respirator',
  'Fume Hood',
  'Safety Boots',
  'Apron',
];

export default function NewCoshhPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [chemicals, setChemicals] = useState<ChemicalOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    chemicalId: '',
    activity: '',
    location: '',
    department: '',
    personsExposed: '',
    exposureRoutes: [] as string[],
    quantity: '',
    frequency: 'DAILY',
    duration: '',
    inherentSeverity: 0,
    inherentLikelihood: 0,
    controls: [] as string[],
    controlDetails: '',
    ppeRequired: [] as string[],
    emergencyProcedures: '',
    residualSeverity: 0,
    residualLikelihood: 0,
    reviewDate: '',
    assessorName: '',
    approverName: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/register?fields=id,name,casNumber');
        setChemicals(res.data.data || []);
      } catch {
        // Non-critical
      }
    })();
  }, []);

  const inherentScore = form.inherentSeverity * form.inherentLikelihood;
  const residualScore = form.residualSeverity * form.residualLikelihood;

  const toggleArrayItem = (field: 'exposureRoutes' | 'controls' | 'ppeRequired', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        inherentRiskScore: inherentScore,
        inherentRiskLevel: getRiskLevel(inherentScore),
        residualRiskScore: residualScore,
        residualRiskLevel: getRiskLevel(residualScore),
      };
      const res = await api.post('/coshh', payload);
      const created = res.data.data;
      router.push(`/coshh/${created?.id || ''}`);
    } catch (e) {
      setError((e as any)?.response?.data?.message || 'Failed to create COSHH assessment.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.chemicalId && form.activity && form.location;
    if (step === 1) return form.personsExposed && form.exposureRoutes.length > 0;
    if (step === 2) return form.inherentSeverity > 0 && form.inherentLikelihood > 0;
    if (step === 3) return form.controls.length > 0;
    if (step === 4)
      return form.residualSeverity > 0 && form.residualLikelihood > 0 && form.reviewDate;
    return true;
  };

  const RiskMatrix = ({
    selectedSeverity,
    selectedLikelihood,
    onSelect,
  }: {
    selectedSeverity: number;
    selectedLikelihood: number;
    onSelect: (severity: number, likelihood: number) => void;
  }) => (
    <div className="mt-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col items-center mr-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 -rotate-90 origin-center whitespace-nowrap translate-y-16">
            Severity
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-6 gap-1">
            <div />
            {LIKELIHOOD_LABELS.map((label, i) => (
              <div
                key={label}
                className="text-center text-[10px] text-gray-500 dark:text-gray-400 font-medium pb-1"
              >
                {label}
              </div>
            ))}
            {RISK_LABELS.slice()
              .reverse()
              .map((sevLabel, ri) => {
                const severity = 5 - ri;
                return (
                  <div key={sevLabel} className="contents">
                    <div className="text-right text-[10px] text-gray-500 dark:text-gray-400 font-medium pr-2 flex items-center justify-end">
                      {sevLabel}
                    </div>
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const score = severity * likelihood;
                      const isSelected =
                        selectedSeverity === severity && selectedLikelihood === likelihood;
                      return (
                        <button
                          key={`${severity}-${likelihood}`}
                          type="button"
                          onClick={() => onSelect(severity, likelihood)}
                          className={`h-10 rounded text-xs font-bold transition-all ${getRiskColor(score)} ${
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Likelihood
          </div>
        </div>
      </div>
      {selectedSeverity > 0 && selectedLikelihood > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Risk Score:</span>
          <span
            className={`text-sm font-bold px-3 py-1 rounded ${getRiskColor(selectedSeverity * selectedLikelihood)}`}
          >
            {selectedSeverity * selectedLikelihood} -{' '}
            {getRiskLevel(selectedSeverity * selectedLikelihood).replace('_', ' ')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/coshh')}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to COSHH Assessments
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            New COSHH Assessment
          </h1>

          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    i < step
                      ? 'bg-green-600 text-white'
                      : i === step
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden md:inline ${i === step ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Step 1: Chemical & Activity
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chemical *
                    </label>
                    <select
                      value={form.chemicalId}
                      onChange={(e) => setForm({ ...form, chemicalId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a chemical...</option>
                      {chemicals.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.casNumber ? `(${c.casNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Activity / Task *
                    </label>
                    <input
                      type="text"
                      value={form.activity}
                      onChange={(e) => setForm({ ...form, activity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. Mixing solvents for cleaning"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Workshop B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Maintenance"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Step 2: Exposure Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Persons Exposed *
                      </label>
                      <input
                        type="text"
                        value={form.personsExposed}
                        onChange={(e) => setForm({ ...form, personsExposed: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. 3 operators, 1 supervisor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity Used
                      </label>
                      <input
                        type="text"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. 5 litres per batch"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Frequency
                      </label>
                      <select
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="RARELY">Rarely</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                        <option value="CONTINUOUSLY">Continuously</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration per Use
                      </label>
                      <input
                        type="text"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. 30 minutes"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Routes of Exposure *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXPOSURE_ROUTES.map((route) => (
                        <button
                          key={route}
                          type="button"
                          onClick={() => toggleArrayItem('exposureRoutes', route)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                            form.exposureRoutes.includes(route)
                              ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                              : 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {route}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Step 3: Inherent Risk Assessment
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assess the risk WITHOUT any controls in place. Click a cell in the matrix to
                    select the risk score.
                  </p>
                  <RiskMatrix
                    selectedSeverity={form.inherentSeverity}
                    selectedLikelihood={form.inherentLikelihood}
                    onSelect={(severity, likelihood) =>
                      setForm({
                        ...form,
                        inherentSeverity: severity,
                        inherentLikelihood: likelihood,
                      })
                    }
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Step 4: Controls & PPE
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select controls in order of the hierarchy of controls (most effective first).
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hierarchy of Controls *
                    </label>
                    <div className="space-y-2">
                      {CONTROL_HIERARCHY.map((control, i) => (
                        <button
                          key={control}
                          type="button"
                          onClick={() => toggleArrayItem('controls', control)}
                          className={`flex items-center gap-3 w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors text-left ${
                            form.controls.includes(control)
                              ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                              : 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              form.controls.includes(control)
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {i + 1}
                          </span>
                          {control}
                          {form.controls.includes(control) && (
                            <Check className="h-4 w-4 ml-auto text-red-600 dark:text-red-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Control Details
                    </label>
                    <textarea
                      value={form.controlDetails}
                      onChange={(e) => setForm({ ...form, controlDetails: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                      placeholder="Describe the specific controls to be implemented..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PPE Required
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PPE_OPTIONS.map((ppe) => (
                        <button
                          key={ppe}
                          type="button"
                          onClick={() => toggleArrayItem('ppeRequired', ppe)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                            form.ppeRequired.includes(ppe)
                              ? 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300'
                              : 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {ppe}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Emergency Procedures
                    </label>
                    <textarea
                      value={form.emergencyProcedures}
                      onChange={(e) => setForm({ ...form, emergencyProcedures: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                      placeholder="Describe emergency procedures (spill response, first aid, etc.)..."
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Step 5: Residual Risk & Review
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assess the risk WITH all controls in place. This should be lower than the
                    inherent risk.
                  </p>
                  <RiskMatrix
                    selectedSeverity={form.residualSeverity}
                    selectedLikelihood={form.residualLikelihood}
                    onSelect={(severity, likelihood) =>
                      setForm({
                        ...form,
                        residualSeverity: severity,
                        residualLikelihood: likelihood,
                      })
                    }
                  />
                  {residualScore > 0 && inherentScore > 0 && residualScore >= inherentScore && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
                      Residual risk should be lower than the inherent risk score ({inherentScore}).
                      Consider reviewing your controls.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Review Date *
                      </label>
                      <input
                        type="date"
                        value={form.reviewDate}
                        onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assessor Name
                      </label>
                      <input
                        type="text"
                        value={form.assessorName}
                        onChange={(e) => setForm({ ...form, assessorName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                        placeholder="Name of assessor"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Approver Name
                    </label>
                    <input
                      type="text"
                      value={form.approverName}
                      onChange={(e) => setForm({ ...form, approverName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                      placeholder="Name of approver"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={saving || !canProceed()}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
