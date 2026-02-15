'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal } from '@ims/ui';
import { Shield, ChevronDown, ChevronRight, Search, Users, Eye, Pencil, Trash2, CheckCircle, Lock, Plus, Save, X } from 'lucide-react';
import { api } from '@/lib/api';

interface RolePermission {
  module: string;
  level: number;
  levelName?: string;
}

interface PlatformRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: RolePermission[];
}

const PERMISSION_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: 'None', color: 'bg-gray-100 dark:bg-gray-800 text-gray-400' },
  1: { label: 'View', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Create', color: 'bg-green-100 text-green-700' },
  3: { label: 'Edit', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Delete', color: 'bg-orange-100 text-orange-700' },
  5: { label: 'Approve', color: 'bg-purple-100 text-purple-700' },
  6: { label: 'Full', color: 'bg-red-100 text-red-700' },
};

const ALL_MODULES = [
  'health-safety', 'environment', 'quality', 'hr', 'payroll',
  'inventory', 'workflows', 'project-management', 'automotive',
  'medical', 'aerospace', 'finance', 'crm', 'infosec',
  'esg', 'cmms', 'portal', 'food-safety', 'energy',
  'analytics', 'field-service', 'iso42001', 'iso37001',
  'ai', 'settings', 'templates', 'reports', 'dashboard',
];

const MODULE_GROUPS: Record<string, string[]> = {
  'Core Compliance': ['health-safety', 'environment', 'quality'],
  'Industry Standards': ['automotive', 'medical', 'aerospace', 'iso42001', 'iso37001'],
  'Business Operations': ['finance', 'crm', 'hr', 'payroll', 'inventory'],
  'Operational': ['workflows', 'project-management', 'cmms', 'field-service'],
  'Specialist': ['infosec', 'esg', 'food-safety', 'energy', 'portal'],
  'Platform': ['analytics', 'ai', 'settings', 'templates', 'reports', 'dashboard'],
};

function formatModuleName(mod: string): string {
  return mod.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function RolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Create/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<PlatformRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const response = await api.get('/api/roles');
      setRoles(response.data.data || []);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    const perms: Record<string, number> = {};
    ALL_MODULES.forEach(m => { perms[m] = 0; });
    setRolePermissions(perms);
    setError('');
    setModalOpen(true);
  }

  function openEditModal(role: PlatformRole) {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    const perms: Record<string, number> = {};
    ALL_MODULES.forEach(m => { perms[m] = 0; });
    role.permissions.forEach(p => { perms[p.module] = p.level; });
    setRolePermissions(perms);
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    const permissions = Object.entries(rolePermissions)
      .filter(([, level]) => level > 0)
      .map(([module, level]) => ({ module, level }));

    if (permissions.length === 0) {
      setError('At least one permission must be set above None');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}`, {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions,
        });
      } else {
        await api.post('/api/roles', {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions,
        });
      }
      setModalOpen(false);
      await loadRoles();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: PlatformRole) {
    setDeleting(true);
    try {
      await api.delete(`/api/roles/${role.id}`);
      setDeleteConfirm(null);
      await loadRoles();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  }

  function setPermissionLevel(module: string, level: number) {
    setRolePermissions(prev => ({ ...prev, [module]: level }));
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleCategories: Record<string, PlatformRole[]> = {
    'Custom Roles': filteredRoles.filter(r => !r.isSystem),
    'Executive & Admin': filteredRoles.filter(r => r.isSystem && ['super-admin', 'org-admin', 'executive', 'board-member', 'compliance-director', 'it-admin'].includes(r.id)),
    'Quality & HSE': filteredRoles.filter(r => r.isSystem && ['quality-manager', 'quality-lead', 'quality-officer', 'hs-manager', 'hs-lead', 'hs-officer', 'env-manager', 'env-lead', 'env-officer', 'auditor'].includes(r.id)),
    'Finance & Sales': filteredRoles.filter(r => r.isSystem && ['finance-manager', 'finance-lead', 'accountant', 'payroll-officer', 'crm-manager', 'crm-lead', 'sales-rep'].includes(r.id)),
    'Operations & Engineering': filteredRoles.filter(r => r.isSystem && ['pm-manager', 'cmms-manager', 'field-service-manager', 'inventory-manager', 'analytics-manager'].includes(r.id)),
    'Specialist': filteredRoles.filter(r => r.isSystem && ['infosec-manager', 'infosec-lead', 'infosec-analyst', 'dpo', 'food-safety-manager', 'energy-manager', 'esg-manager', 'ai-governance-manager', 'antibribery-manager', 'hr-manager', 'hr-officer', 'portal-manager', 'automotive-manager', 'medical-manager', 'aerospace-manager'].includes(r.id)),
    'Portal & External': filteredRoles.filter(r => r.isSystem && ['employee', 'contractor', 'viewer'].includes(r.id)),
  };

  function toggleGroup(group: string) {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }

  function getPermissionLevel(role: PlatformRole, module: string): number {
    const perm = role.permissions.find(p => p.module === module);
    return perm?.level ?? 0;
  }

  function getLevelBadge(level: number) {
    const config = PERMISSION_LEVELS[level] || PERMISSION_LEVELS[0];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  }

  function getPermissionIcon(level: number) {
    if (level === 0) return <Lock className="h-3 w-3 text-gray-300 dark:text-gray-600" />;
    if (level === 1) return <Eye className="h-3 w-3 text-blue-500" />;
    if (level <= 3) return <Pencil className="h-3 w-3 text-yellow-500" />;
    if (level === 4) return <Trash2 className="h-3 w-3 text-orange-500" />;
    if (level === 5) return <CheckCircle className="h-3 w-3 text-purple-500" />;
    return <Shield className="h-3 w-3 text-red-500" />;
  }

  function getActiveModuleCount(role: PlatformRole): number {
    return role.permissions.filter(p => p.level > 0).length;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Roles & Permissions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {roles.length} platform roles across {Object.keys(MODULE_GROUPS).length} module groups
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{roles.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{roles.filter(r => r.isSystem).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">System Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{roles.filter(r => !r.isSystem).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Custom Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-purple-600">7</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Permission Levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Permission Level Legend */}
        <Card className="mb-6">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Levels:</span>
              {Object.entries(PERMISSION_LEVELS).map(([level, config]) => (
                <span key={level} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                  {level} = {config.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Categories */}
        <div className="space-y-4">
          {Object.entries(roleCategories).map(([category, categoryRoles]) => {
            if (categoryRoles.length === 0) return null;
            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    {category}
                    <Badge variant="outline" className="ml-2">{categoryRoles.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryRoles.map((role) => (
                      <div key={role.id} className="border border-gray-100 dark:border-gray-700 rounded-lg">
                        {/* Role Header */}
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                          <button
                            onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            {expandedRole === role.id ? (
                              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                            <Shield className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{role.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getActiveModuleCount(role)} modules
                            </Badge>
                            {role.isSystem ? (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); openEditModal(role); }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(role); }}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expanded Permission Matrix */}
                        {expandedRole === role.id && (
                          <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                            <div className="space-y-3">
                              {Object.entries(MODULE_GROUPS).map(([groupName, modules]) => (
                                <div key={groupName}>
                                  <button
                                    onClick={() => toggleGroup(`${role.id}-${groupName}`)}
                                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-700 dark:text-gray-300"
                                  >
                                    {expandedGroups[`${role.id}-${groupName}`] !== false ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    {groupName}
                                  </button>
                                  {expandedGroups[`${role.id}-${groupName}`] !== false && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 ml-4">
                                      {modules.map((mod) => {
                                        const level = getPermissionLevel(role, mod);
                                        return (
                                          <div
                                            key={mod}
                                            className={`flex items-center justify-between px-3 py-1.5 rounded text-sm ${
                                              level > 0 ? 'bg-white dark:bg-gray-900 border border-gray-100' : 'bg-gray-50 dark:bg-gray-800'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              {getPermissionIcon(level)}
                                              <span className={level > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                {formatModuleName(mod)}
                                              </span>
                                            </div>
                                            {getLevelBadge(level)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Role Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="lg">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Regional Compliance Officer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="e.g. Regional compliance oversight with approval authority"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Permission Matrix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Module Permissions</label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
              {Object.entries(MODULE_GROUPS).map(([groupName, modules]) => (
                <div key={groupName} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{groupName}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {modules.map((mod) => (
                      <div key={mod} className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatModuleName(mod)}</span>
                        <div className="flex gap-1">
                          {Object.entries(PERMISSION_LEVELS).map(([levelStr, config]) => {
                            const level = parseInt(levelStr);
                            const isActive = rolePermissions[mod] === level;
                            return (
                              <button
                                key={level}
                                onClick={() => setPermissionLevel(mod, level)}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                                  isActive
                                    ? config.color + ' ring-2 ring-offset-1 ring-blue-400'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100'
                                }`}
                                title={config.label}
                              >
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick set buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Quick set all:</span>
            {[
              { label: 'None', level: 0 },
              { label: 'View', level: 1 },
              { label: 'Edit', level: 3 },
              { label: 'Full', level: 6 },
            ].map(({ label, level }) => (
              <button
                key={level}
                onClick={() => {
                  const perms: Record<string, number> = {};
                  ALL_MODULES.forEach(m => { perms[m] = level; });
                  setRolePermissions(perms);
                }}
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:bg-gray-800"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Role" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the role <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
