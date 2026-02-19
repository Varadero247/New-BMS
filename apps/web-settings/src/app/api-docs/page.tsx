'use client';

import { useState, useEffect } from 'react';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/docs/openapi.json`)
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load OpenAPI specification');
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ims-openapi-spec.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!spec) return;
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pathCount = spec ? Object.keys(spec.paths || {}).length : 0;
  const tagCount = spec ? (spec.tags || []).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Documentation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            OpenAPI 3.0 specification for all IMS API services.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!spec}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!spec}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            Download Spec
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading specification...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {spec && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {spec.openapi}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">API Version</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {spec.info?.version}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Services</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{tagCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Endpoints</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{pathCount}</p>
            </div>
          </div>

          {/* Tags (Services) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(spec.tags || []).map((tag: any) => (
                <div key={tag.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tag.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tag.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Spec */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Raw Specification
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-400 font-mono">
                openapi.json
              </span>
            </div>
            <pre className="p-6 overflow-auto max-h-[600px] text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-950">
              {JSON.stringify(spec, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
