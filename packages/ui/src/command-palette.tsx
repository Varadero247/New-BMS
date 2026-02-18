'use client';

import * as React from 'react';
import { cn } from './utils';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category?: string;
  href?: string;
  keywords?: string[];
}

export interface CommandPaletteProps {
  /** Array of searchable items */
  items: CommandItem[];
  /** Called when an item is selected */
  onSelect: (item: CommandItem) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional className */
  className?: string;
}

export function CommandPalette({
  items,
  onSelect,
  placeholder = 'Search commands...',
  className,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Open on Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Auto-focus input and reset state when opened
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      return (
        item.label.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.category?.toLowerCase().includes(q) ?? false) ||
        (item.keywords?.some((kw) => kw.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [items, query]);

  // Group filtered items by category
  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filteredItems) {
      const cat = item.category ?? '';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [filteredItems]);

  // Flat list used for keyboard index tracking
  const flatFiltered = filteredItems;

  // Reset active index when filtered results change
  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  React.useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      onSelect(item);
      setOpen(false);
    },
    [onSelect]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatFiltered[activeIndex];
        if (item) handleSelect(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    },
    [flatFiltered, activeIndex, handleSelect, handleClose]
  );

  if (!open) return null;

  // Track flat index across categories for keyboard nav
  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      aria-modal="true"
      role="presentation"
      onClick={handleClose}
    >
      <div className="flex justify-center px-4">
        <div
          className={cn(
            'relative w-full max-w-xl mt-[20vh]',
            'bg-card border border-border rounded-xl shadow-2xl overflow-hidden',
            className
          )}
          role="dialog"
          aria-label="Command palette"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input row */}
          <div className="flex items-center border-b border-border">
            {/* Magnifying glass icon */}
            <svg
              className="ml-4 h-5 w-5 shrink-0 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={flatFiltered.length > 0}
              aria-controls="command-palette-list"
              aria-activedescendant={
                flatFiltered[activeIndex] ? `cmd-item-${flatFiltered[activeIndex].id}` : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'w-full px-4 py-3 bg-transparent',
                'text-lg text-foreground placeholder:text-muted-foreground',
                'focus:outline-none'
              )}
            />

            {/* ESC badge */}
            <kbd
              className={cn(
                'mr-4 shrink-0 hidden sm:inline-flex items-center',
                'rounded border border-border px-1.5 py-0.5',
                'text-[10px] font-mono text-muted-foreground'
              )}
            >
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto">
            {flatFiltered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found
                {query.trim() && (
                  <span>
                    {' '}
                    for &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;
                  </span>
                )}
              </div>
            ) : (
              <ul id="command-palette-list" ref={listRef} role="listbox" className="py-1">
                {Array.from(grouped.entries()).map(([category, catItems]) => (
                  <li key={category} role="presentation">
                    {/* Category header */}
                    {category && (
                      <div
                        className={cn(
                          'px-4 py-2',
                          'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                          'bg-muted'
                        )}
                        role="presentation"
                      >
                        {category}
                      </div>
                    )}

                    <ul role="presentation">
                      {catItems.map((item) => {
                        const currentIndex = flatIndex++;
                        const isActive = currentIndex === activeIndex;
                        const Icon = item.icon;

                        return (
                          <li
                            key={item.id}
                            id={`cmd-item-${item.id}`}
                            role="option"
                            aria-selected={isActive}
                            data-active={isActive ? 'true' : 'false'}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setActiveIndex(currentIndex)}
                              className={cn(
                                'w-full px-4 py-2.5 flex items-center gap-3 cursor-pointer text-left transition-colors',
                                isActive
                                  ? 'bg-brand-100 dark:bg-brand-900/30'
                                  : 'hover:bg-brand-50 dark:hover:bg-brand-900/20'
                              )}
                            >
                              {Icon && (
                                <Icon
                                  className={cn(
                                    'h-4 w-4 shrink-0',
                                    isActive ? 'text-foreground' : 'text-muted-foreground'
                                  )}
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>

                              {item.href && (
                                <svg
                                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                  />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer keyboard hints */}
          {flatFiltered.length > 0 && (
            <div
              className={cn(
                'flex items-center gap-4 px-4 py-2',
                'border-t border-border',
                'text-[10px] text-muted-foreground'
              )}
            >
              <span>
                <kbd className="font-mono border border-border rounded px-1 mr-0.5">↑↓</kbd>
                navigate
              </span>
              <span>
                <kbd className="font-mono border border-border rounded px-1 mr-0.5">↵</kbd>
                select
              </span>
              <span>
                <kbd className="font-mono border border-border rounded px-1 mr-0.5">esc</kbd>
                close
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
