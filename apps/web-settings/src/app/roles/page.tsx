'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Shield, ChevronDown, ChevronRight, Search, Users, Eye, Pencil, Trash2, CheckCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';

interface RolePermission {
  module: string;
  level: number;
}

interface PlatformRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: RolePermission[];
}

const PERMISSION_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: 'None', color: 'bg-gray-100 text-gray-400' },
  1: { label: 'View', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Create', color: 'bg-green-100 text-green-700' },
  3: { label: 'Edit', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Delete', color: 'bg-orange-100 text-orange-700' },
  5: { label: 'Approve', color: 'bg-purple-100 text-purple-700' },
  6: { label: 'Full', color: 'bg-red-100 text-red-700' },
};

const MODULE_GROUPS: Record<string, string[]> = {
  'Core Compliance': ['health-safety', 'environment', 'quality'],
  'Industry Standards': ['automotive', 'medical', 'aerospace', 'iso42001', 'iso37001'],
  'Business Operations': ['finance', 'crm', 'hr', 'payroll', 'inventory'],
  'Operational': ['workflows', 'project-management', 'cmms', 'field-service'],
  'Specialist': ['infosec', 'esg', 'food-safety', 'energy', 'portal'],
  'Platform': ['analytics', 'ai', 'settings', 'templates', 'reports', 'dashboard'],
};

export default function RolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const response = await api.get('/api/roles');
      setRoles(response.data.data || []);
    } catch {
      // Fallback: load from static RBAC definitions
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleCategories: Record<string, PlatformRole[]> = {
    'Executive & Admin': filteredRoles.filter(r => ['super-admin', 'org-admin', 'executive', 'board-member', 'compliance-director'].includes(r.id)),
    'Quality & HSE': filteredRoles.filter(r => ['quality-manager', 'quality-engineer', 'hse-manager', 'hse-officer', 'environmental-manager', 'auditor', 'document-controller'].includes(r.id)),
    'Finance & Sales': filteredRoles.filter(r => ['finance-director', 'finance-manager', 'finance-analyst', 'accounts-payable', 'accounts-receivable', 'sales-director', 'sales-manager', 'sales-representative'].includes(r.id)),
    'Operations & Engineering': filteredRoles.filter(r => ['operations-manager', 'maintenance-technician', 'warehouse-operator', 'field-engineer', 'project-manager', 'project-team-member'].includes(r.id)),
    'Specialist': filteredRoles.filter(r => ['infosec-manager', 'infosec-analyst', 'food-safety-manager', 'energy-manager', 'hr-manager', 'hr-officer', 'payroll-manager', 'partner-manager', 'msp-consultant'].includes(r.id)),
    'Portal & External': filteredRoles.filter(r => ['customer-portal-user', 'supplier-portal-user', 'viewer', 'employee'].includes(r.id)),
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
    if (level === 0) return <Lock className="h-3 w-3 text-gray-300" />;
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
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-500 mt-1">
              {roles.length} platform roles across {Object.keys(MODULE_GROUPS).length} module groups
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{roles.filter(r => r.isSystem).length}</p>
              <p className="text-xs text-gray-500 mt-1">System Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{Object.values(MODULE_GROUPS).flat().length}</p>
              <p className="text-xs text-gray-500 mt-1">Modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-2xl font-bold text-purple-600">7</p>
              <p className="text-xs text-gray-500 mt-1">Permission Levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Permission Level Legend */}
        <Card className="mb-6">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Levels:</span>
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
                    <Users className="h-5 w-5 text-gray-400" />
                    {category}
                    <Badge variant="outline" className="ml-2">{categoryRoles.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryRoles.map((role) => (
                      <div key={role.id} className="border border-gray-100 rounded-lg">
                        {/* Role Header */}
                        <button
                          onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedRole === role.id ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <Shield className="h-4 w-4 text-blue-500" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900 text-sm">{role.name}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getActiveModuleCount(role)} modules
                            </Badge>
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                        </button>

                        {/* Expanded Permission Matrix */}
                        {expandedRole === role.id && (
                          <div className="border-t border-gray-100 p-4">
                            <div className="space-y-3">
                              {Object.entries(MODULE_GROUPS).map(([groupName, modules]) => (
                                <div key={groupName}>
                                  <button
                                    onClick={() => toggleGroup(`${role.id}-${groupName}`)}
                                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700"
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
                                              level > 0 ? 'bg-white border border-gray-100' : 'bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              {getPermissionIcon(level)}
                                              <span className={level > 0 ? 'text-gray-700' : 'text-gray-400'}>
                                                {mod.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
    </div>
  );
}
