'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, Search, Users, Building2, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phone?: string;
  jobTitle: string;
  employmentType: string;
  employmentStatus: string;
  hireDate: string;
  department?: { name: string };
  manager?: { firstName: string; lastName: string };
  _count?: { subordinates: number };
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  PROBATION: 'bg-blue-100 text-blue-700',
  NOTICE_PERIOD: 'bg-orange-100 text-orange-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  TERMINATED: 'bg-gray-100 text-gray-700',
};

const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-emerald-100 text-emerald-700',
  PART_TIME: 'bg-blue-100 text-blue-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  INTERN: 'bg-pink-100 text-pink-700',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [searchTerm, statusFilter, departmentFilter]);

  async function loadEmployees() {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (departmentFilter) params.append('department', departmentFilter);

      const res = await api.get(`/employees?${params.toString()}`);
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 mt-1">Manage your workforce</p>
          </div>
          <Link href="/employees/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="PROBATION">Probation</option>
                <option value="TERMINATED">Terminated</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {employees.filter(e => e.employmentStatus === 'ACTIVE').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">On Leave</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {employees.filter(e => e.employmentStatus === 'ON_LEAVE').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Probation</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {employees.filter(e => e.employmentStatus === 'PROBATION').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <Link key={employee.id} href={`/employees/${employee.id}`}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-emerald-700">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-500">{employee.employeeNumber}</p>
                          </div>
                        </div>
                        <Badge className={statusColors[employee.employmentStatus] || 'bg-gray-100'}>
                          {employee.employmentStatus}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900">{employee.jobTitle}</p>
                        {employee.department && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="h-4 w-4" />
                            {employee.department.name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {employee.workEmail}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <Badge className={typeColors[employee.employmentType] || 'bg-gray-100'}>
                          {employee.employmentType.replace('_', ' ')}
                        </Badge>
                        {employee._count && employee._count.subordinates > 0 && (
                          <span className="text-xs text-gray-500">
                            {employee._count.subordinates} direct reports
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No employees found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
