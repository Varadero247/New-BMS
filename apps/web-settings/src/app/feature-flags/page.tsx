'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OrgOverride {
  flagName: string;
  orgId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  orgOverrides: OrgOverride[];
  orgOverrideCount: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Org override state
  const [newOrgId, setNewOrgId] = useState('');
  const [newOrgEnabled, setNewOrgEnabled] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/feature-flags`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch flags');
      const json = await res.json();
      setFlags(json.data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleCreate = async () => {
    if (!newName.trim() || !newDescription.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/feature-flags`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          enabled: false,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to create flag');
      }
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create flag');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/feature-flags/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error('Failed to update flag');
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle flag');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/feature-flags/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete flag');
      setDeleteConfirm(null);
      setExpandedFlag(null);
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete flag');
    }
  };

  const handleAddOrgOverride = async (flagName: string) => {
    if (!newOrgId.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/api/admin/feature-flags/${encodeURIComponent(flagName)}/orgs/${encodeURIComponent(newOrgId.trim())}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ enabled: newOrgEnabled }),
        }
      );
      if (!res.ok) throw new Error('Failed to add org override');
      setNewOrgId('');
      setNewOrgEnabled(false);
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add org override');
    }
  };

  const handleToggleOrgOverride = async (flagName: string, orgId: string, enabled: boolean) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/feature-flags/${encodeURIComponent(flagName)}/orgs/${encodeURIComponent(orgId)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ enabled }),
        }
      );
      if (!res.ok) throw new Error('Failed to update org override');
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update org override');
    }
  };

  const handleRemoveOrgOverride = async (flagName: string, orgId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/feature-flags/${encodeURIComponent(flagName)}/orgs/${encodeURIComponent(orgId)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!res.ok) throw new Error('Failed to remove org override');
      await fetchFlags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove org override');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Flags</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control feature rollouts across the platform with per-organisation overrides
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setNewName('');
            setNewDescription('');
          }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Flag
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-500 hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading feature flags...
        </div>
      )}

      {/* Flags table */}
      {!loading && flags.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          No feature flags configured. Create one to get started.
        </div>
      )}

      {!loading && flags.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Flag Name
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300">
                  Global Status
                </th>
                <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300">
                  Org Overrides
                </th>
                <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {flags.map((flag) => (
                <tr key={flag.name} className="group">
                  <td colSpan={5} className="p-0">
                    {/* Main row */}
                    <div
                      className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/50"
                      onClick={() => setExpandedFlag(expandedFlag === flag.name ? null : flag.name)}
                    >
                      <div className="flex-1 p-3">
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                          {flag.name}
                        </code>
                      </div>
                      <div className="flex-1 p-3 text-gray-600 dark:text-gray-400 text-xs">
                        {flag.description}
                      </div>
                      <div className="w-32 p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggle(flag.name, !flag.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            flag.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          title={flag.enabled ? 'Enabled globally' : 'Disabled globally'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                              flag.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="w-28 p-3 text-center">
                        {flag.orgOverrideCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                            {flag.orgOverrideCount}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                        )}
                      </div>
                      <div className="w-24 p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {deleteConfirm === flag.name ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleDelete(flag.name)}
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(flag.name)}
                            className="px-2 py-1 text-xs font-medium rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded section: org overrides */}
                    {expandedFlag === flag.name && (
                      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-6 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Organisation Overrides
                          </h4>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">
                            Created: {new Date(flag.createdAt).toLocaleDateString()} | Updated:{' '}
                            {new Date(flag.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Existing overrides */}
                        {flag.orgOverrides.length > 0 ? (
                          <div className="space-y-2">
                            {flag.orgOverrides.map((override) => (
                              <div
                                key={override.orgId}
                                className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2"
                              >
                                <div className="text-xs">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {override.orgId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      handleToggleOrgOverride(
                                        flag.name,
                                        override.orgId,
                                        !override.enabled
                                      )
                                    }
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                      override.enabled
                                        ? 'bg-green-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                                        override.enabled ? 'translate-x-5' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRemoveOrgOverride(flag.name, override.orgId)
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                            No organisation overrides configured.
                          </p>
                        )}

                        {/* Add new override */}
                        <div className="flex items-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Organisation ID
                            </label>
                            <input
                              value={newOrgId}
                              onChange={(e) => setNewOrgId(e.target.value)}
                              placeholder="e.g. org_abc123"
                              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={newOrgEnabled}
                                onChange={(e) => setNewOrgEnabled(e.target.checked)}
                                className="h-3.5 w-3.5 text-blue-600 rounded"
                              />
                              Enabled
                            </label>
                            <button
                              onClick={() => handleAddOrgOverride(flag.name)}
                              disabled={!newOrgId.trim()}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Add Override
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary info */}
      {!loading && flags.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Flags:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{flags.length}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Enabled:</span>{' '}
              <span className="font-medium text-green-600">
                {flags.filter((f) => f.enabled).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Disabled:</span>{' '}
              <span className="font-medium text-gray-600">
                {flags.filter((f) => !f.enabled).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Usage info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Developer Usage
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            <strong>Server-side:</strong>{' '}
            <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              {`import { isEnabled } from '@ims/feature-flags';`}
            </code>
          </p>
          <p>
            <strong>React hook:</strong>{' '}
            <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              {`import { useFeatureFlag } from '@ims/feature-flags';`}
            </code>
          </p>
          <p>
            <strong>API check:</strong>{' '}
            <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              GET /api/feature-flags/check?name=flag_name
            </code>
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Create Feature Flag
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Flag Name *
                </label>
                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="e.g. new_dashboard_v2"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  Lowercase letters, numbers, and underscores only.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what this flag controls..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || !newDescription.trim() || creating}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Flag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
