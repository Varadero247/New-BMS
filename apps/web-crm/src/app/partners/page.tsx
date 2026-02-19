'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import { Plus, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

interface Partner {
  id: string;
  accountId?: string;
  accountName?: string;
  account?: { name: string };
  tier: string;
  commissionRate: number;
  totalReferrals: number;
  status: string;
  createdAt: string;
}

const tierColors: Record<string, string> = {
  TIER_1_REFERRAL: 'bg-blue-100 text-blue-700',
  TIER_2_COSELL: 'bg-purple-100 text-purple-700',
  TIER_3_RESELLER: 'bg-amber-100 text-amber-700',
};

const tierLabels: Record<string, string> = {
  TIER_1_REFERRAL: 'Tier 1 - Referral',
  TIER_2_COSELL: 'Tier 2 - Co-Sell',
  TIER_3_RESELLER: 'Tier 3 - Reseller',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const initialFormState = {
  accountId: '',
  tier: 'TIER_1_REFERRAL',
  commissionRate: '10',
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    try {
      setError(null);
      const res = await api.get('/partners');
      setPartners(res.data.data || []);
    } catch {
      setError('Failed to load partners.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.accountId.trim()) {
      setFormError('Account ID is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        commissionRate: parseFloat(formData.commissionRate) || 10,
      };
      await api.post('/partners', payload);
      setCreateModalOpen(false);
      loadPartners();
    } catch (err) {
      setFormError((err as any)?.response?.data?.error?.message || 'Failed to register partner.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredPartners = partners.filter((p) => {
    const matchesTier = !tierFilter || p.tier === tierFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesTier && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Partners</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage partner relationships and commissions
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Register Partner
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                aria-label="Filter by tier"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Tiers</option>
                <option value="TIER_1_REFERRAL">Tier 1 - Referral</option>
                <option value="TIER_2_COSELL">Tier 2 - Co-Sell</option>
                <option value="TIER_3_RESELLER">Tier 3 - Reseller</option>
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-600" />
              Partners ({filteredPartners.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPartners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Account
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Tier
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Commission Rate
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Total Referrals
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((partner) => (
                      <tr key={partner.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {partner.account?.name || partner.accountName || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              tierColors[partner.tier] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {tierLabels[partner.tier] || partner.tier}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {partner.commissionRate}%
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {partner.totalReferrals || 0}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusColors[partner.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {partner.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No partners found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Partner"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="accountId">Account ID *</Label>
            <Input
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              placeholder="Account ID or name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier">Partner Tier</Label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
              >
                <option value="TIER_1_REFERRAL">Tier 1 - Referral</option>
                <option value="TIER_2_COSELL">Tier 2 - Co-Sell</option>
                <option value="TIER_3_RESELLER">Tier 3 - Reseller</option>
              </select>
            </div>
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.commissionRate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Partner'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
