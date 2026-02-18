'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FlaskConical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface VerificationTest {
  id: string;
  testId: string;
  testName: string;
  product: string;
  category:
    | 'electrical-safety'
    | 'biocompatibility'
    | 'software'
    | 'mechanical'
    | 'emc'
    | 'environmental'
    | 'sterility';
  standard: string;
  result: 'pass' | 'fail' | 'conditional' | 'pending';
  testDate: string;
  tester: string;
  acceptanceCriteria: string;
  actualResult: string;
  deviations: string;
}

const tests: VerificationTest[] = [
  {
    id: '1',
    testId: 'VER-CMX3-001',
    testName: 'Electrical Safety — Leakage Current',
    product: 'CardioMonitor Pro X3',
    category: 'electrical-safety',
    standard: 'IEC 60601-1:2005+A2',
    result: 'pass',
    testDate: '2026-01-12',
    tester: 'E. Rodriguez',
    acceptanceCriteria: '≤ 500µA patient leakage (normal)',
    actualResult: '120µA measured',
    deviations: '',
  },
  {
    id: '2',
    testId: 'VER-CMX3-002',
    testName: 'EMC — Radiated Emissions',
    product: 'CardioMonitor Pro X3',
    category: 'emc',
    standard: 'IEC 60601-1-2:2014+A1',
    result: 'pass',
    testDate: '2026-01-15',
    tester: 'External Lab — TUV',
    acceptanceCriteria: 'Class B limits per CISPR 11',
    actualResult: 'Within limits at all frequencies',
    deviations: '',
  },
  {
    id: '3',
    testId: 'VER-CMX3-003',
    testName: 'Biocompatibility — Cytotoxicity',
    product: 'CardioMonitor Pro X3',
    category: 'biocompatibility',
    standard: 'ISO 10993-5:2009',
    result: 'pass',
    testDate: '2025-12-20',
    tester: 'External Lab — Nelson',
    acceptanceCriteria: 'Grade 0-1 reactivity',
    actualResult: 'Grade 0 — no reactivity',
    deviations: '',
  },
  {
    id: '4',
    testId: 'VER-NSV2-001',
    testName: 'Software Unit Testing Coverage',
    product: 'NeuroStim Controller V2',
    category: 'software',
    standard: 'IEC 62304:2006+A1',
    result: 'conditional',
    testDate: '2026-02-01',
    tester: 'J. Wilson',
    acceptanceCriteria: '≥ 95% MC/DC coverage for Class C',
    actualResult: '92% coverage — 3 modules below target',
    deviations: 'DEV-2026-004: Coverage gap in alarm module',
  },
  {
    id: '5',
    testId: 'VER-NSV2-002',
    testName: 'Software Integration Testing',
    product: 'NeuroStim Controller V2',
    category: 'software',
    standard: 'IEC 62304:2006+A1',
    result: 'pending',
    testDate: '2026-02-15',
    tester: 'J. Wilson',
    acceptanceCriteria: 'All integration tests pass, no P1/P2 defects open',
    actualResult: 'Scheduled',
    deviations: '',
  },
  {
    id: '6',
    testId: 'VER-SVE-001',
    testName: 'Mechanical Strength — Drop Test',
    product: 'SurgiView Endoscope',
    category: 'mechanical',
    standard: 'IEC 60601-1 Clause 15',
    result: 'pass',
    testDate: '2026-01-08',
    tester: 'R. Kim',
    acceptanceCriteria: '1m drop, 3 orientations, no functional failure',
    actualResult: 'All 3 drops passed, minor cosmetic mark only',
    deviations: '',
  },
  {
    id: '7',
    testId: 'VER-SVE-002',
    testName: 'Environmental — Temperature Cycling',
    product: 'SurgiView Endoscope',
    category: 'environmental',
    standard: 'IEC 60068-2-14',
    result: 'pass',
    testDate: '2026-01-10',
    tester: 'R. Kim',
    acceptanceCriteria: '-20°C to +55°C, 10 cycles, functional after',
    actualResult: 'All 10 cycles completed, full functionality confirmed',
    deviations: '',
  },
  {
    id: '8',
    testId: 'VER-OFK-001',
    testName: 'Sterility Assurance — Bioburden',
    product: 'OrthoFix Implant Kit',
    category: 'sterility',
    standard: 'ISO 11737-1:2018',
    result: 'pass',
    testDate: '2025-10-05',
    tester: 'External Lab — Nelson',
    acceptanceCriteria: '< 1000 CFU per device',
    actualResult: '12 CFU measured (3 samples)',
    deviations: '',
  },
  {
    id: '9',
    testId: 'VER-DSP-001',
    testName: 'Electrical Safety — Dielectric Strength',
    product: 'DiagnosScan Portable',
    category: 'electrical-safety',
    standard: 'IEC 60601-1:2005+A2',
    result: 'fail',
    testDate: '2026-02-05',
    tester: 'E. Rodriguez',
    acceptanceCriteria: '4000V AC, 1 min, no breakdown',
    actualResult: 'Breakdown at 3200V — insulation failure',
    deviations: 'NCR-2026-012: Insulation material non-conformance',
  },
];

const resultConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pass: { label: 'Pass', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  fail: { label: 'Fail', color: 'bg-red-100 text-red-700', icon: XCircle },
  conditional: { label: 'Conditional', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700', icon: Clock },
};

const categoryLabels: Record<string, string> = {
  'electrical-safety': 'Electrical Safety',
  biocompatibility: 'Biocompatibility',
  software: 'Software',
  mechanical: 'Mechanical',
  emc: 'EMC',
  environmental: 'Environmental',
  sterility: 'Sterility',
};

export default function VerificationClient() {
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const passCount = tests.filter((t) => t.result === 'pass').length;
  const failCount = tests.filter((t) => t.result === 'fail').length;
  const passRate = Math.round(
    (passCount / tests.filter((t) => t.result !== 'pending').length) * 100
  );

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !search ||
        t.testName.toLowerCase().includes(search.toLowerCase()) ||
        t.testId.toLowerCase().includes(search.toLowerCase()) ||
        t.product.toLowerCase().includes(search.toLowerCase());
      const matchesResult = filterResult === 'all' || t.result === filterResult;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesResult && matchesCategory;
    });
  }, [search, filterResult, filterCategory]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Design Verification</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Test execution and results tracking — ISO 13485:2016 Clause 7.3.6
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Tests
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{tests.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Pass Rate
          </p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{passRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Failures</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{failCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Pending</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">
            {tests.filter((t) => t.result === 'pending').length}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search tests..."
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          aria-label="Filter by result"
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Results</option>
          {Object.entries(resultConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-32">
                Test ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                Test Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-36">
                Product
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                Category
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                Result
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                Date
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((test) => {
              const rc = resultConfig[test.result];
              const Icon = rc.icon;
              const isExpanded = expandedId === test.id;
              return (
                <>
                  <tr
                    key={test.id}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : test.id)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{test.testId}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100 text-xs">
                      {test.testName}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{test.product}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {categoryLabels[test.category]}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {test.testDate}
                    </td>
                    <td className="px-4 py-2.5">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${test.id}-detail`} className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs ml-4">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Standard:</span>{' '}
                            <span className="font-medium">{test.standard}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tester:</span>{' '}
                            <span className="font-medium">{test.tester}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Acceptance Criteria:
                            </span>{' '}
                            <span className="font-medium">{test.acceptanceCriteria}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Actual Result:</span>{' '}
                            <span className="font-medium">{test.actualResult}</span>
                          </div>
                          {test.deviations && (
                            <div className="col-span-2">
                              <span className="text-red-500">Deviation:</span>{' '}
                              <span className="font-medium text-red-700">{test.deviations}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
