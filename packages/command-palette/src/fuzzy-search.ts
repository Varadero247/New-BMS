// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Command, SearchResult } from './types';

/**
 * Computes a fuzzy match score (0–100) between query and target.
 *
 * Scoring tiers:
 *   100 — exact match (case-insensitive)
 *    90 — target starts with query
 *    70 — target contains query as substring
 *    50 — all query characters appear in order (fuzzy)
 *     0 — no match
 */
export function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (q === t) return 100;

  // Starts with
  if (t.startsWith(q)) return 90;

  // Contains as substring
  if (t.includes(q)) return 70;

  // Fuzzy: all chars in order
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  if (qi === q.length) return 50;

  return 0;
}

/**
 * Filters and sorts commands by fuzzy match score against the query.
 * Searches label, description, and keywords.
 * Returns results sorted by score descending; zero-score items are excluded.
 */
export function fuzzyFilter(query: string, commands: Command[]): SearchResult[] {
  if (!query) {
    // Return all commands with a neutral score of 1 when query is empty
    return commands.map((command) => ({
      command,
      score: 1,
      matchedQuery: query,
    }));
  }

  const results: SearchResult[] = [];

  for (const command of commands) {
    let best = 0;

    // Score against label
    const labelScore = fuzzyScore(query, command.label);
    if (labelScore > best) best = labelScore;

    // Score against description
    if (command.description) {
      const descScore = fuzzyScore(query, command.description);
      if (descScore > best) best = descScore;
    }

    // Score against keywords
    if (command.keywords && command.keywords.length > 0) {
      for (const kw of command.keywords) {
        const kwScore = fuzzyScore(query, kw);
        if (kwScore > best) best = kwScore;
      }
    }

    if (best > 0) {
      results.push({ command, score: best, matchedQuery: query });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Returns the target string with matched portions wrapped in `**...**`.
 * For substring matches, wraps the matching substring.
 * For fuzzy matches, wraps each individually matched character.
 * If no match, returns the original text unchanged.
 */
export function highlightMatches(query: string, text: string): string {
  if (!query || !text) return text;

  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match — wrap entire text
  if (q === t) return `**${text}**`;

  // Substring match — wrap the first occurrence
  const idx = t.indexOf(q);
  if (idx !== -1) {
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return `${before}**${match}**${after}`;
  }

  // Starts-with handled by the substring check above

  // Fuzzy: wrap each matched character
  let qi = 0;
  let result = '';
  for (let ti = 0; ti < text.length; ti++) {
    if (qi < q.length && text[ti].toLowerCase() === q[qi]) {
      result += `**${text[ti]}**`;
      qi++;
    } else {
      result += text[ti];
    }
  }

  if (qi === q.length) return result;

  // No match
  return text;
}
