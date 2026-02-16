'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import { ArrowLeft, Edit, Copy, CheckCircle, Printer } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface CoshhDetail {
  id: string;
  reference: string;
  chemicalName: string;
  casNumber: string;
  activity: string;
  location: string;
  department: string;
  personsExposed: string;
  exposureRoutes: string[];
  quantity: string;
  frequency: string;
  duration: string;
  inherentSeverity: number;
  inherentLikelihood: number;
  inherentRiskScore: number;
  inherentRiskLevel: string;
  controls: string[];
  controlDetails: string;
  ppeRequired: string[];
  emergencyProcedures: string;
  residualSeverity: number;
  residualLikelihood: number;
  residualRiskScore: number;
  residualRiskLevel: string;
  reviewDate: string;
  assessorName: string;
  approverName: string;
  status: string;
  createdAt: string;
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'VERY_HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function CoshhDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [coshh, setCoshh] = useState<CoshhDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/coshh/${id}`);
        setCoshh(res.data.data);
      } catch (e: any) {
        setError(e.response?.status === 404 ? 'COSHH assessment not found.' : 'Failed to load assessment.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSupersede = async () => {
    try {
      setActionLoading('supersede');
      const res = await api.post(`/coshh/${id}/supersede`);
      const newId = res.data.data?.id;
      if (newId) router.push(`/coshh/${newId}`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to supersede.');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkReviewed = async () => {
    try {
      setActionLoading('review');
      await api.patch(`/coshh/${id}`, { status: 'APPROVED', reviewDate: new Date().toISOString() });
      const res = await api.get(`/coshh/${id}`);
      setCoshh(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to mark as reviewed.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !coshh) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error || 'Assessment not found.'}
          </div>
          <button onClick={() => router.push('/coshh')} className="mt-4 text-sm text-red-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to COSHH
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 print:p-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/coshh')}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors print:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> Back to COSHH Assessments
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">COSHH Assessment</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono">{coshh.reference}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                onClick={() => router.push(`/coshh/new?editId=${id}`)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={handleSupersede}
                disabled={actionLoading === 'supersede'}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                <Copy className="h-4 w-4" /> {actionLoading === 'supersede' ? 'Creating...' : 'Supersede'}
              </button>
              <button
                onClick={handleMarkReviewed}
                disabled={actionLoading === 'review'}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" /> {actionLoading === 'review' ? 'Saving...' : 'Mark Reviewed'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Chemical & Activity</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Chemical</dt><dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{coshh.chemicalName}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">CAS Number</dt><dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">{coshh.casNumber || '-'}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Activity</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.activity}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Location</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.location}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Department</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.department || '-'}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt><dd><span className={`text-xs font-medium px-2 py-1 rounded-full ${coshh.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : coshh.status === 'DRAFT' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>{coshh.status?.replace('_', ' ')}</span></dd></div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Exposure Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Persons Exposed</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.personsExposed}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Quantity</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.quantity || '-'}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Frequency</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.frequency || '-'}</dd></div>
                  <div className="flex justify-between"><dt className="text-sm text-gray-500 dark:text-gray-400">Duration</dt><dd className="text-sm text-gray-900 dark:text-gray-100">{coshh.duration || '-'}</dd></div>
                  <div><dt className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exposure Routes</dt><dd className="flex flex-wrap gap-1">{(coshh.exposureRoutes || []).map((r) => (<span key={r} className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">{r}</span>))}</dd></div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inherent Risk</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{coshh.inherentRiskScore}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${getRiskColor(coshh.inherentRiskLevel)}`}>
                    {coshh.inherentRiskLevel?.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Severity</span><span className="text-gray-900 dark:text-gray-100">{coshh.inherentSeverity}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Likelihood</span><span className="text-gray-900 dark:text-gray-100">{coshh.inherentLikelihood}/5</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Residual Risk</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{coshh.residualRiskScore}</p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${getRiskColor(coshh.residualRiskLevel)}`}>
                    {coshh.residualRiskLevel?.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Severity</span><span className="text-gray-900 dark:text-gray-100">{coshh.residualSeverity}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Likelihood</span><span className="text-gray-900 dark:text-gray-100">{coshh.residualLikelihood}/5</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Controls & PPE</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Control Measures</h4>
                    <div className="space-y-1">
                      {(coshh.controls || []).map((c, i) => (
                        <div key={c} className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">{i + 1}</span>
                          {c}
                        </div>
                      ))}
                    </div>
                    {coshh.controlDetails && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{coshh.controlDetails}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PPE Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {(coshh.ppeRequired || []).map((ppe) => (
                        <span key={ppe} className="text-xs px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded">{ppe}</span>
                      ))}
                    </div>
                    {coshh.emergencyProcedures && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Procedures</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{coshh.emergencyProcedures}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sign-off & Review</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500 dark:text-gray-400">Assessor</p><p className="font-medium text-gray-900 dark:text-gray-100">{coshh.assessorName || '-'}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400">Approver</p><p className="font-medium text-gray-900 dark:text-gray-100">{coshh.approverName || '-'}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400">Created</p><p className="font-medium text-gray-900 dark:text-gray-100">{coshh.createdAt ? new Date(coshh.createdAt).toLocaleDateString() : '-'}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400">Review Date</p><p className={`font-medium ${coshh.reviewDate && new Date(coshh.reviewDate) < new Date() ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>{coshh.reviewDate ? new Date(coshh.reviewDate).toLocaleDateString() : '-'}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
