'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  Label,
  Modal,
  ModalFooter,
} from '@ims/ui';
import {
  Calendar,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ComplianceEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  standard: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
  assigneeId?: string;
  assignee?: string;
  location?: string;
  notes?: string;
  recurrence?: string;
  createdBy: string;
  daysUntilDue: number;
  computedStatus: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STANDARDS = [
  { value: 'ISO_9001_CAL', label: 'ISO 9001', color: '#1E3A8A' },
  { value: 'ISO_14001_CAL', label: 'ISO 14001', color: '#10B981' },
  { value: 'ISO_45001_CAL', label: 'ISO 45001', color: '#F97316' },
  { value: 'IATF_16949', label: 'IATF 16949', color: '#DC2626' },
  { value: 'AS9100D', label: 'AS9100D', color: '#8B5CF6' },
  { value: 'ISO_13485', label: 'ISO 13485', color: '#059669' },
  { value: 'COMBINED', label: 'Combined', color: '#9CA3AF' },
];

const EVENT_TYPES = [
  { value: 'AUDIT', label: 'Audit' },
  { value: 'LEGAL_REVIEW', label: 'Legal Review' },
  { value: 'OBJECTIVE_REVIEW', label: 'Objective Review' },
  { value: 'CAPA_DUE', label: 'CAPA Due' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'CERT_EXPIRY', label: 'Certification Expiry' },
  { value: 'CALIBRATION_DUE', label: 'Calibration Due' },
  { value: 'TRAINING_EXPIRY', label: 'Training Expiry' },
  { value: 'PPAP_GATE', label: 'PPAP Gate' },
  { value: 'FAI_DUE', label: 'FAI Due' },
  { value: 'REGULATORY_SUBMISSION', label: 'Regulatory Submission' },
];

const STATUSES = [
  { value: 'UPCOMING', label: 'Upcoming', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  { value: 'DUE_SOON', label: 'Due Soon', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { value: 'OVERDUE', label: 'Overdue', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  { value: 'COMPLETED', label: 'Completed', bgColor: 'bg-green-100', textColor: 'text-green-700' },
];

const RECURRENCE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month];
}

function getStatusBadge(status: string) {
  const s = STATUSES.find((st) => st.value === status);
  if (!s) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bgColor} ${s.textColor}`}>
      {s.label}
    </span>
  );
}

function getStandardLabel(standard: string): string {
  return STANDARDS.find((s) => s.value === standard)?.label || standard;
}

function getTypeLabel(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.label || type;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ComplianceCalendarClient() {
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStandard, setFilterStandard] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ComplianceEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'AUDIT',
    standard: 'ISO_9001_CAL',
    dueDate: '',
    assignee: '',
    location: '',
    notes: '',
    recurrence: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStandard) params.set('standard', filterStandard);
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      params.set('limit', '200');

      const response = await api.get(`/api/dashboard/compliance-calendar?${params.toString()}`);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Failed to load compliance events:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStandard, filterType, filterStatus]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ---------------------------------------------------------------------------
  // CRUD handlers
  // ---------------------------------------------------------------------------
  function openCreateModal() {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'AUDIT',
      standard: 'ISO_9001_CAL',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: '',
      location: '',
      notes: '',
      recurrence: '',
    });
    setModalOpen(true);
  }

  function openEditModal(event: ComplianceEvent) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      standard: event.standard,
      dueDate: event.dueDate.split('T')[0],
      assignee: event.assignee || '',
      location: event.location || '',
      notes: event.notes || '',
      recurrence: event.recurrence || '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        recurrence: formData.recurrence || undefined,
      };

      if (editingEvent) {
        await api.put(`/api/dashboard/compliance-calendar/events/${editingEvent.id}`, payload);
      } else {
        await api.post('/api/dashboard/compliance-calendar/events', payload);
      }

      setModalOpen(false);
      await loadEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/dashboard/compliance-calendar/events/${id}`);
      setDeleteConfirm(null);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }

  async function handleComplete(event: ComplianceEvent) {
    try {
      await api.put(`/api/dashboard/compliance-calendar/events/${event.id}`, {
        completedAt: new Date().toISOString(),
        status: 'COMPLETED',
      });
      await loadEvents();
    } catch (error) {
      console.error('Failed to complete event:', error);
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar helpers
  // ---------------------------------------------------------------------------
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getEventsForDate(day: number): ComplianceEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.dueDate.startsWith(dateStr));
  }

  // ---------------------------------------------------------------------------
  // Render: Calendar View
  // ---------------------------------------------------------------------------
  function renderCalendar() {
    const cells: React.ReactNode[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="h-28 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />);
    }

    // Day cells
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      cells.push(
        <div
          key={`day-${day}`}
          className={`h-28 border border-gray-100 dark:border-gray-700 p-1 overflow-hidden hover:bg-gray-50 dark:bg-gray-800 transition-colors ${
            isToday ? 'bg-indigo-50 border-indigo-300' : ''
          }`}
        >
          <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>
            {day}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 3).map((evt) => (
              <button
                key={evt.id}
                onClick={() => openEditModal(evt)}
                className="w-full text-left px-1 py-0.5 rounded text-xs truncate text-white"
                style={{ backgroundColor: evt.color }}
                title={`${evt.title} (${getStandardLabel(evt.standard)})`}
              >
                {evt.title}
              </button>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[180px] text-center">
              {MONTH_NAMES[month]} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: List View
  // ---------------------------------------------------------------------------
  function renderList() {
    const sorted = [...events].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    if (sorted.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No compliance events found. Create one to get started.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sorted.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Color bar */}
            <div
              className="w-1 h-14 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />

            {/* Event details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{event.title}</h3>
                {getStatusBadge(event.computedStatus)}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-white text-xs"
                  style={{ backgroundColor: event.color }}
                >
                  {getStandardLabel(event.standard)}
                </span>
                <span>{getTypeLabel(event.type)}</span>
                <span>{formatDate(event.dueDate)}</span>
                {event.assignee && <span>Assignee: {event.assignee}</span>}
              </div>
            </div>

            {/* Days until due */}
            <div className="text-right flex-shrink-0 mr-2">
              {event.computedStatus === 'COMPLETED' ? (
                <span className="text-green-600 text-sm font-medium">Done</span>
              ) : event.daysUntilDue < 0 ? (
                <span className="text-red-600 text-sm font-medium">
                  {Math.abs(event.daysUntilDue)}d overdue
                </span>
              ) : event.daysUntilDue === 0 ? (
                <span className="text-yellow-600 text-sm font-medium">Due today</span>
              ) : (
                <span className="text-gray-600 text-sm">
                  {event.daysUntilDue}d remaining
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {event.computedStatus !== 'COMPLETED' && (
                <button
                  onClick={() => handleComplete(event)}
                  className="p-1.5 text-green-500 hover:bg-green-50 rounded"
                  title="Mark as completed"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => openEditModal(event)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(event.id)}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------
  const overdue = events.filter((e) => e.computedStatus === 'OVERDUE').length;
  const dueSoon = events.filter((e) => e.computedStatus === 'DUE_SOON').length;
  const upcoming = events.filter((e) => e.computedStatus === 'UPCOMING').length;
  const completed = events.filter((e) => e.computedStatus === 'COMPLETED').length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Compliance Calendar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track audits, reviews, certifications, and regulatory deadlines across all standards
              </p>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{overdue}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{dueSoon}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{upcoming}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter bar + view toggle */}
          <Card className="mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Filters:</span>
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-xs mb-1">Standard</Label>
                  <Select
                    value={filterStandard}
                    onChange={(e) => setFilterStandard(e.target.value)}
                  >
                    <option value="">All Standards</option>
                    {STANDARDS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-xs mb-1">Type</Label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-xs mb-1">Status</Label>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
                {(filterStandard || filterType || filterStatus) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterStandard('');
                      setFilterType('');
                      setFilterStatus('');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
                <div className="ml-auto flex items-center gap-1 border rounded-lg p-0.5">
                  <button
                    onClick={() => setView('calendar')}
                    className={`p-1.5 rounded ${view === 'calendar' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                    title="Calendar view"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-1.5 rounded ${view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standard color legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {STANDARDS.map((s) => (
              <div key={s.value} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Calendar / List content */}
          <Card>
            <CardContent className="pt-4">
              {view === 'calendar' ? renderCalendar() : renderList()}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Compliance Event' : 'Create Compliance Event'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual ISO 9001 Surveillance Audit"
            />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the compliance event"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Standard *</Label>
              <Select
                value={formData.standard}
                onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
              >
                {STANDARDS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Event Type *</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Recurrence</Label>
              <Select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              >
                {RECURRENCE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignee</Label>
              <Input
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Person responsible"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Audit location"
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or preparation items"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.title || !formData.dueDate}>
            {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Compliance Event"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this compliance event? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
