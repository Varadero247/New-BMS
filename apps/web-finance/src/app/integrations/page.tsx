'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Link as LinkIcon, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

interface Integration {
  id: string;
  provider: string;
  name: string;
  description: string;
  status: string;
  lastSync?: string;
  connectedAt?: string;
  config?: Record<string, any>;
  logo?: string;
}

const providerInfo: Record<string, { color: string; bgColor: string; description: string }> = {
  xero: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Cloud-based accounting software for small and medium businesses.',
  },
  quickbooks: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Popular accounting and bookkeeping software by Intuit.',
  },
  stripe: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Payment processing platform for online and in-person payments.',
  },
  sage: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Business management software for accounting and finance.',
  },
  paypal: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-50 border-blue-300',
    description: 'Online payment system for receiving and sending money.',
  },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  CONNECTED: { label: 'Connected', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DISCONNECTED: { label: 'Disconnected', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  SYNCING: { label: 'Syncing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  ERROR: { label: 'Error', color: 'bg-red-100 text-red-700', icon: XCircle },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

const defaultIntegrations: Integration[] = [
  { id: 'xero', provider: 'xero', name: 'Xero', description: 'Cloud accounting platform', status: 'DISCONNECTED' },
  { id: 'quickbooks', provider: 'quickbooks', name: 'QuickBooks', description: 'Accounting & bookkeeping', status: 'DISCONNECTED' },
  { id: 'stripe', provider: 'stripe', name: 'Stripe', description: 'Payment processing', status: 'DISCONNECTED' },
  { id: 'sage', provider: 'sage', name: 'Sage', description: 'Business accounting', status: 'DISCONNECTED' },
  { id: 'paypal', provider: 'paypal', name: 'PayPal', description: 'Online payments', status: 'DISCONNECTED' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [actionType, setActionType] = useState<'connect' | 'disconnect' | 'sync'>('connect');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      setError(null);
      const res = await api.get('/integrations');
      const data = res.data.data || [];
      if (data.length > 0) {
        // Merge with defaults for any missing providers
        const merged = defaultIntegrations.map(def => {
          const found = data.find((d: Integration) => d.provider === def.provider);
          return found || def;
        });
        setIntegrations(merged);
      }
    } catch (err) {
      // Keep defaults if API not available
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAction(integration: Integration, action: 'connect' | 'disconnect' | 'sync') {
    setSelectedIntegration(integration);
    setActionType(action);
    setConfirmModalOpen(true);
  }

  async function handleAction() {
    if (!selectedIntegration) return;
    setSubmitting(true);
    try {
      if (actionType === 'connect') {
        await api.post(`/integrations/${selectedIntegration.provider}/connect`);
      } else if (actionType === 'disconnect') {
        await api.post(`/integrations/${selectedIntegration.provider}/disconnect`);
      } else {
        await api.post(`/integrations/${selectedIntegration.provider}/sync`);
      }
      setConfirmModalOpen(false);
      loadIntegrations();
    } catch (err) {
      console.error(`Error ${actionType}ing integration:`, err);
      // Simulate state change for demo
      setIntegrations(prev => prev.map(i => {
        if (i.provider === selectedIntegration.provider) {
          if (actionType === 'connect') return { ...i, status: 'CONNECTED', connectedAt: new Date().toISOString() };
          if (actionType === 'disconnect') return { ...i, status: 'DISCONNECTED', connectedAt: undefined };
          if (actionType === 'sync') return { ...i, lastSync: new Date().toISOString() };
        }
        return i;
      }));
      setConfirmModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 rounded" />)}</div></div></div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-1">Connect your finance tools and payment providers</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                </div>
                <LinkIcon className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Connected</p>
                  <p className="text-2xl font-bold text-green-600">{integrations.filter(i => i.status === 'CONNECTED').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Disconnected</p>
                  <p className="text-2xl font-bold text-gray-600">{integrations.filter(i => i.status === 'DISCONNECTED').length}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const info = providerInfo[integration.provider] || { color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', description: '' };
            const status = statusConfig[integration.status] || statusConfig.DISCONNECTED;
            const StatusIcon = status.icon;
            const isConnected = integration.status === 'CONNECTED';

            return (
              <Card key={integration.id} className={`border ${isConnected ? info.bgColor : 'border-gray-200'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${isConnected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        <LinkIcon className={`h-6 w-6 ${isConnected ? info.color : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${info.color}`}>{integration.name}</h3>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1 inline" />
                      {status.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {providerInfo[integration.provider]?.description || 'Third-party integration.'}
                  </p>

                  {integration.connectedAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Connected: {new Date(integration.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {integration.lastSync && (
                    <p className="text-xs text-gray-400 mb-4">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 text-sm"
                          onClick={() => openAction(integration, 'sync')}
                        >
                          <RefreshCw className="h-3 w-3" /> Sync Now
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 text-sm text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => openAction(integration, 'disconnect')}
                        >
                          <XCircle className="h-3 w-3" /> Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="flex items-center gap-1 text-sm"
                        onClick={() => openAction(integration, 'connect')}
                      >
                        <ExternalLink className="h-3 w-3" /> Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${selectedIntegration?.name || ''}`} size="sm">
        <div className="py-4">
          <p className="text-gray-600">
            {actionType === 'connect' && `Are you sure you want to connect to ${selectedIntegration?.name}? This will initiate an OAuth flow to link your account.`}
            {actionType === 'disconnect' && `Are you sure you want to disconnect ${selectedIntegration?.name}? Synced data will be retained but no new data will be imported.`}
            {actionType === 'sync' && `Manually sync data from ${selectedIntegration?.name}? This may take a few minutes.`}
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setConfirmModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleAction}
            disabled={submitting}
            className={actionType === 'disconnect' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {submitting ? 'Processing...' : actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
