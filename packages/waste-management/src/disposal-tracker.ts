// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import {
  DisposalManifest,
  DisposalRoute,
  ManifestStatus,
} from './types';

let _manifestCounter = 0;
function nextManifestId(): string {
  return `DM-${String(++_manifestCounter).padStart(6, '0')}`;
}

export class DisposalTracker {
  private manifests: Map<string, DisposalManifest> = new Map();

  createManifest(
    wasteEntryId: string,
    disposalRoute: DisposalRoute,
    contractor: string,
    manifestNumber: string,
    treatmentFacility?: string,
    cost?: number,
    notes?: string,
  ): DisposalManifest {
    const manifest: DisposalManifest = {
      id: nextManifestId(),
      wasteEntryId,
      status: 'PENDING',
      disposalRoute,
      contractor,
      manifestNumber,
      ...(treatmentFacility !== undefined && { treatmentFacility }),
      ...(cost !== undefined && { cost }),
      ...(notes !== undefined && { notes }),
    };
    this.manifests.set(manifest.id, manifest);
    return manifest;
  }

  dispatch(id: string, collectedAt: string): DisposalManifest {
    const manifest = this.manifests.get(id);
    if (!manifest) throw new Error(`Manifest not found: ${id}`);
    manifest.status = 'IN_TRANSIT';
    manifest.collectedAt = collectedAt;
    return manifest;
  }

  deliver(id: string, deliveredAt: string, certificateNumber?: string): DisposalManifest {
    const manifest = this.manifests.get(id);
    if (!manifest) throw new Error(`Manifest not found: ${id}`);
    manifest.status = 'DELIVERED';
    manifest.deliveredAt = deliveredAt;
    if (certificateNumber !== undefined) {
      manifest.certificateNumber = certificateNumber;
    }
    return manifest;
  }

  reject(id: string, notes?: string): DisposalManifest {
    const manifest = this.manifests.get(id);
    if (!manifest) throw new Error(`Manifest not found: ${id}`);
    manifest.status = 'REJECTED';
    if (notes !== undefined) {
      manifest.notes = notes;
    }
    return manifest;
  }

  get(id: string): DisposalManifest | undefined {
    return this.manifests.get(id);
  }

  getAll(): DisposalManifest[] {
    return Array.from(this.manifests.values());
  }

  getByWasteEntry(wasteEntryId: string): DisposalManifest[] {
    return this.getAll().filter((m) => m.wasteEntryId === wasteEntryId);
  }

  getByStatus(status: ManifestStatus): DisposalManifest[] {
    return this.getAll().filter((m) => m.status === status);
  }

  getByRoute(route: DisposalRoute): DisposalManifest[] {
    return this.getAll().filter((m) => m.disposalRoute === route);
  }

  getByContractor(contractor: string): DisposalManifest[] {
    return this.getAll().filter((m) => m.contractor === contractor);
  }

  getInTransit(): DisposalManifest[] {
    return this.getAll().filter((m) => m.status === 'IN_TRANSIT');
  }

  getTotalCost(): number {
    return this.getAll().reduce((sum, m) => sum + (m.cost ?? 0), 0);
  }

  getCount(): number {
    return this.manifests.size;
  }
}
