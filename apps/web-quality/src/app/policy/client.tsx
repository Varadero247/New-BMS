'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Save,
  Download,
  Printer,
  CheckCircle,
  Clock,
  History,
  Users,
  Target,
  Megaphone,
  PenLine,
  UserCheck,
  UserX,
  Plus,
  X,
  FileText,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type PolicyStatus = 'DRAFT' | 'APPROVED';

interface Signatory {
  id: string;
  name: string;
  role: string;
  signedAt: string;
}

interface Acknowledgement {
  id: string;
  name: string;
  department: string;
  acknowledged: boolean;
  acknowledgedAt: string;
}

interface CommunicationEntry {
  id: string;
  method: string;
  audience: string;
  frequency: string;
}

interface PolicyVersion {
  version: string;
  status: PolicyStatus;
  policyStatement: string;
  objectivesAlignment: string;
  communicationPlan: CommunicationEntry[];
  signatories: Signatory[];
  acknowledgements: Acknowledgement[];
  updatedAt: string;
}

// ─── Storage & Helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'ims_quality_policy';
const VERSIONS_KEY = 'ims_quality_policy_versions';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(iso: string): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const defaultPolicy: PolicyVersion = {
  version: '1.0',
  status: 'DRAFT',
  policyStatement: '',
  objectivesAlignment: '',
  communicationPlan: [],
  signatories: [],
  acknowledgements: [],
  updatedAt: new Date().toISOString(),
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PolicyPage() {
  const [policy, setPolicy] = useState<PolicyVersion>(defaultPolicy);
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [saved, setSaved] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('statement');

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPolicy(JSON.parse(stored));
      const storedVersions = localStorage.getItem(VERSIONS_KEY);
      if (storedVersions) setVersions(JSON.parse(storedVersions));
    } catch { /* ignore */ }
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const updated = { ...policy, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPolicy(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [policy]);

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = useCallback(() => {
    const approved: PolicyVersion = { ...policy, status: 'APPROVED', updatedAt: new Date().toISOString() };
    const newVersions = [approved, ...versions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(newVersions));
    setPolicy(approved);
    setVersions(newVersions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [policy, versions]);

  // ── New Draft ────────────────────────────────────────────────────────────
  const handleNewDraft = useCallback(() => {
    const parts = policy.version.split('.');
    const major = parseInt(parts[0] || '1', 10);
    setPolicy(prev => ({ ...prev, version: `${major + 1}.0`, status: 'DRAFT', updatedAt: new Date().toISOString() }));
  }, [policy.version]);

  // ── Restore ──────────────────────────────────────────────────────────────
  const handleRestore = useCallback((v: PolicyVersion) => {
    const restored = { ...v, status: 'DRAFT' as PolicyStatus, updatedAt: new Date().toISOString() };
    setPolicy(restored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    setShowVersions(false);
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const lines: string[] = [];
    lines.push('ISO 9001:2015 -- Clause 5.2 -- Quality Policy');
    lines.push(`Version: ${policy.version} | Status: ${policy.status}`);
    lines.push(`Date: ${formatDate(policy.updatedAt)}`);
    lines.push('');
    lines.push('=== POLICY STATEMENT ===');
    lines.push(policy.policyStatement || '(not defined)');
    lines.push('');
    lines.push('=== QUALITY OBJECTIVES ALIGNMENT ===');
    lines.push(policy.objectivesAlignment || '(not defined)');
    lines.push('');
    lines.push('=== COMMUNICATION PLAN ===');
    if (policy.communicationPlan.length === 0) lines.push('  (none)');
    policy.communicationPlan.forEach(c => lines.push(`  ${c.method} | Audience: ${c.audience} | Frequency: ${c.frequency}`));
    lines.push('');
    lines.push('=== SIGNATORIES ===');
    if (policy.signatories.length === 0) lines.push('  (none)');
    policy.signatories.forEach(s => lines.push(`  ${s.name} (${s.role}) -- Signed: ${formatDate(s.signedAt)}`));
    lines.push('');
    lines.push('=== ACKNOWLEDGEMENT STATUS ===');
    const acked = policy.acknowledgements.filter(a => a.acknowledged).length;
    const total = policy.acknowledgements.length;
    lines.push(`  ${acked}/${total} acknowledged`);
    policy.acknowledgements.forEach(a => lines.push(`  [${a.acknowledged ? 'YES' : 'NO'}] ${a.name} (${a.department})${a.acknowledged ? ' -- ' + formatDate(a.acknowledgedAt) : ''}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality-policy-v${policy.version}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [policy]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  // ── Signatory helpers ────────────────────────────────────────────────────
  const addSignatory = () => setPolicy(p => ({ ...p, signatories: [...p.signatories, { id: newId(), name: '', role: '', signedAt: '' }] }));
  const removeSignatory = (id: string) => setPolicy(p => ({ ...p, signatories: p.signatories.filter(s => s.id !== id) }));
  const updateSignatory = (id: string, field: keyof Signatory, value: string) =>
    setPolicy(p => ({ ...p, signatories: p.signatories.map(s => s.id === id ? { ...s, [field]: value } : s) }));
  const markSigned = (id: string) =>
    setPolicy(p => ({ ...p, signatories: p.signatories.map(s => s.id === id ? { ...s, signedAt: new Date().toISOString() } : s) }));

  // ── Acknowledgement helpers ──────────────────────────────────────────────
  const addAcknowledgement = () => setPolicy(p => ({ ...p, acknowledgements: [...p.acknowledgements, { id: newId(), name: '', department: '', acknowledged: false, acknowledgedAt: '' }] }));
  const removeAcknowledgement = (id: string) => setPolicy(p => ({ ...p, acknowledgements: p.acknowledgements.filter(a => a.id !== id) }));
  const updateAcknowledgement = (id: string, field: string, value: string | boolean) =>
    setPolicy(p => ({ ...p, acknowledgements: p.acknowledgements.map(a => a.id === id ? { ...a, [field]: value } : a) }));
  const toggleAcknowledged = (id: string) =>
    setPolicy(p => ({
      ...p,
      acknowledgements: p.acknowledgements.map(a =>
        a.id === id ? { ...a, acknowledged: !a.acknowledged, acknowledgedAt: !a.acknowledged ? new Date().toISOString() : '' } : a
      ),
    }));

  // ── Communication plan helpers ───────────────────────────────────────────
  const addCommEntry = () => setPolicy(p => ({ ...p, communicationPlan: [...p.communicationPlan, { id: newId(), method: '', audience: '', frequency: '' }] }));
  const removeCommEntry = (id: string) => setPolicy(p => ({ ...p, communicationPlan: p.communicationPlan.filter(c => c.id !== id) }));
  const updateCommEntry = (id: string, field: keyof CommunicationEntry, value: string) =>
    setPolicy(p => ({ ...p, communicationPlan: p.communicationPlan.map(c => c.id === id ? { ...c, [field]: value } : c) }));

  // ── Derived stats ────────────────────────────────────────────────────────
  const ackedCount = policy.acknowledgements.filter(a => a.acknowledged).length;
  const totalAck = policy.acknowledgements.length;
  const signedCount = policy.signatories.filter(s => !!s.signedAt).length;
  const totalSigs = policy.signatories.length;

  // ── Sections ─────────────────────────────────────────────────────────────
  const sections = [
    { key: 'statement', label: 'Policy Statement', icon: PenLine },
    { key: 'objectives', label: 'Objectives Alignment', icon: Target },
    { key: 'communication', label: 'Communication Plan', icon: Megaphone },
    { key: 'signatories', label: 'Signatories', icon: UserCheck },
    { key: 'acknowledgements', label: 'Acknowledgements', icon: Users },
  ];

  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quality Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 9001:2015 &mdash; Clause 5.2 &mdash; Quality policy establishment, communication and maintenance
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            policy.status === 'APPROVED'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}>
            {policy.status === 'APPROVED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {policy.status} &mdash; v{policy.version}
          </span>
          <button onClick={() => setShowVersions(!showVersions)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <History className="h-4 w-4" />
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Printer className="h-4 w-4" />
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={handleSave} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            saved ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' : 'bg-card border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}>
            <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
          </button>
          {policy.status === 'DRAFT' && (
            <button onClick={handleApprove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
              <CheckCircle className="h-4 w-4" /> Approve
            </button>
          )}
          {policy.status === 'APPROVED' && (
            <button onClick={handleNewDraft} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              New Draft
            </button>
          )}
        </div>
      </div>

      {/* ── Version History ─────────────────────────────────────────────── */}
      {showVersions && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 print:hidden">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><History className="h-4 w-4" /> Version History</h3>
          {versions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No approved versions yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {versions.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border text-sm">
                  <span><strong className="text-foreground">v{v.version}</strong> <span className="text-muted-foreground ml-2">{formatDate(v.updatedAt)}</span></span>
                  <button onClick={() => handleRestore(v)} className="text-xs text-blue-600 hover:underline dark:text-blue-400">Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Print header ───────────────────────────────────────────────── */}
      <div className="hidden print:block mb-8">
        <h1 className="text-xl font-bold">Quality Policy</h1>
        <p className="text-sm text-gray-500">ISO 9001:2015 Clause 5.2 | Version {policy.version} | Status: {policy.status} | {formatDate(policy.updatedAt)}</p>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{totalSigs}</div>
          <div className="text-sm text-muted-foreground">Signatories</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{signedCount}/{totalSigs}</div>
          <div className="text-sm text-muted-foreground">Signed</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{totalAck}</div>
          <div className="text-sm text-muted-foreground">Staff to Acknowledge</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-600">{ackedCount}/{totalAck}</div>
          <div className="text-sm text-muted-foreground">Acknowledged</div>
        </div>
      </div>

      {/* ── Section Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border overflow-x-auto print:hidden">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === s.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Policy Statement ───────────────────────────────────────────── */}
      {activeSection === 'statement' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Policy Statement</h2>
          <p className="text-xs text-muted-foreground">
            The quality policy shall be appropriate to the purpose and context of the organisation, provide a framework for setting quality objectives,
            include a commitment to satisfy applicable requirements, and include a commitment to continual improvement of the QMS.
          </p>
          <textarea
            className="w-full min-h-[240px] text-sm border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={policy.policyStatement}
            onChange={e => setPolicy(p => ({ ...p, policyStatement: e.target.value }))}
            placeholder={"[Organisation Name] is committed to...\n\nOur quality policy establishes our commitment to:\n- Meeting customer and applicable statutory/regulatory requirements\n- Continual improvement of our quality management system\n- ..."}
          />
        </div>
      )}

      {/* ── Objectives Alignment ───────────────────────────────────────── */}
      {activeSection === 'objectives' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" /> Quality Objectives Alignment
          </h2>
          <p className="text-xs text-muted-foreground">
            Demonstrate how the quality policy provides a framework for setting and reviewing quality objectives (Clause 6.2).
          </p>
          <textarea
            className="w-full min-h-[180px] text-sm border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={policy.objectivesAlignment}
            onChange={e => setPolicy(p => ({ ...p, objectivesAlignment: e.target.value }))}
            placeholder={"Quality Objective 1: ...\nPolicy alignment: ...\n\nQuality Objective 2: ...\nPolicy alignment: ..."}
          />
          <a href="/objectives" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <Target className="h-4 w-4" /> View Quality Objectives Register
          </a>
        </div>
      )}

      {/* ── Communication Plan ─────────────────────────────────────────── */}
      {activeSection === 'communication' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-500" /> Communication Plan
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                How the quality policy is communicated, understood, and applied within the organisation (5.2.2).
              </p>
            </div>
            <button onClick={addCommEntry} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Entry
            </button>
          </div>
          {policy.communicationPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No communication methods defined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Method</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Audience</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Frequency</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {policy.communicationPlan.map(entry => (
                    <tr key={entry.id} className="group">
                      <td className="p-2">
                        <input type="text" className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500" value={entry.method} onChange={e => updateCommEntry(entry.id, 'method', e.target.value)} placeholder="e.g., Noticeboard, Induction, Email" />
                      </td>
                      <td className="p-2">
                        <input type="text" className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500" value={entry.audience} onChange={e => updateCommEntry(entry.id, 'audience', e.target.value)} placeholder="e.g., All staff, New starters" />
                      </td>
                      <td className="p-2">
                        <input type="text" className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500" value={entry.frequency} onChange={e => updateCommEntry(entry.id, 'frequency', e.target.value)} placeholder="e.g., On change, Annually" />
                      </td>
                      <td className="p-2">
                        <button onClick={() => removeCommEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Signatories ────────────────────────────────────────────────── */}
      {activeSection === 'signatories' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" /> Signatories (Top Management Sign-off)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Track top management approval of the quality policy.</p>
            </div>
            <button onClick={addSignatory} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Signatory
            </button>
          </div>
          {policy.signatories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No signatories added. Add top management representatives.</p>
          ) : (
            <div className="space-y-3">
              {policy.signatories.map(sig => (
                <div key={sig.id} className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                  <div className={`p-2 rounded-full ${sig.signedAt ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {sig.signedAt ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <input type="text" className="flex-1 text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500" value={sig.name} onChange={e => updateSignatory(sig.id, 'name', e.target.value)} placeholder="Full name" />
                  <input type="text" className="w-48 text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500" value={sig.role} onChange={e => updateSignatory(sig.id, 'role', e.target.value)} placeholder="Role / Title" />
                  {sig.signedAt ? (
                    <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">{formatDate(sig.signedAt)}</span>
                  ) : (
                    <button onClick={() => markSigned(sig.id)} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 transition-colors whitespace-nowrap">
                      Mark Signed
                    </button>
                  )}
                  <button onClick={() => removeSignatory(sig.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {totalSigs > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-1">
                <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${totalSigs > 0 ? (signedCount / totalSigs) * 100 : 0}%` }} />
              </div>
              <span>{signedCount}/{totalSigs} signed</span>
            </div>
          )}
        </div>
      )}

      {/* ── Acknowledgements ───────────────────────────────────────────── */}
      {activeSection === 'acknowledgements' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" /> Acknowledgement Tracking
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Track which personnel have acknowledged and understood the quality policy.</p>
            </div>
            <button onClick={addAcknowledgement} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Person
            </button>
          </div>

          {totalAck > 0 && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-background border border-border">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 flex-1">
                <div className="h-2.5 rounded-full bg-purple-500 transition-all" style={{ width: `${totalAck > 0 ? (ackedCount / totalAck) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">{ackedCount}/{totalAck}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><UserCheck className="h-3 w-3" /> Acknowledged</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><UserX className="h-3 w-3" /> {totalAck - ackedCount} pending</span>
            </div>
          )}

          {policy.acknowledgements.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No acknowledgements tracked. Add personnel who should acknowledge the policy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Department</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {policy.acknowledgements.map(ack => (
                    <tr key={ack.id} className="group">
                      <td className="p-2">
                        <input type="text" className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500" value={ack.name} onChange={e => updateAcknowledgement(ack.id, 'name', e.target.value)} placeholder="Full name" />
                      </td>
                      <td className="p-2">
                        <input type="text" className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500" value={ack.department} onChange={e => updateAcknowledgement(ack.id, 'department', e.target.value)} placeholder="Department" />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => toggleAcknowledged(ack.id)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          ack.acknowledged
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {ack.acknowledged ? <><CheckCircle className="h-3 w-3" /> Yes</> : <><UserX className="h-3 w-3" /> No</>}
                        </button>
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">{ack.acknowledgedAt ? formatDate(ack.acknowledgedAt) : '--'}</td>
                      <td className="p-2">
                        <button onClick={() => removeAcknowledgement(ack.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Footer bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 print:hidden">
        <span>Version: <strong className="text-foreground">{policy.version}</strong></span>
        <span>Status: <strong className="text-foreground">{policy.status}</strong></span>
        <span>Signatories: <strong className="text-foreground">{signedCount}/{totalSigs}</strong></span>
        <span>Acknowledged: <strong className="text-foreground">{ackedCount}/{totalAck}</strong></span>
        <span className="ml-auto">Last updated: {formatDate(policy.updatedAt)}</span>
      </div>
    </div>
  );
}
