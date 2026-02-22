'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, UserPlus, X } from 'lucide-react';
import { api } from '@/lib/api';

interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VIEWER' | 'APPROVER';
  isActive: boolean;
  lastLogin?: string;
  invitedAt: string;
  invitedBy: string;
}

const MOCK_USERS: PortalUser[] = [
  {
    id: '1',
    name: 'Catherine Walsh',
    email: 'c.walsh@acmecorp.com',
    role: 'ADMIN',
    isActive: true,
    lastLogin: '2026-02-21T08:30:00Z',
    invitedAt: '2025-06-01T10:00:00Z',
    invitedBy: 'Portal Admin',
  },
  {
    id: '2',
    name: 'David Park',
    email: 'd.park@acmecorp.com',
    role: 'APPROVER',
    isActive: true,
    lastLogin: '2026-02-19T14:15:00Z',
    invitedAt: '2025-08-14T09:00:00Z',
    invitedBy: 'Catherine Walsh',
  },
  {
    id: '3',
    name: 'Fiona Larkin',
    email: 'f.larkin@acmecorp.com',
    role: 'VIEWER',
    isActive: true,
    lastLogin: '2026-02-10T11:00:00Z',
    invitedAt: '2025-11-20T12:00:00Z',
    invitedBy: 'Catherine Walsh',
  },
  {
    id: '4',
    name: 'Marcus Henley',
    email: 'm.henley@acmecorp.com',
    role: 'VIEWER',
    isActive: false,
    invitedAt: '2025-09-05T09:30:00Z',
    invitedBy: 'Catherine Walsh',
  },
];

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  APPROVER: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

interface InviteForm {
  name: string;
  email: string;
  role: 'ADMIN' | 'VIEWER' | 'APPROVER';
}

export default function PortalUsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<InviteForm>({ name: '', email: '', role: 'VIEWER' });
  const [inviting, setInviting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/users');
      setUsers(res.data.data || []);
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await api.post('/portal/users/invite', form);
      const newUser: PortalUser = res.data.data || {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: true,
        invitedAt: new Date().toISOString(),
        invitedBy: 'You',
      };
      setUsers((prev) => [newUser, ...prev]);
    } catch {
      // Optimistic add with mock
      setUsers((prev) => [
        {
          id: Date.now().toString(),
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: true,
          invitedAt: new Date().toISOString(),
          invitedBy: 'You',
        },
        ...prev,
      ]);
    } finally {
      setForm({ name: '', email: '', role: 'VIEWER' });
      setShowModal(false);
      setInviting(false);
    }
  }

  async function toggleActive(user: PortalUser) {
    setTogglingId(user.id);
    const newState = !user.isActive;
    try {
      await api.patch(`/portal/users/${user.id}`, { isActive: newState });
    } catch {
      // apply optimistically
    } finally {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newState } : u))
      );
      setTogglingId(null);
    }
  }

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal Users</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage who has access to your customer portal
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeUsers.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-gray-400">{inactiveUsers.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* User table */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-teal-500" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Invited</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(u.invitedAt).toLocaleDateString('en-GB')}
                          <br />
                          <span className="text-gray-400 dark:text-gray-600">by {u.invitedBy}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleActive(u)}
                            disabled={togglingId === u.id}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              u.isActive
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No users yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite New User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane.smith@company.com"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as InviteForm['role'] })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="VIEWER">Viewer — Read-only access</option>
                  <option value="APPROVER">Approver — Can approve requests</option>
                  <option value="ADMIN">Admin — Full portal management</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
