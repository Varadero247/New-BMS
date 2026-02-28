// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

export type WasteStream = 'GENERAL' | 'RECYCLABLE' | 'HAZARDOUS' | 'CLINICAL' | 'ELECTRONIC' | 'ORGANIC' | 'CONSTRUCTION';
export type WasteState = 'SOLID' | 'LIQUID' | 'GAS' | 'SLUDGE';
export type DisposalRoute = 'LANDFILL' | 'INCINERATION' | 'RECYCLING' | 'COMPOSTING' | 'TREATMENT' | 'REUSE' | 'RECOVERY';
export type WasteStatus = 'GENERATED' | 'STORED' | 'COLLECTED' | 'DISPOSED';
export type ManifestStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'REJECTED';
export type HazardClass = 'CLASS_1' | 'CLASS_2' | 'CLASS_3' | 'CLASS_4' | 'CLASS_5' | 'CLASS_6' | 'CLASS_7' | 'CLASS_8' | 'CLASS_9';

export interface WasteEntry {
  id: string;
  stream: WasteStream;
  state: WasteState;
  status: WasteStatus;
  description: string;
  quantity: number;
  unit: string;
  generatedAt: string;
  generatedBy: string;
  location: string;
  hazardClass?: HazardClass;
  ewcCode?: string;
  storageLocation?: string;
  notes?: string;
}

export interface DisposalManifest {
  id: string;
  wasteEntryId: string;
  status: ManifestStatus;
  disposalRoute: DisposalRoute;
  contractor: string;
  manifestNumber: string;
  collectedAt?: string;
  deliveredAt?: string;
  treatmentFacility?: string;
  cost?: number;
  certificateNumber?: string;
  notes?: string;
}
