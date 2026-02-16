'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { ShieldAlert, Plus, Search, AlertTriangle, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CounterfeitReport {
  id: string;
  refNumber: string;
  partNumber: string;
  partName?: string;
  manufacturer: string;
  distributor?: string;
  lotNumber?: string;
  serialNumber?: string;
  suspicionReason: string;
  evidence?: string;
  investigationNotes?: string;
  status: string;
  disposition?: string;
  dispositionDate?: string;
  dispositionBy?: string;
  quarantineId?: string;
  gidepReported?: boolean;
  gidepRef?: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApprovedSource {
  id: string;
  companyName: string;
  cageCode?: string;
  partNumbers: string[];
  certifications: string[];
  approvalDate: string;
  expiryDate?: string;
  notes?: string;
  riskRating: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  REPORTED: 'bg-yellow-100 text-yellow-800',
  UNDER_INVESTIGATION: 'bg-blue-100 text-blue-800',
  CONFIRMED_COUNTERFEIT: 'bg-red-100 text-red-800',
  CONFIRMED_AUTHENTIC: 'bg-green-100 text-green-800',
  INCONCLUSIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CounterfeitPreventionPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'sources'>('reports');
  const [reports, setReports] = useState<CounterfeitReport[]>([]);
  const [sources, setSources] = useState<ApprovedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    partNumber: '', partName: '', manufacturer: '', distributor: '',
    lotNumber: '', serialNumber: '', suspicionReason: '', evidence: '',
  });

  // Source modal
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceForm, setSourceForm] = useState({
    companyName: '', cageCode: '', partNumbers: '', certifications: '',
    approvalDate: '', expiryDate: '', notes: '', riskRating: 'LOW',
  });

  // Detail modal
  const [selectedReport, setSelectedReport] = useState<CounterfeitReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.partNumber = search;
      const res = await api.get('/counterfeit/reports', { params });
      setReports(res.data.data.items || []);
    } catch {
      setReports([]);
    }
  }, [statusFilter, search]);

  const fetchSources = useCallback(async () => {
    try {
      const res = await api.get('/counterfeit/approved-sources', { params: { limit: '50' } });
      setSources(res.data.data.items || []);
    } catch {
      setSources([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchReports(), fetchSources()]).finally(() => setLoading(false));
  }, [fetchReports, fetchSources]);

  const handleCreateReport = async () => {
    try {
      await api.post('/counterfeit/reports', reportForm);
      setShowReportModal(false);
      setReportForm({ partNumber: '', partName: '', manufacturer: '', distributor: '', lotNumber: '', serialNumber: '', suspicionReason: '', evidence: '' });
      fetchReports();
    } catch (err) {
      console.error('Failed to create report', err);
    }
  };

  const handleCreateSource = async () => {
    try {
      await api.post('/counterfeit/approved-sources', {
        ...sourceForm,
        partNumbers: sourceForm.partNumbers.split(',').map(s => s.trim()).filter(Boolean),
        certifications: sourceForm.certifications.split(',').map(s => s.trim()).filter(Boolean),
      });
      setShowSourceModal(false);
      setSourceForm({ companyName: '', cageCode: '', partNumbers: '', certifications: '', approvalDate: '', expiryDate: '', notes: '', riskRating: 'LOW' });
      fetchSources();
    } catch (err) {
      console.error('Failed to create source', err);
    }
  };

  const handleQuarantine = async (reportId: string) => {
    const location = prompt('Enter quarantine location:');
    const qty = prompt('Enter quantity:');
    if (!location || !qty) return;
    try {
      await api.post(`/counterfeit/reports/${reportId}/quarantine`, {
        location, quantity: parseInt(qty, 10),
      });
      fetchReports();
    } catch (err) {
      console.error('Failed to quarantine', err);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await api.put(`/counterfeit/reports/${reportId}`, { status });
      fetchReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Stats
  const totalReports = reports.length;
  const underInvestigation = reports.filter(r => r.status === 'UNDER_INVESTIGATION').length;
  const confirmed = reports.filter(r => r.status === 'CONFIRMED_COUNTERFEIT').length;
  const totalSources = sources.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Counterfeit Parts Prevention</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AS6174 / SAE AS6081 — Suspect & counterfeit part management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold">{totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p>
                <p className="text-2xl font-bold">{underInvestigation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed Counterfeit</p>
                <p className="text-2xl font-bold">{confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved Sources</p>
                <p className="text-2xl font-bold">{totalSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          Suspect Part Reports
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'sources' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          Approved Sources
        </button>
      </div>

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Suspect Part Reports</CardTitle>
              <Button onClick={() => setShowReportModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Report Suspect Part
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by part number..." placeholder="Search by part number..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="CONFIRMED_COUNTERFEIT">Confirmed Counterfeit</option>
                <option value="CONFIRMED_AUTHENTIC">Confirmed Authentic</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No suspect part reports found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Part Number</th>
                      <th className="pb-2 pr-4">Manufacturer</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Disposition</th>
                      <th className="pb-2 pr-4">Created</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer" onClick={() => { setSelectedReport(report); setShowDetailModal(true); }}>
                        <td className="py-3 pr-4 font-mono text-xs">{report.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{report.partNumber}</td>
                        <td className="py-3 pr-4">{report.manufacturer}</td>
                        <td className="py-3 pr-4">
                          <Badge className={STATUS_COLORS[report.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'}>
                            {report.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{report.disposition || '-'}</td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {report.status === 'REPORTED' && (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(report.id, 'UNDER_INVESTIGATION')}>
                                Investigate
                              </Button>
                            )}
                            {report.status === 'UNDER_INVESTIGATION' && !report.quarantineId && (
                              <Button variant="outline" size="sm" onClick={() => handleQuarantine(report.id)}>
                                Quarantine
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SOURCES TAB */}
      {activeTab === 'sources' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Approved Source List</CardTitle>
              <Button onClick={() => setShowSourceModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Source
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : sources.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No approved sources found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Company</th>
                      <th className="pb-2 pr-4">CAGE Code</th>
                      <th className="pb-2 pr-4">Part Numbers</th>
                      <th className="pb-2 pr-4">Risk Rating</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Approval Date</th>
                      <th className="pb-2">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 pr-4 font-medium">{source.companyName}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{source.cageCode || '-'}</td>
                        <td className="py-3 pr-4 text-xs">{source.partNumbers.slice(0, 3).join(', ')}{source.partNumbers.length > 3 ? '...' : ''}</td>
                        <td className="py-3 pr-4">
                          <Badge className={RISK_COLORS[source.riskRating] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'}>
                            {source.riskRating}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-green-100 text-green-800">{source.status}</Badge>
                        </td>
                        <td className="py-3 pr-4">{new Date(source.approvalDate).toLocaleDateString()}</td>
                        <td className="py-3">{source.expiryDate ? new Date(source.expiryDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE REPORT MODAL */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Suspect Part" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Part Number *</Label><Input value={reportForm.partNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, partNumber: e.target.value })} /></div>
            <div><Label>Part Name</Label><Input value={reportForm.partName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, partName: e.target.value })} /></div>
            <div><Label>Manufacturer *</Label><Input value={reportForm.manufacturer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, manufacturer: e.target.value })} /></div>
            <div><Label>Distributor</Label><Input value={reportForm.distributor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, distributor: e.target.value })} /></div>
            <div><Label>Lot Number</Label><Input value={reportForm.lotNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, lotNumber: e.target.value })} /></div>
            <div><Label>Serial Number</Label><Input value={reportForm.serialNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportForm({ ...reportForm, serialNumber: e.target.value })} /></div>
          </div>
          <div><Label>Reason for Suspicion *</Label><Textarea rows={3} value={reportForm.suspicionReason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportForm({ ...reportForm, suspicionReason: e.target.value })} /></div>
          <div><Label>Evidence</Label><Textarea rows={2} value={reportForm.evidence} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportForm({ ...reportForm, evidence: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button onClick={handleCreateReport} disabled={!reportForm.partNumber || !reportForm.manufacturer || !reportForm.suspicionReason}>
            Submit Report
          </Button>
        </ModalFooter>
      </Modal>

      {/* CREATE SOURCE MODAL */}
      <Modal isOpen={showSourceModal} onClose={() => setShowSourceModal(false)} title="Add Approved Source" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Company Name *</Label><Input value={sourceForm.companyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, companyName: e.target.value })} /></div>
            <div><Label>CAGE Code</Label><Input value={sourceForm.cageCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, cageCode: e.target.value })} /></div>
            <div><Label>Part Numbers (comma-separated)</Label><Input value={sourceForm.partNumbers} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, partNumbers: e.target.value })} /></div>
            <div><Label>Certifications (comma-separated)</Label><Input value={sourceForm.certifications} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, certifications: e.target.value })} /></div>
            <div><Label>Approval Date *</Label><Input type="date" value={sourceForm.approvalDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, approvalDate: e.target.value })} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={sourceForm.expiryDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceForm({ ...sourceForm, expiryDate: e.target.value })} /></div>
          </div>
          <div>
            <Label>Risk Rating</Label>
            <Select value={sourceForm.riskRating} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSourceForm({ ...sourceForm, riskRating: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea rows={2} value={sourceForm.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSourceForm({ ...sourceForm, notes: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSourceModal(false)}>Cancel</Button>
          <Button onClick={handleCreateSource} disabled={!sourceForm.companyName || !sourceForm.approvalDate}>
            Add Source
          </Button>
        </ModalFooter>
      </Modal>

      {/* REPORT DETAIL MODAL */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedReport ? `Report ${selectedReport.refNumber}` : 'Report Details'} size="lg">
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Part Number:</span> <span className="font-medium">{selectedReport.partNumber}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Part Name:</span> <span className="font-medium">{selectedReport.partName || '-'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Manufacturer:</span> <span className="font-medium">{selectedReport.manufacturer}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Distributor:</span> <span className="font-medium">{selectedReport.distributor || '-'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Lot Number:</span> <span className="font-medium">{selectedReport.lotNumber || '-'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Serial Number:</span> <span className="font-medium">{selectedReport.serialNumber || '-'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Status:</span> <Badge className={STATUS_COLORS[selectedReport.status] || 'bg-gray-100 dark:bg-gray-800'}>{selectedReport.status.replace(/_/g, ' ')}</Badge></div>
              <div><span className="text-gray-500 dark:text-gray-400">Disposition:</span> <span className="font-medium">{selectedReport.disposition || '-'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">GIDEP Reported:</span> <span className="font-medium">{selectedReport.gidepReported ? 'Yes' : 'No'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Quarantined:</span> <span className="font-medium">{selectedReport.quarantineId ? 'Yes' : 'No'}</span></div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Reason for Suspicion:</span>
              <p className="mt-1 text-sm bg-red-50 p-3 rounded">{selectedReport.suspicionReason}</p>
            </div>
            {selectedReport.evidence && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Evidence:</span>
                <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">{selectedReport.evidence}</p>
              </div>
            )}
            {selectedReport.investigationNotes && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Investigation Notes:</span>
                <p className="mt-1 text-sm bg-blue-50 p-3 rounded">{selectedReport.investigationNotes}</p>
              </div>
            )}

            {/* Status progression buttons */}
            <div className="flex gap-2 pt-2 border-t">
              {selectedReport.status === 'REPORTED' && (
                <Button size="sm" onClick={() => handleUpdateStatus(selectedReport.id, 'UNDER_INVESTIGATION')}>Start Investigation</Button>
              )}
              {selectedReport.status === 'UNDER_INVESTIGATION' && (
                <>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(selectedReport.id, 'CONFIRMED_COUNTERFEIT')}>Confirm Counterfeit</Button>
                  <Button size="sm" onClick={() => handleUpdateStatus(selectedReport.id, 'CONFIRMED_AUTHENTIC')}>Confirm Authentic</Button>
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedReport.id, 'INCONCLUSIVE')}>Inconclusive</Button>
                </>
              )}
              {['CONFIRMED_COUNTERFEIT', 'CONFIRMED_AUTHENTIC', 'INCONCLUSIVE'].includes(selectedReport.status) && (
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedReport.id, 'CLOSED')}>Close Report</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
