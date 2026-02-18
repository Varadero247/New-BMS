'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import {
  FlaskConical,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Warehouse,
  Activity,
  AlertTriangle,
  Edit,
  Printer,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

type TabKey = 'overview' | 'sds' | 'coshh' | 'inventory' | 'monitoring' | 'incidents';

interface Chemical {
  id: string;
  name: string;
  casNumber: string;
  signalWord: string;
  pictograms: string[];
  riskLevel: string;
  physicalForm: string;
  storageClass: string;
  welLimit: string;
  cmrFlag: boolean;
  description: string;
  ghsClassification: string;
  boilingPoint: string;
  flashPoint: string;
  density: string;
  regulatoryFlags: string[];
}

interface SdsRecord {
  id: string;
  version: string;
  status: string;
  reviewDate: string;
  fileUrl: string;
  supplier: string;
}

interface CoshhRecord {
  id: string;
  reference: string;
  activity: string;
  riskLevel: string;
  status: string;
  reviewDate: string;
}

interface InventoryRecord {
  id: string;
  location: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  lastInspected: string;
}

interface MonitoringRecord {
  id: string;
  date: string;
  location: string;
  measuredValue: number;
  welLimit: number;
  welPercentage: number;
  method: string;
}

interface IncidentRecord {
  id: string;
  title: string;
  severity: string;
  dateOccurred: string;
  type: string;
  riddor: boolean;
}

const GHS_PICTOGRAM_LABELS: Record<string, string> = {
  GHS01: 'Explosive',
  GHS02: 'Flammable',
  GHS03: 'Oxidiser',
  GHS04: 'Compressed Gas',
  GHS05: 'Corrosive',
  GHS06: 'Toxic',
  GHS07: 'Harmful',
  GHS08: 'Health Hazard',
  GHS09: 'Environment',
};

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: FlaskConical },
  { key: 'sds', label: 'Safety Data Sheets', icon: FileText },
  { key: 'coshh', label: 'COSHH Assessments', icon: ShieldAlert },
  { key: 'inventory', label: 'Inventory', icon: Warehouse },
  { key: 'monitoring', label: 'Monitoring', icon: Activity },
  { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
];

export default function ChemicalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [chemical, setChemical] = useState<Chemical | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sdsRecords, setSdsRecords] = useState<SdsRecord[]>([]);
  const [coshhRecords, setCoshhRecords] = useState<CoshhRecord[]>([]);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
  const [monitoringRecords, setMonitoringRecords] = useState<MonitoringRecord[]>([]);
  const [incidentRecords, setIncidentRecords] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/register/${id}`);
        setChemical(res.data.data);
      } catch (e: unknown) {
        setError(
          e.response?.status === 404 ? 'Chemical not found.' : 'Failed to load chemical details.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchTabData = async () => {
      try {
        if (activeTab === 'sds') {
          const res = await api.get(`/sds?chemicalId=${id}`);
          setSdsRecords(res.data.data || []);
        } else if (activeTab === 'coshh') {
          const res = await api.get(`/coshh?chemicalId=${id}`);
          setCoshhRecords(res.data.data || []);
        } else if (activeTab === 'inventory') {
          const res = await api.get(`/inventory?chemicalId=${id}`);
          setInventoryRecords(res.data.data || []);
        } else if (activeTab === 'monitoring') {
          const res = await api.get(`/monitoring?chemicalId=${id}`);
          setMonitoringRecords(res.data.data || []);
        } else if (activeTab === 'incidents') {
          const res = await api.get(`/incidents?chemicalId=${id}`);
          setIncidentRecords(res.data.data || []);
        }
      } catch {
        // Tab data fetch failure is non-critical
      }
    };
    fetchTabData();
  }, [id, activeTab]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !chemical) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error || 'Chemical not found.'}
          </div>
          <button
            onClick={() => router.push('/register')}
            className="mt-4 text-sm text-red-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Register
          </button>
        </main>
      </div>
    );
  }

  const riskBadgeClass: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/register')}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Register
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <FlaskConical className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {chemical.name}
                </h1>
                {chemical.cmrFlag && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    CMR
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                CAS: {chemical.casNumber || 'N/A'} | {chemical.signalWord}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Edit className="h-4 w-4" /> Edit
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex space-x-0 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    GHS Classification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Signal Word</span>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded ${chemical.signalWord === 'DANGER' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}
                      >
                        {chemical.signalWord}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Risk Level</span>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded ${riskBadgeClass[chemical.riskLevel] || ''}`}
                      >
                        {chemical.riskLevel?.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                        Pictograms
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(chemical.pictograms || []).map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs font-medium text-red-700 dark:text-red-300"
                          >
                            {p} - {GHS_PICTOGRAM_LABELS[p] || p}
                          </span>
                        ))}
                      </div>
                    </div>
                    {chemical.ghsClassification && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Classification
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {chemical.ghsClassification}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Physical Properties
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Physical Form
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {chemical.physicalForm || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Boiling Point
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {chemical.boilingPoint || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Flash Point</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {chemical.flashPoint || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Density</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {chemical.density || '-'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Workplace Exposure
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        WEL (8hr TWA)
                      </span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {chemical.welLimit ? `${chemical.welLimit} mg/m3` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        CMR Substance
                      </span>
                      <span
                        className={`text-sm font-medium ${chemical.cmrFlag ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {chemical.cmrFlag ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Storage & Regulatory
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Storage Class
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {chemical.storageClass || '-'}
                      </span>
                    </div>
                    {(chemical.regulatoryFlags || []).length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                          Regulatory Flags
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {chemical.regulatoryFlags.map((flag) => (
                            <span
                              key={flag}
                              className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {chemical.description && (
                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {chemical.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'sds' && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Version
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Supplier
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Review Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sdsRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No SDS records found.
                        </td>
                      </tr>
                    ) : (
                      sdsRecords.map((sds) => (
                        <tr
                          key={sds.id}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {sds.version}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {sds.supplier || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${sds.status === 'CURRENT' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : sds.status === 'SUPERSEDED' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                            >
                              {sds.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {sds.reviewDate ? new Date(sds.reviewDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {sds.fileUrl && (
                              <a
                                href={sds.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:underline text-xs font-medium"
                              >
                                Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'coshh' && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Reference
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Activity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Risk Level
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Review Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coshhRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No COSHH assessments found.
                        </td>
                      </tr>
                    ) : (
                      coshhRecords.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => router.push(`/coshh/${c.id}`)}
                          className="border-b border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100">
                            {c.reference}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {c.activity}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${riskBadgeClass[c.riskLevel] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {c.riskLevel?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : c.status === 'DRAFT' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {c.reviewDate ? new Date(c.reviewDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'inventory' && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Location
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Unit
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Expiry Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Last Inspected
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No inventory records found.
                        </td>
                      </tr>
                    ) : (
                      inventoryRecords.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {inv.location}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {inv.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{inv.unit}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm ${inv.expiryDate && new Date(inv.expiryDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              {inv.expiryDate ? new Date(inv.expiryDate).toLocaleDateString() : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {inv.lastInspected
                              ? new Date(inv.lastInspected).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'monitoring' && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Location
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Measured Value
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        WEL Limit
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        % of WEL
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitoringRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No monitoring records found.
                        </td>
                      </tr>
                    ) : (
                      monitoringRecords.map((m) => (
                        <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {new Date(m.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {m.location}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-100">
                            {m.measuredValue} mg/m3
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                            {m.welLimit} mg/m3
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono font-medium ${m.welPercentage >= 100 ? 'text-red-600' : m.welPercentage >= 75 ? 'text-amber-600' : 'text-green-600'}`}
                            >
                              {m.welPercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {m.method || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'incidents' && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Title
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Severity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        RIDDOR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No incidents recorded.
                        </td>
                      </tr>
                    ) : (
                      incidentRecords.map((inc) => (
                        <tr
                          key={inc.id}
                          className="border-b border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {inc.title}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{inc.type}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${inc.severity === 'CRITICAL' || inc.severity === 'CATASTROPHIC' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : inc.severity === 'MAJOR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : inc.severity === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                            >
                              {inc.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {new Date(inc.dateOccurred).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {inc.riddor && (
                              <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                RIDDOR
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
