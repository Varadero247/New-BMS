// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => b.has(x)));
}

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => !b.has(x)));
}

export function symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...[...a].filter(x => !b.has(x)), ...[...b].filter(x => !a.has(x))]);
}

export function isSubset<T>(a: Set<T>, b: Set<T>): boolean {
  return [...a].every(x => b.has(x));
}

export function isSuperset<T>(a: Set<T>, b: Set<T>): boolean {
  return isSubset(b, a);
}

export function isDisjoint<T>(a: Set<T>, b: Set<T>): boolean {
  return [...a].every(x => !b.has(x));
}

export function powerSet<T>(s: T[]): T[][] {
  if (s.length > 20) throw new Error('Too large');
  const result: T[][] = [[]];
  for (const item of s)
    for (let i = result.length - 1; i >= 0; i--)
      result.push([...result[i], item]);
  return result;
}

export function cartesianProduct<T, U>(a: T[], b: U[]): [T, U][] {
  return a.flatMap(x => b.map(y => [x, y] as [T, U]));
}

export function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const [first, ...rest] = arr;
  return [...combinations(rest, k-1).map(c => [first, ...c]), ...combinations(rest, k)];
}

export function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((v, i) => permutations([...arr.slice(0,i), ...arr.slice(i+1)]).map(p => [v,...p]));
}

export function setEquals<T>(a: Set<T>, b: Set<T>): boolean {
  return a.size === b.size && isSubset(a, b);
}
