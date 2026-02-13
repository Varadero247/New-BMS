import express from 'express';
import request from 'supertest';

// Mock dependencies
const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@ims.local',
    organisationId: 'org-1',
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/database', () => ({
  prisma: {},
}));

import mspRouter from '../src/routes/msp';

// ==========================================
// Tests
// ==========================================

describe('MSP Routes', () => {
  let app: express.Express;

  const validLinkPayload = {
    clientOrganisationId: '00000000-0000-0000-0000-000000000010',
    clientOrganisationName: 'Acme Corp',
    permissions: ['READ', 'AUDIT'],
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/organisations', mspRouter);
  });

  afterEach(() => {
    // Reset authenticate to default admin user
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@ims.local',
        organisationId: 'org-1',
        roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      };
      next();
    });
  });

  // ==========================================
  // POST /api/organisations/msp-link
  // ==========================================
  describe('POST /api/organisations/msp-link', () => {
    it('should create MSP link successfully', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send(validLinkPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.consultantUserId).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.clientOrganisationId).toBe(validLinkPayload.clientOrganisationId);
      expect(response.body.data.clientOrganisationName).toBe('Acme Corp');
      expect(response.body.data.status).toBe('ACTIVE');
      expect(response.body.data.permissions).toEqual(['READ', 'AUDIT']);
    });

    it('should return 409 for duplicate active link', async () => {
      const payload = {
        clientOrganisationId: '00000000-0000-0000-0000-000000000020',
        clientOrganisationName: 'Duplicate Corp',
        permissions: ['READ'],
      };

      // Create first link
      await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send(payload);

      // Attempt duplicate
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject non-MSP users', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'viewer@ims.local',
          organisationId: 'org-1',
          roles: ['VIEWER'],
        };
        next();
      });

      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000099',
          clientOrganisationName: 'Forbidden Corp',
          permissions: ['READ'],
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toBe('MSP consultant role required');
    });

    it('should validate required fields - missing clientOrganisationId', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({ clientOrganisationName: 'Test', permissions: ['READ'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate required fields - missing permissions', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000030',
          clientOrganisationName: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate required fields - empty permissions array', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000030',
          clientOrganisationName: 'Test',
          permissions: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate required fields - invalid clientOrganisationId (not UUID)', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: 'not-a-uuid',
          clientOrganisationName: 'Test',
          permissions: ['READ'],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate required fields - missing clientOrganisationName', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000030',
          permissions: ['READ'],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should support white-label config', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000040',
          clientOrganisationName: 'Branded Corp',
          permissions: ['READ', 'MANAGE'],
          whiteLabel: {
            brandName: 'MyBrand',
            logoUrl: 'https://example.com/logo.png',
            primaryColor: '#FF5733',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.whiteLabel).toBeDefined();
      expect(response.body.data.whiteLabel.brandName).toBe('MyBrand');
      expect(response.body.data.whiteLabel.logoUrl).toBe('https://example.com/logo.png');
      expect(response.body.data.whiteLabel.primaryColor).toBe('#FF5733');
    });

    it('should set whiteLabel to null when not provided', async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000041',
          clientOrganisationName: 'No Brand Corp',
          permissions: ['READ'],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.whiteLabel).toBeNull();
    });
  });

  // ==========================================
  // GET /api/organisations/msp-clients
  // ==========================================
  describe('GET /api/organisations/msp-clients', () => {
    it('should list consultant clients', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-clients')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.items).toBeDefined();
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-clients?page=1&limit=2')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBeDefined();
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-clients?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((item: any) => {
          expect(item.status).toBe('ACTIVE');
        });
      }
    });

    it('should return summary counts', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-clients')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary).toHaveProperty('active');
      expect(response.body.data.summary).toHaveProperty('suspended');
      expect(response.body.data.summary).toHaveProperty('pending');
      expect(response.body.data.summary).toHaveProperty('total');
    });

    it('should reject non-MSP users', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'viewer@ims.local',
          organisationId: 'org-1',
          roles: ['VIEWER'],
        };
        next();
      });

      const response = await request(app)
        .get('/api/organisations/msp-clients')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================
  // GET /api/organisations/msp-dashboard
  // ==========================================
  describe('GET /api/organisations/msp-dashboard', () => {
    it('should return dashboard with client health data', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.consultant).toBeDefined();
      expect(response.body.data.consultant.userId).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.clients).toBeDefined();
      expect(Array.isArray(response.body.data.clients)).toBe(true);
      expect(response.body.data.generatedAt).toBeDefined();
    });

    it('should return summary statistics', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary).toHaveProperty('totalActiveClients');
      expect(response.body.data.summary).toHaveProperty('clientsNeedingAttention');
      expect(response.body.data.summary).toHaveProperty('totalOpenActions');
      expect(response.body.data.summary).toHaveProperty('totalOverdueCapa');
      expect(response.body.data.summary).toHaveProperty('upcomingAuditsThisMonth');
      expect(response.body.data.summary).toHaveProperty('averageComplianceScore');
    });

    it('should return consultant email in dashboard', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.consultant.email).toBe('admin@ims.local');
    });

    it('should reject non-MSP users', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'viewer@ims.local',
          organisationId: 'org-1',
          roles: ['VIEWER'],
        };
        next();
      });

      const response = await request(app)
        .get('/api/organisations/msp-dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================
  // PUT /api/organisations/msp-link/:id
  // ==========================================
  describe('PUT /api/organisations/msp-link/:id', () => {
    let createdLinkId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000050',
          clientOrganisationName: 'Update Test Corp',
          permissions: ['READ'],
        });
      createdLinkId = response.body.data.id;
    });

    it('should update link status', async () => {
      const response = await request(app)
        .put(`/api/organisations/msp-link/${createdLinkId}`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUSPENDED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUSPENDED');
    });

    it('should update permissions', async () => {
      const response = await request(app)
        .put(`/api/organisations/msp-link/${createdLinkId}`)
        .set('Authorization', 'Bearer token')
        .send({ permissions: ['READ', 'AUDIT', 'MANAGE'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toEqual(['READ', 'AUDIT', 'MANAGE']);
    });

    it('should update white-label config', async () => {
      const response = await request(app)
        .put(`/api/organisations/msp-link/${createdLinkId}`)
        .set('Authorization', 'Bearer token')
        .send({
          whiteLabel: {
            brandName: 'Updated Brand',
            primaryColor: '#00FF00',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.whiteLabel.brandName).toBe('Updated Brand');
      expect(response.body.data.whiteLabel.primaryColor).toBe('#00FF00');
    });

    it('should return 404 for non-existent link', async () => {
      const response = await request(app)
        .put('/api/organisations/msp-link/00000000-0000-0000-0000-999999999999')
        .set('Authorization', 'Bearer token')
        .send({ status: 'ACTIVE' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for other user link', async () => {
      // Create a link as a different user
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'other@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN'],
        };
        next();
      });

      const createRes = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000060',
          clientOrganisationName: 'Other User Corp',
          permissions: ['READ'],
        });

      const otherLinkId = createRes.body.data.id;

      // Switch back to main user and try to update
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
        };
        next();
      });

      const response = await request(app)
        .put(`/api/organisations/msp-link/${otherLinkId}`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUSPENDED' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toBe('You can only modify your own MSP links');
    });
  });

  // ==========================================
  // DELETE /api/organisations/msp-link/:id
  // ==========================================
  describe('DELETE /api/organisations/msp-link/:id', () => {
    let deleteLinkId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000070',
          clientOrganisationName: 'Delete Test Corp',
          permissions: ['READ'],
        });
      deleteLinkId = response.body.data.id;
    });

    it('should revoke link (sets status to REVOKED)', async () => {
      const response = await request(app)
        .delete(`/api/organisations/msp-link/${deleteLinkId}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('MSP link revoked');
      expect(response.body.data.linkId).toBe(deleteLinkId);
    });

    it('should return 404 for non-existent link', async () => {
      const response = await request(app)
        .delete('/api/organisations/msp-link/00000000-0000-0000-0000-999999999999')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for other user link', async () => {
      // Create a link as a different user
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'other@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN'],
        };
        next();
      });

      const createRes = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000071',
          clientOrganisationName: 'Other Delete Corp',
          permissions: ['READ'],
        });

      const otherLinkId = createRes.body.data.id;

      // Switch back to main user and try to delete
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
        };
        next();
      });

      const response = await request(app)
        .delete(`/api/organisations/msp-link/${otherLinkId}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toBe('You can only revoke your own MSP links');
    });
  });

  // ==========================================
  // GET /api/organisations/msp-link/:id/audit-log
  // ==========================================
  describe('GET /api/organisations/msp-link/:id/audit-log', () => {
    let auditLinkId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000080',
          clientOrganisationName: 'Audit Test Corp',
          permissions: ['READ', 'AUDIT'],
        });
      auditLinkId = response.body.data.id;
    });

    it('should return audit log entries', async () => {
      const response = await request(app)
        .get(`/api/organisations/msp-link/${auditLinkId}/audit-log`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.linkId).toBe(auditLinkId);
      expect(response.body.data.clientName).toBe('Audit Test Corp');
      expect(response.body.data.entries).toBeDefined();
      expect(Array.isArray(response.body.data.entries)).toBe(true);
      expect(response.body.data.entries.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.entries[0].action).toBe('LINK_CREATED');
      expect(response.body.data.entries[0].user).toBe('admin@ims.local');
      expect(response.body.data.entries[0].details).toBe('MSP link established');
      expect(response.body.data.total).toBe(1);
    });

    it('should return 404 for non-existent link', async () => {
      const response = await request(app)
        .get('/api/organisations/msp-link/00000000-0000-0000-0000-999999999999/audit-log')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for other user link audit log', async () => {
      // Create a link as a different user
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'other@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN'],
        };
        next();
      });

      const createRes = await request(app)
        .post('/api/organisations/msp-link')
        .set('Authorization', 'Bearer token')
        .send({
          clientOrganisationId: '00000000-0000-0000-0000-000000000081',
          clientOrganisationName: 'Other Audit Corp',
          permissions: ['READ'],
        });

      const otherLinkId = createRes.body.data.id;

      // Switch back to main user and try to access audit log
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@ims.local',
          organisationId: 'org-1',
          roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
        };
        next();
      });

      const response = await request(app)
        .get(`/api/organisations/msp-link/${otherLinkId}/audit-log`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
