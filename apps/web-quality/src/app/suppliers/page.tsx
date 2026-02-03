'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, Truck, Star, AlertCircle, CheckCircle, Clock, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface SupplierQualification {
  id: string;
  supplierId: string;
  qualificationNumber: string;
  qualificationType: string;
  qualificationStatus: string;
  overallScore?: number;
  validFrom?: string;
  validUntil?: string;
}

interface SupplierNCR {
  id: string;
  ncrNumber: string;
  supplierId: string;
  title: string;
  issueType: string;
  severity: string;
  status: string;
  detectedDate: string;
}

interface PPAPSubmission {
  id: string;
  submissionNumber: string;
  supplierId: string;
  partNumber: string;
  partName: string;
  submissionLevel: string;
  status: string;
}

const qualStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  CONDITIONALLY_APPROVED: 'bg-orange-100 text-orange-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const ncrStatusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  AWAITING_RESPONSE: 'bg-yellow-100 text-yellow-700',
  RESPONSE_RECEIVED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  PENDING_VERIFICATION: 'bg-orange-100 text-orange-700',
  CLOSED: 'bg-green-100 text-green-700',
  ESCALATED: 'bg-red-200 text-red-800',
};

const ppapStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  INTERIM_APPROVED: 'bg-orange-100 text-orange-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING_RESUBMIT: 'bg-purple-100 text-purple-700',
};

export default function SupplierQualityPage() {
  const [qualifications, setQualifications] = useState<SupplierQualification[]>([]);
  const [ncrs, setNCRs] = useState<SupplierNCR[]>([]);
  const [ppaps, setPPAPs] = useState<PPAPSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'qualifications' | 'ncrs' | 'ppap'>('qualifications');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [qualRes, ppapRes] = await Promise.all([
        api.get('/suppliers/qualifications'),
        api.get('/suppliers/ppap'),
      ]);

      setQualifications(qualRes.data.data || []);
      setPPAPs(ppapRes.data.data || []);
    } catch (error) {
      console.error('Failed to load supplier quality data:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    totalQualifications: qualifications.length,
    approved: qualifications.filter(q => q.qualificationStatus === 'APPROVED').length,
    pending: qualifications.filter(q => q.qualificationStatus === 'PENDING' || q.qualificationStatus === 'IN_PROGRESS').length,
    expiringSoon: qualifications.filter(q => {
      if (!q.validUntil) return false;
      const expiryDate = new Date(q.validUntil);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && q.qualificationStatus === 'APPROVED';
    }).length,
    openNCRs: ncrs.filter(n => n.status !== 'CLOSED').length,
    pendingPPAP: ppaps.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length,
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
            <h1 className="text-3xl font-bold text-gray-900">Supplier Quality Management</h1>
            <p className="text-gray-500 mt-1">Qualifications, Scorecards, NCRs, and PPAP</p>
          </div>
          <div className="flex gap-2">
            <Link href="/suppliers/qualification/new">
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> New Qualification
              </Button>
            </Link>
            <Link href="/suppliers/ncr/new">
              <Button variant="outline" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> New NCR
              </Button>
            </Link>
            <Link href="/suppliers/ppap/new">
              <Button className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> New PPAP
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Qualifications</p>
                  <p className="text-2xl font-bold">{stats.totalQualifications}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open NCRs</p>
                  <p className="text-2xl font-bold text-red-600">{stats.openNCRs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending PPAP</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.pendingPPAP}</p>
                </div>
                <FileCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'qualifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('qualifications')}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Qualifications ({qualifications.length})
          </Button>
          <Button
            variant={activeTab === 'ncrs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ncrs')}
          >
            <AlertCircle className="h-4 w-4 mr-2" /> NCRs ({ncrs.length})
          </Button>
          <Button
            variant={activeTab === 'ppap' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ppap')}
          >
            <FileCheck className="h-4 w-4 mr-2" /> PPAP ({ppaps.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'qualifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              {qualifications.length > 0 ? (
                <div className="space-y-4">
                  {qualifications.map((qual) => (
                    <Link key={qual.id} href={`/suppliers/qualification/${qual.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{qual.qualificationNumber}</span>
                            <Badge className={qualStatusColors[qual.qualificationStatus] || 'bg-gray-100'}>
                              {qual.qualificationStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>Supplier: {qual.supplierId}</span>
                            <span>•</span>
                            <span>{qual.qualificationType.replace('_', ' ')}</span>
                            {qual.validFrom && qual.validUntil && (
                              <>
                                <span>•</span>
                                <span>
                                  Valid: {new Date(qual.validFrom).toLocaleDateString()} - {new Date(qual.validUntil).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {qual.overallScore !== undefined && (
                          <div className="flex items-center gap-2">
                            <Star className={`h-5 w-5 ${qual.overallScore >= 80 ? 'text-green-500' : qual.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
                            <span className="font-bold">{qual.overallScore.toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No supplier qualifications found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'ncrs' && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier NCRs</CardTitle>
            </CardHeader>
            <CardContent>
              {ncrs.length > 0 ? (
                <div className="space-y-4">
                  {ncrs.map((ncr) => (
                    <Link key={ncr.id} href={`/suppliers/ncr/${ncr.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{ncr.title}</span>
                            <Badge className={ncrStatusColors[ncr.status] || 'bg-gray-100'}>
                              {ncr.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{ncr.ncrNumber}</span>
                            <span>•</span>
                            <span>{ncr.issueType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{ncr.severity}</span>
                            <span>•</span>
                            <span>Detected: {new Date(ncr.detectedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No supplier NCRs found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'ppap' && (
          <Card>
            <CardHeader>
              <CardTitle>PPAP Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {ppaps.length > 0 ? (
                <div className="space-y-4">
                  {ppaps.map((ppap) => (
                    <Link key={ppap.id} href={`/suppliers/ppap/${ppap.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{ppap.partName}</span>
                            <Badge className={ppapStatusColors[ppap.status] || 'bg-gray-100'}>
                              {ppap.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{ppap.submissionNumber}</span>
                            <span>•</span>
                            <span>Part: {ppap.partNumber}</span>
                            <span>•</span>
                            <span>Level: {ppap.submissionLevel.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No PPAP submissions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
