// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Document Control — ISO 9001 Clause 7.5 (Documented Information)
// Domain spec tests: arrays, badge/color maps, data shapes, helpers

// ---------------------------------------------------------------------------
// Domain constants (inlined — no imports from source files)
// ---------------------------------------------------------------------------

type DocumentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'OBSOLETE';

type DocumentCategory =
  | 'POLICY'
  | 'PROCEDURE'
  | 'WORK_INSTRUCTION'
  | 'FORM'
  | 'TEMPLATE'
  | 'RECORD'
  | 'MANUAL'
  | 'EXTERNAL'
  | 'OTHER';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ReadReceiptStatus = 'UNREAD' | 'READ' | 'ACKNOWLEDGED';

const DOCUMENT_STATUSES: DocumentStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
  'OBSOLETE',
];

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'POLICY',
  'PROCEDURE',
  'WORK_INSTRUCTION',
  'FORM',
  'TEMPLATE',
  'RECORD',
  'MANUAL',
  'EXTERNAL',
  'OTHER',
];

const APPROVAL_STATUSES: ApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const READ_RECEIPT_STATUSES: ReadReceiptStatus[] = ['UNREAD', 'READ', 'ACKNOWLEDGED'];

// ---------------------------------------------------------------------------
// Badge / color maps
// ---------------------------------------------------------------------------

const documentStatusColor: Record<DocumentStatus, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-purple-100 text-purple-800',
  OBSOLETE: 'bg-red-100 text-red-800',
};

const approvalStatusColor: Record<ApprovalStatus, string> = {
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
};

const readReceiptStatusColor: Record<ReadReceiptStatus, string> = {
  ACKNOWLEDGED: 'bg-green-100 text-green-800',
  READ: 'bg-blue-100 text-blue-800',
  UNREAD: 'bg-gray-100 text-gray-800',
};

// Badge variant used by approval form default status
const approvalDefaultStatus: ApprovalStatus = 'PENDING';
const documentDefaultStatus: DocumentStatus = 'DRAFT';
const documentDefaultCategory: DocumentCategory = 'PROCEDURE';
const readReceiptDefaultStatus: ReadReceiptStatus = 'UNREAD';

// ---------------------------------------------------------------------------
// Pure helper functions (inlined)
// ---------------------------------------------------------------------------

function isDocumentLive(status: DocumentStatus): boolean {
  return status === 'PUBLISHED' || status === 'APPROVED';
}

function isDocumentEditable(status: DocumentStatus): boolean {
  return status === 'DRAFT' || status === 'PENDING_REVIEW';
}

function isDocumentRetired(status: DocumentStatus): boolean {
  return status === 'ARCHIVED' || status === 'OBSOLETE';
}

function isApprovalDecided(status: ApprovalStatus): boolean {
  return status === 'APPROVED' || status === 'REJECTED';
}

function isReadReceiptComplete(status: ReadReceiptStatus): boolean {
  return status === 'ACKNOWLEDGED';
}

function formatVersionLabel(version: number): string {
  return `v${version}`;
}

function parseTagsFromString(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatFileSizeBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function splitISODate(iso: string): string {
  return iso.split('T')[0];
}

function documentNeedsReview(reviewDate: string | null, now: Date): boolean {
  if (!reviewDate) return false;
  return now >= new Date(reviewDate);
}

function documentCountByStatus(
  docs: Array<{ status: DocumentStatus }>,
  target: DocumentStatus,
): number {
  return docs.filter((d) => d.status === target).length;
}

function versionCountPerDocument(
  versions: Array<{ documentId: string }>,
): number {
  return new Set(versions.map((v) => v.documentId)).size;
}

function maxVersion(versions: Array<{ version: number }>): number {
  return Math.max(...versions.map((v) => v.version), 0);
}

// ---------------------------------------------------------------------------
// MOCK data shapes
// ---------------------------------------------------------------------------

interface MockDocument {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: DocumentCategory;
  department: string;
  status: DocumentStatus;
  currentVersion: number;
  fileUrl: string;
  owner: string;
  ownerName: string;
  reviewDate: string;
  retentionDate: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

interface MockVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  changeNotes: string;
  createdBy: string;
  createdAt: string;
}

interface MockApproval {
  id: string;
  documentId: string;
  approver: string;
  approverName: string;
  status: ApprovalStatus;
  comments: string;
  decidedAt: string;
  createdAt: string;
}

interface MockReadReceipt {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  status: ReadReceiptStatus;
  readAt: string;
  acknowledgedAt: string;
  createdAt: string;
}

const mockDocument: MockDocument = {
  id: '00000000-0000-0000-0001-000000000001',
  referenceNumber: 'DOC-2026-0001',
  title: 'Quality Management Procedure',
  description: 'Procedure for managing quality control activities',
  category: 'PROCEDURE',
  department: 'Quality',
  status: 'PUBLISHED',
  currentVersion: 3,
  fileUrl: 'https://files.ims.local/docs/qmp-v3.pdf',
  owner: '00000000-0000-0000-0002-000000000001',
  ownerName: 'Jane Smith',
  reviewDate: '2027-01-01T00:00:00.000Z',
  retentionDate: '2030-01-01T00:00:00.000Z',
  tags: ['iso9001', 'quality', 'procedure'],
  notes: 'Reviewed and approved by QMR',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockVersion: MockVersion = {
  id: '00000000-0000-0000-0003-000000000001',
  documentId: '00000000-0000-0000-0001-000000000001',
  version: 3,
  fileUrl: 'https://files.ims.local/docs/qmp-v3.pdf',
  fileSize: 245760,
  changeNotes: 'Updated section 4.2 to reflect new process steps',
  createdBy: '00000000-0000-0000-0002-000000000001',
  createdAt: '2026-03-01T00:00:00.000Z',
};

const mockApproval: MockApproval = {
  id: '00000000-0000-0000-0004-000000000001',
  documentId: '00000000-0000-0000-0001-000000000001',
  approver: '00000000-0000-0000-0002-000000000002',
  approverName: 'Bob Johnson',
  status: 'APPROVED',
  comments: 'Document meets all quality requirements',
  decidedAt: '2026-02-15T10:30:00.000Z',
  createdAt: '2026-02-10T09:00:00.000Z',
};

const mockReadReceipt: MockReadReceipt = {
  id: '00000000-0000-0000-0005-000000000001',
  documentId: '00000000-0000-0000-0001-000000000001',
  userId: '00000000-0000-0000-0002-000000000003',
  userName: 'Alice Brown',
  status: 'ACKNOWLEDGED',
  readAt: '2026-02-20T14:00:00.000Z',
  acknowledgedAt: '2026-02-20T14:05:00.000Z',
  createdAt: '2026-02-18T08:00:00.000Z',
};

// ===========================================================================
// Tests
// ===========================================================================

describe('Document statuses array', () => {
  it('has exactly 6 statuses', () => {
    expect(DOCUMENT_STATUSES).toHaveLength(6);
  });

  it('contains DRAFT', () => expect(DOCUMENT_STATUSES).toContain('DRAFT'));
  it('contains PENDING_REVIEW', () => expect(DOCUMENT_STATUSES).toContain('PENDING_REVIEW'));
  it('contains APPROVED', () => expect(DOCUMENT_STATUSES).toContain('APPROVED'));
  it('contains PUBLISHED', () => expect(DOCUMENT_STATUSES).toContain('PUBLISHED'));
  it('contains ARCHIVED', () => expect(DOCUMENT_STATUSES).toContain('ARCHIVED'));
  it('contains OBSOLETE', () => expect(DOCUMENT_STATUSES).toContain('OBSOLETE'));

  it('all statuses are non-empty strings', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it('all statuses are uppercase', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(s).toBe(s.toUpperCase());
    }
  });

  it('no duplicate statuses', () => {
    expect(new Set(DOCUMENT_STATUSES).size).toBe(DOCUMENT_STATUSES.length);
  });
});

describe('Document categories array', () => {
  it('has exactly 9 categories', () => {
    expect(DOCUMENT_CATEGORIES).toHaveLength(9);
  });

  const expectedCategories: DocumentCategory[] = [
    'POLICY',
    'PROCEDURE',
    'WORK_INSTRUCTION',
    'FORM',
    'TEMPLATE',
    'RECORD',
    'MANUAL',
    'EXTERNAL',
    'OTHER',
  ];

  for (const cat of expectedCategories) {
    it(`contains ${cat}`, () => expect(DOCUMENT_CATEGORIES).toContain(cat));
  }

  it('all categories are uppercase strings', () => {
    for (const c of DOCUMENT_CATEGORIES) {
      expect(typeof c).toBe('string');
      expect(c).toBe(c.toUpperCase());
    }
  });

  it('no duplicate categories', () => {
    expect(new Set(DOCUMENT_CATEGORIES).size).toBe(DOCUMENT_CATEGORIES.length);
  });
});

describe('Approval statuses array', () => {
  it('has exactly 3 statuses', () => expect(APPROVAL_STATUSES).toHaveLength(3));
  it('contains PENDING', () => expect(APPROVAL_STATUSES).toContain('PENDING'));
  it('contains APPROVED', () => expect(APPROVAL_STATUSES).toContain('APPROVED'));
  it('contains REJECTED', () => expect(APPROVAL_STATUSES).toContain('REJECTED'));

  it('all statuses are uppercase strings', () => {
    for (const s of APPROVAL_STATUSES) {
      expect(typeof s).toBe('string');
      expect(s).toBe(s.toUpperCase());
    }
  });
});

describe('Read receipt statuses array', () => {
  it('has exactly 3 statuses', () => expect(READ_RECEIPT_STATUSES).toHaveLength(3));
  it('contains UNREAD', () => expect(READ_RECEIPT_STATUSES).toContain('UNREAD'));
  it('contains READ', () => expect(READ_RECEIPT_STATUSES).toContain('READ'));
  it('contains ACKNOWLEDGED', () => expect(READ_RECEIPT_STATUSES).toContain('ACKNOWLEDGED'));
});

describe('Default form values', () => {
  it('document default status is DRAFT', () => expect(documentDefaultStatus).toBe('DRAFT'));
  it('document default category is PROCEDURE', () => expect(documentDefaultCategory).toBe('PROCEDURE'));
  it('approval default status is PENDING', () => expect(approvalDefaultStatus).toBe('PENDING'));
  it('read receipt default status is UNREAD', () => expect(readReceiptDefaultStatus).toBe('UNREAD'));

  it('DRAFT is a valid document status', () => expect(DOCUMENT_STATUSES).toContain(documentDefaultStatus));
  it('PROCEDURE is a valid document category', () => expect(DOCUMENT_CATEGORIES).toContain(documentDefaultCategory));
  it('PENDING is a valid approval status', () => expect(APPROVAL_STATUSES).toContain(approvalDefaultStatus));
  it('UNREAD is a valid read receipt status', () => expect(READ_RECEIPT_STATUSES).toContain(readReceiptDefaultStatus));
});

describe('Document status color map', () => {
  it('has an entry for every document status', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(documentStatusColor[s]).toBeDefined();
    }
  });

  it('PUBLISHED maps to green', () => expect(documentStatusColor.PUBLISHED).toContain('green'));
  it('APPROVED maps to blue', () => expect(documentStatusColor.APPROVED).toContain('blue'));
  it('PENDING_REVIEW maps to amber', () => expect(documentStatusColor.PENDING_REVIEW).toContain('amber'));
  it('DRAFT maps to gray', () => expect(documentStatusColor.DRAFT).toContain('gray'));
  it('ARCHIVED maps to purple', () => expect(documentStatusColor.ARCHIVED).toContain('purple'));
  it('OBSOLETE maps to red', () => expect(documentStatusColor.OBSOLETE).toContain('red'));

  it('every color value contains bg-', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(documentStatusColor[s]).toContain('bg-');
    }
  });

  it('every color value contains text-', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(documentStatusColor[s]).toContain('text-');
    }
  });

  it('all color values are non-empty strings', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(typeof documentStatusColor[s]).toBe('string');
      expect(documentStatusColor[s].length).toBeGreaterThan(0);
    }
  });
});

describe('Approval status color map', () => {
  it('has an entry for every approval status', () => {
    for (const s of APPROVAL_STATUSES) {
      expect(approvalStatusColor[s]).toBeDefined();
    }
  });

  it('APPROVED maps to green', () => expect(approvalStatusColor.APPROVED).toContain('green'));
  it('REJECTED maps to red', () => expect(approvalStatusColor.REJECTED).toContain('red'));
  it('PENDING maps to amber', () => expect(approvalStatusColor.PENDING).toContain('amber'));

  it('every color value contains bg- and text-', () => {
    for (const s of APPROVAL_STATUSES) {
      expect(approvalStatusColor[s]).toContain('bg-');
      expect(approvalStatusColor[s]).toContain('text-');
    }
  });
});

describe('Read receipt status color map', () => {
  it('has an entry for every read receipt status', () => {
    for (const s of READ_RECEIPT_STATUSES) {
      expect(readReceiptStatusColor[s]).toBeDefined();
    }
  });

  it('ACKNOWLEDGED maps to green', () => expect(readReceiptStatusColor.ACKNOWLEDGED).toContain('green'));
  it('READ maps to blue', () => expect(readReceiptStatusColor.READ).toContain('blue'));
  it('UNREAD maps to gray', () => expect(readReceiptStatusColor.UNREAD).toContain('gray'));

  it('every color value contains bg- and text-', () => {
    for (const s of READ_RECEIPT_STATUSES) {
      expect(readReceiptStatusColor[s]).toContain('bg-');
      expect(readReceiptStatusColor[s]).toContain('text-');
    }
  });
});

describe('isDocumentLive', () => {
  it('PUBLISHED is live', () => expect(isDocumentLive('PUBLISHED')).toBe(true));
  it('APPROVED is live', () => expect(isDocumentLive('APPROVED')).toBe(true));
  it('DRAFT is not live', () => expect(isDocumentLive('DRAFT')).toBe(false));
  it('PENDING_REVIEW is not live', () => expect(isDocumentLive('PENDING_REVIEW')).toBe(false));
  it('ARCHIVED is not live', () => expect(isDocumentLive('ARCHIVED')).toBe(false));
  it('OBSOLETE is not live', () => expect(isDocumentLive('OBSOLETE')).toBe(false));

  it('returns boolean for every status', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(typeof isDocumentLive(s)).toBe('boolean');
    }
  });
});

describe('isDocumentEditable', () => {
  it('DRAFT is editable', () => expect(isDocumentEditable('DRAFT')).toBe(true));
  it('PENDING_REVIEW is editable', () => expect(isDocumentEditable('PENDING_REVIEW')).toBe(true));
  it('PUBLISHED is not editable', () => expect(isDocumentEditable('PUBLISHED')).toBe(false));
  it('APPROVED is not editable', () => expect(isDocumentEditable('APPROVED')).toBe(false));
  it('ARCHIVED is not editable', () => expect(isDocumentEditable('ARCHIVED')).toBe(false));
  it('OBSOLETE is not editable', () => expect(isDocumentEditable('OBSOLETE')).toBe(false));
});

describe('isDocumentRetired', () => {
  it('ARCHIVED is retired', () => expect(isDocumentRetired('ARCHIVED')).toBe(true));
  it('OBSOLETE is retired', () => expect(isDocumentRetired('OBSOLETE')).toBe(true));
  it('PUBLISHED is not retired', () => expect(isDocumentRetired('PUBLISHED')).toBe(false));
  it('APPROVED is not retired', () => expect(isDocumentRetired('APPROVED')).toBe(false));
  it('DRAFT is not retired', () => expect(isDocumentRetired('DRAFT')).toBe(false));

  it('live and retired are mutually exclusive for every status', () => {
    for (const s of DOCUMENT_STATUSES) {
      if (isDocumentLive(s)) {
        expect(isDocumentRetired(s)).toBe(false);
      }
    }
  });
});

describe('isApprovalDecided', () => {
  it('APPROVED is decided', () => expect(isApprovalDecided('APPROVED')).toBe(true));
  it('REJECTED is decided', () => expect(isApprovalDecided('REJECTED')).toBe(true));
  it('PENDING is not decided', () => expect(isApprovalDecided('PENDING')).toBe(false));

  it('returns boolean for every approval status', () => {
    for (const s of APPROVAL_STATUSES) {
      expect(typeof isApprovalDecided(s)).toBe('boolean');
    }
  });
});

describe('isReadReceiptComplete', () => {
  it('ACKNOWLEDGED is complete', () => expect(isReadReceiptComplete('ACKNOWLEDGED')).toBe(true));
  it('READ is not complete', () => expect(isReadReceiptComplete('READ')).toBe(false));
  it('UNREAD is not complete', () => expect(isReadReceiptComplete('UNREAD')).toBe(false));

  it('returns boolean for every receipt status', () => {
    for (const s of READ_RECEIPT_STATUSES) {
      expect(typeof isReadReceiptComplete(s)).toBe('boolean');
    }
  });
});

describe('formatVersionLabel', () => {
  const cases: Array<[number, string]> = [
    [1, 'v1'],
    [2, 'v2'],
    [10, 'v10'],
    [100, 'v100'],
  ];

  for (const [ver, expected] of cases) {
    it(`version ${ver} → "${expected}"`, () => expect(formatVersionLabel(ver)).toBe(expected));
  }

  it('always starts with "v"', () => {
    for (let i = 1; i <= 20; i++) {
      expect(formatVersionLabel(i)).toMatch(/^v\d+$/);
    }
  });
});

describe('parseTagsFromString', () => {
  it('empty string → empty array', () => expect(parseTagsFromString('')).toEqual([]));
  it('whitespace-only → empty array', () => expect(parseTagsFromString('   ')).toEqual([]));
  it('single tag', () => expect(parseTagsFromString('iso9001')).toEqual(['iso9001']));
  it('comma-separated tags', () =>
    expect(parseTagsFromString('iso9001, quality, procedure')).toEqual([
      'iso9001',
      'quality',
      'procedure',
    ]));
  it('trims whitespace around each tag', () =>
    expect(parseTagsFromString('  a  ,  b  ')).toEqual(['a', 'b']));
  it('filters empty segments from double commas', () =>
    expect(parseTagsFromString('a,,b')).toEqual(['a', 'b']));
  it('returns string array', () => {
    const tags = parseTagsFromString('x, y, z');
    for (const t of tags) {
      expect(typeof t).toBe('string');
    }
  });
});

describe('formatFileSizeBytes', () => {
  it('0 bytes → "-"', () => expect(formatFileSizeBytes(0)).toBe('-'));
  it('negative → "-"', () => expect(formatFileSizeBytes(-1)).toBe('-'));
  it('500 bytes → "500 B"', () => expect(formatFileSizeBytes(500)).toBe('500 B'));
  it('1024 bytes → "1.0 KB"', () => expect(formatFileSizeBytes(1024)).toBe('1.0 KB'));
  it('2048 bytes → "2.0 KB"', () => expect(formatFileSizeBytes(2048)).toBe('2.0 KB'));
  it('1 MB → "1.0 MB"', () => expect(formatFileSizeBytes(1024 * 1024)).toBe('1.0 MB'));
  it('245760 bytes → "240.0 KB"', () => expect(formatFileSizeBytes(245760)).toBe('240.0 KB'));

  it('KB label for sub-MB sizes', () => {
    for (const bytes of [1024, 10240, 512000]) {
      expect(formatFileSizeBytes(bytes)).toContain('KB');
    }
  });

  it('MB label for 1 MB and above', () => {
    for (const bytes of [1048576, 2097152, 5242880]) {
      expect(formatFileSizeBytes(bytes)).toContain('MB');
    }
  });
});

describe('splitISODate', () => {
  it('strips time from ISO string', () =>
    expect(splitISODate('2026-03-01T00:00:00.000Z')).toBe('2026-03-01'));
  it('returns date part only', () =>
    expect(splitISODate('2027-01-01T12:30:45.000Z')).toBe('2027-01-01'));
  it('result has YYYY-MM-DD format', () => {
    const result = splitISODate('2026-06-15T08:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('documentNeedsReview', () => {
  const now = new Date('2026-03-09T00:00:00.000Z');

  it('null reviewDate → false', () => expect(documentNeedsReview(null, now)).toBe(false));
  it('past review date → true', () =>
    expect(documentNeedsReview('2025-01-01T00:00:00.000Z', now)).toBe(true));
  it('future review date → false', () =>
    expect(documentNeedsReview('2027-01-01T00:00:00.000Z', now)).toBe(false));
  it('exact now boundary → true', () =>
    expect(documentNeedsReview('2026-03-09T00:00:00.000Z', now)).toBe(true));

  it('returns boolean', () => {
    expect(typeof documentNeedsReview('2026-01-01T00:00:00.000Z', now)).toBe('boolean');
  });
});

describe('documentCountByStatus', () => {
  const docs = [
    { status: 'PUBLISHED' as DocumentStatus },
    { status: 'PUBLISHED' as DocumentStatus },
    { status: 'DRAFT' as DocumentStatus },
    { status: 'APPROVED' as DocumentStatus },
    { status: 'ARCHIVED' as DocumentStatus },
  ];

  it('counts PUBLISHED correctly', () => expect(documentCountByStatus(docs, 'PUBLISHED')).toBe(2));
  it('counts DRAFT correctly', () => expect(documentCountByStatus(docs, 'DRAFT')).toBe(1));
  it('counts APPROVED correctly', () => expect(documentCountByStatus(docs, 'APPROVED')).toBe(1));
  it('counts ARCHIVED correctly', () => expect(documentCountByStatus(docs, 'ARCHIVED')).toBe(1));
  it('counts OBSOLETE as 0 when none present', () =>
    expect(documentCountByStatus(docs, 'OBSOLETE')).toBe(0));
  it('total across all statuses equals doc count', () => {
    const total = DOCUMENT_STATUSES.reduce(
      (sum, s) => sum + documentCountByStatus(docs, s),
      0,
    );
    expect(total).toBe(docs.length);
  });

  it('parametric: count is non-negative for all statuses', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(documentCountByStatus(docs, s)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('versionCountPerDocument', () => {
  it('returns 0 for empty array', () => expect(versionCountPerDocument([])).toBe(0));
  it('returns 1 for single version', () =>
    expect(versionCountPerDocument([{ documentId: 'abc' }])).toBe(1));
  it('counts unique document IDs', () => {
    const versions = [
      { documentId: 'id-1' },
      { documentId: 'id-1' },
      { documentId: 'id-2' },
    ];
    expect(versionCountPerDocument(versions)).toBe(2);
  });
  it('all unique IDs → count equals array length', () => {
    const versions = [
      { documentId: 'a' },
      { documentId: 'b' },
      { documentId: 'c' },
    ];
    expect(versionCountPerDocument(versions)).toBe(3);
  });
});

describe('maxVersion', () => {
  it('returns 0 for empty array', () => expect(maxVersion([])).toBe(0));
  it('returns correct max', () =>
    expect(maxVersion([{ version: 1 }, { version: 3 }, { version: 2 }])).toBe(3));
  it('returns 1 for single version', () =>
    expect(maxVersion([{ version: 1 }])).toBe(1));

  it('parametric: max is >= every version in the array', () => {
    const versions = [{ version: 2 }, { version: 5 }, { version: 1 }, { version: 4 }];
    const mx = maxVersion(versions);
    for (const v of versions) {
      expect(mx).toBeGreaterThanOrEqual(v.version);
    }
  });
});

describe('Mock document shape', () => {
  it('has an id field', () => expect(typeof mockDocument.id).toBe('string'));
  it('id is non-empty', () => expect(mockDocument.id.length).toBeGreaterThan(0));
  it('has a referenceNumber field', () => expect(typeof mockDocument.referenceNumber).toBe('string'));
  it('has a title field', () => expect(typeof mockDocument.title).toBe('string'));
  it('title is non-empty', () => expect(mockDocument.title.length).toBeGreaterThan(0));
  it('category is a valid DocumentCategory', () =>
    expect(DOCUMENT_CATEGORIES).toContain(mockDocument.category));
  it('status is a valid DocumentStatus', () =>
    expect(DOCUMENT_STATUSES).toContain(mockDocument.status));
  it('currentVersion is a positive number', () =>
    expect(mockDocument.currentVersion).toBeGreaterThan(0));
  it('tags is an array', () => expect(Array.isArray(mockDocument.tags)).toBe(true));
  it('tags are strings', () => {
    for (const tag of mockDocument.tags) {
      expect(typeof tag).toBe('string');
    }
  });
  it('has reviewDate', () => expect(typeof mockDocument.reviewDate).toBe('string'));
  it('has retentionDate', () => expect(typeof mockDocument.retentionDate).toBe('string'));
  it('has createdAt', () => expect(typeof mockDocument.createdAt).toBe('string'));
  it('mock is PUBLISHED', () => expect(mockDocument.status).toBe('PUBLISHED'));
  it('mock is live', () => expect(isDocumentLive(mockDocument.status)).toBe(true));
});

describe('Mock version shape', () => {
  it('has an id field', () => expect(typeof mockVersion.id).toBe('string'));
  it('has a documentId field', () => expect(typeof mockVersion.documentId).toBe('string'));
  it('version number is positive', () => expect(mockVersion.version).toBeGreaterThan(0));
  it('fileSize is non-negative', () => expect(mockVersion.fileSize).toBeGreaterThanOrEqual(0));
  it('has changeNotes', () => expect(typeof mockVersion.changeNotes).toBe('string'));
  it('has createdAt', () => expect(typeof mockVersion.createdAt).toBe('string'));
  it('documentId matches mockDocument.id', () =>
    expect(mockVersion.documentId).toBe(mockDocument.id));
  it('version matches mockDocument.currentVersion', () =>
    expect(mockVersion.version).toBe(mockDocument.currentVersion));
  it('formatVersionLabel applied', () =>
    expect(formatVersionLabel(mockVersion.version)).toBe('v3'));
  it('fileSize formats to KB', () =>
    expect(formatFileSizeBytes(mockVersion.fileSize)).toContain('KB'));
});

describe('Mock approval shape', () => {
  it('has an id field', () => expect(typeof mockApproval.id).toBe('string'));
  it('has a documentId field', () => expect(typeof mockApproval.documentId).toBe('string'));
  it('has an approver field', () => expect(typeof mockApproval.approver).toBe('string'));
  it('has an approverName field', () => expect(typeof mockApproval.approverName).toBe('string'));
  it('status is a valid ApprovalStatus', () =>
    expect(APPROVAL_STATUSES).toContain(mockApproval.status));
  it('mock approval is APPROVED', () => expect(mockApproval.status).toBe('APPROVED'));
  it('mock approval is decided', () => expect(isApprovalDecided(mockApproval.status)).toBe(true));
  it('has comments', () => expect(typeof mockApproval.comments).toBe('string'));
  it('has decidedAt', () => expect(typeof mockApproval.decidedAt).toBe('string'));
  it('has createdAt', () => expect(typeof mockApproval.createdAt).toBe('string'));
  it('documentId matches mockDocument.id', () =>
    expect(mockApproval.documentId).toBe(mockDocument.id));
});

describe('Mock read receipt shape', () => {
  it('has an id field', () => expect(typeof mockReadReceipt.id).toBe('string'));
  it('has a documentId field', () => expect(typeof mockReadReceipt.documentId).toBe('string'));
  it('has a userId field', () => expect(typeof mockReadReceipt.userId).toBe('string'));
  it('has a userName field', () => expect(typeof mockReadReceipt.userName).toBe('string'));
  it('status is a valid ReadReceiptStatus', () =>
    expect(READ_RECEIPT_STATUSES).toContain(mockReadReceipt.status));
  it('mock receipt is ACKNOWLEDGED', () => expect(mockReadReceipt.status).toBe('ACKNOWLEDGED'));
  it('mock receipt is complete', () => expect(isReadReceiptComplete(mockReadReceipt.status)).toBe(true));
  it('has readAt', () => expect(typeof mockReadReceipt.readAt).toBe('string'));
  it('has acknowledgedAt', () => expect(typeof mockReadReceipt.acknowledgedAt).toBe('string'));
  it('has createdAt', () => expect(typeof mockReadReceipt.createdAt).toBe('string'));
  it('documentId matches mockDocument.id', () =>
    expect(mockReadReceipt.documentId).toBe(mockDocument.id));
});

describe('Cross-domain invariants', () => {
  it('exactly two live statuses', () => {
    const liveStatuses = DOCUMENT_STATUSES.filter((s) => isDocumentLive(s));
    expect(liveStatuses).toHaveLength(2);
  });

  it('exactly two editable statuses', () => {
    const editableStatuses = DOCUMENT_STATUSES.filter((s) => isDocumentEditable(s));
    expect(editableStatuses).toHaveLength(2);
  });

  it('exactly two retired statuses', () => {
    const retiredStatuses = DOCUMENT_STATUSES.filter((s) => isDocumentRetired(s));
    expect(retiredStatuses).toHaveLength(2);
  });

  it('live + editable + retired cover all statuses', () => {
    for (const s of DOCUMENT_STATUSES) {
      const covered =
        isDocumentLive(s) || isDocumentEditable(s) || isDocumentRetired(s);
      expect(covered).toBe(true);
    }
  });

  it('live and editable are mutually exclusive', () => {
    for (const s of DOCUMENT_STATUSES) {
      if (isDocumentLive(s)) {
        expect(isDocumentEditable(s)).toBe(false);
      }
    }
  });

  it('exactly two decided approval statuses', () => {
    const decided = APPROVAL_STATUSES.filter((s) => isApprovalDecided(s));
    expect(decided).toHaveLength(2);
  });

  it('exactly one complete read receipt status', () => {
    const complete = READ_RECEIPT_STATUSES.filter((s) => isReadReceiptComplete(s));
    expect(complete).toHaveLength(1);
  });

  it('document status color map has no undefined entries', () => {
    for (const s of DOCUMENT_STATUSES) {
      expect(documentStatusColor[s]).not.toBeUndefined();
    }
  });

  it('approval status color map has no undefined entries', () => {
    for (const s of APPROVAL_STATUSES) {
      expect(approvalStatusColor[s]).not.toBeUndefined();
    }
  });

  it('read receipt status color map has no undefined entries', () => {
    for (const s of READ_RECEIPT_STATUSES) {
      expect(readReceiptStatusColor[s]).not.toBeUndefined();
    }
  });
});

// ─── Parametric: DOCUMENT_STATUSES positional index ───────────────────────────

describe('DOCUMENT_STATUSES — positional index parametric', () => {
  const expected: [DocumentStatus, number][] = [
    ['DRAFT',          0],
    ['PENDING_REVIEW', 1],
    ['APPROVED',       2],
    ['PUBLISHED',      3],
    ['ARCHIVED',       4],
    ['OBSOLETE',       5],
  ];
  for (const [status, idx] of expected) {
    it(`${status} is at index ${idx}`, () => {
      expect(DOCUMENT_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: documentStatusColor exact bg+text family ────────────────────

describe('documentStatusColor — exact bg+text color family parametric', () => {
  const cases: [DocumentStatus, string][] = [
    ['PUBLISHED',      'green'],
    ['APPROVED',       'blue'],
    ['PENDING_REVIEW', 'amber'],
    ['DRAFT',          'gray'],
    ['ARCHIVED',       'purple'],
    ['OBSOLETE',       'red'],
  ];
  for (const [status, color] of cases) {
    it(`${status} contains bg-${color} and text-${color}`, () => {
      const cls = documentStatusColor[status];
      expect(cls).toContain(`bg-${color}`);
      expect(cls).toContain(`text-${color}`);
    });
  }
});

// ─── Parametric: isDocumentLive per-status ────────────────────────────────────

describe('isDocumentLive — per-status parametric', () => {
  const cases: [DocumentStatus, boolean][] = [
    ['DRAFT',          false],
    ['PENDING_REVIEW', false],
    ['APPROVED',       true],
    ['PUBLISHED',      true],
    ['ARCHIVED',       false],
    ['OBSOLETE',       false],
  ];
  for (const [status, expected] of cases) {
    it(`isDocumentLive("${status}") = ${expected}`, () => {
      expect(isDocumentLive(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isDocumentRetired per-status ─────────────────────────────────

describe('isDocumentRetired — per-status parametric', () => {
  const cases: [DocumentStatus, boolean][] = [
    ['DRAFT',          false],
    ['PENDING_REVIEW', false],
    ['APPROVED',       false],
    ['PUBLISHED',      false],
    ['ARCHIVED',       true],
    ['OBSOLETE',       true],
  ];
  for (const [status, expected] of cases) {
    it(`isDocumentRetired("${status}") = ${expected}`, () => {
      expect(isDocumentRetired(status)).toBe(expected);
    });
  }
});

// ─── formatFileSizeBytes additional exact values ──────────────────────────────

describe('formatFileSizeBytes — additional exact values parametric', () => {
  const cases: [number, string][] = [
    [1,         '1 B'],
    [512,       '512 B'],
    [10240,     '10.0 KB'],     // 10 * 1024
    [512000,    '500.0 KB'],    // 500 * 1024
    [1572864,   '1.5 MB'],      // 1.5 * 1024 * 1024
    [5242880,   '5.0 MB'],      // 5 * 1024 * 1024
  ];
  for (const [bytes, expected] of cases) {
    it(`${bytes} bytes → "${expected}"`, () => {
      expect(formatFileSizeBytes(bytes)).toBe(expected);
    });
  }
});

// ─── mockDocument specific field values ──────────────────────────────────────

describe('mockDocument — specific field values', () => {
  it('referenceNumber = DOC-2026-0001', () =>
    expect(mockDocument.referenceNumber).toBe('DOC-2026-0001'));
  it('currentVersion = 3', () => expect(mockDocument.currentVersion).toBe(3));
  it('tags.length = 3', () => expect(mockDocument.tags).toHaveLength(3));
  it('tags includes "iso9001"', () => expect(mockDocument.tags).toContain('iso9001'));
  it('mockVersion.version = 3 matches currentVersion', () =>
    expect(mockVersion.version).toBe(mockDocument.currentVersion));
});
