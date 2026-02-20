'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_THEME, type ThemeConfig, type ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
  error: null,
  updateTheme: () => {},
});

/** Map ThemeConfig fields to CSS custom properties */
function applyThemeVars(theme: ThemeConfig) {
  const root = document.documentElement;

  root.style.setProperty('--accent-primary', theme.primaryColor);
  root.style.setProperty('--accent-secondary', theme.accentColor);
  if (theme.backgroundColor) root.style.setProperty('--bg-page', theme.backgroundColor);
  if (theme.surfaceColor) root.style.setProperty('--bg-surface', theme.surfaceColor);
  if (theme.textColor) root.style.setProperty('--text-primary', theme.textColor);
  if (theme.sidebarColor) root.style.setProperty('--bg-sidebar', theme.sidebarColor);
  if (theme.borderRadius !== undefined)
    root.style.setProperty('--radius', `${theme.borderRadius}px`);
  if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily);

  // Update favicon
  if (theme.favicon) {
    const link =
      document.querySelector<HTMLLinkElement>("link[rel*='icon']") ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = theme.favicon;
    document.head.appendChild(link);
  }

  // Update page title with brand name
  if (theme.brandName) {
    const titleParts = document.title.split(' | ');
    document.title =
      titleParts.length > 1 ? `${titleParts[0]} | ${theme.brandName}` : theme.brandName;
  }

  // Inject custom CSS
  if (theme.customCSS) {
    let style = document.getElementById('ims-custom-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ims-custom-theme';
      document.head.appendChild(style);
    }
    style.textContent = theme.customCSS;
  }
}

interface ThemingProviderProps {
  children: ReactNode;
  /** Gateway API URL for fetching org branding */
  apiUrl?: string;
  /** Optional static theme override (skips API fetch) */
  staticTheme?: Partial<ThemeConfig>;
}

export function ThemingProvider({ children, apiUrl, staticTheme }: ThemingProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staticTheme) {
      const merged = { ...DEFAULT_THEME, ...staticTheme };
      setTheme(merged);
      applyThemeVars(merged);
      setLoading(false);
      return;
    }

    // Try to load cached theme first for instant render
    const cached = localStorage.getItem('nexara-org-branding');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ThemeConfig;
        setTheme(parsed);
        applyThemeVars(parsed);
      } catch {
        // Ignore invalid cache
      }
    }

    // Fetch org branding from gateway MSP endpoint
    async function fetchTheme() {
      const token = localStorage.getItem('token');
      if (!token || !apiUrl) {
        setTheme(DEFAULT_THEME);
        applyThemeVars(DEFAULT_THEME);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/organisations/msp-branding`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          const branding = json.data || {};
          const merged: ThemeConfig = {
            ...DEFAULT_THEME,
            ...(branding.primaryColor && { primaryColor: branding.primaryColor }),
            ...(branding.accentColor && { accentColor: branding.accentColor }),
            ...(branding.logoUrl && { logoUrl: branding.logoUrl }),
            ...(branding.brandName && { brandName: branding.brandName }),
            ...(branding.favicon && { favicon: branding.favicon }),
            ...(branding.customCSS && { customCSS: branding.customCSS }),
          };
          setTheme(merged);
          applyThemeVars(merged);
          localStorage.setItem('nexara-org-branding', JSON.stringify(merged));
        } else {
          setTheme(DEFAULT_THEME);
          applyThemeVars(DEFAULT_THEME);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load theme');
        setTheme(DEFAULT_THEME);
        applyThemeVars(DEFAULT_THEME);
      } finally {
        setLoading(false);
      }
    }

    fetchTheme();
  }, [apiUrl, staticTheme]);

  const updateTheme = useCallback((partial: Partial<ThemeConfig>) => {
    setTheme((prev: ThemeConfig | null) => {
      const updated = { ...(prev || DEFAULT_THEME), ...partial };
      applyThemeVars(updated);
      localStorage.setItem('nexara-org-branding', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, error, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
