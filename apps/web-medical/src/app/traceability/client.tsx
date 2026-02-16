'use client';

import { useState, useMemo } from 'react';
import { Search, Package, ArrowRight, MapPin, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

interface TraceabilityRecord {
  id: string;
  udiNumber: string;
  lotNumber: string;
  product: string;
  serialNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: 'in-production' | 'released' | 'distributed' | 'implanted' | 'recalled';
  currentLocation: string;
  chain: { date: string; event: string; location: string; by: string }[];
}

const records: TraceabilityRecord[] = [
  { id: '1', udiNumber: '(01)00884838000018(21)SN20260115001', lotNumber: 'LOT-2026-0115', product: 'CardioMonitor Pro X3', serialNumber: 'CM-X3-0001', manufacturingDate: '2026-01-15', expiryDate: '2029-01-15', status: 'distributed', currentLocation: 'St. James Hospital, London', chain: [{ date: '2026-01-15', event: 'Manufacturing complete', location: 'Plant A, Line 3', by: 'System' }, { date: '2026-01-18', event: 'QC release — all tests passed', location: 'QC Lab', by: 'Dr. Chen' }, { date: '2026-01-20', event: 'Packaging & labelling', location: 'Pack Line 1', by: 'J. Wilson' }, { date: '2026-01-25', event: 'Shipped to distributor', location: 'Warehouse A', by: 'Logistics' }, { date: '2026-02-02', event: 'Delivered to customer', location: 'St. James Hospital', by: 'MedSupply UK' }] },
  { id: '2', udiNumber: '(01)00884838000025(21)SN20260120002', lotNumber: 'LOT-2026-0120', product: 'NeuroStim Controller V2', serialNumber: 'NS-V2-0042', manufacturingDate: '2026-01-20', expiryDate: '2031-01-20', status: 'released', currentLocation: 'Warehouse B', chain: [{ date: '2026-01-20', event: 'Manufacturing complete', location: 'Plant B, Line 1', by: 'System' }, { date: '2026-01-23', event: 'QC release', location: 'QC Lab', by: 'Dr. Zhang' }, { date: '2026-01-25', event: 'Sterilization — EtO cycle 45', location: 'Sterilization Suite', by: 'System' }, { date: '2026-01-28', event: 'Moved to finished goods', location: 'Warehouse B', by: 'Logistics' }] },
  { id: '3', udiNumber: '(01)00884838000032(21)SN20260201003', lotNumber: 'LOT-2026-0201', product: 'SurgiView Endoscope', serialNumber: 'SV-END-0198', manufacturingDate: '2026-02-01', expiryDate: '2031-02-01', status: 'in-production', currentLocation: 'Plant A, Line 5', chain: [{ date: '2026-02-01', event: 'Assembly started', location: 'Plant A, Line 5', by: 'System' }, { date: '2026-02-05', event: 'Sub-assembly complete', location: 'Plant A, Line 5', by: 'R. Kim' }] },
  { id: '4', udiNumber: '(01)00884838000049(21)SN20251005004', lotNumber: 'LOT-2025-1005', product: 'OrthoFix Implant Kit', serialNumber: 'OF-IK-0567', manufacturingDate: '2025-10-05', expiryDate: '2028-10-05', status: 'implanted', currentLocation: 'Royal London Hospital', chain: [{ date: '2025-10-05', event: 'Manufacturing complete', location: 'Plant C, Line 2', by: 'System' }, { date: '2025-10-08', event: 'QC release', location: 'QC Lab', by: 'Dr. Chen' }, { date: '2025-10-12', event: 'Sterilization — Gamma', location: 'External Sterilizer', by: 'SterilCo' }, { date: '2025-10-20', event: 'Shipped', location: 'Warehouse A', by: 'Logistics' }, { date: '2025-11-15', event: 'Implanted — Patient P-8823', location: 'Royal London Hospital', by: 'Dr. Patel' }] },
  { id: '5', udiNumber: '(01)00884838000056(21)SN20260115005', lotNumber: 'LOT-2026-0115B', product: 'VitalSign Monitor M5', serialNumber: 'VS-M5-1234', manufacturingDate: '2026-01-15', expiryDate: '2029-01-15', status: 'recalled', currentLocation: 'Recall Processing', chain: [{ date: '2026-01-15', event: 'Manufacturing complete', location: 'Plant A, Line 2', by: 'System' }, { date: '2026-01-18', event: 'QC release', location: 'QC Lab', by: 'J. Wilson' }, { date: '2026-01-22', event: 'Distributed', location: 'NHS Trust Midlands', by: 'Logistics' }, { date: '2026-02-08', event: 'Field Safety Notice issued', location: 'All', by: 'Regulatory' }, { date: '2026-02-10', event: 'Recalled — returned to warehouse', location: 'Recall Processing', by: 'Quality' }] },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  'in-production': { label: 'In Production', color: 'bg-blue-100 text-blue-700' },
  released: { label: 'Released', color: 'bg-emerald-100 text-emerald-700' },
  distributed: { label: 'Distributed', color: 'bg-purple-100 text-purple-700' },
  implanted: { label: 'Implanted', color: 'bg-cyan-100 text-cyan-700' },
  recalled: { label: 'Recalled', color: 'bg-red-100 text-red-700' },
};

export default function TraceabilityClient() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = !search || r.product.toLowerCase().includes(search.toLowerCase()) || r.serialNumber.toLowerCase().includes(search.toLowerCase()) || r.lotNumber.toLowerCase().includes(search.toLowerCase()) || r.udiNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, filterStatus]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Device Traceability</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">UDI tracking and chain of custody — FDA 21 CFR 830 / EU MDR 2017/745</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = records.filter((r) => r.status === key).length;
          return (
            <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{cfg.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" aria-label="Search by UDI, lot, serial, or product..." placeholder="Search by UDI, lot, serial, or product..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select aria-label="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((record) => {
          const sc = statusConfig[record.status];
          const isExpanded = expandedId === record.id;
          return (
            <div key={record.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : record.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    <Package className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{record.product}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">SN: {record.serialNumber}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Lot: {record.lotNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{record.currentLocation}</p>
                    </div>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">UDI: {record.udiNumber}</div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><span className="text-gray-500 dark:text-gray-400">Manufactured:</span> <span className="font-medium">{record.manufacturingDate}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Expires:</span> <span className="font-medium">{record.expiryDate}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Events:</span> <span className="font-medium">{record.chain.length}</span></div>
                  </div>
                  <div className="space-y-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Chain of Custody</p>
                    {record.chain.map((event, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${i === record.chain.length - 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          {i < record.chain.length - 1 && <div className="w-px h-8 bg-gray-200" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{event.event}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />{event.date}
                            <MapPin className="h-3 w-3 ml-1" />{event.location}
                            <span className="ml-1">by {event.by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
