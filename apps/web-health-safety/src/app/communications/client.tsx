'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import { MessageSquare, Plus, Search, Users, Send, Eye, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Communication {
  id: string;
  refNumber: string;
  subject: string;
  type: string;
  direction: string;
  content: string;
  recipients?: string;
  sender?: string;
  relatedIncidentId?: string;
  scheduledDate?: string;
  attendees?: string;
  location?: string;
  priority: string;
  status: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParticipationData {
  total: number;
  byType: Record<string, number>;
  byDirection: Record<string, number>;
  byStatus: Record<string, number>;
  workerConsultations: number;
  toolboxTalks: number;
  committeeMeetings: number;
  participationScore: number;
}

const TYPE_LABELS: Record<string, string> = {
  WORKER_CONSULTATION: 'Worker Consultation',
  MANAGEMENT_NOTIFICATION: 'Management Notification',
  REGULATORY: 'Regulatory',
  EXTERNAL_STAKEHOLDER: 'External Stakeholder',
  CONTRACTOR_BRIEFING: 'Contractor Briefing',
  TOOLBOX_TALK: 'Toolbox Talk',
  COMMITTEE_MEETING: 'Committee Meeting',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800',
  RESPONDED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const DIRECTION_COLORS: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-800',
  EXTERNAL: 'bg-purple-100 text-purple-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [participation, setParticipation] = useState<ParticipationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: '',
    type: 'WORKER_CONSULTATION',
    direction: 'INTERNAL',
    content: '',
    recipients: '',
    scheduledDate: '',
    attendees: '',
    location: '',
    priority: 'MEDIUM',
  });

  // Detail modal
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchCommunications = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (directionFilter) params.direction = directionFilter;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/communications', { params });
      setCommunications(res.data.data.items || []);
    } catch {
      setCommunications([]);
    }
  }, [directionFilter, typeFilter, statusFilter, search]);

  const fetchParticipation = useCallback(async () => {
    try {
      const res = await api.get('/communications/participation');
      setParticipation(res.data.data);
    } catch {
      setParticipation(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCommunications(), fetchParticipation()]).finally(() => setLoading(false));
  }, [fetchCommunications, fetchParticipation]);

  const handleCreate = async () => {
    try {
      await api.post('/communications', createForm);
      setShowCreateModal(false);
      setCreateForm({
        subject: '',
        type: 'WORKER_CONSULTATION',
        direction: 'INTERNAL',
        content: '',
        recipients: '',
        scheduledDate: '',
        attendees: '',
        location: '',
        priority: 'MEDIUM',
      });
      fetchCommunications();
      fetchParticipation();
    } catch (err) {
      console.error('Failed to create communication', err);
    }
  };

  const handleViewDetail = async (comm: Communication) => {
    try {
      const res = await api.get(`/communications/${comm.id}`);
      setSelectedComm(res.data.data);
      setShowDetailModal(true);
    } catch {
      setSelectedComm(comm);
      setShowDetailModal(true);
    }
  };

  const handleUpdateStatus = async (commId: string, status: string) => {
    try {
      await api.put(`/communications/${commId}`, { status });
      fetchCommunications();
      fetchParticipation();
      if (selectedComm?.id === commId) {
        setSelectedComm({ ...selectedComm, status });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleRespond = async (commId: string) => {
    const response = prompt('Enter your response:');
    if (!response) return;
    try {
      await api.put(`/communications/${commId}`, { response, status: 'RESPONDED' });
      fetchCommunications();
      fetchParticipation();
      const res = await api.get(`/communications/${commId}`);
      setSelectedComm(res.data.data);
    } catch (err) {
      console.error('Failed to respond', err);
    }
  };

  const handleDelete = async (commId: string) => {
    if (!confirm('Are you sure you want to delete this communication?')) return;
    try {
      await api.delete(`/communications/${commId}`);
      setShowDetailModal(false);
      fetchCommunications();
      fetchParticipation();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Communication Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 45001 Clause 7.4 -- Communication, participation & consultation
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Communication
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Communications</p>
                <p className="text-2xl font-bold">{participation?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Worker Consultations</p>
                <p className="text-2xl font-bold">{participation?.workerConsultations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toolbox Talks</p>
                <p className="text-2xl font-bold">{participation?.toolboxTalks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Participation Score</p>
                <p className="text-2xl font-bold">{participation?.participationScore || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Communications</CardTitle>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={directionFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDirectionFilter(e.target.value)
              }
            >
              <option value="">All Directions</option>
              <option value="INTERNAL">Internal</option>
              <option value="EXTERNAL">External</option>
            </Select>
            <Select
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
          ) : communications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No communications found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-4">Ref</th>
                    <th className="pb-2 pr-4">Subject</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Direction</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Priority</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {communications.map((comm) => (
                    <tr
                      key={comm.id}
                      className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                      onClick={() => handleViewDetail(comm)}
                    >
                      <td className="py-3 pr-4 font-mono text-xs">{comm.refNumber}</td>
                      <td className="py-3 pr-4 font-medium">{comm.subject}</td>
                      <td className="py-3 pr-4">
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 text-xs">
                          {TYPE_LABELS[comm.type] || comm.type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            DIRECTION_COLORS[comm.direction] || 'bg-gray-100 dark:bg-gray-800'
                          }
                        >
                          {comm.direction}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={STATUS_COLORS[comm.status] || 'bg-gray-100 dark:bg-gray-800'}
                        >
                          {comm.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            PRIORITY_COLORS[comm.priority] || 'bg-gray-100 dark:bg-gray-800'
                          }
                        >
                          {comm.priority}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Communication"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label>Subject *</Label>
            <Input
              value={createForm.subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateForm({ ...createForm, subject: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={createForm.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCreateForm({ ...createForm, type: e.target.value })
                }
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Direction *</Label>
              <Select
                value={createForm.direction}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCreateForm({ ...createForm, direction: e.target.value })
                }
              >
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={createForm.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCreateForm({ ...createForm, priority: e.target.value })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={createForm.scheduledDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, scheduledDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Recipients</Label>
              <Input
                value={createForm.recipients}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, recipients: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Attendees</Label>
              <Input
                value={createForm.attendees}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, attendees: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={createForm.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateForm({ ...createForm, location: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea
              rows={4}
              value={createForm.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCreateForm({ ...createForm, content: e.target.value })
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!createForm.subject || !createForm.content}>
            Create
          </Button>
        </ModalFooter>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={
          selectedComm
            ? `${selectedComm.refNumber} -- ${selectedComm.subject}`
            : 'Communication Details'
        }
        size="lg"
      >
        {selectedComm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                <span className="font-medium">
                  {TYPE_LABELS[selectedComm.type] || selectedComm.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Direction:</span>{' '}
                <Badge className={DIRECTION_COLORS[selectedComm.direction] || ''}>
                  {selectedComm.direction}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                <Badge className={STATUS_COLORS[selectedComm.status] || ''}>
                  {selectedComm.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Priority:</span>{' '}
                <Badge className={PRIORITY_COLORS[selectedComm.priority] || ''}>
                  {selectedComm.priority}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Recipients:</span>{' '}
                <span className="font-medium">{selectedComm.recipients || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sender:</span>{' '}
                <span className="font-medium">{selectedComm.sender || '-'}</span>
              </div>
              {selectedComm.scheduledDate && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Scheduled:</span>{' '}
                  <span className="font-medium">
                    {new Date(selectedComm.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedComm.location && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>{' '}
                  <span className="font-medium">{selectedComm.location}</span>
                </div>
              )}
              {selectedComm.attendees && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Attendees:</span>{' '}
                  <span className="font-medium">{selectedComm.attendees}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Content:</span>
              <p className="mt-1 text-sm bg-red-50 p-3 rounded">{selectedComm.content}</p>
            </div>

            {selectedComm.response && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Response:</span>
                <p className="mt-1 text-sm bg-green-50 p-3 rounded">{selectedComm.response}</p>
                {selectedComm.respondedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Responded: {new Date(selectedComm.respondedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {selectedComm.outcome && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Outcome:</span>
                <p className="mt-1 text-sm bg-blue-50 p-3 rounded">{selectedComm.outcome}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              {selectedComm.status === 'DRAFT' && (
                <Button size="sm" onClick={() => handleUpdateStatus(selectedComm.id, 'SENT')}>
                  <Send className="h-3 w-3 mr-1" /> Mark as Sent
                </Button>
              )}
              {selectedComm.status === 'SENT' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedComm.id, 'ACKNOWLEDGED')}
                >
                  <Eye className="h-3 w-3 mr-1" /> Acknowledge
                </Button>
              )}
              {(selectedComm.status === 'SENT' || selectedComm.status === 'ACKNOWLEDGED') && (
                <Button size="sm" variant="outline" onClick={() => handleRespond(selectedComm.id)}>
                  Respond
                </Button>
              )}
              {['RESPONDED', 'ACKNOWLEDGED'].includes(selectedComm.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedComm.id, 'CLOSED')}
                >
                  Close
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedComm.id)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
