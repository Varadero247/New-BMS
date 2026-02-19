'use client';

import { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin } from 'lucide-react';

type SupplierStatus = 'approved' | 'conditional' | 'under-review' | 'blocked';
type Rating = 'A' | 'B' | 'C' | 'D';

interface Supplier {
  id: string;
  name: string;
  code: string;
  status: SupplierStatus;
  rating: Rating;
  categories: string[];
  location: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: number;
  onTimeDelivery: number;
  qualityScore: number;
  defectRate: number;
  totalOrders: number;
  totalSpend: number;
  paymentTerms: string;
  lastAudit: string;
  certifications: string[];
  notes: string;
}

const suppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'MetalPro Industries',
    code: 'SUP-001',
    status: 'approved',
    rating: 'A',
    categories: ['Raw Materials', 'Metals'],
    location: 'Birmingham',
    country: 'UK',
    contactName: 'John Davies',
    contactEmail: 'j.davies@metalpro.co.uk',
    contactPhone: '+44 121 555 0100',
    leadTimeDays: 5,
    onTimeDelivery: 97,
    qualityScore: 96,
    defectRate: 0.3,
    totalOrders: 1245,
    totalSpend: 2800000,
    paymentTerms: 'Net 30',
    lastAudit: '2025-11-15',
    certifications: ['ISO 9001', 'ISO 14001', 'AS9100D'],
    notes: 'Primary metals supplier. Annual rebate agreement in place.' },
  {
    id: 'sup-2',
    name: 'ElectroCom GmbH',
    code: 'SUP-002',
    status: 'approved',
    rating: 'A',
    categories: ['Components', 'Electronics'],
    location: 'Munich',
    country: 'Germany',
    contactName: 'Hans Weber',
    contactEmail: 'h.weber@electrocom.de',
    contactPhone: '+49 89 555 0200',
    leadTimeDays: 8,
    onTimeDelivery: 95,
    qualityScore: 98,
    defectRate: 0.1,
    totalOrders: 876,
    totalSpend: 1650000,
    paymentTerms: 'Net 45',
    lastAudit: '2025-09-20',
    certifications: ['ISO 9001', 'IATF 16949', 'ISO 14001'],
    notes: 'Primary electronics supplier. JIT delivery for PCBs.' },
  {
    id: 'sup-3',
    name: 'Pacific Polymers Ltd',
    code: 'SUP-003',
    status: 'approved',
    rating: 'B',
    categories: ['Raw Materials', 'Polymers'],
    location: 'Shanghai',
    country: 'China',
    contactName: 'Li Wei',
    contactEmail: 'l.wei@pacificpoly.cn',
    contactPhone: '+86 21 5555 0300',
    leadTimeDays: 21,
    onTimeDelivery: 88,
    qualityScore: 91,
    defectRate: 1.2,
    totalOrders: 432,
    totalSpend: 890000,
    paymentTerms: 'Net 60',
    lastAudit: '2025-06-10',
    certifications: ['ISO 9001'],
    notes: 'Backup polymer supplier. Quality improving after CAPA SUP-003-2025.' },
  {
    id: 'sup-4',
    name: 'PrecisionParts Inc',
    code: 'SUP-004',
    status: 'conditional',
    rating: 'C',
    categories: ['Components', 'Mechanical'],
    location: 'Detroit',
    country: 'USA',
    contactName: 'Mike Johnson',
    contactEmail: 'm.johnson@precisionparts.com',
    contactPhone: '+1 313 555 0400',
    leadTimeDays: 14,
    onTimeDelivery: 78,
    qualityScore: 82,
    defectRate: 2.8,
    totalOrders: 256,
    totalSpend: 420000,
    paymentTerms: 'Net 30',
    lastAudit: '2025-12-01',
    certifications: ['ISO 9001'],
    notes: 'On improvement plan. OTD and quality declining Q3-Q4 2025. Next audit March 2026.' },
  {
    id: 'sup-5',
    name: 'Nordic Chemicals AS',
    code: 'SUP-005',
    status: 'approved',
    rating: 'A',
    categories: ['Raw Materials', 'Chemicals'],
    location: 'Oslo',
    country: 'Norway',
    contactName: 'Erik Larsen',
    contactEmail: 'e.larsen@nordicchem.no',
    contactPhone: '+47 22 555 0500',
    leadTimeDays: 7,
    onTimeDelivery: 99,
    qualityScore: 99,
    defectRate: 0.05,
    totalOrders: 678,
    totalSpend: 560000,
    paymentTerms: 'Net 30',
    lastAudit: '2026-01-10',
    certifications: ['ISO 9001', 'ISO 14001', 'REACH'],
    notes: 'Excellent supplier. Zero non-conformances in 3 years.' },
  {
    id: 'sup-6',
    name: 'QuickPack Solutions',
    code: 'SUP-006',
    status: 'approved',
    rating: 'B',
    categories: ['Consumables', 'Packaging'],
    location: 'Manchester',
    country: 'UK',
    contactName: 'Sarah Green',
    contactEmail: 's.green@quickpack.co.uk',
    contactPhone: '+44 161 555 0600',
    leadTimeDays: 3,
    onTimeDelivery: 94,
    qualityScore: 90,
    defectRate: 0.8,
    totalOrders: 890,
    totalSpend: 125000,
    paymentTerms: 'Net 14',
    lastAudit: '2025-08-20',
    certifications: ['ISO 9001', 'FSC'],
    notes: 'Local packaging supplier. Quick turnaround for custom packaging.' },
  {
    id: 'sup-7',
    name: 'SafetyFirst PPE',
    code: 'SUP-007',
    status: 'under-review',
    rating: 'B',
    categories: ['Consumables', 'PPE'],
    location: 'Bristol',
    country: 'UK',
    contactName: 'David Brown',
    contactEmail: 'd.brown@safetyfirst.co.uk',
    contactPhone: '+44 117 555 0700',
    leadTimeDays: 4,
    onTimeDelivery: 92,
    qualityScore: 88,
    defectRate: 1.5,
    totalOrders: 234,
    totalSpend: 45000,
    paymentTerms: 'Net 30',
    lastAudit: '2024-12-15',
    certifications: ['ISO 9001'],
    notes: 'Audit overdue. Scheduled for March 2026.' },
  {
    id: 'sup-8',
    name: 'TitanForge Aerospace',
    code: 'SUP-008',
    status: 'approved',
    rating: 'A',
    categories: ['Raw Materials', 'Metals'],
    location: 'Toulouse',
    country: 'France',
    contactName: 'Pierre Dubois',
    contactEmail: 'p.dubois@titanforge.fr',
    contactPhone: '+33 5 555 0800',
    leadTimeDays: 12,
    onTimeDelivery: 96,
    qualityScore: 99,
    defectRate: 0.02,
    totalOrders: 189,
    totalSpend: 980000,
    paymentTerms: 'Net 45',
    lastAudit: '2025-10-05',
    certifications: ['ISO 9001', 'AS9100D', 'NADCAP'],
    notes: 'Aerospace-grade titanium specialist. NADCAP accredited special processes.' },
];

const statusConfig: Record<SupplierStatus, { label: string; color: string }> = {
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  conditional: { label: 'Conditional', color: 'bg-amber-100 text-amber-700' },
  'under-review': { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' } };

const ratingConfig: Record<Rating, { color: string; bgColor: string }> = {
  A: { color: 'text-green-700', bgColor: 'bg-green-100' },
  B: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  C: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  D: { color: 'text-red-700', bgColor: 'bg-red-100' } };

export default function SuppliersClient() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'spend' | 'otd'>('name');

  const filtered = suppliers
    .filter((s) => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return a.rating.localeCompare(b.rating);
        case 'spend':
          return b.totalSpend - a.totalSpend;
        case 'otd':
          return b.onTimeDelivery - a.onTimeDelivery;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalSpend = suppliers.reduce((s, sup) => s + sup.totalSpend, 0);
  const avgOTD = Math.round(
    suppliers.reduce((s, sup) => s + sup.onTimeDelivery, 0) / suppliers.length
  );
  const avgQuality = Math.round(
    suppliers.reduce((s, sup) => s + sup.qualityScore, 0) / suppliers.length
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Suppliers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage supplier relationships, performance, and compliance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Suppliers
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {suppliers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {suppliers.filter((s) => s.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Spend
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            £{(totalSpend / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Avg OTD</p>
          <p className="text-3xl font-bold text-sky-700 mt-1">{avgOTD}%</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Avg Quality
          </p>
          <p className="text-3xl font-bold text-sky-700 mt-1">{avgQuality}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search suppliers, categories..."
            placeholder="Search suppliers, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
          <option value="spend">Sort by Spend</option>
          <option value="otd">Sort by OTD</option>
        </select>
        <div className="flex gap-2">
          {['all', 'approved', 'conditional', 'under-review', 'blocked'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : statusConfig[s as SupplierStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((sup) => {
          const isExpanded = expanded.has(sup.id);
          return (
            <div
              key={sup.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    if (n.has(sup.id)) { n.delete(sup.id); } else { n.add(sup.id); }
                    return n;
                  })
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full ${ratingConfig[sup.rating].bgColor} flex items-center justify-center`}
                  >
                    <span className={`text-sm font-bold ${ratingConfig[sup.rating].color}`}>
                      {sup.rating}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{sup.name}</p>
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                        {sup.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[sup.status].color}`}
                      >
                        {statusConfig[sup.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sup.location}, {sup.country} · {sup.categories.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{sup.onTimeDelivery}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">OTD</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{sup.qualityScore}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Quality</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{(sup.totalSpend / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Spend</p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Lead Time
                      </p>
                      <p className="font-medium">{sup.leadTimeDays} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Defect Rate
                      </p>
                      <p className="font-medium">{sup.defectRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Total Orders
                      </p>
                      <p className="font-medium">{sup.totalOrders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Payment Terms
                      </p>
                      <p className="font-medium">{sup.paymentTerms}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Contact
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />{' '}
                          {sup.contactEmail}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />{' '}
                          {sup.contactPhone}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />{' '}
                          {sup.location}, {sup.country}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Certifications
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {sup.certifications.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-xs font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Last audit: {sup.lastAudit}
                      </p>
                    </div>
                  </div>
                  {sup.notes && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-600">{sup.notes}</p>
                    </div>
                  )}

                  {/* Performance bars */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: 'On-Time Delivery',
                        value: sup.onTimeDelivery,
                        color:
                          sup.onTimeDelivery >= 95
                            ? 'bg-green-500'
                            : sup.onTimeDelivery >= 85
                              ? 'bg-amber-500'
                              : 'bg-red-500' },
                      {
                        label: 'Quality Score',
                        value: sup.qualityScore,
                        color:
                          sup.qualityScore >= 95
                            ? 'bg-green-500'
                            : sup.qualityScore >= 85
                              ? 'bg-amber-500'
                              : 'bg-red-500' },
                      {
                        label: 'Defect Rate',
                        value: Math.max(0, 100 - sup.defectRate * 20),
                        color:
                          sup.defectRate <= 0.5
                            ? 'bg-green-500'
                            : sup.defectRate <= 1.5
                              ? 'bg-amber-500'
                              : 'bg-red-500' },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{bar.label}</span>
                          <span>
                            {bar.label === 'Defect Rate' ? `${sup.defectRate}%` : `${bar.value}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${bar.color}`}
                            style={{ width: `${bar.value}%` }}
                          />
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
