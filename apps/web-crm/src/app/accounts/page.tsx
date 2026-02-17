'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, Building2, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  contactsCount?: number;
  dealsCount?: number;
  lifetimeRevenue?: number;
  _count?: { contacts?: number; deals?: number };
  createdAt: string;
}

const typeColors: Record<string, string> = {
  PROSPECT: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-green-100 text-green-700',
  PARTNER: 'bg-purple-100 text-purple-700',
  SUPPLIER: 'bg-orange-100 text-orange-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

const initialFormState = {
  name: '',
  type: 'PROSPECT',
  industry: '',
  website: '',
  phone: '',
  address: '',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setError(null);
      const res = await api.get('/accounts');
      setAccounts(res.data.data || []);
    } catch (err) {
      setError('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openEditModal(account: Account) {
    setFormData({
      name: account.name,
      type: account.type || 'PROSPECT',
      industry: account.industry || '',
      website: account.website || '',
      phone: account.phone || '',
      address: account.address || '',
    });
    setEditingId(account.id);
    setFormError('');
    setEditModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.name.trim()) { setFormError('Account name is required'); return; }

    setSubmitting(true);
    try {
      await api.post('/accounts', formData);
      setCreateModalOpen(false);
      loadAccounts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.name.trim()) { setFormError('Account name is required'); return; }

    setSubmitting(true);
    try {
      await api.put(`/accounts/${editingId}`, formData);
      setEditModalOpen(false);
      loadAccounts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to update account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      loadAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  }

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesType;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Accounts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage customer and partner accounts</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input type="text" aria-label="Search accounts..." placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option value="PROSPECT">Prospect</option>
                <option value="CUSTOMER">Customer</option>
                <option value="PARTNER">Partner</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-600" />
              Accounts ({filteredAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Industry</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Contacts</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Deals</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Lifetime Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{account.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={typeColors[account.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{account.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{account.industry || '-'}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{account._count?.contacts ?? account.contactsCount ?? 0}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{account._count?.deals ?? account.dealsCount ?? 0}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(account.lifetimeRevenue || 0)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(account)} className="text-gray-400 dark:text-gray-500 hover:text-violet-600"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(account.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No accounts found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Account" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="name">Account Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Acme Corp" /></div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500">
                <option value="PROSPECT">Prospect</option>
                <option value="CUSTOMER">Customer</option>
                <option value="PARTNER">Partner</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="industry">Industry</Label><Input id="industry" name="industry" value={formData.industry} onChange={handleChange} placeholder="Technology" /></div>
            <div><Label htmlFor="website">Website</Label><Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" /></div>
            <div><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" /></div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Account" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-name">Account Name *</Label><Input id="e-name" name="name" value={formData.name} onChange={handleChange} /></div>
            <div>
              <Label htmlFor="e-type">Type</Label>
              <select id="e-type" name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500">
                <option value="PROSPECT">Prospect</option>
                <option value="CUSTOMER">Customer</option>
                <option value="PARTNER">Partner</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-industry">Industry</Label><Input id="e-industry" name="industry" value={formData.industry} onChange={handleChange} /></div>
            <div><Label htmlFor="e-website">Website</Label><Input id="e-website" name="website" value={formData.website} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-phone">Phone</Label><Input id="e-phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
            <div><Label htmlFor="e-address">Address</Label><Input id="e-address" name="address" value={formData.address} onChange={handleChange} /></div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
