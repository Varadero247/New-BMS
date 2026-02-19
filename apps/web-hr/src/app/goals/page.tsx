'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter } from '@ims/ui';
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Edit } from 'lucide-react';
import { api } from '@/lib/api';

interface PerformanceGoal {
  id: string;
  cycleId: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  measurementCriteria: string;
  targetValue?: string;
  actualValue?: string;
  unit?: string;
  status: string;
  progress: number;
  startDate?: string;
  dueDate: string;
  selfRating?: number;
  managerRating?: number;
  finalRating?: number;
  ratingComments?: string;
  createdAt?: string;
  cycle?: { name: string; year: number };
  employee?: { id: string; firstName: string; lastName: string };
  updates?: Array<{
    id: string;
    progressBefore: number;
    progressAfter: number;
    updateNotes: string;
    createdAt: string;
  }>;
}

interface PerformanceCycle {
  id: string;
  name: string;
  year: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  AT_RISK: 'At Risk',
  COMPLETED: 'Completed',
  EXCEEDED: 'Exceeded',
  CANCELLED: 'Cancelled' };

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  AT_RISK: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  EXCEEDED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };

const categoryLabels: Record<string, string> = {
  PERFORMANCE: 'Performance',
  DEVELOPMENT: 'Development',
  BEHAVIORAL: 'Behavioral',
  STRATEGIC: 'Strategic',
  OPERATIONAL: 'Operational' };

const categoryColors: Record<string, string> = {
  PERFORMANCE: 'bg-blue-100 text-blue-700',
  DEVELOPMENT: 'bg-purple-100 text-purple-700',
  BEHAVIORAL: 'bg-pink-100 text-pink-700',
  STRATEGIC: 'bg-amber-100 text-amber-700',
  OPERATIONAL: 'bg-teal-100 text-teal-700' };

function getProgressColor(progress: number): string {
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-gray-400';
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formCycleId, setFormCycleId] = useState('');
  const [formCategory, setFormCategory] = useState('PERFORMANCE');
  const [formWeight, setFormWeight] = useState(0);
  const [formMeasurementCriteria, setFormMeasurementCriteria] = useState('');
  const [formTargetValue, setFormTargetValue] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editGoal, setEditGoal] = useState<PerformanceGoal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editActualValue, setEditActualValue] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGoals();
  }, [statusFilter, categoryFilter]);

  async function loadInitialData() {
    try {
      const [goalsRes, cyclesRes, employeesRes] = await Promise.all([
        api.get('/performance/goals'),
        api.get('/performance/cycles'),
        api.get('/employees'),
      ]);
      setGoals(goalsRes.data.data || []);
      setCycles(cyclesRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (error) {
      console.error('Error loading goals data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGoals() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      const res = await api.get(`/performance/goals?${params.toString()}`);
      setGoals(res.data.data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }

  function resetCreateForm() {
    setFormTitle('');
    setFormDescription('');
    setFormEmployeeId('');
    setFormCycleId('');
    setFormCategory('PERFORMANCE');
    setFormWeight(0);
    setFormMeasurementCriteria('');
    setFormTargetValue('');
    setFormUnit('');
    setFormStartDate('');
    setFormDueDate('');
  }

  function openEditModal(goal: PerformanceGoal) {
    setEditGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditProgress(goal.progress || 0);
    setEditActualValue(goal.actualValue || '');
    setEditStatus(goal.status);
    setEditModalOpen(true);
  }

  async function handleCreateGoal() {
    if (
      !formTitle ||
      !formEmployeeId ||
      !formCycleId ||
      !formDescription ||
      !formMeasurementCriteria ||
      !formDueDate
    )
      return;
    setCreateSubmitting(true);
    try {
      const payload: Record<string, any> = {
        cycleId: formCycleId,
        employeeId: formEmployeeId,
        title: formTitle,
        description: formDescription,
        category: formCategory,
        weight: formWeight,
        measurementCriteria: formMeasurementCriteria,
        dueDate: formDueDate };
      if (formTargetValue) payload.targetValue = formTargetValue;
      if (formUnit) payload.unit = formUnit;
      if (formStartDate) payload.startDate = formStartDate;

      await api.post('/performance/goals', payload);
      setCreateModalOpen(false);
      resetCreateForm();
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleUpdateGoal() {
    if (!editGoal) return;
    setEditSubmitting(true);
    try {
      await api.put(`/performance/goals/${editGoal.id}`, {
        title: editTitle,
        description: editDescription,
        progress: editProgress,
        actualValue: editActualValue || undefined,
        status: editStatus });
      setEditModalOpen(false);
      setEditGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setEditSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === 'IN_PROGRESS' && g.progress >= 50).length,
    atRisk: goals.filter((g) => g.status === 'AT_RISK').length,
    completed: goals.filter((g) => g.status === 'COMPLETED' || g.status === 'EXCEEDED').length };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Performance Goals
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and manage employee goals and objectives
            </p>
          </div>
          <Button
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              resetCreateForm();
              setCreateModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Goals</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Track</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.onTrack}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="AT_RISK">At Risk</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXCEEDED">Exceeded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="STRATEGIC">Strategic</option>
                <option value="OPERATIONAL">Operational</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Goals List */}
        <Card>
          <CardHeader>
            <CardTitle>Goals ({goals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              categoryColors[goal.category] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {categoryLabels[goal.category] || goal.category}
                          </Badge>
                          <Badge
                            className={
                              statusColors[goal.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {statusLabels[goal.status] || goal.status}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {goal.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => openEditModal(goal)}
                        className="ml-2 p-1 text-gray-400 dark:text-gray-500 hover:text-emerald-600 rounded transition-colors"
                        title="Edit goal"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Employee */}
                    {goal.employee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700">
                            {goal.employee.firstName[0]}
                            {goal.employee.lastName[0]}
                          </span>
                        </div>
                        <span>
                          {goal.employee.firstName} {goal.employee.lastName}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{goal.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${getProgressColor(goal.progress || 0)}`}
                          style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Target Value */}
                    {goal.targetValue && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="text-gray-500 dark:text-gray-400">Target: </span>
                        <span className="font-medium">
                          {goal.actualValue || '0'} / {goal.targetValue}
                          {goal.unit ? ` ${goal.unit}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Weight and Due Date */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t">
                      {goal.weight > 0 && <span>Weight: {goal.weight}%</span>}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Cycle info */}
                    {goal.cycle && (
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {goal.cycle.name} ({goal.cycle.year})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No goals found</p>
                <p className="text-sm mt-1">Create a goal to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Goal Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Performance Goal"
          size="lg"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Increase quarterly sales by 15%"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the goal in detail..."
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee
                </label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Performance Cycle
                </label>
                <select
                  value={formCycleId}
                  onChange={(e) => setFormCycleId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select cycle...</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name} ({cycle.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PERFORMANCE">Performance</option>
                  <option value="DEVELOPMENT">Development</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="STRATEGIC">Strategic</option>
                  <option value="OPERATIONAL">Operational</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  value={formWeight}
                  onChange={(e) => setFormWeight(parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Measurement Criteria
              </label>
              <textarea
                value={formMeasurementCriteria}
                onChange={(e) => setFormMeasurementCriteria(e.target.value)}
                placeholder="How will this goal be measured?"
                rows={2}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Value (optional)
                </label>
                <input
                  type="text"
                  value={formTargetValue}
                  onChange={(e) => setFormTargetValue(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit (optional)
                </label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="e.g., %, units, hours"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date (optional)
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateGoal}
              disabled={
                createSubmitting ||
                !formTitle ||
                !formEmployeeId ||
                !formCycleId ||
                !formDescription ||
                !formMeasurementCriteria ||
                !formDueDate
              }
            >
              {createSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Edit Goal Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditGoal(null);
          }}
          title="Update Goal"
          size="lg"
        >
          {editGoal && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="EXCEEDED">Exceeded</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Progress: {editProgress}%
                  </label>
                  <input
                    type="range"
                    value={editProgress}
                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                {editGoal.targetValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Actual Value (Target: {editGoal.targetValue}
                      {editGoal.unit ? ` ${editGoal.unit}` : ''})
                    </label>
                    <input
                      type="text"
                      value={editActualValue}
                      onChange={(e) => setEditActualValue(e.target.value)}
                      placeholder="Enter actual value..."
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditGoal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleUpdateGoal}
                  disabled={editSubmitting || !editTitle}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
