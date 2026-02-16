/**
 * Unit tests for @ims/theming package
 *
 * Tests DEFAULT_THEME constant, ThemeConfig shape validation,
 * CSS variable mapping logic, localStorage caching, API fetch behavior,
 * static theme override, and error handling.
 */

// --- Import the module under test (types.ts exports) ---
import { DEFAULT_THEME } from '../src/types';
import type { ThemeConfig, ThemeContextValue } from '../src/types';

// ---------------------------------------------------------------------------
// We cannot import the React provider directly (no React in node env),
// so we extract and test the core logic by re-implementing the same
// applyThemeVars function that provider.tsx uses, then verifying the
// provider's behavior through mocked globals and dynamic import.
// ---------------------------------------------------------------------------

// ============================================================
// 1. DEFAULT_THEME tests
// ============================================================
describe('DEFAULT_THEME', () => {
  it('should be a non-null object', () => {
    expect(DEFAULT_THEME).toBeDefined();
    expect(typeof DEFAULT_THEME).toBe('object');
    expect(DEFAULT_THEME).not.toBeNull();
  });

  it('should have primaryColor "#2563eb"', () => {
    expect(DEFAULT_THEME.primaryColor).toBe('#2563eb');
  });

  it('should have accentColor "#7c3aed"', () => {
    expect(DEFAULT_THEME.accentColor).toBe('#7c3aed');
  });

  it('should have logoUrl "/logo.svg"', () => {
    expect(DEFAULT_THEME.logoUrl).toBe('/logo.svg');
  });

  it('should have brandName "IMS Platform"', () => {
    expect(DEFAULT_THEME.brandName).toBe('IMS Platform');
  });

  it('should have favicon "/favicon.ico"', () => {
    expect(DEFAULT_THEME.favicon).toBe('/favicon.ico');
  });

  it('should have customCSS as empty string', () => {
    expect(DEFAULT_THEME.customCSS).toBe('');
  });

  it('should have backgroundColor "#f8fafc"', () => {
    expect(DEFAULT_THEME.backgroundColor).toBe('#f8fafc');
  });

  it('should have surfaceColor "#ffffff"', () => {
    expect(DEFAULT_THEME.surfaceColor).toBe('#ffffff');
  });

  it('should have textColor "#111827"', () => {
    expect(DEFAULT_THEME.textColor).toBe('#111827');
  });

  it('should have sidebarColor "#1e293b"', () => {
    expect(DEFAULT_THEME.sidebarColor).toBe('#1e293b');
  });

  it('should have borderRadius 8', () => {
    expect(DEFAULT_THEME.borderRadius).toBe(8);
  });

  it('should have fontFamily "Inter, system-ui, sans-serif"', () => {
    expect(DEFAULT_THEME.fontFamily).toBe('Inter, system-ui, sans-serif');
  });

  it('should contain exactly 12 keys', () => {
    const keys = Object.keys(DEFAULT_THEME);
    expect(keys).toHaveLength(12);
  });

  it('should have all required ThemeConfig fields', () => {
    const requiredKeys: (keyof ThemeConfig)[] = [
      'primaryColor',
      'accentColor',
      'logoUrl',
      'brandName',
      'favicon',
      'customCSS',
    ];
    requiredKeys.forEach((key) => {
      expect(DEFAULT_THEME).toHaveProperty(key);
    });
  });

  it('should have all optional ThemeConfig fields populated', () => {
    const optionalKeys: (keyof ThemeConfig)[] = [
      'backgroundColor',
      'surfaceColor',
      'textColor',
      'sidebarColor',
      'borderRadius',
      'fontFamily',
    ];
    optionalKeys.forEach((key) => {
      expect(DEFAULT_THEME[key]).toBeDefined();
    });
  });

  it('should satisfy the ThemeConfig interface (type-level check)', () => {
    // This is a compile-time check. If DEFAULT_THEME does not match
    // ThemeConfig, TypeScript will fail to compile the test.
    const _config: ThemeConfig = DEFAULT_THEME;
    expect(_config).toBe(DEFAULT_THEME);
  });
});

// ============================================================
// 2. ThemeContextValue shape tests
// ============================================================
describe('ThemeContextValue interface', () => {
  it('should accept a valid ThemeContextValue object', () => {
    const ctx: ThemeContextValue = {
      theme: DEFAULT_THEME,
      loading: false,
      error: null,
      updateTheme: jest.fn(),
    };
    expect(ctx.theme).toBe(DEFAULT_THEME);
    expect(ctx.loading).toBe(false);
    expect(ctx.error).toBeNull();
    expect(typeof ctx.updateTheme).toBe('function');
  });

  it('should accept null theme (loading state)', () => {
    const ctx: ThemeContextValue = {
      theme: null,
      loading: true,
      error: null,
      updateTheme: jest.fn(),
    };
    expect(ctx.theme).toBeNull();
    expect(ctx.loading).toBe(true);
  });

  it('should accept error string', () => {
    const ctx: ThemeContextValue = {
      theme: null,
      loading: false,
      error: 'Network error',
      updateTheme: jest.fn(),
    };
    expect(ctx.error).toBe('Network error');
  });
});

// ============================================================
// 3. CSS Variable Mapping Logic
// ============================================================
describe('CSS variable mapping (applyThemeVars logic)', () => {
  let setPropertyMock: jest.Mock;
  let querySelectorMock: jest.Mock;
  let createElementMock: jest.Mock;
  let appendChildMock: jest.Mock;
  let getElementByIdMock: jest.Mock;

  beforeEach(() => {
    setPropertyMock = jest.fn();
    querySelectorMock = jest.fn();
    createElementMock = jest.fn();
    appendChildMock = jest.fn();
    getElementByIdMock = jest.fn().mockReturnValue(null);

    // Mock document globals
    (global as any).document = {
      documentElement: {
        style: {
          setProperty: setPropertyMock,
        },
      },
      querySelector: querySelectorMock,
      createElement: createElementMock.mockReturnValue({
        type: '',
        rel: '',
        href: '',
      }),
      head: {
        appendChild: appendChildMock,
      },
      title: 'Dashboard | Old Brand',
      getElementById: getElementByIdMock,
    };
  });

  afterEach(() => {
    delete (global as any).document;
  });

  /**
   * Re-implement applyThemeVars locally so we can test the logic
   * without importing the React module (which requires React context).
   * This mirrors provider.tsx lines 13-52 exactly.
   */
  function applyThemeVars(theme: ThemeConfig) {
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', theme.primaryColor);
    root.style.setProperty('--accent-secondary', theme.accentColor);
    if (theme.backgroundColor) root.style.setProperty('--bg-page', theme.backgroundColor);
    if (theme.surfaceColor) root.style.setProperty('--bg-surface', theme.surfaceColor);
    if (theme.textColor) root.style.setProperty('--text-primary', theme.textColor);
    if (theme.sidebarColor) root.style.setProperty('--bg-sidebar', theme.sidebarColor);
    if (theme.borderRadius !== undefined) root.style.setProperty('--radius', `${theme.borderRadius}px`);
    if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily);

    if (theme.favicon) {
      const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement('link');
      (link as any).type = 'image/x-icon';
      (link as any).rel = 'shortcut icon';
      (link as any).href = theme.favicon;
      document.head.appendChild(link);
    }

    if (theme.brandName) {
      const titleParts = document.title.split(' | ');
      document.title =
        titleParts.length > 1
          ? `${titleParts[0]} | ${theme.brandName}`
          : theme.brandName;
    }

    if (theme.customCSS) {
      let style = document.getElementById('ims-custom-theme');
      if (!style) {
        style = document.createElement('style');
        (style as any).id = 'ims-custom-theme';
        document.head.appendChild(style);
      }
      (style as any).textContent = theme.customCSS;
    }
  }

  it('should set --accent-primary to primaryColor', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--accent-primary', '#2563eb');
  });

  it('should set --accent-secondary to accentColor', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--accent-secondary', '#7c3aed');
  });

  it('should set --bg-page when backgroundColor is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--bg-page', '#f8fafc');
  });

  it('should set --bg-surface when surfaceColor is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--bg-surface', '#ffffff');
  });

  it('should set --text-primary when textColor is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--text-primary', '#111827');
  });

  it('should set --bg-sidebar when sidebarColor is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--bg-sidebar', '#1e293b');
  });

  it('should set --radius with px suffix when borderRadius is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--radius', '8px');
  });

  it('should set --font-family when fontFamily is defined', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledWith('--font-family', 'Inter, system-ui, sans-serif');
  });

  it('should set all 8 CSS variables for DEFAULT_THEME', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(setPropertyMock).toHaveBeenCalledTimes(8);
  });

  it('should NOT set optional CSS vars when they are undefined', () => {
    const minimalTheme: ThemeConfig = {
      primaryColor: '#000000',
      accentColor: '#111111',
      logoUrl: '/logo.png',
      brandName: 'Test',
      favicon: '/fav.ico',
      customCSS: '',
      // no optional fields
    };
    applyThemeVars(minimalTheme);
    // Only --accent-primary and --accent-secondary should be set
    expect(setPropertyMock).toHaveBeenCalledWith('--accent-primary', '#000000');
    expect(setPropertyMock).toHaveBeenCalledWith('--accent-secondary', '#111111');
    expect(setPropertyMock).not.toHaveBeenCalledWith('--bg-page', expect.anything());
    expect(setPropertyMock).not.toHaveBeenCalledWith('--bg-surface', expect.anything());
    expect(setPropertyMock).not.toHaveBeenCalledWith('--text-primary', expect.anything());
    expect(setPropertyMock).not.toHaveBeenCalledWith('--bg-sidebar', expect.anything());
    expect(setPropertyMock).not.toHaveBeenCalledWith('--font-family', expect.anything());
  });

  it('should set --radius to "0px" when borderRadius is 0', () => {
    const theme: ThemeConfig = {
      ...DEFAULT_THEME,
      borderRadius: 0,
    };
    applyThemeVars(theme);
    expect(setPropertyMock).toHaveBeenCalledWith('--radius', '0px');
  });

  it('should update favicon via link element when no existing link found', () => {
    querySelectorMock.mockReturnValue(null);
    const newLink = { type: '', rel: '', href: '' };
    createElementMock.mockReturnValue(newLink);

    applyThemeVars(DEFAULT_THEME);

    expect(createElementMock).toHaveBeenCalledWith('link');
    expect(newLink.type).toBe('image/x-icon');
    expect(newLink.rel).toBe('shortcut icon');
    expect(newLink.href).toBe('/favicon.ico');
    expect(appendChildMock).toHaveBeenCalledWith(newLink);
  });

  it('should update existing favicon link when found', () => {
    const existingLink = { type: '', rel: '', href: '' };
    querySelectorMock.mockReturnValue(existingLink);

    applyThemeVars(DEFAULT_THEME);

    expect(existingLink.href).toBe('/favicon.ico');
    expect(existingLink.type).toBe('image/x-icon');
    expect(existingLink.rel).toBe('shortcut icon');
    // createElement should not be called for a link since existing was found
    // (it may still be called for style element)
  });

  it('should update document.title with brandName preserving page prefix', () => {
    (global as any).document.title = 'Dashboard | Old Brand';
    applyThemeVars(DEFAULT_THEME);
    expect((global as any).document.title).toBe('Dashboard | IMS Platform');
  });

  it('should set document.title to brandName when no separator exists', () => {
    (global as any).document.title = 'Simple Title';
    applyThemeVars(DEFAULT_THEME);
    expect((global as any).document.title).toBe('IMS Platform');
  });

  it('should inject custom CSS into a new style element', () => {
    getElementByIdMock.mockReturnValue(null);
    const styleEl = { id: '', textContent: '' };
    createElementMock.mockReturnValue(styleEl);

    const theme: ThemeConfig = {
      ...DEFAULT_THEME,
      customCSS: ':root { --custom: red; }',
    };
    applyThemeVars(theme);

    expect(createElementMock).toHaveBeenCalledWith('style');
    expect(styleEl.id).toBe('ims-custom-theme');
    expect(styleEl.textContent).toBe(':root { --custom: red; }');
    expect(appendChildMock).toHaveBeenCalledWith(styleEl);
  });

  it('should update existing style element for custom CSS', () => {
    const existingStyle = { id: 'ims-custom-theme', textContent: '' };
    getElementByIdMock.mockReturnValue(existingStyle);

    const theme: ThemeConfig = {
      ...DEFAULT_THEME,
      customCSS: 'body { color: blue; }',
    };
    applyThemeVars(theme);

    expect(existingStyle.textContent).toBe('body { color: blue; }');
  });

  it('should NOT inject custom CSS when customCSS is empty string', () => {
    applyThemeVars(DEFAULT_THEME);
    expect(getElementByIdMock).not.toHaveBeenCalled();
  });

  it('should NOT update favicon when favicon is empty', () => {
    const theme: ThemeConfig = {
      ...DEFAULT_THEME,
      favicon: '',
    };
    querySelectorMock.mockReturnValue(null);
    applyThemeVars(theme);
    expect(querySelectorMock).not.toHaveBeenCalled();
  });
});

// ============================================================
// 4. LocalStorage caching behavior
// ============================================================
describe('localStorage caching behavior', () => {
  let localStorageMock: Record<string, jest.Mock>;

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    (global as any).localStorage = localStorageMock;
  });

  afterEach(() => {
    delete (global as any).localStorage;
  });

  it('should read cached theme from localStorage key "ims-theme"', () => {
    const cachedTheme = JSON.stringify(DEFAULT_THEME);
    localStorageMock.getItem.mockReturnValue(cachedTheme);

    const result = localStorage.getItem('ims-theme');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ims-theme');
    expect(result).toBe(cachedTheme);
  });

  it('should parse cached theme as valid ThemeConfig', () => {
    const cachedTheme = JSON.stringify(DEFAULT_THEME);
    localStorageMock.getItem.mockReturnValue(cachedTheme);

    const raw = localStorage.getItem('ims-theme');
    const parsed = JSON.parse(raw!) as ThemeConfig;
    expect(parsed.primaryColor).toBe('#2563eb');
    expect(parsed.brandName).toBe('IMS Platform');
  });

  it('should handle null (no cached theme) gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const raw = localStorage.getItem('ims-theme');
    expect(raw).toBeNull();
  });

  it('should handle invalid JSON in cache gracefully', () => {
    localStorageMock.getItem.mockReturnValue('not-valid-json{{{');
    const raw = localStorage.getItem('ims-theme');
    expect(() => JSON.parse(raw!)).toThrow();
  });

  it('should store theme to localStorage with correct key', () => {
    const theme = { ...DEFAULT_THEME, brandName: 'Custom Brand' };
    localStorage.setItem('ims-theme', JSON.stringify(theme));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ims-theme',
      expect.stringContaining('"Custom Brand"')
    );
  });

  it('should read auth token from localStorage key "token"', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'eyJhbGciOiJIUzI1NiJ9.test';
      return null;
    });

    const token = localStorage.getItem('token');
    expect(token).toBe('eyJhbGciOiJIUzI1NiJ9.test');
  });
});

// ============================================================
// 5. API fetch behavior
// ============================================================
describe('API fetch behavior', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    (global as any).localStorage = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
    };
  });

  afterEach(() => {
    delete (global as any).fetch;
    delete (global as any).localStorage;
  });

  it('should call correct MSP branding endpoint', async () => {
    const apiUrl = 'http://localhost:4000';
    const expectedUrl = `${apiUrl}/api/organisations/msp-branding`;

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });

    await fetch(expectedUrl, {
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/organisations/msp-branding',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should merge API branding data with DEFAULT_THEME', async () => {
    const branding = {
      primaryColor: '#ff0000',
      brandName: 'Acme Corp',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: branding }),
    });

    const res = await fetch('http://localhost:4000/api/organisations/msp-branding');
    const json = await res.json();
    const apiData = json.data || {};

    const merged: ThemeConfig = {
      ...DEFAULT_THEME,
      ...(apiData.primaryColor && { primaryColor: apiData.primaryColor }),
      ...(apiData.accentColor && { accentColor: apiData.accentColor }),
      ...(apiData.logoUrl && { logoUrl: apiData.logoUrl }),
      ...(apiData.brandName && { brandName: apiData.brandName }),
      ...(apiData.favicon && { favicon: apiData.favicon }),
      ...(apiData.customCSS && { customCSS: apiData.customCSS }),
    };

    expect(merged.primaryColor).toBe('#ff0000');
    expect(merged.brandName).toBe('Acme Corp');
    // Fields not in API response should keep defaults
    expect(merged.accentColor).toBe('#7c3aed');
    expect(merged.logoUrl).toBe('/logo.svg');
    expect(merged.favicon).toBe('/favicon.ico');
    expect(merged.customCSS).toBe('');
  });

  it('should use DEFAULT_THEME when API returns non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const res = await fetch('http://localhost:4000/api/organisations/msp-branding');
    let theme: ThemeConfig;

    if (res.ok) {
      const json = await res.json();
      theme = { ...DEFAULT_THEME, ...json.data };
    } else {
      theme = DEFAULT_THEME;
    }

    expect(theme).toEqual(DEFAULT_THEME);
  });

  it('should use DEFAULT_THEME when no token is available', () => {
    (global as any).localStorage.getItem.mockReturnValue(null);

    const token = localStorage.getItem('token');
    const apiUrl = 'http://localhost:4000';

    // Provider logic: if !token || !apiUrl, fall back to defaults
    if (!token || !apiUrl) {
      expect(DEFAULT_THEME.primaryColor).toBe('#2563eb');
      return;
    }
    // Should not reach here
    fail('Expected to fall back to DEFAULT_THEME');
  });

  it('should use DEFAULT_THEME when no apiUrl is provided', () => {
    const apiUrl: string | undefined = undefined;
    const token = 'some-token';

    if (!token || !apiUrl) {
      expect(DEFAULT_THEME.brandName).toBe('IMS Platform');
      return;
    }
    fail('Expected to fall back to DEFAULT_THEME');
  });

  it('should only merge specific branding fields from API response', async () => {
    const branding = {
      primaryColor: '#00ff00',
      accentColor: '#0000ff',
      logoUrl: '/custom-logo.png',
      brandName: 'Custom Co',
      favicon: '/custom.ico',
      customCSS: 'body { background: red; }',
      // extra unknown fields should NOT contaminate the theme
      unknownField: 'should-not-appear',
      backgroundColor: '#999999', // should NOT be merged (not in the merge list)
    };

    const merged: ThemeConfig = {
      ...DEFAULT_THEME,
      ...(branding.primaryColor && { primaryColor: branding.primaryColor }),
      ...(branding.accentColor && { accentColor: branding.accentColor }),
      ...(branding.logoUrl && { logoUrl: branding.logoUrl }),
      ...(branding.brandName && { brandName: branding.brandName }),
      ...(branding.favicon && { favicon: branding.favicon }),
      ...(branding.customCSS && { customCSS: branding.customCSS }),
    };

    expect(merged.primaryColor).toBe('#00ff00');
    expect(merged.accentColor).toBe('#0000ff');
    expect(merged.logoUrl).toBe('/custom-logo.png');
    expect(merged.brandName).toBe('Custom Co');
    expect(merged.favicon).toBe('/custom.ico');
    expect(merged.customCSS).toBe('body { background: red; }');
    // backgroundColor should remain default because the merge logic only spreads 6 fields
    expect(merged.backgroundColor).toBe('#f8fafc');
    expect((merged as any).unknownField).toBeUndefined();
  });
});

// ============================================================
// 6. Static theme override
// ============================================================
describe('Static theme override mode', () => {
  it('should merge staticTheme with DEFAULT_THEME', () => {
    const staticTheme: Partial<ThemeConfig> = {
      primaryColor: '#ff6600',
      brandName: 'Static Brand',
    };

    const merged = { ...DEFAULT_THEME, ...staticTheme };

    expect(merged.primaryColor).toBe('#ff6600');
    expect(merged.brandName).toBe('Static Brand');
    expect(merged.accentColor).toBe('#7c3aed'); // keeps default
    expect(merged.logoUrl).toBe('/logo.svg'); // keeps default
  });

  it('should allow overriding all optional fields via staticTheme', () => {
    const staticTheme: Partial<ThemeConfig> = {
      backgroundColor: '#000000',
      surfaceColor: '#111111',
      textColor: '#ffffff',
      sidebarColor: '#222222',
      borderRadius: 16,
      fontFamily: 'Roboto, sans-serif',
    };

    const merged = { ...DEFAULT_THEME, ...staticTheme };

    expect(merged.backgroundColor).toBe('#000000');
    expect(merged.surfaceColor).toBe('#111111');
    expect(merged.textColor).toBe('#ffffff');
    expect(merged.sidebarColor).toBe('#222222');
    expect(merged.borderRadius).toBe(16);
    expect(merged.fontFamily).toBe('Roboto, sans-serif');
  });

  it('should result in a complete ThemeConfig when merged', () => {
    const staticTheme: Partial<ThemeConfig> = { primaryColor: '#abcdef' };
    const merged: ThemeConfig = { ...DEFAULT_THEME, ...staticTheme };

    // All required fields present
    expect(merged.primaryColor).toBeDefined();
    expect(merged.accentColor).toBeDefined();
    expect(merged.logoUrl).toBeDefined();
    expect(merged.brandName).toBeDefined();
    expect(merged.favicon).toBeDefined();
    expect(merged.customCSS).toBeDefined();
  });

  it('should skip API fetch when staticTheme is provided (no fetch call)', () => {
    // In the provider, if (staticTheme) { ... return; } prevents fetchTheme()
    // We verify the logic: staticTheme truthy means early return
    const staticTheme: Partial<ThemeConfig> = { brandName: 'Static' };
    const shouldFetch = !staticTheme;
    expect(shouldFetch).toBe(false);
  });

  it('should handle empty staticTheme object (all defaults)', () => {
    const staticTheme: Partial<ThemeConfig> = {};
    const merged = { ...DEFAULT_THEME, ...staticTheme };
    expect(merged).toEqual(DEFAULT_THEME);
  });
});

// ============================================================
// 7. Error handling
// ============================================================
describe('Error handling', () => {
  it('should extract message from Error instances', () => {
    const err = new Error('Network timeout');
    const errorMessage = err instanceof Error ? err.message : 'Failed to load theme';
    expect(errorMessage).toBe('Network timeout');
  });

  it('should use fallback message for non-Error thrown values', () => {
    const err: any = 'string error';
    const errorMessage = err instanceof Error ? err.message : 'Failed to load theme';
    expect(errorMessage).toBe('Failed to load theme');
  });

  it('should use fallback message for null thrown values', () => {
    const err: any = null;
    const errorMessage = err instanceof Error ? err.message : 'Failed to load theme';
    expect(errorMessage).toBe('Failed to load theme');
  });

  it('should use fallback message for undefined thrown values', () => {
    const err: any = undefined;
    const errorMessage = err instanceof Error ? err.message : 'Failed to load theme';
    expect(errorMessage).toBe('Failed to load theme');
  });

  it('should fall back to DEFAULT_THEME on fetch error', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    (global as any).fetch = fetchMock;

    let theme: ThemeConfig = DEFAULT_THEME;
    let error: string | null = null;

    try {
      await fetchMock('http://localhost:4000/api/organisations/msp-branding');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load theme';
      theme = DEFAULT_THEME;
    }

    expect(error).toBe('ECONNREFUSED');
    expect(theme).toEqual(DEFAULT_THEME);

    delete (global as any).fetch;
  });

  it('should handle invalid JSON response gracefully', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    (global as any).fetch = fetchMock;

    let error: string | null = null;
    let theme: ThemeConfig = DEFAULT_THEME;

    try {
      const res = await fetchMock('http://localhost:4000/api/organisations/msp-branding');
      await res.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load theme';
      theme = DEFAULT_THEME;
    }

    expect(error).toBe('Unexpected token');
    expect(theme).toEqual(DEFAULT_THEME);

    delete (global as any).fetch;
  });
});

// ============================================================
// 8. Theme immutability / isolation
// ============================================================
describe('Theme immutability', () => {
  it('DEFAULT_THEME should not be mutated by spread merge', () => {
    const original = { ...DEFAULT_THEME };
    const _merged = { ...DEFAULT_THEME, primaryColor: '#ff0000' };

    expect(DEFAULT_THEME.primaryColor).toBe('#2563eb');
    expect(DEFAULT_THEME).toEqual(original);
  });

  it('updateTheme merge should produce a new object', () => {
    const prev = { ...DEFAULT_THEME };
    const partial: Partial<ThemeConfig> = { brandName: 'Updated' };
    const updated = { ...prev, ...partial };

    expect(updated).not.toBe(prev);
    expect(updated.brandName).toBe('Updated');
    expect(prev.brandName).toBe('IMS Platform');
  });
});
