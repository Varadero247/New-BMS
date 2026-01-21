'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, Shield, Sparkles, Settings, Server, Database, Activity } from 'lucide-react';
import Link from 'next/link';

const settingsCategories = [
  {
    name: 'User Management',
    description: 'Manage users, invite new members, and control access',
    href: '/users',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Roles & Permissions',
    description: 'Define roles and configure permission levels',
    href: '/roles',
    icon: Shield,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'AI Configuration',
    description: 'Configure AI providers and analysis settings',
    href: '/ai-config',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'System Settings',
    description: 'General system configuration and preferences',
    href: '/system',
    icon: Settings,
    color: 'bg-gray-100 text-gray-600',
  },
];

export default function SettingsOverview() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage system configuration and administration</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Sessions</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">AI Analyses</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Server className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.name} href={category.href}>
                <Card className="hover:border-gray-300 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-500" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">IMS v1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Database</p>
                <p className="font-medium">PostgreSQL 15</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Backup</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
