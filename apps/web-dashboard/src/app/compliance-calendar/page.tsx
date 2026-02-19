'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'AUDIT' | 'REVIEW' | 'TRAINING' | 'INSPECTION' | 'DEADLINE' | 'RECERTIFICATION';
  module: string;
  dueDate: string;
  status: 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | 'IN_PROGRESS';
  assignee: string;
  description: string;
}

const TYPE_COLORS: Record<string, string> = {
  AUDIT: 'bg-blue-100 text-blue-700 border-blue-200',
  REVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  TRAINING: 'bg-green-100 text-green-700 border-green-200',
  INSPECTION: 'bg-orange-100 text-orange-700 border-orange-200',
  DEADLINE: 'bg-red-100 text-red-700 border-red-200',
  RECERTIFICATION: 'bg-indigo-100 text-indigo-700 border-indigo-200' };

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: 'bg-blue-50 text-blue-600',
  OVERDUE: 'bg-red-50 text-red-600',
  COMPLETED: 'bg-green-50 text-green-600',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-600' };

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'ISO 9001 Internal Audit',
    type: 'AUDIT',
    module: 'Quality',
    dueDate: '2026-02-18',
    status: 'UPCOMING',
    assignee: 'Alice Johnson',
    description: 'Annual internal quality audit covering all clauses' },
  {
    id: '2',
    title: 'H&S Management Review',
    type: 'REVIEW',
    module: 'H&S',
    dueDate: '2026-02-20',
    status: 'UPCOMING',
    assignee: 'Bob Smith',
    description: 'Quarterly management review of H&S performance' },
  {
    id: '3',
    title: 'Fire Safety Inspection',
    type: 'INSPECTION',
    module: 'H&S',
    dueDate: '2026-02-15',
    status: 'OVERDUE',
    assignee: 'Carol Davis',
    description: 'Monthly fire suppression equipment check' },
  {
    id: '4',
    title: 'ISO 14001 Recertification',
    type: 'RECERTIFICATION',
    module: 'Environmental',
    dueDate: '2026-03-01',
    status: 'UPCOMING',
    assignee: 'Eve Green',
    description: 'Three-year ISO 14001 recertification surveillance audit' },
  {
    id: '5',
    title: 'GDPR Training Refresh',
    type: 'TRAINING',
    module: 'InfoSec',
    dueDate: '2026-02-28',
    status: 'UPCOMING',
    assignee: 'Frank Security',
    description: 'Annual data protection refresher for all staff' },
  {
    id: '6',
    title: 'Legal Register Review',
    type: 'REVIEW',
    module: 'Quality',
    dueDate: '2026-02-10',
    status: 'COMPLETED',
    assignee: 'Alice Johnson',
    description: 'Quarterly review of applicable legal requirements' },
  {
    id: '7',
    title: 'Supplier Audit — Acme Parts',
    type: 'AUDIT',
    module: 'Quality',
    dueDate: '2026-03-15',
    status: 'UPCOMING',
    assignee: 'George Quality',
    description: 'Second-party supplier qualification audit' },
  {
    id: '8',
    title: 'Energy Performance Review',
    type: 'REVIEW',
    module: 'Energy',
    dueDate: '2026-02-25',
    status: 'UPCOMING',
    assignee: 'Heidi Energy',
    description: 'ISO 50001 energy performance review meeting' },
  {
    id: '9',
    title: 'CAPA Closure Deadline',
    type: 'DEADLINE',
    module: 'Quality',
    dueDate: '2026-02-14',
    status: 'OVERDUE',
    assignee: 'Ivan Quality',
    description: 'NCR-2026-0031 CAPA must be closed' },
  {
    id: '10',
    title: 'Electrical Safety Inspection',
    type: 'INSPECTION',
    module: 'H&S',
    dueDate: '2026-03-05',
    status: 'UPCOMING',
    assignee: 'Jane Safety',
    description: 'Annual PAT testing and switchgear inspection' },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function ComplianceCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, _setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/compliance/calendar');
        setEvents(res.data.data || MOCK_EVENTS);
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function eventsForDay(day: number): CalendarEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.dueDate === dateStr);
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  const filteredEvents = events
    .filter((e) => {
      const matchType = typeFilter === '' || e.type === typeFilter;
      const matchStatus = statusFilter === '' || e.status === statusFilter;
      return matchType && matchStatus;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const selectedEvents = selectedDate ? events.filter((e) => e.dueDate === selectedDate) : null;

  const overdue = events.filter((e) => e.status === 'OVERDUE').length;
  const _upcoming = events.filter((e) => e.status === 'UPCOMING').length;
  const dueThisWeek = events.filter((e) => {
    const d = new Date(e.dueDate);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
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
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Compliance Calendar
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Upcoming audits, reviews, inspections and deadlines
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: events.length, icon: CalendarCheck, color: 'blue' },
              { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'red' },
              { label: 'Due This Week', value: dueThisWeek, icon: Clock, color: 'orange' },
              {
                label: 'Completed',
                value: events.filter((e) => e.status === 'COMPLETED').length,
                icon: CheckCircle,
                color: 'green' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                        <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {MONTHS[month]} {year}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16" />
                  ))}
                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = eventsForDay(day);
                    const isToday =
                      new Date().toDateString() === new Date(year, month, day).toDateString();
                    const isSelected = selectedDate === dateStr;
                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`h-16 p-1 rounded cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : isToday
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`text-xs font-medium block text-right ${isToday ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {day}
                        </span>
                        <div className="mt-0.5 space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                                ev.status === 'OVERDUE'
                                  ? 'bg-red-100 text-red-700'
                                  : ev.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-gray-400 dark:text-gray-500 px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected day events */}
                {selectedEvents && selectedEvents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Events on{' '}
                      {new Date(selectedDate!).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                      {selectedEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap mt-0.5 ${TYPE_COLORS[ev.type]}`}
                          >
                            {ev.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {ev.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ev.module} · {ev.assignee}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${STATUS_COLORS[ev.status]}`}
                          >
                            {ev.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Upcoming Events</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 font-normal"
                  >
                    <option value="">All</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredEvents.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No events found.
                    </p>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {ev.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {ev.module}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${STATUS_COLORS[ev.status]}`}
                          >
                            {ev.status === 'OVERDUE'
                              ? 'Overdue'
                              : ev.status === 'COMPLETED'
                                ? 'Done'
                                : ev.status === 'IN_PROGRESS'
                                  ? 'Active'
                                  : 'Upcoming'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border font-medium ${TYPE_COLORS[ev.type]}`}
                          >
                            {ev.type}
                          </span>
                          <Clock className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(ev.dueDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
