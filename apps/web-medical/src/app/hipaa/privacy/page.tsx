'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { FileText, Plus, X, BookOpen, Eye, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

type ActiveTab = 'policies' | 'disclosures' | 'training' | 'minimum-necessary';

interface Policy { id: string; version: string; effectiveDate: string; nppSummary: string; status: string; }
interface Disclosure { id: string; disclosureDate: string; recipient: string; recipientType: string; purpose: string; phiCategories: string[]; patientAuthorized?: boolean; }
interface Training { id: string; employeeId: string; employeeName: string; trainingType: string; completedDate: string; trainingModule: string; score?: number; passed?: boolean; }

const POLICY_STATUSES = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED'];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SUPERSEDED: 'bg-orange-100 text-orange-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
};

export default function HipaaPrivacyPage() {
  const [tab, setTab] = useState<ActiveTab>('policies');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [training, setTraining] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [policyForm, setPolicyForm] = useState({ version: '', effectiveDate: '', nppSummary: '', fullText: '' });
  const [disclosureForm, setDisclosureForm] = useState({
    disclosureDate: '', recipient: '', recipientType: 'TREATMENT_PROVIDER',
    purpose: '', phiCategories: '', recordedBy: '',
  });
  const [trainingForm, setTrainingForm] = useState({
    employeeId: '', employeeName: '', trainingType: 'INITIAL_TRAINING',
    completedDate: '', trainingModule: '',
  });

  const fetchTab = () => {
    setLoading(true);
    const map: Record<ActiveTab, () => Promise<void>> = {
      policies: () => api.get('/hipaa/privacy?limit=50').then((r) => setPolicies(r.data.data)),
      disclosures: () => api.get('/hipaa/privacy/disclosures?limit=50').then((r) => setDisclosures(r.data.data)),
      training: () => api.get('/hipaa/privacy/training?limit=50').then((r) => setTraining(r.data.data)),
      'minimum-necessary': () => Promise.resolve(),
    };
    map[tab]().catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTab(); }, [tab]);

  const handleCreatePolicy = async () => {
    setSaving(true);
    try {
      await api.post('/hipaa/privacy', policyForm);
      setShowCreate(false);
      setPolicyForm({ version: '', effectiveDate: '', nppSummary: '', fullText: '' });
      fetchTab();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleCreateDisclosure = async () => {
    setSaving(true);
    try {
      await api.post('/hipaa/privacy/disclosures', {
        ...disclosureForm,
        phiCategories: disclosureForm.phiCategories.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowCreate(false);
      fetchTab();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleCreateTraining = async () => {
    setSaving(true);
    try {
      await api.post('/hipaa/privacy/training', trainingForm);
      setShowCreate(false);
      fetchTab();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const activatePolicy = async (id: string) => {
    await api.put(`/hipaa/privacy/${id}`, { status: 'ACTIVE' });
    fetchTab();
  };

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'policies', label: 'NPP Versions', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'disclosures', label: 'PHI Disclosures', icon: <Eye className="w-4 h-4" /> },
    { key: 'training', label: 'Training Records', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">HIPAA Privacy Rule</h1>
            <p className="text-sm text-gray-500">45 CFR §164.500–534 — Notice of Privacy Practices, Disclosures &amp; Training</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <>
          {tab === 'policies' && (
            <div className="space-y-3">
              {policies.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">v{p.version}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Effective: {new Date(p.effectiveDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 mt-1">{p.nppSummary}</p>
                    </div>
                    {p.status === 'APPROVED' && (
                      <button onClick={() => activatePolicy(p.id)} className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">Activate</button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!policies.length && <p className="text-center text-gray-400 text-sm py-8">No NPP versions found. Create the first one.</p>}
            </div>
          )}

          {tab === 'disclosures' && (
            <div className="space-y-3">
              {disclosures.map((d) => (
                <Card key={d.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{d.recipient}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{d.recipientType.replace(/_/g, ' ')}</span>
                      {d.patientAuthorized && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Patient Authorized</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(d.disclosureDate).toLocaleDateString()} — {d.purpose}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.phiCategories.map((c) => <span key={c} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{c}</span>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!disclosures.length && <p className="text-center text-gray-400 text-sm py-8">No PHI disclosures recorded.</p>}
            </div>
          )}

          {tab === 'training' && (
            <div className="space-y-3">
              {training.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{t.employeeName}</span>
                      <span className="text-xs text-gray-400">{t.employeeId}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{t.trainingType.replace(/_/g, ' ')}</span>
                      {t.passed !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.passed ? 'PASSED' : 'FAILED'}{t.score !== undefined ? ` (${t.score}%)` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.trainingModule} · {new Date(t.completedDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {!training.length && <p className="text-center text-gray-400 text-sm py-8">No training records found.</p>}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {tab === 'policies' ? 'Create NPP Version' : tab === 'disclosures' ? 'Log PHI Disclosure' : 'Add Training Record'}
                </CardTitle>
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tab === 'policies' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Version *</label>
                    <input value={policyForm.version} onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="2.0" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Effective Date *</label>
                    <input type="date" value={policyForm.effectiveDate} onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">NPP Summary *</label>
                    <textarea value={policyForm.nppSummary} onChange={(e) => setPolicyForm({ ...policyForm, nppSummary: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Full Text *</label>
                    <textarea value={policyForm.fullText} onChange={(e) => setPolicyForm({ ...policyForm, fullText: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-32" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreatePolicy} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      {saving ? 'Saving…' : 'Create'}
                    </button>
                    <button onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </>
              )}

              {tab === 'disclosures' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Disclosure Date *</label>
                    <input type="date" value={disclosureForm.disclosureDate}
                      onChange={(e) => setDisclosureForm({ ...disclosureForm, disclosureDate: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Recipient *</label>
                    <input value={disclosureForm.recipient} onChange={(e) => setDisclosureForm({ ...disclosureForm, recipient: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Recipient Type *</label>
                    <select value={disclosureForm.recipientType}
                      onChange={(e) => setDisclosureForm({ ...disclosureForm, recipientType: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                      {['TREATMENT_PROVIDER','PAYMENT_ENTITY','HEALTHCARE_OPERATIONS','BUSINESS_ASSOCIATE','INDIVIDUAL','PUBLIC_HEALTH','LAW_ENFORCEMENT','LEGAL','RESEARCH','OTHER'].map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Purpose *</label>
                    <input value={disclosureForm.purpose} onChange={(e) => setDisclosureForm({ ...disclosureForm, purpose: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">PHI Categories (comma-separated) *</label>
                    <input value={disclosureForm.phiCategories} onChange={(e) => setDisclosureForm({ ...disclosureForm, phiCategories: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="demographics, diagnoses" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Recorded By *</label>
                    <input value={disclosureForm.recordedBy} onChange={(e) => setDisclosureForm({ ...disclosureForm, recordedBy: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreateDisclosure} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      {saving ? 'Saving…' : 'Log Disclosure'}
                    </button>
                    <button onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </>
              )}

              {tab === 'training' && (
                <>
                  {[
                    { label: 'Employee ID *', key: 'employeeId', type: 'text', placeholder: 'EMP-001' },
                    { label: 'Employee Name *', key: 'employeeName', type: 'text', placeholder: 'Jane Doe' },
                    { label: 'Training Module *', key: 'trainingModule', type: 'text', placeholder: 'HIPAA Privacy Rule 101' },
                    { label: 'Completed Date *', key: 'completedDate', type: 'date', placeholder: '' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-gray-700">{f.label}</label>
                      <input type={f.type} value={(trainingForm as any)[f.key]}
                        onChange={(e) => setTrainingForm({ ...trainingForm, [f.key]: e.target.value })}
                        placeholder={f.placeholder} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-gray-700">Training Type *</label>
                    <select value={trainingForm.trainingType}
                      onChange={(e) => setTrainingForm({ ...trainingForm, trainingType: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                      {['INITIAL_TRAINING','ANNUAL_REFRESHER','ROLE_SPECIFIC','BREACH_RESPONSE','NEW_POLICY'].map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreateTraining} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      {saving ? 'Saving…' : 'Add Record'}
                    </button>
                    <button onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
