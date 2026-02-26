// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  XmlNode,
  XmlDocument,
  XmlBuildOptions,
  XmlParseOptions,
} from './types';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Escape special XML characters in text content or attribute values.
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Unescape XML entities back to their character equivalents.
 */
export function unescapeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Validate an XML name (tag or attribute name).
 * Per XML spec: starts with letter, underscore, or colon; followed by letters, digits,
 * hyphens, underscores, colons, or periods.
 */
export function isValidXmlName(name: string): boolean {
  if (!name || name.length === 0) return false;
  return /^[A-Za-z_:][\w\-.:]* *$/.test(name.trimEnd()) && !/\s/.test(name.trim());
}

// ---------------------------------------------------------------------------
// Internal tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { type: 'declaration'; attrs: Record<string, string> }
  | { type: 'open'; tag: string; attrs: Record<string, string>; selfClosing: boolean }
  | { type: 'close'; tag: string }
  | { type: 'text'; value: string };

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Match name="value", name='value', or name=value patterns
  const attrRegex = /([\w\-.:]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(raw)) !== null) {
    const key = m[1];
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : (m[4] ?? '');
    attrs[key] = unescapeXml(value);
  }
  return attrs;
}

function tokenize(xml: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = xml.length;

  while (i < len) {
    if (xml[i] === '<') {
      // Find the closing >
      let j = i + 1;

      // Comment: <!-- ... -->
      if (xml.startsWith('<!--', i)) {
        const end = xml.indexOf('-->', i + 4);
        i = end === -1 ? len : end + 3;
        continue;
      }

      // XML declaration: <?xml ... ?>
      if (xml.startsWith('<?xml', i)) {
        const end = xml.indexOf('?>', i + 2);
        const inner = end === -1 ? xml.slice(i + 5) : xml.slice(i + 5, end);
        const attrs = parseAttributes(inner);
        tokens.push({ type: 'declaration', attrs });
        i = end === -1 ? len : end + 2;
        continue;
      }

      // Processing instruction: <? ... ?>
      if (xml[i + 1] === '?') {
        const end = xml.indexOf('?>', i + 2);
        i = end === -1 ? len : end + 2;
        continue;
      }

      // DOCTYPE
      if (xml.startsWith('<!DOCTYPE', i) || xml.startsWith('<!doctype', i)) {
        const end = xml.indexOf('>', i);
        i = end === -1 ? len : end + 1;
        continue;
      }

      // Closing tag: </tag>
      if (xml[i + 1] === '/') {
        j = i + 2;
        while (j < len && xml[j] !== '>') j++;
        const tagName = xml.slice(i + 2, j).trim();
        tokens.push({ type: 'close', tag: tagName });
        i = j + 1;
        continue;
      }

      // Opening or self-closing tag
      j = i + 1;
      // We need to find '>' but be careful of quoted attribute values
      let inSingleQuote = false;
      let inDoubleQuote = false;
      while (j < len) {
        const ch = xml[j];
        if (ch === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        else if (ch === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        else if (ch === '>' && !inSingleQuote && !inDoubleQuote) break;
        j++;
      }
      const inner = xml.slice(i + 1, j);
      const selfClosing = inner.endsWith('/');
      const content = selfClosing ? inner.slice(0, -1).trim() : inner.trim();

      // Split on first whitespace to get tag name vs attributes
      const spaceIdx = content.search(/\s/);
      let tag: string;
      let attrStr: string;
      if (spaceIdx === -1) {
        tag = content;
        attrStr = '';
      } else {
        tag = content.slice(0, spaceIdx);
        attrStr = content.slice(spaceIdx + 1);
      }

      const attrs = parseAttributes(attrStr);
      tokens.push({ type: 'open', tag, attrs, selfClosing });
      i = j + 1;
    } else {
      // Text content
      const start = i;
      while (i < len && xml[i] !== '<') i++;
      const raw = xml.slice(start, i);
      const value = unescapeXml(raw);
      tokens.push({ type: 'text', value });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse an XML string into an XmlDocument tree.
 */
export function parseXml(xml: string, options?: XmlParseOptions): XmlDocument {
  const preserveWhitespace = options?.preserveWhitespace ?? false;
  const tokens = tokenize(xml.trim());

  let declaration: Record<string, string> | undefined;
  const stack: XmlNode[] = [];
  let root: XmlNode | undefined;

  for (const token of tokens) {
    if (token.type === 'declaration') {
      declaration = token.attrs;
      continue;
    }

    if (token.type === 'open') {
      const node: XmlNode = {
        tag: token.tag,
        attributes: token.attrs,
        children: [],
        selfClosing: token.selfClosing,
      };

      if (token.selfClosing) {
        if (stack.length === 0) {
          root = node;
        } else {
          stack[stack.length - 1].children.push(node);
        }
      } else {
        stack.push(node);
      }
      continue;
    }

    if (token.type === 'close') {
      if (stack.length === 0) continue;
      const node = stack.pop()!;
      // Trim trailing whitespace-only text children unless preserveWhitespace
      if (!preserveWhitespace && node.text !== undefined) {
        node.text = node.text.trim();
        if (node.text === '') delete node.text;
      }
      if (stack.length === 0) {
        root = node;
      } else {
        stack[stack.length - 1].children.push(node);
      }
      continue;
    }

    if (token.type === 'text') {
      if (stack.length === 0) continue;
      const current = stack[stack.length - 1];
      const text = preserveWhitespace ? token.value : token.value.trim();
      if (text.length > 0) {
        current.text = (current.text ?? '') + text;
      }
    }
  }

  if (!root) {
    throw new Error('No root element found in XML string');
  }

  return { declaration, root };
}

/**
 * Parse a single XML element string (no declaration).
 */
export function parseXmlNode(xml: string): XmlNode {
  const doc = parseXml(xml.trim());
  return doc.root;
}

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

/**
 * Serialize a single XmlNode to a compact one-liner string.
 */
export function nodeToString(node: XmlNode): string {
  const attrsStr = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join('');

  if (node.selfClosing && node.children.length === 0 && !node.text) {
    return `<${node.tag}${attrsStr}/>`;
  }

  const children = node.children.map(nodeToString).join('');
  const text = node.text ? escapeXml(node.text) : '';
  const inner = text + children;

  return `<${node.tag}${attrsStr}>${inner}</${node.tag}>`;
}

/**
 * Serialize a single XmlNode with indentation.
 */
export function buildXmlNode(
  node: XmlNode,
  indent: string = '  ',
  level: number = 0
): string {
  const pad = indent.repeat(level);
  const attrsStr = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join('');

  if (node.selfClosing && node.children.length === 0 && !node.text) {
    return `${pad}<${node.tag}${attrsStr}/>`;
  }

  const hasChildren = node.children.length > 0;
  const hasText = node.text !== undefined && node.text.length > 0;

  if (!hasChildren && !hasText) {
    return `${pad}<${node.tag}${attrsStr}></${node.tag}>`;
  }

  if (!hasChildren && hasText) {
    return `${pad}<${node.tag}${attrsStr}>${escapeXml(node.text!)}</${node.tag}>`;
  }

  const lines: string[] = [];
  lines.push(`${pad}<${node.tag}${attrsStr}>`);

  if (hasText) {
    lines.push(`${pad}${indent}${escapeXml(node.text!)}`);
  }

  for (const child of node.children) {
    lines.push(buildXmlNode(child, indent, level + 1));
  }

  lines.push(`${pad}</${node.tag}>`);
  return lines.join('\n');
}

/**
 * Serialize an XmlDocument to an XML string.
 */
export function buildXml(doc: XmlDocument, options?: XmlBuildOptions): string {
  const indent = options?.indent ?? '  ';
  const includeDeclaration = options?.declaration ?? (doc.declaration !== undefined);
  const lines: string[] = [];

  if (includeDeclaration) {
    const decl = doc.declaration ?? { version: '1.0', encoding: 'UTF-8' };
    const attrs = Object.entries(decl)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    lines.push(`<?xml ${attrs}?>`);
  }

  lines.push(buildXmlNode(doc.root, indent, 0));
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Querying
// ---------------------------------------------------------------------------

/**
 * Find all descendant nodes (depth-first) whose tag matches.
 */
export function findByTag(node: XmlNode, tag: string): XmlNode[] {
  const results: XmlNode[] = [];
  for (const child of node.children) {
    if (child.tag === tag) results.push(child);
    results.push(...findByTag(child, tag));
  }
  return results;
}

/**
 * Return the first descendant node whose tag matches, or undefined.
 */
export function findFirst(node: XmlNode, tag: string): XmlNode | undefined {
  for (const child of node.children) {
    if (child.tag === tag) return child;
    const found = findFirst(child, tag);
    if (found) return found;
  }
  return undefined;
}

/**
 * Find all descendant nodes that have the given attribute (with optional value filter).
 */
export function findByAttribute(
  node: XmlNode,
  attr: string,
  value?: string
): XmlNode[] {
  const results: XmlNode[] = [];
  for (const child of node.children) {
    const hasAttr = attr in child.attributes;
    const valueMatch = value === undefined || child.attributes[attr] === value;
    if (hasAttr && valueMatch) results.push(child);
    results.push(...findByAttribute(child, attr, value));
  }
  return results;
}

/**
 * Concatenate all text content in the tree recursively.
 */
export function getTextContent(node: XmlNode): string {
  let text = node.text ?? '';
  for (const child of node.children) {
    text += getTextContent(child);
  }
  return text;
}

/**
 * Return direct children whose tag matches.
 */
export function getChildrenByTag(node: XmlNode, tag: string): XmlNode[] {
  return node.children.filter((c) => c.tag === tag);
}

/**
 * Get an attribute value, returning defaultValue if absent.
 */
export function getAttribute(
  node: XmlNode,
  attr: string,
  defaultValue?: string
): string | undefined {
  if (attr in node.attributes) return node.attributes[attr];
  return defaultValue;
}

/**
 * Return true if the node has the given attribute.
 */
export function hasAttribute(node: XmlNode, attr: string): boolean {
  return attr in node.attributes;
}

/**
 * Count total nodes in the tree (including self).
 */
export function countNodes(node: XmlNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}

/**
 * Return the maximum nesting depth of the tree (root = depth 1).
 */
export function getDepth(node: XmlNode): number {
  if (node.children.length === 0) return 1;
  let max = 0;
  for (const child of node.children) {
    const d = getDepth(child);
    if (d > max) max = d;
  }
  return 1 + max;
}

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

/**
 * Apply a mapping function to every node in the tree (post-order: children first).
 * Returns a new tree — original is not mutated.
 */
export function mapNodes(
  node: XmlNode,
  fn: (n: XmlNode) => XmlNode
): XmlNode {
  const mappedChildren = node.children.map((c) => mapNodes(c, fn));
  return fn({ ...node, children: mappedChildren });
}

/**
 * Keep only nodes (and their subtrees) that satisfy the predicate.
 * The root is always kept; the predicate is applied to descendants.
 */
export function filterNodes(
  node: XmlNode,
  predicate: (n: XmlNode) => boolean
): XmlNode {
  const filteredChildren = node.children
    .filter(predicate)
    .map((c) => filterNodes(c, predicate));
  return { ...node, children: filteredChildren };
}

/**
 * Return a new node with the child appended (immutable).
 */
export function addChild(node: XmlNode, child: XmlNode): XmlNode {
  return { ...node, children: [...node.children, child] };
}

/**
 * Return a new node with the first child matching the tag removed (immutable).
 */
export function removeChild(node: XmlNode, tag: string): XmlNode {
  const idx = node.children.findIndex((c) => c.tag === tag);
  if (idx === -1) return node;
  const children = [...node.children.slice(0, idx), ...node.children.slice(idx + 1)];
  return { ...node, children };
}

/**
 * Return a new node with the given attribute set to value (immutable).
 */
export function setAttribute(
  node: XmlNode,
  attr: string,
  value: string
): XmlNode {
  return { ...node, attributes: { ...node.attributes, [attr]: value } };
}

/**
 * Return a new node with the given attribute removed (immutable).
 */
export function removeAttribute(node: XmlNode, attr: string): XmlNode {
  const { [attr]: _removed, ...rest } = node.attributes;
  return { ...node, attributes: rest };
}

/**
 * Convenience factory for creating an XmlNode.
 */
export function createNode(
  tag: string,
  attributes: Record<string, string> = {},
  text?: string
): XmlNode {
  const node: XmlNode = { tag, attributes, children: [] };
  if (text !== undefined) node.text = text;
  return node;
}

/**
 * Convenience factory for creating an XmlDocument.
 */
export function createDocument(
  root: XmlNode,
  declaration?: Record<string, string>
): XmlDocument {
  return { root, declaration };
}

// ---------------------------------------------------------------------------
// XML ↔ JSON conversion
// ---------------------------------------------------------------------------

/**
 * Convert an XmlNode tree to a plain JavaScript object.
 * - Attributes appear under "@attributes"
 * - Text content appears under "#text"
 * - Children are grouped by tag name; multiple siblings become an array
 */
export function xmlToJson(node: XmlNode): unknown {
  const obj: Record<string, unknown> = {};

  if (Object.keys(node.attributes).length > 0) {
    obj['@attributes'] = { ...node.attributes };
  }

  if (node.text) {
    obj['#text'] = node.text;
  }

  for (const child of node.children) {
    const childJson = xmlToJson(child);
    if (node.tag === child.tag) continue; // avoid self-nesting edge cases
    if (child.tag in obj) {
      const existing = obj[child.tag];
      if (Array.isArray(existing)) {
        existing.push(childJson);
      } else {
        obj[child.tag] = [existing, childJson];
      }
    } else {
      obj[child.tag] = childJson;
    }
  }

  return obj;
}

/**
 * Convert a plain JavaScript object to an XmlNode tree.
 * - Keys become child element tags
 * - String/number/boolean values become text content
 * - Array values produce multiple sibling elements with the same tag
 * - Nested objects recurse
 */
export function jsonToXml(
  obj: Record<string, unknown>,
  rootTag: string = 'root'
): XmlNode {
  const root = createNode(rootTag);
  const children: XmlNode[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key === '@attributes' || key === '#text') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          children.push(jsonToXml(item as Record<string, unknown>, key));
        } else {
          children.push(createNode(key, {}, String(item)));
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      children.push(jsonToXml(value as Record<string, unknown>, key));
    } else {
      children.push(createNode(key, {}, String(value ?? '')));
    }
  }

  return { ...root, children };
}
