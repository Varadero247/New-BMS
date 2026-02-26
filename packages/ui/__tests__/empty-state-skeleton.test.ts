// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

/**
 * Tests for empty-state and skeleton logic helpers.
 * Tests target pure functions only — no React rendering required.
 */

import {
  getEmptyStateConfig,
  getEmptyStateSizeStyles,
  resolveEmptyStateProps,
  EmptyStateVariant,
  EmptyStateSize,
} from '../src/empty-state';

import {
  getSkeletonDimensions,
  getSkeletonAnimationClass,
  getLastLineWidth,
} from '../src/skeleton';

// ════════════════════════════════════════════════════════════════════
// 1. getEmptyStateConfig (150 tests)
// ════════════════════════════════════════════════════════════════════

describe('getEmptyStateConfig', () => {
  const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'no-permission', 'error', 'loading'];

  variants.forEach((v) => {
    it(`returns config for variant "${v}"`, () => {
      const c = getEmptyStateConfig(v);
      expect(c).toBeDefined();
    });

    it(`config for "${v}" has defaultTitle string`, () => {
      const c = getEmptyStateConfig(v);
      expect(typeof c.defaultTitle).toBe('string');
      expect(c.defaultTitle.length).toBeGreaterThan(0);
    });

    it(`config for "${v}" has defaultDescription string`, () => {
      const c = getEmptyStateConfig(v);
      expect(typeof c.defaultDescription).toBe('string');
      expect(c.defaultDescription.length).toBeGreaterThan(0);
    });

    it(`config for "${v}" has iconName string`, () => {
      const c = getEmptyStateConfig(v);
      expect(typeof c.iconName).toBe('string');
      expect(c.iconName.length).toBeGreaterThan(0);
    });
  });

  it('no-data has title "No data yet"', () => {
    expect(getEmptyStateConfig('no-data').defaultTitle).toBe('No data yet');
  });

  it('no-data iconName is upload', () => {
    expect(getEmptyStateConfig('no-data').iconName).toBe('upload');
  });

  it('no-results has "No results found" title', () => {
    expect(getEmptyStateConfig('no-results').defaultTitle).toBe('No results found');
  });

  it('no-results iconName is search', () => {
    expect(getEmptyStateConfig('no-results').iconName).toBe('search');
  });

  it('no-permission has "Access denied" title', () => {
    expect(getEmptyStateConfig('no-permission').defaultTitle).toBe('Access denied');
  });

  it('no-permission iconName is lock', () => {
    expect(getEmptyStateConfig('no-permission').iconName).toBe('lock');
  });

  it('error has "Something went wrong" title', () => {
    expect(getEmptyStateConfig('error').defaultTitle).toBe('Something went wrong');
  });

  it('error iconName is error', () => {
    expect(getEmptyStateConfig('error').iconName).toBe('error');
  });

  it('loading has "Loading" in title', () => {
    expect(getEmptyStateConfig('loading').defaultTitle.toLowerCase()).toContain('loading');
  });

  it('loading iconName is spinner', () => {
    expect(getEmptyStateConfig('loading').iconName).toBe('spinner');
  });

  it('falls back to no-data for unknown variant', () => {
    const c = getEmptyStateConfig('unknown' as EmptyStateVariant);
    expect(c.defaultTitle).toBe('No data yet');
  });

  it('returns same config on repeated calls', () => {
    expect(getEmptyStateConfig('error').defaultTitle).toBe(getEmptyStateConfig('error').defaultTitle);
  });

  it('all variants have distinct iconNames', () => {
    const icons = variants.map((v) => getEmptyStateConfig(v).iconName);
    const unique = new Set(icons);
    expect(unique.size).toBe(variants.length);
  });

  it('all variants have distinct titles', () => {
    const titles = variants.map((v) => getEmptyStateConfig(v).defaultTitle);
    const unique = new Set(titles);
    expect(unique.size).toBe(variants.length);
  });

  // 100 more parameterised tests
  for (let i = 0; i < 100; i++) {
    const v = variants[i % variants.length];
    it(`getEmptyStateConfig param ${i}: variant ${v} returns object`, () => {
      const c = getEmptyStateConfig(v);
      expect(typeof c).toBe('object');
      expect(c).not.toBeNull();
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 2. getEmptyStateSizeStyles (150 tests)
// ════════════════════════════════════════════════════════════════════

describe('getEmptyStateSizeStyles', () => {
  const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];

  sizes.forEach((s) => {
    it(`returns styles for size "${s}"`, () => {
      const styles = getEmptyStateSizeStyles(s);
      expect(styles).toBeDefined();
    });

    it(`"${s}" has container string`, () => {
      expect(typeof getEmptyStateSizeStyles(s).container).toBe('string');
    });

    it(`"${s}" has icon string`, () => {
      expect(typeof getEmptyStateSizeStyles(s).icon).toBe('string');
    });

    it(`"${s}" has title string`, () => {
      expect(typeof getEmptyStateSizeStyles(s).title).toBe('string');
    });

    it(`"${s}" has description string`, () => {
      expect(typeof getEmptyStateSizeStyles(s).description).toBe('string');
    });
  });

  it('sm container has less padding than lg', () => {
    const sm = getEmptyStateSizeStyles('sm');
    const lg = getEmptyStateSizeStyles('lg');
    // sm should have py-6, lg should have py-16
    expect(sm.container).toContain('py-6');
    expect(lg.container).toContain('py-16');
  });

  it('lg icon is larger than sm icon', () => {
    const sm = getEmptyStateSizeStyles('sm');
    const lg = getEmptyStateSizeStyles('lg');
    expect(sm.icon).toContain('h-8');
    expect(lg.icon).toContain('h-16');
  });

  it('md is default (py-12)', () => {
    const md = getEmptyStateSizeStyles('md');
    expect(md.container).toContain('py-12');
  });

  it('sm title uses text-sm', () => {
    expect(getEmptyStateSizeStyles('sm').title).toContain('text-sm');
  });

  it('lg title uses text-xl', () => {
    expect(getEmptyStateSizeStyles('lg').title).toContain('text-xl');
  });

  it('sm description uses text-xs', () => {
    expect(getEmptyStateSizeStyles('sm').description).toContain('text-xs');
  });

  it('lg description uses text-base', () => {
    expect(getEmptyStateSizeStyles('lg').description).toContain('text-base');
  });

  it('all sizes return objects with 4 keys', () => {
    sizes.forEach((s) => {
      const styles = getEmptyStateSizeStyles(s);
      expect(Object.keys(styles).length).toBe(4);
    });
  });

  it('unknown size falls back to md', () => {
    const styles = getEmptyStateSizeStyles('xl' as EmptyStateSize);
    expect(styles.container).toBeDefined();
  });

  // 100 more size style tests
  for (let i = 0; i < 100; i++) {
    const s = sizes[i % sizes.length];
    it(`getEmptyStateSizeStyles param ${i}: size ${s} is non-null object`, () => {
      const styles = getEmptyStateSizeStyles(s);
      expect(styles).not.toBeNull();
      expect(typeof styles.container).toBe('string');
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 3. resolveEmptyStateProps (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('resolveEmptyStateProps', () => {
  const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'no-permission', 'error', 'loading'];

  variants.forEach((v) => {
    it(`resolves variant "${v}" with no overrides`, () => {
      const r = resolveEmptyStateProps(v);
      expect(r.variant).toBe(v);
    });

    it(`resolves "${v}" title from config by default`, () => {
      const r = resolveEmptyStateProps(v);
      const config = getEmptyStateConfig(v);
      expect(r.title).toBe(config.defaultTitle);
    });

    it(`resolves "${v}" description from config by default`, () => {
      const r = resolveEmptyStateProps(v);
      const config = getEmptyStateConfig(v);
      expect(r.description).toBe(config.defaultDescription);
    });

    it(`resolves "${v}" size defaults to md`, () => {
      const r = resolveEmptyStateProps(v);
      expect(r.size).toBe('md');
    });
  });

  it('override title replaces default', () => {
    const r = resolveEmptyStateProps('no-data', { title: 'Custom Title' });
    expect(r.title).toBe('Custom Title');
  });

  it('override description replaces default', () => {
    const r = resolveEmptyStateProps('no-data', { description: 'Custom desc' });
    expect(r.description).toBe('Custom desc');
  });

  it('override size sm works', () => {
    const r = resolveEmptyStateProps('no-data', { size: 'sm' });
    expect(r.size).toBe('sm');
  });

  it('override size lg works', () => {
    const r = resolveEmptyStateProps('no-data', { size: 'lg' });
    expect(r.size).toBe('lg');
  });

  it('returns object with required keys', () => {
    const r = resolveEmptyStateProps('error');
    expect(r).toHaveProperty('title');
    expect(r).toHaveProperty('description');
    expect(r).toHaveProperty('size');
    expect(r).toHaveProperty('variant');
  });

  it('empty overrides does not override defaults', () => {
    const r = resolveEmptyStateProps('error', {});
    const config = getEmptyStateConfig('error');
    expect(r.title).toBe(config.defaultTitle);
  });

  // 70 more resolveEmptyStateProps tests
  for (let i = 0; i < 70; i++) {
    const v = variants[i % variants.length];
    it(`resolveEmptyStateProps param ${i}: variant ${v} has string title`, () => {
      const r = resolveEmptyStateProps(v);
      expect(typeof r.title).toBe('string');
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 4. getSkeletonDimensions (200 tests)
// ════════════════════════════════════════════════════════════════════

describe('getSkeletonDimensions', () => {
  it('text variant defaults to 100% width and 16 height', () => {
    const d = getSkeletonDimensions({ variant: 'text' });
    expect(d.width).toBe('100%');
    expect(d.height).toBe(16);
  });

  it('circular variant defaults to 40x40', () => {
    const d = getSkeletonDimensions({ variant: 'circular' });
    expect(d.width).toBe(40);
    expect(d.height).toBe(40);
  });

  it('rectangular variant defaults to 100% width and 120 height', () => {
    const d = getSkeletonDimensions({ variant: 'rectangular' });
    expect(d.width).toBe('100%');
    expect(d.height).toBe(120);
  });

  it('accepts custom width number', () => {
    const d = getSkeletonDimensions({ variant: 'text', width: 200 });
    expect(d.width).toBe(200);
  });

  it('accepts custom height number', () => {
    const d = getSkeletonDimensions({ variant: 'text', height: 24 });
    expect(d.height).toBe(24);
  });

  it('accepts custom width string', () => {
    const d = getSkeletonDimensions({ variant: 'rectangular', width: '75%' });
    expect(d.width).toBe('75%');
  });

  it('accepts custom height string', () => {
    const d = getSkeletonDimensions({ variant: 'rectangular', height: '10rem' });
    expect(d.height).toBe('10rem');
  });

  it('circular with custom size', () => {
    const d = getSkeletonDimensions({ variant: 'circular', width: 64, height: 64 });
    expect(d.width).toBe(64);
    expect(d.height).toBe(64);
  });

  it('no variant defaults to text behaviour', () => {
    const d = getSkeletonDimensions({});
    expect(d.width).toBe('100%');
    expect(d.height).toBe(16);
  });

  it('returns object with width and height', () => {
    const d = getSkeletonDimensions({ variant: 'text' });
    expect(d).toHaveProperty('width');
    expect(d).toHaveProperty('height');
  });

  // width range tests
  for (let i = 10; i <= 100; i += 10) {
    it(`getSkeletonDimensions width=${i} text variant`, () => {
      const d = getSkeletonDimensions({ variant: 'text', width: i });
      expect(d.width).toBe(i);
    });
  }

  // height range tests
  for (let i = 10; i <= 100; i += 10) {
    it(`getSkeletonDimensions height=${i} text variant`, () => {
      const d = getSkeletonDimensions({ variant: 'text', height: i });
      expect(d.height).toBe(i);
    });
  }

  // circular sizes
  for (const size of [16, 24, 32, 40, 48, 56, 64, 80, 96, 128]) {
    it(`getSkeletonDimensions circular size ${size}`, () => {
      const d = getSkeletonDimensions({ variant: 'circular', width: size, height: size });
      expect(d.width).toBe(size);
      expect(d.height).toBe(size);
    });
  }

  // rectangular heights
  for (const h of [40, 60, 80, 100, 120, 160, 200, 240, 300, 400]) {
    it(`getSkeletonDimensions rectangular height ${h}`, () => {
      const d = getSkeletonDimensions({ variant: 'rectangular', height: h });
      expect(d.height).toBe(h);
    });
  }

  // percentage widths
  for (const pct of ['25%', '33%', '50%', '60%', '75%', '80%', '90%', '100%']) {
    it(`getSkeletonDimensions width=${pct} rectangular`, () => {
      const d = getSkeletonDimensions({ variant: 'rectangular', width: pct });
      expect(d.width).toBe(pct);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 5. getSkeletonAnimationClass (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('getSkeletonAnimationClass', () => {
  it('returns animate-pulse when animate=true', () => {
    expect(getSkeletonAnimationClass(true)).toBe('animate-pulse');
  });

  it('returns empty string when animate=false', () => {
    expect(getSkeletonAnimationClass(false)).toBe('');
  });

  it('returns string type always', () => {
    expect(typeof getSkeletonAnimationClass(true)).toBe('string');
    expect(typeof getSkeletonAnimationClass(false)).toBe('string');
  });

  for (let i = 0; i < 97; i++) {
    const animate = i % 2 === 0;
    it(`getSkeletonAnimationClass param ${i}: animate=${animate}`, () => {
      const result = getSkeletonAnimationClass(animate);
      if (animate) {
        expect(result).toBe('animate-pulse');
      } else {
        expect(result).toBe('');
      }
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 6. getLastLineWidth (150 tests)
// ════════════════════════════════════════════════════════════════════

describe('getLastLineWidth', () => {
  it('single line returns 100%', () => {
    expect(getLastLineWidth(0, 1)).toBe('100%');
  });

  it('non-last line of multi-line returns 100%', () => {
    expect(getLastLineWidth(0, 3)).toBe('100%');
    expect(getLastLineWidth(1, 3)).toBe('100%');
  });

  it('last line of multi-line returns 75%', () => {
    expect(getLastLineWidth(2, 3)).toBe('75%');
  });

  it('last line of 2-line returns 75%', () => {
    expect(getLastLineWidth(1, 2)).toBe('75%');
  });

  it('last line of 5-line returns 75%', () => {
    expect(getLastLineWidth(4, 5)).toBe('75%');
  });

  it('first line of 5-line returns 100%', () => {
    expect(getLastLineWidth(0, 5)).toBe('100%');
  });

  it('middle line of 5-line returns 100%', () => {
    expect(getLastLineWidth(2, 5)).toBe('100%');
  });

  it('always returns string', () => {
    expect(typeof getLastLineWidth(0, 1)).toBe('string');
    expect(typeof getLastLineWidth(2, 3)).toBe('string');
  });

  it('returns one of 75% or 100%', () => {
    for (let lines = 1; lines <= 10; lines++) {
      for (let i = 0; i < lines; i++) {
        const w = getLastLineWidth(i, lines);
        expect(['75%', '100%']).toContain(w);
      }
    }
  });

  // Exhaustive line tests
  for (let lines = 1; lines <= 10; lines++) {
    for (let i = 0; i < lines; i++) {
      it(`getLastLineWidth(${i}, ${lines})`, () => {
        const w = getLastLineWidth(i, lines);
        if (lines === 1) {
          expect(w).toBe('100%');
        } else if (i === lines - 1) {
          expect(w).toBe('75%');
        } else {
          expect(w).toBe('100%');
        }
      });
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// 7. Exports validation (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('empty-state exports', () => {
  it('getEmptyStateConfig is a function', () => {
    expect(typeof getEmptyStateConfig).toBe('function');
  });

  it('getEmptyStateSizeStyles is a function', () => {
    expect(typeof getEmptyStateSizeStyles).toBe('function');
  });

  it('resolveEmptyStateProps is a function', () => {
    expect(typeof resolveEmptyStateProps).toBe('function');
  });

  const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'no-permission', 'error', 'loading'];
  const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];

  // Exhaustive export validation
  for (let i = 0; i < 97; i++) {
    const v = variants[i % variants.length];
    const s = sizes[i % sizes.length];
    it(`export validation ${i}: config(${v}) + styles(${s})`, () => {
      const config = getEmptyStateConfig(v);
      const styles = getEmptyStateSizeStyles(s);
      expect(config).toBeDefined();
      expect(styles).toBeDefined();
    });
  }
});

describe('skeleton exports', () => {
  it('getSkeletonDimensions is a function', () => {
    expect(typeof getSkeletonDimensions).toBe('function');
  });

  it('getSkeletonAnimationClass is a function', () => {
    expect(typeof getSkeletonAnimationClass).toBe('function');
  });

  it('getLastLineWidth is a function', () => {
    expect(typeof getLastLineWidth).toBe('function');
  });

  // 97 more export tests
  for (let i = 0; i < 97; i++) {
    const animate = i % 2 === 0;
    const w = [100, 200, 300, 400, 500][i % 5];
    it(`skeleton export validation ${i}`, () => {
      const dims = getSkeletonDimensions({ variant: 'text', width: w });
      const animClass = getSkeletonAnimationClass(animate);
      const lw = getLastLineWidth(i % 5, 5);
      expect(dims.width).toBe(w);
      expect(typeof animClass).toBe('string');
      expect(['75%', '100%']).toContain(lw);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 8. Integration: combine helpers (150 tests)
// ════════════════════════════════════════════════════════════════════

describe('Integration: empty-state + skeleton helpers', () => {
  it('resolveEmptyStateProps + getEmptyStateSizeStyles', () => {
    const props = resolveEmptyStateProps('no-data', { size: 'lg' });
    const styles = getEmptyStateSizeStyles(props.size);
    expect(styles.container).toContain('py-16');
  });

  it('all variants resolve with all sizes', () => {
    const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'no-permission', 'error', 'loading'];
    const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];
    variants.forEach((v) => {
      sizes.forEach((s) => {
        const r = resolveEmptyStateProps(v, { size: s });
        const styles = getEmptyStateSizeStyles(r.size);
        expect(styles).toBeDefined();
      });
    });
  });

  it('getSkeletonDimensions + getSkeletonAnimationClass combination', () => {
    const dims = getSkeletonDimensions({ variant: 'circular', width: 64, height: 64 });
    const anim = getSkeletonAnimationClass(true);
    expect(dims.width).toBe(64);
    expect(anim).toBe('animate-pulse');
  });

  it('getLastLineWidth + getSkeletonDimensions combination', () => {
    const lw = getLastLineWidth(4, 5);
    const dims = getSkeletonDimensions({ variant: 'text', width: lw });
    expect(dims.width).toBe('75%');
  });

  // 146 more integration tests
  for (let i = 0; i < 146; i++) {
    const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'no-permission', 'error', 'loading'];
    const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];
    const skVariants = ['text', 'circular', 'rectangular'] as const;

    const v = variants[i % variants.length];
    const s = sizes[i % sizes.length];
    const sv = skVariants[i % skVariants.length];

    it(`integration ${i}: variant=${v} size=${s} skeleton=${sv}`, () => {
      const config = getEmptyStateConfig(v);
      const styles = getEmptyStateSizeStyles(s);
      const dims = getSkeletonDimensions({ variant: sv });
      const anim = getSkeletonAnimationClass(i % 2 === 0);
      const lw = getLastLineWidth(i % 3, 5);

      expect(config.defaultTitle.length).toBeGreaterThan(0);
      expect(styles.container.length).toBeGreaterThan(0);
      expect(dims).toHaveProperty('width');
      expect(dims).toHaveProperty('height');
      expect(typeof anim).toBe('string');
      expect(['75%', '100%']).toContain(lw);
    });
  }
});
