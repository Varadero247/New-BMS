'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, Users, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accountId?: string;
  accountName?: string;
  account?: { name: string };
  source: string;
  title?: string;
  createdAt: string;
}

const sourceColors: Record<string, string> = {
  WEBSITE: 'bg-blue-100 text-blue-700',
  REFERRAL: 'bg-green-100 text-green-700',
  LINKEDIN: 'bg-indigo-100 text-indigo-700',
  COLD_CALL: 'bg-orange-100 text-orange-700',
  TRADE_SHOW: 'bg-purple-100 text-purple-700',
  INBOUND: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  source: 'WEBSITE',
  accountId: '',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      setError(null);
      const res = await api.get('/contacts');
      setContacts(res.data.data || []);
    } catch (err) {
      setError('Failed to load contacts.');
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

  function openEditModal(contact: Contact) {
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      title: contact.title || '',
      source: contact.source || 'WEBSITE',
      accountId: contact.accountId || '',
    });
    setEditingId(contact.id);
    setFormError('');
    setEditModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.firstName.trim()) { setFormError('First name is required'); return; }
    if (!formData.lastName.trim()) { setFormError('Last name is required'); return; }
    if (!formData.email.trim()) { setFormError('Email is required'); return; }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = { ...formData };
      if (!payload.accountId) delete payload.accountId;
      await api.post('/contacts', payload);
      setCreateModalOpen(false);
      loadContacts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create contact.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.firstName.trim()) { setFormError('First name is required'); return; }
    if (!formData.lastName.trim()) { setFormError('Last name is required'); return; }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = { ...formData };
      if (!payload.accountId) delete payload.accountId;
      await api.put(`/contacts/${editingId}`, payload);
      setEditModalOpen(false);
      loadContacts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to update contact.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  }

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = !searchTerm ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = !sourceFilter || c.source === sourceFilter;
    return matchesSearch && matchesSource;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your contact directory</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Add Contact
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
                  <input type="text" aria-label="Search contacts..." placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <select aria-label="Filter by source" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="TRADE_SHOW">Trade Show</option>
                <option value="INBOUND">Inbound</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-600" />
              Contacts ({filteredContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Account</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Created</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{contact.firstName} {contact.lastName}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {contact.phone ? <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</div> : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{contact.account?.name || contact.accountName || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge className={sourceColors[contact.source] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{contact.source?.replace('_', ' ') || 'N/A'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{new Date(contact.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(contact)} className="text-gray-400 dark:text-gray-500 hover:text-violet-600"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(contact.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contacts found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Contact" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" /></div>
            <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="title">Job Title</Label><Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="VP of Sales" /></div>
            <div>
              <Label htmlFor="source">Source</Label>
              <select id="source" name="source" value={formData.source} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500">
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="TRADE_SHOW">Trade Show</option>
                <option value="INBOUND">Inbound</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create Contact'}</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Contact" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-firstName">First Name *</Label><Input id="e-firstName" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
            <div><Label htmlFor="e-lastName">Last Name *</Label><Input id="e-lastName" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-email">Email *</Label><Input id="e-email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
            <div><Label htmlFor="e-phone">Phone</Label><Input id="e-phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="e-title">Job Title</Label><Input id="e-title" name="title" value={formData.title} onChange={handleChange} /></div>
            <div>
              <Label htmlFor="e-source">Source</Label>
              <select id="e-source" name="source" value={formData.source} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500">
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="TRADE_SHOW">Trade Show</option>
                <option value="INBOUND">Inbound</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
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
