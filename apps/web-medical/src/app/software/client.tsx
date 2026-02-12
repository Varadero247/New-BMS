'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Code, Plus, Bug, Package, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface SoftwareProject {
  id: string;
  refNumber: string;
  title: string;
  description?: string;
  safetyClass: string;
  currentPhase: string;
  status: string;
  soupItems?: SoupItem[];
  anomalies?: SoftwareAnomaly[];
  phases?: PhaseDoc[];
  createdAt: string;
}

interface SoupItem {
  id: string;
  title: string;
  vendor?: string;
  version: string;
  intendedUse?: string;
  knownAnomalies?: string;
  riskAcceptable: boolean;
  verifiedDate?: string;
}

interface SoftwareAnomaly {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  resolution?: string;
  createdAt: string;
}

interface PhaseDoc {
  id: string;
  phase: string;
  documentRef?: string;
  content?: string;
  status: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const SAFETY_CLASS_COLORS: Record<string, string> = {
  CLASS_A: 'bg-green-100 text-green-800',
  CLASS_B: 'bg-yellow-100 text-yellow-800',
  CLASS_C: 'bg-red-100 text-red-800',
};

const SEVERITY_COLORS: Record<string, string> = {
  COSMETIC: 'bg-gray-100 text-gray-800',
  MINOR: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const ANOMALY_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  INVESTIGATING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  WONT_FIX: 'bg-gray-100 text-gray-600',
};

const PHASE_DOC_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
};

const PHASE_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  REQUIREMENTS: 'Requirements',
  ARCHITECTURE: 'Architecture',
  DETAILED_DESIGN: 'Detailed Design',
  IMPLEMENTATION: 'Implementation',
  UNIT_TESTING: 'Unit Testing',
  INTEGRATION_TESTING: 'Integration Testing',
  SYSTEM_TESTING: 'System Testing',
  RELEASE: 'Release',
};

const PHASE_ORDER = [
  'PLANNING', 'REQUIREMENTS', 'ARCHITECTURE', 'DETAILED_DESIGN',
  'IMPLEMENTATION', 'UNIT_TESTING', 'INTEGRATION_TESTING',
  'SYSTEM_TESTING', 'RELEASE',
];

export default function SoftwareValidationPage() {
  const [projects, setProjects] = useState<SoftwareProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<SoftwareProject | null>(null);
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'soup' | 'anomalies'>('lifecycle');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', safetyClass: 'CLASS_A' });

  const [showSoupModal, setShowSoupModal] = useState(false);
  const [soupForm, setSoupForm] = useState({ title: '', vendor: '', version: '', intendedUse: '', knownAnomalies: '' });

  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [anomalyForm, setAnomalyForm] = useState({ title: '', description: '', severity: 'MINOR' });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/software/projects');
      setProjects(res.data.data || []);
    } catch { setProjects([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProjects().finally(() => setLoading(false));
  }, [fetchProjects]);

  const handleCreate = async () => {
    try {
      await api.post('/software/projects', createForm);
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', safetyClass: 'CLASS_A' });
      fetchProjects();
    } catch (err) { console.error('Failed to create project', err); }
  };

  const handleSelectProject = async (id: string) => {
    try {
      const res = await api.get(`/software/projects/${id}`);
      setSelectedProject(res.data.data);
      setActiveTab('lifecycle');
    } catch { setSelectedProject(null); }
  };

  const handleAddSoup = async () => {
    if (!selectedProject) return;
    try {
      await api.post(`/software/projects/${selectedProject.id}/soup`, soupForm);
      setShowSoupModal(false);
      setSoupForm({ title: '', vendor: '', version: '', intendedUse: '', knownAnomalies: '' });
      handleSelectProject(selectedProject.id);
    } catch (err) { console.error('Failed to add SOUP item', err); }
  };

  const handleAddAnomaly = async () => {
    if (!selectedProject) return;
    try {
      await api.post(`/software/projects/${selectedProject.id}/anomalies`, anomalyForm);
      setShowAnomalyModal(false);
      setAnomalyForm({ title: '', description: '', severity: 'MINOR' });
      handleSelectProject(selectedProject.id);
    } catch (err) { console.error('Failed to report anomaly', err); }
  };

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const classCProjects = projects.filter(p => p.safetyClass === 'CLASS_C').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Validation</h1>
          <p className="text-sm text-gray-500 mt-1">IEC 62304 Software Life Cycle Management</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-teal-100 rounded-lg"><Code className="h-5 w-5 text-teal-600" /></div><div><p className="text-sm text-gray-500">Total Projects</p><p className="text-2xl font-bold">{projects.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Code className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold">{activeProjects}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><Bug className="h-5 w-5 text-red-600" /></div><div><p className="text-sm text-gray-500">Class C (High Risk)</p><p className="text-2xl font-bold">{classCProjects}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">SOUP Items</p><p className="text-2xl font-bold">{selectedProject?.soupItems?.length ?? '-'}</p></div></div></CardContent></Card>
      </div>

      {selectedProject ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedProject.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 font-mono">{selectedProject.refNumber}</span>
                  <Badge className={SAFETY_CLASS_COLORS[selectedProject.safetyClass] || 'bg-gray-100'}>{selectedProject.safetyClass.replace('_', ' ')}</Badge>
                  <Badge className={STATUS_COLORS[selectedProject.status] || 'bg-gray-100'}>{selectedProject.status}</Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedProject(null)}>Back to List</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 border-b pb-2 mb-4">
              <button onClick={() => setActiveTab('lifecycle')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'lifecycle' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Lifecycle Phases</button>
              <button onClick={() => setActiveTab('soup')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'soup' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>SOUP Items</button>
              <button onClick={() => setActiveTab('anomalies')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'anomalies' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Anomalies</button>
            </div>

            {activeTab === 'lifecycle' && (
              <div>
                <div className="flex items-center justify-center gap-1 py-4 bg-gray-50 rounded-lg overflow-x-auto mb-4">
                  {PHASE_ORDER.map((phase, i) => {
                    const doc = (selectedProject.phases || []).find(p => p.phase === phase);
                    const isCurrent = selectedProject.currentPhase === phase;
                    return (
                      <div key={phase} className="flex items-center gap-1">
                        <div className={`px-3 py-2 rounded text-xs font-medium text-center min-w-[90px] ${isCurrent ? 'ring-2 ring-teal-400 bg-teal-100 text-teal-800' : doc?.status === 'APPROVED' ? 'bg-green-100 text-green-800' : doc?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-500 border'}`}>
                          <div>{PHASE_LABELS[phase] || phase}</div>
                          {doc && <div className="mt-1 text-[10px] opacity-70">{doc.status.replace(/_/g, ' ')}</div>}
                        </div>
                        {i < PHASE_ORDER.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Phase</th><th className="pb-2 pr-4">Document Ref</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Reviewed By</th></tr></thead>
                    <tbody>
                      {PHASE_ORDER.map(phase => {
                        const doc = (selectedProject.phases || []).find(p => p.phase === phase);
                        return (
                          <tr key={phase} className="border-b hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium">{PHASE_LABELS[phase]}</td>
                            <td className="py-3 pr-4 font-mono text-xs">{doc?.documentRef || '-'}</td>
                            <td className="py-3 pr-4"><Badge className={PHASE_DOC_STATUS_COLORS[doc?.status || 'NOT_STARTED'] || 'bg-gray-100'}>{(doc?.status || 'NOT_STARTED').replace(/_/g, ' ')}</Badge></td>
                            <td className="py-3 text-gray-500">{doc?.reviewedBy || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'soup' && (
              <div>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowSoupModal(true)}><Plus className="h-4 w-4 mr-2" /> Add SOUP Item</Button>
                </div>
                {(selectedProject.soupItems || []).length === 0 ? <p className="text-gray-500 text-center py-8">No SOUP items registered.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Title</th><th className="pb-2 pr-4">Vendor</th><th className="pb-2 pr-4">Version</th><th className="pb-2 pr-4">Risk Acceptable</th><th className="pb-2">Verified</th></tr></thead>
                      <tbody>
                        {(selectedProject.soupItems || []).map(item => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium">{item.title}</td>
                            <td className="py-3 pr-4">{item.vendor || '-'}</td>
                            <td className="py-3 pr-4 font-mono text-xs">{item.version}</td>
                            <td className="py-3 pr-4"><Badge className={item.riskAcceptable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{item.riskAcceptable ? 'Yes' : 'No'}</Badge></td>
                            <td className="py-3 text-gray-500">{item.verifiedDate ? new Date(item.verifiedDate).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'anomalies' && (
              <div>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowAnomalyModal(true)}><Bug className="h-4 w-4 mr-2" /> Report Anomaly</Button>
                </div>
                {(selectedProject.anomalies || []).length === 0 ? <p className="text-gray-500 text-center py-8">No anomalies reported.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Ref</th><th className="pb-2 pr-4">Title</th><th className="pb-2 pr-4">Severity</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Created</th></tr></thead>
                      <tbody>
                        {(selectedProject.anomalies || []).map(a => (
                          <tr key={a.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 pr-4 font-mono text-xs">{a.refNumber}</td>
                            <td className="py-3 pr-4 font-medium">{a.title}</td>
                            <td className="py-3 pr-4"><Badge className={SEVERITY_COLORS[a.severity] || 'bg-gray-100'}>{a.severity}</Badge></td>
                            <td className="py-3 pr-4"><Badge className={ANOMALY_STATUS_COLORS[a.status] || 'bg-gray-100'}>{a.status.replace(/_/g, ' ')}</Badge></td>
                            <td className="py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Software Projects</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : projects.length === 0 ? <p className="text-gray-500 text-center py-8">No software projects found.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Ref</th><th className="pb-2 pr-4">Title</th><th className="pb-2 pr-4">Safety Class</th><th className="pb-2 pr-4">Phase</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Created</th></tr></thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectProject(p.id)}>
                        <td className="py-3 pr-4 font-mono text-xs">{p.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{p.title}</td>
                        <td className="py-3 pr-4"><Badge className={SAFETY_CLASS_COLORS[p.safetyClass] || 'bg-gray-100'}>{p.safetyClass.replace('_', ' ')}</Badge></td>
                        <td className="py-3 pr-4 text-xs">{PHASE_LABELS[p.currentPhase] || p.currentPhase}</td>
                        <td className="py-3 pr-4"><Badge className={STATUS_COLORS[p.status] || 'bg-gray-100'}>{p.status}</Badge></td>
                        <td className="py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Software Project" size="lg">
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={createForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={createForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm({ ...createForm, description: e.target.value })} /></div>
          <div>
            <Label>Safety Classification (IEC 62304)</Label>
            <Select value={createForm.safetyClass} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateForm({ ...createForm, safetyClass: e.target.value })}>
              <option value="CLASS_A">Class A - No injury or damage to health</option>
              <option value="CLASS_B">Class B - Non-serious injury</option>
              <option value="CLASS_C">Class C - Death or serious injury possible</option>
            </Select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!createForm.title}>Create Project</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showSoupModal} onClose={() => setShowSoupModal(false)} title="Add SOUP Item" size="lg">
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={soupForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoupForm({ ...soupForm, title: e.target.value })} placeholder="e.g., React 18.2, OpenSSL 3.0" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Vendor</Label><Input value={soupForm.vendor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoupForm({ ...soupForm, vendor: e.target.value })} /></div>
            <div><Label>Version *</Label><Input value={soupForm.version} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoupForm({ ...soupForm, version: e.target.value })} /></div>
          </div>
          <div><Label>Intended Use</Label><Textarea rows={2} value={soupForm.intendedUse} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSoupForm({ ...soupForm, intendedUse: e.target.value })} /></div>
          <div><Label>Known Anomalies</Label><Textarea rows={2} value={soupForm.knownAnomalies} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSoupForm({ ...soupForm, knownAnomalies: e.target.value })} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSoupModal(false)}>Cancel</Button>
          <Button onClick={handleAddSoup} disabled={!soupForm.title || !soupForm.version}>Add SOUP Item</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showAnomalyModal} onClose={() => setShowAnomalyModal(false)} title="Report Software Anomaly" size="lg">
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={anomalyForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnomalyForm({ ...anomalyForm, title: e.target.value })} /></div>
          <div><Label>Description *</Label><Textarea rows={3} value={anomalyForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnomalyForm({ ...anomalyForm, description: e.target.value })} /></div>
          <div>
            <Label>Severity</Label>
            <Select value={anomalyForm.severity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAnomalyForm({ ...anomalyForm, severity: e.target.value })}>
              <option value="COSMETIC">Cosmetic</option>
              <option value="MINOR">Minor</option>
              <option value="MAJOR">Major</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAnomalyModal(false)}>Cancel</Button>
          <Button onClick={handleAddAnomaly} disabled={!anomalyForm.title || !anomalyForm.description}>Report Anomaly</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
