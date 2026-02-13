'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from './utils';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  href: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface GlobalSearchProps {
  /** Async function called when query changes (debounced) */
  onSearch: (query: string) => Promise<SearchResult[]>;
  /** Called when a result is selected */
  onSelect: (result: SearchResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional className */
  className?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
}

export function GlobalSearch({
  onSearch,
  onSelect,
  placeholder = 'Search across all modules...',
  className,
  debounceMs = 250,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await onSearch(query.trim());
        setResults(res);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, onSearch, debounceMs]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onSelect(results[selectedIndex]);
        setOpen(false);
      }
    },
    [results, selectedIndex, onSelect]
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelect(result);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5',
          'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm',
          'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
          className
        )}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
              <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={results[selectedIndex] ? `search-result-${results[selectedIndex].id}` : undefined}
                aria-autocomplete="list"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 py-3 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              {loading && (
                <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <kbd className="text-[10px] font-mono text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && query.trim() && !loading ? (
                <div className="p-8 text-center text-sm text-gray-500">No results found for &ldquo;{query}&rdquo;</div>
              ) : (
                <ul id="search-results" role="listbox" className="py-2">
                  {results.map((result, i) => (
                    <li key={result.id} id={`search-result-${result.id}`} role="option" aria-selected={i === selectedIndex}>
                      <button
                        type="button"
                        onClick={() => handleSelect(result)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                          i === selectedIndex
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        {result.icon && <span className="shrink-0">{result.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          {result.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.description}</div>
                          )}
                        </div>
                        {result.category && (
                          <span className="shrink-0 text-[10px] font-medium text-gray-400 uppercase">{result.category}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-400">
                <span><kbd className="font-mono border rounded px-1">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono border rounded px-1">↵</kbd> select</span>
                <span><kbd className="font-mono border rounded px-1">esc</kbd> close</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
