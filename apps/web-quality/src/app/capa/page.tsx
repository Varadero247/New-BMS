'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, Target, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface CAPA {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  capaType: string;
  severity: string;
  currentPhase: string;
  status: string;
  targetClosureDate?: string;
  effectivenessVerified: boolean;
  _count?: {
    teamMembers: number;
    containmentActions: number;
    rootCauses: number;
    correctiveActions: number;
    effectivenessChecks: number;
  };
}

const phaseColors: Record<string, string> = {
  D1_TEAM: 'bg-blue-100 text-blue-700',
  D2_PROBLEM: 'bg-purple-100 text-purple-700',
  D3_CONTAINMENT: 'bg-yellow-100 text-yellow-700',
  D4_ROOT_CAUSE: 'bg-orange-100 text-orange-700',
  D5_CORRECTIVE_ACTION: 'bg-pink-100 text-pink-700',
  D6_IMPLEMENTATION: 'bg-indigo-100 text-indigo-700',
  D7_PREVENTION: 'bg-cyan-100 text-cyan-700',
  D8_CLOSURE: 'bg-green-100 text-green-700',
};

const phaseLabels: Record<string, string> = {
  D1_TEAM: 'D1: Team',
  D2_PROBLEM: 'D2: Problem',
  D3_CONTAINMENT: 'D3: Contain',
  D4_ROOT_CAUSE: 'D4: Root Cause',
  D5_CORRECTIVE_ACTION: 'D5: Corrective',
  D6_IMPLEMENTATION: 'D6: Implement',
  D7_PREVENTION: 'D7: Prevent',
  D8_CLOSURE: 'D8: Close',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PENDING_VERIFICATION: 'bg-purple-100 text-purple-700',
  VERIFIED: 'bg-cyan-100 text-cyan-700',
  CLOSED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const severityColors: Record<string, string> = {
  MINOR: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  MAJOR: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function CAPAPage() {
  const [capas, setCAPAs] = useState<CAPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadCAPAs();
  }, [phaseFilter, statusFilter]);

  async function loadCAPAs() {
    try {
      const params = new URLSearchParams();
      if (phaseFilter) params.append('currentPhase', phaseFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/capas?${params.toString()}`);
      setCAPAs(res.data.data || []);
    } catch (error) {
      console.error('Failed to load CAPAs:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: capas.length,
    open: capas.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
    pendingVerification: capas.filter(c => c.status === 'PENDING_VERIFICATION').length,
    closed: capas.filter(c => c.status === 'CLOSED').length,
    critical: capas.filter(c => c.severity === 'CRITICAL').length,
    overdue: capas.filter(c => {
      if (!c.targetClosureDate) return false;
      return new Date(c.targetClosureDate) < new Date() && c.status !== 'CLOSED';
    }).length,
  };

  // Phase progress calculation
  const phases = ['D1_TEAM', 'D2_PROBLEM', 'D3_CONTAINMENT', 'D4_ROOT_CAUSE', 'D5_CORRECTIVE_ACTION', 'D6_IMPLEMENTATION', 'D7_PREVENTION', 'D8_CLOSURE'];
  const phaseCounts = phases.map(phase => capas.filter(c => c.currentPhase === phase && c.status !== 'CLOSED').length);

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
            <h1 className="text-3xl font-bold text-gray-900">CAPA / 8D Problem Solving</h1>
            <p className="text-gray-500 mt-1">Corrective and Preventive Actions with 8D methodology</p>
          </div>
          <Link href="/capa/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New CAPA
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open</p>
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
                  <p className="text-sm text-gray-500">Verification</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.pendingVerification}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Closed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 8D Phase Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8D Phase Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {phases.map((phase, index) => (
                <div key={phase} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${phaseColors[phase]} font-bold`}>
                      {phaseCounts[index]}
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{phase.split('_')[0]}</p>
                  </div>
                  {index < phases.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Phases</option>
                {phases.map(phase => (
                  <option key={phase} value={phase}>{phaseLabels[phase]}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* CAPAs List */}
        <Card>
          <CardHeader>
            <CardTitle>CAPAs</CardTitle>
          </CardHeader>
          <CardContent>
            {capas.length > 0 ? (
              <div className="space-y-4">
                {capas.map((capa) => (
                  <Link key={capa.id} href={`/capa/${capa.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{capa.title}</span>
                          <Badge className={phaseColors[capa.currentPhase] || 'bg-gray-100'}>
                            {phaseLabels[capa.currentPhase]}
                          </Badge>
                          <Badge className={statusColors[capa.status] || 'bg-gray-100'}>
                            {capa.status}
                          </Badge>
                          <Badge className={severityColors[capa.severity] || 'bg-gray-100'}>
                            {capa.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{capa.referenceNumber}</span>
                          <span>•</span>
                          <span>{capa.capaType}</span>
                          {capa._count && (
                            <>
                              <span>•</span>
                              <span>{capa._count.teamMembers} team</span>
                              <span>•</span>
                              <span>{capa._count.rootCauses} causes</span>
                              <span>•</span>
                              <span>{capa._count.correctiveActions} actions</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {capa.targetClosureDate && (
                          <span className={new Date(capa.targetClosureDate) < new Date() && capa.status !== 'CLOSED' ? 'text-red-500 font-medium' : ''}>
                            Due: {new Date(capa.targetClosureDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No CAPAs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
