/**
 * Unit tests for @ims/readiness package
 * Covers readiness score calculation and ISO certificate CRUD.
 */

import {
  calculateReadinessScore,
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../src/index';

describe('calculateReadinessScore', () => {
  it('returns a score object with required fields', () => {
    const result = calculateReadinessScore('org-1', 'ISO 9001:2015');

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('maxScore', 100);
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('blockers');
    expect(result).toHaveProperty('lastCalculatedAt');
    expect(result.lastCalculatedAt).toBeInstanceOf(Date);
  });

  it('ISO 9001:2015 has three known blockers', () => {
    const result = calculateReadinessScore('org-1', 'ISO 9001:2015');
    expect(result.blockers).toHaveLength(3);
    expect(result.blockers[0].severity).toBe('critical');
  });

  it('score is 100 minus total deductions', () => {
    const result = calculateReadinessScore('org-1', 'ISO 9001:2015');
    const totalDeduction = result.blockers.reduce((sum, b) => sum + b.deduction, 0);
    expect(result.score).toBe(100 - totalDeduction);
  });

  it('score is between 0 and 100', () => {
    const standards = ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'];
    for (const std of standards) {
      const result = calculateReadinessScore('org-1', std);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('assigns correct grade based on score', () => {
    const result9001 = calculateReadinessScore('org-1', 'ISO 9001:2015');
    // Score = 100 - (15+8+3) = 74 → C
    expect(result9001.score).toBe(74);
    expect(result9001.grade).toBe('C');
  });

  it('returns empty blockers and full score for unknown standard', () => {
    const result = calculateReadinessScore('org-1', 'ISO 99999:9999');
    expect(result.blockers).toHaveLength(0);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
  });

  it('ISO 14001:2015 produces grade C (score 78)', () => {
    const result = calculateReadinessScore('org-1', 'ISO 14001:2015');
    // 100 - (10+12) = 78 → C (70 ≤ 78 < 80)
    expect(result.score).toBe(78);
    expect(result.grade).toBe('C');
  });

  it('each blocker has required fields', () => {
    const result = calculateReadinessScore('org-1', 'ISO 45001:2018');
    for (const blocker of result.blockers) {
      expect(blocker).toHaveProperty('description');
      expect(blocker).toHaveProperty('severity');
      expect(blocker).toHaveProperty('module');
      expect(blocker).toHaveProperty('url');
      expect(blocker).toHaveProperty('deduction');
      expect(['critical', 'major', 'minor']).toContain(blocker.severity);
      expect(blocker.deduction).toBeGreaterThan(0);
    }
  });
});

describe('listCertificates', () => {
  it('returns seeded certificates for default org', () => {
    const certs = listCertificates('00000000-0000-0000-0000-000000000001');
    expect(certs.length).toBeGreaterThanOrEqual(3);
  });

  it('returns all certificates when no orgId given', () => {
    const allCerts = listCertificates();
    expect(allCerts.length).toBeGreaterThanOrEqual(3);
  });

  it('returns empty array for unknown org', () => {
    const certs = listCertificates('org-unknown-zzz');
    expect(certs).toHaveLength(0);
  });

  it('each seeded certificate has required fields', () => {
    const certs = listCertificates();
    for (const cert of certs.slice(0, 3)) {
      expect(cert.id).toBeDefined();
      expect(cert.standard).toBeTruthy();
      expect(cert.certificationBody).toBeTruthy();
      expect(cert.certificateNumber).toBeTruthy();
      expect(['ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'EXPIRED', 'IN_RENEWAL']).toContain(cert.status);
    }
  });
});

describe('getCertificate', () => {
  it('returns a certificate by ID', () => {
    const allCerts = listCertificates();
    const target = allCerts[0];
    const found = getCertificate(target.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(target.id);
    expect(found?.standard).toBe(target.standard);
  });

  it('returns undefined for unknown ID', () => {
    const found = getCertificate('00000000-0000-0000-0000-000000000000');
    expect(found).toBeUndefined();
  });
});

describe('createCertificate', () => {
  it('creates a new certificate', () => {
    const cert = createCertificate({
      orgId: 'org-test',
      standard: 'ISO 27001:2022',
      scope: 'IT operations',
      certificationBody: 'BSI',
      certificateNumber: 'IS-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });

    expect(cert.id).toBeDefined();
    expect(cert.standard).toBe('ISO 27001:2022');
    expect(cert.orgId).toBe('org-test');
    expect(cert.status).toBe('ACTIVE');
  });

  it('appears in listCertificates for its org', () => {
    const cert = createCertificate({
      orgId: 'org-new-cert',
      standard: 'ISO 50001:2018',
      scope: 'Energy management',
      certificationBody: 'DNV',
      certificateNumber: 'EN-001',
      issueDate: new Date('2025-06-01'),
      expiryDate: new Date('2028-06-01'),
      status: 'ACTIVE',
    });

    const certs = listCertificates('org-new-cert');
    const found = certs.find((c) => c.id === cert.id);
    expect(found).toBeDefined();
  });
});

describe('updateCertificate', () => {
  it('updates certificate fields', () => {
    const cert = createCertificate({
      orgId: 'org-upd',
      standard: 'ISO 9001:2015',
      scope: 'Original scope',
      certificationBody: 'BSI',
      certificateNumber: 'FS-999',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });

    const updated = updateCertificate(cert.id, { status: 'SUSPENDED' });
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('SUSPENDED');
  });

  it('preserves unchanged fields', () => {
    const cert = createCertificate({
      orgId: 'org-upd2',
      standard: 'ISO 14001:2015',
      scope: 'Env scope',
      certificationBody: 'DNV',
      certificateNumber: 'ENV-111',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });

    updateCertificate(cert.id, { status: 'IN_RENEWAL' });
    const updated = getCertificate(cert.id);

    expect(updated?.standard).toBe('ISO 14001:2015');
    expect(updated?.certificationBody).toBe('DNV');
  });

  it('returns null for unknown ID', () => {
    const result = updateCertificate('00000000-dead-beef-0000-000000000000', { status: 'EXPIRED' });
    expect(result).toBeNull();
  });

  it('preserves original id even when data includes a different id', () => {
    const cert = createCertificate({
      orgId: 'org-id-test',
      standard: 'ISO 27001:2022',
      scope: 'ID test',
      certificationBody: 'BSI',
      certificateNumber: 'ID-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });

    const updated = updateCertificate(cert.id, {
      id: '00000000-ffff-ffff-ffff-ffffffffffff',
      status: 'EXPIRED',
    });
    expect(updated?.id).toBe(cert.id); // id must not change
  });
});

describe('deleteCertificate', () => {
  it('removes certificate from store', () => {
    const cert = createCertificate({
      orgId: 'org-del',
      standard: 'ISO 9001:2015',
      scope: 'To be deleted',
      certificationBody: 'BSI',
      certificateNumber: 'DEL-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });

    const deleted = deleteCertificate(cert.id);
    expect(deleted).toBe(true);

    const found = getCertificate(cert.id);
    expect(found).toBeUndefined();
  });

  it('returns false for unknown ID', () => {
    const result = deleteCertificate('00000000-0000-0000-0000-000000000099');
    expect(result).toBe(false);
  });
});

describe('readiness — additional coverage', () => {
  it('calculateReadinessScore returns a Date for lastCalculatedAt', () => {
    const result = calculateReadinessScore('org-1', 'ISO 9001:2015');
    expect(result.lastCalculatedAt).toBeInstanceOf(Date);
  });

  it('calculateReadinessScore grade is one of A B C D F', () => {
    const grades = ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 99999:9999'];
    for (const std of grades) {
      const { grade } = calculateReadinessScore('org-x', std);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
    }
  });

  it('calculateReadinessScore maxScore is always 100', () => {
    const result = calculateReadinessScore('org-1', 'ISO 45001:2018');
    expect(result.maxScore).toBe(100);
  });

  it('createCertificate generates a UUID id', () => {
    const cert = createCertificate({
      orgId: 'org-uuid',
      standard: 'ISO 9001:2015',
      scope: 'uuid test',
      certificationBody: 'BSI',
      certificateNumber: 'UUID-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });
    // UUID v4 format
    expect(cert.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('updateCertificate can update scope field', () => {
    const cert = createCertificate({
      orgId: 'org-scope',
      standard: 'ISO 14001:2015',
      scope: 'Old scope',
      certificationBody: 'DNV',
      certificateNumber: 'SC-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });
    const updated = updateCertificate(cert.id, { scope: 'New scope' });
    expect(updated?.scope).toBe('New scope');
  });

  it('listCertificates for org returns only certs for that org', () => {
    const cert = createCertificate({
      orgId: 'org-isolated',
      standard: 'ISO 45001:2018',
      scope: 'Isolated',
      certificationBody: 'BSI',
      certificateNumber: 'ISO-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });
    const certs = listCertificates('org-isolated');
    for (const c of certs) {
      expect(c.orgId).toBe('org-isolated');
    }
    expect(certs.find((c) => c.id === cert.id)).toBeDefined();
  });

  it('deleteCertificate then getCertificate returns undefined', () => {
    const cert = createCertificate({
      orgId: 'org-del2',
      standard: 'ISO 9001:2015',
      scope: 'Delete test',
      certificationBody: 'BSI',
      certificateNumber: 'DEL2-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });
    deleteCertificate(cert.id);
    expect(getCertificate(cert.id)).toBeUndefined();
  });

  it('calculateReadinessScore blockers each have positive deduction', () => {
    const result = calculateReadinessScore('org-1', 'ISO 9001:2015');
    for (const blocker of result.blockers) {
      expect(blocker.deduction).toBeGreaterThan(0);
    }
  });

  it('getCertificate returns correct standard for created cert', () => {
    const cert = createCertificate({
      orgId: 'org-get',
      standard: 'ISO 27001:2022',
      scope: 'Get test',
      certificationBody: 'BSI',
      certificateNumber: 'GET-001',
      issueDate: new Date('2025-01-01'),
      expiryDate: new Date('2028-01-01'),
      status: 'ACTIVE',
    });
    const found = getCertificate(cert.id);
    expect(found?.standard).toBe('ISO 27001:2022');
  });
});
