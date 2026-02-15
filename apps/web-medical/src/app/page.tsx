'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Pencil, FolderOpen, CheckSquare, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  activeDesignProjects: number;
  openDhfRecords: number;
  pendingVerifications: number;
  riskAssessments: number;
  designControls: any[];
}

const DESIGN_STAGES = [
  'Planning',
  'Input',
  'Output',
  'Review',
  'Verification',
  'Validation',
  'Transfer',
];

export default function MedicalDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const designRes = await api.get('/design-controls').catch(() => ({ data: { data: [] } }));
      const designs = designRes.data.data || [];

      setStats({
        activeDesignProjects: designs.filter((d: any) => d.status === 'ACTIVE' || d.status === 'IN_PROGRESS').length,
        openDhfRecords: designs.length,
        pendingVerifications: designs.filter((d: any) => d.currentStage === 'Verification').length,
        riskAssessments: designs.filter((d: any) => d.currentStage === 'Review' || d.currentStage === 'Validation').length,
        designControls: designs,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        activeDesignProjects: 0,
        openDhfRecords: 0,
        pendingVerifications: 0,
        riskAssessments: 0,
        designControls: [],
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

  // Calculate stage pipeline counts
  const stageCounts = DESIGN_STAGES.map(stage => ({
    stage,
    count: stats?.designControls.filter((d: any) => d.currentStage === stage).length || 0,
  }));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Medical Device Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 13485 Medical Device Quality Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Design Projects</p>
                  <p className="text-2xl font-bold">{stats?.activeDesignProjects || 0}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Pencil className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Design control projects in progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open DHF Records</p>
                  <p className="text-2xl font-bold">{stats?.openDhfRecords || 0}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <FolderOpen className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Design history file records
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Verifications</p>
                  <p className="text-2xl font-bold text-amber-600">{stats?.pendingVerifications || 0}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <CheckSquare className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Awaiting verification review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk Assessments</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.riskAssessments || 0}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Risk reviews pending
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Design Stage Pipeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-teal-500" />
              Design Control Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {stageCounts.map((item, index) => (
                <div key={item.stage} className="flex items-center flex-1">
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-4 text-center transition-colors ${
                        item.count > 0
                          ? 'bg-teal-100 border-2 border-teal-300'
                          : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200'
                      }`}
                    >
                      <p className={`text-2xl font-bold ${item.count > 0 ? 'text-teal-700' : 'text-gray-400'}`}>
                        {item.count}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${item.count > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
                        {item.stage}
                      </p>
                    </div>
                  </div>
                  {index < stageCounts.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              ISO 13485 Design Control Stages: Planning &rarr; Input &rarr; Output &rarr; Review &rarr; Verification &rarr; Validation &rarr; Transfer to Production
            </p>
          </CardContent>
        </Card>

        {/* Recent Design Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-teal-500" />
                Recent Design Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.designControls && stats.designControls.length > 0 ? (
                <div className="space-y-3">
                  {stats.designControls.slice(0, 5).map((dc: any) => (
                    <div key={dc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{dc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{dc.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            dc.currentStage === 'Verification' || dc.currentStage === 'Validation'
                              ? 'bg-amber-100 text-amber-700'
                              : dc.currentStage === 'Transfer'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}>
                            {dc.currentStage}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            dc.deviceClass === 'III' ? 'bg-red-100 text-red-700' :
                            dc.deviceClass === 'II' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            Class {dc.deviceClass}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(dc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No design projects recorded yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-cyan-500" />
                ISO 13485 Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="font-medium text-sm text-teal-900">Clause 7.3 - Design and Development</p>
                  <p className="text-xs text-teal-600 mt-1">
                    Planning, inputs, outputs, review, verification, validation, transfer, changes, and DHF
                  </p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="font-medium text-sm text-cyan-900">Clause 7.4 - Purchasing</p>
                  <p className="text-xs text-cyan-600 mt-1">
                    Supplier evaluation, verification of purchased product, traceability
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-sm text-amber-900">Clause 8.2.2 - Complaint Handling</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Customer feedback, complaint investigation, regulatory reporting
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-medium text-sm text-red-900">ISO 14971 - Risk Management</p>
                  <p className="text-xs text-red-600 mt-1">
                    Hazard identification, risk analysis, risk evaluation, risk control measures
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-medium text-sm text-purple-900">Clause 8.5 - CAPA</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Corrective and preventive action, root cause analysis, effectiveness verification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
