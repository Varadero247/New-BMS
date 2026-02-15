'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, Building2, Clock, CalendarDays, Briefcase, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  employees: {
    total: number;
    active: number;
    onLeave: number;
    newHires: number;
  };
  attendance: {
    presentToday: number;
    lateToday: number;
    absentToday: number;
  };
  leave: {
    pendingRequests: number;
    onLeaveToday: number;
  };
  recruitment: {
    activeJobs: number;
    totalApplicants: number;
    interviewsToday: number;
  };
  training: {
    upcomingSessions: number;
    expiringCertifications: number;
  };
}

export default function HRDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [employeeStats, attendanceStats, trainingStats, recruitmentStats] = await Promise.all([
        api.get('/employees/stats').catch(() => ({ data: { data: {} } })),
        api.get('/attendance/summary').catch(() => ({ data: { data: {} } })),
        api.get('/training/stats').catch(() => ({ data: { data: {} } })),
        api.get('/recruitment/stats').catch(() => ({ data: { data: {} } })),
      ]);

      setStats({
        employees: {
          total: employeeStats.data.data.totalEmployees || 0,
          active: employeeStats.data.data.activeEmployees || 0,
          onLeave: 0,
          newHires: employeeStats.data.data.recentHires || 0,
        },
        attendance: {
          presentToday: attendanceStats.data.data.byStatus?.find((s: any) => s.status === 'PRESENT')?._count || 0,
          lateToday: attendanceStats.data.data.byStatus?.find((s: any) => s.status === 'LATE')?._count || 0,
          absentToday: attendanceStats.data.data.byStatus?.find((s: any) => s.status === 'ABSENT')?._count || 0,
        },
        leave: {
          pendingRequests: 0,
          onLeaveToday: 0,
        },
        recruitment: {
          activeJobs: recruitmentStats.data.data.activeJobs || 0,
          totalApplicants: recruitmentStats.data.data.totalApplicants || 0,
          interviewsToday: 0,
        },
        training: {
          upcomingSessions: trainingStats.data.data.upcomingSessions || 0,
          expiringCertifications: trainingStats.data.data.expiringCertifications || 0,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">HR Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your workforce</p>
        </div>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/employees">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.employees.total || 0}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats?.employees.active || 0} active
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/departments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">New Hires</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.employees.newHires || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/attendance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Present Today</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.attendance.presentToday || 0}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      {stats?.attendance.lateToday || 0} late
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leave">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">On Leave Today</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.leave.onLeaveToday || 0}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {stats?.leave.pendingRequests || 0} pending
                    </p>
                  </div>
                  <CalendarDays className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recruitment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                Recruitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600">Active Job Postings</span>
                  <span className="font-bold text-lg">{stats?.recruitment.activeJobs || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600">Total Applicants</span>
                  <span className="font-bold text-lg">{stats?.recruitment.totalApplicants || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600">Interviews Today</span>
                  <span className="font-bold text-lg">{stats?.recruitment.interviewsToday || 0}</span>
                </div>
                <Link
                  href="/recruitment/jobs"
                  className="block text-center py-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View All Jobs →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Training & Development */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Training & Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600">Upcoming Sessions</span>
                  <span className="font-bold text-lg">{stats?.training.upcomingSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-600">Expiring Certifications</span>
                  </div>
                  <span className="font-bold text-lg text-yellow-600">
                    {stats?.training.expiringCertifications || 0}
                  </span>
                </div>
                <Link
                  href="/training"
                  className="block text-center py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Training Calendar →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/employees/new"
                className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Users className="h-8 w-8 text-emerald-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Employee</span>
              </Link>
              <Link
                href="/recruitment/jobs/new"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Briefcase className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Post Job</span>
              </Link>
              <Link
                href="/leave"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CalendarDays className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Requests</span>
              </Link>
              <Link
                href="/training"
                className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <GraduationCap className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Training</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
