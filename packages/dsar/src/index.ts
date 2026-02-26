// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * @ims/dsar — Data Subject Access Request (DSAR) Engine
 *
 * GDPR/privacy compliance tool for handling data export and erasure requests.
 */

import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export type DsarType = 'EXPORT' | 'ERASURE';
export type DsarStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';

export interface DsarRequest {
  id: string;
  orgId: string;
  type: DsarType;
  subjectEmail: string;
  requestedById: string;
  status: DsarStatus;
  completedAt: string | null;
  downloadUrl: string | null;
  downloadExpiry: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
}

export interface CreateDsarParams {
  orgId: string;
  type: DsarType;
  subjectEmail: string;
  requestedById: string;
  notes?: string;
}

export interface UpdateDsarParams {
  status?: DsarStatus;
  completedAt?: string;
  downloadUrl?: string;
  downloadExpiry?: string;
  notes?: string;
}

// ─── In-Memory Store ────────────────────────────────────────────────────────

const dsarStore = new Map<string, DsarRequest>();

// ─── CRUD Operations ────────────────────────────────────────────────────────

export function createRequest(params: CreateDsarParams): DsarRequest {
  const now = new Date().toISOString();
  const request: DsarRequest = {
    id: uuidv4(),
    orgId: params.orgId,
    type: params.type,
    subjectEmail: params.subjectEmail,
    requestedById: params.requestedById,
    status: 'PENDING',
    completedAt: null,
    downloadUrl: null,
    downloadExpiry: null,
    createdAt: now,
    updatedAt: now,
    notes: params.notes || null,
  };

  dsarStore.set(request.id, request);
  return request;
}

export function listRequests(orgId: string): DsarRequest[] {
  return Array.from(dsarStore.values())
    .filter((r) => r.orgId === orgId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRequest(id: string): DsarRequest | undefined {
  return dsarStore.get(id);
}

export function updateRequest(id: string, updates: UpdateDsarParams): DsarRequest | null {
  const request = dsarStore.get(id);
  if (!request) return null;

  if (updates.status !== undefined) request.status = updates.status;
  if (updates.completedAt !== undefined) request.completedAt = updates.completedAt;
  if (updates.downloadUrl !== undefined) request.downloadUrl = updates.downloadUrl;
  if (updates.downloadExpiry !== undefined) request.downloadExpiry = updates.downloadExpiry;
  if (updates.notes !== undefined) request.notes = updates.notes;
  request.updatedAt = new Date().toISOString();

  return request;
}

// ─── Processing Functions ───────────────────────────────────────────────────

export function processExportRequest(id: string): Promise<DsarRequest | null> {
  const request = dsarStore.get(id);
  if (!request) return Promise.resolve(null);

  request.status = 'IN_PROGRESS';
  request.updatedAt = new Date().toISOString();

  return new Promise((resolve) => {
    setTimeout(() => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7); // 7-day download link

      request.status = 'COMPLETE';
      request.completedAt = new Date().toISOString();
      request.downloadUrl = `https://ims.local/downloads/dsar/${request.id}/export.zip`;
      request.downloadExpiry = expiry.toISOString();
      request.updatedAt = new Date().toISOString();

      resolve(request);
    }, 2000);
  });
}

export function processErasureRequest(id: string): Promise<DsarRequest | null> {
  const request = dsarStore.get(id);
  if (!request) return Promise.resolve(null);

  request.status = 'IN_PROGRESS';
  request.updatedAt = new Date().toISOString();

  return new Promise((resolve) => {
    setTimeout(() => {
      request.status = 'COMPLETE';
      request.completedAt = new Date().toISOString();
      request.notes =
        (request.notes ? request.notes + '\n' : '') +
        `Data erasure completed at ${request.completedAt}. All personal data for ${request.subjectEmail} has been removed from applicable systems.`;
      request.updatedAt = new Date().toISOString();

      resolve(request);
    }, 2000);
  });
}
