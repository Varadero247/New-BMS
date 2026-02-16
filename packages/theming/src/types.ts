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
  primaryColor: '#2563eb',
  accentColor: '#7c3aed',
  logoUrl: '/logo.svg',
  brandName: 'IMS Platform',
  favicon: '/favicon.ico',
  customCSS: '',
  backgroundColor: '#f8fafc',
  surfaceColor: '#ffffff',
  textColor: '#111827',
  sidebarColor: '#1e293b',
  borderRadius: 8,
  fontFamily: 'Inter, system-ui, sans-serif',
};
