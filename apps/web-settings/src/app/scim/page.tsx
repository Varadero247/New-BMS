'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ScimToken {
  id: string;
  tokenPrefix: string;
  createdAt: string;
  active: boolean;
}

interface ProvisionedUser {
  id: string;
  userName: string;
  displayName: string;
  active: boolean;
  meta: {
    created: string;
    lastModified: string;
  };
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export default function ScimPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProvisionedUser[]>([]);
  const [tokens, setTokens] = useState<ScimToken[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const scimBaseUrl = `${API_URL}/scim/v2`;

  const fetchData = useCallback(async () => {
    try {
      // Fetch provisioned users via admin API
      const res = await fetch(`${API_URL}/api/admin/scim/status`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users || []);
        setTokens(json.data.tokens || []);
      }
    } catch {
      // Endpoint may not exist yet - that is fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/scim/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedToken(json.data.token);
        setConfirmed(false);
        fetchData();
      }
    } catch {
      // Handle error silently
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm('Revoke this SCIM token? Any IdP using this token will lose access.')) return;
    try {
      await fetch(`${API_URL}/api/admin/scim/token/${tokenId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchData();
    } catch {
      // Handle error silently
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(scimBaseUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SCIM Provisioning</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure SCIM 2.0 automated user provisioning from your Identity Provider
        </p>
      </div>

      {/* Generated token banner */}
      {generatedToken && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">SCIM Bearer Token Generated</h3>
          <p className="text-xs text-green-600 dark:text-green-400 mb-2">Copy this token now -- you will not be able to see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-gray-800 rounded-md border border-green-300 dark:border-green-700 px-3 py-2 text-sm font-mono text-green-900 dark:text-green-200 break-all">
              {generatedToken}
            </code>
            <button
              onClick={handleCopyToken}
              className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 shrink-0"
            >
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
              <span className="text-xs text-green-700 dark:text-green-300">I have copied this token</span>
            </label>
            {confirmed && (
              <button
                onClick={() => { setGeneratedToken(null); setConfirmed(false); }}
                className="text-xs text-green-600 hover:underline ml-2"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* SCIM Endpoint URL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SCIM Endpoint</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your Identity Provider with this SCIM base URL and a Bearer token.
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">SCIM Base URL</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              {scimBaseUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 text-sm rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0"
            >
              {urlCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Authentication</label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bearer Token (OAuth 2.0 Bearer Token) — generate a token below
          </p>
        </div>
      </div>

      {/* Token Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bearer Tokens</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Generate tokens for your Identity Provider to authenticate SCIM requests
            </p>
          </div>
          <button
            onClick={handleGenerateToken}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Generate Token
          </button>
        </div>

        {tokens.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{token.tokenPrefix}...</div>
                  <div className="text-xs text-gray-500">Created {new Date(token.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    token.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {token.active ? 'Active' : 'Revoked'}
                  </span>
                  {token.active && (
                    <button
                      onClick={() => handleRevokeToken(token.id)}
                      className="px-3 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No tokens generated yet. Generate one to connect your Identity Provider.
          </p>
        )}
      </div>

      {/* Provisioned Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Provisioned Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Users managed by SCIM provisioning</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">User</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Email</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Provisioned</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No SCIM-provisioned users yet. Connect your IdP to get started.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{user.userName}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(user.meta.created).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">About SCIM Provisioning</h3>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>SCIM 2.0 (RFC 7644) enables automatic user provisioning and deprovisioning from your Identity Provider</li>
          <li>Supported IdPs: Okta, Azure AD, OneLogin, JumpCloud, and any SCIM 2.0 compatible provider</li>
          <li>User attributes synced: name, email, display name, active status</li>
          <li>Groups map to IMS roles for automatic role assignment</li>
        </ul>
      </div>
    </div>
  );
}
