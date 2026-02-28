export type IOCType = 'IP' | 'DOMAIN' | 'URL' | 'HASH_MD5' | 'HASH_SHA256' | 'EMAIL' | 'FILE_PATH' | 'REGISTRY_KEY';
export type ThreatSeverity = 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CVSSVector = 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' | string;

export interface IOCRecord {
  id: string;
  type: IOCType;
  value: string;
  confidence: number; // 0-100
  severity: ThreatSeverity;
  tags: string[];
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  hitCount: number;
  isActive: boolean;
}

export interface CVERecord {
  id: string;       // e.g. CVE-2024-12345
  cvssScore: number; // 0-10
  severity: ThreatSeverity;
  description: string;
  affectedProducts: string[];
  publishedAt: Date;
  patchAvailable: boolean;
  exploitAvailable: boolean;
}

export interface ThreatFeedEntry {
  feedId: string;
  feedName: string;
  iocs: IOCRecord[];
  ingestedAt: Date;
  recordCount: number;
}

export interface ThreatReport {
  iocCount: number;
  criticalCount: number;
  highCount: number;
  activeCount: number;
  topTags: string[];
}
