'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SsoConfig {
  configured: boolean;
  enabled: boolean;
  id?: string;
  entryPoint?: string;
  issuer?: string;
  signatureAlgorithm?: string;
  hasCert?: boolean;
  createdAt?: string;
  updatedAt?: string;
  spMetadataUrl: string;
  spEntityId: string;
  spAcsUrl: string;
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export default function SsoPage() {
  const [config, setConfig] = useState<SsoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [entryPoint, setEntryPoint] = useState('');
  const [issuer, setIssuer] = useState('');
  const [cert, setCert] = useState('');
  const [signatureAlgorithm, setSignatureAlgorithm] = useState('sha256');

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/security/sso`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        if (json.data.configured) {
          setEnabled(json.data.enabled);
          setEntryPoint(json.data.entryPoint || '');
          setIssuer(json.data.issuer || '');
          setSignatureAlgorithm(json.data.signatureAlgorithm || 'sha256');
        }
      }
    } catch {
      setError('Failed to load SSO configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/security/sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ entryPoint, issuer, cert, signatureAlgorithm, enabled }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('SSO configuration saved successfully');
        fetchConfig();
      } else {
        setError(json.error?.message || 'Failed to save configuration');
      }
    } catch {
      setError('Failed to save SSO configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the SSO configuration? Users will no longer be able to sign in via SSO.')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/security/sso`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('SSO configuration removed');
        setEnabled(false);
        setEntryPoint('');
        setIssuer('');
        setCert('');
        setSignatureAlgorithm('sha256');
        fetchConfig();
      } else {
        setError(json.error?.message || 'Failed to remove configuration');
      }
    } catch {
      setError('Failed to remove SSO configuration');
    }
  };

  const handleTestSso = async () => {
    setTesting(true);
    setError(null);
    try {
      // Open the SSO login in a new window for testing
      window.open(`${API_URL}/api/auth/saml/login?orgId=default`, '_blank', 'width=600,height=700');
      setSuccess('SSO test initiated - check the new window');
    } catch {
      setError('Failed to initiate SSO test');
    } finally {
      setTesting(false);
    }
  };

  const handleCopyMetadata = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/saml/metadata`);
      const xml = await res.text();
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy SP metadata');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Single Sign-On (SSO)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure SAML 2.0 Single Sign-On for your organisation
        </p>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Enable toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enable SSO</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Once enabled, users from your organisation will be redirected to your Identity Provider
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SP Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Provider Metadata</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Provide this information to your Identity Provider when configuring the SAML integration.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entity ID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                {config?.spEntityId || 'https://app.ims.local/saml/metadata'}
              </code>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ACS URL</label>
            <code className="block bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              {config?.spAcsUrl || 'https://app.ims.local/api/auth/saml/callback'}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyMetadata}
              className="px-4 py-2 text-sm font-medium rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {copied ? 'Copied!' : 'Copy SP Metadata XML'}
            </button>
            <a
              href={`${API_URL}/api/auth/saml/metadata`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Download Metadata
            </a>
          </div>
        </div>
      </div>

      {/* IdP Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Identity Provider Configuration</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Identity Provider Name
          </label>
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Okta, Azure AD, OneLogin"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IdP SSO URL *
          </label>
          <input
            value={entryPoint}
            onChange={(e) => setEntryPoint(e.target.value)}
            placeholder="https://idp.example.com/sso/saml"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">The URL where authentication requests will be sent</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IdP Certificate (PEM format) *
          </label>
          <textarea
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            rows={6}
            placeholder="-----BEGIN CERTIFICATE-----&#10;MIICpDCCAYwCCQD...&#10;-----END CERTIFICATE-----"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Paste your IdP&apos;s X.509 certificate in PEM format</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Signature Algorithm
          </label>
          <select
            value={signatureAlgorithm}
            onChange={(e) => setSignatureAlgorithm(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="sha256">SHA-256 (Recommended)</option>
            <option value="sha512">SHA-512</option>
            <option value="sha1">SHA-1 (Legacy)</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !entryPoint || !cert}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {config?.configured && (
          <>
            <button
              onClick={handleTestSso}
              disabled={testing || !config.enabled}
              className="px-4 py-2 text-sm font-medium rounded-md border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test SSO'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove Configuration
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">About SAML SSO</h3>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>SAML 2.0 is supported for enterprise Identity Providers (Okta, Azure AD, OneLogin, etc.)</li>
          <li>Once enabled, users from your organisation will be redirected to your Identity Provider for authentication</li>
          <li>New users will be automatically provisioned on first SSO login</li>
          <li>For automated user provisioning, see the SCIM configuration page</li>
        </ul>
      </div>
    </div>
  );
}
