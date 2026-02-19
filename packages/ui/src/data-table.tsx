'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from './utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Render cell content. Receives the row item. */
  render?: (item: T) => React.ReactNode;
  /** If true, column is sortable */
  sortable?: boolean;
  /** If true, column is hidden by default */
  defaultHidden?: boolean;
  /** Column width class */
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Unique key extractor */
  keyExtractor: (item: T) => string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable bulk selection */
  selectable?: boolean;
  /** Called when selection changes */
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  /** Enable column visibility toggle */
  columnToggle?: boolean;
  /** Row expansion render function */
  expandedRender?: (item: T) => React.ReactNode;
  /** Called when sort changes */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Current sort state (controlled) */
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  /** Additional class */
  className?: string;
  /** Actions slot rendered above the table */
  actions?: React.ReactNode;
}

function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  return (
    <svg
      className={cn('h-4 w-4 inline-block ml-1', active ? 'text-blue-600' : 'text-gray-300')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      ) : direction === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4 4 4-4" />
        </>
      )}
    </svg>
  );
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data found',
  selectable = false,
  onSelectionChange,
  columnToggle = false,
  expandedRender,
  onSort,
  sortKey,
  sortDirection,
  className,
  actions,
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns]
  );

  const allSelected = data.length > 0 && data.every((item) => selectedKeys.has(keyExtractor(item)));

  const handleSelectAll = useCallback(() => {
    const newKeys = allSelected ? new Set<string>() : new Set(data.map(keyExtractor));
    setSelectedKeys(newKeys);
    onSelectionChange?.(newKeys);
  }, [allSelected, data, keyExtractor, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const handleToggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;
      const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    },
    [onSort, sortKey, sortDirection]
  );

  const handleToggleColumn = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (expandedRender ? 1 : 0);

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      {(actions || columnToggle || (selectable && selectedKeys.size > 0)) && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            {selectable && selectedKeys.size > 0 && (
              <span className="text-xs text-gray-500">{selectedKeys.size} selected</span>
            )}
            {actions}
          </div>
          {columnToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnMenu((o) => !o)}
                className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Columns
              </button>
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[160px]">
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col.key)}
                        onChange={() => handleToggleColumn(col.key)}
                        className="h-3.5 w-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">{col.header}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {selectable && (
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded text-blue-600"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {expandedRender && <th className="w-10 p-3" />}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left p-3 font-medium text-gray-700 dark:text-gray-300',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-900',
                    col.className
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable && sortKey === col.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.header}
                  {col.sortable && (
                    <SortIcon
                      active={sortKey === col.key}
                      direction={sortKey === col.key ? sortDirection : undefined}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && (
                    <td className="p-3">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  )}
                  {expandedRender && <td className="p-3" />}
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="p-3">
                      <div
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="p-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const key = keyExtractor(item);
                const isExpanded = expandedKeys.has(key);
                return (
                  <>
                    {/* Fragment key on outer element */}
                    <tr
                      key={key}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {selectable && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedKeys.has(key)}
                            onChange={() => handleSelectRow(key)}
                            className="h-4 w-4 rounded text-blue-600"
                            aria-label={`Select row ${key}`}
                          />
                        </td>
                      )}
                      {expandedRender && (
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleExpand(key)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            <svg
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td key={col.key} className={cn('p-3', col.className)}>
                          {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                    {expandedRender && isExpanded && (
                      <tr key={`${key}-expanded`}>
                        <td colSpan={colSpan} className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30">
                          {expandedRender(item)}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
