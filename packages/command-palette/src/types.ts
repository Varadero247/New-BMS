// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type CommandCategory = 'actions' | 'navigation' | 'search' | 'settings' | 'recent';

export interface Command {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  category: CommandCategory;
  icon?: string; // icon name string (render in consumer)
  shortcut?: string; // display shortcut e.g. "G then D"
  action: () => void;
  disabled?: boolean;
  badge?: string;
}

export interface CommandGroup {
  heading: string;
  commands: Command[];
}

export interface CommandPaletteState {
  open: boolean;
  query: string;
  selectedIndex: number;
}

export interface CommandPaletteOptions {
  /** Max number of recent commands to remember */
  maxRecent?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Custom command groups to add */
  extraCommands?: Command[];
}

export interface SearchResult {
  command: Command;
  score: number;
  matchedQuery: string;
}
