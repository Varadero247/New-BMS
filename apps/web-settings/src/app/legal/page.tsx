'use client';

import { useState, useEffect, useCallback } from 'react';

interface DpaDocument {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  isActive: boolean;
  accepted: boolean;
}

interface DpaAcceptance {
  id: string;
  dpaVersion: string;
  signerName: string;
  signerTitle: string;
  acceptedAt: string;
}

const API_URL = 'http://localhost:4000';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function LegalPage() {
  const [dpa, setDpa] = useState<DpaDocument | null>(null);
  const [acceptance, setAcceptance] = useState<DpaAcceptance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');

  const fetchDpa = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dpa`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setDpa(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchAcceptance = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dpa/acceptance`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.data.acceptance) {
        setAcceptance(data.data.acceptance);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchDpa(), fetchAcceptance()]).finally(() => setLoading(false));
  }, [fetchDpa, fetchAcceptance]);

  const handleAccept = async () => {
    if (!signerName || !signerTitle) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/dpa/accept`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ signerName, signerTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setAcceptance(data.data);
        setDpa(prev => prev ? { ...prev, accepted: true } : null);
        setShowAcceptForm(false);
      } else {
        setError(data.error?.message || 'Failed to accept DPA');
      }
    } catch {
      setError('Failed to connect to the server');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Legal & DPA</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Data Processing Agreement and legal compliance documents.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Acceptance Status */}
      <div className={`border rounded-xl p-6 ${
        acceptance
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {acceptance ? (
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            )}
            <div>
              <h2 className={`text-lg font-semibold ${
                acceptance
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-yellow-800 dark:text-yellow-300'
              }`}>
                {acceptance ? 'DPA Accepted' : 'DPA Acceptance Required'}
              </h2>
              {acceptance ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Signed by {acceptance.signerName} ({acceptance.signerTitle}) on{' '}
                  {new Date(acceptance.acceptedAt).toLocaleDateString()} - Version {acceptance.dpaVersion}
                </p>
              ) : (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Your organisation has not yet accepted the Data Processing Agreement.
                </p>
              )}
            </div>
          </div>
          {!acceptance && (
            <button
              onClick={() => setShowAcceptForm(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              Accept DPA
            </button>
          )}
        </div>
      </div>

      {/* Accept Form */}
      {showAcceptForm && !acceptance && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Accept Data Processing Agreement</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By accepting, you confirm that you have read, understood, and agree to the terms of the DPA on behalf of your organisation.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Role</label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g., Data Protection Officer"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAcceptForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!signerName || !signerTitle || submitting}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'I Accept the DPA'}
            </button>
          </div>
        </div>
      )}

      {/* DPA Document */}
      {dpa && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{dpa.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Version {dpa.version} | Effective: {new Date(dpa.effectiveDate).toLocaleDateString()}
              </p>
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
              dpa.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {dpa.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed max-h-[500px] overflow-y-auto">
              {dpa.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
