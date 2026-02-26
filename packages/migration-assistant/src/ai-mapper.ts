// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { DetectedFileStructure, MappingSuggestion, TargetModule } from './types';
import { MIGRATION_SCHEMAS } from './schema-registry';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('migration-assistant:ai-mapper');

// Simple in-memory cache (keyed by fileHash + module)
const suggestionCache = new Map<string, { suggestions: MappingSuggestion[]; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashStructure(structure: DetectedFileStructure, module: TargetModule): string {
  return `${structure.headers.sort().join('|')}::${module}`;
}

function buildPrompt(structure: DetectedFileStructure, targetModule: TargetModule): string {
  const schema = MIGRATION_SCHEMAS[targetModule];
  const schemaFields = Object.entries(schema.fields)
    .map(([key, f]) => `  - ${key}: ${f.label} (${f.type}${f.required ? ', required' : ''})${f.example ? `, e.g. "${f.example}"` : ''}`)
    .join('\n');

  const headers = structure.headers.join(', ');
  const sampleData = structure.sampleRows.slice(0, 3)
    .map(row => JSON.stringify(row))
    .join('\n');

  return `You are a data migration expert for Nexara IMS. Map source CSV headers to Nexara ${schema.title} fields.

Source headers: ${headers}
Sample data (3 rows):
${sampleData}

Target Nexara schema fields:
${schemaFields}

Return a JSON array of mapping suggestions. For each source header, suggest the best matching Nexara field.
If no match, use "SKIP". Only suggest mappings with confidence >= 0.4.

Return ONLY a JSON array with this structure:
[{ "sourceField": "SourceHeader", "suggestedTarget": "nexaraField", "confidence": 0.9, "reason": "...", "transformRequired": "..." }]`;
}

function parseAiResponse(text: string): MappingSuggestion[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    return parsed
      .filter((item): item is MappingSuggestion => {
        if (typeof item !== 'object' || item === null) return false;
        const obj = item as Record<string, unknown>;
        return typeof obj.sourceField === 'string' && typeof obj.suggestedTarget === 'string' && typeof obj.confidence === 'number';
      })
      .filter(s => s.confidence >= 0.4);
  } catch {
    return [];
  }
}

// Rule-based fallback mapper (no AI needed for obvious matches)
function ruleBasedSuggest(structure: DetectedFileStructure, targetModule: TargetModule): MappingSuggestion[] {
  const schema = MIGRATION_SCHEMAS[targetModule];
  const suggestions: MappingSuggestion[] = [];
  const headerLower = structure.headers.map(h => ({ original: h, lower: h.toLowerCase().replace(/[\s_\-]/g, '') }));

  for (const [fieldKey, fieldDef] of Object.entries(schema.fields)) {
    const fieldTokens = fieldKey.toLowerCase().replace(/[\s_\-]/g, '');
    const labelTokens = fieldDef.label.toLowerCase().replace(/[\s_\-]/g, '');

    for (const { original, lower } of headerLower) {
      let confidence = 0;
      let reason = '';

      if (lower === fieldTokens) {
        confidence = 0.95;
        reason = 'Exact field name match';
      } else if (lower === labelTokens) {
        confidence = 0.90;
        reason = 'Exact label match';
      } else if (lower.includes(fieldTokens) || fieldTokens.includes(lower)) {
        confidence = 0.70;
        reason = 'Partial field name match';
      } else if (lower.includes(labelTokens.slice(0, 5)) || labelTokens.includes(lower.slice(0, 5))) {
        confidence = 0.55;
        reason = 'Partial label match';
      }

      if (confidence >= 0.4) {
        suggestions.push({
          sourceField: original,
          suggestedTarget: fieldKey,
          confidence,
          reason,
          transformRequired: fieldDef.type === 'date' ? 'Convert to ISO 8601 date format' : undefined,
        });
      }
    }
  }

  // Deduplicate: keep highest confidence per source field
  const best = new Map<string, MappingSuggestion>();
  for (const s of suggestions) {
    const existing = best.get(s.sourceField);
    if (!existing || s.confidence > existing.confidence) {
      best.set(s.sourceField, s);
    }
  }

  return [...best.values()];
}

export async function suggestMappings(
  structure: DetectedFileStructure,
  targetModule: TargetModule,
): Promise<MappingSuggestion[]> {
  const cacheKey = hashStructure(structure, targetModule);
  const cached = suggestionCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.suggestions;
  }

  // Start with rule-based suggestions
  const ruleBased = ruleBasedSuggest(structure, targetModule);

  // Try AI enhancement if API key available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logger.warn('ANTHROPIC_API_KEY not set, using rule-based mapping only');
    suggestionCache.set(cacheKey, { suggestions: ruleBased, cachedAt: Date.now() });
    return ruleBased;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPrompt(structure, targetModule) }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const data = await response.json() as { content?: Array<{ text?: string }> };
      const aiText = data.content?.[0]?.text ?? '';
      const aiSuggestions = parseAiResponse(aiText);

      // Merge: AI suggestions take precedence when confidence is higher
      const merged = new Map<string, MappingSuggestion>();
      for (const s of [...ruleBased, ...aiSuggestions]) {
        const existing = merged.get(s.sourceField);
        if (!existing || s.confidence > existing.confidence) {
          merged.set(s.sourceField, s);
        }
      }

      const result = [...merged.values()].filter(s => s.confidence >= 0.4);
      suggestionCache.set(cacheKey, { suggestions: result, cachedAt: Date.now() });
      return result;
    }
  } catch (err) {
    logger.warn('AI mapping failed, using rule-based only', { error: String(err) });
  }

  suggestionCache.set(cacheKey, { suggestions: ruleBased, cachedAt: Date.now() });
  return ruleBased;
}
