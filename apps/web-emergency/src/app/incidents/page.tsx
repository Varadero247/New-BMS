'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import {
  AlertTriangle,
  Flame,
  Search,
  Plus,
  Clock,
  CheckCircle,
  ChevronRight,
  Siren,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  premisesId: string;
  premisesName: string;
  declaredAt: string;
  closedAt: string | null;
  commanderName: string;
  description: string;
  createdAt: string;
}

const INCIDENT_TYPES = [
  'FIRE',
  'FLOOD',
  'GAS_LEAK',
  'CHEMICAL_SPILL',
  'STRUCTURAL_FAILURE',
  'POWER_OUTAGE',
  'BOMB_THREAT',
  'MEDICAL_EMERGENCY',
  'CIVIL_UNREST',
  'CYBER_ATTACK',
  'PANDEMIC',
  'OTHER',
] as const;

const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUS_FILTERS = ['ALL', 'ACTIVE', 'CONTROLLED', 'CLOSED', 'STANDBY'] as const;

const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const TYPE_ICONS: Record<string, string> = {
  FIRE: '🔥',
  FLOOD: '🌊',
  GAS_LEAK: '💨',
  CHEMICAL_SPILL: '⚗️',
  STRUCTURAL_FAILURE: '🏗️',
  POWER_OUTAGE: '⚡',
  BOMB_THREAT: '💣',
  MEDICAL_EMERGENCY: '🏥',
  CIVIL_UNREST: '⚠️',
  CYBER_ATTACK: '💻',
  PANDEMIC: '🦠',
  OTHER: '⚠️',
};

function elapsed(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const r = await api.get('/incidents', { params });
      setIncidents(r.data.data || []);
    } catch (e: unknown) {
      setError('Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const controlledIncidents = incidents.filter((i) => i.status === 'CONTROLLED');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Incident Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Emergency incident declaration and management
              </p>
            </div>
            <Link href="/incidents/declare">
              <Button
                className="flex items-center gap-2 text-white font-bold shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <Siren className="h-5 w-5" />
                Declare Emergency
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Active Incidents Panel */}
          {activeIncidents.length > 0 && (
            <div
              className="mb-6 rounded-xl border-2 overflow-hidden"
              style={{ borderColor: '#F04B5A' }}
            >
              <div
                className="px-6 py-3 flex items-center gap-3"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <Siren className="h-5 w-5 text-white animate-pulse" />
                <h2 className="text-white font-bold text-lg">
                  {activeIncidents.length} ACTIVE EMERGENCY INCIDENT
                  {activeIncidents.length > 1 ? 'S' : ''}
                </h2>
              </div>
              <div className="p-4 space-y-3" style={{ backgroundColor: '#FEE2E4' }}>
                {activeIncidents.map((inc) => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`}>
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-red-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl">{TYPE_ICONS[inc.type] || '⚠️'}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{inc.title}</p>
                        <p className="text-sm text-gray-600">
                          {inc.premisesName} · {inc.type.replace(/_/g, ' ')} ·{' '}
                          {elapsed(inc.declaredAt)} elapsed
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${SEVERITY_STYLES[inc.severity] || ''}`}
                        >
                          {inc.severity}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Controlled Incidents Panel */}
          {controlledIncidents.length > 0 && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/10 overflow-hidden">
              <div className="px-6 py-3 bg-amber-100 dark:bg-amber-900/30 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-amber-900 dark:text-amber-200">
                  {controlledIncidents.length} Incident{controlledIncidents.length > 1 ? 's' : ''}{' '}
                  Being Controlled
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {controlledIncidents.map((inc) => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`}>
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-amber-200 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-xl">{TYPE_ICONS[inc.type] || '⚠️'}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{inc.title}</p>
                        <p className="text-sm text-gray-500">{inc.premisesName}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{incidents.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#F04B5A' }}>
                  {activeIncidents.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">{controlledIncidents.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Controlled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {incidents.filter((i) => i.status === 'CLOSED').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === f
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                  style={statusFilter === f ? { backgroundColor: '#F04B5A' } : undefined}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Incidents Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : incidents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Declared</TableHead>
                        <TableHead>Commander</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.map((inc) => (
                        <TableRow key={inc.id}>
                          <TableCell className="font-mono text-xs">{inc.referenceNumber}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span>{TYPE_ICONS[inc.type] || '⚠️'}</span>
                              <span className="text-xs">{inc.type.replace(/_/g, ' ')}</span>
                            </span>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {inc.title}
                          </TableCell>
                          <TableCell className="text-sm">{inc.premisesName}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[inc.severity] || ''}`}
                            >
                              {inc.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {inc.status === 'ACTIVE' ? (
                                <Flame className="h-3 w-3 text-red-500" />
                              ) : inc.status === 'CLOSED' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-amber-500" />
                              )}
                              <span className="text-sm">{inc.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(inc.declaredAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">{inc.commanderName || '-'}</TableCell>
                          <TableCell>
                            <Link href={`/incidents/${inc.id}`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                View <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Flame className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No incidents found</p>
                  <Link href="/incidents/declare">
                    <Button className="mt-4 text-white" style={{ backgroundColor: '#F04B5A' }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Declare Emergency
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
