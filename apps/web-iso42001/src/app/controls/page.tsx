'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Control {
  id: string;
  code: string;
  title: string;
  description?: string;
  domain: string;
  status: string;
  implementationNotes?: string;
  evidence?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

const annexAControls = [
  { code: 'A.2', domain: 'AI Policy', controls: [
    { code: 'A.2.2', title: 'AI Policy', description: 'Policy for AI development and use' },
    { code: 'A.2.3', title: 'Roles and Responsibilities', description: 'Define roles related to AI systems' },
    { code: 'A.2.4', title: 'Internal Audit', description: 'AI management system internal audit' },
  ]},
  { code: 'A.3', domain: 'Internal Organization', controls: [
    { code: 'A.3.2', title: 'AI System Life Cycle', description: 'Define AI system development life cycle' },
    { code: 'A.3.3', title: 'Third-party and Customer Relationships', description: 'Manage third-party AI interactions' },
  ]},
  { code: 'A.4', domain: 'Resources for AI', controls: [
    { code: 'A.4.2', title: 'Data Resources', description: 'Data management for AI systems' },
    { code: 'A.4.3', title: 'Tooling', description: 'AI development and operation tools' },
    { code: 'A.4.4', title: 'System and Computing Resources', description: 'Computing infrastructure for AI' },
    { code: 'A.4.5', title: 'Human Resources', description: 'Competence of personnel working with AI' },
  ]},
  { code: 'A.5', domain: 'Assessing AI System Impact', controls: [
    { code: 'A.5.2', title: 'AI Impact Assessment Process', description: 'Conduct impact assessments for AI systems' },
    { code: 'A.5.3', title: 'Documentation of AI Impact Assessment', description: 'Document assessment results' },
  ]},
  { code: 'A.6', domain: 'AI System Life Cycle', controls: [
    { code: 'A.6.2.2', title: 'AI System Design and Development', description: 'Design and development controls' },
    { code: 'A.6.2.3', title: 'AI System Data', description: 'Data quality and governance' },
    { code: 'A.6.2.4', title: 'AI System Testing', description: 'Testing and validation of AI systems' },
    { code: 'A.6.2.5', title: 'AI System Operation', description: 'Operational controls for AI systems' },
    { code: 'A.6.2.6', title: 'AI System Retirement', description: 'Retirement and decommissioning of AI' },
  ]},
  { code: 'A.7', domain: 'Data for AI Systems', controls: [
    { code: 'A.7.2', title: 'Data Provenance', description: 'Track data origin and lineage' },
    { code: 'A.7.3', title: 'Data Quality for AI', description: 'Ensure data quality for training/inference' },
    { code: 'A.7.4', title: 'Data Preparation', description: 'Data preprocessing and transformation' },
  ]},
  { code: 'A.8', domain: 'AI Technology', controls: [
    { code: 'A.8.2', title: 'Transparency', description: 'AI system transparency requirements' },
    { code: 'A.8.3', title: 'Explainability', description: 'AI decision explainability' },
    { code: 'A.8.4', title: 'Bias and Fairness', description: 'Bias detection and mitigation' },
  ]},
  { code: 'A.9', domain: 'AI System use by Third Parties', controls: [
    { code: 'A.9.2', title: 'AI Use Guidance', description: 'Guidance for third-party AI users' },
    { code: 'A.9.3', title: 'Monitoring of Third-Party Use', description: 'Monitor how third parties use AI' },
  ]},
  { code: 'A.10', domain: 'AI Event and Incident Management', controls: [
    { code: 'A.10.2', title: 'AI Event and Incident Response', description: 'Respond to AI events and incidents' },
    { code: 'A.10.3', title: 'Learning from AI Events', description: 'Analyze and learn from AI events' },
  ]},
];

const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE'];
const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  IMPLEMENTED: 'bg-green-100 text-green-700',
  NOT_APPLICABLE: 'bg-blue-100 text-blue-700',
};

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<{code: string; title: string; domain: string; description: string} | null>(null);
  const [controlStatuses, setControlStatuses] = useState<Record<string, {status: string; notes: string; evidence: string; owner: string}>>({});

  const [form, setForm] = useState({
    status: 'NOT_STARTED',
    implementationNotes: '',
    evidence: '',
    owner: '',
  });

  useEffect(() => {
    loadControls();
  }, []);

  async function loadControls() {
    try {
      setError(null);
      const res = await api.get('/controls');
      const data = res.data.data || [];
      setControls(data);
      const statuses: Record<string, {status: string; notes: string; evidence: string; owner: string}> = {};
      data.forEach((c: Control) => {
        statuses[c.code] = {
          status: c.status,
          notes: c.implementationNotes || '',
          evidence: c.evidence || '',
          owner: c.owner || '',
        };
      });
      setControlStatuses(statuses);
    } catch (err) {
      console.error('Error loading controls:', err);
      setError('Failed to load controls.');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(control: {code: string; title: string; domain: string; description: string}) {
    setEditingControl(control);
    const existing = controlStatuses[control.code];
    setForm({
      status: existing?.status || 'NOT_STARTED',
      implementationNotes: existing?.notes || '',
      evidence: existing?.evidence || '',
      owner: existing?.owner || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingControl) return;
    try {
      await api.put(`/controls/${editingControl.code}`, {
        code: editingControl.code,
        title: editingControl.title,
        domain: editingControl.domain,
        description: editingControl.description,
        ...form,
      });
      setControlStatuses({
        ...controlStatuses,
        [editingControl.code]: { status: form.status, notes: form.implementationNotes, evidence: form.evidence, owner: form.owner },
      });
      setModalOpen(false);
      loadControls();
    } catch (err) {
      console.error('Error updating control:', err);
      setError('Failed to update control.');
    }
  }

  const allControls = annexAControls.flatMap((domain) => domain.controls.map((c) => ({ ...c, domain: domain.domain })));
  const totalControls = allControls.length;
  const implementedCount = allControls.filter((c) => controlStatuses[c.code]?.status === 'IMPLEMENTED').length;
  const progressPercent = totalControls > 0 ? Math.round((implementedCount / totalControls) * 100) : 0;

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Annex A Controls</h1>
          <p className="text-gray-500 mt-1">ISO 42001:2023 Annex A control implementation status</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Implementation Progress</h3>
            <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-indigo-600 rounded-full h-3 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span>Implemented: {implementedCount}</span>
            <span>Total: {totalControls}</span>
            <span>Remaining: {totalControls - implementedCount}</span>
          </div>
        </div>

        {annexAControls.map((domain) => (
          <div key={domain.code} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-indigo-900">{domain.code} - {domain.domain}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {domain.controls.map((control) => {
                  const cs = controlStatuses[control.code];
                  return (
                    <tr key={control.code} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-gray-900">{control.code}</td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-gray-900">{control.title}</p>
                        <p className="text-xs text-gray-500">{control.description}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[cs?.status || 'NOT_STARTED']}`}>
                          {(cs?.status || 'NOT_STARTED').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{cs?.owner || '-'}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => openEditModal({ ...control, domain: domain.domain })} className="text-indigo-600 hover:text-indigo-700 text-sm">
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {modalOpen && editingControl && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Update Control {editingControl.code}</h2>
              <p className="text-sm text-gray-500 mb-4">{editingControl.title}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Notes</label>
                  <textarea value={form.implementationNotes} onChange={(e) => setForm({ ...form, implementationNotes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                  <textarea value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
