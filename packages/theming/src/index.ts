// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { ThemingProvider, useTheme } from './provider';
export { DEFAULT_THEME } from './types';
export type { ThemeConfig, ThemeContextValue } from './types';
export { useDarkMode, useColorMode, applyColorMode, getSystemPreference, getStoredMode, resolveMode } from './dark-mode';
export { DarkModeToggle, DarkModeSelect } from './dark-mode-toggle';
export { getDarkModeScript } from './dark-mode-script';
export type { ColorMode } from './dark-mode';
