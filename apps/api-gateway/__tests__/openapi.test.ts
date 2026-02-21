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

    it('paths is an object', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(typeof res.body.paths).toBe('object');
    });

    it('components contains securitySchemes', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.components).toHaveProperty('securitySchemes');
    });

    it('info contains a version field', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.info).toHaveProperty('version');
    });
  });
});

describe('OpenAPI — extended', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/docs', openapiRouter);
    jest.clearAllMocks();
    mockGenerateOpenApiSpec.mockReturnValue({
      openapi: '3.0.3',
      info: { title: 'Nexara IMS API', version: '1.0.0' },
      paths: {},
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    });
  });

  it('info.title is Nexara IMS API', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.info.title).toBe('Nexara IMS API');
  });

  it('info.version is a string', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(typeof res.body.info.version).toBe('string');
  });

  it('openapi field is a string', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(typeof res.body.openapi).toBe('string');
  });
});

describe('OpenAPI — extra', () => {
  let extApp: express.Express;
  beforeEach(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/docs', openapiRouter);
    jest.clearAllMocks();
    mockGenerateOpenApiSpec.mockReturnValue({
      openapi: '3.0.3',
      info: { title: 'Nexara IMS API', version: '1.0.0', description: 'Integrated Management System API' },
      paths: { '/api/auth/login': { post: { summary: 'Login' } } },
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    });
  });

  it('generateOpenApiSpec is called once per request', async () => {
    await request(extApp).get('/api/docs/openapi.json');
    expect(mockGenerateOpenApiSpec).toHaveBeenCalledTimes(1);
  });

  it('spec has a description field in info', async () => {
    const res = await request(extApp).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.info).toHaveProperty('description');
  });

  it('paths is an object not null', async () => {
    const res = await request(extApp).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.paths).not.toBeNull();
    expect(typeof res.body.paths).toBe('object');
  });
});

describe('OpenAPI — additional coverage', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/docs', openapiRouter);
    jest.clearAllMocks();
    mockGenerateOpenApiSpec.mockReturnValue({
      openapi: '3.0.3',
      info: { title: 'Nexara IMS API', version: '1.0.0', description: 'Integrated Management System API' },
      paths: { '/api/auth/login': { post: { summary: 'Login', operationId: 'login' } } },
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    });
  });

  it('GET /api/docs returns HTML for the interactive docs page', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('openapi.json');
  });

  it('GET /api/docs/openapi.json spec has a named path entry', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.paths).toHaveProperty('/api/auth/login');
  });

  it('GET /api/docs/openapi.json returns JSON content-type', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('generateOpenApiSpec is called once per /openapi.json request', async () => {
    await request(app).get('/api/docs/openapi.json');
    await request(app).get('/api/docs/openapi.json');
    expect(mockGenerateOpenApiSpec).toHaveBeenCalledTimes(2);
  });

  it('GET /api/docs/openapi.json security scheme type is http', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.components.securitySchemes.bearerAuth.type).toBe('http');
  });
});
