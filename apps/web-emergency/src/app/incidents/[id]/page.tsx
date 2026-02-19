'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import {
  ArrowLeft,
  Flame,
  Clock,
  MapPin,
  Users,
  Radio,
  BookOpen,
  XCircle,
  MessageSquare,
  Package,
  Phone,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface TimelineEntry {
  id: string;
  entryType: string;
  description: string;
  author: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface IncidentDetail {
  id: string;
  referenceNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  premisesName: string;
  premisesId: string;
  declaredAt: string;
  closedAt: string | null;
  commanderName: string;
  description: string;
  location: string;
  evacuationStatus: string;
  peopleAccountedFor: boolean;
  estimatedAffected: number;
  agenciesNotified: string[];
  bcpActivated: boolean;
  timeline: TimelineEntry[];
}

const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-600',
};

const ENTRY_TYPE_ICONS: Record<string, React.ElementType> = {
  DECLARATION: Flame,
  DECISION: CheckCircle,
  RESOURCE: Package,
  COMMUNICATION: MessageSquare,
  STATUS_UPDATE: AlertTriangle,
  AGENCY_NOTIFICATION: Phone,
  BCP_ACTIVATION: BookOpen,
  CLOSURE: XCircle,
};

type LogModalType = 'DECISION' | 'RESOURCE' | 'COMMUNICATION' | 'AGENCY' | 'BCP' | 'CLOSE' | null;

function useElapsedTime(startDate: string) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    function update() {
      const diff = Date.now() - new Date(startDate).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      if (days > 0) setElapsed(`${days}d ${hrs % 24}h ${mins % 60}m`);
      else if (hrs > 0) setElapsed(`${hrs}h ${mins % 60}m`);
      else setElapsed(`${mins}m ${Math.floor((diff % 60000) / 1000)}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startDate]);
  return elapsed;
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logModal, setLogModal] = useState<LogModalType>(null);
  const [logText, setLogText] = useState('');
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const elapsed = useElapsedTime(incident?.declaredAt || new Date().toISOString());
  const pollingRef = useRef<NodeJS.Timeout>();

  const loadIncident = useCallback(async () => {
    try {
      const r = await api.get(`/incidents/${id}`);
      setIncident(r.data.data);
    } catch (e) {
      setError('Failed to load incident details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIncident();
    // Poll every 30 seconds for live updates
    pollingRef.current = setInterval(loadIncident, 30000);
    return () => clearInterval(pollingRef.current);
  }, [loadIncident]);

  async function logEntry(type: string, description: string, extra?: Record<string, any>) {
    setLogSubmitting(true);
    try {
      await api.post(`/incidents/${id}/timeline`, { entryType: type, description, ...extra });
      await loadIncident();
    } catch (e) {
      setError('Failed to log entry.');
    } finally {
      setLogSubmitting(false);
      setLogModal(null);
      setLogText('');
    }
  }

  async function closeIncident() {
    try {
      await api.patch(`/incidents/${id}`, { status: 'CLOSED', closedAt: new Date().toISOString() });
      await loadIncident();
      setCloseConfirm(false);
    } catch {
      setError('Failed to close incident.');
    }
  }

  async function activateBCP() {
    try {
      await api.patch(`/incidents/${id}`, { bcpActivated: true });
      await logEntry('BCP_ACTIVATION', 'Business Continuity Plan activated');
    } catch {
      setError('Failed to activate BCP.');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">{error || 'Incident not found.'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/incidents')}>
              Back to Incidents
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isClosed = incident.status === 'CLOSED';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Top Banner */}
        <div
          className={`px-6 py-4 ${isClosed ? 'bg-gray-700' : ''}`}
          style={
            !isClosed
              ? { backgroundColor: incident.severity === 'CRITICAL' ? '#DC2626' : '#F04B5A' }
              : undefined
          }
        >
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/incidents')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-white/70 text-sm">{incident.referenceNumber}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white border border-white/30"
                  style={{
                    backgroundColor:
                      `${SEVERITY_STYLES[incident.severity] || 'bg-red-600'}`.replace('bg-', ''),
                  }}
                >
                  {incident.severity}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                  {incident.type.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/30 text-white">
                  {incident.status}
                </span>
              </div>
              <p className="text-white font-bold text-xl truncate">{incident.title}</p>
            </div>
            <div className="text-right text-white">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <span className="font-mono font-bold text-lg">{elapsed}</span>
              </div>
              <p className="text-white/60 text-xs">
                Declared: {new Date(incident.declaredAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Situation Panel */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: '#F04B5A' }} />
                    Situation
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Premises</dt>
                      <dd className="font-medium">{incident.premisesName || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Location</dt>
                      <dd className="font-medium">{incident.location || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Status</dt>
                      <dd>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${SEVERITY_STYLES[incident.severity] || 'bg-gray-500'}`}
                        >
                          {incident.status}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Evacuation</dt>
                      <dd className="font-medium">
                        {incident.evacuationStatus?.replace(/_/g, ' ') || 'Unknown'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">All Accounted For</dt>
                      <dd>
                        {incident.peopleAccountedFor ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">No / Unknown</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">BCP Activated</dt>
                      <dd className="font-medium">{incident.bcpActivated ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {incident.commanderName && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" style={{ color: '#F04B5A' }} />
                      Incident Command
                    </h3>
                    <p className="text-sm font-medium">{incident.commanderName}</p>
                    <p className="text-xs text-gray-500">Incident Commander</p>
                  </CardContent>
                </Card>
              )}

              {incident.agenciesNotified && incident.agenciesNotified.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" style={{ color: '#F04B5A' }} />
                      Agencies Notified
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {incident.agenciesNotified.map((agency) => (
                        <span
                          key={agency}
                          className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {agency}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {incident.description && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {incident.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CENTER: Timeline */}
            <div>
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="h-4 w-4" style={{ color: '#F04B5A' }} />
                      Timeline
                    </h3>
                    <span className="text-xs text-gray-400">Updates every 30s</span>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {incident.timeline && incident.timeline.length > 0 ? (
                      [...incident.timeline].reverse().map((entry) => {
                        const EntryIcon = ENTRY_TYPE_ICONS[entry.entryType] || MessageSquare;
                        return (
                          <div key={entry.id} className="flex gap-3 text-sm">
                            <div
                              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: '#FEE2E4' }}
                            >
                              <EntryIcon className="h-3.5 w-3.5" style={{ color: '#F04B5A' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {entry.entryType.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(entry.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                                {entry.description}
                              </p>
                              {entry.author && (
                                <p className="text-xs text-gray-400 mt-0.5">— {entry.author}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No timeline entries yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Action Buttons */}
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start gap-3"
                      variant="outline"
                      onClick={() => {
                        setLogModal('DECISION');
                        setLogText('');
                      }}
                      disabled={isClosed}
                    >
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Log Decision
                    </Button>
                    <Button
                      className="w-full justify-start gap-3"
                      variant="outline"
                      onClick={() => {
                        setLogModal('RESOURCE');
                        setLogText('');
                      }}
                      disabled={isClosed}
                    >
                      <Package className="h-4 w-4 text-amber-500" />
                      Log Resource
                    </Button>
                    <Button
                      className="w-full justify-start gap-3"
                      variant="outline"
                      onClick={() => {
                        setLogModal('COMMUNICATION');
                        setLogText('');
                      }}
                      disabled={isClosed}
                    >
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      Log Communication
                    </Button>
                    <Button
                      className="w-full justify-start gap-3"
                      variant="outline"
                      onClick={() => {
                        setLogModal('AGENCY');
                        setLogText('');
                      }}
                      disabled={isClosed}
                    >
                      <Phone className="h-4 w-4 text-purple-500" />
                      Notify Agencies
                    </Button>
                    <Button
                      className="w-full justify-start gap-3"
                      variant="outline"
                      onClick={activateBCP}
                      disabled={isClosed || incident.bcpActivated}
                    >
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      {incident.bcpActivated ? 'BCP Activated' : 'Activate BCP'}
                    </Button>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        className="w-full justify-start gap-3 text-white font-bold"
                        onClick={() => setCloseConfirm(true)}
                        disabled={isClosed}
                        style={{ backgroundColor: isClosed ? '#9CA3AF' : '#F04B5A' }}
                      >
                        <XCircle className="h-4 w-4" />
                        {isClosed ? 'Incident Closed' : 'Close Incident'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isClosed && incident.closedAt && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Incident Closed</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Closed: {new Date(incident.closedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Log Decision Modal */}
      {logModal === 'DECISION' && (
        <Modal isOpen={true} onClose={() => setLogModal(null)} title="Log Decision" size="lg">
          <div className="space-y-4">
            <div>
              <Label>Decision / Action Taken *</Label>
              <Textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={4}
                placeholder="Describe the decision or action taken..."
                autoFocus
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLogModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => logEntry('DECISION', logText)}
              disabled={logSubmitting || !logText}
              style={{ backgroundColor: '#F04B5A', color: 'white' }}
            >
              {logSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging...
                </>
              ) : (
                'Log Decision'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Log Resource Modal */}
      {logModal === 'RESOURCE' && (
        <Modal isOpen={true} onClose={() => setLogModal(null)} title="Log Resource" size="lg">
          <div className="space-y-4">
            <div>
              <Label>Resource Deployed *</Label>
              <Textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={3}
                placeholder="Describe resources deployed, requested, or released..."
                autoFocus
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLogModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => logEntry('RESOURCE', logText)}
              disabled={logSubmitting || !logText}
              style={{ backgroundColor: '#F04B5A', color: 'white' }}
            >
              {logSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging...
                </>
              ) : (
                'Log Resource'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Log Communication Modal */}
      {logModal === 'COMMUNICATION' && (
        <Modal isOpen={true} onClose={() => setLogModal(null)} title="Log Communication" size="lg">
          <div className="space-y-4">
            <div>
              <Label>Communication Details *</Label>
              <Textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={3}
                placeholder="Log internal or external communication..."
                autoFocus
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLogModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => logEntry('COMMUNICATION', logText)}
              disabled={logSubmitting || !logText}
              style={{ backgroundColor: '#F04B5A', color: 'white' }}
            >
              {logSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging...
                </>
              ) : (
                'Log Communication'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Agency Notification Modal */}
      {logModal === 'AGENCY' && (
        <Modal isOpen={true} onClose={() => setLogModal(null)} title="Notify Agencies" size="lg">
          <div className="space-y-4">
            <div>
              <Label>Agency Notification Details *</Label>
              <Textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={3}
                placeholder="e.g. Fire Brigade (999) notified at 14:32. ETA 10 mins. Reference: BR2024-001"
                autoFocus
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setLogModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => logEntry('AGENCY_NOTIFICATION', logText)}
              disabled={logSubmitting || !logText}
              style={{ backgroundColor: '#F04B5A', color: 'white' }}
            >
              {logSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging...
                </>
              ) : (
                'Log Notification'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Close Incident Confirm */}
      {closeConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setCloseConfirm(false)}
          title="Close Incident"
          size="lg"
        >
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to close incident <strong>{incident.referenceNumber}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will mark the incident as closed. Ensure all actions are complete and all persons
              are accounted for.
            </p>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCloseConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={closeIncident} style={{ backgroundColor: '#F04B5A', color: 'white' }}>
              <XCircle className="h-4 w-4 mr-2" />
              Close Incident
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
