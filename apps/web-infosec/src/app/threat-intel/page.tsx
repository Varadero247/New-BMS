'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Radar, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface ThreatIndicator {
  id: string;
  indicatorType: string;
  indicatorValue: string;
  threatCategory: string;
  severity: string;
  confidence: string;
  source: string;
  firstSeen: string;
  lastSeen: string | null;
  tlpLevel: string;
  status: string;
  description: string | null;
}

const SEVERITY_COLOURS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const INDICATOR_TYPES = ['IP_ADDRESS', 'DOMAIN', 'URL', 'FILE_HASH', 'EMAIL', 'CVE', 'YARA_RULE', 'TTPs', 'OTHER'];
const THREAT_CATEGORIES = ['MALWARE', 'PHISHING', 'RANSOMWARE', 'APT', 'INSIDER_THREAT', 'VULNERABILITY', 'BOTNET', 'CREDENTIAL_THEFT', 'SUPPLY_CHAIN', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CONFIDENCES = ['LOW', 'MEDIUM', 'HIGH'];
const TLP_LEVELS = ['WHITE', 'GREEN', 'AMBER', 'RED'];
const STATUSES = ['ACTIVE', 'EXPIRED', 'REVOKED', 'INVESTIGATING', 'MITIGATED'];

export default function ThreatIntelPage() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    indicatorType: 'IP_ADDRESS', indicatorValue: '', threatCategory: 'MALWARE', severity: 'MEDIUM',
    confidence: 'MEDIUM', source: '', firstSeen: '', tlpLevel: 'AMBER', description: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterSeverity) params.severity = filterSeverity;
      if (filterCategory) params.threatCategory = filterCategory;
      const res = await api.get('/threat-intel', { params });
      setIndicators(res.data.data || []);
    } catch {
      setError('Failed to load threat intelligence');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = { ...form, description: form.description || undefined };
      await api.post('/threat-intel', payload);
      setShowModal(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ indicatorType: 'IP_ADDRESS', indicatorValue: '', threatCategory: 'MALWARE', severity: 'MEDIUM', confidence: 'MEDIUM', source: '', firstSeen: '', tlpLevel: 'AMBER', description: '' });
  }

  const filtered = indicators.filter(i =>
    i.indicatorValue.toLowerCase().includes(search.toLowerCase()) ||
    i.source.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: indicators.length,
    critical: indicators.filter(i => i.severity === 'CRITICAL').length,
    active: indicators.filter(i => i.status === 'ACTIVE').length,
    highConf: indicators.filter(i => i.confidence === 'HIGH').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Radar className="h-8 w-8 text-indigo-600" />
            Threat Intelligence
          </h1>
          <p className="text-gray-500 mt-1">ISO 27001 A.5.7 — Threat intelligence management</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Add Indicator
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total IoCs', value: stats.total, icon: Radar, colour: 'text-indigo-600' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, colour: 'text-red-600' },
          { label: 'Active', value: stats.active, icon: Shield, colour: 'text-orange-600' },
          { label: 'High Confidence', value: stats.highConf, icon: CheckCircle, colour: 'text-green-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search indicators..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Categories</option>
          {THREAT_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No threat indicators found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Indicator Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">TLP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-600">{i.indicatorType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 font-mono text-xs max-w-xs truncate">{i.indicatorValue}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{i.threatCategory.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLOURS[i.severity]}`}>{i.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-mono">TLP:{i.tlpLevel}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{i.source}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${i.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{i.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Threat Indicator</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Indicator Type *</label>
                  <select value={form.indicatorType} onChange={e => setForm(f => ({ ...f, indicatorType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {INDICATOR_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Threat Category *</label>
                  <select value={form.threatCategory} onChange={e => setForm(f => ({ ...f, threatCategory: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {THREAT_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Indicator Value *</label>
                <input value={form.indicatorValue} onChange={e => setForm(f => ({ ...f, indicatorValue: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1 font-mono" placeholder="IP, domain, hash, CVE..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Severity *</label>
                  <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Confidence *</label>
                  <select value={form.confidence} onChange={e => setForm(f => ({ ...f, confidence: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {CONFIDENCES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">TLP Level *</label>
                  <select value={form.tlpLevel} onChange={e => setForm(f => ({ ...f, tlpLevel: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {TLP_LEVELS.map(t => <option key={t} value={t}>TLP:{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Source *</label>
                <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. MISP, ISACs, NCSC" />
              </div>
              <div>
                <label className="text-sm font-medium">First Seen *</label>
                <input type="date" value={form.firstSeen} onChange={e => setForm(f => ({ ...f, firstSeen: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
