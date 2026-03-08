'use client';
// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import React, { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { allCountries, type CountryData } from '@ims/regional-data';

const REGION_GROUPS: Record<string, string[]> = {
  ASEAN: ['SG', 'MY', 'ID', 'TH', 'PH', 'VN', 'BN', 'MM', 'KH', 'LA'],
  'East Asia': ['CN', 'JP', 'KR', 'HK', 'TW'],
  'South Asia': ['IN', 'BD', 'LK'],
  Pacific: ['AU', 'NZ', 'FJ', 'PG'],
  'Middle East': ['AE', 'SA'],
};

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬',
  AU: '🇦🇺',
  NZ: '🇳🇿',
  MY: '🇲🇾',
  ID: '🇮🇩',
  TH: '🇹🇭',
  PH: '🇵🇭',
  VN: '🇻🇳',
  BN: '🇧🇳',
  MM: '🇲🇲',
  KH: '🇰🇭',
  LA: '🇱🇦',
  CN: '🇨🇳',
  JP: '🇯🇵',
  KR: '🇰🇷',
  HK: '🇭🇰',
  TW: '🇹🇼',
  IN: '🇮🇳',
  BD: '🇧🇩',
  LK: '🇱🇰',
  FJ: '🇫🇯',
  PG: '🇵🇬',
  AE: '🇦🇪',
  SA: '🇸🇦',
};

export interface CountrySelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  mode?: 'single' | 'multi';
  showRegionGroups?: boolean;
  showFlags?: boolean;
  filterByRegion?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

function getCountriesByRegion(
  filterRegion?: string
): { region: string; countries: CountryData[] }[] {
  return Object.entries(REGION_GROUPS)
    .filter(([region]) => !filterRegion || region === filterRegion)
    .map(([region, codes]) => ({
      region,
      countries: codes
        .map((code) => allCountries.find((c) => c.code === code))
        .filter((c): c is CountryData => c !== undefined),
    }));
}

function isSelected(value: string | string[], code: string): boolean {
  if (Array.isArray(value)) return value.includes(code);
  return value === code;
}

function getDisplayLabel(value: string | string[], showFlags: boolean): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value.length === 1) {
      const c = allCountries.find((x) => x.code === value[0]);
      if (!c) return value[0];
      return showFlags ? `${FLAG_EMOJIS[c.code] ?? ''} ${c.name}` : c.name;
    }
    return `${value.length} countries selected`;
  }
  if (!value) return '';
  const c = allCountries.find((x) => x.code === value);
  if (!c) return value;
  return showFlags ? `${FLAG_EMOJIS[c.code] ?? ''} ${c.name}` : c.name;
}

export function CountrySelector({
  value,
  onChange,
  mode = 'single',
  showRegionGroups = true,
  showFlags = true,
  filterByRegion,
  placeholder = 'Select country...',
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const regionGroups = getCountriesByRegion(filterByRegion);

  // Flatten all countries for keyboard navigation
  const allFiltered: CountryData[] = regionGroups
    .flatMap((g) => g.countries)
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (!open) {
      setSearch('');
      setFocusedIndex(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [disabled, open]);

  const handleSelect = useCallback(
    (code: string) => {
      if (mode === 'single') {
        onChange(code);
        setOpen(false);
        setSearch('');
      } else {
        const current = Array.isArray(value) ? value : [];
        if (current.includes(code)) {
          onChange(current.filter((c) => c !== code));
        } else {
          onChange([...current, code]);
        }
      }
    },
    [mode, onChange, value]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
          setTimeout(() => searchRef.current?.focus(), 50);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, allFiltered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allFiltered[focusedIndex]) {
            handleSelect(allFiltered[focusedIndex].code);
          }
          break;
      }
    },
    [open, allFiltered, focusedIndex, handleSelect]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayLabel = getDisplayLabel(value, showFlags);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={ariaLabel ?? 'Country selector'}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-controls="country-selector-listbox"
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 text-sm
          border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        <span className="truncate">
          {displayLabel || <span className="text-gray-400">{placeholder}</span>}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 w-full mt-1 bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
            overflow-hidden
          "
        >
          {/* Search box */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder="Search countries..."
              aria-label="Search countries"
              className="
                w-full px-2 py-1.5 text-sm
                bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                text-gray-900 dark:text-gray-100 placeholder-gray-400
              "
            />
          </div>

          {/* Multi-select count badge */}
          {mode === 'multi' && Array.isArray(value) && value.length > 0 && (
            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="ml-2 text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Country list */}
          <ul
            ref={listRef}
            id="country-selector-listbox"
            role="listbox"
            aria-multiselectable={mode === 'multi'}
            aria-label="Countries"
            className="max-h-64 overflow-y-auto py-1"
          >
            {allFiltered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No countries found
              </li>
            )}

            {showRegionGroups && !search
              ? regionGroups.map(({ region, countries }) => {
                  const filtered = countries.filter(
                    (c) =>
                      !search ||
                      c.name.toLowerCase().includes(search.toLowerCase()) ||
                      c.code.toLowerCase().includes(search.toLowerCase())
                  );
                  if (filtered.length === 0) return null;

                  return (
                    <li key={region}>
                      <div
                        className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50"
                        role="presentation"
                      >
                        {region}
                      </div>
                      <ul role="presentation">
                        {filtered.map((country, idx) => {
                          const globalIdx = allFiltered.indexOf(country);
                          const selected = isSelected(value, country.code);
                          return (
                            <CountryOption
                              key={country.code}
                              country={country}
                              selected={selected}
                              focused={globalIdx === focusedIndex}
                              showFlags={showFlags}
                              mode={mode}
                              onSelect={handleSelect}
                              onFocus={() => setFocusedIndex(globalIdx)}
                            />
                          );
                        })}
                      </ul>
                    </li>
                  );
                })
              : allFiltered.map((country, idx) => {
                  const selected = isSelected(value, country.code);
                  return (
                    <CountryOption
                      key={country.code}
                      country={country}
                      selected={selected}
                      focused={idx === focusedIndex}
                      showFlags={showFlags}
                      mode={mode}
                      onSelect={handleSelect}
                      onFocus={() => setFocusedIndex(idx)}
                    />
                  );
                })}
          </ul>
        </div>
      )}
    </div>
  );
}

interface CountryOptionProps {
  country: CountryData;
  selected: boolean;
  focused: boolean;
  showFlags: boolean;
  mode: 'single' | 'multi';
  onSelect: (code: string) => void;
  onFocus: () => void;
}

function CountryOption({
  country,
  selected,
  focused,
  showFlags,
  mode,
  onSelect,
  onFocus,
}: CountryOptionProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(country.code)}
      onMouseEnter={onFocus}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
        transition-colors select-none
        ${focused ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${selected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-900 dark:text-gray-100'}
        hover:bg-gray-100 dark:hover:bg-gray-700
      `}
    >
      {mode === 'multi' && (
        <span
          className={`
            flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
            ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-500'}
          `}
          aria-hidden="true"
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      )}
      {showFlags && (
        <span className="flex-shrink-0 text-base" aria-hidden="true">
          {FLAG_EMOJIS[country.code] ?? '🏳'}
        </span>
      )}
      <span className="flex-1 truncate">{country.name}</span>
      <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-mono">
        {country.code}
      </span>
    </li>
  );
}
