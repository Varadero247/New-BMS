// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import {
  WasteEntry,
  WasteStream,
  WasteState,
  WasteStatus,
  HazardClass,
} from './types';

let _idCounter = 0;
function nextId(): string {
  return `WE-${String(++_idCounter).padStart(6, '0')}`;
}

export class WasteRegister {
  private entries: Map<string, WasteEntry> = new Map();

  generate(
    stream: WasteStream,
    state: WasteState,
    description: string,
    quantity: number,
    unit: string,
    generatedAt: string,
    generatedBy: string,
    location: string,
    hazardClass?: HazardClass,
    ewcCode?: string,
    notes?: string,
  ): WasteEntry {
    const entry: WasteEntry = {
      id: nextId(),
      stream,
      state,
      status: 'GENERATED',
      description,
      quantity,
      unit,
      generatedAt,
      generatedBy,
      location,
      ...(hazardClass !== undefined && { hazardClass }),
      ...(ewcCode !== undefined && { ewcCode }),
      ...(notes !== undefined && { notes }),
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  store(id: string, storageLocation: string): WasteEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`WasteEntry not found: ${id}`);
    entry.status = 'STORED';
    entry.storageLocation = storageLocation;
    return entry;
  }

  collect(id: string): WasteEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`WasteEntry not found: ${id}`);
    entry.status = 'COLLECTED';
    return entry;
  }

  dispose(id: string): WasteEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`WasteEntry not found: ${id}`);
    entry.status = 'DISPOSED';
    return entry;
  }

  get(id: string): WasteEntry | undefined {
    return this.entries.get(id);
  }

  getAll(): WasteEntry[] {
    return Array.from(this.entries.values());
  }

  getByStream(stream: WasteStream): WasteEntry[] {
    return this.getAll().filter((e) => e.stream === stream);
  }

  getByStatus(status: WasteStatus): WasteEntry[] {
    return this.getAll().filter((e) => e.status === status);
  }

  getByLocation(location: string): WasteEntry[] {
    return this.getAll().filter((e) => e.location === location);
  }

  getHazardous(): WasteEntry[] {
    return this.getAll().filter((e) => e.hazardClass !== undefined);
  }

  getPendingDisposal(): WasteEntry[] {
    return this.getAll().filter(
      (e) => e.status === 'GENERATED' || e.status === 'STORED',
    );
  }

  getTotalByStream(stream: WasteStream): number {
    return this.getByStream(stream).reduce((sum, e) => sum + e.quantity, 0);
  }

  getCount(): number {
    return this.entries.size;
  }
}
