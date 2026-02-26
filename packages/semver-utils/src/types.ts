// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface SemVer {
  major: number; minor: number; patch: number;
  prerelease: Array<string | number>;
  build: string[];
  raw: string;
}
export type ReleaseType = 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease';
export type DiffType = ReleaseType | 'none';
export interface RangeComparator { operator: '>=' | '>' | '<=' | '<' | '='; version: SemVer; }
