// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  TemplateContext,
  TemplateOptions,
  CompiledTemplate,
  Helper,
  PartialMap,
  TemplateError,
  Token,
  TokenKind,
} from './types';

// Re-export all public types so consumers can import from this module directly.
export {
  TemplateContext,
  TemplateOptions,
  CompiledTemplate,
  Helper,
  PartialMap,
  TemplateError,
  Token,
  TokenKind,
} from './types';

// ---------------------------------------------------------------------------
// HTML escape / unescape utilities
// ---------------------------------------------------------------------------

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const UNESCAPE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ESCAPE_MAP).map(([k, v]) => [v, k])
);

/**
 * Escape HTML special characters in `str`.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

/**
 * Reverse the HTML escaping applied by `escapeHtml`.
 */
export function unescapeHtml(str: string): string {
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;/g, (entity) => UNESCAPE_MAP[entity] ?? entity);
}

// ---------------------------------------------------------------------------
// Global registry
// ---------------------------------------------------------------------------

const globalHelpers = new Map<string, Helper>();
const globalPartials = new Map<string, string>();

// ---------------------------------------------------------------------------
// Built-in helpers
// ---------------------------------------------------------------------------

function registerBuiltins(): void {
  // Built-in helpers now receive raw resolved values (unknown type).
  globalHelpers.set('upper', (_ctx, ...args) => {
    return String(args[0] ?? '').toUpperCase();
  });
  globalHelpers.set('lower', (_ctx, ...args) => {
    return String(args[0] ?? '').toLowerCase();
  });
  globalHelpers.set('trim', (_ctx, ...args) => {
    return String(args[0] ?? '').trim();
  });
  globalHelpers.set('length', (_ctx, ...args) => {
    const val = args[0];
    if (Array.isArray(val)) return String(val.length);
    return String(String(val ?? '').length);
  });
  globalHelpers.set('default', (_ctx, ...args) => {
    const val = args[0];
    const fallback = String(args[1] ?? '');
    if (val === undefined || val === null || val === '' || val === false || val === 0) {
      return fallback;
    }
    return String(val);
  });
  globalHelpers.set('json', (_ctx, ...args) => {
    try {
      return JSON.stringify(args[0]);
    } catch {
      return '';
    }
  });
}

registerBuiltins();

// ---------------------------------------------------------------------------
// Public registry functions
// ---------------------------------------------------------------------------

/** Register a named helper in the global registry. */
export function registerHelper(name: string, fn: Helper): void {
  globalHelpers.set(name, fn);
}

/** Remove a named helper from the global registry. */
export function unregisterHelper(name: string): void {
  globalHelpers.delete(name);
}

/** Register a named partial in the global registry. */
export function registerPartial(name: string, template: string): void {
  globalPartials.set(name, template);
}

/** Remove a named partial from the global registry. */
export function unregisterPartial(name: string): void {
  globalPartials.delete(name);
}

/** Return the names of all currently registered helpers. */
export function getRegisteredHelpers(): string[] {
  return [...globalHelpers.keys()];
}

/** Return the names of all currently registered partials. */
export function getRegisteredPartials(): string[] {
  return [...globalPartials.keys()];
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Convert a template source string into a flat array of tokens.
 *
 * Supported mustache patterns (in order of precedence):
 *   {{{…}}}   → RAW_VARIABLE
 *   {{!…}}    → COMMENT
 *   {{#…}}    → BLOCK_OPEN
 *   {{/…}}    → BLOCK_CLOSE
 *   {{else}}  → BLOCK_ELSE
 *   {{>…}}    → PARTIAL
 *   {{…}}     → VARIABLE
 */
export function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  // Matches (in priority order):
  // 1. {{{...}}} raw variable
  // 2. {{! comment }}
  // 3. {{# block open }}
  // 4. {{/ block close }}
  // 5. {{else}}
  // 6. {{> partial }}
  // 7. {{ variable }}
  const TAG_RE = /\{\{\{([\s\S]*?)\}\}\}|\{\{([\s\S]*?)\}\}/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_RE.exec(template)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    // Capture any raw text before this tag.
    if (start > lastIndex) {
      tokens.push({ kind: TokenKind.TEXT, value: template.slice(lastIndex, start) });
    }

    if (match[1] !== undefined) {
      // Triple-stash {{{ … }}}
      tokens.push({ kind: TokenKind.RAW_VARIABLE, value: match[1].trim() });
    } else {
      const inner = match[2].trim();

      if (inner.startsWith('!')) {
        tokens.push({ kind: TokenKind.COMMENT, value: inner.slice(1).trim() });
      } else if (inner === 'else') {
        tokens.push({ kind: TokenKind.BLOCK_ELSE, value: 'else' });
      } else if (inner.startsWith('#')) {
        tokens.push({ kind: TokenKind.BLOCK_OPEN, value: inner.slice(1).trim() });
      } else if (inner.startsWith('/')) {
        tokens.push({ kind: TokenKind.BLOCK_CLOSE, value: inner.slice(1).trim() });
      } else if (inner.startsWith('>')) {
        tokens.push({ kind: TokenKind.PARTIAL, value: inner.slice(1).trim() });
      } else {
        tokens.push({ kind: TokenKind.VARIABLE, value: inner });
      }
    }

    lastIndex = end;
  }

  // Remaining text after the last tag.
  if (lastIndex < template.length) {
    tokens.push({ kind: TokenKind.TEXT, value: template.slice(lastIndex) });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Context path resolution (dot notation + array index)
// ---------------------------------------------------------------------------

function resolvePath(context: TemplateContext, path: string): unknown {
  // Special iteration variables injected by #each.
  if (path === 'this') return context['this'];
  if (path === '@index') return context['@index'];
  if (path === '@first') return context['@first'];
  if (path === '@last') return context['@last'];

  const parts = path.split('.');
  let current: unknown = context;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      current = isNaN(idx) ? undefined : (current as unknown[])[idx];
    } else {
      return undefined;
    }
  }

  return current;
}

// ---------------------------------------------------------------------------
// AST node types (internal)
// ---------------------------------------------------------------------------

type AstNode =
  | { type: 'text'; value: string }
  | { type: 'variable'; path: string; raw: boolean }
  | { type: 'helper'; name: string; args: string[] }
  | { type: 'comment' }
  | { type: 'if'; condition: string; consequent: AstNode[]; alternate: AstNode[] }
  | { type: 'unless'; condition: string; body: AstNode[] }
  | { type: 'each'; path: string; body: AstNode[] }
  | { type: 'with'; path: string; body: AstNode[] }
  | { type: 'partial'; name: string };

// ---------------------------------------------------------------------------
// Parser: tokens → AST
// ---------------------------------------------------------------------------

function parse(tokens: Token[]): AstNode[] {
  let pos = 0;

  function parseNodes(stopTag?: string): AstNode[] {
    const nodes: AstNode[] = [];

    while (pos < tokens.length) {
      const tok = tokens[pos];

      if (tok.kind === TokenKind.BLOCK_CLOSE) {
        const tagName = tok.value.trim().split(/\s+/)[0];
        if (stopTag !== undefined && tagName === stopTag) {
          pos++; // consume the close tag
          return nodes;
        }
        // Unexpected close tag — treat as text to be lenient.
        nodes.push({ type: 'text', value: `{{/${tok.value}}}` });
        pos++;
        continue;
      }

      if (tok.kind === TokenKind.BLOCK_ELSE) {
        // The caller (parseIf / parseUnless) handles this sentinel.
        return nodes;
      }

      switch (tok.kind) {
        case TokenKind.TEXT:
          nodes.push({ type: 'text', value: tok.value });
          pos++;
          break;

        case TokenKind.COMMENT:
          nodes.push({ type: 'comment' });
          pos++;
          break;

        case TokenKind.RAW_VARIABLE:
          nodes.push({ type: 'variable', path: tok.value, raw: true });
          pos++;
          break;

        case TokenKind.VARIABLE: {
          const parts = tok.value.split(/\s+/);
          const head = parts[0];
          if (parts.length > 1) {
            // Potential helper call: {{helperName arg1 arg2 …}}
            nodes.push({ type: 'helper', name: head, args: parts.slice(1) });
          } else {
            nodes.push({ type: 'variable', path: head, raw: false });
          }
          pos++;
          break;
        }

        case TokenKind.PARTIAL:
          nodes.push({ type: 'partial', name: tok.value });
          pos++;
          break;

        case TokenKind.BLOCK_OPEN: {
          const openValue = tok.value.trim();
          const openParts = openValue.split(/\s+/);
          const directive = openParts[0];
          const arg = openParts.slice(1).join(' ');
          pos++; // consume the open tag

          if (directive === 'if') {
            const consequent = parseNodes('if_else_sentinel');

            // Check if we stopped at an else.
            let alternate: AstNode[] = [];
            if (pos <= tokens.length) {
              const prevIdx = pos - 1;
              if (prevIdx >= 0 && tokens[prevIdx]?.kind === TokenKind.BLOCK_ELSE) {
                alternate = parseNodes('if');
              } else {
                // parseNodes consumed the /if close — no else branch
              }
            }
            nodes.push({ type: 'if', condition: arg, consequent, alternate });
          } else if (directive === 'unless') {
            const body = parseNodes('unless');
            nodes.push({ type: 'unless', condition: arg, body });
          } else if (directive === 'each') {
            const body = parseNodes('each');
            nodes.push({ type: 'each', path: arg, body });
          } else if (directive === 'with') {
            const body = parseNodes('with');
            nodes.push({ type: 'with', path: arg, body });
          } else {
            // Unknown block directive — parse body then discard.
            parseNodes(directive);
          }
          break;
        }

        default:
          pos++;
          break;
      }
    }

    return nodes;
  }

  // We need a proper if/else split. Re-implement using a stack-based approach.
  return parseNodes();
}

// ---------------------------------------------------------------------------
// The real parser (stack-based, handles {{else}} correctly)
// ---------------------------------------------------------------------------

function parseTemplate(tokens: Token[]): AstNode[] {
  interface Frame {
    directive: string;
    arg: string;
    nodes: AstNode[];
    elseNodes?: AstNode[];
    inElse: boolean;
  }

  const stack: Frame[] = [{ directive: 'root', arg: '', nodes: [], inElse: false }];

  function top(): Frame {
    return stack[stack.length - 1];
  }

  function appendNode(node: AstNode): void {
    const frame = top();
    if (frame.inElse) {
      (frame.elseNodes ??= []).push(node);
    } else {
      frame.nodes.push(node);
    }
  }

  for (const tok of tokens) {
    switch (tok.kind) {
      case TokenKind.TEXT:
        appendNode({ type: 'text', value: tok.value });
        break;

      case TokenKind.COMMENT:
        appendNode({ type: 'comment' });
        break;

      case TokenKind.RAW_VARIABLE:
        appendNode({ type: 'variable', path: tok.value, raw: true });
        break;

      case TokenKind.VARIABLE: {
        const parts = tok.value.split(/\s+/);
        const head = parts[0];
        if (parts.length > 1) {
          appendNode({ type: 'helper', name: head, args: parts.slice(1) });
        } else {
          appendNode({ type: 'variable', path: head, raw: false });
        }
        break;
      }

      case TokenKind.PARTIAL:
        appendNode({ type: 'partial', name: tok.value });
        break;

      case TokenKind.BLOCK_OPEN: {
        const openParts = tok.value.trim().split(/\s+/);
        const directive = openParts[0];
        const arg = openParts.slice(1).join(' ');
        stack.push({ directive, arg, nodes: [], inElse: false });
        break;
      }

      case TokenKind.BLOCK_ELSE: {
        const frame = top();
        frame.inElse = true;
        frame.elseNodes = [];
        break;
      }

      case TokenKind.BLOCK_CLOSE: {
        const closeTag = tok.value.trim().split(/\s+/)[0];
        const frame = stack.pop();
        if (!frame || frame.directive === 'root') {
          // Unmatched close — skip.
          if (frame) stack.push(frame);
          break;
        }

        if (frame.directive !== closeTag) {
          // Mismatched close — skip.
          stack.push(frame);
          break;
        }

        let node: AstNode;
        switch (frame.directive) {
          case 'if':
            node = {
              type: 'if',
              condition: frame.arg,
              consequent: frame.nodes,
              alternate: frame.elseNodes ?? [],
            };
            break;
          case 'unless':
            node = { type: 'unless', condition: frame.arg, body: frame.nodes };
            break;
          case 'each':
            node = { type: 'each', path: frame.arg, body: frame.nodes };
            break;
          case 'with':
            node = { type: 'with', path: frame.arg, body: frame.nodes };
            break;
          default:
            // Unknown directive — render children directly.
            top().nodes.push(...frame.nodes);
            continue;
        }

        appendNode(node);
        break;
      }
    }
  }

  // Pop any unclosed frames (lenient).
  while (stack.length > 1) {
    const frame = stack.pop()!;
    top().nodes.push(...frame.nodes);
  }

  return stack[0].nodes;
}

// Silence the unused `parse` function (we use `parseTemplate` everywhere).
void parse;

// ---------------------------------------------------------------------------
// Evaluator: AST + context → string
// ---------------------------------------------------------------------------

function evaluate(
  nodes: AstNode[],
  context: TemplateContext,
  options: TemplateOptions,
  localHelpers: Map<string, Helper>,
  localPartials: Map<string, string>,
  depth: number
): string {
  const maxDepth = options.maxDepth ?? 10;
  if (depth > maxDepth) {
    throw new TemplateError(`Maximum template recursion depth (${maxDepth}) exceeded`);
  }

  const parts: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        parts.push(node.value);
        break;

      case 'comment':
        // Comments produce no output.
        break;

      case 'variable': {
        const raw = resolvePath(context, node.path);
        const str = raw === undefined || raw === null ? '' : String(raw);
        if (node.raw || options.noEscape) {
          parts.push(str);
        } else {
          parts.push(escapeHtml(str));
        }
        break;
      }

      case 'helper': {
        const helperFn =
          localHelpers.get(node.name) ??
          globalHelpers.get(node.name);

        if (helperFn) {
          // Resolve each argument token to its raw value for the helper.
          // Quoted literals are stripped and passed as strings.
          // Context paths are resolved to their raw values (unknown type).
          // If a path is not found in context, undefined is passed.
          const resolvedArgs = node.args.map((arg): unknown => {
            // Quoted literal?
            if (
              (arg.startsWith('"') && arg.endsWith('"')) ||
              (arg.startsWith("'") && arg.endsWith("'"))
            ) {
              return arg.slice(1, -1);
            }
            return resolvePath(context, arg);
          });
          parts.push(helperFn(context, ...resolvedArgs));
        } else {
          // Unknown helper — attempt plain variable interpolation of first token.
          const val = resolvePath(context, node.name);
          const str = val === undefined || val === null ? '' : String(val);
          parts.push(options.noEscape ? str : escapeHtml(str));
        }
        break;
      }

      case 'if': {
        const val = resolvePath(context, node.condition);
        const truthy = isTruthy(val);
        const branch = truthy ? node.consequent : node.alternate;
        parts.push(evaluate(branch, context, options, localHelpers, localPartials, depth + 1));
        break;
      }

      case 'unless': {
        const val = resolvePath(context, node.condition);
        if (!isTruthy(val)) {
          parts.push(evaluate(node.body, context, options, localHelpers, localPartials, depth + 1));
        }
        break;
      }

      case 'each': {
        const val = resolvePath(context, node.path);
        if (!Array.isArray(val)) break;
        const arr = val as unknown[];
        arr.forEach((item, idx) => {
          const childCtx: TemplateContext = {
            ...context,
            this: item,
            '@index': idx,
            '@first': idx === 0,
            '@last': idx === arr.length - 1,
            // If item is an object, spread its keys into the child context.
            ...(item !== null && typeof item === 'object' ? (item as TemplateContext) : {}),
          };
          parts.push(evaluate(node.body, childCtx, options, localHelpers, localPartials, depth + 1));
        });
        break;
      }

      case 'with': {
        const val = resolvePath(context, node.path);
        if (val === null || val === undefined) break;
        const childCtx: TemplateContext =
          typeof val === 'object'
            ? { ...context, ...(val as TemplateContext) }
            : { ...context, this: val };
        parts.push(evaluate(node.body, childCtx, options, localHelpers, localPartials, depth + 1));
        break;
      }

      case 'partial': {
        const src =
          localPartials.get(node.name) ??
          globalPartials.get(node.name) ??
          (options.partials ? options.partials[node.name] : undefined);

        if (src === undefined) {
          throw new TemplateError(`Partial "${node.name}" is not registered`);
        }

        const partialAst = parseTemplate(tokenize(src));
        parts.push(evaluate(partialAst, context, options, localHelpers, localPartials, depth + 1));
        break;
      }
    }
  }

  return parts.join('');
}

// ---------------------------------------------------------------------------
// Truthiness helper
// ---------------------------------------------------------------------------

function isTruthy(val: unknown): boolean {
  if (val === false || val === null || val === undefined || val === 0 || val === '') return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compile a template string into a reusable `CompiledTemplate` function.
 */
export function compile(template: string, options: TemplateOptions = {}): CompiledTemplate {
  const tokens = tokenize(template);
  const ast = parseTemplate(tokens);

  // Build local registries from call-site options.
  const localHelpers = new Map<string, Helper>(
    options.helpers ? Object.entries(options.helpers) : []
  );
  const localPartials = new Map<string, string>(
    options.partials ? Object.entries(options.partials) : []
  );

  return (ctx: TemplateContext): string => {
    return evaluate(ast, ctx, options, localHelpers, localPartials, 0);
  };
}

/**
 * Compile and immediately execute a template.
 */
export function render(
  template: string,
  context: TemplateContext,
  options: TemplateOptions = {}
): string {
  return compile(template, options)(context);
}

/**
 * Like `render` but catches all errors and returns an empty string instead.
 */
export function renderSafe(
  template: string,
  context: TemplateContext,
  options: TemplateOptions = {}
): string {
  try {
    return render(template, context, options);
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Isolated engine factory
// ---------------------------------------------------------------------------

/**
 * Create a self-contained engine instance with its own helper / partial
 * registries that do not share state with the global registries.
 */
export function createEngine(options: TemplateOptions = {}): {
  compile: (template: string, opts?: TemplateOptions) => CompiledTemplate;
  render: (template: string, context: TemplateContext, opts?: TemplateOptions) => string;
  registerHelper: (name: string, fn: Helper) => void;
  registerPartial: (name: string, template: string) => void;
} {
  const instanceHelpers = new Map<string, Helper>();
  const instancePartials = new Map<string, string>();

  // Seed with built-ins.
  globalHelpers.forEach((fn, name) => instanceHelpers.set(name, fn));

  function instanceCompile(
    template: string,
    opts: TemplateOptions = {}
  ): CompiledTemplate {
    const mergedOptions: TemplateOptions = { ...options, ...opts };
    const localHelpers = new Map<string, Helper>(instanceHelpers);
    if (opts.helpers) {
      Object.entries(opts.helpers).forEach(([k, v]) => localHelpers.set(k, v));
    }
    const localPartials = new Map<string, string>(instancePartials);
    if (opts.partials) {
      Object.entries(opts.partials).forEach(([k, v]) => localPartials.set(k, v));
    }

    const tokens = tokenize(template);
    const ast = parseTemplate(tokens);

    return (ctx: TemplateContext): string => {
      return evaluate(ast, ctx, mergedOptions, localHelpers, localPartials, 0);
    };
  }

  function instanceRender(
    template: string,
    context: TemplateContext,
    opts: TemplateOptions = {}
  ): string {
    return instanceCompile(template, opts)(context);
  }

  return {
    compile: instanceCompile,
    render: instanceRender,
    registerHelper: (name, fn) => instanceHelpers.set(name, fn),
    registerPartial: (name, tpl) => instancePartials.set(name, tpl),
  };
}
