'use client';

import { useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  ClipboardList,
  CheckCircle2,
  Clock } from 'lucide-react';

interface EightDReport {
  id: string;
  title: string;
  customer: string;
  dateOpened: string;
  status: 'open' | 'in-progress' | 'completed';
  currentStep: number;
  d1Team: string;
  d2Problem: string;
  d3InterimAction: string;
  d4RootCause: string;
  d5CorrectiveAction: string;
  d6Implementation: string;
  d7Prevention: string;
  d8Congratulations: string;
  partNumber: string;
  defectQty: number;
}

const MOCK_8D: EightDReport[] = [
  {
    id: '1',
    title: 'Fuel Rail Pressure Fluctuation — Field Returns',
    customer: 'Volkswagen Group',
    dateOpened: '2026-01-10',
    status: 'in-progress',
    currentStep: 5,
    partNumber: 'FR-4421-VW',
    defectQty: 23,
    d1Team: 'M. Bauer (Lead), T. Meier, R. Weber, P. Fischer (Quality), L. Hoffmann (Process Eng.)',
    d2Problem:
      'Customer reports 23 units with fuel rail pressure fluctuation ±18% above spec under high-load conditions. Fault code P0087 triggered in 100% of affected units. No in-plant detection prior to delivery.',
    d3InterimAction:
      'Immediate: Stop-ship on current stock lot 2025-11-C. 100% functional test added at end-of-line. Customer supplied with 200 replacement units from lot 2025-09-A (known good).',
    d4RootCause:
      'Root cause confirmed: Fuel damper O-ring (Pos. 3) sourced from secondary supplier (SpareSeals LLC) has Shore A hardness 68 vs specified 75±5. Under thermal cycling, O-ring collapses — reduces effective damper volume by ~35%.',
    d5CorrectiveAction:
      'Replace SpareSeals LLC as secondary O-ring supplier with TechSeal GmbH (IATF 16949 certified, previously validated). Update supplier approved list. Revise incoming inspection to include hardness test (min 5 per lot).',
    d6Implementation:
      'New supplier qualification completed 2026-02-01. Updated PPAP submitted to Volkswagen Group. Revised control plan CP-FR-4421-Rev4 approved. First articles passed at 2026-02-05.',
    d7Prevention:
      'Updated FMEA to address secondary supplier material non-conformance risk (RPN reduced from 200 to 48). Revised purchasing specification to mandate IATF 16949 for all seal suppliers. Added to annual internal audit scope.',
    d8Congratulations: '' },
  {
    id: '2',
    title: 'Transmission Housing Porosity — Warranty Claims',
    customer: 'BMW AG',
    dateOpened: '2026-01-20',
    status: 'in-progress',
    currentStep: 4,
    partNumber: 'TH-8892-BM',
    defectQty: 8,
    d1Team: 'K. Schulz (Lead), A. Richter, H. Braun, External: Dr. F. Kastner (Casting Consultant)',
    d2Problem:
      '8 warranty returns with transmission fluid leakage at housing seam. Porosity found in die-cast aluminium housing at casting gate area. Leak rate exceeds 2 cc/min at 3 bar test pressure.',
    d3InterimAction:
      'Contain: All TH-8892 housings from die number D-07 quarantined (380 units). Initiated 100% helium leak test on all shipped product still in dealer stock. BMW notified — goodwill repair approved.',
    d4RootCause:
      'Identified: Die #D-07 cooling channel partially blocked causing localised temperature rise of 45°C above nominal. Resulted in premature solidification and micro-porosity in gate region. Die inspection confirmed 60% blockage in cooling circuit C.',
    d5CorrectiveAction:
      'Die D-07 sent for refurbishment — cooling channels cleaned and re-drilled to OEM specification. Permanent corrective action: Add die temperature monitoring (thermocouple at gate zone) with process shutdown alarm.',
    d6Implementation: '',
    d7Prevention: '',
    d8Congratulations: '' },
  {
    id: '3',
    title: 'Brake Pad Thickness Variation — PPM Escalation',
    customer: 'Continental AG',
    dateOpened: '2025-12-05',
    status: 'completed',
    currentStep: 8,
    partNumber: 'BP-2210-CT',
    defectQty: 156,
    d1Team: 'R. Weber (Lead), P. Fischer, M. Bauer, S. Jung (SPC Specialist)',
    d2Problem:
      'Continental reported 156 ppm thickness variation OOT on brake pad BP-2210-CT. Thickness measures 8.4-9.2mm vs spec 8.9±0.2mm. Detected at incoming QC at Continental. Zero customer/field impact confirmed.',
    d3InterimAction:
      'All BP-2210-CT in transit recalled and 100% gauged. 99 pads out of spec segregated. Production line halted for press calibration verification.',
    d4RootCause:
      'Hydraulic press P-04 upper die worn by 0.4mm beyond allowable tolerance. Die wear exceeded PM interval. Root cause: Preventive maintenance interval 90-day based on calendar vs. actual cycle count.',
    d5CorrectiveAction:
      'Replace upper die on P-04. Transition all press PM intervals from calendar-based to cycle-count-based (max 50,000 cycles). Implement real-time force monitoring on all 4 presses.',
    d6Implementation:
      'P-04 die replaced 2025-12-15. Cycle counter installed 2025-12-20. Control plan updated. PPAP resubmission approved by Continental 2025-12-28.',
    d7Prevention:
      'FMEA updated: press die wear added as failure mode (SEV 7, OCC 2, DET 2 = RPN 28). Lessons learned shared across all press operations. Added to annual maintenance audit checklist.',
    d8Congratulations:
      'Team recognition award presented at December Quality Review. Customer reported 0 ppm on subsequent 3 deliveries. 8D closed 2026-01-08.' },
  {
    id: '4',
    title: 'Engine Mount Cracking — Field Failure',
    customer: 'Ford Motor Company',
    dateOpened: '2026-02-01',
    status: 'open',
    currentStep: 2,
    partNumber: 'EM-5501-W',
    defectQty: 4,
    d1Team: 'A. Richter (Lead), T. Meier — further team to be assembled',
    d2Problem:
      '4 field failures of engine mount EM-5501-W with cracking at weld toe within 12,000 km of service. All failures from vehicles built in week 48/2025. No other production weeks affected to date.',
    d3InterimAction:
      'Ford notified. Week 48/2025 vehicles identified in field (estimated 340 units). Field service bulletin issued for precautionary inspection.',
    d4RootCause: '',
    d5CorrectiveAction: '',
    d6Implementation: '',
    d7Prevention: '',
    d8Congratulations: '' },
  {
    id: '5',
    title: 'Infotainment Unit Boot Failure — Software OTA',
    customer: 'Stellantis',
    dateOpened: '2026-02-08',
    status: 'open',
    currentStep: 3,
    partNumber: 'IU-7730-ST',
    defectQty: 312,
    d1Team: 'L. Hoffmann (Lead), Software Team (J. Stein, C. Koch), HW: K. Schulz',
    d2Problem:
      '312 units fail to complete boot sequence after OTA firmware update v2.4.1 delivered 2026-02-06. Units freeze at splash screen. Affects all units with 8GB eMMC variant (approx. 18% of total fleet).',
    d3InterimAction:
      'OTA update v2.4.1 rolled back immediately. Stellantis dealer network supplied with USB recovery tool. Remote recovery via OTA v2.4.2-hotfix released 2026-02-09 (95% recovery rate).',
    d4RootCause:
      'Preliminary: v2.4.1 bootloader failed to account for different eMMC timing parameters on 8GB variant. Full root cause analysis in progress.',
    d5CorrectiveAction: '',
    d6Implementation: '',
    d7Prevention: '',
    d8Congratulations: '' },
];

const STATUS_CONFIG = {
  open: { label: 'Open', bg: 'bg-red-100', text: 'text-red-700', icon: Clock },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 } };

const DISCIPLINES = [
  { num: 1, key: 'd1Team', label: 'D1 — Team Formation' },
  { num: 2, key: 'd2Problem', label: 'D2 — Problem Description' },
  { num: 3, key: 'd3InterimAction', label: 'D3 — Interim Containment' },
  { num: 4, key: 'd4RootCause', label: 'D4 — Root Cause Analysis' },
  { num: 5, key: 'd5CorrectiveAction', label: 'D5 — Permanent Corrective Action' },
  { num: 6, key: 'd6Implementation', label: 'D6 — Implementation & Validation' },
  { num: 7, key: 'd7Prevention', label: 'D7 — Systemic Prevention' },
  { num: 8, key: 'd8Congratulations', label: 'D8 — Team Recognition' },
] as const;

export default function EightDClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_8D.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    open: MOCK_8D.filter((r) => r.status === 'open').length,
    inProgress: MOCK_8D.filter((r) => r.status === 'in-progress').length,
    completed: MOCK_8D.filter((r) => r.status === 'completed').length,
    totalDefects: MOCK_8D.reduce((s, r) => s + r.defectQty, 0) };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              8D Problem Solving
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              IATF 16949 — Eight Disciplines Problem Solving Reports
            </p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New 8D Report
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Open</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.open}</p>
            <p className="text-xs text-red-500 mt-1">Awaiting 8D progress</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{counts.inProgress}</p>
            <p className="text-xs text-blue-500 mt-1">Active investigations</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{counts.completed}</p>
            <p className="text-xs text-green-500 mt-1">All 8 disciplines closed</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Defects
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {counts.totalDefects.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all 8Ds</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search title, customer, part number..."
              placeholder="Search title, customer, part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* 8D Cards */}
        <div className="space-y-4">
          {filtered.map((report) => {
            const sc = STATUS_CONFIG[report.status];
            const StatusIcon = sc.icon;
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {report.partNumber}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {report.customer}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">&bull;</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Opened {report.dateOpened}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">&bull;</span>
                        <span className="text-xs text-red-600 font-medium">
                          {report.defectQty} defects
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {report.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 8-Step Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {DISCIPLINES.map((d) => {
                        const isDone = d.num < report.currentStep;
                        const isCurrent = d.num === report.currentStep;
                        const _isPending = d.num > report.currentStep;
                        const hasContent = !!(report as unknown as Record<string, string>)[d.key];
                        return (
                          <div key={d.num} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full h-2 rounded-sm transition-colors ${isDone || (isCurrent && hasContent) ? 'bg-green-500' : isCurrent ? 'bg-blue-400 animate-pulse' : 'bg-gray-200'}`}
                            />
                            <span
                              className={`text-xs font-bold ${isDone || hasContent ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}
                            >
                              D{d.num}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Step {report.currentStep} of 8 —{' '}
                      {DISCIPLINES.find((d) => d.num === report.currentStep)?.label}
                    </p>
                  </div>
                </div>

                {/* Expanded Disciplines */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                    {DISCIPLINES.map((d) => {
                      const content = (report as unknown as Record<string, string>)[d.key];
                      const isDone = d.num < report.currentStep || !!content;
                      return (
                        <div key={d.num} className={`px-5 py-3 ${!content ? 'opacity-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isDone && content ? 'bg-green-100 text-green-700' : d.num === report.currentStep ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                            >
                              {d.num}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                                {d.label}
                              </p>
                              {content ? (
                                <p className="text-xs text-gray-600 leading-relaxed">{content}</p>
                              ) : (
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                  Not yet completed
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 py-16 text-center text-gray-400 dark:text-gray-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No 8D reports match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
