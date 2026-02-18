import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {},
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/extraction';
const app = express();
app.use(express.json());
app.use('/api/extraction', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/extraction/analyze', () => {
  it('should analyze contract text and return extracted data', async () => {
    const res = await request(app).post('/api/extraction/analyze').send({
      text: 'This agreement is entered into between Party A and Party B on January 1, 2026.',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.extracted).toBeDefined();
    expect(res.body.data.extracted.parties).toBeDefined();
    expect(res.body.data.extracted.dates).toBeDefined();
    expect(res.body.data.extracted.values).toBeDefined();
    expect(res.body.data.extracted.keyTerms).toBeDefined();
    expect(res.body.data.wordCount).toBeGreaterThan(0);
    // dates: "January 1, 2026" should be extracted
    expect(res.body.data.extracted.dates.length).toBeGreaterThan(0);
  });

  it('should return 400 if text is missing', async () => {
    const res = await request(app).post('/api/extraction/analyze').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if text is empty string', async () => {
    const res = await request(app).post('/api/extraction/analyze').send({ text: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
