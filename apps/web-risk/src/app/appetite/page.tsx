'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  Target, Settings, Edit2, CheckCircle, AlertTriangle, ShieldAlert,
  TrendingUp, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

type AppetiteLevel = 'VERY_LOW' | 'LOW' | 'MODERATE_APPETITE' | 'HIGH_APPETITE' | 'VERY_HIGH';

interface AppetiteStatement {
  id: string;
  category: string;
  appetiteLevel: AppetiteLevel;
  statement: string;
  acceptableResidualScore: number;
  escalationThreshold: number;
  maximumTolerableScore: number;
  reviewDate: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface RiskFramework {
  organisationId: string;
  overallRiskAppetite?: AppetiteLevel;
  riskCommitteeExists?: boolean;
  riskCommitteeName?: string;
  riskCommitteeMeetingFreq?: string;
  boardReportingFreq?: string;
  maturityLevel?: string;
  maturityAssessedDate?: string;
  frameworkVersion?: string;
  policyRef?: string;
  policyApprovedDate?: string;
}

const APPETITE_COLORS: Record<AppetiteLevel, string> = {
  VERY_LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  MODERATE_APPETITE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  HIGH_APPETITE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const APPETITE_DOTS: Record<AppetiteLevel, string> = {
  VERY_LOW: 'bg-green-500',
  LOW: 'bg-blue-500',
  MODERATE_APPETITE: 'bg-yellow-500',
  HIGH_APPETITE: 'bg-orange-500',
  VERY_HIGH: 'bg-red-500',
};

const ALL_CATEGORIES = [
  'STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL',
  'ENVIRONMENTAL', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'QUALITY',
  'SUPPLY_CHAIN', 'TECHNOLOGY_CYBER', 'PEOPLE_HR', 'EXTERNAL_GEOPOLITICAL',
  'PROJECT_PROGRAMME', 'OTHER',
];

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAppetite(level: AppetiteLevel) {
  return level.replace(/_APPETITE/, '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function ScoreBar({ value, max = 25 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 60 ? 'bg-red-500' : pct >= 40 ? 'bg-orange-400' : pct >= 20 ? 'bg-yellow-400' : 'bg-green-400';
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

interface EditModalProps {
  stmt: AppetiteStatement;
  onClose: () => void;
  onSave: () => void;
}

function EditModal({ stmt, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    statement: stmt.statement,
    appetiteLevel: stmt.appetiteLevel,
    acceptableResidualScore: stmt.acceptableResidualScore,
    escalationThreshold: stmt.escalationThreshold,
    maximumTolerableScore: stmt.maximumTolerableScore,
    approvedBy: stmt.approvedBy || '',
    reviewDate: stmt.reviewDate ? stmt.reviewDate.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.statement) { setError('Statement is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/risks/appetite', {
        category: stmt.category,
        appetiteLevel: form.appetiteLevel,
        statement: form.statement,
        acceptableResidualScore: Number(form.acceptableResidualScore),
        escalationThreshold: Number(form.escalationThreshold),
        maximumTolerableScore: Number(form.maximumTolerableScore),
        approvedBy: form.approvedBy || undefined,
        reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : new Date().toISOString(),
      });
      onSave();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Edit Appetite — {formatCategory(stmt.category)}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Appetite Level</label>
            <select value={form.appetiteLevel}
              onChange={e => setForm(p => ({ ...p, appetiteLevel: e.target.value as AppetiteLevel }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="VERY_LOW">Very Low</option>
              <option value="LOW">Low</option>
              <option value="MODERATE_APPETITE">Moderate</option>
              <option value="HIGH_APPETITE">High</option>
              <option value="VERY_HIGH">Very High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statement *</label>
            <textarea value={form.statement} onChange={e => setForm(p => ({ ...p, statement: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Acceptable Score</label>
              <input type="number" min={1} max={25} value={form.acceptableResidualScore}
                onChange={e => setForm(p => ({ ...p, acceptableResidualScore: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Escalation Threshold</label>
              <input type="number" min={1} max={25} value={form.escalationThreshold}
                onChange={e => setForm(p => ({ ...p, escalationThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tolerable</label>
              <input type="number" min={1} max={25} value={form.maximumTolerableScore}
                onChange={e => setForm(p => ({ ...p, maximumTolerableScore: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Approved By</label>
              <input type="text" value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Review Date</label>
              <input type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppetitePage() {
  const [statements, setStatements] = useState<AppetiteStatement[]>([]);
  const [framework, setFramework] = useState<RiskFramework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStmt, setEditingStmt] = useState<AppetiteStatement | null>(null);
  const [showFrameworkPanel, setShowFrameworkPanel] = useState(true);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [appRes, fwRes] = await Promise.all([
        api.get('/risks/appetite'),
        api.get('/risks/framework'),
      ]);
      setStatements(appRes.data.data || []);
      setFramework(fwRes.data.data || null);
    } catch (e: any) {
      setError(e.response?.status === 401 ? 'Session expired. Please log in.' : 'Failed to load appetite data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Build merged list: defined statements + placeholder cards for any missing categories
  const stmtByCategory = Object.fromEntries(statements.map(s => [s.category, s]));
  const allCards = ALL_CATEGORIES.map(cat => stmtByCategory[cat] || {
    id: '',
    category: cat,
    appetiteLevel: 'MODERATE_APPETITE' as AppetiteLevel,
    statement: 'No appetite statement defined for this category.',
    acceptableResidualScore: 8,
    escalationThreshold: 12,
    maximumTolerableScore: 16,
    reviewDate: '',
    approvedBy: '',
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Appetite Framework</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 31000 — risk tolerance thresholds by category</p>
            </div>
            <button onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-3">
            {(Object.entries(APPETITE_COLORS) as [AppetiteLevel, string][]).map(([level, cls]) => (
              <span key={level} className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
                {formatAppetite(level)}
              </span>
            ))}
          </div>

          {/* Organisation Framework Panel */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <button
                onClick={() => setShowFrameworkPanel(p => !p)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Organisation Risk Framework Settings</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overall appetite, committee and maturity configuration</p>
                  </div>
                </div>
                {showFrameworkPanel ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>

              {showFrameworkPanel && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                  {loading ? (
                    <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}
                    </div>
                  ) : framework ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Overall Appetite</p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                          {framework.overallRiskAppetite ? formatAppetite(framework.overallRiskAppetite) : '—'}
                        </p>
                        {framework.overallRiskAppetite && (
                          <span className={`mt-1 inline-block w-2 h-2 rounded-full ${APPETITE_DOTS[framework.overallRiskAppetite]}`} />
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Risk Committee</p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {framework.riskCommitteeName || (framework.riskCommitteeExists ? 'Active' : 'None')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{framework.riskCommitteeMeetingFreq || '—'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Maturity Level</p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{framework.maturityLevel || '—'}</p>
                        {framework.maturityAssessedDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Assessed {new Date(framework.maturityAssessedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Framework</p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                          v{framework.frameworkVersion || '1.0'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{framework.policyRef || '—'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">No framework configuration found. Use the Risk Framework settings to configure your organisation's risk management parameters.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Row */}
          {!loading && statements.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {(Object.keys(APPETITE_COLORS) as AppetiteLevel[]).map(level => {
                const count = statements.filter(s => s.appetiteLevel === level).length;
                return (
                  <Card key={level} className="text-center">
                    <CardContent className="pt-4 pb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${APPETITE_COLORS[level]}`}>
                        {formatAppetite(level)}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Category Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCards.map(stmt => (
                <Card key={stmt.category} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                          {formatCategory(stmt.category)}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingStmt(stmt.id ? stmt : { ...stmt, id: '' })}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${APPETITE_COLORS[stmt.appetiteLevel]}`}>
                      {formatAppetite(stmt.appetiteLevel)}
                    </span>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                      {stmt.statement}
                    </p>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Acceptable score</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{stmt.acceptableResidualScore}/25</span>
                        </div>
                        <ScoreBar value={stmt.acceptableResidualScore} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Escalation threshold</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{stmt.escalationThreshold}/25</span>
                        </div>
                        <ScoreBar value={stmt.escalationThreshold} />
                      </div>
                    </div>

                    {stmt.approvedBy && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Approved by {stmt.approvedBy}</span>
                      </div>
                    )}
                    {stmt.reviewDate && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Review due: {new Date(stmt.reviewDate).toLocaleDateString()}
                      </p>
                    )}
                    {!stmt.id && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                        <ShieldAlert className="h-3 w-3" />
                        <span>No statement defined — click edit to set</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {editingStmt && (
        <EditModal stmt={editingStmt} onClose={() => setEditingStmt(null)} onSave={loadData} />
      )}
    </div>
  );
}
