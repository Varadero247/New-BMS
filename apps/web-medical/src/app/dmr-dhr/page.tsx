'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  FileText,
  Plus,
  Loader2,
  ClipboardList,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

// FDA 21 CFR Part 820.181 — Device Master Record (DMR)
// FDA 21 CFR Part 820.184 — Device History Record (DHR)
// Base URL: /api/medical (see apps/web-medical/src/lib/api.ts)

type DeviceClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIA' | 'CLASS_IIB';
type ActiveTab = 'dmr' | 'dhr';

interface DMR {
  id: string;
  refNumber?: string;
  deviceName: string;
  deviceClass: DeviceClass;
  description?: string;
  specifications?: string;
  productionProcesses?: string;
  createdAt?: string;
}

interface DHR {
  id: string;
  refNumber?: string;
  deviceMasterRecordId: string;
  serialNumber?: string;
  lotNumber?: string;
  manufacturingDate: string;
  quantity?: number;
  productionRecords?: string;
  createdAt?: string;
}

interface DMRForm {
  deviceName: string;
  deviceClass: DeviceClass;
  description: string;
  specifications: string;
  productionProcesses: string;
}

interface DHRForm {
  deviceMasterRecordId: string;
  serialNumber: string;
  lotNumber: string;
  manufacturingDate: string;
  quantity: string;
  productionRecords: string;
}

const DEVICE_CLASSES: DeviceClass[] = ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB'];

const DEVICE_CLASS_LABELS: Record<DeviceClass, string> = {
  CLASS_I: 'Class I — Low risk',
  CLASS_II: 'Class II — Moderate risk',
  CLASS_III: 'Class III — High risk',
  CLASS_IIA: 'Class IIa — Moderate-low risk',
  CLASS_IIB: 'Class IIb — Moderate-high risk',
};

const DEVICE_CLASS_COLORS: Record<DeviceClass, string> = {
  CLASS_I: 'bg-green-100 text-green-700',
  CLASS_II: 'bg-yellow-100 text-yellow-700',
  CLASS_IIA: 'bg-yellow-100 text-yellow-800',
  CLASS_IIB: 'bg-orange-100 text-orange-700',
  CLASS_III: 'bg-red-100 text-red-700',
};

const emptyDMRForm: DMRForm = {
  deviceName: '',
  deviceClass: 'CLASS_II',
  description: '',
  specifications: '',
  productionProcesses: '',
};

const emptyDHRForm: DHRForm = {
  deviceMasterRecordId: '',
  serialNumber: '',
  lotNumber: '',
  manufacturingDate: '',
  quantity: '',
  productionRecords: '',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function DmrDhrPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dmr');

  // DMR state
  const [dmrs, setDmrs] = useState<DMR[]>([]);
  const [dmrsLoading, setDmrsLoading] = useState(true);
  const [dmrModalOpen, setDmrModalOpen] = useState(false);
  const [dmrForm, setDmrForm] = useState<DMRForm>({ ...emptyDMRForm });
  const [dmrSaving, setDmrSaving] = useState(false);
  const [dmrError, setDmrError] = useState('');

  // DHR state
  const [dhrs, setDhrs] = useState<DHR[]>([]);
  const [dhrsLoading, setDhrsLoading] = useState(true);
  const [dhrModalOpen, setDhrModalOpen] = useState(false);
  const [dhrForm, setDhrForm] = useState<DHRForm>({ ...emptyDHRForm });
  const [dhrSaving, setDhrSaving] = useState(false);
  const [dhrError, setDhrError] = useState('');

  // Load DMRs
  const loadDmrs = async () => {
    setDmrsLoading(true);
    try {
      const res = await api.get('/dmr-dhr/dmr/list');
      setDmrs(res.data.data ?? []);
    } catch {
      // Try alternate endpoint
      try {
        const res2 = await api.get('/dmr-dhr/dmrs');
        setDmrs(res2.data.data ?? []);
      } catch {
        setDmrs([]);
      }
    } finally {
      setDmrsLoading(false);
    }
  };

  // Load DHRs
  const loadDhrs = async () => {
    setDhrsLoading(true);
    try {
      const res = await api.get('/dmr-dhr/dhr/list');
      setDhrs(res.data.data ?? []);
    } catch {
      try {
        const res2 = await api.get('/dmr-dhr/dhrs');
        setDhrs(res2.data.data ?? []);
      } catch {
        setDhrs([]);
      }
    } finally {
      setDhrsLoading(false);
    }
  };

  useEffect(() => {
    loadDmrs();
    loadDhrs();
  }, []);

  // Submit DMR
  const handleDmrSubmit = async () => {
    if (!dmrForm.deviceName) { setDmrError('Device name is required.'); return; }
    setDmrSaving(true);
    setDmrError('');
    try {
      await api.post('/dmr-dhr/dmr', {
        deviceName: dmrForm.deviceName,
        deviceClass: dmrForm.deviceClass,
        description: dmrForm.description || undefined,
        specifications: dmrForm.specifications || undefined,
        productionProcesses: dmrForm.productionProcesses || undefined,
      });
      setDmrModalOpen(false);
      setDmrForm({ ...emptyDMRForm });
      loadDmrs();
    } catch (err) {
      setDmrError('Failed to create DMR. Please try again.');
      console.error(err);
    } finally {
      setDmrSaving(false);
    }
  };

  // Submit DHR
  const handleDhrSubmit = async () => {
    if (!dhrForm.deviceMasterRecordId) { setDhrError('Linked DMR is required.'); return; }
    if (!dhrForm.manufacturingDate) { setDhrError('Manufacturing date is required.'); return; }
    setDhrSaving(true);
    setDhrError('');
    try {
      await api.post('/dmr-dhr/dhr', {
        deviceMasterRecordId: dhrForm.deviceMasterRecordId,
        serialNumber: dhrForm.serialNumber || undefined,
        lotNumber: dhrForm.lotNumber || undefined,
        manufacturingDate: new Date(dhrForm.manufacturingDate).toISOString(),
        quantity: dhrForm.quantity ? parseInt(dhrForm.quantity, 10) : undefined,
        productionRecords: dhrForm.productionRecords || undefined,
      });
      setDhrModalOpen(false);
      setDhrForm({ ...emptyDHRForm });
      loadDhrs();
    } catch (err) {
      setDhrError('Failed to create DHR. Please try again.');
      console.error(err);
    } finally {
      setDhrSaving(false);
    }
  };

  const linkedDmr = (id: string) => dmrs.find((d) => d.id === id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Device Master Record / Device History Record
            </h1>
            <p className="text-sm text-gray-500">
              FDA 21 CFR Part 820.181 (DMR) &amp; 820.184 (DHR) — Medical Device Documentation
            </p>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {dmrsLoading ? '—' : dmrs.length}
              </p>
              <p className="text-sm text-gray-500">Device Master Records</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {dhrsLoading ? '—' : dhrs.length}
              </p>
              <p className="text-sm text-gray-500">Device History Records</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['dmr', 'dhr'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab === 'dmr' ? 'Device Master Records (DMR)' : 'Device History Records (DHR)'}
          </button>
        ))}
      </div>

      {/* DMR Tab */}
      {activeTab === 'dmr' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Device Master Records
              </CardTitle>
              <button
                onClick={() => { setDmrForm({ ...emptyDMRForm }); setDmrError(''); setDmrModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                New DMR
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dmrsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : dmrs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No Device Master Records found. Create the first one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Ref #</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Device Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Class</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dmrs.map((dmr) => (
                      <tr key={dmr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {dmr.refNumber ?? dmr.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{dmr.deviceName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEVICE_CLASS_COLORS[dmr.deviceClass] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {dmr.deviceClass.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {dmr.description ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(dmr.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DHR Tab */}
      {activeTab === 'dhr' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Device History Records
              </CardTitle>
              <button
                onClick={() => {
                  setDhrForm({ ...emptyDHRForm, deviceMasterRecordId: dmrs[0]?.id ?? '' });
                  setDhrError('');
                  setDhrModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                New DHR
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dhrsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : dhrs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No Device History Records found. Create the first one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Ref #</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Serial / Lot</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Linked DMR</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Mfg Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dhrs.map((dhr) => {
                      const dm = linkedDmr(dhr.deviceMasterRecordId);
                      return (
                        <tr key={dhr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {dhr.refNumber ?? dhr.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {dhr.serialNumber
                              ? `S/N: ${dhr.serialNumber}`
                              : dhr.lotNumber
                                ? `Lot: ${dhr.lotNumber}`
                                : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {dm ? (
                              <span className="text-indigo-600 font-medium">{dm.deviceName}</span>
                            ) : (
                              <span className="font-mono text-xs text-gray-400">
                                {dhr.deviceMasterRecordId.slice(0, 8)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(dhr.manufacturingDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{dhr.quantity ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(dhr.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DMR Modal */}
      {dmrModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Create Device Master Record (DMR)</CardTitle>
                <button onClick={() => setDmrModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">FDA 21 CFR Part 820.181</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {dmrError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {dmrError}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-700">Device Name *</label>
                <input
                  value={dmrForm.deviceName}
                  onChange={(e) => setDmrForm((p) => ({ ...p, deviceName: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Insulin Pump Model X200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Device Class *</label>
                <select
                  value={dmrForm.deviceClass}
                  onChange={(e) => setDmrForm((p) => ({ ...p, deviceClass: e.target.value as DeviceClass }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEVICE_CLASSES.map((dc) => (
                    <option key={dc} value={dc}>
                      {DEVICE_CLASS_LABELS[dc]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Description</label>
                <textarea
                  value={dmrForm.description}
                  onChange={(e) => setDmrForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of the device and intended use…"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Specifications</label>
                <textarea
                  value={dmrForm.specifications}
                  onChange={(e) => setDmrForm((p) => ({ ...p, specifications: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Device specifications, dimensions, materials…"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Production Processes</label>
                <textarea
                  value={dmrForm.productionProcesses}
                  onChange={(e) => setDmrForm((p) => ({ ...p, productionProcesses: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Manufacturing processes, sterilization methods…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDmrSubmit}
                  disabled={dmrSaving || !dmrForm.deviceName}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {dmrSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {dmrSaving ? 'Creating…' : 'Create DMR'}
                </button>
                <button
                  onClick={() => setDmrModalOpen(false)}
                  className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DHR Modal */}
      {dhrModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Create Device History Record (DHR)</CardTitle>
                <button onClick={() => setDhrModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">FDA 21 CFR Part 820.184</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {dhrError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {dhrError}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-700">Linked Device Master Record *</label>
                <select
                  value={dhrForm.deviceMasterRecordId}
                  onChange={(e) => setDhrForm((p) => ({ ...p, deviceMasterRecordId: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a DMR…</option>
                  {dmrs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.deviceName} ({d.deviceClass.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">Serial Number</label>
                  <input
                    value={dhrForm.serialNumber}
                    onChange={(e) => setDhrForm((p) => ({ ...p, serialNumber: e.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. SN-2026-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Lot Number</label>
                  <input
                    value={dhrForm.lotNumber}
                    onChange={(e) => setDhrForm((p) => ({ ...p, lotNumber: e.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. LOT-2026-A"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">Manufacturing Date *</label>
                  <input
                    type="date"
                    value={dhrForm.manufacturingDate}
                    onChange={(e) => setDhrForm((p) => ({ ...p, manufacturingDate: e.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={dhrForm.quantity}
                    onChange={(e) => setDhrForm((p) => ({ ...p, quantity: e.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Units produced"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Production Records</label>
                <textarea
                  value={dhrForm.productionRecords}
                  onChange={(e) => setDhrForm((p) => ({ ...p, productionRecords: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="QC inspection results, test data, acceptance criteria…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDhrSubmit}
                  disabled={dhrSaving || !dhrForm.deviceMasterRecordId || !dhrForm.manufacturingDate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {dhrSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {dhrSaving ? 'Creating…' : 'Create DHR'}
                </button>
                <button
                  onClick={() => setDhrModalOpen(false)}
                  className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
