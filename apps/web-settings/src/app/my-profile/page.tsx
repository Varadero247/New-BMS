'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@ims/ui';
import {
  User,
  Shield,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Lock,
  Key,
  Mail,
  Building,
} from 'lucide-react';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  createdAt: string;
}

interface EffectivePermissions {
  roles: string[];
  modules: Record<string, number>;
}

const PERMISSION_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'None', color: 'bg-gray-100 dark:bg-gray-800 text-gray-400' },
  1: { label: 'View', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Create', color: 'bg-green-100 text-green-700' },
  3: { label: 'Edit', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Delete', color: 'bg-orange-100 text-orange-700' },
  5: { label: 'Approve', color: 'bg-purple-100 text-purple-700' },
  6: { label: 'Full', color: 'bg-red-100 text-red-700' },
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<EffectivePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [profileRes, permRes] = await Promise.all([
        api.get('/api/users/me').catch(() => null),
        api.post('/api/roles/resolve', { roles: [] }).catch(() => null),
      ]);

      if (profileRes?.data?.data) {
        setProfile(profileRes.data.data);

        // Resolve actual permissions for this user's roles
        const userRoles = profileRes.data.data.roles || [profileRes.data.data.role];
        const resolveRes = await api
          .post('/api/roles/resolve', { roles: userRoles })
          .catch(() => null);
        if (resolveRes?.data?.data) {
          setPermissions(resolveRes.data.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  function getPermissionIcon(level: number) {
    if (level === 0) return <Lock className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />;
    if (level === 1) return <Eye className="h-3.5 w-3.5 text-blue-500" />;
    if (level <= 3) return <Pencil className="h-3.5 w-3.5 text-yellow-500" />;
    if (level === 4) return <Trash2 className="h-3.5 w-3.5 text-orange-500" />;
    if (level === 5) return <CheckCircle className="h-3.5 w-3.5 text-purple-500" />;
    return <Shield className="h-3.5 w-3.5 text-red-500" />;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-40 bg-gray-200 rounded" />
            <div className="h-60 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your account details and effective permissions
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Legacy Role</p>
                    <Badge variant="default">{profile.role}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {profile.department || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Job Title</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {profile.jobTitle || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <Badge variant={profile.isActive ? 'secondary' : 'destructive'}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">
                Unable to load profile
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assigned Roles */}
        {permissions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-500" />
                Assigned Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissions.roles.map((roleId) => (
                  <Badge key={roleId} variant="outline" className="text-sm py-1 px-3">
                    <Shield className="h-3 w-3 mr-1.5" />
                    {roleId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Effective Permissions — "What can I access?" */}
        {permissions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                What Can I Access?
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  Effective permissions across all roles
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(permissions.modules)
                  .sort(([, a], [, b]) => b - a)
                  .map(([module, level]) => {
                    const config = PERMISSION_LABELS[level] || PERMISSION_LABELS[0];
                    return (
                      <div
                        key={module}
                        className={`flex items-center justify-between px-3 py-2 rounded ${
                          level > 0
                            ? 'bg-white dark:bg-gray-900 border border-gray-100'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(level)}
                          <span
                            className={`text-sm ${level > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}
                          >
                            {module.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
