// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// Run-Length Encoding
export function rleEncode(s: string): string {
  if (!s) return '';
  let result = '', count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i-1]) { count++; }
    else { result += (count > 1 ? count : '') + s[i-1]; count = 1; }
  }
  return result;
}

export function rleDecode(s: string): string {
  return s.replace(/(\d+)([^\d])/g, (_, n, c) => c.repeat(Number(n)));
}

// LZ77-inspired (simplified)
export function lz77Encode(s: string): Array<[number, number, string]> {
  const result: Array<[number, number, string]> = [];
  let pos = 0;
  while (pos < s.length) {
    let bestLen = 0, bestDist = 0;
    const searchStart = Math.max(0, pos - 255);
    for (let i = searchStart; i < pos; i++) {
      let len = 0;
      while (pos + len < s.length && s[i + len] === s[pos + len]) len++;
      if (len > bestLen) { bestLen = len; bestDist = pos - i; }
    }
    if (bestLen > 2) {
      result.push([bestDist, bestLen, pos + bestLen < s.length ? s[pos + bestLen] : '']);
      pos += bestLen + 1;
    } else {
      result.push([0, 0, s[pos]]);
      pos++;
    }
  }
  return result;
}

export function lz77Decode(tokens: Array<[number, number, string]>): string {
  let result = '';
  for (const [dist, len, ch] of tokens) {
    if (dist === 0) { result += ch; }
    else {
      const start = result.length - dist;
      for (let i = 0; i < len; i++) result += result[start + i];
      result += ch;
    }
  }
  return result;
}

// Huffman
interface HNode { freq: number; char?: string; left?: HNode; right?: HNode; }

export function buildHuffmanTree(s: string): HNode | null {
  if (!s) return null;
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  const nodes: HNode[] = [...freq.entries()].map(([char, f]) => ({ freq: f, char }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const l = nodes.shift()!, r = nodes.shift()!;
    nodes.push({ freq: l.freq + r.freq, left: l, right: r });
  }
  return nodes[0] ?? null;
}

export function huffmanCodes(tree: HNode | null): Map<string, string> {
  const codes = new Map<string, string>();
  if (!tree) return codes;
  const walk = (node: HNode, prefix: string) => {
    if (node.char !== undefined) { codes.set(node.char, prefix || '0'); return; }
    if (node.left) walk(node.left, prefix + '0');
    if (node.right) walk(node.right, prefix + '1');
  };
  walk(tree, '');
  return codes;
}

export function huffmanEncode(s: string): { encoded: string; codes: Map<string, string> } {
  const tree = buildHuffmanTree(s);
  const codes = huffmanCodes(tree);
  return { encoded: [...s].map(c => codes.get(c) ?? '').join(''), codes };
}

export function computeCompressionRatio(original: number, compressed: number): number {
  return compressed / original;
}
