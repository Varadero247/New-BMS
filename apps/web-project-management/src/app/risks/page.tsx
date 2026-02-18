'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, AlertTriangle, Sparkles } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api, aiApi } from '@/lib/api';

export default function RisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    riskCode: '',
    riskTitle: '',
    riskCategory: 'TECHNICAL',
    probability: 3,
    impact: 3,
    responseStrategy: 'MITIGATE',
    riskDescription: '',
  });

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterRiskLevel) params.riskLevel = filterRiskLevel;
      const [risksRes, projectsRes] = await Promise.all([
        api.get('/risks', { params }),
        api.get('/projects'),
      ]);
      setRisks(risksRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  }, [filterProjectId, filterRiskLevel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/risks', {
        ...form,
        probability: parseInt(String(form.probability)),
        impact: parseInt(String(form.impact)),
      });
      setShowModal(false);
      setForm({
        projectId: '',
        riskCode: '',
        riskTitle: '',
        riskCategory: 'TECHNICAL',
        probability: 3,
        impact: 3,
        responseStrategy: 'MITIGATE',
        riskDescription: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create risk:', error);
    }
  };

  const handleAiAnalyze = async (risk: any) => {
    setAiLoading(true);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'PROJECT_RISK_ANALYSIS',
        data: risk,
      });
      setAiResult(res.data.data?.analysis || res.data.data || 'No analysis returned');
      setShowAiModal(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const riskLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-700',
      MEDIUM: 'bg-amber-100 text-amber-700',
      HIGH: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      IDENTIFIED: 'bg-blue-100 text-blue-700',
      OPEN: 'bg-blue-100 text-blue-700',
      ANALYSED: 'bg-indigo-100 text-indigo-700',
      MITIGATING: 'bg-amber-100 text-amber-700',
      CLOSED: 'bg-green-100 text-green-700',
      OCCURRED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  const getRiskScore = (probability: number, impact: number) => probability * impact;

  const getRiskLevel = (score: number) => {
    if (score >= 20) return 'CRITICAL';
    if (score >= 12) return 'HIGH';
    if (score >= 6) return 'MEDIUM';
    return 'LOW';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
              Project Risks
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Risk register and management
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Risk
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Project
              </label>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Risk Level
              </label>
              <select
                value={filterRiskLevel}
                onChange={(e) => setFilterRiskLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Prob
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Impact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Strategy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {risks.map((risk) => {
                  const score = risk.riskScore || getRiskScore(risk.probability, risk.impact);
                  const level = risk.riskLevel || getRiskLevel(score);
                  return (
                    <tr key={risk.id} className="hover:bg-gray-50 dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {risk.riskCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {risk.riskTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {risk.riskCategory}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {risk.probability}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {risk.impact}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{score}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${riskLevelBadge(level)}`}>
                          {level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {risk.responseStrategy}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusBadge(risk.status)}`}
                        >
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAiAnalyze(risk)}
                          disabled={aiLoading}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {risks.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No risks found. Create your first risk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Risk" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                required
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Code
                </label>
                <input
                  type="text"
                  required
                  value={form.riskCode}
                  onChange={(e) => setForm({ ...form, riskCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Title
                </label>
                <input
                  type="text"
                  required
                  value={form.riskTitle}
                  onChange={(e) => setForm({ ...form, riskTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={form.riskCategory}
                  onChange={(e) => setForm({ ...form, riskCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="SCHEDULE">Schedule</option>
                  <option value="COST">Cost</option>
                  <option value="SCOPE">Scope</option>
                  <option value="QUALITY">Quality</option>
                  <option value="RESOURCE">Resource</option>
                  <option value="EXTERNAL">External</option>
                  <option value="ORGANIZATIONAL">Organizational</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Response Strategy
                </label>
                <select
                  value={form.responseStrategy}
                  onChange={(e) => setForm({ ...form, responseStrategy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AVOID">Avoid</option>
                  <option value="MITIGATE">Mitigate</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="ACCEPT">Accept</option>
                  <option value="ESCALATE">Escalate</option>
                  <option value="EXPLOIT">Exploit</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Probability (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.probability}
                  onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Impact (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600">
                Risk Score: <span className="font-bold">{form.probability * form.impact}</span> |
                Level:{' '}
                <span
                  className={`font-bold ${
                    getRiskLevel(form.probability * form.impact) === 'CRITICAL'
                      ? 'text-red-600'
                      : getRiskLevel(form.probability * form.impact) === 'HIGH'
                        ? 'text-orange-600'
                        : getRiskLevel(form.probability * form.impact) === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-green-600'
                  }`}
                >
                  {getRiskLevel(form.probability * form.impact)}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.riskDescription}
                onChange={(e) => setForm({ ...form, riskDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Risk
              </button>
            </div>
          </form>
        </Modal>

        {/* AI Result Modal */}
        <Modal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          title="AI Risk Analysis"
          size="lg"
        >
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {aiResult}
            </pre>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowAiModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
