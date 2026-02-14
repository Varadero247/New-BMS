'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Save,
  Download,
  Plus,
  X,
  FileText,
  CheckCircle,
  Clock,
  Building2,
  Link2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  History,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type ScopeStatus = 'DRAFT' | 'APPROVED';

interface ScopeInclusion {
  id: string;
  clause: string;
  description: string;
}

interface ScopeExclusion {
  id: string;
  clause: string;
  justification: string;
}

interface ApplicableSite {
  id: string;
  name: string;
  address: string;
  inScope: boolean;
}

interface ScopeVersion {
  version: string;
  status: ScopeStatus;
  statement: string;
  inclusions: ScopeInclusion[];
  exclusions: ScopeExclusion[];
  sites: ApplicableSite[];
  updatedAt: string;
  approvedBy: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ims_quality_scope';
const VERSIONS_KEY = 'ims_quality_scope_versions';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const defaultScope: ScopeVersion = {
  version: '1.0',
  status: 'DRAFT',
  statement: '',
  inclusions: [],
  exclusions: [],
  sites: [],
  updatedAt: new Date().toISOString(),
  approvedBy: '',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ScopePage() {
  const [scope, setScope] = useState<ScopeVersion>(defaultScope);
  const [versions, setVersions] = useState<ScopeVersion[]>([]);
  const [saved, setSaved] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('statement');

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setScope(JSON.parse(stored));
      const storedVersions = localStorage.getItem(VERSIONS_KEY);
      if (storedVersions) setVersions(JSON.parse(storedVersions));
    } catch { /* ignore */ }
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const updated = { ...scope, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setScope(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [scope]);

  // ── Approve (creates a new version snapshot) ─────────────────────────────
  const handleApprove = useCallback(() => {
    const approved: ScopeVersion = {
      ...scope,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };
    const newVersions = [approved, ...versions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(newVersions));
    setScope(approved);
    setVersions(newVersions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [scope, versions]);

  // ── New Draft from approved ──────────────────────────────────────────────
  const handleNewDraft = useCallback(() => {
    const parts = scope.version.split('.');
    const major = parseInt(parts[0] || '1', 10);
    const newVersion = `${major + 1}.0`;
    setScope(prev => ({ ...prev, version: newVersion, status: 'DRAFT', updatedAt: new Date().toISOString(), approvedBy: '' }));
  }, [scope.version]);

  // ── Restore version ──────────────────────────────────────────────────────
  const handleRestore = useCallback((v: ScopeVersion) => {
    const restored = { ...v, status: 'DRAFT' as ScopeStatus, updatedAt: new Date().toISOString() };
    setScope(restored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    setShowVersions(false);
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const lines: string[] = [];
    lines.push('ISO 9001:2015 -- Clause 4.3 -- Scope of the QMS');
    lines.push(`Version: ${scope.version} | Status: ${scope.status}`);
    lines.push(`Date: ${formatDate(scope.updatedAt)}`);
    if (scope.approvedBy) lines.push(`Approved By: ${scope.approvedBy}`);
    lines.push('');
    lines.push('=== SCOPE STATEMENT ===');
    lines.push(scope.statement || '(not defined)');
    lines.push('');
    lines.push('=== INCLUSIONS ===');
    if (scope.inclusions.length === 0) lines.push('  (none)');
    scope.inclusions.forEach(inc => lines.push(`  [${inc.clause}] ${inc.description}`));
    lines.push('');
    lines.push('=== EXCLUSIONS ===');
    if (scope.exclusions.length === 0) lines.push('  (none)');
    scope.exclusions.forEach(exc => lines.push(`  [${exc.clause}] Justification: ${exc.justification}`));
    lines.push('');
    lines.push('=== APPLICABLE SITES ===');
    if (scope.sites.length === 0) lines.push('  (none)');
    scope.sites.forEach(s => lines.push(`  ${s.inScope ? '[IN SCOPE]' : '[EXCLUDED]'} ${s.name} -- ${s.address}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qms-scope-v${scope.version}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scope]);

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Inclusion helpers ────────────────────────────────────────────────────
  const addInclusion = () => setScope(p => ({ ...p, inclusions: [...p.inclusions, { id: newId(), clause: '', description: '' }] }));
  const removeInclusion = (id: string) => setScope(p => ({ ...p, inclusions: p.inclusions.filter(i => i.id !== id) }));
  const updateInclusion = (id: string, field: keyof ScopeInclusion, value: string) =>
    setScope(p => ({ ...p, inclusions: p.inclusions.map(i => i.id === id ? { ...i, [field]: value } : i) }));

  // ── Exclusion helpers ────────────────────────────────────────────────────
  const addExclusion = () => setScope(p => ({ ...p, exclusions: [...p.exclusions, { id: newId(), clause: '', justification: '' }] }));
  const removeExclusion = (id: string) => setScope(p => ({ ...p, exclusions: p.exclusions.filter(e => e.id !== id) }));
  const updateExclusion = (id: string, field: keyof ScopeExclusion, value: string) =>
    setScope(p => ({ ...p, exclusions: p.exclusions.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  // ── Site helpers ─────────────────────────────────────────────────────────
  const addSite = () => setScope(p => ({ ...p, sites: [...p.sites, { id: newId(), name: '', address: '', inScope: true }] }));
  const removeSite = (id: string) => setScope(p => ({ ...p, sites: p.sites.filter(s => s.id !== id) }));
  const updateSite = (id: string, field: string, value: string | boolean) =>
    setScope(p => ({ ...p, sites: p.sites.map(s => s.id === id ? { ...s, [field]: value } : s) }));

  // ── Section nav ──────────────────────────────────────────────────────────
  const sections = [
    { key: 'statement', label: 'Scope Statement', icon: FileText },
    { key: 'inclusions', label: 'Inclusions', icon: CheckCircle },
    { key: 'exclusions', label: 'Exclusions', icon: AlertCircle },
    { key: 'sites', label: 'Applicable Sites', icon: Building2 },
    { key: 'links', label: 'Cross-references', icon: Link2 },
  ];

  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QMS Scope</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 9001:2015 &mdash; Clause 4.3 &mdash; Determining the scope of the quality management system
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            scope.status === 'APPROVED'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}>
            {scope.status === 'APPROVED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {scope.status} &mdash; v{scope.version}
          </span>
          <button onClick={() => setShowVersions(!showVersions)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <History className="h-4 w-4" />
            History
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Printer className="h-4 w-4" />
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={handleSave} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            saved ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' : 'bg-card border-border text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}>
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save Draft'}
          </button>
          {scope.status === 'DRAFT' && (
            <button onClick={handleApprove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}
          {scope.status === 'APPROVED' && (
            <button onClick={handleNewDraft} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              New Draft
            </button>
          )}
        </div>
      </div>

      {/* ── Version History Panel ──────────────────────────────────────── */}
      {showVersions && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 print:hidden">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="h-4 w-4" /> Version History ({versions.length} versions)
          </h3>
          {versions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No approved versions yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {versions.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border text-sm">
                  <div>
                    <span className="font-medium text-foreground">v{v.version}</span>
                    <span className="ml-2 text-muted-foreground">{formatDate(v.updatedAt)}</span>
                    {v.approvedBy && <span className="ml-2 text-muted-foreground">by {v.approvedBy}</span>}
                  </div>
                  <button onClick={() => handleRestore(v)} className="text-xs text-blue-600 hover:underline dark:text-blue-400">Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Print header ───────────────────────────────────────────────── */}
      <div className="hidden print:block mb-8">
        <h1 className="text-xl font-bold">QMS Scope Document</h1>
        <p className="text-sm text-gray-500">ISO 9001:2015 Clause 4.3 | Version {scope.version} | Status: {scope.status} | {formatDate(scope.updatedAt)}</p>
        {scope.approvedBy && <p className="text-sm text-gray-500">Approved by: {scope.approvedBy}</p>}
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
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Scope Statement ────────────────────────────────────────────── */}
      {(activeSection === 'statement' || typeof window !== 'undefined' && window.matchMedia?.('print')?.matches) && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Scope Statement</h2>
          <p className="text-xs text-muted-foreground">
            Define the boundaries and applicability of the QMS. Consider external and internal issues (4.1) and requirements of interested parties (4.2).
          </p>
          <textarea
            className="w-full min-h-[200px] text-sm border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={scope.statement}
            onChange={e => setScope(p => ({ ...p, statement: e.target.value }))}
            placeholder="The scope of the Quality Management System covers..."
          />
          {scope.status === 'DRAFT' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Approved By:</label>
              <input
                type="text"
                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={scope.approvedBy}
                onChange={e => setScope(p => ({ ...p, approvedBy: e.target.value }))}
                placeholder="Name of approving authority (e.g., Quality Director)"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Inclusions ─────────────────────────────────────────────────── */}
      {activeSection === 'inclusions' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Inclusions</h2>
              <p className="text-xs text-muted-foreground mt-1">ISO 9001 clauses and processes included within the QMS scope.</p>
            </div>
            <button onClick={addInclusion} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Inclusion
            </button>
          </div>
          {scope.inclusions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No inclusions defined. Click "Add Inclusion" to begin.</p>
          ) : (
            <div className="space-y-3">
              {scope.inclusions.map(inc => (
                <div key={inc.id} className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                  <input
                    type="text"
                    className="w-28 shrink-0 text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inc.clause}
                    onChange={e => updateInclusion(inc.id, 'clause', e.target.value)}
                    placeholder="Clause #"
                  />
                  <input
                    type="text"
                    className="flex-1 text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inc.description}
                    onChange={e => updateInclusion(inc.id, 'description', e.target.value)}
                    placeholder="Description of included scope element"
                  />
                  <button onClick={() => removeInclusion(inc.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity mt-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Exclusions ─────────────────────────────────────────────────── */}
      {activeSection === 'exclusions' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Exclusions</h2>
              <p className="text-xs text-muted-foreground mt-1">ISO 9001 clauses excluded from scope with justified rationale (must not affect conformity).</p>
            </div>
            <button onClick={addExclusion} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Exclusion
            </button>
          </div>
          {scope.exclusions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No exclusions. All ISO 9001 clauses are applicable.</p>
          ) : (
            <div className="space-y-3">
              {scope.exclusions.map(exc => (
                <div key={exc.id} className="group p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className="w-28 shrink-0 text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={exc.clause}
                      onChange={e => updateExclusion(exc.id, 'clause', e.target.value)}
                      placeholder="Clause #"
                    />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase">Excluded</span>
                    <button onClick={() => removeExclusion(exc.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    className="w-full text-sm border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={2}
                    value={exc.justification}
                    onChange={e => updateExclusion(exc.id, 'justification', e.target.value)}
                    placeholder="Justification for exclusion (must demonstrate no impact on product/service conformity or customer satisfaction)"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Applicable Sites ───────────────────────────────────────────── */}
      {activeSection === 'sites' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Applicable Sites</h2>
              <p className="text-xs text-muted-foreground mt-1">Physical locations and facilities covered by the QMS.</p>
            </div>
            <button onClick={addSite} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Site
            </button>
          </div>
          {scope.sites.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">No sites defined. Click "Add Site" to add locations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Site Name</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Address</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">In Scope</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scope.sites.map(site => (
                    <tr key={site.id} className="group">
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={site.name}
                          onChange={e => updateSite(site.id, 'name', e.target.value)}
                          placeholder="Site name"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={site.address}
                          onChange={e => updateSite(site.id, 'address', e.target.value)}
                          placeholder="Full address"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={site.inScope}
                          onChange={e => updateSite(site.id, 'inScope', e.target.checked)}
                          className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <button onClick={() => removeSite(site.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            <span>{scope.sites.filter(s => s.inScope).length} in scope</span>
            <span>{scope.sites.filter(s => !s.inScope).length} excluded</span>
          </div>
        </div>
      )}

      {/* ── Cross-references ───────────────────────────────────────────── */}
      {activeSection === 'links' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Cross-references</h2>
          <p className="text-xs text-muted-foreground">
            The scope determination considers outputs from the following related analyses:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/context" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Context of the Organisation</div>
                <div className="text-xs text-muted-foreground">ISO 9001:2015 Clause 4.1 -- SWOT & PESTLE Analysis</div>
              </div>
              <Link2 className="h-4 w-4 text-muted-foreground ml-auto" />
            </a>
            <a href="/interested-parties" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:border-purple-300 dark:hover:border-purple-700 transition-colors group">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Interested Parties</div>
                <div className="text-xs text-muted-foreground">ISO 9001:2015 Clause 4.2 -- Needs and expectations</div>
              </div>
              <Link2 className="h-4 w-4 text-muted-foreground ml-auto" />
            </a>
          </div>
        </div>
      )}

      {/* ── Summary bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 print:hidden">
        <span>Inclusions: <strong className="text-foreground">{scope.inclusions.length}</strong></span>
        <span>Exclusions: <strong className="text-foreground">{scope.exclusions.length}</strong></span>
        <span>Sites: <strong className="text-foreground">{scope.sites.length}</strong></span>
        <span className="ml-auto">Last updated: {formatDate(scope.updatedAt)}</span>
      </div>
    </div>
  );
}
