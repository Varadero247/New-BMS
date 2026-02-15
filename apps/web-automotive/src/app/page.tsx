'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  FolderKanban,
  FileCheck,
  FileText,
  AlertTriangle,
  LineChart,
  BarChart3,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  apqpProjects: { total: number; active: number };
  ppapSubmissions: { total: number; pending: number };
  open8dReports: number;
  spcAlerts: number;
  recentProjects: any[];
  recentPpap: any[];
}

export default function AutomotiveDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [projectsRes, ppapRes] = await Promise.all([
        api.get('/apqp/projects').catch(() => ({ data: { data: [] } })),
        api.get('/ppap/submissions').catch(() => ({ data: { data: [] } })),
      ]);

      const projects = projectsRes.data.data || [];
      const ppap = ppapRes.data.data || [];

      setStats({
        apqpProjects: {
          total: projects.length,
          active: projects.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE').length,
        },
        ppapSubmissions: {
          total: ppap.length,
          pending: ppap.filter((s: any) => s.status === 'PENDING' || s.status === 'SUBMITTED').length,
        },
        open8dReports: 0,
        spcAlerts: 0,
        recentProjects: projects.slice(0, 5),
        recentPpap: ppap.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        apqpProjects: { total: 0, active: 0 },
        ppapSubmissions: { total: 0, pending: 0 },
        open8dReports: 0,
        spcAlerts: 0,
        recentProjects: [],
        recentPpap: [],
      });
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Automotive Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">IATF 16949 Automotive Quality Management System</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active APQP Projects</p>
                  <p className="text-3xl font-bold text-orange-600">{stats?.apqpProjects.active || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FolderKanban className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats?.apqpProjects.total || 0} total projects
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PPAP Submissions</p>
                  <p className="text-3xl font-bold text-amber-600">{stats?.ppapSubmissions.pending || 0}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <FileCheck className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats?.ppapSubmissions.total || 0} total submissions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open 8D Reports</p>
                  <p className="text-3xl font-bold text-red-600">{stats?.open8dReports || 0}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Corrective actions pending
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SPC Alerts</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.spcAlerts || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Out-of-control processes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">APQP Phase Completion</p>
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Avg across active projects</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">MSA Studies Active</p>
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Gage R&R analyses</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SPC Monitored Processes</p>
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Control charts active</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <LineChart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent APQP Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-orange-500" />
                Recent APQP Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentProjects && stats.recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {project.referenceNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{project.referenceNumber}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.currentPhase === 5 ? 'bg-green-100 text-green-700' :
                            project.currentPhase >= 3 ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            Phase {project.currentPhase || 1}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            project.status === 'IN_PROGRESS' || project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700'
                          }`}>
                            {project.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {project.targetDate && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(project.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No APQP projects yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent PPAP Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-500" />
                Recent PPAP Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentPpap && stats.recentPpap.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPpap.map((submission: any) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{submission.partName || submission.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {submission.referenceNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{submission.referenceNumber}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            submission.level ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                          }`}>
                            Level {submission.level || '-'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            submission.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            submission.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {submission.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {submission.submissionDate && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(submission.submissionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No PPAP submissions yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* IATF 16949 Core Tools Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>IATF 16949 Core Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <a href="/apqp" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                  <FolderKanban className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">APQP</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Advanced Product Quality Planning</p>
                </a>
                <a href="/ppap" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                  <FileCheck className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">PPAP</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Production Part Approval Process</p>
                </a>
                <a href="/fmea" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">FMEA</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failure Mode & Effects Analysis</p>
                </a>
                <a href="/msa" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                  <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">MSA</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Measurement Systems Analysis</p>
                </a>
                <a href="/spc" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
                  <LineChart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">SPC</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Statistical Process Control</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
