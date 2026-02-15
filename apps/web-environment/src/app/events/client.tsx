'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  AIDisclosure,
} from '@ims/ui';
import { Plus, AlertTriangle, Loader2, Search, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: 'SPILL_RELEASE', label: 'Spill / Release' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'REGULATORY_EXCEEDANCE', label: 'Regulatory Exceedance' },
  { value: 'STAKEHOLDER_COMPLAINT', label: 'Stakeholder Complaint' },
  { value: 'NON_CONFORMANCE', label: 'Non-Conformance' },
  { value: 'ENVIRONMENTAL_EMERGENCY', label: 'Environmental Emergency' },
  { value: 'PERMIT_BREACH', label: 'Permit Breach' },
  { value: 'WASTE_MISMANAGEMENT', label: 'Waste Mismanagement' },
  { value: 'NOISE_COMPLAINT', label: 'Noise Complaint' },
  { value: 'OTHER', label: 'Other' },
] as const;

const SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'CATASTROPHIC', label: 'Catastrophic', color: 'bg-purple-100 text-purple-800' },
] as const;

const STATUSES = [
  { value: 'REPORTED', label: 'Reported' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'CONTAINED', label: 'Contained' },
  { value: 'REMEDIATED', label: 'Remediated' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

const TYPE_FILTER_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'SPILL_RELEASE', label: 'Spill / Release' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'REGULATORY_EXCEEDANCE', label: 'Exceedance' },
  { value: 'STAKEHOLDER_COMPLAINT', label: 'Complaint' },
  { value: 'NON_CONFORMANCE', label: 'Non-Conformance' },
  { value: 'OTHER', label: 'Other' },
] as const;

const MEDIA_OPTIONS = [
  'AIR', 'WATER', 'GROUNDWATER', 'SOIL', 'BIODIVERSITY', 'HUMAN_HEALTH', 'NOISE', 'OTHER',
] as const;

const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5 Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone / Ishikawa' },
  { value: 'BOWTIE', label: 'Bowtie Analysis' },
  { value: 'TIMELINE', label: 'Timeline Analysis' },
  { value: 'OTHER', label: 'Other' },
] as const;

const REPUTATIONAL_IMPACT_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface EnvEvent {
  id: string;
  referenceNumber: string;
  eventType: string;
  severity: string;
  regulatoryNotification: boolean;
  regulatoryBody: string | null;
  notificationReference: string | null;
  dateOfEvent: string;
  dateReported: string;
  location: string;
  gpsCoordinates: string | null;
  department: string;
  reportedBy: string;
  description: string;
  immediateCause: string | null;
  contributingFactors: string | null;
  mediaAffected: string[];
  substanceInvolved: string | null;
  quantityReleased: number | null;
  quantityUnit: string | null;
  concentration: string | null;
  receptorDistance: string | null;
  areaSecured: boolean | null;
  immediateActions: string | null;
  spillKitUsed: boolean | null;
  emergencyServicesCalled: boolean | null;
  materialsUsed: string | null;
  cleanupDuration: string | null;
  rcaMethod: string | null;
  rootCause: string | null;
  environmentalDamage: string | null;
  biodiversityImpact: boolean | null;
  waterCourseImpact: boolean | null;
  airQualityImpact: boolean | null;
  remediationCost: number | null;
  reputationalImpact: string | null;
  capaRequired: boolean | null;
  preventiveMeasures: string | null;
  monitoringRequired: boolean | null;
  followUpDate: string | null;
  status: string;
  lessonsLearned: string | null;
  aiRootCauseAnalysis: string | null;
  aiImmediateActions: string | null;
  aiRegulatoryObligations: string | null;
  aiEnvironmentalImpact: string | null;
  aiPreventiveMeasures: string | null;
  aiCAPARecommendations: string | null;
  aiLessonsLearned: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

interface EventForm {
  eventType: string;
  severity: string;
  regulatoryNotification: boolean;
  regulatoryBody: string;
  notificationReference: string;
  dateOfEvent: string;
  dateReported: string;
  location: string;
  gpsCoordinates: string;
  department: string;
  reportedBy: string;
  description: string;
  immediateCause: string;
  contributingFactors: string;
  mediaAffected: string[];
  substanceInvolved: string;
  quantityReleased: string;
  quantityUnit: string;
  concentration: string;
  receptorDistance: string;
  areaSecured: boolean;
  immediateActions: string;
  spillKitUsed: boolean;
  emergencyServicesCalled: boolean;
  materialsUsed: string;
  cleanupDuration: string;
  rcaMethod: string;
  rootCause: string;
  environmentalDamage: string;
  biodiversityImpact: boolean;
  waterCourseImpact: boolean;
  airQualityImpact: boolean;
  remediationCost: string;
  reputationalImpact: string;
  capaRequired: boolean;
  preventiveMeasures: string;
  monitoringRequired: boolean;
  followUpDate: string;
  status: string;
  lessonsLearned: string;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm: EventForm = {
  eventType: 'SPILL_RELEASE',
  severity: 'MINOR',
  regulatoryNotification: false,
  regulatoryBody: '',
  notificationReference: '',
  dateOfEvent: `${today}T09:00`,
  dateReported: today,
  location: '',
  gpsCoordinates: '',
  department: '',
  reportedBy: '',
  description: '',
  immediateCause: '',
  contributingFactors: '',
  mediaAffected: [],
  substanceInvolved: '',
  quantityReleased: '',
  quantityUnit: '',
  concentration: '',
  receptorDistance: '',
  areaSecured: false,
  immediateActions: '',
  spillKitUsed: false,
  emergencyServicesCalled: false,
  materialsUsed: '',
  cleanupDuration: '',
  rcaMethod: '',
  rootCause: '',
  environmentalDamage: '',
  biodiversityImpact: false,
  waterCourseImpact: false,
  airQualityImpact: false,
  remediationCost: '',
  reputationalImpact: '',
  capaRequired: false,
  preventiveMeasures: '',
  monitoringRequired: false,
  followUpDate: '',
  status: 'REPORTED',
  lessonsLearned: '',
};

// ─── Component ────────────────────────────────────────────────────

export default function EventsClient() {
  const [events, setEvents] = useState<EnvEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<EventForm>({ ...emptyForm });
  const [section, setSection] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/events', { params });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function openModal() {
    setForm({ ...emptyForm, dateOfEvent: `${new Date().toISOString().split('T')[0]}T09:00`, dateReported: new Date().toISOString().split('T')[0] });
    setSection(0);
    setAiGenerated(false);
    setShowModal(true);
  }

  function updateForm(field: keyof EventForm, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleMediaAffected(media: string) {
    setForm(prev => {
      const current = prev.mediaAffected;
      const updated = current.includes(media)
        ? current.filter(m => m !== media)
        : [...current, media];
      return { ...prev, mediaAffected: updated };
    });
  }

  async function generateAiAnalysis() {
    if (form.description.length < 20) return;
    setAiLoading(true);
    try {
      const res = await api.post('/events/ai-analyse', {
        eventType: form.eventType,
        severity: form.severity,
        description: form.description,
        location: form.location,
        mediaAffected: form.mediaAffected,
        substanceInvolved: form.substanceInvolved,
      });
      const data = res.data.data || res.data;
      setForm(prev => ({
        ...prev,
        rootCause: data.rootCauseAnalysis || prev.rootCause,
        immediateActions: data.immediateActions || prev.immediateActions,
        preventiveMeasures: data.preventiveMeasures || prev.preventiveMeasures,
        lessonsLearned: data.lessonsLearned || prev.lessonsLearned,
      }));
      setAiGenerated(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.description || !form.location || !form.department || !form.reportedBy) return;
    setSubmitting(true);
    try {
      await api.post('/events', {
        ...form,
        dateOfEvent: new Date(form.dateOfEvent).toISOString(),
        dateReported: new Date(form.dateReported).toISOString(),
        quantityReleased: form.quantityReleased ? parseFloat(form.quantityReleased) : undefined,
        remediationCost: form.remediationCost ? parseFloat(form.remediationCost) : undefined,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
        rcaMethod: form.rcaMethod || undefined,
        reputationalImpact: form.reputationalImpact || undefined,
        aiGenerated: aiGenerated,
      });
      setShowModal(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    const s = SEVERITIES.find(sv => sv.value === severity);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REPORTED': return 'bg-red-100 text-red-800';
      case 'UNDER_INVESTIGATION': return 'bg-yellow-100 text-yellow-800';
      case 'CONTAINED': return 'bg-blue-100 text-blue-800';
      case 'REMEDIATED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  // Filter events by type tab and status
  const filteredEvents = events.filter(e => {
    if (typeFilter !== 'ALL' && e.eventType !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.referenceNumber?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const metrics = {
    total: events.length,
    open: events.filter(e => e.status !== 'CLOSED' && e.status !== 'REMEDIATED').length,
    underInvestigation: events.filter(e => e.status === 'UNDER_INVESTIGATION').length,
    criticalMajor: events.filter(e => e.severity === 'CRITICAL' || e.severity === 'MAJOR' || e.severity === 'CATASTROPHIC').length,
  };

  const sections = ['Event Classification & Details', 'Environmental Impact', 'Investigation & Impact Assessment', 'Actions & AI Analysis'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Environmental Events</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage environmental incidents, spills, and non-conformances</p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Report Event
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{metrics.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{metrics.open}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{metrics.underInvestigation}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{metrics.criticalMajor}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Critical / Major</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b">
          {TYPE_FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                typeFilter === tab.value
                  ? 'border-green-500 text-green-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.value === 'ALL'
                ? ` (${events.length})`
                : ` (${events.filter(e => e.eventType === tab.value).length})`
              }
            </button>
          ))}
        </div>

        {/* Status Pipeline & Search */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Status Pipeline Indicators */}
        <div className="flex gap-2 mb-6">
          {STATUSES.map((s, i) => (
            <div key={s.value} className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s.value)}`}>
                {s.label} ({events.filter(e => e.status === s.value).length})
              </div>
              {i < STATUSES.length - 1 && (
                <span className="mx-1 text-gray-300 dark:text-gray-600">&rarr;</span>
              )}
            </div>
          ))}
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Events ({filteredEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 border rounded-lg hover:border-green-300 transition-colors cursor-pointer ${
                      event.severity === 'CRITICAL' || event.severity === 'CATASTROPHIC'
                        ? 'border-l-4 border-l-red-500 border-gray-200'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{event.referenceNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {EVENT_TYPES.find(t => t.value === event.eventType)?.label || event.eventType.replace(/_/g, ' ')}
                          </Badge>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.replace(/_/g, ' ')}
                          </span>
                          {event.regulatoryNotification && (
                            <Badge variant="destructive" className="text-xs">Regulatory</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">{event.location} &mdash; {event.department}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="text-sm text-gray-400 dark:text-gray-500 text-right ml-4 shrink-0">
                        <div>{new Date(event.dateOfEvent).toLocaleDateString()}</div>
                        <div className="text-xs">Date of Event</div>
                        <div className="text-xs mt-1 text-gray-300 dark:text-gray-600">Reported by {event.reportedBy}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No environmental events found</p>
                <Button variant="outline" className="mt-4" onClick={openModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Event Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Environmental Event" size="full">
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 border-b overflow-x-auto">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setSection(i)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  section === i
                    ? 'border-green-500 text-green-700'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {/* Tab 1: Event Classification & Details */}
            {section === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type *</Label>
                    <Select value={form.eventType} onChange={e => updateForm('eventType', e.target.value)}>
                      {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Severity *</Label>
                    <Select value={form.severity} onChange={e => updateForm('severity', e.target.value)}>
                      {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Regulatory Notification</h3>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={form.regulatoryNotification}
                      onChange={e => updateForm('regulatoryNotification', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Regulatory notification required</span>
                  </label>
                  {form.regulatoryNotification && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Regulatory Body</Label>
                        <Input
                          value={form.regulatoryBody}
                          onChange={e => updateForm('regulatoryBody', e.target.value)}
                          placeholder="e.g., Environment Agency"
                        />
                      </div>
                      <div>
                        <Label>Notification Reference</Label>
                        <Input
                          value={form.notificationReference}
                          onChange={e => updateForm('notificationReference', e.target.value)}
                          placeholder="Reference number"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Event *</Label>
                    <Input
                      type="datetime-local"
                      value={form.dateOfEvent}
                      onChange={e => updateForm('dateOfEvent', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date Reported</Label>
                    <Input
                      type="date"
                      value={form.dateReported}
                      onChange={e => updateForm('dateReported', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={form.location}
                      onChange={e => updateForm('location', e.target.value)}
                      placeholder="Where did the event occur?"
                    />
                  </div>
                  <div>
                    <Label>GPS Coordinates</Label>
                    <Input
                      value={form.gpsCoordinates}
                      onChange={e => updateForm('gpsCoordinates', e.target.value)}
                      placeholder="e.g., 51.5074, -0.1278"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department *</Label>
                    <Input
                      value={form.department}
                      onChange={e => updateForm('department', e.target.value)}
                      placeholder="Responsible department"
                    />
                  </div>
                  <div>
                    <Label>Reported By *</Label>
                    <Input
                      value={form.reportedBy}
                      onChange={e => updateForm('reportedBy', e.target.value)}
                      placeholder="Name of reporter"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="Detailed description of the environmental event..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Immediate Cause</Label>
                  <Textarea
                    value={form.immediateCause}
                    onChange={e => updateForm('immediateCause', e.target.value)}
                    placeholder="What directly caused the event?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Contributing Factors</Label>
                  <Textarea
                    value={form.contributingFactors}
                    onChange={e => updateForm('contributingFactors', e.target.value)}
                    placeholder="What other factors contributed?"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Environmental Impact */}
            {section === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Environmental Media Affected</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {MEDIA_OPTIONS.map(media => (
                      <label key={media} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-green-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.mediaAffected.includes(media)}
                          onChange={() => toggleMediaAffected(media)}
                          className="rounded"
                        />
                        <span className="text-sm">{media.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Substance Involved</Label>
                    <Input
                      value={form.substanceInvolved}
                      onChange={e => updateForm('substanceInvolved', e.target.value)}
                      placeholder="e.g., Diesel, Hydraulic oil"
                    />
                  </div>
                  <div>
                    <Label>Concentration</Label>
                    <Input
                      value={form.concentration}
                      onChange={e => updateForm('concentration', e.target.value)}
                      placeholder="e.g., 50mg/L"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quantity Released</Label>
                    <Input
                      type="number"
                      value={form.quantityReleased}
                      onChange={e => updateForm('quantityReleased', e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={form.quantityUnit}
                      onChange={e => updateForm('quantityUnit', e.target.value)}
                      placeholder="e.g., litres, kg"
                    />
                  </div>
                  <div>
                    <Label>Receptor Distance</Label>
                    <Input
                      value={form.receptorDistance}
                      onChange={e => updateForm('receptorDistance', e.target.value)}
                      placeholder="e.g., 50m from watercourse"
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Containment & Response</h3>
                  <div className="flex flex-wrap gap-6 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.areaSecured}
                        onChange={e => updateForm('areaSecured', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Area Secured</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.spillKitUsed}
                        onChange={e => updateForm('spillKitUsed', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Spill Kit Used</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.emergencyServicesCalled}
                        onChange={e => updateForm('emergencyServicesCalled', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Emergency Services Called</span>
                    </label>
                  </div>

                  <div>
                    <Label>Immediate Actions Taken</Label>
                    <Textarea
                      value={form.immediateActions}
                      onChange={e => updateForm('immediateActions', e.target.value)}
                      placeholder="Describe the immediate response actions..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Materials Used</Label>
                      <Input
                        value={form.materialsUsed}
                        onChange={e => updateForm('materialsUsed', e.target.value)}
                        placeholder="e.g., Absorbent pads, booms"
                      />
                    </div>
                    <div>
                      <Label>Cleanup Duration</Label>
                      <Input
                        value={form.cleanupDuration}
                        onChange={e => updateForm('cleanupDuration', e.target.value)}
                        placeholder="e.g., 4 hours"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Investigation & Impact Assessment */}
            {section === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>RCA Method</Label>
                    <Select value={form.rcaMethod} onChange={e => updateForm('rcaMethod', e.target.value)}>
                      <option value="">Select method...</option>
                      {RCA_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Reputational Impact</Label>
                    <Select value={form.reputationalImpact} onChange={e => updateForm('reputationalImpact', e.target.value)}>
                      <option value="">Select level...</option>
                      {REPUTATIONAL_IMPACT_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Root Cause</Label>
                  <Textarea
                    value={form.rootCause}
                    onChange={e => updateForm('rootCause', e.target.value)}
                    placeholder="Describe the identified root cause..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Environmental Damage Assessment</Label>
                  <Textarea
                    value={form.environmentalDamage}
                    onChange={e => updateForm('environmentalDamage', e.target.value)}
                    placeholder="Describe the extent of environmental damage..."
                    rows={3}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Impact Categories</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.biodiversityImpact}
                        onChange={e => updateForm('biodiversityImpact', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Biodiversity Impact</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.waterCourseImpact}
                        onChange={e => updateForm('waterCourseImpact', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Water Course Impact</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.airQualityImpact}
                        onChange={e => updateForm('airQualityImpact', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Air Quality Impact</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Remediation Cost (GBP)</Label>
                  <Input
                    type="number"
                    value={form.remediationCost}
                    onChange={e => updateForm('remediationCost', e.target.value)}
                    placeholder="Estimated cost"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Actions & AI Analysis */}
            {section === 3 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-6 mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.capaRequired}
                      onChange={e => updateForm('capaRequired', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">CAPA Required</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.monitoringRequired}
                      onChange={e => updateForm('monitoringRequired', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Monitoring Required</span>
                  </label>
                </div>

                <div>
                  <Label>Preventive Measures</Label>
                  <Textarea
                    value={form.preventiveMeasures}
                    onChange={e => updateForm('preventiveMeasures', e.target.value)}
                    placeholder="What measures will prevent recurrence?"
                    rows={3}
                  />
                </div>

                {form.monitoringRequired && (
                  <div>
                    <Label>Follow-Up Date</Label>
                    <Input
                      type="date"
                      value={form.followUpDate}
                      onChange={e => updateForm('followUpDate', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label>Lessons Learned</Label>
                  <Textarea
                    value={form.lessonsLearned}
                    onChange={e => updateForm('lessonsLearned', e.target.value)}
                    placeholder="Key takeaways and lessons from this event..."
                    rows={3}
                  />
                </div>

                {/* AI Analysis Panel */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI Investigation Report
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateAiAnalysis}
                      disabled={aiLoading || form.description.length < 20}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      {aiLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" />Generate AI Investigation Report</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-600 mb-3">
                    Fill in event details on previous tabs first, then generate an AI-assisted investigation report. Results will populate relevant fields above.
                  </p>
                  {aiGenerated && (
                    <div className="bg-white dark:bg-gray-900 border border-emerald-200 rounded-lg p-3 mt-2">
                      <AIDisclosure variant="inline" provider="claude" analysisType="Event Analysis" confidence={0.85} />
                      <p className="text-xs font-medium text-emerald-700 mb-2 mt-2">AI analysis has been applied to the form fields above:</p>
                      <ul className="text-xs text-emerald-600 space-y-1 list-disc list-inside">
                        <li>Root Cause (Investigation tab)</li>
                        <li>Immediate Actions (Environmental Impact tab)</li>
                        <li>Preventive Measures (this tab)</li>
                        <li>Lessons Learned (this tab)</li>
                      </ul>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All AI-generated content is editable. Review and adjust as needed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                {section > 0 && (
                  <Button variant="outline" onClick={() => setSection(s => s - 1)}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                {section < 3 ? (
                  <Button onClick={() => setSection(s => s + 1)} className="bg-green-600 hover:bg-green-700">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.description || !form.location || !form.department || !form.reportedBy}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
                    ) : (
                      'Submit Event'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
