// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ConnectorConfig, ConnectorType } from './types';
import { BaseConnector } from './base-connector';

type ConnectorFactory = (config: ConnectorConfig) => BaseConnector;

const factories = new Map<ConnectorType, ConnectorFactory>();

export function registerConnector(type: ConnectorType, factory: ConnectorFactory): void {
  factories.set(type, factory);
}

export function createConnector(config: ConnectorConfig): BaseConnector {
  const factory = factories.get(config.type);
  if (!factory) throw new Error(`No connector registered for type: ${config.type}`);
  return factory(config);
}

export function getSupportedConnectorTypes(): ConnectorType[] {
  return Array.from(factories.keys());
}

export const CONNECTOR_METADATA: Record<ConnectorType, { name: string; logoUrl?: string; authType: string; entityTypes: string[] }> = {
  BAMBOOHR: { name: 'BambooHR', authType: 'API_KEY', entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'LEAVE'] },
  SAP_HR: { name: 'SAP HR / SuccessFactors', authType: 'OAUTH2_CLIENT_CREDENTIALS', entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'POSITION'] },
  DYNAMICS_365: { name: 'Microsoft Dynamics 365', authType: 'OAUTH2_CLIENT_CREDENTIALS', entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'CUSTOMER', 'SUPPLIER', 'INVOICE'] },
  WORKDAY: { name: 'Workday', authType: 'OAUTH2_CLIENT_CREDENTIALS', entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'POSITION'] },
  XERO: { name: 'Xero', authType: 'OAUTH2_AUTHORIZATION_CODE', entityTypes: ['SUPPLIER', 'CUSTOMER', 'INVOICE'] },
  GENERIC_REST: { name: 'Generic REST API', authType: 'API_KEY_OR_BASIC', entityTypes: ['EMPLOYEE', 'DEPARTMENT', 'SUPPLIER'] },
};
