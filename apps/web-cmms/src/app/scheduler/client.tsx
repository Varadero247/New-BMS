'use client';

import { useState, useMemo } from 'react';
import { Badge, Button } from '@ims/ui';
import {
  ChevronLeft,
  ChevronRight,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
} from 'lucide-react';

type Priority = 'Emergency' | 'High' | 'Medium' | 'Low';
type WOStatus = 'Scheduled' | 'In Progress' | 'On Hold' | 'Completed';

interface WorkOrder {
  id: string;
  title: string;
  asset: string;
  assignee: string;
  priority: Priority;
  status: WOStatus;
  startDate: string;
  endDate: string;
  type: 'Preventive' | 'Corrective' | 'Inspection' | 'Emergency';
  estimatedHours: number;
}

const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2026-001',
    title: 'Conveyor belt tension adjustment',
    asset: 'CONV-001',
    assignee: 'J. Martinez',
    priority: 'Medium',
    status: 'Scheduled',
    startDate: '2026-02-10',
    endDate: '2026-02-10',
    type: 'Preventive',
    estimatedHours: 2,
  },
  {
    id: 'WO-2026-002',
    title: 'HVAC quarterly filter replacement',
    asset: 'HVAC-003',
    assignee: 'R. Thompson',
    priority: 'Low',
    status: 'Scheduled',
    startDate: '2026-02-11',
    endDate: '2026-02-11',
    type: 'Preventive',
    estimatedHours: 1.5,
  },
  {
    id: 'WO-2026-003',
    title: 'CNC spindle bearing replacement',
    asset: 'CNC-007',
    assignee: 'M. Chen',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-02-12',
    endDate: '2026-02-13',
    type: 'Corrective',
    estimatedHours: 6,
  },
  {
    id: 'WO-2026-004',
    title: 'Boiler annual inspection',
    asset: 'BLR-001',
    assignee: 'J. Martinez',
    priority: 'High',
    status: 'Scheduled',
    startDate: '2026-02-13',
    endDate: '2026-02-14',
    type: 'Inspection',
    estimatedHours: 8,
  },
  {
    id: 'WO-2026-005',
    title: 'Emergency compressor repair',
    asset: 'COMP-002',
    assignee: 'R. Thompson',
    priority: 'Emergency',
    status: 'In Progress',
    startDate: '2026-02-13',
    endDate: '2026-02-13',
    type: 'Emergency',
    estimatedHours: 4,
  },
  {
    id: 'WO-2026-006',
    title: 'Pump seal replacement',
    asset: 'PMP-004',
    assignee: 'A. Singh',
    priority: 'Medium',
    status: 'Scheduled',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    type: 'Corrective',
    estimatedHours: 3,
  },
  {
    id: 'WO-2026-007',
    title: 'Electrical panel thermography',
    asset: 'ELEC-012',
    assignee: 'M. Chen',
    priority: 'Medium',
    status: 'Scheduled',
    startDate: '2026-02-15',
    endDate: '2026-02-15',
    type: 'Inspection',
    estimatedHours: 2,
  },
  {
    id: 'WO-2026-008',
    title: 'Forklift hydraulic service',
    asset: 'FLT-003',
    assignee: 'A. Singh',
    priority: 'Low',
    status: 'Completed',
    startDate: '2026-02-09',
    endDate: '2026-02-09',
    type: 'Preventive',
    estimatedHours: 2,
  },
  {
    id: 'WO-2026-009',
    title: 'Production line lubrication',
    asset: 'LINE-001',
    assignee: 'J. Martinez',
    priority: 'Low',
    status: 'Scheduled',
    startDate: '2026-02-16',
    endDate: '2026-02-16',
    type: 'Preventive',
    estimatedHours: 1,
  },
  {
    id: 'WO-2026-010',
    title: 'Crane load test certification',
    asset: 'CRN-002',
    assignee: 'R. Thompson',
    priority: 'High',
    status: 'Scheduled',
    startDate: '2026-02-17',
    endDate: '2026-02-18',
    type: 'Inspection',
    estimatedHours: 6,
  },
  {
    id: 'WO-2026-011',
    title: 'Cooling tower chemical treatment',
    asset: 'CT-001',
    assignee: 'A. Singh',
    priority: 'Medium',
    status: 'On Hold',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    type: 'Preventive',
    estimatedHours: 3,
  },
  {
    id: 'WO-2026-012',
    title: 'Fire suppression system test',
    asset: 'FIRE-001',
    assignee: 'M. Chen',
    priority: 'High',
    status: 'Scheduled',
    startDate: '2026-02-19',
    endDate: '2026-02-19',
    type: 'Inspection',
    estimatedHours: 4,
  },
  {
    id: 'WO-2026-013',
    title: 'Robotic arm calibration',
    asset: 'ROB-005',
    assignee: 'J. Martinez',
    priority: 'Medium',
    status: 'Scheduled',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    type: 'Preventive',
    estimatedHours: 3,
  },
  {
    id: 'WO-2026-014',
    title: 'Generator load bank test',
    asset: 'GEN-001',
    assignee: 'R. Thompson',
    priority: 'High',
    status: 'Scheduled',
    startDate: '2026-02-21',
    endDate: '2026-02-21',
    type: 'Inspection',
    estimatedHours: 5,
  },
];

const TECHNICIANS = ['J. Martinez', 'R. Thompson', 'M. Chen', 'A. Singh'];

const priorityColors: Record<Priority, string> = {
  Emergency: 'bg-red-500 text-white',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const statusColors: Record<WOStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-purple-100 text-purple-700',
  'On Hold': 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  Completed: 'bg-green-100 text-green-700',
};

const typeColors: Record<string, string> = {
  Preventive: 'border-l-blue-500',
  Corrective: 'border-l-orange-500',
  Inspection: 'border-l-purple-500',
  Emergency: 'border-l-red-500',
};

const MONTH_NAMES = [
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
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month];
}

export default function SchedulerClient() {
  const [view, setView] = useState<'week' | 'calendar' | 'technician'>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 13));
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const workOrders = useMemo(() => {
    return MOCK_WORK_ORDERS.filter((wo) => {
      if (filterPriority && wo.priority !== filterPriority) return false;
      if (filterType && wo.type !== filterType) return false;
      return true;
    });
  }, [filterPriority, filterType]);

  // Week view helpers
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  function getWOsForDate(date: Date): WorkOrder[] {
    const dateStr = date.toISOString().split('T')[0];
    return workOrders.filter((wo) => wo.startDate <= dateStr && wo.endDate >= dateStr);
  }

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }
  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }
  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  // Summary stats
  const scheduled = workOrders.filter((w) => w.status === 'Scheduled').length;
  const inProgress = workOrders.filter((w) => w.status === 'In Progress').length;
  const onHold = workOrders.filter((w) => w.status === 'On Hold').length;
  const completed = workOrders.filter((w) => w.status === 'Completed').length;
  const totalHours = workOrders.reduce((s, w) => s + w.estimatedHours, 0);

  function renderWeekView() {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[260px] text-center">
              {weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &ndash;{' '}
              {weekDays[6].toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </h2>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dayWOs = getWOsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isWeekend = idx === 0 || idx === 6;

            return (
              <div
                key={idx}
                className={`min-h-[300px] rounded-lg border p-2 ${isToday ? 'border-amber-400 bg-amber-50' : isWeekend ? 'bg-gray-50 dark:bg-gray-800 border-gray-200' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div
                  className={`text-xs font-medium mb-2 ${isToday ? 'text-amber-700' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {DAY_NAMES[idx]} {day.getDate()}
                </div>
                <div className="space-y-1.5">
                  {dayWOs.map((wo) => (
                    <button
                      key={wo.id}
                      onClick={() => setSelectedWO(selectedWO?.id === wo.id ? null : wo)}
                      className={`w-full text-left p-2 rounded border-l-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow ${typeColors[wo.type]} ${selectedWO?.id === wo.id ? 'ring-2 ring-amber-500' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">
                          {wo.id}
                        </span>
                        <span
                          className={`text-[9px] font-medium rounded-full px-1 py-0.5 ${priorityColors[wo.priority]}`}
                        >
                          {wo.priority}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {wo.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-gray-500 dark:text-gray-400">
                          {wo.assignee}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">
                          {wo.estimatedHours}h
                        </span>
                      </div>
                    </button>
                  ))}
                  {dayWOs.length === 0 && (
                    <div className="text-xs text-gray-300 dark:text-gray-600 text-center py-6">
                      No WOs
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCalendarView() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const today = new Date();
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(
        <div
          key={`e-${i}`}
          className="h-24 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayWOs = getWOsForDate(date);
      const isToday =
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      cells.push(
        <div
          key={`d-${day}`}
          className={`h-24 border border-gray-100 dark:border-gray-700 p-1 overflow-hidden ${isToday ? 'bg-amber-50 border-amber-300' : 'hover:bg-gray-50'}`}
        >
          <div
            className={`text-[10px] font-medium ${isToday ? 'text-amber-600' : 'text-gray-400'}`}
          >
            {day}
          </div>
          {dayWOs.slice(0, 2).map((wo) => (
            <div
              key={wo.id}
              className={`text-[9px] px-1 rounded truncate mt-0.5 ${wo.priority === 'Emergency' ? 'bg-red-100 text-red-700' : wo.priority === 'High' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}
            >
              {wo.title}
            </div>
          ))}
          {dayWOs.length > 2 && (
            <div className="text-[9px] text-gray-400 dark:text-gray-500 pl-1">
              +{dayWOs.length - 2}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
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
          </div>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    );
  }

  function renderTechnicianView() {
    return (
      <div className="space-y-6">
        {TECHNICIANS.map((tech) => {
          const techWOs = workOrders
            .filter((wo) => wo.assignee === tech)
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
          const hours = techWOs.reduce((s, wo) => s + wo.estimatedHours, 0);
          const active = techWOs.filter((wo) => wo.status !== 'Completed').length;

          return (
            <div
              key={tech}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {tech}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                      {active} active WOs | {hours}h total
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${hours > 30 ? 'bg-red-500' : hours > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (hours / 40) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((hours / 40) * 100)}%
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {techWOs.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedWO(selectedWO?.id === wo.id ? null : wo)}
                    className={`px-4 py-2.5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 ${selectedWO?.id === wo.id ? 'bg-amber-50' : ''}`}
                  >
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-24 flex-shrink-0">
                      {wo.id}
                    </span>
                    <span
                      className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 w-16 text-center flex-shrink-0 ${priorityColors[wo.priority]}`}
                    >
                      {wo.priority}
                    </span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 flex-1 truncate">
                      {wo.title}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {wo.asset}
                    </span>
                    <span
                      className={`text-[10px] font-medium rounded-full px-2 py-0.5 flex-shrink-0 ${statusColors[wo.status]}`}
                    >
                      {wo.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-16 text-right">
                      {wo.startDate.slice(5)}
                    </span>
                  </div>
                ))}
                {techWOs.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                    No work orders assigned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Work Order Scheduler
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Schedule and track maintenance work orders by week, month, or technician
          </p>
        </div>
        <a
          href="/work-orders"
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
        >
          Work Orders List
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <Wrench className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-700">{scheduled}</p>
          <p className="text-[10px] text-blue-500">Scheduled</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-700">{inProgress}</p>
          <p className="text-[10px] text-purple-500">In Progress</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <AlertTriangle className="h-5 w-5 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-600">{onHold}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">On Hold</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-700">{completed}</p>
          <p className="text-[10px] text-green-500">Completed</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-700">{totalHours}h</p>
          <p className="text-[10px] text-amber-500">Total Hours</p>
        </div>
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="Preventive">Preventive</option>
            <option value="Corrective">Corrective</option>
            <option value="Inspection">Inspection</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          {(['week', 'calendar', 'technician'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-medium ${view === v ? 'bg-amber-100 text-amber-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {v === 'week' ? 'Week' : v === 'calendar' ? 'Month' : 'Technician'}
            </button>
          ))}
        </div>
      </div>

      {/* Type legend */}
      <div className="flex items-center gap-4">
        {[
          { type: 'Preventive', color: 'bg-blue-500' },
          { type: 'Corrective', color: 'bg-orange-500' },
          { type: 'Inspection', color: 'bg-purple-500' },
          { type: 'Emergency', color: 'bg-red-500' },
        ].map((t) => (
          <div key={t.type} className="flex items-center gap-1.5">
            <div className={`w-3 h-1.5 rounded ${t.color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t.type}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {view === 'week' && renderWeekView()}
        {view === 'calendar' && renderCalendarView()}
        {view === 'technician' && renderTechnicianView()}
      </div>

      {/* Detail panel */}
      {selectedWO && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {selectedWO.id}
              </span>
              <Badge variant="secondary">{selectedWO.type}</Badge>
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${priorityColors[selectedWO.priority]}`}
              >
                {selectedWO.priority}
              </span>
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${statusColors[selectedWO.status]}`}
              >
                {selectedWO.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedWO(null)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {selectedWO.title}
          </h3>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Asset:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedWO.asset}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Assignee:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedWO.assignee}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Schedule:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedWO.startDate} to {selectedWO.endDate}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Est. Hours:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedWO.estimatedHours}h
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
