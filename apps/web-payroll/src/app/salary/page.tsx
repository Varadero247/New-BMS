'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Percent, Settings, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import api, { aiApi } from '@/lib/api';

interface ComponentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  type: string;
  isTaxable: boolean;
  isRecurring: boolean;
  isStatutory: boolean;
  defaultCalculationType: string;
  defaultPercentage: number | null;
  isActive: boolean;
}

export default function SalaryPage() {
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'BASIC',
    type: 'EARNING',
    isTaxable: true,
    isRecurring: true,
    isStatutory: false,
    defaultCalculationType: 'FIXED',
    defaultPercentage: '',
  });

  useEffect(() => {
    fetchComponentTypes();
  }, [typeFilter, categoryFilter]);

  const fetchComponentTypes = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await api.get(`/salary/component-types?${params.toString()}`);
      setComponentTypes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching component types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/salary/component-types', {
        ...formData,
        defaultPercentage: formData.defaultPercentage ? parseFloat(formData.defaultPercentage) : undefined,
      });
      setShowModal(false);
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'BASIC',
        type: 'EARNING',
        isTaxable: true,
        isRecurring: true,
        isStatutory: false,
        defaultCalculationType: 'FIXED',
        defaultPercentage: '',
      });
      fetchComponentTypes();
    } catch (error) {
      console.error('Error creating component type:', error);
    }
  };

  const handleAiBenchmark = async () => {
    setAiLoading(true);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'SALARY_BENCHMARK',
        context: {
          jobTitle: 'General Staff',
          department: 'All Departments',
          location: 'United Kingdom',
          experienceLevel: 'Mid-level',
          industry: 'General',
          currency: 'GBP',
        },
      });
      setAiResult(res.data.data.result);
      setAiExpanded(true);
    } catch (error) {
      console.error('Error running AI benchmark:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      BASIC: 'bg-blue-100 text-blue-800',
      ALLOWANCE: 'bg-green-100 text-green-800',
      BONUS: 'bg-purple-100 text-purple-800',
      COMMISSION: 'bg-yellow-100 text-yellow-800',
      OVERTIME: 'bg-orange-100 text-orange-800',
      REIMBURSEMENT: 'bg-teal-100 text-teal-800',
      STATUTORY: 'bg-red-100 text-red-800',
      DEDUCTION: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading salary components...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Salary Structure</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAiBenchmark}
            disabled={aiLoading}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{aiLoading ? 'Benchmarking...' : 'AI Benchmark'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add Component Type</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="EARNING">Earnings</option>
          <option value="DEDUCTION">Deductions</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="BASIC">Basic</option>
          <option value="ALLOWANCE">Allowance</option>
          <option value="BONUS">Bonus</option>
          <option value="COMMISSION">Commission</option>
          <option value="OVERTIME">Overtime</option>
          <option value="REIMBURSEMENT">Reimbursement</option>
          <option value="STATUTORY">Statutory</option>
          <option value="DEDUCTION">Deduction</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Earnings</p>
              <p className="text-xl font-semibold">
                {componentTypes.filter((c) => c.type === 'EARNING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Percent className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Deductions</p>
              <p className="text-xl font-semibold">
                {componentTypes.filter((c) => c.type === 'DEDUCTION').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Components</p>
              <p className="text-xl font-semibold">{componentTypes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Benchmark Result */}
      {aiResult && (
        <div className="rounded-lg border-2 border-green-400 bg-white p-4 shadow">
          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Salary Benchmark</h3>
            </div>
            {aiExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {aiExpanded && (
            <div className="mt-4 space-y-3">
              {aiResult.marketRange && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Market Range:</p>
                  <div className="mt-1 grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-500">Low</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof aiResult.marketRange.low === 'number'
                          ? aiResult.marketRange.low.toLocaleString()
                          : aiResult.marketRange.low}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-xs text-gray-500">Median</p>
                      <p className="text-lg font-semibold text-green-700">
                        {typeof aiResult.marketRange.median === 'number'
                          ? aiResult.marketRange.median.toLocaleString()
                          : aiResult.marketRange.median}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-500">High</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof aiResult.marketRange.high === 'number'
                          ? aiResult.marketRange.high.toLocaleString()
                          : aiResult.marketRange.high}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {aiResult.currentPositionInRange && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Current Position in Range:</span>{' '}
                  {aiResult.currentPositionInRange}
                </p>
              )}
              {aiResult.percentile !== undefined && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Percentile:</span>{' '}
                  {aiResult.percentile}th
                </p>
              )}
              {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-700">Recommendations:</p>
                  <ul className="ml-4 list-disc text-sm text-blue-600">
                    {aiResult.recommendations.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Component Types Table */}
      <div className="rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Calculation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Taxable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {componentTypes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No salary components found. Add component types to get started.
                </td>
              </tr>
            ) : (
              componentTypes.map((component) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                    {component.code}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{component.name}</p>
                      {component.description && (
                        <p className="text-sm text-gray-500">{component.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      component.type === 'EARNING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {component.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryBadge(component.category)}`}>
                      {component.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {component.defaultCalculationType}
                    {component.defaultPercentage && ` (${component.defaultPercentage}%)`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {component.isTaxable ? (
                      <span className="text-red-600">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      component.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {component.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Component Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add Salary Component Type</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  >
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="ALLOWANCE">Allowance</option>
                    <option value="BONUS">Bonus</option>
                    <option value="COMMISSION">Commission</option>
                    <option value="OVERTIME">Overtime</option>
                    <option value="REIMBURSEMENT">Reimbursement</option>
                    <option value="STATUTORY">Statutory</option>
                    <option value="DEDUCTION">Deduction</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calculation Type</label>
                  <select
                    value={formData.defaultCalculationType}
                    onChange={(e) => setFormData({ ...formData, defaultCalculationType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PERCENTAGE_OF_BASIC">% of Basic</option>
                    <option value="PERCENTAGE_OF_GROSS">% of Gross</option>
                    <option value="FORMULA">Formula</option>
                    <option value="ATTENDANCE_BASED">Attendance Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.defaultPercentage}
                    onChange={(e) => setFormData({ ...formData, defaultPercentage: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isTaxable}
                    onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Taxable</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Recurring</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isStatutory}
                    onChange={(e) => setFormData({ ...formData, isStatutory: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Statutory</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Create Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
