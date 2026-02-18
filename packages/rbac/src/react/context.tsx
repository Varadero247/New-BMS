'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { ResolvedPermissions, ImsModule } from '../types';
import { PermissionLevel } from '../types';
import { resolvePermissions, mapLegacyRole } from '../permissions';

interface RBACContextValue {
  permissions: ResolvedPermissions | null;
  loading: boolean;
  hasPermission: (module: ImsModule, level: PermissionLevel) => boolean;
}

const RBACContext = createContext<RBACContextValue>({
  permissions: null,
  loading: true,
  hasPermission: () => false,
});

export function useRBACContext(): RBACContextValue {
  return useContext(RBACContext);
}

interface RBACProviderProps {
  children: ReactNode;
  roles?: string[];
}

export function RBACProvider({ children, roles: propRoles }: RBACProviderProps) {
  const [permissions, setPermissions] = useState<ResolvedPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Decode JWT payload (base64)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roleIds = propRoles || payload.roles || mapLegacyRole(payload.role || 'VIEWER');
        setPermissions(resolvePermissions(roleIds));
      }
    } catch {
      // Invalid token
    }
    setLoading(false);
  }, [propRoles]);

  const value = useMemo<RBACContextValue>(
    () => ({
      permissions,
      loading,
      hasPermission: (module: ImsModule, level: PermissionLevel) => {
        if (!permissions) return false;
        return (permissions.modules[module] ?? PermissionLevel.NONE) >= level;
      },
    }),
    [permissions, loading]
  );

  return React.createElement(RBACContext.Provider, { value }, children);
}
