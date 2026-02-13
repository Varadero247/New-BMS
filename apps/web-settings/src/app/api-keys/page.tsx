'use client';

import { useState } from 'react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  status: 'active' | 'revoked';
}

const SCOPES = [
  { id: 'read:all', label: 'Read All', description: 'Read access to all modules' },
  { id: 'write:all', label: 'Write All', description: 'Write access to all modules' },
  { id: 'read:quality', label: 'Read Quality', description: 'Read quality data' },
  { id: 'write:quality', label: 'Write Quality', description: 'Create/update quality records' },
  { id: 'read:incidents', label: 'Read Incidents', description: 'Read incident data' },
  { id: 'write:incidents', label: 'Write Incidents', description: 'Create/update incidents' },
  { id: 'read:analytics', label: 'Read Analytics', description: 'Read analytics and KPIs' },
  { id: 'webhooks', label: 'Webhooks', description: 'Manage webhook subscriptions' },
];

const mockKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production Integration',
    prefix: 'ims_prod_a3f2',
    scopes: ['read:all', 'write:quality'],
    createdAt: '2026-01-15T09:00:00Z',
    lastUsedAt: '2026-02-13T08:45:00Z',
    expiresAt: null,
    status: 'active',
  },
  {
    id: '2',
    name: 'CI/CD Pipeline',
    prefix: 'ims_ci_7b8e',
    scopes: ['read:all'],
    createdAt: '2026-02-01T14:00:00Z',
    lastUsedAt: '2026-02-12T23:00:00Z',
    expiresAt: '2026-06-01T00:00:00Z',
    status: 'active',
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(mockKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const fakeKey = `ims_${newKeyName.toLowerCase().replace(/\s+/g, '_').slice(0, 8)}_${Math.random().toString(36).slice(2, 10)}`;
    const newKey: ApiKey = {
      id: String(keys.length + 1),
      name: newKeyName,
      prefix: fakeKey.slice(0, 14),
      scopes: newKeyScopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt: newKeyExpiry || null,
      status: 'active',
    };
    setKeys(prev => [...prev, newKey]);
    setCreatedKey(fakeKey);
    setShowCreate(false);
  };

  const handleRevoke = (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
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
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Manage API keys for programmatic access to your IMS</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setNewKeyName(''); setNewKeyScopes([]); setNewKeyExpiry(''); }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Create API Key
        </button>
      </div>

      {/* Created key banner */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">API Key Created</h3>
          <p className="text-xs text-green-600 mb-2">Copy this key now — you won&apos;t be able to see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white rounded-md border border-green-300 px-3 py-2 text-sm font-mono text-green-900">{createdKey}</code>
            <button onClick={handleCopy} className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-green-600 hover:underline mt-2">Dismiss</button>
        </div>
      )}

      {/* Keys table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Key Prefix</th>
              <th className="text-left p-3 font-medium text-gray-700">Scopes</th>
              <th className="text-left p-3 font-medium text-gray-700">Last Used</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
              <th className="text-left p-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {keys.map(key => (
              <tr key={key.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium text-gray-900">{key.name}</div>
                  <div className="text-xs text-gray-500">Created {new Date(key.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-3 font-mono text-xs text-gray-600">{key.prefix}...</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map(s => (
                      <span key={s} className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                </td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {key.status}
                  </span>
                </td>
                <td className="p-3">
                  {key.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="px-3 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Usage info */}
      <div className="bg-gray-50 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">API Usage</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Base URL: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-700">https://api.ims.local/api/v1</code></p>
          <p>Authentication: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-700">Authorization: Bearer &lt;api_key&gt;</code></p>
          <p>Rate limit: 1,000 requests/minute per key</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Create API Key</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
                <input
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Integration"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newKeyExpiry}
                  onChange={e => setNewKeyExpiry(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
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
                        <div className="text-sm font-medium text-gray-900">{scope.label}</div>
                        <div className="text-xs text-gray-500">{scope.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim()}
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
