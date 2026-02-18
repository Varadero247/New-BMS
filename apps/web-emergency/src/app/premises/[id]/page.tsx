'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, Button, Badge } from '@ims/ui';
import {
  Building2,
  ArrowLeft,
  FileSearch,
  Users,
  Wrench,
  CalendarCheck,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

interface PremisesDetail {
  id: string;
  referenceNumber: string;
  name: string;
  type: string;
  address: string;
  city: string;
  postcode: string;
  rpName: string;
  rpEmail: string;
  rpPhone: string;
  occupants: number;
  fraStatus: string;
  fraLastDate: string | null;
  fraNextDue: string | null;
  lastDrillDate: string | null;
  description: string;
  activeIncidents: number;
  fra: any[];
  wardens: any[];
  equipment: any[];
  peeps: any[];
  drills: any[];
  emergencyContacts: any[];
  evacuationPlan: any;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'fra', label: 'Fire Risk Assessment', icon: FileSearch },
  { id: 'evacuation', label: 'Evacuation', icon: AlertTriangle },
  { id: 'wardens', label: 'Wardens', icon: Users },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'peeps', label: 'PEEPs', icon: Users },
  { id: 'drills', label: 'Drills', icon: CalendarCheck },
  { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
] as const;

type TabId = (typeof TABS)[number]['id'];

function FraStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CURRENT: 'bg-green-100 text-green-800',
    ACTION_REQUIRED: 'bg-amber-100 text-amber-800',
    OVERDUE: 'bg-red-100 text-red-800',
    NOT_COMPLETED: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.NOT_COMPLETED}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function PremisesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [premises, setPremises] = useState<PremisesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/premises/${id}`);
        setPremises(r.data.data);
      } catch (e: any) {
        setError(
          e.response?.status === 404 ? 'Premises not found.' : 'Failed to load premises details.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !premises) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{error || 'Premises not found.'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/premises')}>
              Back to Premises
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
            <Link href="/premises" className="hover:underline" style={{ color: '#F04B5A' }}>
              Premises
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">{premises.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/premises')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {premises.name}
                  </h1>
                  <FraStatusBadge status={premises.fraStatus} />
                </div>
                <p className="text-gray-500 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {premises.address}, {premises.city}, {premises.postcode}
                </p>
                <p className="text-xs font-mono text-gray-400 mt-1">{premises.referenceNumber}</p>
              </div>
            </div>
            {premises.activeIncidents > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <AlertTriangle className="h-5 w-5" />
                {premises.activeIncidents} Active Incident{premises.activeIncidents > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-current text-current'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    style={
                      activeTab === tab.id
                        ? { color: '#F04B5A', borderColor: '#F04B5A' }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Premises Information
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">Type</dt>
                        <dd className="mt-1 font-medium">{premises.type.replace(/_/g, ' ')}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">Occupants</dt>
                        <dd className="mt-1 font-medium">{premises.occupants}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          FRA Status
                        </dt>
                        <dd className="mt-1">
                          <FraStatusBadge status={premises.fraStatus} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          FRA Next Due
                        </dt>
                        <dd className="mt-1 font-medium">
                          {premises.fraNextDue
                            ? new Date(premises.fraNextDue).toLocaleDateString()
                            : 'Not scheduled'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Last Drill
                        </dt>
                        <dd className="mt-1 font-medium">
                          {premises.lastDrillDate
                            ? new Date(premises.lastDrillDate).toLocaleDateString()
                            : 'Never'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Active Incidents
                        </dt>
                        <dd className="mt-1 font-medium">{premises.activeIncidents}</dd>
                      </div>
                    </dl>
                    {premises.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Description
                        </dt>
                        <dd className="text-sm text-gray-700 dark:text-gray-300">
                          {premises.description}
                        </dd>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" style={{ color: '#F04B5A' }} />
                      Responsible Person
                    </h3>
                    <div className="space-y-2">
                      <p className="font-medium">{premises.rpName}</p>
                      <p className="text-sm text-gray-500">{premises.rpEmail}</p>
                      <p className="text-sm text-gray-500">{premises.rpPhone}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Link href={`/fra/new?premisesId=${premises.id}`}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <FileSearch className="h-4 w-4" />
                          New FRA
                        </Button>
                      </Link>
                      <Link href={`/incidents/declare?premisesId=${premises.id}`}>
                        <Button
                          className="w-full justify-start gap-2 text-white"
                          style={{ backgroundColor: '#F04B5A' }}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Declare Emergency
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'fra' && (
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Fire Risk Assessments</h3>
                <Link href={`/fra/new?premisesId=${premises.id}`}>
                  <Button className="text-white" style={{ backgroundColor: '#F04B5A' }}>
                    New FRA
                  </Button>
                </Link>
              </div>
              {premises.fra && premises.fra.length > 0 ? (
                <div className="space-y-3">
                  {premises.fra.map((fra: any) => (
                    <Card key={fra.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{fra.referenceNumber}</p>
                          <p className="text-sm text-gray-500">
                            Assessed:{' '}
                            {fra.assessmentDate
                              ? new Date(fra.assessmentDate).toLocaleDateString()
                              : 'N/A'}{' '}
                            · Next review:{' '}
                            {fra.reviewDate ? new Date(fra.reviewDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={fra.status === 'CURRENT' ? 'default' : 'destructive'}>
                            {fra.status?.replace(/_/g, ' ')}
                          </Badge>
                          <Link href={`/fra?id=${fra.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileSearch className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No Fire Risk Assessments for this premises.</p>
                  <Link href={`/fra/new?premisesId=${premises.id}`}>
                    <Button variant="outline" className="mt-3">
                      Create FRA
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evacuation' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Evacuation Plan</h3>
                  {premises.evacuationPlan ? (
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Assembly Points</dt>
                        <dd className="mt-1">
                          {premises.evacuationPlan.assemblyPoints?.join(', ') || 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 uppercase">Target Evacuation Time</dt>
                        <dd className="mt-1">
                          {premises.evacuationPlan.targetEvacuationTime || 'Not set'}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-gray-500 uppercase">Evacuation Procedure</dt>
                        <dd className="mt-1 text-sm">
                          {premises.evacuationPlan.procedure || 'Not documented'}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No evacuation plan documented for this premises.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'wardens' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Fire Wardens</h3>
              {premises.wardens && premises.wardens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {premises.wardens.map((w: any) => (
                    <Card key={w.id}>
                      <CardContent className="p-4">
                        <p className="font-medium">{w.name}</p>
                        <p className="text-sm text-gray-500">
                          {w.role} · {w.floor || 'All floors'}
                        </p>
                        <p className="text-sm text-gray-500">{w.phone}</p>
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              w.trainingCurrent
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {w.trainingCurrent ? 'Training Current' : 'Training Expired'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No wardens assigned to this premises.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Fire Safety Equipment</h3>
              {premises.equipment && premises.equipment.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-4">Equipment</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-left py-2 px-4">Location</th>
                        <th className="text-left py-2 px-4">Last Service</th>
                        <th className="text-left py-2 px-4">Next Service</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {premises.equipment.map((eq: any) => (
                        <tr key={eq.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-4 font-medium">{eq.name}</td>
                          <td className="py-2 px-4">{eq.type?.replace(/_/g, ' ')}</td>
                          <td className="py-2 px-4">{eq.location}</td>
                          <td className="py-2 px-4">
                            {eq.lastServiceDate
                              ? new Date(eq.lastServiceDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-2 px-4">
                            {eq.nextServiceDate
                              ? new Date(eq.nextServiceDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                eq.status === 'SERVICEABLE'
                                  ? 'bg-green-100 text-green-800'
                                  : eq.status === 'DUE_SERVICE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {eq.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Wrench className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No equipment recorded for this premises.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'peeps' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Personal Emergency Evacuation Plans (PEEPs)
              </h3>
              {premises.peeps && premises.peeps.length > 0 ? (
                <div className="space-y-3">
                  {premises.peeps.map((peep: any) => (
                    <Card key={peep.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{peep.personName}</p>
                          <p className="text-sm text-gray-500">
                            {peep.disabilityType?.replace(/_/g, ' ')} · {peep.floor || 'All areas'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              peep.reviewStatus === 'CURRENT'
                                ? 'bg-green-100 text-green-800'
                                : peep.reviewStatus === 'DUE_REVIEW'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {peep.reviewStatus?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No PEEPs for this premises.</p>
                  <Link href="/peep">
                    <Button variant="outline" className="mt-3">
                      View PEEP Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'drills' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Evacuation Drills</h3>
              {premises.drills && premises.drills.length > 0 ? (
                <div className="space-y-3">
                  {premises.drills.map((drill: any) => (
                    <Card key={drill.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(drill.drillDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {drill.drillType?.replace(/_/g, ' ')} · Evacuation time:{' '}
                              {drill.evacuationTime || 'N/A'} mins
                            </p>
                            <p className="text-sm text-gray-500">
                              Participants: {drill.participantCount || 0}
                            </p>
                          </div>
                          <Badge variant={drill.outcome === 'PASS' ? 'default' : 'destructive'}>
                            {drill.outcome}
                          </Badge>
                        </div>
                        {drill.findings && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                            {drill.findings}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No drills recorded for this premises.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
              {premises.emergencyContacts && premises.emergencyContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {premises.emergencyContacts.map((contact: any) => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.role}</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Tel:</span> {contact.phone}
                        </p>
                        {contact.email && (
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {contact.email}
                          </p>
                        )}
                        {contact.isPrimary && (
                          <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primary Contact
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No emergency contacts for this premises.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
