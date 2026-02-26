// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface HuffmanNode {
  symbol: string | null; // null for internal nodes
  frequency: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
}

export interface HuffmanCode {
  symbol: string;
  code: string; // binary string e.g. "0", "10", "110"
  frequency: number;
  bits: number; // code.length
}

export interface HuffmanTree {
  root: HuffmanNode;
  codes: Map<string, string>; // symbol -> binary code string
  decode: Map<string, string>; // binary code string -> symbol
}

/** Build frequency map from text */
export function buildFrequencyMap(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}

/** Simple min-heap using sorted array insertion (suitable for small alphabets) */
function heapPush(heap: HuffmanNode[], node: HuffmanNode): void {
  heap.push(node);
  heap.sort((a, b) => a.frequency - b.frequency);
}

function heapPop(heap: HuffmanNode[]): HuffmanNode {
  return heap.shift()!;
}

/** Build code map by traversing the tree */
function buildCodes(
  node: HuffmanNode | null,
  prefix: string,
  codes: Map<string, string>,
  decode: Map<string, string>,
): void {
  if (!node) return;
  if (node.symbol !== null) {
    // Leaf node — use '0' for single-symbol trees
    const code = prefix === '' ? '0' : prefix;
    codes.set(node.symbol, code);
    decode.set(code, node.symbol);
    return;
  }
  buildCodes(node.left, prefix + '0', codes, decode);
  buildCodes(node.right, prefix + '1', codes, decode);
}

/** Build Huffman tree from frequency map */
export function buildHuffmanTree(frequencies: Map<string, number>): HuffmanTree {
  if (frequencies.size === 0) {
    const root: HuffmanNode = { symbol: null, frequency: 0, left: null, right: null };
    return { root, codes: new Map(), decode: new Map() };
  }

  const heap: HuffmanNode[] = [];
  for (const [symbol, frequency] of frequencies) {
    heapPush(heap, { symbol, frequency, left: null, right: null });
  }

  // Edge case: single symbol
  if (heap.length === 1) {
    const only = heapPop(heap);
    const codes = new Map<string, string>();
    const decode = new Map<string, string>();
    codes.set(only.symbol!, '0');
    decode.set('0', only.symbol!);
    const root: HuffmanNode = { symbol: null, frequency: only.frequency, left: only, right: null };
    return { root, codes, decode };
  }

  while (heap.length > 1) {
    const left = heapPop(heap);
    const right = heapPop(heap);
    const internal: HuffmanNode = {
      symbol: null,
      frequency: left.frequency + right.frequency,
      left,
      right,
    };
    heapPush(heap, internal);
  }

  const root = heapPop(heap);
  const codes = new Map<string, string>();
  const decode = new Map<string, string>();
  buildCodes(root, '', codes, decode);
  return { root, codes, decode };
}

/** Get code table as array sorted by frequency descending */
export function getCodeTable(tree: HuffmanTree): HuffmanCode[] {
  const table: HuffmanCode[] = [];

  function collectLeaves(node: HuffmanNode | null): void {
    if (!node) return;
    if (node.symbol !== null) {
      const code = tree.codes.get(node.symbol) ?? '';
      table.push({ symbol: node.symbol, code, frequency: node.frequency, bits: code.length });
      return;
    }
    collectLeaves(node.left);
    collectLeaves(node.right);
  }

  collectLeaves(tree.root);
  table.sort((a, b) => b.frequency - a.frequency);
  return table;
}

/** Encode text to binary string using Huffman codes */
export function encode(text: string, tree: HuffmanTree): string {
  const parts: string[] = [];
  for (const ch of text) {
    const code = tree.codes.get(ch);
    if (code === undefined) throw new Error(`Symbol not in tree: ${ch}`);
    parts.push(code);
  }
  return parts.join('');
}

/** Decode binary string back to text */
export function decode(encoded: string, tree: HuffmanTree): string {
  if (encoded === '' || tree.codes.size === 0) return '';

  // Single-symbol tree: strip bits
  if (tree.codes.size === 1) {
    const [[sym, code]] = [...tree.codes.entries()];
    const count = encoded.length / code.length;
    return sym.repeat(count);
  }

  const parts: string[] = [];
  let current = '';
  for (const bit of encoded) {
    current += bit;
    const sym = tree.decode.get(current);
    if (sym !== undefined) {
      parts.push(sym);
      current = '';
    }
  }
  return parts.join('');
}

/** Calculate compression ratio: encoded bits / original bits (8 bits per char) */
export function compressionRatio(text: string, tree: HuffmanTree): number {
  if (text.length === 0) return 0;
  const originalBits = text.length * 8;
  const encodedBits = encode(text, tree).length;
  return encodedBits / originalBits;
}

/** Calculate theoretical entropy (Shannon entropy) in bits per symbol */
export function entropy(frequencies: Map<string, number>): number {
  const total = [...frequencies.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const f of frequencies.values()) {
    if (f > 0) {
      const p = f / total;
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/** Average bits per symbol in the Huffman code */
export function averageBitsPerSymbol(
  tree: HuffmanTree,
  frequencies: Map<string, number>,
): number {
  const total = [...frequencies.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let avg = 0;
  for (const [sym, f] of frequencies) {
    const code = tree.codes.get(sym);
    if (code !== undefined) {
      avg += (f / total) * code.length;
    }
  }
  return avg;
}

/** Canonical Huffman codes (for more efficient transmission) */
export interface CanonicalCode {
  symbol: string;
  bits: number; // code length
  code: string; // the actual canonical binary code
}

/** Build canonical Huffman codes from a tree */
export function buildCanonicalCodes(tree: HuffmanTree): CanonicalCode[] {
  // Step 1: get (symbol, bitLength) pairs sorted by bitLength then symbol
  const lengths: Array<{ symbol: string; bits: number }> = [];
  for (const [sym, code] of tree.codes) {
    lengths.push({ symbol: sym, bits: code.length });
  }
  lengths.sort((a, b) => a.bits - b.bits || a.symbol.localeCompare(b.symbol));

  // Step 2: assign canonical codes
  let code = 0;
  let prevBits = 0;
  const canonical: CanonicalCode[] = [];
  for (const { symbol, bits } of lengths) {
    code = code << (bits - prevBits);
    canonical.push({ symbol, bits, code: code.toString(2).padStart(bits, '0') });
    code++;
    prevBits = bits;
  }
  return canonical;
}

/** Encode using canonical codes */
export function canonicalEncode(text: string, codes: CanonicalCode[]): string {
  const map = new Map<string, string>();
  for (const c of codes) map.set(c.symbol, c.code);
  const parts: string[] = [];
  for (const ch of text) {
    const code = map.get(ch);
    if (code === undefined) throw new Error(`Symbol not in canonical codes: ${ch}`);
    parts.push(code);
  }
  return parts.join('');
}

/** Run-Length Encoding */
export function rleEncode(text: string): Array<{ char: string; count: number }> {
  if (text.length === 0) return [];
  const result: Array<{ char: string; count: number }> = [];
  let current = text[0];
  let count = 1;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === current) {
      count++;
    } else {
      result.push({ char: current, count });
      current = text[i];
      count = 1;
    }
  }
  result.push({ char: current, count });
  return result;
}

export function rleDecode(encoded: Array<{ char: string; count: number }>): string {
  return encoded.map(({ char, count }) => char.repeat(count)).join('');
}

/** Compact RLE string format: "3a2b1c" etc. */
export function rleEncodeString(text: string): string {
  const pairs = rleEncode(text);
  return pairs.map(({ char, count }) => `${count}${char}`).join('');
}

export function rleDecodeString(encoded: string): string {
  if (encoded === '') return '';
  let result = '';
  let i = 0;
  while (i < encoded.length) {
    let numStr = '';
    while (i < encoded.length && encoded[i] >= '0' && encoded[i] <= '9') {
      numStr += encoded[i++];
    }
    if (i < encoded.length) {
      const char = encoded[i++];
      const count = parseInt(numStr, 10) || 1;
      result += char.repeat(count);
    }
  }
  return result;
}

/** LZ77-style tokens */
export interface LZ77Token {
  offset: number;
  length: number;
  next: string;
}

/** LZ77-style encode (simplified sliding window) */
export function lz77Encode(text: string, windowSize: number = 255): LZ77Token[] {
  const tokens: LZ77Token[] = [];
  let i = 0;
  while (i < text.length) {
    let bestOffset = 0;
    let bestLength = 0;
    const start = Math.max(0, i - windowSize);
    for (let j = start; j < i; j++) {
      let len = 0;
      while (i + len < text.length && text[j + len] === text[i + len]) {
        len++;
        // Prevent going past the lookahead
        if (len >= 255) break;
      }
      if (len > bestLength) {
        bestLength = len;
        bestOffset = i - j;
      }
    }
    const next = i + bestLength < text.length ? text[i + bestLength] : '';
    tokens.push({ offset: bestOffset, length: bestLength, next });
    i += bestLength + 1;
  }
  return tokens;
}

/** LZ77-style decode */
export function lz77Decode(tokens: LZ77Token[]): string {
  const chars: string[] = [];
  for (const { offset, length, next } of tokens) {
    if (offset === 0 || length === 0) {
      if (next !== '') chars.push(next);
    } else {
      const start = chars.length - offset;
      for (let i = 0; i < length; i++) {
        chars.push(chars[start + i]);
      }
      if (next !== '') chars.push(next);
    }
  }
  return chars.join('');
}

/** Verify Huffman property: no code is a prefix of another */
export function isPrefixFree(codes: Map<string, string>): boolean {
  const codeList = [...codes.values()];
  for (let i = 0; i < codeList.length; i++) {
    for (let j = 0; j < codeList.length; j++) {
      if (i !== j && codeList[j].startsWith(codeList[i])) {
        return false;
      }
    }
  }
  return true;
}

/** Build Huffman tree from text directly */
export function buildFromText(text: string): HuffmanTree {
  const freq = buildFrequencyMap(text);
  return buildHuffmanTree(freq);
}

/** Round-trip: encode then decode returns original */
export function roundTrip(text: string): boolean {
  if (text.length === 0) return true;
  const tree = buildFromText(text);
  const encoded = encode(text, tree);
  const decoded = decode(encoded, tree);
  return decoded === text;
}
