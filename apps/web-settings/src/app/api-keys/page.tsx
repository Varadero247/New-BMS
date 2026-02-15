'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  status: 'active' | 'revoked';
  revokedAt: string | null;
}

const SCOPES = [
  { id: 'read:all', label: 'Read All', description: 'Read access to all modules' },
  { id: 'write:all', label: 'Write All', description: 'Write access to all modules' },
  { id: 'read:quality', label: 'Read Quality', description: 'Read quality data' },
  { id: 'write:quality', label: 'Write Quality', description: 'Create/update quality records' },
  { id: 'read:ncr', label: 'Read NCRs', description: 'Read non-conformance reports' },
  { id: 'write:ncr', label: 'Write NCRs', description: 'Create/update non-conformance reports' },
  { id: 'read:incidents', label: 'Read Incidents', description: 'Read incident data' },
  { id: 'write:incidents', label: 'Write Incidents', description: 'Create/update incidents' },
  { id: 'read:analytics', label: 'Read Analytics', description: 'Read analytics and KPIs' },
  { id: 'webhooks', label: 'Webhooks', description: 'Manage webhook subscriptions' },
];

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/api-keys`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setKeys(json.data);
      }
    } catch {
      // Fall back to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim() || newKeyScopes.length === 0) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newKeyName, scopes: newKeyScopes }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedKey(json.data.key);
        setConfirmed(false);
        setShowCreate(false);
        fetchKeys();
      }
    } catch {
      // Handle error silently
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/api/admin/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchKeys();
    } catch {
      // Handle error silently
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Keys</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage API keys for programmatic access to your IMS</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setNewKeyName(''); setNewKeyScopes([]); }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Create API Key
        </button>
      </div>

      {/* Created key banner */}
      {createdKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">API Key Created</h3>
          <p className="text-xs text-green-600 dark:text-green-400 mb-2">Copy this key now -- you will not be able to see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-gray-800 rounded-md border border-green-300 dark:border-green-700 px-3 py-2 text-sm font-mono text-green-900 dark:text-green-200 break-all">{createdKey}</code>
            <button onClick={handleCopy} className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 text-green-600 rounded"
              />
              <span className="text-xs text-green-700 dark:text-green-300">I have copied this key</span>
            </label>
            {confirmed && (
              <button onClick={() => { setCreatedKey(null); setConfirmed(false); }} className="text-xs text-green-600 hover:underline ml-2">
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keys table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Name</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Key Prefix</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Scopes</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Last Used</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">No API keys yet. Create one to get started.</td></tr>
            ) : (
              keys.map(key => (
                <tr key={key.id} className="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750">
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{key.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Created {new Date(key.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-600 dark:text-gray-400">{key.keyPrefix}...</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map(s => (
                        <span key={s} className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 text-xs">
                    {key.lastUsedAt ? (
                      <div>
                        <div>{new Date(key.lastUsedAt).toLocaleString()}</div>
                        <div className="text-gray-400 dark:text-gray-500">{key.usageCount} calls</div>
                      </div>
                    ) : 'Never'}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      key.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {key.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="px-3 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Usage info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">API Usage</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Base URL: <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border dark:border-gray-600 text-gray-700 dark:text-gray-300">https://api.ims.local/api/v1</code></p>
          <p>Authentication: <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border dark:border-gray-600 text-gray-700 dark:text-gray-300">Authorization: Bearer rxk_...</code></p>
          <p>Rate limit: 1,000 requests/minute per key</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create API Key</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Name *</label>
                <input
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Integration"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scopes *</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {SCOPES.map(scope => (
                    <label key={scope.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(scope.id)}
                        onChange={e => {
                          setNewKeyScopes(prev =>
                            e.target.checked ? [...prev, scope.id] : prev.filter(s => s !== scope.id)
                          );
                        }}
                        className="mt-0.5 h-4 w-4 text-blue-600 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{scope.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{scope.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim() || newKeyScopes.length === 0}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
