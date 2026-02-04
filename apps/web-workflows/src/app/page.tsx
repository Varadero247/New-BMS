'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitBranch,
  Play,
  CheckSquare,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  instances: {
    byStatus: Array<{ status: string; _count: number }>;
    recentActive: any[];
  };
  tasks: {
    byStatus: Array<{ status: string; _count: number }>;
    overdueCount: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [instancesRes, tasksRes] = await Promise.all([
        api.get('/instances/stats/summary'),
        api.get('/tasks/stats/summary'),
      ]);

      setStats({
        instances: instancesRes.data.data,
        tasks: tasksRes.data.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (items: Array<{ status: string; _count: number }>, status: string) => {
    return items?.find((i) => i.status === status)?._count || 0;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
        <Link
          href="/instances/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Start Workflow
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Workflows</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {getStatusCount(stats?.instances.byStatus || [], 'ACTIVE')}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3">
              <Play className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {getStatusCount(stats?.tasks.byStatus || [], 'PENDING')}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <CheckSquare className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.tasks.overdueCount || 0}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {getStatusCount(stats?.instances.byStatus || [], 'COMPLETED')}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/templates"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
            >
              <GitBranch className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900">Browse Templates</p>
                <p className="text-sm text-gray-500">Industry templates</p>
              </div>
            </Link>
            <Link
              href="/definitions/new"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
            >
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900">Create Workflow</p>
                <p className="text-sm text-gray-500">Build from scratch</p>
              </div>
            </Link>
            <Link
              href="/tasks"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
            >
              <CheckSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">My Tasks</p>
                <p className="text-sm text-gray-500">View assignments</p>
              </div>
            </Link>
            <Link
              href="/approvals"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
            >
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium text-gray-900">Pending Approvals</p>
                <p className="text-sm text-gray-500">Review requests</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Active Workflows */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Active Workflows</h2>
          {!stats?.instances.recentActive?.length ? (
            <p className="text-gray-500">No active workflows</p>
          ) : (
            <div className="space-y-3">
              {stats.instances.recentActive.map((instance: any) => (
                <Link
                  key={instance.id}
                  href={`/instances/${instance.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${
                      instance.priority === 'URGENT' ? 'bg-red-100' :
                      instance.priority === 'HIGH' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <Play className={`h-4 w-4 ${
                        instance.priority === 'URGENT' ? 'text-red-600' :
                        instance.priority === 'HIGH' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{instance.title}</p>
                      <p className="text-sm text-gray-500">{instance.instanceNumber}</p>
                    </div>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    instance.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    instance.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {instance.priority}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Status Summary */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Workflow Status Summary</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { status: 'ACTIVE', label: 'Active', color: 'blue', icon: Play },
            { status: 'COMPLETED', label: 'Completed', color: 'green', icon: CheckCircle },
            { status: 'CANCELLED', label: 'Cancelled', color: 'gray', icon: XCircle },
            { status: 'SUSPENDED', label: 'Suspended', color: 'yellow', icon: Clock },
            { status: 'FAILED', label: 'Failed', color: 'red', icon: AlertTriangle },
          ].map(({ status, label, color, icon: Icon }) => (
            <div key={status} className="rounded-lg border p-4 text-center">
              <div className={`mx-auto mb-2 w-fit rounded-full bg-${color}-100 p-2`}>
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {getStatusCount(stats?.instances.byStatus || [], status)}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
