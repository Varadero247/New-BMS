import express from 'express';
import request from 'supertest';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockGenerateOpenApiSpec = jest.fn().mockReturnValue({
  openapi: '3.0.3',
  info: {
    title: 'Nexara IMS API',
    version: '1.0.0',
    description: 'Integrated Management System API',
  },
  paths: {
    '/api/auth/login': {
      post: { summary: 'Login', operationId: 'login' },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
    },
  },
});

jest.mock('@ims/openapi', () => ({
  generateOpenApiSpec: (...args: any[]) => mockGenerateOpenApiSpec(...args),
}));

import openapiRouter from '../src/routes/openapi';

describe('OpenAPI Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/docs', openapiRouter);
    jest.clearAllMocks();
    mockGenerateOpenApiSpec.mockReturnValue({
      openapi: '3.0.3',
      info: {
        title: 'Nexara IMS API',
        version: '1.0.0',
        description: 'Integrated Management System API',
      },
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    });
  });

  describe('GET /api/docs/openapi.json', () => {
    it('returns the OpenAPI spec (public, no auth required)', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi', '3.0.3');
    });

    it('returns valid OpenAPI structure with info and paths', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.body).toHaveProperty('info');
      expect(res.body.info).toHaveProperty('title', 'Nexara IMS API');
      expect(res.body.info).toHaveProperty('version');
      expect(res.body).toHaveProperty('paths');
    });

    it('includes security schemes in components', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.body).toHaveProperty('components');
    });

    it('returns 500 when spec generation fails', async () => {
      mockGenerateOpenApiSpec.mockImplementationOnce(() => {
        throw new Error('Spec generation failed');
      });
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('calls generateOpenApiSpec exactly once per request', async () => {
      await request(app).get('/api/docs/openapi.json');
      expect(mockGenerateOpenApiSpec).toHaveBeenCalledTimes(1);
    });

    it('does not require authorization header', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      // No Authorization header — should still succeed
      expect(res.status).toBe(200);
    });
  });
});
