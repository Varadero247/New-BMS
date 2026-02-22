'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Shield, AlertTriangle, Lock, Settings } from 'lucide-react';

interface DlpPolicy {
  id: string;
  name: string;
  scope: string;
  dataTypes: string[];
  action: string;
  owner: string;
  enabled: boolean;
}

interface DlpIncident {
  id: string;
  policyName: string;
  eventDate: string;
  dataType: string;
  channel: string;
  userIdentifier: string;
  blocked: boolean;
  severity: string;
  falsePositive: boolean;
}

const SCOPES = ['ENDPOINT', 'EMAIL', 'CLOUD', 'NETWORK', 'ALL'];
const ACTIONS = ['MONITOR', 'ALERT', 'BLOCK', 'QUARANTINE'];
const CHANNELS = ['EMAIL', 'USB', 'CLOUD_UPLOAD', 'PRINT', 'COPY_PASTE', 'SCREENSHOT', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const SEV_COLOURS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function DlpPage() {
  const [policies, setPolicies] = useState<DlpPolicy[]>([]);
  const [incidents, setIncidents] = useState<DlpIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'policies' | 'incidents'>('policies');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dataTypesInput, setDataTypesInput] = useState('');
  const [policyForm, setPolicyForm] = useState({
    name: '', scope: 'EMAIL', action: 'ALERT', description: '', owner: '', enabled: true,
  });
  const [incidentForm, setIncidentForm] = useState({
    policyName: '', eventDate: '', dataType: '', channel: 'EMAIL',
    userIdentifier: '', severity: 'MEDIUM', detectedBy: '', blocked: false, falsePositive: false,
  });

  useEffect(() => { loadPolicies(); loadIncidents(); }, []);

  async function loadPolicies() {
    try {
      setLoading(true);
      const res = await api.get('/dlp/dlp-policies');
      setPolicies(res.data.data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function loadIncidents() {
    try {
      const res = await api.get('/dlp/dlp-incidents');
      setIncidents(res.data.data || []);
    } catch { /* ignore */ }
  }

  async function handleSavePolicy() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...policyForm,
        dataTypes: dataTypesInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      await api.post('/dlp/dlp-policies', payload);
      setShowModal(false);
      resetForms();
      await loadPolicies();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveIncident() {
    try {
      setSaving(true);
      setError('');
      await api.post('/dlp/dlp-incidents', incidentForm);
      setShowModal(false);
      resetForms();
      await loadIncidents();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForms() {
    setPolicyForm({ name: '', scope: 'EMAIL', action: 'ALERT', description: '', owner: '', enabled: true });
    setIncidentForm({ policyName: '', eventDate: '', dataType: '', channel: 'EMAIL', userIdentifier: '', severity: 'MEDIUM', detectedBy: '', blocked: false, falsePositive: false });
    setDataTypesInput('');
  }

  const filteredPolicies = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase()));
  const filteredIncidents = incidents.filter(i => i.policyName.toLowerCase().includes(search.toLowerCase()) || i.userIdentifier.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-indigo-600" />
            Data Loss Prevention
          </h1>
          <p className="text-gray-500 mt-1">ISO 27001 A.8.12 — DLP policies, incidents and configuration baselines</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> {activeTab === 'policies' ? 'New Policy' : 'Record Incident'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Policies', value: policies.filter(p => p.enabled).length, icon: Shield, colour: 'text-blue-600' },
          { label: 'Block Actions', value: policies.filter(p => p.action === 'BLOCK').length, icon: Lock, colour: 'text-red-600' },
          { label: 'Total Incidents', value: incidents.length, icon: AlertTriangle, colour: 'text-orange-600' },
          { label: 'High/Critical', value: incidents.filter(i => ['HIGH', 'CRITICAL'].includes(i.severity)).length, icon: AlertTriangle, colour: 'text-red-700' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['policies', 'DLP Policies'], ['incidents', 'DLP Incidents']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as 'policies' | 'incidents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 outline-none text-sm" />
      </div>

      {/* Policies Table */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filteredPolicies.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No DLP policies found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Policy Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Scope</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data Types</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPolicies.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{p.scope}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.dataTypes.slice(0, 3).map(d => <span key={d} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{d}</span>)}
                        {p.dataTypes.length > 3 && <span className="text-xs text-gray-400">+{p.dataTypes.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.action === 'BLOCK' ? 'bg-red-100 text-red-700' : p.action === 'QUARANTINE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{p.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.owner}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.enabled ? 'Active' : 'Disabled'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Incidents Table */}
      {activeTab === 'incidents' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No DLP incidents found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Policy</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Channel</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Blocked</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">False+</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredIncidents.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-sm">{i.policyName}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(i.eventDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{i.userIdentifier}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{i.channel}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEV_COLOURS[i.severity]}`}>{i.severity}</span></td>
                    <td className="px-4 py-3 text-center">{i.blocked ? <span className="text-red-500 text-xs">✓ Blocked</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3 text-center">{i.falsePositive ? <span className="text-orange-500 text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{activeTab === 'policies' ? 'New DLP Policy' : 'Record DLP Incident'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            {activeTab === 'policies' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Policy Name *</label>
                  <input value={policyForm.name} onChange={e => setPolicyForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Scope *</label>
                    <select value={policyForm.scope} onChange={e => setPolicyForm(f => ({ ...f, scope: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action *</label>
                    <select value={policyForm.action} onChange={e => setPolicyForm(f => ({ ...f, action: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Data Types * (comma-separated)</label>
                  <input value={dataTypesInput} onChange={e => setDataTypesInput(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="PAN, PII, PHI, CREDENTIALS" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea value={policyForm.description} onChange={e => setPolicyForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner *</label>
                  <input value={policyForm.owner} onChange={e => setPolicyForm(f => ({ ...f, owner: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={policyForm.enabled} onChange={e => setPolicyForm(f => ({ ...f, enabled: e.target.checked }))} />
                  Policy Enabled
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Policy Name *</label>
                  <input value={incidentForm.policyName} onChange={e => setIncidentForm(f => ({ ...f, policyName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Event Date *</label>
                  <input type="date" value={incidentForm.eventDate} onChange={e => setIncidentForm(f => ({ ...f, eventDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Type *</label>
                  <input value={incidentForm.dataType} onChange={e => setIncidentForm(f => ({ ...f, dataType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. PAN, PII" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Channel *</label>
                    <select value={incidentForm.channel} onChange={e => setIncidentForm(f => ({ ...f, channel: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {CHANNELS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity *</label>
                    <select value={incidentForm.severity} onChange={e => setIncidentForm(f => ({ ...f, severity: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">User Identifier *</label>
                  <input value={incidentForm.userIdentifier} onChange={e => setIncidentForm(f => ({ ...f, userIdentifier: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="user@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Detected By *</label>
                  <input value={incidentForm.detectedBy} onChange={e => setIncidentForm(f => ({ ...f, detectedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="DLP Engine, SIEM" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={incidentForm.blocked} onChange={e => setIncidentForm(f => ({ ...f, blocked: e.target.checked }))} />
                    Transfer Blocked
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={incidentForm.falsePositive} onChange={e => setIncidentForm(f => ({ ...f, falsePositive: e.target.checked }))} />
                    False Positive
                  </label>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={activeTab === 'policies' ? handleSavePolicy : handleSaveIncident} disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
