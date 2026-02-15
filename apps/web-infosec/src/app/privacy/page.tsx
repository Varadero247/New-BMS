'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { FileText, Eye, UserCheck, Clock, Shield, Plus } from 'lucide-react';
import { api } from '@/lib/api';

type Tab = 'ropa' | 'dpia' | 'dsar' | 'consents' | 'retention';

interface RopaRecord {
  id: string;
  activityName: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string;
  dataSubjects: string;
  recipients: string;
  retentionPeriod: string;
  createdAt: string;
}

interface DpiaRecord {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  riskLevel: string;
  createdAt: string;
  approvedBy: string | null;
}

interface DsarRecord {
  id: string;
  referenceNumber: string;
  requesterName: string;
  requestType: string;
  status: string;
  receivedDate: string;
  deadline: string;
  completedDate: string | null;
}

interface ConsentRecord {
  id: string;
  dataSubject: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: string;
  withdrawnDate: string | null;
}

interface RetentionSchedule {
  id: string;
  dataCategory: string;
  retentionPeriod: string;
  legalBasis: string;
  disposalMethod: string;
  reviewDate: string;
}

const dpiaStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const dsarStatusColors: Record<string, string> = {
  RECEIVED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function getDaysUntilDeadline(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function PrivacyPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'ropa';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [ropaRecords, setRopaRecords] = useState<RopaRecord[]>([]);
  const [dpiaRecords, setDpiaRecords] = useState<DpiaRecord[]>([]);
  const [dsarRecords, setDsarRecords] = useState<DsarRecord[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [retentionSchedules, setRetentionSchedules] = useState<RetentionSchedule[]>([]);

  // Modals
  const [ropaModalOpen, setRopaModalOpen] = useState(false);
  const [dpiaModalOpen, setDpiaModalOpen] = useState(false);
  const [dsarModalOpen, setDsarModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Forms
  const [ropaForm, setRopaForm] = useState({
    activityName: '', purpose: '', legalBasis: 'CONSENT', dataCategories: '', dataSubjects: '', recipients: '', retentionPeriod: '',
  });
  const [dpiaForm, setDpiaForm] = useState({ title: '', description: '' });
  const [dsarForm, setDsarForm] = useState({ requesterName: '', requesterEmail: '', requestType: 'ACCESS' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'ropa': {
          const res = await api.get('/privacy/ropa');
          setRopaRecords(res.data.data || []);
          break;
        }
        case 'dpia': {
          const res = await api.get('/privacy/dpia');
          setDpiaRecords(res.data.data || []);
          break;
        }
        case 'dsar': {
          const res = await api.get('/privacy/dsar');
          setDsarRecords(res.data.data || []);
          break;
        }
        case 'consents': {
          const res = await api.get('/privacy/consents');
          setConsentRecords(res.data.data || []);
          break;
        }
        case 'retention': {
          const res = await api.get('/privacy/retention');
          setRetentionSchedules(res.data.data || []);
          break;
        }
      }
    } catch (err) {
      console.error('Error loading privacy data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRopa() {
    setSaving(true);
    try {
      await api.post('/privacy/ropa', ropaForm);
      setRopaModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creating ROPA record:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateDpia() {
    setSaving(true);
    try {
      await api.post('/privacy/dpia', dpiaForm);
      setDpiaModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creating DPIA:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveDpia(id: string) {
    try {
      await api.put(`/privacy/dpia/${id}/approve`);
      loadData();
    } catch (err) {
      console.error('Error approving DPIA:', err);
    }
  }

  async function handleCreateDsar() {
    setSaving(true);
    try {
      await api.post('/privacy/dsar', dsarForm);
      setDsarModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creating DSAR:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRespondDsar(id: string) {
    try {
      await api.put(`/privacy/dsar/${id}/respond`);
      loadData();
    } catch (err) {
      console.error('Error responding to DSAR:', err);
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'ropa', label: 'ROPA', icon: FileText },
    { key: 'dpia', label: 'DPIA', icon: Eye },
    { key: 'dsar', label: 'DSAR', icon: UserCheck },
    { key: 'consents', label: 'Consents', icon: Shield },
    { key: 'retention', label: 'Retention', icon: Clock },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 27701 privacy information management</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        ) : (
          <>
            {/* ROPA Tab */}
            {activeTab === 'ropa' && (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => { setRopaForm({ activityName: '', purpose: '', legalBasis: 'CONSENT', dataCategories: '', dataSubjects: '', recipients: '', retentionPeriod: '' }); setRopaModalOpen(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4" /> Add Activity
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    {ropaRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Activity</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Legal Basis</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Data Categories</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Data Subjects</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Recipients</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Retention</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ropaRecords.map(r => (
                              <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                                <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{r.activityName}</td>
                                <td className="py-3 px-4 text-gray-600">{r.purpose}</td>
                                <td className="py-3 px-4"><Badge className="bg-teal-100 text-teal-700">{r.legalBasis}</Badge></td>
                                <td className="py-3 px-4 text-gray-600">{r.dataCategories}</td>
                                <td className="py-3 px-4 text-gray-600">{r.dataSubjects}</td>
                                <td className="py-3 px-4 text-gray-600">{r.recipients}</td>
                                <td className="py-3 px-4 text-gray-600">{r.retentionPeriod}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No processing activities recorded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* DPIA Tab */}
            {activeTab === 'dpia' && (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => { setDpiaForm({ title: '', description: '' }); setDpiaModalOpen(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4" /> Create DPIA
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    {dpiaRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ref</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk Level</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Approved By</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dpiaRecords.map(d => (
                              <tr key={d.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                                <td className="py-3 px-4 font-mono text-xs text-gray-600">{d.referenceNumber}</td>
                                <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{d.title}</td>
                                <td className="py-3 px-4">
                                  <Badge className={dpiaStatusColors[d.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{d.status.replace(/_/g, ' ')}</Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{d.riskLevel}</td>
                                <td className="py-3 px-4 text-gray-600">{d.approvedBy || '-'}</td>
                                <td className="py-3 px-4">
                                  {d.status === 'IN_REVIEW' && (
                                    <button onClick={() => handleApproveDpia(d.id)} className="text-teal-600 hover:text-teal-700 text-sm font-medium">Approve</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No DPIAs recorded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* DSAR Tab */}
            {activeTab === 'dsar' && (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => { setDsarForm({ requesterName: '', requesterEmail: '', requestType: 'ACCESS' }); setDsarModalOpen(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4" /> Log DSAR
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    {dsarRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ref</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Requester</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Received</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Deadline</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dsarRecords.map(d => {
                              const daysLeft = getDaysUntilDeadline(d.deadline);
                              return (
                                <tr key={d.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{d.referenceNumber}</td>
                                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{d.requesterName}</td>
                                  <td className="py-3 px-4 text-gray-600">{d.requestType}</td>
                                  <td className="py-3 px-4">
                                    <Badge className={dsarStatusColors[d.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{d.status.replace(/_/g, ' ')}</Badge>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{new Date(d.receivedDate).toLocaleDateString()}</td>
                                  <td className="py-3 px-4">
                                    <span className={`text-sm font-medium ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 14 ? 'text-orange-600' : 'text-gray-600'}`}>
                                      {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {(d.status === 'RECEIVED' || d.status === 'IN_PROGRESS') && (
                                      <button onClick={() => handleRespondDsar(d.id)} className="text-teal-600 hover:text-teal-700 text-sm font-medium">Respond</button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No DSARs recorded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Consents Tab */}
            {activeTab === 'consents' && (
              <Card>
                <CardContent className="pt-6">
                  {consentRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Data Subject</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Consent Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Withdrawn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consentRecords.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{c.dataSubject}</td>
                              <td className="py-3 px-4 text-gray-600">{c.purpose}</td>
                              <td className="py-3 px-4">
                                {c.consentGiven && !c.withdrawnDate ? (
                                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700">Withdrawn</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-600">{new Date(c.consentDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-gray-600">{c.withdrawnDate ? new Date(c.withdrawnDate).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No consent records</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Retention Tab */}
            {activeTab === 'retention' && (
              <Card>
                <CardContent className="pt-6">
                  {retentionSchedules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Data Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Retention Period</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Legal Basis</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Disposal Method</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Review Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {retentionSchedules.map(r => (
                            <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{r.dataCategory}</td>
                              <td className="py-3 px-4 text-gray-600">{r.retentionPeriod}</td>
                              <td className="py-3 px-4 text-gray-600">{r.legalBasis}</td>
                              <td className="py-3 px-4 text-gray-600">{r.disposalMethod}</td>
                              <td className="py-3 px-4 text-gray-600">{new Date(r.reviewDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No retention schedules defined</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ROPA Modal */}
      <Modal isOpen={ropaModalOpen} onClose={() => setRopaModalOpen(false)} title="Add Processing Activity" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Name</label>
            <input type="text" value={ropaForm.activityName} onChange={(e) => setRopaForm({ ...ropaForm, activityName: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
            <input type="text" value={ropaForm.purpose} onChange={(e) => setRopaForm({ ...ropaForm, purpose: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Basis</label>
            <select value={ropaForm.legalBasis} onChange={(e) => setRopaForm({ ...ropaForm, legalBasis: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="CONSENT">Consent</option>
              <option value="CONTRACT">Contract</option>
              <option value="LEGAL_OBLIGATION">Legal Obligation</option>
              <option value="VITAL_INTEREST">Vital Interest</option>
              <option value="PUBLIC_TASK">Public Task</option>
              <option value="LEGITIMATE_INTEREST">Legitimate Interest</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Categories</label>
              <input type="text" value={ropaForm.dataCategories} onChange={(e) => setRopaForm({ ...ropaForm, dataCategories: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Personal, Financial" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Subjects</label>
              <input type="text" value={ropaForm.dataSubjects} onChange={(e) => setRopaForm({ ...ropaForm, dataSubjects: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Employees, Customers" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipients</label>
              <input type="text" value={ropaForm.recipients} onChange={(e) => setRopaForm({ ...ropaForm, recipients: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retention Period</label>
              <input type="text" value={ropaForm.retentionPeriod} onChange={(e) => setRopaForm({ ...ropaForm, retentionPeriod: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., 7 years" />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRopaModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRopa} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Add Activity'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DPIA Modal */}
      <Modal isOpen={dpiaModalOpen} onClose={() => setDpiaModalOpen(false)} title="Create DPIA" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={dpiaForm.title} onChange={(e) => setDpiaForm({ ...dpiaForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={dpiaForm.description} onChange={(e) => setDpiaForm({ ...dpiaForm, description: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDpiaModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDpia} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Create DPIA'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DSAR Modal */}
      <Modal isOpen={dsarModalOpen} onClose={() => setDsarModalOpen(false)} title="Log DSAR" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester Name</label>
            <input type="text" value={dsarForm.requesterName} onChange={(e) => setDsarForm({ ...dsarForm, requesterName: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester Email</label>
            <input type="email" value={dsarForm.requesterEmail} onChange={(e) => setDsarForm({ ...dsarForm, requesterEmail: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Type</label>
            <select value={dsarForm.requestType} onChange={(e) => setDsarForm({ ...dsarForm, requestType: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="ACCESS">Access (Art. 15)</option>
              <option value="RECTIFICATION">Rectification (Art. 16)</option>
              <option value="ERASURE">Erasure (Art. 17)</option>
              <option value="RESTRICTION">Restriction (Art. 18)</option>
              <option value="PORTABILITY">Portability (Art. 20)</option>
              <option value="OBJECTION">Objection (Art. 21)</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDsarModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDsar} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Log DSAR'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
