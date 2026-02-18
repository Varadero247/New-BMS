'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle2, Clock, Eye, Zap } from 'lucide-react';

interface FODEvent {
  id: string;
  area: string;
  type: 'incident' | 'inspection' | 'near-miss';
  severity: 'critical' | 'major' | 'minor';
  date: string;
  description: string;
  status: 'open' | 'investigating' | 'closed';
  correctiveAction: string;
  reportedBy: string;
  closedDate: string | null;
}

const MOCK_EVENTS: FODEvent[] = [
  {
    id: '1',
    area: 'Wing Assembly Bay — Station 4',
    type: 'incident',
    severity: 'critical',
    date: '2026-02-05',
    description:
      'Metal drill bit fragment (12mm) found inside sealed wing rib cavity during final inspection. Production halted for full cavity inspection.',
    status: 'investigating',
    correctiveAction:
      'Full sweep of assembly area, all tools inventoried, toolbox accountability check initiated',
    reportedBy: 'T. Brooks',
    closedDate: null,
  },
  {
    id: '2',
    area: 'Avionics Installation Bay',
    type: 'near-miss',
    severity: 'major',
    date: '2026-01-30',
    description:
      'Torque wrench slipped from tech platform; landed 30cm from open avionics rack. No contact made.',
    status: 'open',
    correctiveAction:
      'Tool tethering requirement added to Work Order; tooling SOP revision in progress',
    reportedBy: 'P. Nakamura',
    closedDate: null,
  },
  {
    id: '3',
    area: 'Engine Run Pad',
    type: 'inspection',
    severity: 'minor',
    date: '2026-01-22',
    description:
      'Pre-run FOD walk found 2x safety lock-wire segments and 1x cable tie near intake exclusion zone.',
    status: 'closed',
    correctiveAction:
      'Items removed. Refresher FOD walk training completed for all Engine Run crew.',
    reportedBy: 'M. Chen',
    closedDate: '2026-01-23',
  },
  {
    id: '4',
    area: 'Final Assembly Line — Fuselage Mating',
    type: 'incident',
    severity: 'major',
    date: '2026-01-18',
    description:
      'Safety pin from hydraulic test fixture discovered inside main fuselage structure after mating.',
    status: 'closed',
    correctiveAction:
      'Red-tagged safety pin accounting system implemented; 100% verification required before fuselage closure',
    reportedBy: 'J. Harrison',
    closedDate: '2026-01-25',
  },
  {
    id: '5',
    area: 'Parts Storage — Bond Store',
    type: 'inspection',
    severity: 'minor',
    date: '2026-01-10',
    description: 'Routine FOD inspection of bond store. No FOD found. All seals intact.',
    status: 'closed',
    correctiveAction: 'No action required. Inspection record filed.',
    reportedBy: 'R. Patel',
    closedDate: '2026-01-10',
  },
  {
    id: '6',
    area: 'Landing Gear Bay',
    type: 'near-miss',
    severity: 'major',
    date: '2026-02-08',
    description:
      'Safety inspector observed rag used for wipe-down left on top of retracted gear bay structure by technician.',
    status: 'investigating',
    correctiveAction: 'Verbal correction issued. Material control procedures review scheduled.',
    reportedBy: 'A. Kumar',
    closedDate: null,
  },
  {
    id: '7',
    area: 'Composite Layup Room',
    type: 'inspection',
    severity: 'minor',
    date: '2026-01-05',
    description:
      'Weekly FOD walk — 3 aluminium shavings and 1x screw found on floor outside marked work zone.',
    status: 'closed',
    correctiveAction: 'Housekeeping frequency increased to twice daily. FOD bins repositioned.',
    reportedBy: 'L. Morgan',
    closedDate: '2026-01-06',
  },
  {
    id: '8',
    area: 'Flight Line — Aircraft 007',
    type: 'incident',
    severity: 'critical',
    date: '2026-02-10',
    description:
      'Post-ground-test inspection revealed foreign object impact marks on fan blade leading edge. Source TBD.',
    status: 'open',
    correctiveAction:
      'Aircraft grounded, engine borescope inspection ordered, flight line full FOD sweep',
    reportedBy: 'D. Foster',
    closedDate: null,
  },
];

const TYPE_CONFIG = {
  incident: { label: 'Incident', bg: 'bg-red-100', text: 'text-red-700' },
  inspection: { label: 'Inspection', bg: 'bg-blue-100', text: 'text-blue-700' },
  'near-miss': { label: 'Near Miss', bg: 'bg-orange-100', text: 'text-orange-700' },
};

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600' },
  major: { label: 'Major', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  minor: { label: 'Minor', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  investigating: {
    label: 'Investigating',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: Clock,
  },
  closed: { label: 'Closed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
};

export default function FODPreventionClient() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      const matchSearch =
        e.area.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.reportedBy.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchSeverity = severityFilter === 'all' || e.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchType && matchSeverity && matchStatus;
    });
  }, [search, typeFilter, severityFilter, statusFilter]);

  const counts = {
    open: MOCK_EVENTS.filter((e) => e.status === 'open').length,
    investigating: MOCK_EVENTS.filter((e) => e.status === 'investigating').length,
    critical: MOCK_EVENTS.filter((e) => e.severity === 'critical').length,
    incidents: MOCK_EVENTS.filter((e) => e.type === 'incident').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FOD Prevention</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              AS9100D — Foreign Object Damage / Debris Prevention Program
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Log FOD Event
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Open Events</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.open}</p>
            <p className="text-xs text-red-500 mt-1">Action required</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">
              Under Investigation
            </p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{counts.investigating}</p>
            <p className="text-xs text-yellow-600 mt-1">Root cause analysis</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Critical Severity
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{counts.critical}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Highest priority</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Incidents (MTD)
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{counts.incidents}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confirmed FOD events</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search area, description, reporter..."
              placeholder="Search area, description, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="incident">Incident</option>
            <option value="inspection">Inspection</option>
            <option value="near-miss">Near Miss</option>
          </select>
          <select
            aria-label="Filter by severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Area</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Corrective Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reporter</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((event) => {
                const tc = TYPE_CONFIG[event.type];
                const sc2 = SEVERITY_CONFIG[event.severity];
                const st = STATUS_CONFIG[event.status];
                const StatusIcon = st.icon;
                return (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50 dark:bg-gray-800 ${event.status === 'open' && event.severity === 'critical' ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-800 font-medium max-w-[140px]">
                      <p className="text-xs leading-tight">{event.area}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tc.bg} ${tc.text}`}
                      >
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc2.bg} ${sc2.text}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${sc2.dot}`} />
                        {sc2.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
                      <p className="text-xs leading-relaxed line-clamp-2">{event.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <p className="text-xs leading-relaxed line-clamp-2">
                        {event.correctiveAction}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {event.reportedBy}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {event.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${st.bg} ${st.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No FOD events match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
