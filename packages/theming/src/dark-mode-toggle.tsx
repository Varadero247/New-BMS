'use client';
// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import React from 'react';
import { useDarkMode } from './dark-mode';
import type { ColorMode } from './dark-mode';

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

function SunIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Cycle order: light → dark → system → light …
// ---------------------------------------------------------------------------
const CYCLE: ColorMode[] = ['light', 'dark', 'system'];

function nextMode(current: ColorMode): ColorMode {
  const idx = CYCLE.indexOf(current);
  return CYCLE[(idx + 1) % CYCLE.length];
}

const MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System mode',
};

// ---------------------------------------------------------------------------
// DarkModeToggle
// ---------------------------------------------------------------------------

export interface DarkModeToggleProps {
  className?: string;
}

/**
 * A button that cycles through light → dark → system modes.
 * Renders the appropriate icon (Sun / Moon / Monitor) for the current mode.
 */
export function DarkModeToggle({ className }: DarkModeToggleProps): React.ReactElement {
  const { mode, setMode } = useDarkMode();

  const handleClick = () => {
    setMode(nextMode(mode));
  };

  const label = MODE_LABELS[mode];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={className}
    >
      {mode === 'light' && <SunIcon />}
      {mode === 'dark' && <MoonIcon />}
      {mode === 'system' && <MonitorIcon />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// DarkModeSelect
// ---------------------------------------------------------------------------

export interface DarkModeSelectProps {
  className?: string;
}

/**
 * A <select> dropdown with Light / Dark / System options.
 */
export function DarkModeSelect({ className }: DarkModeSelectProps): React.ReactElement {
  const { mode, setMode } = useDarkMode();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as ColorMode);
  };

  return (
    <select
      aria-label="Color mode"
      value={mode}
      onChange={handleChange}
      className={className}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
