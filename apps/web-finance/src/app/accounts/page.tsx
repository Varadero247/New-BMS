'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, BookOpen, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  subType?: string;
  normalBalance: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  balance: number;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-700',
  LIABILITY: 'bg-red-100 text-red-700',
  EQUITY: 'bg-purple-100 text-purple-700',
  REVENUE: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-orange-100 text-orange-700',
};

const balanceColors: Record<string, string> = {
  DEBIT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  CREDIT: 'bg-indigo-100 text-indigo-700',
};

const initialFormState = {
  code: '',
  name: '',
  type: 'ASSET',
  subType: '',
  normalBalance: 'DEBIT',
  description: '',
  parentId: '',
  isActive: true,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

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
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      const res = await api.get(`/accounts?${params.toString()}`);
      setAccounts(res.data.data || []);
    } catch (err) {
      setError('Failed to load accounts.');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openEditModal(account: Account) {
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      subType: account.subType || '',
      normalBalance: account.normalBalance,
      description: account.description || '',
      parentId: account.parentId || '',
      isActive: account.isActive,
    });
    setEditingId(account.id);
    setFormError('');
    setEditModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.code.trim()) { setFormError('Account code is required'); return; }
    if (!formData.name.trim()) { setFormError('Account name is required'); return; }

    setSubmitting(true);
    try {
      await api.post('/accounts', formData);
      setCreateModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.code.trim()) { setFormError('Account code is required'); return; }
    if (!formData.name.trim()) { setFormError('Account name is required'); return; }

    setSubmitting(true);
    try {
      await api.put(`/accounts/${editingId}`, formData);
      setEditModalOpen(false);
      loadAccounts();
    } catch (err: any) {
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
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chart of Accounts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your general ledger accounts</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Accounts ({filteredAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Normal Balance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">{account.code}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{account.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={typeColors[account.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                            {account.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={balanceColors[account.normalBalance] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                            {account.normalBalance}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(account.balance || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(account)} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(account.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No accounts found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Account" size="lg">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Account Code *</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. 1000" />
            </div>
            <div>
              <Label htmlFor="name">Account Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Cash" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Account Type</Label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <Label htmlFor="normalBalance">Normal Balance</Label>
              <select id="normalBalance" name="normalBalance" value={formData.normalBalance} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="subType">Sub Type</Label>
            <Input id="subType" name="subType" value={formData.subType} onChange={handleChange} placeholder="e.g. Current Asset" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Account description..." rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-code">Account Code *</Label>
              <Input id="edit-code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. 1000" />
            </div>
            <div>
              <Label htmlFor="edit-name">Account Name *</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Cash" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-type">Account Type</Label>
              <select id="edit-type" name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-normalBalance">Normal Balance</Label>
              <select id="edit-normalBalance" name="normalBalance" value={formData.normalBalance} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-isActive" name="isActive" checked={formData.isActive as any} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
            <Label htmlFor="edit-isActive">Active</Label>
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
