'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ims/ui';
import { Plus, Shield, Check, X, Edit } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: {
    risks: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    incidents: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    actions: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean; create: boolean; export: boolean };
    settings: { view: boolean; manage: boolean };
    users: { view: boolean; manage: boolean };
  };
}

const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access',
    userCount: 2,
    permissions: {
      risks: { view: true, create: true, edit: true, delete: true },
      incidents: { view: true, create: true, edit: true, delete: true },
      actions: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, export: true },
      settings: { view: true, manage: true },
      users: { view: true, manage: true },
    },
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Department-level access with reporting',
    userCount: 5,
    permissions: {
      risks: { view: true, create: true, edit: true, delete: false },
      incidents: { view: true, create: true, edit: true, delete: false },
      actions: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: true, export: true },
      settings: { view: true, manage: false },
      users: { view: true, manage: false },
    },
  },
  {
    id: '3',
    name: 'User',
    description: 'Standard user access',
    userCount: 15,
    permissions: {
      risks: { view: true, create: true, edit: false, delete: false },
      incidents: { view: true, create: true, edit: false, delete: false },
      actions: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false },
      settings: { view: false, manage: false },
      users: { view: false, manage: false },
    },
  },
  {
    id: '4',
    name: 'Viewer',
    description: 'Read-only access',
    userCount: 8,
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: false, edit: false, delete: false },
      actions: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false },
      settings: { view: false, manage: false },
      users: { view: false, manage: false },
    },
  },
];

export default function RolesPage() {
  const [roles] = useState<Role[]>(defaultRoles);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-500 mt-1">Manage access control and permissions</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    {role.name}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{role.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{role.userCount} users</Badge>
                </div>

                <div className="space-y-3">
                  <PermissionRow label="Risks" permissions={role.permissions.risks} />
                  <PermissionRow label="Incidents" permissions={role.permissions.incidents} />
                  <PermissionRow label="Actions" permissions={role.permissions.actions} />
                  <PermissionRow label="Reports" permissions={role.permissions.reports} type="reports" />
                  <PermissionRow label="Settings" permissions={role.permissions.settings} type="settings" />
                  <PermissionRow label="Users" permissions={role.permissions.users} type="settings" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PermissionRow({
  label,
  permissions,
  type = 'standard'
}: {
  label: string;
  permissions: Record<string, boolean>;
  type?: 'standard' | 'reports' | 'settings';
}) {
  const keys = Object.keys(permissions);

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-1">
            {permissions[key] ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-300" />
            )}
            <span className="text-xs text-gray-400 capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
