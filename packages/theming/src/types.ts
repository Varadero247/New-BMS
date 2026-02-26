// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface ThemeConfig {
  /** Primary brand color (hex) */
  primaryColor: string;
  /** Accent/secondary color (hex) */
  accentColor: string;
  /** Logo URL (displayed in sidebar/header) */
  logoUrl: string;
  /** Organisation/brand name */
  brandName: string;
  /** Favicon URL */
  favicon: string;
  /** Custom CSS to inject (scoped to :root) */
  customCSS: string;
  /** Background color override */
  backgroundColor?: string;
  /** Surface/card background */
  surfaceColor?: string;
  /** Text primary color */
  textColor?: string;
  /** Sidebar background */
  sidebarColor?: string;
  /** Border radius (px) */
  borderRadius?: number;
  /** Font family override */
  fontFamily?: string;
}

export interface ThemeContextValue {
  theme: ThemeConfig | null;
  loading: boolean;
  error: string | null;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#3B78F5',
  accentColor: '#00C4A8',
  logoUrl: '/logo.svg',
  brandName: 'IMS Platform',
  favicon: '/favicon.ico',
  customCSS: '',
  // Do NOT set backgroundColor/surfaceColor/textColor/sidebarColor/fontFamily here.
  // These are controlled by the dark/light mode CSS token system (tokens.css + ThemeSwitch).
  // Overriding them here with hardcoded values breaks dark mode.
};
