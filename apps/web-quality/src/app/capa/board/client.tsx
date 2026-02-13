'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@ims/ui';

type CapaStatus = 'Open' | 'Investigation' | 'Action Required' | 'Verification' | 'Closed';
type CapaPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface CapaItem {
  id: string;
  title: string;
  status: CapaStatus;
  priority: CapaPriority;
  source: string;
  assignee: string;
  dueDate: string;
  ncr?: string;
  rootCause?: string;
}

const STATUSES: CapaStatus[] = ['Open', 'Investigation', 'Action Required', 'Verification', 'Closed'];

const statusConfig: Record<CapaStatus, { bg: string; border: string; header: string }> = {
  'Open': { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-100 text-red-800' },
  'Investigation': { bg: 'bg-orange-50', border: 'border-orange-200', header: 'bg-orange-100 text-orange-800' },
  'Action Required': { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'bg-yellow-100 text-yellow-800' },
  'Verification': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-100 text-blue-800' },
  'Closed': { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-100 text-green-800' },
};

const priorityConfig: Record<CapaPriority, string> = {
  'Critical': 'bg-red-100 text-red-700',
  'High': 'bg-orange-100 text-orange-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low': 'bg-green-100 text-green-700',
};

const MOCK_CAPAS: CapaItem[] = [
  { id: 'CAPA-2026-001', title: 'Recurring dimensional non-conformance on Line 3', status: 'Open', priority: 'Critical', source: 'Customer Complaint', assignee: 'J. Smith', dueDate: '2026-02-28', ncr: 'NCR-2026-019' },
  { id: 'CAPA-2026-002', title: 'Supplier material batch variance exceeding spec', status: 'Investigation', priority: 'High', source: 'Incoming Inspection', assignee: 'M. Jones', dueDate: '2026-03-05', ncr: 'NCR-2026-022' },
  { id: 'CAPA-2026-003', title: 'Documentation gap in work instruction WI-045', status: 'Investigation', priority: 'Medium', source: 'Internal Audit', assignee: 'A. Patel', dueDate: '2026-03-10', rootCause: 'Incomplete revision after process change' },
  { id: 'CAPA-2026-004', title: 'Calibration overdue on 3 torque wrenches', status: 'Action Required', priority: 'High', source: 'Calibration Review', assignee: 'R. Brown', dueDate: '2026-02-20' },
  { id: 'CAPA-2026-005', title: 'Training records missing for 2 new operators', status: 'Action Required', priority: 'Medium', source: 'Management Review', assignee: 'L. Chen', dueDate: '2026-02-25' },
  { id: 'CAPA-2026-006', title: 'Packaging damage during transit — 3 incidents', status: 'Action Required', priority: 'High', source: 'Customer Return', assignee: 'J. Smith', dueDate: '2026-03-01', ncr: 'NCR-2026-025' },
  { id: 'CAPA-2026-007', title: 'SPC chart out-of-control on coating thickness', status: 'Verification', priority: 'Critical', source: 'SPC Alert', assignee: 'M. Jones', dueDate: '2026-02-18', rootCause: 'Spray nozzle wear pattern' },
  { id: 'CAPA-2026-008', title: 'Label printing error — wrong revision on 50 units', status: 'Verification', priority: 'Medium', source: 'Final Inspection', assignee: 'A. Patel', dueDate: '2026-02-22', ncr: 'NCR-2026-018' },
  { id: 'CAPA-2026-009', title: 'Corrective action for audit finding AF-2025-034', status: 'Closed', priority: 'Low', source: 'External Audit', assignee: 'R. Brown', dueDate: '2026-01-30', rootCause: 'Procedure not updated after ISO transition' },
  { id: 'CAPA-2026-010', title: 'Root cause: incorrect fixture alignment jig', status: 'Closed', priority: 'High', source: 'NCR Investigation', assignee: 'J. Smith', dueDate: '2026-02-01', ncr: 'NCR-2026-012', rootCause: 'Fixture wear beyond tolerance' },
  { id: 'CAPA-2026-011', title: 'Preventive action for environmental storage conditions', status: 'Open', priority: 'Medium', source: 'Risk Assessment', assignee: 'L. Chen', dueDate: '2026-03-15' },
  { id: 'CAPA-2026-012', title: 'Customer feedback — specification clarification needed', status: 'Investigation', priority: 'Low', source: 'Customer Feedback', assignee: 'A. Patel', dueDate: '2026-03-20' },
];

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function CapaBoardClient() {
  const [capas] = useState(MOCK_CAPAS);
  const [selectedCapa, setSelectedCapa] = useState<CapaItem | null>(null);

  const columns = useMemo(() => {
    const map: Record<CapaStatus, CapaItem[]> = {
      'Open': [], 'Investigation': [], 'Action Required': [], 'Verification': [], 'Closed': [],
    };
    for (const c of capas) map[c.status].push(c);
    return map;
  }, [capas]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAPA Board</h1>
          <p className="text-sm text-gray-500 mt-1">Kanban view of corrective and preventive actions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{capas.length} CAPAs total</span>
          <a href="/capa" className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            List View
          </a>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => {
          const items = columns[status];
          const config = statusConfig[status];

          return (
            <div key={status} className="flex-shrink-0 w-72">
              {/* Column Header */}
              <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${config.header}`}>
                <span className="text-xs font-semibold">{status}</span>
                <span className="text-xs font-bold bg-white/60 rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              </div>

              {/* Column Body */}
              <div className={`rounded-b-lg border ${config.border} ${config.bg} p-2 min-h-[400px] space-y-2`}>
                {items.map(capa => {
                  const overdue = isOverdue(capa.dueDate) && capa.status !== 'Closed';
                  return (
                    <div
                      key={capa.id}
                      onClick={() => setSelectedCapa(selectedCapa?.id === capa.id ? null : capa)}
                      className={`bg-white rounded-lg border p-3 cursor-pointer transition-shadow hover:shadow-md ${
                        selectedCapa?.id === capa.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono text-gray-400">{capa.id}</span>
                        <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 ${priorityConfig[capa.priority]}`}>
                          {capa.priority}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-900 mt-1 line-clamp-2">{capa.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-500">{capa.assignee}</span>
                        <span className={`text-[10px] font-mono ${overdue ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                          {overdue ? 'OVERDUE' : capa.dueDate.slice(5)}
                        </span>
                      </div>
                      {capa.ncr && (
                        <div className="mt-1.5">
                          <Badge variant="secondary" className="text-[9px]">{capa.ncr}</Badge>
                        </div>
                      )}

                      {/* Expanded detail */}
                      {selectedCapa?.id === capa.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-[10px]">
                          <div><span className="text-gray-500">Source:</span> <span className="text-gray-700 font-medium">{capa.source}</span></div>
                          <div><span className="text-gray-500">Due:</span> <span className="text-gray-700 font-medium">{capa.dueDate}</span></div>
                          {capa.rootCause && (
                            <div><span className="text-gray-500">Root Cause:</span> <span className="text-gray-700 font-medium">{capa.rootCause}</span></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                    No CAPAs
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
