export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, w => capitalize(w));
}

export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[\s-]+/g, '_')
    .replace(/^_/, '')
    .toLowerCase();
}

export function kebabCase(str: string): string {
  return snakeCase(str).replace(/_/g, '-');
}

export function pascalCase(str: string): string {
  const cc = camelCase(str);
  return cc.charAt(0).toUpperCase() + cc.slice(1);
}

export function truncate(str: string, maxLen: number, ellipsis = '...'): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - ellipsis.length) + ellipsis;
}

export function padLeft(str: string, width: number, char = ' '): string {
  return str.padStart(width, char);
}

export function padRight(str: string, width: number, char = ' '): string {
  return str.padEnd(width, char);
}

export function trim(str: string): string {
  return str.trim();
}

export function trimLeft(str: string): string {
  return str.trimStart();
}

export function trimRight(str: string): string {
  return str.trimEnd();
}

export function contains(str: string, sub: string, caseSensitive = true): boolean {
  if (caseSensitive) return str.includes(sub);
  return str.toLowerCase().includes(sub.toLowerCase());
}

export function startsWith(str: string, prefix: string, caseSensitive = true): boolean {
  if (caseSensitive) return str.startsWith(prefix);
  return str.toLowerCase().startsWith(prefix.toLowerCase());
}

export function endsWith(str: string, suffix: string, caseSensitive = true): boolean {
  if (caseSensitive) return str.endsWith(suffix);
  return str.toLowerCase().endsWith(suffix.toLowerCase());
}

export function repeat(str: string, n: number): string {
  return str.repeat(Math.max(0, n));
}

export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

export function countOccurrences(str: string, sub: string): number {
  if (!sub) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += sub.length; }
  return count;
}

export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isBlank(str: string): boolean {
  return str.trim().length === 0;
}

export function isNotBlank(str: string): boolean {
  return !isBlank(str);
}

export function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function countChars(str: string, char: string): number {
  return str.split(char).length - 1;
}

export function leftPad(n: number | string, width: number): string {
  return String(n).padStart(width, '0');
}

export function extractNumbers(str: string): number[] {
  return (str.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

export function initials(name: string): string {
  return name.split(/\s+/).map(w => w.charAt(0).toUpperCase()).join('');
}

export function formatRef(prefix: string, year: number, seq: number, padWidth = 4): string {
  return `${prefix}-${year}-${leftPad(seq, padWidth)}`;
}

export function mask(str: string, visibleEnd = 4, maskChar = '*'): string {
  if (str.length <= visibleEnd) return str;
  return maskChar.repeat(str.length - visibleEnd) + str.slice(-visibleEnd);
}

export function splitWords(str: string): string[] {
  return str.trim().split(/\s+/).filter(Boolean);
}

export function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return '';
  let prefix = strs[0];
  for (const s of strs.slice(1)) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) return '';
  }
  return prefix;
}
