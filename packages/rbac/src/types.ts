// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  CREATE = 2,
  EDIT = 3,
  DELETE = 4,
  APPROVE = 5,
  FULL = 6,
}

export type ImsModule =
  | 'health-safety'
  | 'environment'
  | 'quality'
  | 'hr'
  | 'payroll'
  | 'inventory'
  | 'workflows'
  | 'project-management'
  | 'automotive'
  | 'medical'
  | 'aerospace'
  | 'finance'
  | 'crm'
  | 'infosec'
  | 'esg'
  | 'cmms'
  | 'portal'
  | 'food-safety'
  | 'energy'
  | 'analytics'
  | 'field-service'
  | 'iso42001'
  | 'iso37001'
  | 'ai'
  | 'settings'
  | 'templates'
  | 'reports'
  | 'dashboard';

export interface ModulePermissions {
  module: ImsModule;
  level: PermissionLevel;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermissions[];
  isSystem: boolean;
}

export interface ResolvedPermissions {
  roles: string[];
  modules: Record<ImsModule, PermissionLevel>;
}

export interface RBACUser {
  id: string;
  email: string;
  role: string;
  roles?: string[];
}
