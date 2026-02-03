'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, AlertOctagon, FileSpreadsheet, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface FMEA {
  id: string;
  fmeaNumber: string;
  title: string;
  description?: string;
  fmeaType: string;
  product?: string;
  process?: string;
  status: string;
  totalFailureModes: number;
  highRPNCount: number;
  actionsPending: number;
  revision: number;
  _count?: { actions: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  IMPLEMENTED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-gray-100 text-gray-500',
};

const typeColors: Record<string, string> = {
  DFMEA: 'bg-blue-100 text-blue-700',
  PFMEA: 'bg-green-100 text-green-700',
  SFMEA: 'bg-purple-100 text-purple-700',
  MFMEA: 'bg-orange-100 text-orange-700',
};

const typeLabels: Record<string, string> = {
  DFMEA: 'Design FMEA',
  PFMEA: 'Process FMEA',
  SFMEA: 'System FMEA',
  MFMEA: 'Machinery FMEA',
};

export default function FMEAPage() {
  const [fmeas, setFMEAs] = useState<FMEA[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadFMEAs();
  }, [typeFilter, statusFilter]);

  async function loadFMEAs() {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('fmeaType', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/fmea?${params.toString()}`);
      setFMEAs(res.data.data || []);
    } catch (error) {
      console.error('Failed to load FMEAs:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: fmeas.length,
    inProgress: fmeas.filter(f => f.status === 'IN_PROGRESS').length,
    highRPN: fmeas.reduce((sum, f) => sum + f.highRPNCount, 0),
    actionsPending: fmeas.reduce((sum, f) => sum + f.actionsPending, 0),
    failureModes: fmeas.reduce((sum, f) => sum + f.totalFailureModes, 0),
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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
            <h1 className="text-3xl font-bold text-gray-900">FMEA Management</h1>
            <p className="text-gray-500 mt-1">Failure Mode and Effects Analysis</p>
          </div>
          <Link href="/fmea/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New FMEA
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total FMEAs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Failure Modes</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.failureModes}</p>
                </div>
                <AlertOctagon className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">High RPN</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highRPN}</p>
                </div>
                <AlertOctagon className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Actions Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.actionsPending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="DFMEA">Design FMEA</option>
                <option value="PFMEA">Process FMEA</option>
                <option value="SFMEA">System FMEA</option>
                <option value="MFMEA">Machinery FMEA</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="IMPLEMENTED">Implemented</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* FMEAs List */}
        <Card>
          <CardHeader>
            <CardTitle>FMEA Records</CardTitle>
          </CardHeader>
          <CardContent>
            {fmeas.length > 0 ? (
              <div className="space-y-4">
                {fmeas.map((fmea) => (
                  <Link key={fmea.id} href={`/fmea/${fmea.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{fmea.title}</span>
                          <Badge className={typeColors[fmea.fmeaType] || 'bg-gray-100'}>
                            {typeLabels[fmea.fmeaType] || fmea.fmeaType}
                          </Badge>
                          <Badge className={statusColors[fmea.status] || 'bg-gray-100'}>
                            {fmea.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{fmea.fmeaNumber}</span>
                          <span>•</span>
                          <span>Rev. {fmea.revision}</span>
                          {fmea.product && (
                            <>
                              <span>•</span>
                              <span>Product: {fmea.product}</span>
                            </>
                          )}
                          {fmea.process && (
                            <>
                              <span>•</span>
                              <span>Process: {fmea.process}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Failure Modes</p>
                          <p className="font-bold">{fmea.totalFailureModes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">High RPN</p>
                          <p className={`font-bold ${fmea.highRPNCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fmea.highRPNCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Actions</p>
                          <p className={`font-bold ${fmea.actionsPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {fmea.actionsPending} pending
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No FMEAs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
