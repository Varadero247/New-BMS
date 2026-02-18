'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Search, Users, Building2, UserCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  jobTitle?: string;
  position?: string;
  department?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  email?: string;
  status: string;
}

interface Department {
  id: string;
  name: string;
  managerId?: string;
}

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [empRes, deptRes] = await Promise.all([api.get('/employees'), api.get('/departments')]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getName = (e: Employee) =>
    e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || '—';
  const getTitle = (e: Employee) => e.jobTitle || e.position || '—';
  const getDept = (e: Employee) => e.departmentName || e.department || '—';

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE' || e.status === 'active');
  const filtered = activeEmployees.filter((e) => {
    const matchSearch =
      getName(e).toLowerCase().includes(search.toLowerCase()) ||
      getTitle(e).toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || getDept(e).toLowerCase().includes(deptFilter.toLowerCase());
    return matchSearch && matchDept;
  });

  // Group by department for tree view
  const byDept = filtered.reduce((acc: Record<string, Employee[]>, emp) => {
    const dept = getDept(emp);
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  // Find top-level managers (no managerId or managerId not in filtered list)
  const filteredIds = new Set(filtered.map((e) => e.id));
  const topLevel = filtered.filter((e) => !e.managerId || !filteredIds.has(e.managerId));
  const getReports = (managerId: string) => filtered.filter((e) => e.managerId === managerId);

  function EmployeeCard({ emp, depth = 0 }: { emp: Employee; depth?: number }) {
    const reports = getReports(emp.id);
    return (
      <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-900 hover:bg-violet-50 transition-colors mb-2 ${depth === 0 ? 'border-violet-200' : 'border-gray-200 dark:border-gray-700'}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${depth === 0 ? 'bg-violet-100' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <UserCircle
              className={`h-6 w-6 ${depth === 0 ? 'text-violet-600' : 'text-gray-400'}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{getName(emp)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getTitle(emp)}</p>
            {depth === 0 && <p className="text-xs text-violet-600">{getDept(emp)}</p>}
          </div>
          {reports.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {reports.length} report{reports.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {reports.map((r) => (
          <EmployeeCard key={r.id} emp={r} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Org Chart</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Organisational structure and reporting lines
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              onClick={() => setViewMode('tree')}
              className={viewMode === 'tree' ? 'bg-violet-600 hover:bg-violet-700' : ''}
            >
              Tree View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-violet-600 hover:bg-violet-700' : ''}
            >
              List View
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold">{activeEmployees.length}</p>
                </div>
                <Users className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Top-Level</p>
                  <p className="text-2xl font-bold text-violet-600">
                    {activeEmployees.filter((e) => !e.managerId).length}
                  </p>
                </div>
                <UserCircle className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search by name or job title..."
                  placeholder="Search by name or job title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by department"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No employees found</p>
            </CardContent>
          </Card>
        ) : viewMode === 'tree' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-600" />
                Organisation Tree ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topLevel.map((emp) => (
                  <EmployeeCard key={emp.id} emp={emp} depth={0} />
                ))}
                {/* Show employees not in the hierarchy */}
                {filtered
                  .filter((e) => e.managerId && !filteredIds.has(e.managerId))
                  .map((emp) => (
                    <EmployeeCard key={emp.id} emp={emp} depth={0} />
                  ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List view — grouped by department */
          <div className="space-y-4">
            {Object.entries(byDept).map(([dept, emps]) => (
              <Card key={dept}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-violet-600" />
                    {dept}{' '}
                    <Badge variant="outline" className="ml-2">
                      {emps.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {emps.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                            {getName(emp)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {getTitle(emp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
