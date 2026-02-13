'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  rating: 'A' | 'B' | 'C' | 'D';
  ppm: number;
  onTimeDelivery: number;
  qualityScore: number;
  developmentPlan: string;
  status: 'approved' | 'conditional' | 'development' | 'suspended';
  location: string;
  category: string;
  lastAudit: string;
  trend: 'improving' | 'stable' | 'declining';
}

const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'TechSeal GmbH', tier: 1, rating: 'A', ppm: 12, onTimeDelivery: 98.5, qualityScore: 96, developmentPlan: 'Maintain current performance; annual IATF renewal Q3', status: 'approved', location: 'Stuttgart, Germany', category: 'Seals & Gaskets', lastAudit: '2025-11-10', trend: 'stable' },
  { id: '2', name: 'PrecisionCast Ltd.', tier: 1, rating: 'B', ppm: 145, onTimeDelivery: 91.2, qualityScore: 82, developmentPlan: 'Improvement plan active: reduce PPM to <50 by Q2 2026; OTD target 95%. Monthly review cadence.', status: 'conditional', location: 'Birmingham, UK', category: 'Die Casting', lastAudit: '2026-01-15', trend: 'improving' },
  { id: '3', name: 'FastenPro Korea', tier: 2, rating: 'A', ppm: 8, onTimeDelivery: 99.1, qualityScore: 97, developmentPlan: 'Preferred supplier status. Explore dual-sourcing arrangement.', status: 'approved', location: 'Busan, South Korea', category: 'Fasteners', lastAudit: '2025-09-22', trend: 'stable' },
  { id: '4', name: 'ElectroComp Poland', tier: 1, rating: 'C', ppm: 892, onTimeDelivery: 78.4, qualityScore: 65, developmentPlan: '90-day development plan issued 2026-01-20. Onsite support team assigned. Weekly escalation calls with supply chain director.', status: 'development', location: 'Wroclaw, Poland', category: 'Electronic Components', lastAudit: '2026-01-20', trend: 'declining' },
  { id: '5', name: 'RubberTech Mexico', tier: 2, rating: 'B', ppm: 67, onTimeDelivery: 93.8, qualityScore: 88, developmentPlan: 'Targeting A-rating by Q4 2026. Process audit scheduled March 2026.', status: 'approved', location: 'Monterrey, Mexico', category: 'Rubber Components', lastAudit: '2025-10-05', trend: 'improving' },
  { id: '6', name: 'MetalForm India', tier: 3, rating: 'D', ppm: 2140, onTimeDelivery: 62.0, qualityScore: 41, developmentPlan: 'Suspended pending containment verification. Replacement supplier qualification in progress. Target: qualify StructalParts Ltd. as alternative by 2026-03-31.', status: 'suspended', location: 'Pune, India', category: 'Metal Stampings', lastAudit: '2026-02-01', trend: 'declining' },
];

const STATUS_CONFIG = {
  approved:    { label: 'Approved',    bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  conditional: { label: 'Conditional', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
  development: { label: 'Development', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
  suspended:   { label: 'Suspended',   bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
};

const RATING_CONFIG = {
  A: { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  B: { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  C: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  D: { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
};

const TIER_CONFIG: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-purple-100', text: 'text-purple-700' },
  2: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  3: { bg: 'bg-gray-100',   text: 'text-gray-600' },
};

function PPMGauge({ value, max = 2500 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value > 500 ? 'bg-red-500' : value > 100 ? 'bg-orange-400' : value > 30 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">PPM</span>
        <span className={`font-bold ${value > 500 ? 'text-red-700' : value > 100 ? 'text-orange-600' : 'text-green-700'}`}>{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PercentGauge({ label, value, reverse = false }: { label: string; value: number; reverse?: boolean }) {
  const isGood = reverse ? value <= 30 : value >= 85;
  const isMed = reverse ? value <= 60 : value >= 70;
  const color = isGood ? 'bg-green-500' : isMed ? 'bg-yellow-400' : 'bg-red-500';
  const textColor = isGood ? 'text-green-700' : isMed ? 'text-yellow-700' : 'text-red-700';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className={`font-bold ${textColor}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function SupplierDevClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_SUPPLIERS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchTier = tierFilter === 'all' || String(s.tier) === tierFilter;
      return matchSearch && matchStatus && matchTier;
    });
  }, [search, statusFilter, tierFilter]);

  const counts = {
    approved: MOCK_SUPPLIERS.filter(s => s.status === 'approved').length,
    conditional: MOCK_SUPPLIERS.filter(s => s.status === 'conditional').length,
    development: MOCK_SUPPLIERS.filter(s => s.status === 'development').length,
    suspended: MOCK_SUPPLIERS.filter(s => s.status === 'suspended').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Development</h1>
            <p className="text-sm text-gray-500 mt-0.5">IATF 16949 Clause 8.4 — Supplier Performance & Development</p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{counts.approved}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Conditional</p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{counts.conditional}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Development</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{counts.development}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Suspended</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.suspended}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplier name, category, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="conditional">Conditional</option>
            <option value="development">Development</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="all">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>

        {/* Supplier Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(supplier => {
            const sc = STATUS_CONFIG[supplier.status];
            const rc = RATING_CONFIG[supplier.rating];
            const tc = TIER_CONFIG[supplier.tier];
            const StatusIcon = sc.icon;
            return (
              <div key={supplier.id} className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${supplier.status === 'suspended' ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tc.bg} ${tc.text}`}>Tier {supplier.tier}</span>
                        <span className="text-xs text-gray-500">{supplier.category}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-xs text-gray-500">{supplier.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-2 ${rc.bg} ${rc.text} ${rc.border}`}>
                        {supplier.rating}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {supplier.trend === 'improving' && <span className="flex items-center gap-1 text-xs text-green-600"><TrendingUp className="w-3 h-3" />Improving</span>}
                    {supplier.trend === 'stable' && <span className="flex items-center gap-1 text-xs text-gray-500"><Award className="w-3 h-3" />Stable</span>}
                    {supplier.trend === 'declining' && <span className="flex items-center gap-1 text-xs text-red-600"><TrendingDown className="w-3 h-3" />Declining</span>}
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs text-gray-500">Last audit: {supplier.lastAudit}</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <PPMGauge value={supplier.ppm} />
                  <PercentGauge label="On-Time Delivery" value={supplier.onTimeDelivery} />
                  <PercentGauge label="Quality Score" value={supplier.qualityScore} />
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Development Plan</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{supplier.developmentPlan}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center text-gray-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No suppliers match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
