'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, Button, Input, Label, Select, Textarea } from '@ims/ui';
import {
  Flame,
  Users,
  ShieldCheck,
  ClipboardList,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const STEPS = [
  { id: 1, title: 'Identify Fire Hazards', icon: Flame, description: 'Identify sources of ignition, fuel and oxygen' },
  { id: 2, title: 'People at Risk', icon: Users, description: 'Identify all people who may be at risk' },
  { id: 3, title: 'Evaluate & Control', icon: ShieldCheck, description: 'Evaluate risk and identify precautions' },
  { id: 4, title: 'Record & Plan', icon: ClipboardList, description: 'Record findings and create action plan' },
  { id: 5, title: 'Review & Sign-off', icon: Calendar, description: 'Schedule review and sign off the assessment' },
] as const;

interface IgnitionSource { id: string; source: string; location: string; controlMeasure: string; }
interface FuelSource { id: string; material: string; location: string; controlMeasure: string; }
interface OxygenSource { id: string; source: string; location: string; controlMeasure: string; }
interface PersonGroup { id: string; group: string; count: number; vulnerabilities: string; location: string; }
interface Precaution { id: string; category: string; description: string; inPlace: boolean; adequacy: string; action: string; }
interface ActionItem { id: string; finding: string; action: string; responsible: string; dueDate: string; priority: string; }

interface FRAForm {
  premisesId: string;
  assessorName: string;
  assessorRole: string;
  assessmentDate: string;
  reviewDate: string;
  // Step 1
  ignitionSources: IgnitionSource[];
  fuelSources: FuelSource[];
  oxygenSources: OxygenSource[];
  step1Notes: string;
  // Step 2
  personGroups: PersonGroup[];
  estimatedOccupants: number;
  vulnerablePersons: string;
  step2Notes: string;
  // Step 3
  overallRiskRating: string;
  precautions: Precaution[];
  riskLikelihood: number;
  riskSeverity: number;
  step3Notes: string;
  // Step 4
  findingsSummary: string;
  actionItems: ActionItem[];
  step4Notes: string;
  // Step 5
  reviewInterval: string;
  nextReviewDate: string;
  signOffName: string;
  signOffRole: string;
  signOffDate: string;
  additionalNotes: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;
const RISK_MATRIX: Record<string, Record<string, string>> = {
  '1': { '1': 'LOW', '2': 'LOW', '3': 'LOW', '4': 'MEDIUM', '5': 'MEDIUM' },
  '2': { '1': 'LOW', '2': 'LOW', '3': 'MEDIUM', '4': 'MEDIUM', '5': 'HIGH' },
  '3': { '1': 'LOW', '2': 'MEDIUM', '3': 'MEDIUM', '4': 'HIGH', '5': 'HIGH' },
  '4': { '1': 'MEDIUM', '2': 'MEDIUM', '3': 'HIGH', '4': 'HIGH', '5': 'VERY_HIGH' },
  '5': { '1': 'MEDIUM', '2': 'HIGH', '3': 'HIGH', '4': 'VERY_HIGH', '5': 'VERY_HIGH' },
};

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-500',
  VERY_HIGH: 'bg-red-600',
};

export default function FRANewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const [form, setForm] = useState<FRAForm>({
    premisesId: searchParams.get('premisesId') || '',
    assessorName: '',
    assessorRole: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    ignitionSources: [{ id: uid(), source: '', location: '', controlMeasure: '' }],
    fuelSources: [{ id: uid(), material: '', location: '', controlMeasure: '' }],
    oxygenSources: [{ id: uid(), source: '', location: '', controlMeasure: '' }],
    step1Notes: '',
    personGroups: [{ id: uid(), group: 'Employees', count: 0, vulnerabilities: '', location: '' }],
    estimatedOccupants: 0,
    vulnerablePersons: '',
    step2Notes: '',
    overallRiskRating: 'MEDIUM',
    precautions: [
      { id: uid(), category: 'Detection & Warning', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
      { id: uid(), category: 'Means of Escape', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
      { id: uid(), category: 'Fire Fighting Equipment', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
      { id: uid(), category: 'Emergency Lighting', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
      { id: uid(), category: 'Fire Safety Signs', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
      { id: uid(), category: 'Maintenance', description: '', inPlace: false, adequacy: 'ADEQUATE', action: '' },
    ],
    riskLikelihood: 3,
    riskSeverity: 3,
    step3Notes: '',
    findingsSummary: '',
    actionItems: [{ id: uid(), finding: '', action: '', responsible: '', dueDate: '', priority: 'MEDIUM' }],
    step4Notes: '',
    reviewInterval: '12',
    nextReviewDate: '',
    signOffName: '',
    signOffRole: '',
    signOffDate: new Date().toISOString().split('T')[0],
    additionalNotes: '',
  });

  useEffect(() => {
    api.get('/premises').then((r) => setPremises(r.data.data || [])).catch(() => {});
  }, []);

  // Auto-compute risk rating from matrix
  const computedRisk = RISK_MATRIX[String(form.riskLikelihood)]?.[String(form.riskSeverity)] || 'MEDIUM';

  useEffect(() => {
    setForm((f) => ({ ...f, overallRiskRating: computedRisk }));
  }, [form.riskLikelihood, form.riskSeverity, computedRisk]);

  // Auto-compute review date from assessment date + interval
  useEffect(() => {
    if (form.assessmentDate && form.reviewInterval) {
      const d = new Date(form.assessmentDate);
      d.setMonth(d.getMonth() + parseInt(form.reviewInterval));
      setForm((f) => ({ ...f, nextReviewDate: d.toISOString().split('T')[0], reviewDate: d.toISOString().split('T')[0] }));
    }
  }, [form.assessmentDate, form.reviewInterval]);

  function canProceed(): boolean {
    switch (step) {
      case 1: return form.premisesId !== '' && form.assessorName !== '';
      case 2: return form.personGroups.length > 0;
      case 3: return form.precautions.length > 0;
      case 4: return form.findingsSummary !== '';
      case 5: return form.signOffName !== '' && form.signOffDate !== '';
      default: return true;
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      await api.post('/fra', payload);
      router.push('/fra');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save FRA. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addIgnitionSource() {
    setForm((f) => ({ ...f, ignitionSources: [...f.ignitionSources, { id: uid(), source: '', location: '', controlMeasure: '' }] }));
  }
  function removeIgnitionSource(id: string) {
    setForm((f) => ({ ...f, ignitionSources: f.ignitionSources.filter((s) => s.id !== id) }));
  }
  function updateIgnitionSource(id: string, field: keyof IgnitionSource, val: string) {
    setForm((f) => ({ ...f, ignitionSources: f.ignitionSources.map((s) => s.id === id ? { ...s, [field]: val } : s) }));
  }

  function addFuelSource() {
    setForm((f) => ({ ...f, fuelSources: [...f.fuelSources, { id: uid(), material: '', location: '', controlMeasure: '' }] }));
  }
  function removeFuelSource(id: string) {
    setForm((f) => ({ ...f, fuelSources: f.fuelSources.filter((s) => s.id !== id) }));
  }
  function updateFuelSource(id: string, field: keyof FuelSource, val: string) {
    setForm((f) => ({ ...f, fuelSources: f.fuelSources.map((s) => s.id === id ? { ...s, [field]: val } : s) }));
  }

  function addOxygenSource() {
    setForm((f) => ({ ...f, oxygenSources: [...f.oxygenSources, { id: uid(), source: '', location: '', controlMeasure: '' }] }));
  }
  function removeOxygenSource(id: string) {
    setForm((f) => ({ ...f, oxygenSources: f.oxygenSources.filter((s) => s.id !== id) }));
  }
  function updateOxygenSource(id: string, field: keyof OxygenSource, val: string) {
    setForm((f) => ({ ...f, oxygenSources: f.oxygenSources.map((s) => s.id === id ? { ...s, [field]: val } : s) }));
  }

  function addPersonGroup() {
    setForm((f) => ({ ...f, personGroups: [...f.personGroups, { id: uid(), group: '', count: 0, vulnerabilities: '', location: '' }] }));
  }
  function removePersonGroup(id: string) {
    setForm((f) => ({ ...f, personGroups: f.personGroups.filter((g) => g.id !== id) }));
  }
  function updatePersonGroup(id: string, field: keyof PersonGroup, val: any) {
    setForm((f) => ({ ...f, personGroups: f.personGroups.map((g) => g.id === id ? { ...g, [field]: val } : g) }));
  }

  function updatePrecaution(id: string, field: keyof Precaution, val: any) {
    setForm((f) => ({ ...f, precautions: f.precautions.map((p) => p.id === id ? { ...p, [field]: val } : p) }));
  }

  function addActionItem() {
    setForm((f) => ({ ...f, actionItems: [...f.actionItems, { id: uid(), finding: '', action: '', responsible: '', dueDate: '', priority: 'MEDIUM' }] }));
  }
  function removeActionItem(id: string) {
    setForm((f) => ({ ...f, actionItems: f.actionItems.filter((a) => a.id !== id) }));
  }
  function updateActionItem(id: string, field: keyof ActionItem, val: string) {
    setForm((f) => ({ ...f, actionItems: f.actionItems.map((a) => a.id === id ? { ...a, [field]: val } : a) }));
  }

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              New Fire Risk Assessment
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              5-step FSO 2005 compliant assessment process
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-0">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = step > s.id;
                const isCurrent = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          isCompleted
                            ? 'text-white'
                            : isCurrent
                            ? 'text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                        style={
                          isCompleted || isCurrent
                            ? { backgroundColor: isCompleted ? '#10B981' : '#F04B5A' }
                            : undefined
                        }
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <p className="text-xs mt-1 text-center max-w-[80px] leading-tight hidden md:block text-gray-600 dark:text-gray-400 font-medium">
                        {s.title}
                      </p>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-2"
                        style={{ backgroundColor: step > s.id ? '#10B981' : '#E5E7EB' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step Content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#FEE2E4' }}
                >
                  <StepIcon className="h-5 w-5" style={{ color: '#F04B5A' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Step {step}: {currentStep.title}
                  </h2>
                  <p className="text-sm text-gray-500">{currentStep.description}</p>
                </div>
              </div>

              {/* STEP 1: Identify Fire Hazards */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Premises *</Label>
                      <Select
                        value={form.premisesId}
                        onChange={(e) => setForm((f) => ({ ...f, premisesId: e.target.value }))}
                      >
                        <option value="">Select premises...</option>
                        {premises.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Assessment Date</Label>
                      <Input
                        type="date"
                        value={form.assessmentDate}
                        onChange={(e) => setForm((f) => ({ ...f, assessmentDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Assessor Name *</Label>
                      <Input
                        value={form.assessorName}
                        onChange={(e) => setForm((f) => ({ ...f, assessorName: e.target.value }))}
                        placeholder="Full name of assessor"
                      />
                    </div>
                    <div>
                      <Label>Assessor Role</Label>
                      <Input
                        value={form.assessorRole}
                        onChange={(e) => setForm((f) => ({ ...f, assessorRole: e.target.value }))}
                        placeholder="e.g. Fire Safety Officer"
                      />
                    </div>
                  </div>

                  {/* Ignition Sources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Sources of Ignition
                      </h3>
                      <Button size="sm" variant="outline" onClick={addIgnitionSource}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.ignitionSources.map((src) => (
                        <div key={src.id} className="grid grid-cols-3 gap-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                          <Input
                            value={src.source}
                            onChange={(e) => updateIgnitionSource(src.id, 'source', e.target.value)}
                            placeholder="Ignition source"
                          />
                          <Input
                            value={src.location}
                            onChange={(e) => updateIgnitionSource(src.id, 'location', e.target.value)}
                            placeholder="Location"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={src.controlMeasure}
                              onChange={(e) => updateIgnitionSource(src.id, 'controlMeasure', e.target.value)}
                              placeholder="Control measure"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeIgnitionSource(src.id)}
                              className="flex-shrink-0 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Sources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Sources of Fuel
                      </h3>
                      <Button size="sm" variant="outline" onClick={addFuelSource}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.fuelSources.map((src) => (
                        <div key={src.id} className="grid grid-cols-3 gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                          <Input
                            value={src.material}
                            onChange={(e) => updateFuelSource(src.id, 'material', e.target.value)}
                            placeholder="Fuel material"
                          />
                          <Input
                            value={src.location}
                            onChange={(e) => updateFuelSource(src.id, 'location', e.target.value)}
                            placeholder="Location"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={src.controlMeasure}
                              onChange={(e) => updateFuelSource(src.id, 'controlMeasure', e.target.value)}
                              placeholder="Control measure"
                            />
                            <Button size="sm" variant="outline" onClick={() => removeFuelSource(src.id)} className="flex-shrink-0 text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Oxygen Sources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Sources of Oxygen
                      </h3>
                      <Button size="sm" variant="outline" onClick={addOxygenSource}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.oxygenSources.map((src) => (
                        <div key={src.id} className="grid grid-cols-3 gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <Input
                            value={src.source}
                            onChange={(e) => updateOxygenSource(src.id, 'source', e.target.value)}
                            placeholder="Oxygen source"
                          />
                          <Input
                            value={src.location}
                            onChange={(e) => updateOxygenSource(src.id, 'location', e.target.value)}
                            placeholder="Location"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={src.controlMeasure}
                              onChange={(e) => updateOxygenSource(src.id, 'controlMeasure', e.target.value)}
                              placeholder="Control measure"
                            />
                            <Button size="sm" variant="outline" onClick={() => removeOxygenSource(src.id)} className="flex-shrink-0 text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={form.step1Notes}
                      onChange={(e) => setForm((f) => ({ ...f, step1Notes: e.target.value }))}
                      rows={3}
                      placeholder="Any additional notes on fire hazards..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: People at Risk */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Estimated Occupants</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.estimatedOccupants}
                        onChange={(e) => setForm((f) => ({ ...f, estimatedOccupants: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Person Groups at Risk</h3>
                      <Button size="sm" variant="outline" onClick={addPersonGroup}>
                        <Plus className="h-3 w-3 mr-1" /> Add Group
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {form.personGroups.map((grp) => (
                        <div key={grp.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <Label>Group / Category</Label>
                              <Input
                                value={grp.group}
                                onChange={(e) => updatePersonGroup(grp.id, 'group', e.target.value)}
                                placeholder="e.g. Employees, Visitors"
                              />
                            </div>
                            <div>
                              <Label>Count</Label>
                              <Input
                                type="number"
                                min={0}
                                value={grp.count}
                                onChange={(e) => updatePersonGroup(grp.id, 'count', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Location / Area</Label>
                              <Input
                                value={grp.location}
                                onChange={(e) => updatePersonGroup(grp.id, 'location', e.target.value)}
                                placeholder="Where are they located?"
                              />
                            </div>
                            <div>
                              <Label>Vulnerabilities</Label>
                              <Input
                                value={grp.vulnerabilities}
                                onChange={(e) => updatePersonGroup(grp.id, 'vulnerabilities', e.target.value)}
                                placeholder="Any special vulnerabilities?"
                              />
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => removePersonGroup(grp.id)} className="text-red-500">
                            <Trash2 className="h-3 w-3 mr-1" /> Remove Group
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Vulnerable Persons Summary</Label>
                    <Textarea
                      value={form.vulnerablePersons}
                      onChange={(e) => setForm((f) => ({ ...f, vulnerablePersons: e.target.value }))}
                      rows={3}
                      placeholder="Describe any vulnerable persons: mobility impairments, visual/hearing impairments, lone workers, etc."
                    />
                  </div>
                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={form.step2Notes}
                      onChange={(e) => setForm((f) => ({ ...f, step2Notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Evaluate & Control */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* 5x5 Risk Matrix */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Matrix (5x5)</h3>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label>Likelihood (1-5)</Label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={form.riskLikelihood}
                          onChange={(e) => setForm((f) => ({ ...f, riskLikelihood: parseInt(e.target.value) }))}
                          className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 Rare</span><span>2 Unlikely</span><span>3 Possible</span><span>4 Likely</span><span>5 Almost Certain</span>
                        </div>
                        <p className="text-center mt-2 font-bold text-lg">{form.riskLikelihood}</p>
                      </div>
                      <div>
                        <Label>Severity (1-5)</Label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={form.riskSeverity}
                          onChange={(e) => setForm((f) => ({ ...f, riskSeverity: parseInt(e.target.value) }))}
                          className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 Negligible</span><span>2 Minor</span><span>3 Moderate</span><span>4 Major</span><span>5 Catastrophic</span>
                        </div>
                        <p className="text-center mt-2 font-bold text-lg">{form.riskSeverity}</p>
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Computed Overall Risk Rating</p>
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-lg"
                        style={{ backgroundColor: computedRisk === 'LOW' ? '#10B981' : computedRisk === 'MEDIUM' ? '#F59E0B' : computedRisk === 'HIGH' ? '#F97316' : '#DC2626' }}>
                        {computedRisk.replace(/_/g, ' ')}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Likelihood {form.riskLikelihood} × Severity {form.riskSeverity}</p>
                    </div>
                  </div>

                  {/* Precautions Table */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Fire Precautions</h3>
                    <div className="space-y-3">
                      {form.precautions.map((prec) => (
                        <div key={prec.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{prec.category}</h4>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prec.inPlace}
                                onChange={(e) => updatePrecaution(prec.id, 'inPlace', e.target.checked)}
                                className="h-4 w-4 rounded"
                              />
                              <span className="text-sm">In place</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={prec.description}
                                onChange={(e) => updatePrecaution(prec.id, 'description', e.target.value)}
                                placeholder="Describe current provision..."
                              />
                            </div>
                            <div>
                              <Label>Adequacy</Label>
                              <Select
                                value={prec.adequacy}
                                onChange={(e) => updatePrecaution(prec.id, 'adequacy', e.target.value)}
                              >
                                <option value="ADEQUATE">Adequate</option>
                                <option value="IMPROVEMENT_NEEDED">Improvement Needed</option>
                                <option value="INADEQUATE">Inadequate</option>
                                <option value="NOT_APPLICABLE">N/A</option>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label>Action Required</Label>
                              <Input
                                value={prec.action}
                                onChange={(e) => updatePrecaution(prec.id, 'action', e.target.value)}
                                placeholder="What action is needed?"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={form.step3Notes}
                      onChange={(e) => setForm((f) => ({ ...f, step3Notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Record & Plan */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label>Findings Summary *</Label>
                    <Textarea
                      value={form.findingsSummary}
                      onChange={(e) => setForm((f) => ({ ...f, findingsSummary: e.target.value }))}
                      rows={5}
                      placeholder="Summarise the main findings of the fire risk assessment..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Action Plan</h3>
                      <Button size="sm" variant="outline" onClick={addActionItem}>
                        <Plus className="h-3 w-3 mr-1" /> Add Action
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {form.actionItems.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Finding / Issue</Label>
                              <Input
                                value={item.finding}
                                onChange={(e) => updateActionItem(item.id, 'finding', e.target.value)}
                                placeholder="Describe the finding..."
                              />
                            </div>
                            <div>
                              <Label>Action Required</Label>
                              <Input
                                value={item.action}
                                onChange={(e) => updateActionItem(item.id, 'action', e.target.value)}
                                placeholder="What needs to be done?"
                              />
                            </div>
                            <div>
                              <Label>Responsible Person</Label>
                              <Input
                                value={item.responsible}
                                onChange={(e) => updateActionItem(item.id, 'responsible', e.target.value)}
                                placeholder="Who is responsible?"
                              />
                            </div>
                            <div>
                              <Label>Due Date</Label>
                              <Input
                                type="date"
                                value={item.dueDate}
                                onChange={(e) => updateActionItem(item.id, 'dueDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select
                                value={item.priority}
                                onChange={(e) => updateActionItem(item.id, 'priority', e.target.value)}
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                              </Select>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => removeActionItem(item.id)} className="mt-3 text-red-500">
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={form.step4Notes}
                      onChange={(e) => setForm((f) => ({ ...f, step4Notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Sign-off */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Review Interval (months)</Label>
                      <Select
                        value={form.reviewInterval}
                        onChange={(e) => setForm((f) => ({ ...f, reviewInterval: e.target.value }))}
                      >
                        <option value="6">6 months</option>
                        <option value="12">12 months (annual)</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Next Review Date</Label>
                      <Input
                        type="date"
                        value={form.nextReviewDate}
                        onChange={(e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value, reviewDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: '#FEF9C3', borderColor: '#FDE047' }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">Assessment Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Premises:</span>{' '}
                        <span className="font-medium">
                          {premises.find((p) => p.id === form.premisesId)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Assessor:</span>{' '}
                        <span className="font-medium">{form.assessorName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Assessment Date:</span>{' '}
                        <span className="font-medium">
                          {form.assessmentDate ? new Date(form.assessmentDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Overall Risk:</span>{' '}
                        <span
                          className="font-bold px-2 py-0.5 rounded text-white text-xs"
                          style={{
                            backgroundColor:
                              form.overallRiskRating === 'LOW' ? '#10B981' :
                              form.overallRiskRating === 'MEDIUM' ? '#F59E0B' :
                              form.overallRiskRating === 'HIGH' ? '#F97316' : '#DC2626',
                          }}
                        >
                          {form.overallRiskRating.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ignition Sources:</span>{' '}
                        <span className="font-medium">{form.ignitionSources.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Action Items:</span>{' '}
                        <span className="font-medium">{form.actionItems.filter((a) => a.finding).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sign-off</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Responsible Person Name *</Label>
                        <Input
                          value={form.signOffName}
                          onChange={(e) => setForm((f) => ({ ...f, signOffName: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Role / Position</Label>
                        <Input
                          value={form.signOffRole}
                          onChange={(e) => setForm((f) => ({ ...f, signOffRole: e.target.value }))}
                          placeholder="e.g. Managing Director"
                        />
                      </div>
                      <div>
                        <Label>Sign-off Date *</Label>
                        <Input
                          type="date"
                          value={form.signOffDate}
                          onChange={(e) => setForm((f) => ({ ...f, signOffDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Additional Notes / Caveats</Label>
                      <Textarea
                        value={form.additionalNotes}
                        onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="text-white"
                style={{ backgroundColor: '#F04B5A' }}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving || !canProceed()}
                className="text-white"
                style={{ backgroundColor: '#F04B5A' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Complete FRA
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
