// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { SemVer, ReleaseType, DiffType, RangeComparator } from './types';

// ─── Internal regex ────────────────────────────────────────────────────────────

const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

// ─── Parsing ────────────────────────────────────────────────────────────────────

export function parse(version: string): SemVer | null {
  if (typeof version !== 'string') return null;
  const m = SEMVER_RE.exec(version.trim());
  if (!m) return null;
  const prerelease: Array<string | number> = m[4]
    ? m[4].split('.').map((id) => (/^\d+$/.test(id) ? parseInt(id, 10) : id))
    : [];
  const build: string[] = m[5] ? m[5].split('.') : [];
  return {
    major: parseInt(m[1], 10),
    minor: parseInt(m[2], 10),
    patch: parseInt(m[3], 10),
    prerelease,
    build,
    raw: version.trim(),
  };
}

export function valid(version: string): string | null {
  const v = parse(version);
  if (!v) return null;
  return toString(v);
}

export function clean(version: string): string | null {
  if (typeof version !== 'string') return null;
  const stripped = version.trim().replace(/^[v=]+/, '');
  return valid(stripped);
}

export function coerce(version: string): SemVer | null {
  if (typeof version !== 'string') return null;
  const m = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(version);
  if (!m) return null;
  const major = parseInt(m[1], 10);
  const minor = m[2] !== undefined ? parseInt(m[2], 10) : 0;
  const patch = m[3] !== undefined ? parseInt(m[3], 10) : 0;
  return parse(`${major}.${minor}.${patch}`);
}

export function isSemVer(s: string): boolean {
  return parse(s) !== null;
}

// ─── toString ───────────────────────────────────────────────────────────────────

export function toString(v: SemVer): string {
  let s = `${v.major}.${v.minor}.${v.patch}`;
  if (v.prerelease.length > 0) s += `-${v.prerelease.join('.')}`;
  if (v.build.length > 0) s += `+${v.build.join('.')}`;
  return s;
}

// ─── Comparison helpers ─────────────────────────────────────────────────────────

function comparePrerelease(a: Array<string | number>, b: Array<string | number>): -1 | 0 | 1 {
  // Per spec: version without pre-release > version with pre-release (same major.minor.patch)
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;

  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (i >= a.length) return -1; // a has fewer identifiers → a < b
    if (i >= b.length) return 1;  // b has fewer identifiers → a > b
    const ai = a[i];
    const bi = b[i];
    if (ai === bi) continue;
    const aIsNum = typeof ai === 'number';
    const bIsNum = typeof bi === 'number';
    if (aIsNum && bIsNum) {
      return ai < bi ? -1 : 1;
    }
    // numeric < alphanumeric per spec
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    // both strings: lexical comparison
    return (ai as string) < (bi as string) ? -1 : 1;
  }
  return 0;
}

export function compare(a: string, b: string): -1 | 0 | 1 {
  const va = parse(a);
  const vb = parse(b);
  if (!va || !vb) throw new Error(`Invalid semver: ${!va ? a : b}`);

  if (va.major !== vb.major) return va.major < vb.major ? -1 : 1;
  if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1;
  if (va.patch !== vb.patch) return va.patch < vb.patch ? -1 : 1;
  return comparePrerelease(va.prerelease, vb.prerelease);
}

export function compareLoose(a: string, b: string): -1 | 0 | 1 {
  const va = parse(a);
  const vb = parse(b);
  if (!va || !vb) throw new Error(`Invalid semver: ${!va ? a : b}`);
  if (va.major !== vb.major) return va.major < vb.major ? -1 : 1;
  if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1;
  if (va.patch !== vb.patch) return va.patch < vb.patch ? -1 : 1;
  return 0;
}

export function eq(a: string, b: string): boolean { return compare(a, b) === 0; }
export function neq(a: string, b: string): boolean { return compare(a, b) !== 0; }
export function gt(a: string, b: string): boolean { return compare(a, b) === 1; }
export function gte(a: string, b: string): boolean { return compare(a, b) >= 0; }
export function lt(a: string, b: string): boolean { return compare(a, b) === -1; }
export function lte(a: string, b: string): boolean { return compare(a, b) <= 0; }

export function diff(a: string, b: string): DiffType {
  const va = parse(a);
  const vb = parse(b);
  if (!va || !vb) return 'none';
  if (va.major !== vb.major) {
    if (va.prerelease.length > 0 || vb.prerelease.length > 0) return 'premajor';
    return 'major';
  }
  if (va.minor !== vb.minor) {
    if (va.prerelease.length > 0 || vb.prerelease.length > 0) return 'preminor';
    return 'minor';
  }
  if (va.patch !== vb.patch) {
    if (va.prerelease.length > 0 || vb.prerelease.length > 0) return 'prepatch';
    return 'patch';
  }
  if (va.prerelease.length > 0 || vb.prerelease.length > 0) {
    // same major.minor.patch but different pre-release
    if (comparePrerelease(va.prerelease, vb.prerelease) !== 0) return 'prerelease';
  }
  return 'none';
}

// ─── Sorting ────────────────────────────────────────────────────────────────────

export function sort(versions: string[], order: 'asc' | 'desc' = 'asc'): string[] {
  return [...versions].sort((a, b) => {
    const c = compare(a, b);
    return order === 'asc' ? c : -c;
  });
}

export function rsort(versions: string[]): string[] {
  return sort(versions, 'desc');
}

export function minVersion(versions: string[]): string | null {
  if (versions.length === 0) return null;
  return sort(versions, 'asc')[0];
}

export function maxVersion(versions: string[]): string | null {
  if (versions.length === 0) return null;
  return sort(versions, 'desc')[0];
}

// ─── Increment ──────────────────────────────────────────────────────────────────

export function inc(version: string, release: ReleaseType, identifier?: string): string | null {
  const v = parse(version);
  if (!v) return null;

  switch (release) {
    case 'major':
      return `${v.major + 1}.0.0`;
    case 'minor':
      return `${v.major}.${v.minor + 1}.0`;
    case 'patch':
      return `${v.major}.${v.minor}.${v.patch + 1}`;
    case 'premajor': {
      const pre = identifier ? `${identifier}.0` : '0';
      return `${v.major + 1}.0.0-${pre}`;
    }
    case 'preminor': {
      const pre = identifier ? `${identifier}.0` : '0';
      return `${v.major}.${v.minor + 1}.0-${pre}`;
    }
    case 'prepatch': {
      const pre = identifier ? `${identifier}.0` : '0';
      return `${v.major}.${v.minor}.${v.patch + 1}-${pre}`;
    }
    case 'prerelease': {
      if (v.prerelease.length === 0) {
        // No existing pre-release: bump patch and add pre-release
        const pre = identifier ? `${identifier}.0` : '0';
        return `${v.major}.${v.minor}.${v.patch + 1}-${pre}`;
      }
      // Has existing pre-release
      if (identifier) {
        // If the pre-release starts with the identifier, increment last numeric
        if (v.prerelease[0] === identifier) {
          const last = v.prerelease[v.prerelease.length - 1];
          if (typeof last === 'number') {
            const newPre = [...v.prerelease.slice(0, -1), last + 1];
            return `${v.major}.${v.minor}.${v.patch}-${newPre.join('.')}`;
          }
        }
        return `${v.major}.${v.minor}.${v.patch}-${identifier}.0`;
      }
      // No identifier: increment last numeric in pre-release
      const pr = [...v.prerelease];
      let bumped = false;
      for (let i = pr.length - 1; i >= 0; i--) {
        if (typeof pr[i] === 'number') {
          (pr[i] as number);
          pr[i] = (pr[i] as number) + 1;
          bumped = true;
          break;
        }
      }
      if (!bumped) pr.push(0);
      return `${v.major}.${v.minor}.${v.patch}-${pr.join('.')}`;
    }
  }
}

export function major(version: string): number | null {
  const v = parse(version);
  return v ? v.major : null;
}

export function minor(version: string): number | null {
  const v = parse(version);
  return v ? v.minor : null;
}

export function patch(version: string): number | null {
  const v = parse(version);
  return v ? v.patch : null;
}

export function prerelease(version: string): Array<string | number> | null {
  const v = parse(version);
  return v ? v.prerelease : null;
}

// ─── Range Parsing ──────────────────────────────────────────────────────────────

// Expand a single comparator token (no ||) to a list of comparators
function expandComparator(comp: string): string {
  comp = comp.trim();

  // Hyphen range: "1.0.0 - 2.0.0"
  const hyphenMatch = /^(\S+)\s+-\s+(\S+)$/.exec(comp);
  if (hyphenMatch) {
    return `>=${hyphenMatch[1]} <=${hyphenMatch[2]}`;
  }

  // Wildcard: *, x, X, or partial wildcards 1.x, 1.2.x
  if (comp === '*' || comp === '' || comp === 'x' || comp === 'X') {
    return '>=0.0.0';
  }

  // Partial wildcard: 1.x or 1.2.x or 1.x.x
  const wildcardMatch = /^(\d+)\.([xX*])(?:\.[xX*])?$/.exec(comp);
  if (wildcardMatch) {
    const maj = parseInt(wildcardMatch[1], 10);
    return `>=${maj}.0.0 <${maj + 1}.0.0`;
  }
  const wildcardMatch2 = /^(\d+)\.(\d+)\.[xX*]$/.exec(comp);
  if (wildcardMatch2) {
    const maj = parseInt(wildcardMatch2[1], 10);
    const min = parseInt(wildcardMatch2[2], 10);
    return `>=${maj}.${min}.0 <${maj}.${min + 1}.0`;
  }

  // Caret ranges
  const caretMatch = /^\^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(comp);
  if (caretMatch) {
    const maj = parseInt(caretMatch[1], 10);
    const min = parseInt(caretMatch[2], 10);
    const pat = parseInt(caretMatch[3], 10);
    const pre = caretMatch[4] ? `-${caretMatch[4]}` : '';
    if (maj > 0) {
      return `>=${maj}.${min}.${pat}${pre} <${maj + 1}.0.0`;
    } else if (min > 0) {
      return `>=${maj}.${min}.${pat}${pre} <0.${min + 1}.0`;
    } else {
      return `>=${maj}.${min}.${pat}${pre} <0.0.${pat + 1}`;
    }
  }
  // Caret with partial: ^1.2 or ^1
  const caretPartial2 = /^\^(\d+)\.(\d+)$/.exec(comp);
  if (caretPartial2) {
    const maj = parseInt(caretPartial2[1], 10);
    const min = parseInt(caretPartial2[2], 10);
    if (maj > 0) return `>=${maj}.${min}.0 <${maj + 1}.0.0`;
    return `>=${maj}.${min}.0 <0.${min + 1}.0`;
  }
  const caretPartial1 = /^\^(\d+)$/.exec(comp);
  if (caretPartial1) {
    const maj = parseInt(caretPartial1[1], 10);
    return `>=${maj}.0.0 <${maj + 1}.0.0`;
  }

  // Tilde ranges
  const tildeMatch = /^~(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(comp);
  if (tildeMatch) {
    const maj = parseInt(tildeMatch[1], 10);
    const min = parseInt(tildeMatch[2], 10);
    const pat = parseInt(tildeMatch[3], 10);
    const pre = tildeMatch[4] ? `-${tildeMatch[4]}` : '';
    return `>=${maj}.${min}.${pat}${pre} <${maj}.${min + 1}.0`;
  }
  const tildePartial2 = /^~(\d+)\.(\d+)$/.exec(comp);
  if (tildePartial2) {
    const maj = parseInt(tildePartial2[1], 10);
    const min = parseInt(tildePartial2[2], 10);
    return `>=${maj}.${min}.0 <${maj}.${min + 1}.0`;
  }
  const tildePartial1 = /^~(\d+)$/.exec(comp);
  if (tildePartial1) {
    const maj = parseInt(tildePartial1[1], 10);
    return `>=${maj}.0.0 <${maj + 1}.0.0`;
  }

  // Already a standard comparator or exact version
  return comp;
}

// Parse a single comparator string (e.g. ">=1.2.3") into a RangeComparator
function parseComparator(comp: string): RangeComparator | null {
  comp = comp.trim();
  const m = /^(>=|<=|>|<|=)(.+)$/.exec(comp);
  if (m) {
    const op = m[1] as RangeComparator['operator'];
    const v = parse(m[2].trim());
    if (!v) return null;
    return { operator: op, version: v };
  }
  // bare version = exact match
  const v = parse(comp);
  if (v) return { operator: '=', version: v };
  return null;
}

// Test a single version against a single comparator
function testComparator(version: SemVer, comp: RangeComparator): boolean {
  const c = compare(toString(version), toString(comp.version));
  switch (comp.operator) {
    case '>=': return c >= 0;
    case '>':  return c > 0;
    case '<=': return c <= 0;
    case '<':  return c < 0;
    case '=':  return c === 0;
  }
}

// Parse an AND group (space-separated comparators, already expanded)
function parseAndGroup(group: string): RangeComparator[] {
  const parts = group.trim().split(/\s+/).filter(Boolean);
  const result: RangeComparator[] = [];
  for (const p of parts) {
    const c = parseComparator(p);
    if (c) result.push(c);
  }
  return result;
}

// Expand a full range string (possibly with ||) to comparator sets
function expandRange(range: string): RangeComparator[][] {
  const orGroups = range.split('||').map((s) => s.trim());
  const result: RangeComparator[][] = [];
  for (const group of orGroups) {
    // Split into individual tokens while preserving hyphen ranges
    const expanded = expandComparator(group);
    const andGroup = parseAndGroup(expanded);
    if (andGroup.length > 0) result.push(andGroup);
  }
  return result;
}

export function toComparatorSet(range: string): RangeComparator[][] {
  return expandRange(range);
}

export function satisfies(version: string, range: string): boolean {
  const v = parse(version);
  if (!v) return false;
  const comparatorSets = expandRange(range);
  if (comparatorSets.length === 0) return false;
  // OR: any AND group must fully match
  return comparatorSets.some((andGroup) => andGroup.every((comp) => testComparator(v, comp)));
}

export function validRange(range: string): boolean {
  try {
    const sets = expandRange(range);
    return sets.length > 0;
  } catch {
    return false;
  }
}

export function minSatisfying(versions: string[], range: string): string | null {
  const sorted = sort(versions, 'asc');
  return sorted.find((v) => satisfies(v, range)) ?? null;
}

export function maxSatisfying(versions: string[], range: string): string | null {
  const sorted = sort(versions, 'desc');
  return sorted.find((v) => satisfies(v, range)) ?? null;
}

export function outside(version: string, range: string, hilo: 'high' | 'low'): boolean {
  if (hilo === 'high') return gtr(version, range);
  return ltr(version, range);
}

export function gtr(version: string, range: string): boolean {
  // version is greater than all versions in range
  const comparatorSets = expandRange(range);
  for (const andGroup of comparatorSets) {
    // For this AND group, find the highest upper bound
    // If version is above all upper bounds and above all lower bounds, it's gtr
    let isGtr = true;
    for (const comp of andGroup) {
      // If there's a constraint that version doesn't exceed, it's not gtr
      if (comp.operator === '<' || comp.operator === '<=') {
        const c = compare(version, toString(comp.version));
        if (c <= 0) { isGtr = false; break; }
      }
      if (comp.operator === '=' || comp.operator === '>=' || comp.operator === '>') {
        // version must be strictly greater than this comparator's version to be outside
        // (it should fail the range itself)
      }
    }
    if (isGtr && !satisfies(version, range)) return true;
  }
  return !satisfies(version, range) && (function() {
    // fallback: version > maxSatisfying if we can determine
    const sets = expandRange(range);
    for (const andGroup of sets) {
      for (const comp of andGroup) {
        if (comp.operator === '<' || comp.operator === '<=') {
          if (compare(version, toString(comp.version)) >= 0) return true;
        }
      }
    }
    return false;
  })();
}

export function ltr(version: string, range: string): boolean {
  if (satisfies(version, range)) return false;
  const sets = expandRange(range);
  for (const andGroup of sets) {
    for (const comp of andGroup) {
      if (comp.operator === '>' || comp.operator === '>=') {
        if (compare(version, toString(comp.version)) < 0) return true;
      }
      if (comp.operator === '=') {
        if (compare(version, toString(comp.version)) < 0) return true;
      }
    }
  }
  return false;
}

export function intersects(r1: string, r2: string): boolean {
  // Two ranges intersect if there exists a version satisfying both.
  // We test a sample of boundary versions from both ranges.
  const sets1 = expandRange(r1);
  const sets2 = expandRange(r2);
  const candidates: string[] = [];

  // Collect all boundary versions
  for (const group of [...sets1, ...sets2]) {
    for (const comp of group) {
      const v = toString(comp.version);
      candidates.push(v);
      // Also test adjacent versions
      const p = parse(v);
      if (p) {
        if (p.patch > 0) candidates.push(`${p.major}.${p.minor}.${p.patch - 1}`);
        candidates.push(`${p.major}.${p.minor}.${p.patch + 1}`);
      }
    }
  }

  return candidates.some((v) => {
    const pv = parse(v);
    if (!pv) return false;
    return satisfies(v, r1) && satisfies(v, r2);
  });
}
