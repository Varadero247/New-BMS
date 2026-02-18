'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
} from '@ims/ui';
import { AlertTriangle, Plus, Search, Grid3X3 } from 'lucide-react';
import { api } from '@/lib/api';

interface Risk {
  id: string;
  referenceNumber: string;
  title: string;
  threat: string;
  likelihood: number;
  impact: number;
  score: number;
  level: string;
  treatment: string;
  status: string;
  owner: string;
  createdAt: string;
}

const riskLevelColors: Record<string, string> = {
  VERY_LOW: 'bg-green-100 text-green-700',
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const heatMapColors: Record<string, string> = {
  VERY_LOW: 'bg-green-200',
  LOW: 'bg-blue-200',
  MEDIUM: 'bg-yellow-200',
  HIGH: 'bg-orange-300',
  CRITICAL: 'bg-red-400',
};

const treatments = ['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID'];
const riskStatuses = ['OPEN', 'IN_TREATMENT', 'MONITORING', 'CLOSED'];
const riskLevels = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function calculateLevel(score: number): string {
  if (score <= 4) return 'VERY_LOW';
  if (score <= 8) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'CRITICAL';
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    threat: '',
    likelihood: 3,
    impact: 3,
    treatment: 'MITIGATE',
    owner: '',
  });

  useEffect(() => {
    loadRisks();
  }, []);

  async function loadRisks() {
    try {
      setError(null);
      const res = await api.get('/risks');
      setRisks(res.data.data || []);
    } catch (err) {
      console.error('Error loading risks:', err);
      setError('Failed to load risk register.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setForm({ title: '', threat: '', likelihood: 3, impact: 3, treatment: 'MITIGATE', owner: '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const score = form.likelihood * form.impact;
      const level = calculateLevel(score);
      await api.post('/risks', { ...form, score, level });
      setModalOpen(false);
      loadRisks();
    } catch (err) {
      console.error('Error saving risk:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = risks.filter((r) => {
    if (levelFilter && r.level !== levelFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (treatmentFilter && r.treatment !== treatmentFilter) return false;
    if (
      searchTerm &&
      !r.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Heat map: 5x5 grid (likelihood x impact)
  function renderHeatMap() {
    const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    risks.forEach((r) => {
      const li = Math.min(Math.max(r.likelihood, 1), 5) - 1;
      const im = Math.min(Math.max(r.impact, 1), 5) - 1;
      grid[li][im]++;
    });

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Risk Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <div className="flex flex-col items-center mr-2 justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-90 whitespace-nowrap">
                Likelihood
              </span>
            </div>
            <div>
              {[4, 3, 2, 1, 0].map((li) => (
                <div key={li} className="flex">
                  <span className="w-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    {li + 1}
                  </span>
                  {[0, 1, 2, 3, 4].map((im) => {
                    const score = (li + 1) * (im + 1);
                    const level = calculateLevel(score);
                    const count = grid[li][im];
                    return (
                      <div
                        key={im}
                        className={`w-16 h-16 border border-white flex items-center justify-center rounded ${heatMapColors[level]}`}
                        title={`L:${li + 1} I:${im + 1} Score:${score} (${count} risks)`}
                      >
                        {count > 0 && (
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex ml-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="w-16 text-xs text-gray-500 dark:text-gray-400 text-center"
                  >
                    {i}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center ml-8 mt-1">
                Impact
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Information security risk assessment and treatment
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHeatMap(!showHeatMap)}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" /> {showHeatMap ? 'Table View' : 'Heat Map'}
            </Button>
            <Button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" /> Add Risk
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showHeatMap && renderHeatMap()}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search risks..."
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                aria-label="Filter by level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Levels</option>
                {riskLevels.map((l) => (
                  <option key={l} value={l}>
                    {l.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                {riskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by treatment"
                value={treatmentFilter}
                onChange={(e) => setTreatmentFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Treatments</option>
                {treatments.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Ref
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Threat
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        L
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        I
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Level
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Treatment
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((risk) => (
                      <tr key={risk.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          {risk.referenceNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {risk.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{risk.threat}</td>
                        <td className="py-3 px-4 text-gray-600">{risk.likelihood}</td>
                        <td className="py-3 px-4 text-gray-600">{risk.impact}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">
                          {risk.score}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              riskLevelColors[risk.level] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {risk.level.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{risk.treatment}</td>
                        <td className="py-3 px-4 text-gray-600">{risk.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No risks found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Risk" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Threat
            </label>
            <input
              type="text"
              value={form.threat}
              onChange={(e) => setForm({ ...form, threat: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Ransomware, Phishing, Insider Threat"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Likelihood (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.likelihood}
                onChange={(e) => setForm({ ...form, likelihood: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                value={form.impact}
                onChange={(e) => setForm({ ...form, impact: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Calculated Score:{' '}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {form.likelihood * form.impact}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Risk Level:{' '}
              <Badge
                className={
                  riskLevelColors[calculateLevel(form.likelihood * form.impact)] ||
                  'bg-gray-100 dark:bg-gray-800'
                }
              >
                {calculateLevel(form.likelihood * form.impact).replace(/_/g, ' ')}
              </Badge>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Treatment
              </label>
              <select
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {treatments.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Create Risk'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
