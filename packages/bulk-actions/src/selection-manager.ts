// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { BulkSelection } from './types';

export interface SelectionManager<T extends { id: string }> {
  select(id: string): void;
  deselect(id: string): void;
  toggle(id: string): void;
  selectAll(): void;
  deselectAll(): void;
  isSelected(id: string): boolean;
  getSelection(): BulkSelection<T>;
  getCount(): number;
  isAllSelected(): boolean;
  isPartialSelected(): boolean;
}

/**
 * Creates a new SelectionManager for a list of items.
 * All operations are pure / synchronous. No React.
 */
export function createSelectionManager<T extends { id: string }>(
  items: T[]
): SelectionManager<T> {
  const selectedIds = new Set<string>();

  const getSelectedItems = (): T[] =>
    items.filter((item) => selectedIds.has(item.id));

  return {
    select(id: string): void {
      if (items.some((i) => i.id === id)) {
        selectedIds.add(id);
      }
    },

    deselect(id: string): void {
      selectedIds.delete(id);
    },

    toggle(id: string): void {
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
      } else if (items.some((i) => i.id === id)) {
        selectedIds.add(id);
      }
    },

    selectAll(): void {
      items.forEach((i) => selectedIds.add(i.id));
    },

    deselectAll(): void {
      selectedIds.clear();
    },

    isSelected(id: string): boolean {
      return selectedIds.has(id);
    },

    getSelection(): BulkSelection<T> {
      const selectedItems = getSelectedItems();
      return {
        selectedIds: new Set(selectedIds),
        selectedItems,
        allSelected: items.length > 0 && selectedIds.size === items.length,
        count: selectedIds.size,
      };
    },

    getCount(): number {
      return selectedIds.size;
    },

    isAllSelected(): boolean {
      return items.length > 0 && selectedIds.size === items.length;
    },

    isPartialSelected(): boolean {
      return selectedIds.size > 0 && selectedIds.size < items.length;
    },
  };
}
