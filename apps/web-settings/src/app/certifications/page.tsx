'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ReadinessBlocker {
  description: string;
  severity: 'critical' | 'major' | 'minor';
  module: string;
  url: string;
  deduction: number;
}

interface ReadinessScore {
  score: number;
  maxScore: number;
  grade: string;
  blockers: ReadinessBlocker[];
  lastCalculatedAt: string;
}

interface Certificate {
  id: string;
  standard: string;
  scope: string;
  certificationBody: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  lastSurveillanceDate: string | null;
  nextSurveillanceDate: string | null;
  status: string;
  readinessScore?: ReadinessScore;
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  SUSPENDED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  WITHDRAWN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:text-gray-300',
  IN_RENEWAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const gradeColors: Record<string, string> = {
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  F: 'text-red-600',
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  major: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  minor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedBlockers, setExpandedBlockers] = useState<string | null>(null);
  const [form, setForm] = useState({
    standard: '',
    scope: '',
    certificationBody: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    status: 'ACTIVE',
  });

  const fetchCerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/certifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setCerts(json.data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  const handleAdd = async () => {
    if (!form.standard || !form.scope || !form.certificationBody || !form.certificateNumber || !form.issueDate || !form.expiryDate) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setShowAdd(false);
        setForm({ standard: '', scope: '', certificationBody: '', certificateNumber: '', issueDate: '', expiryDate: '', status: 'ACTIVE' });
        fetchCerts();
      }
    } catch {
      // Silently handle
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this certificate?')) return;
    try {
      await fetch(`${API_URL}/api/admin/certifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchCerts();
    } catch {
      // Silently handle
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Certifications</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Certifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage ISO certifications and monitor audit readiness</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Certificate
        </button>
      </div>

      {/* Certificate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certs.map((cert) => {
          const days = daysUntil(cert.expiryDate);
          const isExpiring = days <= 90 && days > 0;
          const isExpired = days <= 0;

          return (
            <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{cert.standard}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cert.certificationBody} -- {cert.certificateNumber}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[cert.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                    {cert.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{cert.scope}</p>

                {/* Expiry countdown */}
                <div className={`mt-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isExpired ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                  isExpiring ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                  {isExpired ? `Expired ${Math.abs(days)} days ago` :
                   `${days} days until expiry (${new Date(cert.expiryDate).toLocaleDateString()})`}
                </div>

                {/* Readiness gauge */}
                {cert.readinessScore && (
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={cert.readinessScore.score >= 80 ? '#10B981' : cert.readinessScore.score >= 60 ? '#F59E0B' : '#DC2626'}
                            strokeWidth="3"
                            strokeDasharray={`${cert.readinessScore.score}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-sm font-bold ${gradeColors[cert.readinessScore.grade] || 'text-gray-600'}`}>
                            {cert.readinessScore.grade}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Readiness: {cert.readinessScore.score}/100
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {cert.readinessScore.blockers.length} blocker{cert.readinessScore.blockers.length !== 1 ? 's' : ''} found
                        </div>
                      </div>
                    </div>

                    {/* Blockers expandable */}
                    {cert.readinessScore.blockers.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedBlockers(expandedBlockers === cert.id ? null : cert.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {expandedBlockers === cert.id ? 'Hide blockers' : 'View blockers'}
                        </button>
                        {expandedBlockers === cert.id && (
                          <div className="mt-2 space-y-2">
                            {cert.readinessScore.blockers.map((b, i) => (
                              <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700 rounded p-2">
                                <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium mt-0.5 shrink-0 ${severityColors[b.severity]}`}>
                                  {b.severity}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-700 dark:text-gray-300">{b.description}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">-{b.deduction} points | {b.module}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Surveillance dates */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Last surveillance:</span><br />
                    {cert.lastSurveillanceDate ? new Date(cert.lastSurveillanceDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Next surveillance:</span><br />
                    {cert.nextSurveillanceDate ? new Date(cert.nextSurveillanceDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="px-3 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {certs.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No certifications yet. Add your first ISO certificate.</p>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Certificate</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard *</label>
                <input
                  value={form.standard}
                  onChange={e => setForm(f => ({ ...f, standard: e.target.value }))}
                  placeholder="e.g. ISO 9001:2015"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope *</label>
                <textarea
                  value={form.scope}
                  onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
                  placeholder="Scope of certification..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification Body *</label>
                  <input
                    value={form.certificationBody}
                    onChange={e => setForm(f => ({ ...f, certificationBody: e.target.value }))}
                    placeholder="e.g. BSI"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate # *</label>
                  <input
                    value={form.certificateNumber}
                    onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))}
                    placeholder="e.g. FS 123456"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="IN_RENEWAL">In Renewal</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!form.standard || !form.scope || !form.certificationBody || !form.certificateNumber || !form.issueDate || !form.expiryDate}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
