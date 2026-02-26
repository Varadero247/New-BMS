// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useRBACContext } from './context';
import type { ImsModule } from '../types';
import { PermissionLevel } from '../types';

export function usePermission(module: ImsModule, level: PermissionLevel): boolean {
  const { hasPermission } = useRBACContext();
  return hasPermission(module, level);
}

export function useCanAccess(module: ImsModule): boolean {
  return usePermission(module, PermissionLevel.VIEW);
}

export function useRoles(): string[] {
  const { permissions } = useRBACContext();
  return permissions?.roles ?? [];
}
