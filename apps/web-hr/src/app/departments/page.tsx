'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-500 mt-1">Organizational structure</p>
          </div>
          <Link href="/departments/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Departments</p>
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
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {departments.filter(d => d.isActive).length}
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
                  <p className="text-sm text-gray-500">Total Employees</p>
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
                            <p className="text-sm text-gray-500">{dept.code}</p>
                          </div>
                        </div>
                        <Badge className={dept.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {dept.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{dept.description}</p>
                      )}

                      {dept.parent && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <ChevronRight className="h-4 w-4" />
                          Parent: {dept.parent.name}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          {dept._count?.employees || 0} employees
                        </div>
                        <div className="text-gray-500">
                          {dept._count?.positions || 0} positions
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No departments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
