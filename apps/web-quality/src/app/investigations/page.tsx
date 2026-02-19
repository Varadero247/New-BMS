'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  FileSearch } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Investigation {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  investigationType: string;
  severity: string;
  status: string;
  eventDate: string;
  targetCompletionDate?: string;
  leadInvestigatorId?: string;
  _count?: { causes: number; recommendations: number; teamMembers: number };
}

const statusColors: Record<string, string> = {
  INITIATED: 'bg-blue-100 text-blue-700',
  DATA_COLLECTION: 'bg-purple-100 text-purple-700',
  ANALYSIS_IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  ROOT_CAUSE_IDENTIFIED: 'bg-orange-100 text-orange-700',
  RECOMMENDATIONS_PENDING: 'bg-pink-100 text-pink-700',
  ACTIONS_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  VERIFICATION_IN_PROGRESS: 'bg-cyan-100 text-cyan-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };

const severityColors: Record<string, string> = {
  MINOR: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  MAJOR: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
  CATASTROPHIC: 'bg-red-200 text-red-800' };

const typeLabels: Record<string, string> = {
  INCIDENT: 'Incident',
  NEAR_MISS: 'Near Miss',
  QUALITY_EVENT: 'Quality Event',
  CUSTOMER_COMPLAINT: 'Customer Complaint',
  AUDIT_FINDING: 'Audit Finding',
  REGULATORY_EVENT: 'Regulatory Event',
  PRODUCT_FAILURE: 'Product Failure',
  PROCESS_DEVIATION: 'Process Deviation' };

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadInvestigations();
  }, [statusFilter, typeFilter]);

  async function loadInvestigations() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('investigationType', typeFilter);

      const res = await api.get(`/investigations?${params.toString()}`);
      setInvestigations(res.data.data || []);
    } catch (error) {
      console.error('Failed to load investigations:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: investigations.length,
    open: investigations.filter((i) => !['COMPLETED', 'CLOSED'].includes(i.status)).length,
    inProgress: investigations.filter((i) => i.status === 'ANALYSIS_IN_PROGRESS').length,
    completed: investigations.filter((i) => i.status === 'COMPLETED' || i.status === 'CLOSED')
      .length,
    critical: investigations.filter(
      (i) => i.severity === 'CRITICAL' || i.severity === 'CATASTROPHIC'
    ).length };

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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Investigation Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Root cause analysis and incident investigation
            </p>
          </div>
          <Link href="/investigations/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Investigation
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileSearch className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="INITIATED">Initiated</option>
                <option value="DATA_COLLECTION">Data Collection</option>
                <option value="ANALYSIS_IN_PROGRESS">Analysis In Progress</option>
                <option value="ROOT_CAUSE_IDENTIFIED">Root Cause Identified</option>
                <option value="ACTIONS_ASSIGNED">Actions Assigned</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="INCIDENT">Incident</option>
                <option value="NEAR_MISS">Near Miss</option>
                <option value="QUALITY_EVENT">Quality Event</option>
                <option value="CUSTOMER_COMPLAINT">Customer Complaint</option>
                <option value="AUDIT_FINDING">Audit Finding</option>
                <option value="PRODUCT_FAILURE">Product Failure</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Investigations List */}
        <Card>
          <CardHeader>
            <CardTitle>Investigations</CardTitle>
          </CardHeader>
          <CardContent>
            {investigations.length > 0 ? (
              <div className="space-y-4">
                {investigations.map((inv) => (
                  <Link key={inv.id} href={`/investigations/${inv.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{inv.title}</span>
                          <Badge
                            className={statusColors[inv.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {inv.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge
                            className={
                              severityColors[inv.severity] || 'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {inv.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{inv.referenceNumber}</span>
                          <span>•</span>
                          <span>{typeLabels[inv.investigationType] || inv.investigationType}</span>
                          <span>•</span>
                          <span>Event: {new Date(inv.eventDate).toLocaleDateString()}</span>
                          {inv._count && (
                            <>
                              <span>•</span>
                              <span>{inv._count.causes} causes</span>
                              <span>•</span>
                              <span>{inv._count.recommendations} recommendations</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {inv.targetCompletionDate && (
                          <span>
                            Due: {new Date(inv.targetCompletionDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No investigations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
