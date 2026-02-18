'use client';

import { useState, useEffect } from 'react';
import { Plus, Heart, Users, Shield, Building } from 'lucide-react';
import api from '@/lib/api';

interface BenefitPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  provider: string | null;
  coverageLevels: string[];
  dependentsCoverage: boolean;
  employeeContribution: number | null;
  employerContribution: number | null;
  waitingPeriodDays: number;
  isActive: boolean;
  _count: { employeeBenefits: number };
}

export default function BenefitsPage() {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'HEALTH_INSURANCE',
    provider: '',
    coverageLevels: ['EMPLOYEE_ONLY'],
    dependentsCoverage: false,
    employeeContribution: '',
    employerContribution: '',
    waitingPeriodDays: '0',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPlans();
  }, [categoryFilter]);

  const fetchPlans = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await api.get(`/benefits/plans?${params.toString()}`);
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching benefit plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/benefits/plans', {
        ...formData,
        employeeContribution: formData.employeeContribution
          ? parseFloat(formData.employeeContribution)
          : undefined,
        employerContribution: formData.employerContribution
          ? parseFloat(formData.employerContribution)
          : undefined,
        waitingPeriodDays: parseInt(formData.waitingPeriodDays),
      });
      setShowModal(false);
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'HEALTH_INSURANCE',
        provider: '',
        coverageLevels: ['EMPLOYEE_ONLY'],
        dependentsCoverage: false,
        employeeContribution: '',
        employerContribution: '',
        waitingPeriodDays: '0',
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
      fetchPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HEALTH_INSURANCE':
      case 'LIFE_INSURANCE':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'DENTAL':
      case 'VISION':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'RETIREMENT':
      case 'PENSION':
        return <Building className="h-5 w-5 text-purple-500" />;
      default:
        return <Heart className="h-5 w-5 text-green-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      HEALTH_INSURANCE: 'bg-blue-100 text-blue-800',
      LIFE_INSURANCE: 'bg-indigo-100 text-indigo-800',
      DENTAL: 'bg-pink-100 text-pink-800',
      VISION: 'bg-cyan-100 text-cyan-800',
      RETIREMENT: 'bg-purple-100 text-purple-800',
      PENSION: 'bg-violet-100 text-violet-800',
      HSA: 'bg-green-100 text-green-800',
      FSA: 'bg-teal-100 text-teal-800',
      TRANSPORTATION: 'bg-orange-100 text-orange-800',
      WELLNESS: 'bg-lime-100 text-lime-800',
      OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
    };
    return styles[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading benefit plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Benefits Administration
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Benefit Plan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="HEALTH_INSURANCE">Health Insurance</option>
          <option value="LIFE_INSURANCE">Life Insurance</option>
          <option value="DENTAL">Dental</option>
          <option value="VISION">Vision</option>
          <option value="RETIREMENT">Retirement</option>
          <option value="PENSION">Pension</option>
          <option value="HSA">HSA</option>
          <option value="FSA">FSA</option>
          <option value="TRANSPORTATION">Transportation</option>
          <option value="WELLNESS">Wellness</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
              <p className="text-xl font-semibold">{plans.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Insurance Plans</p>
              <p className="text-xl font-semibold">
                {plans.filter((p) => p.category.includes('INSURANCE')).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Retirement Plans</p>
              <p className="text-xl font-semibold">
                {
                  plans.filter((p) => p.category === 'RETIREMENT' || p.category === 'PENSION')
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Enrollments</p>
              <p className="text-xl font-semibold">
                {plans.reduce((sum, p) => sum + p._count.employeeBenefits, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefit Plans Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full rounded-lg bg-white dark:bg-gray-900 p-12 text-center shadow">
            <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No benefit plans
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Get started by creating a benefit plan.
            </p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(plan.category)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.code}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryBadge(plan.category)}`}
                >
                  {plan.category.replace(/_/g, ' ')}
                </span>
              </div>

              {plan.description && <p className="mt-3 text-sm text-gray-600">{plan.description}</p>}

              <div className="mt-4 space-y-2">
                {plan.provider && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                    <span className="text-gray-900 dark:text-gray-100">{plan.provider}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Employee Contribution:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatCurrency(plan.employeeContribution)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Employer Contribution:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatCurrency(plan.employerContribution)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Waiting Period:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {plan.waitingPeriodDays} days
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plan._count.employeeBenefits} enrolled
                  </span>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    plan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
              Add Benefit Plan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  >
                    <option value="HEALTH_INSURANCE">Health Insurance</option>
                    <option value="LIFE_INSURANCE">Life Insurance</option>
                    <option value="DENTAL">Dental</option>
                    <option value="VISION">Vision</option>
                    <option value="RETIREMENT">Retirement</option>
                    <option value="PENSION">Pension</option>
                    <option value="HSA">HSA</option>
                    <option value="FSA">FSA</option>
                    <option value="TRANSPORTATION">Transportation</option>
                    <option value="WELLNESS">Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee Contribution
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.employeeContribution}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeContribution: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employer Contribution
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.employerContribution}
                    onChange={(e) =>
                      setFormData({ ...formData, employerContribution: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Waiting Period (days)
                  </label>
                  <input
                    type="number"
                    value={formData.waitingPeriodDays}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingPeriodDays: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.dependentsCoverage}
                    onChange={(e) =>
                      setFormData({ ...formData, dependentsCoverage: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Dependents Coverage
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
