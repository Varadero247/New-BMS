// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
import type { DeepLinkConfig } from './types';

export const DEFAULT_DEEP_LINKS: DeepLinkConfig[] = [
  { module: 'quality', entityType: 'ncr', urlPattern: '/quality/ncr/{id}', requiresAuth: true },
  { module: 'quality', entityType: 'capa', urlPattern: '/quality/capa/{id}', requiresAuth: true },
  { module: 'quality', entityType: 'document', urlPattern: '/quality/documents/{id}', requiresAuth: true },
  { module: 'quality', entityType: 'audit', urlPattern: '/quality/audits/{id}', requiresAuth: true },
  { module: 'quality', entityType: 'supplier', urlPattern: '/quality/suppliers/{id}', requiresAuth: true },
  { module: 'health-safety', entityType: 'incident', urlPattern: '/health-safety/incidents/{id}', requiresAuth: true },
  { module: 'health-safety', entityType: 'risk', urlPattern: '/health-safety/risks/{id}', requiresAuth: true },
  { module: 'health-safety', entityType: 'action', urlPattern: '/health-safety/actions/{id}', requiresAuth: true },
  { module: 'health-safety', entityType: 'training', urlPattern: '/health-safety/training/{id}', requiresAuth: true },
  { module: 'environment', entityType: 'aspect', urlPattern: '/environment/aspects/{id}', requiresAuth: true },
  { module: 'environment', entityType: 'legal', urlPattern: '/environment/legal/{id}', requiresAuth: true },
  { module: 'environment', entityType: 'objective', urlPattern: '/environment/objectives/{id}', requiresAuth: true },
  { module: 'hr', entityType: 'employee', urlPattern: '/hr/employees/{id}', requiresAuth: true },
  { module: 'hr', entityType: 'training', urlPattern: '/hr/training/{id}', requiresAuth: true },
  { module: 'hr', entityType: 'leave', urlPattern: '/hr/leave/{id}', requiresAuth: true },
  { module: 'finance', entityType: 'invoice', urlPattern: '/finance/invoices/{id}', requiresAuth: true },
  { module: 'finance', entityType: 'purchase-order', urlPattern: '/finance/purchase-orders/{id}', requiresAuth: true },
  { module: 'esg', entityType: 'emission', urlPattern: '/esg/emissions/{id}', requiresAuth: true },
  { module: 'esg', entityType: 'target', urlPattern: '/esg/targets/{id}', requiresAuth: true },
  { module: 'infosec', entityType: 'risk', urlPattern: '/infosec/risks/{id}', requiresAuth: true },
  { module: 'infosec', entityType: 'incident', urlPattern: '/infosec/incidents/{id}', requiresAuth: true },
  { module: 'infosec', entityType: 'control', urlPattern: '/infosec/controls/{id}', requiresAuth: true },
  { module: 'risk', entityType: 'risk', urlPattern: '/risk/register/{id}', requiresAuth: true },
  { module: 'risk', entityType: 'treatment', urlPattern: '/risk/treatments/{id}', requiresAuth: true },
  { module: 'suppliers', entityType: 'supplier', urlPattern: '/suppliers/{id}', requiresAuth: true },
];
