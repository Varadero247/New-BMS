'use client';

import { useState } from 'react';
import {
  Leaf,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Droplets,
  Cloud,
  Trash2,
  Zap,
  Volume2,
  TreePine,
} from 'lucide-react';

type Significance = 'significant' | 'not-significant';
type Condition = 'normal' | 'abnormal' | 'emergency';
type Category = 'emissions' | 'water' | 'waste' | 'energy' | 'noise' | 'land-use' | 'biodiversity';

interface EnvironmentalAspect {
  id: string;
  refNumber: string;
  activity: string;
  aspect: string;
  impact: string;
  category: Category;
  condition: Condition;
  severity: number;
  probability: number;
  duration: number;
  extent: number;
  reversibility: number;
  regulatory: number;
  stakeholder: number;
  totalScore: number;
  significance: Significance;
  controls: string[];
  legalReqs: string[];
  department: string;
  owner: string;
  lastReview: string;
}

const aspects: EnvironmentalAspect[] = [
  {
    id: 'a1',
    refNumber: 'ENV-ASP-2025-001',
    activity: 'Production boiler operation',
    aspect: 'Combustion emissions to air',
    impact: 'Air pollution — NOx, SOx, particulates',
    category: 'emissions',
    condition: 'normal',
    severity: 4,
    probability: 5,
    duration: 4,
    extent: 3,
    reversibility: 2,
    regulatory: 5,
    stakeholder: 4,
    totalScore: 38.5,
    significance: 'significant',
    controls: ['Emissions monitoring system', 'Annual stack testing', 'Low-NOx burners installed'],
    legalReqs: ['Environmental Permit EP/12345', 'Clean Air Act 1993'],
    department: 'Production',
    owner: 'Plant Manager',
    lastReview: '2025-11-15',
  },
  {
    id: 'a2',
    refNumber: 'ENV-ASP-2025-002',
    activity: 'Chemical storage and handling',
    aspect: 'Potential spill/release to ground',
    impact: 'Soil and groundwater contamination',
    category: 'water',
    condition: 'abnormal',
    severity: 5,
    probability: 2,
    duration: 5,
    extent: 3,
    reversibility: 1,
    regulatory: 5,
    stakeholder: 4,
    totalScore: 31.5,
    significance: 'significant',
    controls: ['Bunded storage areas', 'Spill kits at all locations', 'COSHH assessments'],
    legalReqs: ['Water Resources Act 1991', 'COSHH Regulations'],
    department: 'Warehouse',
    owner: 'Warehouse Manager',
    lastReview: '2025-10-20',
  },
  {
    id: 'a3',
    refNumber: 'ENV-ASP-2025-003',
    activity: 'Office operations',
    aspect: 'Electricity consumption',
    impact: 'Indirect GHG emissions (Scope 2)',
    category: 'energy',
    condition: 'normal',
    severity: 2,
    probability: 5,
    duration: 4,
    extent: 2,
    reversibility: 4,
    regulatory: 2,
    stakeholder: 2,
    totalScore: 23.5,
    significance: 'significant',
    controls: ['LED lighting throughout', 'Smart HVAC controls', 'Renewable electricity PPA'],
    legalReqs: ['SECR reporting', 'ESOS Phase 3'],
    department: 'Facilities',
    owner: 'Facilities Manager',
    lastReview: '2025-12-01',
  },
  {
    id: 'a4',
    refNumber: 'ENV-ASP-2025-004',
    activity: 'Machining processes',
    aspect: 'Coolant and swarf waste generation',
    impact: 'Hazardous waste disposal',
    category: 'waste',
    condition: 'normal',
    severity: 3,
    probability: 5,
    duration: 3,
    extent: 2,
    reversibility: 3,
    regulatory: 4,
    stakeholder: 3,
    totalScore: 27,
    significance: 'significant',
    controls: ['Coolant recycling system', 'Licensed waste carrier', 'Waste transfer notes'],
    legalReqs: ['Duty of Care Regulations', 'Hazardous Waste Regs'],
    department: 'Production',
    owner: 'Production Manager',
    lastReview: '2025-09-15',
  },
  {
    id: 'a5',
    refNumber: 'ENV-ASP-2025-005',
    activity: 'Vehicle fleet operation',
    aspect: 'Fuel combustion emissions',
    impact: 'Direct GHG emissions (Scope 1)',
    category: 'emissions',
    condition: 'normal',
    severity: 3,
    probability: 5,
    duration: 3,
    extent: 3,
    reversibility: 3,
    regulatory: 3,
    stakeholder: 3,
    totalScore: 27,
    significance: 'significant',
    controls: ['Fleet EV transition plan', 'Driver training', 'Route optimisation'],
    legalReqs: ['SECR reporting'],
    department: 'Logistics',
    owner: 'Fleet Manager',
    lastReview: '2025-11-01',
  },
  {
    id: 'a6',
    refNumber: 'ENV-ASP-2025-006',
    activity: 'Packaging operations',
    aspect: 'Packaging waste generation',
    impact: 'Non-hazardous waste to landfill',
    category: 'waste',
    condition: 'normal',
    severity: 2,
    probability: 4,
    duration: 2,
    extent: 2,
    reversibility: 4,
    regulatory: 2,
    stakeholder: 2,
    totalScore: 19,
    significance: 'not-significant',
    controls: ['Recyclable packaging sourced', 'Cardboard baler', 'Packaging take-back scheme'],
    legalReqs: ['Packaging Waste Regs'],
    department: 'Packaging',
    owner: 'Packaging Supervisor',
    lastReview: '2025-10-01',
  },
  {
    id: 'a7',
    refNumber: 'ENV-ASP-2025-007',
    activity: 'Water cooling systems',
    aspect: 'Water consumption',
    impact: 'Depletion of freshwater resources',
    category: 'water',
    condition: 'normal',
    severity: 3,
    probability: 4,
    duration: 3,
    extent: 2,
    reversibility: 3,
    regulatory: 2,
    stakeholder: 3,
    totalScore: 23,
    significance: 'significant',
    controls: ['Closed-loop cooling', 'Water meters on all inputs', 'Rainwater harvesting'],
    legalReqs: ['Abstraction licence'],
    department: 'Production',
    owner: 'Plant Manager',
    lastReview: '2025-08-20',
  },
  {
    id: 'a8',
    refNumber: 'ENV-ASP-2025-008',
    activity: 'Paint spraying booth',
    aspect: 'VOC emissions to air',
    impact: 'Air pollution — volatile organic compounds',
    category: 'emissions',
    condition: 'normal',
    severity: 4,
    probability: 4,
    duration: 3,
    extent: 2,
    reversibility: 2,
    regulatory: 5,
    stakeholder: 3,
    totalScore: 29,
    significance: 'significant',
    controls: ['Activated carbon filters', 'Low-VOC paints', 'Extraction monitoring'],
    legalReqs: ['Solvent Emissions Directive', 'Environmental Permit'],
    department: 'Paint Shop',
    owner: 'Paint Shop Manager',
    lastReview: '2025-07-15',
  },
  {
    id: 'a9',
    refNumber: 'ENV-ASP-2025-009',
    activity: 'General office printing',
    aspect: 'Paper consumption',
    impact: 'Resource depletion, waste',
    category: 'waste',
    condition: 'normal',
    severity: 1,
    probability: 4,
    duration: 1,
    extent: 1,
    reversibility: 5,
    regulatory: 1,
    stakeholder: 1,
    totalScore: 11.5,
    significance: 'not-significant',
    controls: ['Duplex printing default', 'FSC-certified paper', 'Digital-first policy'],
    legalReqs: [],
    department: 'Administration',
    owner: 'Office Manager',
    lastReview: '2025-06-01',
  },
  {
    id: 'a10',
    refNumber: 'ENV-ASP-2025-010',
    activity: 'Compressor room operation',
    aspect: 'Noise emission to neighbours',
    impact: 'Noise disturbance to community',
    category: 'noise',
    condition: 'normal',
    severity: 2,
    probability: 3,
    duration: 3,
    extent: 2,
    reversibility: 4,
    regulatory: 2,
    stakeholder: 3,
    totalScore: 18.5,
    significance: 'not-significant',
    controls: ['Sound-insulated enclosure', 'Night-time operating limits', 'Annual noise survey'],
    legalReqs: ['Environmental Protection Act — noise nuisance'],
    department: 'Engineering',
    owner: 'Engineering Manager',
    lastReview: '2025-09-01',
  },
];

const categoryConfig: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  emissions: {
    label: 'Emissions',
    icon: <Cloud className="h-4 w-4" />,
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  },
  water: {
    label: 'Water',
    icon: <Droplets className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700',
  },
  waste: {
    label: 'Waste',
    icon: <Trash2 className="h-4 w-4" />,
    color: 'bg-amber-100 text-amber-700',
  },
  energy: {
    label: 'Energy',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-700',
  },
  noise: {
    label: 'Noise',
    icon: <Volume2 className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-700',
  },
  'land-use': {
    label: 'Land Use',
    icon: <TreePine className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700',
  },
  biodiversity: {
    label: 'Biodiversity',
    icon: <Leaf className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-700',
  },
};

export default function AspectRegisterClient() {
  const [selectedAspect, setSelectedAspect] = useState<EnvironmentalAspect | null>(null);
  const [significanceFilter, setSignificanceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = aspects.filter((a) => {
    const matchesSig = significanceFilter === 'all' || a.significance === significanceFilter;
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      a.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.aspect.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.refNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSig && matchesCat && matchesSearch;
  });

  const significantCount = aspects.filter((a) => a.significance === 'significant').length;
  const avgScore =
    Math.round((aspects.reduce((s, a) => s + a.totalScore, 0) / aspects.length) * 10) / 10;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Environmental Aspect Register
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ISO 14001:2015 Clause 6.1.2 — Environmental aspects and significance evaluation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Aspects
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {aspects.length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 uppercase font-medium">Significant</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{significantCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 uppercase font-medium">Not Significant</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {aspects.length - significantCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Avg Score
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{avgScore}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">threshold: 15</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Categories
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {new Set(aspects.map((a) => a.category)).size}
          </p>
        </div>
      </div>

      {/* Significance Formula */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-green-800 mb-1">Significance Scoring Formula</h3>
        <p className="text-xs text-green-700 font-mono">
          Score = (Severity × 1.5) + (Probability × 1.5) + Duration + Extent + Reversibility +
          Regulatory + Stakeholder
        </p>
        <p className="text-xs text-green-600 mt-1">
          Score &ge; 15 = <span className="font-bold">Significant</span> (requires operational
          controls, objectives, and monitoring)
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search aspects..."
            placeholder="Search aspects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {['all', 'significant', 'not-significant'].map((s) => (
            <button
              key={s}
              onClick={() => setSignificanceFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${significanceFilter === s ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : s === 'significant' ? 'Significant' : 'Not Significant'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Ref
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Activity / Aspect
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                  Category
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">
                  Score
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Significance
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Department
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAspect(a)}
                  className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-green-50 transition-colors ${selectedAspect?.id === a.id ? 'bg-green-50' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {a.refNumber.split('-').slice(-2).join('-')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{a.activity}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.aspect}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[a.category].color}`}
                    >
                      {categoryConfig[a.category].icon}
                      {categoryConfig[a.category].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-bold ${a.totalScore >= 15 ? 'text-red-700' : 'text-green-700'}`}
                    >
                      {a.totalScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.significance === 'significant' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {a.significance === 'significant' ? 'Significant' : 'Not Significant'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{a.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedAspect && (
          <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 self-start sticky top-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-green-600">{selectedAspect.refNumber}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {selectedAspect.activity}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAspect(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                x
              </button>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Aspect</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAspect.aspect}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Impact</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAspect.impact}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Scoring Breakdown
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    label: 'Severity (×1.5)',
                    value: selectedAspect.severity,
                    weighted: selectedAspect.severity * 1.5,
                  },
                  {
                    label: 'Probability (×1.5)',
                    value: selectedAspect.probability,
                    weighted: selectedAspect.probability * 1.5,
                  },
                  {
                    label: 'Duration',
                    value: selectedAspect.duration,
                    weighted: selectedAspect.duration,
                  },
                  {
                    label: 'Extent',
                    value: selectedAspect.extent,
                    weighted: selectedAspect.extent,
                  },
                  {
                    label: 'Reversibility',
                    value: selectedAspect.reversibility,
                    weighted: selectedAspect.reversibility,
                  },
                  {
                    label: 'Regulatory',
                    value: selectedAspect.regulatory,
                    weighted: selectedAspect.regulatory,
                  },
                  {
                    label: 'Stakeholder',
                    value: selectedAspect.stakeholder,
                    weighted: selectedAspect.stakeholder,
                  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-gray-600">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${s.value >= 4 ? 'bg-red-500' : s.value >= 3 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${(s.value / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono w-6 text-right">{s.weighted}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-1">
                  <span>Total Score</span>
                  <span
                    className={selectedAspect.totalScore >= 15 ? 'text-red-700' : 'text-green-700'}
                  >
                    {selectedAspect.totalScore}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Controls
              </p>
              <div className="space-y-1">
                {selectedAspect.controls.map((c, i) => (
                  <p key={i} className="text-xs text-gray-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {c}
                  </p>
                ))}
              </div>
            </div>

            {selectedAspect.legalReqs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Legal Requirements
                </p>
                <div className="space-y-1">
                  {selectedAspect.legalReqs.map((l, i) => (
                    <p key={i} className="text-xs text-gray-600">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-100 dark:border-gray-700 pt-3">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Owner</p>
                <p className="font-medium">{selectedAspect.owner}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Department</p>
                <p className="font-medium">{selectedAspect.department}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Condition</p>
                <p className="font-medium capitalize">{selectedAspect.condition}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Review</p>
                <p className="font-medium">{selectedAspect.lastReview}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
