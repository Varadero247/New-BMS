'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Cloud, Lock, Server, AlertTriangle } from 'lucide-react';

interface CloudService {
  id: string;
  serviceName: string;
  provider: string;
  serviceType: string;
  dataClassification: string;
  personalDataProcessed: boolean;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  businessOwner: string;
  status: string;
}

interface IctReadiness {
  id: string;
  systemName: string;
  criticality: string;
  ictOwner: string;
  rto: number | null;
  rpo: number | null;
  failoverCapability: boolean;
  status: string;
}

const DATA_CLASS_COLOURS: Record<string, string> = {
  PUBLIC: 'bg-green-100 text-green-700',
  INTERNAL: 'bg-blue-100 text-blue-700',
  CONFIDENTIAL: 'bg-orange-100 text-orange-700',
  RESTRICTED: 'bg-red-100 text-red-700',
};

const SERVICE_TYPES = ['IAAS', 'PAAS', 'SAAS', 'CAAS', 'OTHER'];
const DATA_CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
const CRITICALITIES = ['NON_CRITICAL', 'IMPORTANT', 'CRITICAL', 'VITAL'];

export default function CloudSecurityPage() {
  const [services, setServices] = useState<CloudService[]>([]);
  const [ictRecords, setIctRecords] = useState<IctReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cloud' | 'ict'>('cloud');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cloudForm, setCloudForm] = useState({
    serviceName: '', provider: '', serviceType: 'SAAS', dataClassification: 'INTERNAL',
    businessOwner: '', personalDataProcessed: false, encryptionAtRest: true, encryptionInTransit: true,
  });
  const [ictForm, setIctForm] = useState({
    systemName: '', criticality: 'IMPORTANT', ictOwner: '', rto: '', rpo: '',
    failoverCapability: false, backupFrequency: '', lastDrTest: '',
  });

  useEffect(() => { loadCloud(); loadIct(); }, []);

  async function loadCloud() {
    try {
      setLoading(true);
      const res = await api.get('/cloud-security/cloud-services');
      setServices(res.data.data || []);
    } catch {
      setError('Failed to load cloud services');
    } finally {
      setLoading(false);
    }
  }

  async function loadIct() {
    try {
      const res = await api.get('/cloud-security/ict-readiness');
      setIctRecords(res.data.data || []);
    } catch { /* ignore */ }
  }

  async function handleSaveCloud() {
    try {
      setSaving(true);
      setError('');
      await api.post('/cloud-security/cloud-services', cloudForm);
      setShowModal(false);
      resetCloudForm();
      await loadCloud();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveIct() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...ictForm,
        rto: ictForm.rto ? parseInt(ictForm.rto, 10) : undefined,
        rpo: ictForm.rpo ? parseInt(ictForm.rpo, 10) : undefined,
        lastDrTest: ictForm.lastDrTest || undefined,
        backupFrequency: ictForm.backupFrequency || undefined,
      };
      await api.post('/cloud-security/ict-readiness', payload);
      setShowModal(false);
      resetIctForm();
      await loadIct();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetCloudForm() {
    setCloudForm({ serviceName: '', provider: '', serviceType: 'SAAS', dataClassification: 'INTERNAL', businessOwner: '', personalDataProcessed: false, encryptionAtRest: true, encryptionInTransit: true });
  }

  function resetIctForm() {
    setIctForm({ systemName: '', criticality: 'IMPORTANT', ictOwner: '', rto: '', rpo: '', failoverCapability: false, backupFrequency: '', lastDrTest: '' });
  }

  const filteredServices = services.filter(s =>
    s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIct = ictRecords.filter(r =>
    r.systemName.toLowerCase().includes(search.toLowerCase()) ||
    r.ictOwner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="h-8 w-8 text-indigo-600" />
            Cloud Security
          </h1>
          <p className="text-gray-500 mt-1">ISO 27001 A.5.23 — Information security for cloud services</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> {activeTab === 'cloud' ? 'Add Service' : 'Add System'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Cloud Services', value: services.length, icon: Cloud, colour: 'text-blue-600' },
          { label: 'Personal Data', value: services.filter(s => s.personalDataProcessed).length, icon: Lock, colour: 'text-red-600' },
          { label: 'ICT Systems', value: ictRecords.length, icon: Server, colour: 'text-purple-600' },
          { label: 'Critical Systems', value: ictRecords.filter(r => ['CRITICAL', 'VITAL'].includes(r.criticality)).length, icon: AlertTriangle, colour: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['cloud', 'ict'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'cloud' ? 'Cloud Services' : 'ICT Readiness'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab === 'cloud' ? 'cloud services' : 'ICT systems'}...`} className="flex-1 outline-none text-sm" />
      </div>

      {/* Cloud Services Table */}
      {activeTab === 'cloud' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filteredServices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No cloud services found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Provider</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data Class</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Encryption</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">PD</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredServices.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.serviceName}</td>
                    <td className="px-4 py-3 text-gray-600">{s.provider}</td>
                    <td className="px-4 py-3"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{s.serviceType}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DATA_CLASS_COLOURS[s.dataClassification]}`}>{s.dataClassification}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={s.encryptionAtRest ? 'text-green-600' : 'text-red-500'}>Rest: {s.encryptionAtRest ? '✓' : '✗'}</span>
                      {' · '}
                      <span className={s.encryptionInTransit ? 'text-green-600' : 'text-red-500'}>Transit: {s.encryptionInTransit ? '✓' : '✗'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{s.personalDataProcessed ? <span className="text-red-500 text-xs">⚠ Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ICT Table */}
      {activeTab === 'ict' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {filteredIct.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No ICT readiness records found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">System</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Criticality</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">RTO</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">RPO</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Failover</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredIct.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.systemName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.criticality === 'VITAL' ? 'bg-red-100 text-red-700' : r.criticality === 'CRITICAL' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{r.criticality}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.ictOwner}</td>
                    <td className="px-4 py-3 text-gray-600">{r.rto ? `${r.rto}min` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.rpo ? `${r.rpo}min` : '—'}</td>
                    <td className="px-4 py-3 text-center">{r.failoverCapability ? <span className="text-green-600">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{r.status}</span></td>
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
            <h2 className="text-xl font-bold mb-4">{activeTab === 'cloud' ? 'Add Cloud Service' : 'Add ICT System'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            {activeTab === 'cloud' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Service Name *</label>
                  <input value={cloudForm.serviceName} onChange={e => setCloudForm(f => ({ ...f, serviceName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. AWS S3, Salesforce" />
                </div>
                <div>
                  <label className="text-sm font-medium">Provider *</label>
                  <input value={cloudForm.provider} onChange={e => setCloudForm(f => ({ ...f, provider: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Service Type *</label>
                    <select value={cloudForm.serviceType} onChange={e => setCloudForm(f => ({ ...f, serviceType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Classification *</label>
                    <select value={cloudForm.dataClassification} onChange={e => setCloudForm(f => ({ ...f, dataClassification: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                      {DATA_CLASSIFICATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Owner *</label>
                  <input value={cloudForm.businessOwner} onChange={e => setCloudForm(f => ({ ...f, businessOwner: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { field: 'personalDataProcessed', label: 'Processes Personal Data' },
                    { field: 'encryptionAtRest', label: 'Encryption at Rest' },
                    { field: 'encryptionInTransit', label: 'Encryption in Transit' },
                  ].map(({ field, label }) => (
                    <label key={field} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={(cloudForm as Record<string, unknown>)[field] as boolean}
                        onChange={e => setCloudForm(f => ({ ...f, [field]: e.target.checked }))} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">System Name *</label>
                  <input value={ictForm.systemName} onChange={e => setIctForm(f => ({ ...f, systemName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Criticality *</label>
                  <select value={ictForm.criticality} onChange={e => setIctForm(f => ({ ...f, criticality: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {CRITICALITIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">ICT Owner *</label>
                  <input value={ictForm.ictOwner} onChange={e => setIctForm(f => ({ ...f, ictOwner: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">RTO (minutes)</label>
                    <input type="number" value={ictForm.rto} onChange={e => setIctForm(f => ({ ...f, rto: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">RPO (minutes)</label>
                    <input type="number" value={ictForm.rpo} onChange={e => setIctForm(f => ({ ...f, rpo: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={ictForm.failoverCapability} onChange={e => setIctForm(f => ({ ...f, failoverCapability: e.target.checked }))} />
                  Failover Capability
                </label>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={activeTab === 'cloud' ? handleSaveCloud : handleSaveIct} disabled={saving}
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
