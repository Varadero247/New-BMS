'use client';

import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  connected: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

const defaultIntegrations: Integration[] = [
  { id: 'slack', name: 'Slack', description: 'Send notifications and alerts to Slack channels', category: 'Communication', icon: '#', connected: false, status: 'inactive' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Post notifications to Teams channels', category: 'Communication', icon: 'T', connected: false, status: 'inactive' },
  { id: 'jira', name: 'Jira', description: 'Sync CAPA actions and non-conformances with Jira tickets', category: 'Project Management', icon: 'J', connected: false, status: 'inactive' },
  { id: 'sharepoint', name: 'SharePoint', description: 'Sync documents and evidence with SharePoint', category: 'Storage', icon: 'S', connected: false, status: 'inactive' },
  { id: 'google-drive', name: 'Google Drive', description: 'Back up documents and reports to Google Drive', category: 'Storage', icon: 'G', connected: false, status: 'inactive' },
  { id: 'power-bi', name: 'Power BI', description: 'Export KPIs and analytics data to Power BI dashboards', category: 'Analytics', icon: 'P', connected: false, status: 'inactive' },
  { id: 'sap', name: 'SAP ERP', description: 'Sync inventory, finance, and HR data with SAP', category: 'ERP', icon: 'S', connected: false, status: 'inactive' },
  { id: 'salesforce', name: 'Salesforce', description: 'Sync CRM data, contacts, and opportunities', category: 'CRM', icon: 'SF', connected: false, status: 'inactive' },
  { id: 'docusign', name: 'DocuSign', description: 'Electronic signatures for approvals and reviews', category: 'Compliance', icon: 'D', connected: false, status: 'inactive' },
  { id: 'smtp', name: 'Custom SMTP', description: 'Use your own SMTP server for outgoing emails', category: 'Email', icon: '@', connected: true, status: 'active', lastSync: '2026-02-13T10:30:00Z' },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  error: 'bg-red-100 text-red-700',
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [configuring, setConfiguring] = useState<Integration | null>(null);

  const categories = [...new Set(defaultIntegrations.map(i => i.category))];

  const filtered = integrations.filter(i => {
    if (filterCategory && i.category !== filterCategory) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleToggle = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, connected: !i.connected, status: i.connected ? 'inactive' : 'active' } : i
    ));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect IMS with your existing tools and services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{integrations.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{integrations.filter(i => i.connected).length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Connected</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{integrations.filter(i => i.status === 'error').length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Errors</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(integration => (
          <div key={integration.id} className="bg-white dark:bg-gray-900 rounded-lg border p-4 flex gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-lg shrink-0">
              {integration.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[integration.status]}`}>
                  {integration.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{integration.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleToggle(integration.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    integration.connected
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
                {integration.connected && (
                  <button
                    onClick={() => setConfiguring(integration)}
                    className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                  >
                    Configure
                  </button>
                )}
              </div>
              {integration.lastSync && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Last sync: {new Date(integration.lastSync).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Modal */}
      {configuring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfiguring(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Configure {configuring.name}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key / Token</label>
                <input type="password" placeholder="Enter API key..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
                <input type="url" placeholder="https://..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfiguring(null)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                <button onClick={() => setConfiguring(null)} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
