// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A dictionary of values passed into a template at render time. */
export type TemplateContext = Record<string, unknown>;

/** Options that control engine behaviour. */
export interface TemplateOptions {
  /** When true, interpolation does NOT HTML-escape output. Default: false. */
  noEscape?: boolean;
  /** Maximum recursion depth for partials. Default: 10. */
  maxDepth?: number;
  /** Helpers available only for this compile/render call. */
  helpers?: Record<string, Helper>;
  /** Partials available only for this compile/render call. */
  partials?: PartialMap;
}

/** A compiled template function — call with a context to produce a string. */
export type CompiledTemplate = (ctx: TemplateContext) => string;

/** Signature for a helper function.
 * Arguments are the resolved values of each argument token from the template:
 * quoted string literals are stripped of quotes and passed as strings;
 * context path tokens are resolved to their raw context values (may be any type).
 */
export type Helper = (context: TemplateContext, ...args: unknown[]) => string;

/** A map of partial name → template source string. */
export type PartialMap = Record<string, string>;

/** Custom error class thrown by the template engine. */
export class TemplateError extends Error {
  public readonly templateSource?: string;
  public readonly position?: number;

  constructor(message: string, templateSource?: string, position?: number) {
    super(message);
    this.name = 'TemplateError';
    this.templateSource = templateSource;
    this.position = position;
    // Maintain proper prototype chain in transpiled ES5 output.
    Object.setPrototypeOf(this, TemplateError.prototype);
  }
}

/** Discriminated union tag for every token the lexer produces. */
export enum TokenKind {
  /** Raw text that is copied verbatim to the output. */
  TEXT = 'TEXT',
  /** `{{variable}}` — HTML-escaped interpolation. */
  VARIABLE = 'VARIABLE',
  /** `{{{variable}}}` — raw / unescaped interpolation. */
  RAW_VARIABLE = 'RAW_VARIABLE',
  /** `{{#if …}}` opening tag. */
  BLOCK_OPEN = 'BLOCK_OPEN',
  /** `{{else}}` within an if/unless block. */
  BLOCK_ELSE = 'BLOCK_ELSE',
  /** `{{/tag}}` closing tag. */
  BLOCK_CLOSE = 'BLOCK_CLOSE',
  /** `{{> partialName}}` partial invocation. */
  PARTIAL = 'PARTIAL',
  /** `{{! comment }}` — dropped from output. */
  COMMENT = 'COMMENT',
}

/** A single token produced by the lexer. */
export interface Token {
  kind: TokenKind;
  value: string;
}
