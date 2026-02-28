// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import {
  Checklist,
  ChecklistItem,
  ChecklistStatus,
  InspectionCategory,
  ItemResult,
} from './types';

let _clIdCounter = 0;
let _itemIdCounter = 0;

function generateChecklistId(): string {
  _clIdCounter += 1;
  return `cl-${Date.now()}-${_clIdCounter}`;
}

function generateItemId(): string {
  _itemIdCounter += 1;
  return `item-${Date.now()}-${_itemIdCounter}`;
}

export class ChecklistManager {
  private checklists: Map<string, Checklist> = new Map();
  private items: Map<string, ChecklistItem> = new Map();

  create(
    title: string,
    category: InspectionCategory,
    createdBy: string,
    createdAt: string,
  ): Checklist {
    const id = generateChecklistId();
    const checklist: Checklist = {
      id,
      title,
      category,
      status: 'DRAFT',
      version: 1,
      items: [],
      createdBy,
      createdAt,
    };
    this.checklists.set(id, checklist);
    return checklist;
  }

  activate(id: string): Checklist {
    const checklist = this.checklists.get(id);
    if (!checklist) throw new Error(`Checklist not found: ${id}`);
    checklist.status = 'ACTIVE';
    return checklist;
  }

  retire(id: string): Checklist {
    const checklist = this.checklists.get(id);
    if (!checklist) throw new Error(`Checklist not found: ${id}`);
    checklist.status = 'RETIRED';
    return checklist;
  }

  addItem(
    checklistId: string,
    description: string,
    required: boolean,
    order?: number,
  ): ChecklistItem {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist not found: ${checklistId}`);

    const resolvedOrder =
      order !== undefined ? order : checklist.items.length + 1;

    const itemId = generateItemId();
    const item: ChecklistItem = {
      id: itemId,
      checklistId,
      order: resolvedOrder,
      description,
      required,
    };
    this.items.set(itemId, item);
    checklist.items.push(item);
    return item;
  }

  recordResult(itemId: string, result: ItemResult, notes?: string): ChecklistItem {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);
    item.result = result;
    if (notes !== undefined) item.notes = notes;
    return item;
  }

  getByCategory(category: InspectionCategory): Checklist[] {
    return Array.from(this.checklists.values()).filter((c) => c.category === category);
  }

  getByStatus(status: ChecklistStatus): Checklist[] {
    return Array.from(this.checklists.values()).filter((c) => c.status === status);
  }

  getActive(): Checklist[] {
    return this.getByStatus('ACTIVE');
  }

  getPassRate(checklistId: string): number {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist not found: ${checklistId}`);

    const withResult = checklist.items.filter(
      (item) => item.result !== undefined && item.result !== 'N_A',
    );
    if (withResult.length === 0) return 0;

    const passCount = withResult.filter((item) => item.result === 'PASS').length;
    return (passCount / withResult.length) * 100;
  }

  getFailedItems(checklistId: string): ChecklistItem[] {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) throw new Error(`Checklist not found: ${checklistId}`);
    return checklist.items.filter((item) => item.result === 'FAIL');
  }

  get(id: string): Checklist | undefined {
    return this.checklists.get(id);
  }

  getAll(): Checklist[] {
    return Array.from(this.checklists.values());
  }

  getCount(): number {
    return this.checklists.size;
  }
}
