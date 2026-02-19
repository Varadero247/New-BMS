'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
  Textarea,
} from '@ims/ui';
import { Plus, Building2, Users, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  parent?: { id: string; name: string };
  _count?: { employees: number; children: number; positions: number };
}

const initialFormState = {
  code: '',
  name: '',
  description: '',
  headId: '',
  parentId: '',
  budget: '',
  costCenter: '',
  location: '',
  isActive: true,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<
    Array<{ id: string; firstName: string; lastName: string }>
  >([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const res = await api.get('/employees?limit=200');
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
    loadEmployees();
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleCreate() {
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Department code is required');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Department name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        code: formData.code,
        name: formData.name,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.headId) payload.headId = formData.headId;
      if (formData.parentId) payload.parentId = formData.parentId;
      if (formData.budget) payload.budget = parseFloat(formData.budget);
      if (formData.costCenter) payload.costCenter = formData.costCenter;

      await api.post('/departments', payload);
      setCreateModalOpen(false);
      setFormData(initialFormState);
      loadDepartments();
    } catch (error) {
      const msg = (axios.isAxiosError(error) && error.response?.data?.error)?.message;
      if (Array.isArray(msg)) {
        setFormError(msg.map((e: Record<string, any>) => e.message).join(', '));
      } else if (typeof msg === 'string') {
        setFormError(msg);
      } else {
        setFormError('Failed to create department. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalEmployees = departments.reduce((sum, d) => sum + (d._count?.employees || 0), 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Departments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Organizational structure</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Departments</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {departments.filter((d) => d.isActive).length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <Link key={dept.id} href={`/departments/${dept.id}`}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{dept.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{dept.code}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            dept.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                          }
                        >
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {dept.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {dept.description}
                        </p>
                      )}

                      {dept.parent && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <ChevronRight className="h-4 w-4" />
                          Parent: {dept.parent.name}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          {dept._count?.employees || 0} employees
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {dept._count?.positions || 0} positions
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No departments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Department Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Department"
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Department Code *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. HR, ENG, FIN"
                />
              </div>
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Department name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the department"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headId">Department Head</Label>
                <select
                  id="headId"
                  name="headId"
                  value={formData.headId}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select department head</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="parentId">Parent Department</Label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None (Top-level)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="costCenter">Cost Center</Label>
                <Input
                  id="costCenter"
                  name="costCenter"
                  value={formData.costCenter}
                  onChange={handleChange}
                  placeholder="e.g. CC-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Office location"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Department'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
