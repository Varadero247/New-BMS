'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Input, Label, Select, Textarea } from '@ims/ui';
import {
  BookOpen,
  Users,
  BarChart2,
  RefreshCw,
  MessageSquare,
  Zap,
  CheckSquare,
  Loader2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

const TABS = [
  { id: 'overview', label: 'Plan Overview', icon: BookOpen },
  { id: 'crisis-team', label: 'Crisis Team', icon: Users },
  { id: 'bia', label: 'Business Impact Analysis', icon: BarChart2 },
  { id: 'recovery', label: 'Recovery Strategies', icon: RefreshCw },
  { id: 'communication', label: 'Communication Plans', icon: MessageSquare },
  { id: 'activation', label: 'Activation & Deactivation', icon: Zap },
  { id: 'review', label: 'Review & Approval', icon: CheckSquare },
] as const;

type TabId = typeof TABS[number]['id'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface CrisisTeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  backup: string;
}

interface BIAItem {
  id: string;
  process: string;
  rto: string;
  rpo: string;
  impact: string;
  priority: string;
}

interface RecoveryStrategy {
  id: string;
  scenario: string;
  strategy: string;
  resources: string;
  timeline: string;
}

interface CommChannel {
  id: string;
  audience: string;
  method: string;
  responsible: string;
  timing: string;
  template: string;
}

interface BCPForm {
  premisesId: string;
  title: string;
  scope: string;
  objectives: string;
  version: string;
  ownerName: string;
  ownerRole: string;
  crisisTeam: CrisisTeamMember[];
  biaItems: BIAItem[];
  recoveryStrategies: RecoveryStrategy[];
  commChannels: CommChannel[];
  activationTriggers: string;
  activationProcedure: string;
  deactivationCriteria: string;
  deactivationProcedure: string;
  reviewFrequency: string;
  nextReviewDate: string;
  approverName: string;
  approverRole: string;
  approvalDate: string;
  testingSchedule: string;
  notes: string;
}

export default function BCPNewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const [form, setForm] = useState<BCPForm>({
    premisesId: '',
    title: '',
    scope: '',
    objectives: '',
    version: '1.0',
    ownerName: '',
    ownerRole: '',
    crisisTeam: [
      { id: uid(), name: '', role: 'Crisis Director', phone: '', email: '', backup: '' },
      { id: uid(), name: '', role: 'Operations Lead', phone: '', email: '', backup: '' },
      { id: uid(), name: '', role: 'Communications Lead', phone: '', email: '', backup: '' },
    ],
    biaItems: [
      { id: uid(), process: '', rto: '', rpo: '', impact: '', priority: 'HIGH' },
    ],
    recoveryStrategies: [
      { id: uid(), scenario: '', strategy: '', resources: '', timeline: '' },
    ],
    commChannels: [
      { id: uid(), audience: 'Staff', method: 'Email / SMS', responsible: '', timing: 'Immediately on activation', template: '' },
      { id: uid(), audience: 'Customers', method: 'Email', responsible: '', timing: 'Within 2 hours', template: '' },
      { id: uid(), audience: 'Media', method: 'Press Release', responsible: '', timing: 'As required', template: '' },
    ],
    activationTriggers: '',
    activationProcedure: '',
    deactivationCriteria: '',
    deactivationProcedure: '',
    reviewFrequency: '12',
    nextReviewDate: '',
    approverName: '',
    approverRole: '',
    approvalDate: new Date().toISOString().split('T')[0],
    testingSchedule: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/premises').then((r) => setPremises(r.data.data || [])).catch(() => {});
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    setForm((f) => ({ ...f, nextReviewDate: d.toISOString().split('T')[0] }));
  }, []);

  async function handleSave() {
    if (!form.title || !form.ownerName) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/bcp', form);
      router.push('/bcp');
    } catch (e: unknown) {
      setError(e.response?.data?.error || 'Failed to save BCP. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addCrisisTeamMember() {
    setForm((f) => ({ ...f, crisisTeam: [...f.crisisTeam, { id: uid(), name: '', role: '', phone: '', email: '', backup: '' }] }));
  }
  function removeCrisisTeamMember(id: string) {
    setForm((f) => ({ ...f, crisisTeam: f.crisisTeam.filter((m) => m.id !== id) }));
  }
  function updateCrisisTeamMember(id: string, field: keyof CrisisTeamMember, val: string) {
    setForm((f) => ({ ...f, crisisTeam: f.crisisTeam.map((m) => m.id === id ? { ...m, [field]: val } : m) }));
  }

  function addBIAItem() {
    setForm((f) => ({ ...f, biaItems: [...f.biaItems, { id: uid(), process: '', rto: '', rpo: '', impact: '', priority: 'MEDIUM' }] }));
  }
  function removeBIAItem(id: string) {
    setForm((f) => ({ ...f, biaItems: f.biaItems.filter((b) => b.id !== id) }));
  }
  function updateBIAItem(id: string, field: keyof BIAItem, val: string) {
    setForm((f) => ({ ...f, biaItems: f.biaItems.map((b) => b.id === id ? { ...b, [field]: val } : b) }));
  }

  function addRecoveryStrategy() {
    setForm((f) => ({ ...f, recoveryStrategies: [...f.recoveryStrategies, { id: uid(), scenario: '', strategy: '', resources: '', timeline: '' }] }));
  }
  function removeRecoveryStrategy(id: string) {
    setForm((f) => ({ ...f, recoveryStrategies: f.recoveryStrategies.filter((s) => s.id !== id) }));
  }
  function updateRecoveryStrategy(id: string, field: keyof RecoveryStrategy, val: string) {
    setForm((f) => ({ ...f, recoveryStrategies: f.recoveryStrategies.map((s) => s.id === id ? { ...s, [field]: val } : s) }));
  }

  function updateCommChannel(id: string, field: keyof CommChannel, val: string) {
    setForm((f) => ({ ...f, commChannels: f.commChannels.map((c) => c.id === id ? { ...c, [field]: val } : c) }));
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Business Continuity Plan</h1>
            <p className="text-sm text-gray-500">ISO 22301 aligned BCP builder</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/bcp')}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title || !form.ownerName}
              className="text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
              ) : (
                'Save BCP'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex">
          {/* Left tab nav */}
          <div className="w-56 border-r border-gray-200 dark:border-gray-700 p-4 min-h-[calc(100vh-73px)] bg-gray-50 dark:bg-gray-900/50">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: '#F04B5A' } : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab content */}
          <div className="flex-1 p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Plan Overview</h2>
                <div>
                  <Label>Plan Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. IT Systems Failure Business Continuity Plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Premises</Label>
                    <Select value={form.premisesId} onChange={(e) => setForm((f) => ({ ...f, premisesId: e.target.value }))}>
                      <option value="">All Premises</option>
                      {premises.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <Input
                      value={form.version}
                      onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                      placeholder="1.0"
                    />
                  </div>
                  <div>
                    <Label>Plan Owner Name *</Label>
                    <Input
                      value={form.ownerName}
                      onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Owner Role</Label>
                    <Input
                      value={form.ownerRole}
                      onChange={(e) => setForm((f) => ({ ...f, ownerRole: e.target.value }))}
                      placeholder="e.g. Operations Director"
                    />
                  </div>
                </div>
                <div>
                  <Label>Scope</Label>
                  <Textarea
                    value={form.scope}
                    onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
                    rows={3}
                    placeholder="What does this BCP cover? Which departments, systems, processes?"
                  />
                </div>
                <div>
                  <Label>Objectives</Label>
                  <Textarea
                    value={form.objectives}
                    onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))}
                    rows={3}
                    placeholder="What are the key objectives of this plan?"
                  />
                </div>
              </div>
            )}

            {activeTab === 'crisis-team' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Crisis Management Team</h2>
                  <Button size="sm" variant="outline" onClick={addCrisisTeamMember}>
                    <Plus className="h-3 w-3 mr-1" /> Add Member
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.crisisTeam.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Full Name</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateCrisisTeamMember(member.id, 'name', e.target.value)}
                              placeholder="Name"
                            />
                          </div>
                          <div>
                            <Label>Crisis Role</Label>
                            <Input
                              value={member.role}
                              onChange={(e) => updateCrisisTeamMember(member.id, 'role', e.target.value)}
                              placeholder="e.g. Crisis Director"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={member.phone}
                              onChange={(e) => updateCrisisTeamMember(member.id, 'phone', e.target.value)}
                              placeholder="Mobile number"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateCrisisTeamMember(member.id, 'email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Backup Person</Label>
                            <Input
                              value={member.backup}
                              onChange={(e) => updateCrisisTeamMember(member.id, 'backup', e.target.value)}
                              placeholder="Name and contact of backup"
                            />
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeCrisisTeamMember(member.id)} className="mt-3 text-red-500">
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bia' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Business Impact Analysis</h2>
                  <Button size="sm" variant="outline" onClick={addBIAItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add Process
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.biaItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Business Process</Label>
                            <Input
                              value={item.process}
                              onChange={(e) => updateBIAItem(item.id, 'process', e.target.value)}
                              placeholder="e.g. Order Processing"
                            />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select value={item.priority} onChange={(e) => updateBIAItem(item.id, 'priority', e.target.value)}>
                              <option value="CRITICAL">Critical</option>
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                            </Select>
                          </div>
                          <div>
                            <Label>RTO (Recovery Time Objective)</Label>
                            <Input
                              value={item.rto}
                              onChange={(e) => updateBIAItem(item.id, 'rto', e.target.value)}
                              placeholder="e.g. 4 hours"
                            />
                          </div>
                          <div>
                            <Label>RPO (Recovery Point Objective)</Label>
                            <Input
                              value={item.rpo}
                              onChange={(e) => updateBIAItem(item.id, 'rpo', e.target.value)}
                              placeholder="e.g. 24 hours"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Impact if Disrupted</Label>
                            <Textarea
                              value={item.impact}
                              onChange={(e) => updateBIAItem(item.id, 'impact', e.target.value)}
                              rows={2}
                              placeholder="Financial, reputational, legal or operational impact..."
                            />
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeBIAItem(item.id)} className="mt-3 text-red-500">
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recovery' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recovery Strategies</h2>
                  <Button size="sm" variant="outline" onClick={addRecoveryStrategy}>
                    <Plus className="h-3 w-3 mr-1" /> Add Strategy
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.recoveryStrategies.map((strat) => (
                    <Card key={strat.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Scenario / Disruption Type</Label>
                            <Input
                              value={strat.scenario}
                              onChange={(e) => updateRecoveryStrategy(strat.id, 'scenario', e.target.value)}
                              placeholder="e.g. Loss of primary office"
                            />
                          </div>
                          <div>
                            <Label>Recovery Timeline</Label>
                            <Input
                              value={strat.timeline}
                              onChange={(e) => updateRecoveryStrategy(strat.id, 'timeline', e.target.value)}
                              placeholder="e.g. Within 4 hours"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Recovery Strategy</Label>
                            <Textarea
                              value={strat.strategy}
                              onChange={(e) => updateRecoveryStrategy(strat.id, 'strategy', e.target.value)}
                              rows={3}
                              placeholder="Describe the recovery strategy..."
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Resources Required</Label>
                            <Input
                              value={strat.resources}
                              onChange={(e) => updateRecoveryStrategy(strat.id, 'resources', e.target.value)}
                              placeholder="People, systems, equipment needed"
                            />
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeRecoveryStrategy(strat.id)} className="mt-3 text-red-500">
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="max-w-4xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Communication Plans</h2>
                <div className="space-y-4">
                  {form.commChannels.map((ch) => (
                    <Card key={ch.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Audience</Label>
                            <Input
                              value={ch.audience}
                              onChange={(e) => updateCommChannel(ch.id, 'audience', e.target.value)}
                              placeholder="e.g. Staff, Customers"
                            />
                          </div>
                          <div>
                            <Label>Communication Method</Label>
                            <Input
                              value={ch.method}
                              onChange={(e) => updateCommChannel(ch.id, 'method', e.target.value)}
                              placeholder="e.g. Email, SMS, Phone"
                            />
                          </div>
                          <div>
                            <Label>Responsible Person</Label>
                            <Input
                              value={ch.responsible}
                              onChange={(e) => updateCommChannel(ch.id, 'responsible', e.target.value)}
                              placeholder="Who sends communications?"
                            />
                          </div>
                          <div>
                            <Label>Timing</Label>
                            <Input
                              value={ch.timing}
                              onChange={(e) => updateCommChannel(ch.id, 'timing', e.target.value)}
                              placeholder="e.g. Within 2 hours of activation"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Message Template</Label>
                            <Textarea
                              value={ch.template}
                              onChange={(e) => updateCommChannel(ch.id, 'template', e.target.value)}
                              rows={3}
                              placeholder="Draft message template..."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activation' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Activation & Deactivation</h2>
                <div>
                  <Label>Activation Triggers</Label>
                  <Textarea
                    value={form.activationTriggers}
                    onChange={(e) => setForm((f) => ({ ...f, activationTriggers: e.target.value }))}
                    rows={3}
                    placeholder="Under what circumstances should this BCP be activated?"
                  />
                </div>
                <div>
                  <Label>Activation Procedure</Label>
                  <Textarea
                    value={form.activationProcedure}
                    onChange={(e) => setForm((f) => ({ ...f, activationProcedure: e.target.value }))}
                    rows={4}
                    placeholder="Step-by-step activation procedure..."
                  />
                </div>
                <div>
                  <Label>Deactivation Criteria</Label>
                  <Textarea
                    value={form.deactivationCriteria}
                    onChange={(e) => setForm((f) => ({ ...f, deactivationCriteria: e.target.value }))}
                    rows={3}
                    placeholder="When can this BCP be stood down?"
                  />
                </div>
                <div>
                  <Label>Deactivation Procedure</Label>
                  <Textarea
                    value={form.deactivationProcedure}
                    onChange={(e) => setForm((f) => ({ ...f, deactivationProcedure: e.target.value }))}
                    rows={4}
                    placeholder="Step-by-step deactivation / stand-down procedure..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Review & Approval</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Review Frequency</Label>
                    <Select
                      value={form.reviewFrequency}
                      onChange={(e) => setForm((f) => ({ ...f, reviewFrequency: e.target.value }))}
                    >
                      <option value="6">Every 6 months</option>
                      <option value="12">Annually</option>
                      <option value="24">Every 2 years</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Next Review Date</Label>
                    <Input
                      type="date"
                      value={form.nextReviewDate}
                      onChange={(e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Testing Schedule</Label>
                    <Input
                      value={form.testingSchedule}
                      onChange={(e) => setForm((f) => ({ ...f, testingSchedule: e.target.value }))}
                      placeholder="e.g. Desktop exercise annually"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sign-off</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Approver Name</Label>
                      <Input
                        value={form.approverName}
                        onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Approver Role</Label>
                      <Input
                        value={form.approverRole}
                        onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))}
                        placeholder="e.g. Chief Executive"
                      />
                    </div>
                    <div>
                      <Label>Approval Date</Label>
                      <Input
                        type="date"
                        value={form.approvalDate}
                        onChange={(e) => setForm((f) => ({ ...f, approvalDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.ownerName}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: '#F04B5A' }}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                  ) : (
                    'Save Business Continuity Plan'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
