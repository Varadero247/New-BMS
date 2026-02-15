'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, ArrowUpDown, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface FailureMode {
  id: string;
  processStep: string;
  failureMode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  currentControls: string;
  recommendedAction: string;
  status: 'open' | 'in-progress' | 'completed' | 'verified';
  owner: string;
  targetDate: string;
}

const MOCK_FAILURE_MODES: FailureMode[] = [
  { id: '1', processStep: 'Cylinder Head Torquing', failureMode: 'Under-torque of head bolts', effect: 'Head gasket failure — coolant/oil contamination', cause: 'Torque wrench calibration drift', severity: 9, occurrence: 3, detection: 4, currentControls: 'Calibration schedule every 6 months; visual inspection', recommendedAction: 'Reduce calibration interval to 3 months; add electronic torque verification', status: 'in-progress', owner: 'K. Schulz', targetDate: '2026-03-15' },
  { id: '2', processStep: 'Crankshaft Bearing Assembly', failureMode: 'Incorrect bearing clearance', effect: 'Premature bearing wear, engine seizure', cause: 'Micrometer reading error by operator', severity: 10, occurrence: 2, detection: 5, currentControls: 'Measurement recorded on work order; supervisor sign-off', recommendedAction: 'Introduce automated CMM verification; poka-yoke gauging fixture', status: 'open', owner: 'M. Bauer', targetDate: '2026-04-01' },
  { id: '3', processStep: 'Fuel Injector Seating', failureMode: 'Injector O-ring not seated', effect: 'Fuel leak at injector, fire hazard', cause: 'O-ring omitted or rolled during assembly', severity: 8, occurrence: 2, detection: 3, currentControls: 'Visual inspection checklist; test leak check at 6 bar', recommendedAction: 'Camera vision system for O-ring presence check', status: 'completed', owner: 'R. Weber', targetDate: '2026-02-20' },
  { id: '4', processStep: 'Transmission Gear Selection', failureMode: 'Incorrect gear selected during assembly', effect: 'Wrong gear ratio, transmission noise', cause: 'Similar-looking gears not differentiated', severity: 6, occurrence: 4, detection: 6, currentControls: 'Part number label check; operator visual confirmation', recommendedAction: 'Colour coding of gear families; bin pick-to-light system', status: 'in-progress', owner: 'P. Fischer', targetDate: '2026-03-30' },
  { id: '5', processStep: 'Brake Caliper Mounting', failureMode: 'Caliper bolt missing', effect: 'Caliper detachment during braking — safety critical', cause: 'Bolt dropped or not retrieved from work tray', severity: 10, occurrence: 1, detection: 4, currentControls: 'Torque verification; final inspection gate', recommendedAction: 'Bolt counting system (shadow board); vision system at final gate', status: 'verified', owner: 'L. Hoffmann', targetDate: '2025-12-15' },
  { id: '6', processStep: 'Camshaft Timing', failureMode: 'Timing chain installed 1 tooth off', effect: 'Valve timing error — poor performance or bent valves', cause: 'Incorrect alignment of timing marks', severity: 9, occurrence: 3, detection: 5, currentControls: 'Timing mark checklist; engine rotation test', recommendedAction: 'Dowel-pin timing tool to prevent off-tooth installation', status: 'open', owner: 'T. Meier', targetDate: '2026-05-01' },
  { id: '7', processStep: 'Exhaust Manifold Gasket Fitting', failureMode: 'Gasket installed upside-down', effect: 'Exhaust gas leak; EGR contamination', cause: 'Asymmetric gasket, no orientation feature', severity: 7, occurrence: 3, detection: 4, currentControls: 'Inspection checklist; leak test at end of line', recommendedAction: 'Add directional arrow to gasket; poka-yoke flange orientation pin', status: 'completed', owner: 'A. Richter', targetDate: '2026-01-30' },
  { id: '8', processStep: 'Wheel Hub Bearing Press-fit', failureMode: 'Bearing under-pressed (insufficient depth)', effect: 'Bearing movement, wheel wobble, NVH', cause: 'Press force not monitored in real-time', severity: 8, occurrence: 2, detection: 6, currentControls: 'Depth gauge check after pressing; pull-test sampling', recommendedAction: 'Force-displacement curve monitoring on press; automatic reject for out-of-spec', status: 'in-progress', owner: 'H. Braun', targetDate: '2026-04-15' },
];

type SortField = 'rpn' | 'severity' | 'occurrence' | 'detection';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG = {
  open:        { label: 'Open',        bg: 'bg-red-100',    text: 'text-red-700' },
  'in-progress':{ label: 'In Progress', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  completed:   { label: 'Completed',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  verified:    { label: 'Verified',    bg: 'bg-green-100',  text: 'text-green-700' },
};

function getRPNConfig(rpn: number) {
  if (rpn >= 200) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Critical' };
  if (rpn >= 100) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'High' };
  return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Acceptable' };
}

export default function FMEAClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('rpn');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const withRPN = MOCK_FAILURE_MODES.map(fm => ({ ...fm, rpn: fm.severity * fm.occurrence * fm.detection }));

  const filtered = useMemo(() => {
    const base = withRPN.filter(fm => {
      const matchSearch = fm.processStep.toLowerCase().includes(search.toLowerCase()) || fm.failureMode.toLowerCase().includes(search.toLowerCase()) || fm.effect.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || fm.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return [...base].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [search, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const critical = withRPN.filter(fm => fm.rpn >= 200).length;
  const high = withRPN.filter(fm => fm.rpn >= 100 && fm.rpn < 200).length;
  const avgRPN = Math.round(withRPN.reduce((s, fm) => s + fm.rpn, 0) / withRPN.length);
  const openCount = withRPN.filter(fm => fm.status === 'open' || fm.status === 'in-progress').length;

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col">
      {sortField === field ? (
        sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FMEA</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">IATF 16949 — Failure Mode and Effects Analysis (Process FMEA)</p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Failure Mode
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Critical RPN (&ge;200)</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{critical}</p>
            <p className="text-xs text-red-500 mt-1">Immediate action required</p>
          </div>
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">High RPN (&ge;100)</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{high}</p>
            <p className="text-xs text-orange-500 mt-1">Action plan required</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open / In Progress</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{openCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Actions outstanding</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg. RPN</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{avgRPN}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all failure modes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search process step, failure mode, effect..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Process Step</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Failure Mode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Effect</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cause</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('severity')}>
                  SEV <SortIcon field="severity" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('occurrence')}>
                  OCC <SortIcon field="occurrence" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('detection')}>
                  DET <SortIcon field="detection" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort('rpn')}>
                  RPN <SortIcon field="rpn" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(fm => {
                const rpnConf = getRPNConfig(fm.rpn);
                const sc = STATUS_CONFIG[fm.status];
                return (
                  <tr key={fm.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3 text-gray-800 font-medium text-xs max-w-[120px]">
                      <p className="leading-tight">{fm.processStep}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs max-w-[130px]">
                      <p className="leading-tight">{fm.failureMode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[130px]">
                      <p className="leading-tight">{fm.effect}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[120px]">
                      <p className="leading-tight">{fm.cause}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${fm.severity >= 8 ? 'bg-red-100 text-red-800' : fm.severity >= 5 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {fm.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {fm.occurrence}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {fm.detection}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded font-bold text-sm border ${rpnConf.bg} ${rpnConf.text} ${rpnConf.border}`}>
                        {fm.rpn >= 200 && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {fm.rpn}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">{fm.owner}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">SEV = Severity (1-10), OCC = Occurrence (1-10), DET = Detection (1-10), RPN = SEV &times; OCC &times; DET</p>
      </div>
    </div>
  );
}
