'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AllowlistEntry {
  id: string;
  cidr: string;
  label: string;
  createdAt: string;
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export default function IpAllowlistPage() {
  const [entries, setEntries] = useState<AllowlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myIp, setMyIp] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/ip-allowlist`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyIp = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/ip-allowlist/my-ip`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        setMyIp(json.data.ip);
      }
    } catch {
      // Silently handle
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchMyIp();
  }, [fetchEntries, fetchMyIp]);

  const handleAdd = async () => {
    if (!cidr.trim() || !label.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/ip-allowlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ cidr, label }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAdd(false);
        setCidr('');
        setLabel('');
        fetchEntries();
      }
    } catch {
      // Silently handle
    }
  };

  const handleAddCurrentIp = async () => {
    if (!myIp) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/ip-allowlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ cidr: `${myIp}/32`, label: 'My Current IP' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchEntries();
      }
    } catch {
      // Silently handle
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this allowlist entry?')) return;
    try {
      await fetch(`${API_URL}/api/admin/ip-allowlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchEntries();
    } catch {
      // Silently handle
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP Allowlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Restrict API access to trusted IP addresses</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add CIDR
        </button>
      </div>

      {/* Lockout Warning */}
      {entries.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Lockout Risk</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                IP allowlisting is active. If you remove your current IP, you may lose access to the API.
                Always ensure your current IP is in the allowlist before making changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current IP */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Current IP</h3>
            <p className="text-lg font-mono text-gray-900 dark:text-gray-100 mt-1">{myIp || 'Detecting...'}</p>
          </div>
          <button
            onClick={handleAddCurrentIp}
            disabled={!myIp}
            className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Add Current IP
          </button>
        </div>
      </div>

      {/* Entries table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">CIDR</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Label</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Added</th>
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No IP restrictions. All IPs are currently allowed (opt-in feature).
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750">
                  <td className="p-3 font-mono text-sm text-gray-900 dark:text-gray-100">{entry.cidr}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{entry.label}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info panel */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How it works</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>IP allowlisting is an opt-in feature. When no entries exist, all IPs are allowed.</p>
          <p>Once you add the first entry, only matching IPs can access the API.</p>
          <p>Supports both single IPs (e.g. <code className="bg-white dark:bg-gray-900 px-1 rounded">192.168.1.1/32</code>) and CIDR ranges (e.g. <code className="bg-white dark:bg-gray-900 px-1 rounded">10.0.0.0/8</code>).</p>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add IP Allowlist Entry</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIDR *</label>
                <input
                  value={cidr}
                  onChange={e => setCidr(e.target.value)}
                  placeholder="e.g. 192.168.1.0/24 or 10.0.0.1"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label *</label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. Office Network"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-md border dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!cidr.trim() || !label.trim()}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
