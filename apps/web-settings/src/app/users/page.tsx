'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal } from '@ims/ui';
import { Plus, Users, Search, MoreVertical, Mail, Shield, X, Check, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  roles?: string[];
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  createdAt: string;
}

interface PlatformRole {
  id: string;
  name: string;
  description: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<PlatformRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', password: '', role: 'USER' });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  async function loadUsers() {
    try {
      const response = await api.get('/api/users');
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([
        { id: '1', email: 'admin@ims.local', firstName: 'Admin', lastName: 'User', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      const response = await api.get('/api/roles');
      setAvailableRoles(response.data.data || []);
    } catch {
      setAvailableRoles([]);
    }
  }

  function getUserName(user: User): string {
    if (user.name) return user.name;
    if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return user.email.split('@')[0];
  }

  function openRoleAssignment(user: User) {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setShowRoleModal(true);
  }

  async function saveRoles() {
    if (!selectedUser) return;
    try {
      await api.patch(`/api/users/${selectedUser.id}/roles`, { roles: selectedRoles });
      setShowRoleModal(false);
      loadUsers();
    } catch (err) {
      alert('Failed to update roles');
    }
  }

  function toggleRole(roleId: string) {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  }

  async function inviteUser() {
    try {
      await api.post('/api/users', inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: '', firstName: '', lastName: '', password: '', role: 'USER' });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create user');
    }
  }

  async function toggleUserActive(user: User) {
    try {
      await api.patch(`/api/users/${user.id}`, { isActive: !user.isActive });
      loadUsers();
    } catch {
      alert('Failed to update user');
    }
  }

  const filteredUsers = users.filter(user => {
    const name = getUserName(user).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-1">Manage system users, roles, and access</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
              <p className="text-sm text-gray-500">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {availableRoles.length}
              </p>
              <p className="text-sm text-gray-500">Available Roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="AUDITOR">Auditor</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {getUserName(user).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getUserName(user)}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.jobTitle && (
                          <p className="text-xs text-gray-400">{user.jobTitle}{user.department ? ` — ${user.department}` : ''}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* RBAC Roles */}
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.roles.slice(0, 2).map(r => (
                            <Badge key={r} variant="outline" className="text-xs">
                              {r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </Badge>
                          ))}
                          {user.roles.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{user.roles.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant={
                          user.role === 'ADMIN' ? 'destructive' :
                          user.role === 'MANAGER' ? 'default' : 'secondary'
                        }>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                      )}

                      <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>

                      <button
                        onClick={() => openRoleAssignment(user)}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Assign RBAC roles"
                      >
                        Assign Roles
                      </button>

                      <button
                        onClick={() => toggleUserActive(user)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Assignment Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Assign RBAC Roles" size="lg">
        <div className="p-4">
          {selectedUser && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Assigning roles to <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})
              </p>
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedRoles.includes(role.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{role.name}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </div>
                    {selectedRoles.includes(role.id) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">{selectedRoles.length} roles selected</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                  <Button onClick={saveRoles}>Save Roles</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Invite User Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite New User" size="md">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@company.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
              <input
                type="text"
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
              <input
                type="text"
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Temporary Password</label>
            <input
              type="password"
              value={inviteForm.password}
              onChange={(e) => setInviteForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Legacy Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="AUDITOR">Auditor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={inviteUser}>Create User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
