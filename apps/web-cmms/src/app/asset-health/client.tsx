'use client';

import { useState, useMemo } from 'react';
import { Gauge, Badge } from '@ims/ui';
import {
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Wrench,
} from 'lucide-react';

type Criticality = 'Critical' | 'High' | 'Medium' | 'Low';
type HealthStatus = 'Good' | 'Fair' | 'Poor' | 'Critical';

interface Asset {
  id: string;
  name: string;
  tag: string;
  category: string;
  criticality: Criticality;
  healthStatus: HealthStatus;
  healthScore: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  mtbf: number; // hours
  mttr: number; // hours
  failureCount: number;
  lastPM: string;
  nextPM: string;
  age: number; // years
  expectedLife: number; // years
}

const MOCK_ASSETS: Asset[] = [
  {
    id: 'A001',
    name: 'CNC Machining Centre #1',
    tag: 'CNC-001',
    category: 'Production',
    criticality: 'Critical',
    healthStatus: 'Good',
    healthScore: 92,
    oee: 87,
    availability: 95,
    performance: 93,
    quality: 98,
    mtbf: 720,
    mttr: 2.5,
    failureCount: 2,
    lastPM: '2026-02-01',
    nextPM: '2026-03-01',
    age: 3,
    expectedLife: 15,
  },
  {
    id: 'A002',
    name: 'Hydraulic Press #2',
    tag: 'PRESS-002',
    category: 'Production',
    criticality: 'Critical',
    healthStatus: 'Fair',
    healthScore: 74,
    oee: 72,
    availability: 88,
    performance: 85,
    quality: 96,
    mtbf: 480,
    mttr: 4.0,
    failureCount: 5,
    lastPM: '2026-01-15',
    nextPM: '2026-02-15',
    age: 8,
    expectedLife: 20,
  },
  {
    id: 'A003',
    name: 'Conveyor System Main',
    tag: 'CONV-001',
    category: 'Material Handling',
    criticality: 'High',
    healthStatus: 'Good',
    healthScore: 88,
    oee: 94,
    availability: 97,
    performance: 98,
    quality: 99,
    mtbf: 1200,
    mttr: 1.5,
    failureCount: 1,
    lastPM: '2026-02-05',
    nextPM: '2026-03-05',
    age: 2,
    expectedLife: 12,
  },
  {
    id: 'A004',
    name: 'Air Compressor #1',
    tag: 'COMP-001',
    category: 'Utilities',
    criticality: 'High',
    healthStatus: 'Poor',
    healthScore: 55,
    oee: 0,
    availability: 78,
    performance: 0,
    quality: 0,
    mtbf: 240,
    mttr: 6.0,
    failureCount: 8,
    lastPM: '2025-12-20',
    nextPM: '2026-02-20',
    age: 12,
    expectedLife: 15,
  },
  {
    id: 'A005',
    name: 'Injection Moulder #3',
    tag: 'INJ-003',
    category: 'Production',
    criticality: 'Critical',
    healthStatus: 'Good',
    healthScore: 90,
    oee: 85,
    availability: 93,
    performance: 94,
    quality: 97,
    mtbf: 650,
    mttr: 3.0,
    failureCount: 3,
    lastPM: '2026-01-28',
    nextPM: '2026-02-28',
    age: 5,
    expectedLife: 18,
  },
  {
    id: 'A006',
    name: 'HVAC Unit — Production Floor',
    tag: 'HVAC-001',
    category: 'Facilities',
    criticality: 'Medium',
    healthStatus: 'Good',
    healthScore: 85,
    oee: 0,
    availability: 99,
    performance: 0,
    quality: 0,
    mtbf: 2160,
    mttr: 2.0,
    failureCount: 1,
    lastPM: '2026-01-10',
    nextPM: '2026-04-10',
    age: 4,
    expectedLife: 20,
  },
  {
    id: 'A007',
    name: 'Robotic Welding Cell',
    tag: 'ROB-001',
    category: 'Production',
    criticality: 'Critical',
    healthStatus: 'Critical',
    healthScore: 42,
    oee: 58,
    availability: 72,
    performance: 82,
    quality: 98,
    mtbf: 160,
    mttr: 8.0,
    failureCount: 12,
    lastPM: '2026-02-10',
    nextPM: '2026-02-17',
    age: 10,
    expectedLife: 12,
  },
  {
    id: 'A008',
    name: 'Forklift — Warehouse',
    tag: 'FLT-001',
    category: 'Material Handling',
    criticality: 'Medium',
    healthStatus: 'Fair',
    healthScore: 68,
    oee: 0,
    availability: 85,
    performance: 0,
    quality: 0,
    mtbf: 360,
    mttr: 3.5,
    failureCount: 4,
    lastPM: '2026-01-20',
    nextPM: '2026-02-20',
    age: 6,
    expectedLife: 10,
  },
  {
    id: 'A009',
    name: 'Surface Grinder',
    tag: 'GRD-001',
    category: 'Production',
    criticality: 'High',
    healthStatus: 'Good',
    healthScore: 91,
    oee: 82,
    availability: 94,
    performance: 90,
    quality: 97,
    mtbf: 900,
    mttr: 2.0,
    failureCount: 2,
    lastPM: '2026-02-08',
    nextPM: '2026-03-08',
    age: 4,
    expectedLife: 20,
  },
  {
    id: 'A010',
    name: 'Backup Generator',
    tag: 'GEN-001',
    category: 'Utilities',
    criticality: 'High',
    healthStatus: 'Good',
    healthScore: 94,
    oee: 0,
    availability: 100,
    performance: 0,
    quality: 0,
    mtbf: 5000,
    mttr: 4.0,
    failureCount: 0,
    lastPM: '2026-01-05',
    nextPM: '2026-07-05',
    age: 2,
    expectedLife: 25,
  },
];

const criticalityColors: Record<Criticality, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const healthColors: Record<HealthStatus, string> = {
  Good: 'bg-green-100 text-green-700',
  Fair: 'bg-yellow-100 text-yellow-700',
  Poor: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export default function AssetHealthClient() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterCriticality, setFilterCriticality] = useState<string>('');
  const [filterHealth, setFilterHealth] = useState<string>('');
  const [sortBy, setSortBy] = useState<'health' | 'oee' | 'mtbf' | 'failures'>('health');

  const assets = useMemo(() => {
    const filtered = MOCK_ASSETS.filter((a) => {
      if (filterCriticality && a.criticality !== filterCriticality) return false;
      if (filterHealth && a.healthStatus !== filterHealth) return false;
      return true;
    });
    if (sortBy === 'health') filtered.sort((a, b) => a.healthScore - b.healthScore);
    else if (sortBy === 'oee') filtered.sort((a, b) => b.oee - a.oee);
    else if (sortBy === 'mtbf') filtered.sort((a, b) => a.mtbf - b.mtbf);
    else filtered.sort((a, b) => b.failureCount - a.failureCount);
    return filtered;
  }, [filterCriticality, filterHealth, sortBy]);

  // Summary
  const avgHealth = Math.round(
    MOCK_ASSETS.reduce((s, a) => s + a.healthScore, 0) / MOCK_ASSETS.length
  );
  const productionAssets = MOCK_ASSETS.filter((a) => a.category === 'Production');
  const avgOEE =
    productionAssets.length > 0
      ? Math.round(productionAssets.reduce((s, a) => s + a.oee, 0) / productionAssets.length)
      : 0;
  const criticalAlerts = MOCK_ASSETS.filter(
    (a) => a.healthStatus === 'Critical' || a.healthStatus === 'Poor'
  ).length;
  const totalFailures = MOCK_ASSETS.reduce((s, a) => s + a.failureCount, 0);
  const avgMTBF = Math.round(MOCK_ASSETS.reduce((s, a) => s + a.mtbf, 0) / MOCK_ASSETS.length);
  const avgMTTR = (MOCK_ASSETS.reduce((s, a) => s + a.mttr, 0) / MOCK_ASSETS.length).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Asset Health Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Equipment reliability, OEE, and maintenance performance metrics
          </p>
        </div>
        <a
          href="/assets"
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
        >
          Asset Register
        </a>
      </div>

      {/* Top gauges */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center">
          <Gauge value={avgHealth} max={100} size="md" label="Fleet Health" color="auto" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center">
          <Gauge
            value={avgOEE}
            max={100}
            size="md"
            label="Avg OEE"
            sublabel="Production"
            color="blue"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex flex-col justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{criticalAlerts}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Critical/Poor Assets</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex flex-col justify-center">
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {avgMTBF}h <span className="text-xs text-gray-400 dark:text-gray-500">MTBF</span>
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {avgMTTR}h <span className="text-xs text-gray-400 dark:text-gray-500">MTTR</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex flex-col justify-center">
          <Wrench className="h-6 w-6 text-orange-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-700">{totalFailures}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Failures (YTD)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Criticality:</span>
        <select
          value={filterCriticality}
          onChange={(e) => setFilterCriticality(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">Health:</span>
        <select
          value={filterHealth}
          onChange={(e) => setFilterHealth(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
          <option value="Critical">Critical</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="health">Health Score (Low first)</option>
          <option value="oee">OEE (High first)</option>
          <option value="mtbf">MTBF (Low first)</option>
          <option value="failures">Failures (High first)</option>
        </select>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {assets.length} assets
        </span>
      </div>

      {/* Asset cards */}
      <div className="grid grid-cols-2 gap-4">
        {assets.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;
          const lifePercent = Math.min(100, (asset.age / asset.expectedLife) * 100);

          return (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(isSelected ? null : asset)}
              className={`bg-white dark:bg-gray-900 border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-amber-500 border-amber-300' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${asset.healthScore >= 80 ? 'bg-green-100' : asset.healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}
                  >
                    <Server
                      className={`h-5 w-5 ${asset.healthScore >= 80 ? 'text-green-700' : asset.healthScore >= 60 ? 'text-yellow-700' : 'text-red-700'}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {asset.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {asset.tag} | {asset.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${criticalityColors[asset.criticality]}`}
                  >
                    {asset.criticality}
                  </span>
                  <span
                    className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${healthColors[asset.healthStatus]}`}
                  >
                    {asset.healthStatus}
                  </span>
                </div>
              </div>

              {/* Health + OEE gauges inline */}
              <div className="flex items-center gap-6 mb-3">
                <div className="flex items-center gap-3">
                  <Gauge value={asset.healthScore} max={100} size="sm" color="auto" />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Health</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {asset.healthScore}%
                    </p>
                  </div>
                </div>
                {asset.oee > 0 && (
                  <div className="flex items-center gap-3">
                    <Gauge value={asset.oee} max={100} size="sm" color="blue" />
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">OEE</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {asset.oee}%
                      </p>
                    </div>
                  </div>
                )}
                <div className="ml-auto grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">MTBF:</span>{' '}
                    <span className="font-medium">{asset.mtbf}h</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">MTTR:</span>{' '}
                    <span className="font-medium">{asset.mttr}h</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Failures:</span>{' '}
                    <span
                      className={`font-medium ${asset.failureCount > 5 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {asset.failureCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Age:</span>{' '}
                    <span className="font-medium">
                      {asset.age}/{asset.expectedLife}yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Life bar */}
              <div className="mb-1">
                <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">
                  <span>Asset Life</span>
                  <span>{Math.round(lifePercent)}% used</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${lifePercent >= 80 ? 'bg-red-500' : lifePercent >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${lifePercent}%` }}
                  />
                </div>
              </div>

              {/* Expanded detail */}
              {isSelected && asset.oee > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-[10px] font-semibold text-gray-600 mb-2">OEE Breakdown</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <Gauge value={asset.availability} max={100} size="sm" color="green" />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        Availability
                      </p>
                    </div>
                    <div className="text-center">
                      <Gauge value={asset.performance} max={100} size="sm" color="blue" />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        Performance
                      </p>
                    </div>
                    <div className="text-center">
                      <Gauge value={asset.quality} max={100} size="sm" color="purple" />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Quality</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Last PM:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {asset.lastPM}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Next PM:</span>{' '}
                      <span
                        className={`font-medium ${new Date(asset.nextPM) < new Date() ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {asset.nextPM}
                      </span>
                    </div>
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
