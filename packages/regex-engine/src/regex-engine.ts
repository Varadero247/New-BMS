// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface RegexMatch {
  index: number;
  value: string;
}

/**
 * Converts an IMS pattern string (supporting literals, ., *, +, ?, |, (), ^, $,
 * character classes [abc], [a-z], [^abc]) into a native JS RegExp.
 * The native RegExp is used internally for all matching operations.
 */
function buildNativeRegex(pattern: string, flags: string = ''): RegExp {
  // The pattern is already a valid regex syntax subset we support, so we can
  // pass it directly to RegExp. The wrapper API provides the clean interface.
  return new RegExp(pattern, flags);
}

export class RegexEngine {
  private readonly pattern: string;
  private readonly nativeRegex: RegExp;
  private readonly globalRegex: RegExp;
  private readonly fullMatchRegex: RegExp;

  constructor(pattern: string) {
    this.pattern = pattern;
    this.nativeRegex = buildNativeRegex(pattern);
    this.globalRegex = buildNativeRegex(pattern, 'g');
    // For fullMatch we anchor the pattern if not already anchored
    const anchored = pattern.startsWith('^') && pattern.endsWith('$')
      ? pattern
      : pattern.startsWith('^')
        ? pattern.endsWith('$') ? pattern : pattern + '$'
        : pattern.endsWith('$')
          ? '^' + pattern
          : '^(?:' + pattern + ')$';
    this.fullMatchRegex = buildNativeRegex(anchored);
  }

  /** Returns true if the pattern matches anywhere in the input. */
  test(input: string): boolean {
    this.nativeRegex.lastIndex = 0;
    return this.nativeRegex.test(input);
  }

  /** Returns the first match with its index, or null if no match. */
  match(input: string): RegexMatch | null {
    this.nativeRegex.lastIndex = 0;
    const result = this.nativeRegex.exec(input);
    if (!result) return null;
    return { index: result.index, value: result[0] };
  }

  /** Alias for match(). */
  exec(input: string): RegexMatch | null {
    return this.match(input);
  }

  /** Returns all non-overlapping matches. */
  matchAll(input: string): RegexMatch[] {
    const matches: RegexMatch[] = [];
    const re = buildNativeRegex(this.pattern, 'g');
    let result: RegExpExecArray | null;
    while ((result = re.exec(input)) !== null) {
      matches.push({ index: result.index, value: result[0] });
      // Prevent infinite loop on zero-length matches
      if (result[0].length === 0) re.lastIndex++;
    }
    return matches;
  }

  /** Returns true only if the entire input string matches the pattern. */
  fullMatch(input: string): boolean {
    this.fullMatchRegex.lastIndex = 0;
    return this.fullMatchRegex.test(input);
  }

  /** Replaces the first match with the replacement string. */
  replace(input: string, replacement: string): string {
    return input.replace(this.nativeRegex, replacement);
  }

  /** Replaces all non-overlapping matches with the replacement string. */
  replaceAll(input: string, replacement: string): string {
    return input.replace(this.globalRegex, replacement);
  }
}

/** Tests whether pattern matches anywhere in input. */
export function regexTest(pattern: string, input: string): boolean {
  return new RegexEngine(pattern).test(input);
}

/** Returns first match or null. */
export function regexMatch(pattern: string, input: string): RegexMatch | null {
  return new RegexEngine(pattern).match(input);
}

/** Returns all non-overlapping matches. */
export function regexMatchAll(pattern: string, input: string): RegexMatch[] {
  return new RegexEngine(pattern).matchAll(input);
}

/** Replaces all matches in input with replacement. */
export function regexReplace(pattern: string, input: string, replacement: string): string {
  return new RegexEngine(pattern).replaceAll(input, replacement);
}

/** Escapes all special regex characters in s so it can be used as a literal pattern. */
export function escapeRegex(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
