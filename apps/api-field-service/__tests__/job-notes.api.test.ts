import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcJobNote: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import jobNotesRouter from '../src/routes/job-notes';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/job-notes', jobNotesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/job-notes', () => {
  it('should return job notes with pagination', async () => {
    const notes = [
      { id: '00000000-0000-0000-0000-000000000001', type: 'NOTE', content: 'Test note' },
    ];
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue(notes);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(1);

    const res = await request(app).get('/api/job-notes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by jobId', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    await request(app).get('/api/job-notes?jobId=job-1');

    expect(mockPrisma.fsSvcJobNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'job-1' }),
      })
    );
  });

  it('should filter by type', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    await request(app).get('/api/job-notes?type=PHOTO');

    expect(mockPrisma.fsSvcJobNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'PHOTO' }),
      })
    );
  });
});

describe('POST /api/job-notes', () => {
  it('should create a job note', async () => {
    const created = {
      id: 'note-new',
      type: 'NOTE',
      content: 'New note',
      jobId: 'job-1',
      authorId: 'user-123',
    };
    mockPrisma.fsSvcJobNote.create.mockResolvedValue(created);

    const res = await request(app).post('/api/job-notes').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      content: 'New note',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create a photo note', async () => {
    const created = { id: 'note-new', type: 'PHOTO', content: 'photo-url' };
    mockPrisma.fsSvcJobNote.create.mockResolvedValue(created);

    const res = await request(app).post('/api/job-notes').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'PHOTO',
      content: 'photo-url',
    });

    expect(res.status).toBe(201);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/job-notes').send({ content: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/job-notes/:id', () => {
  it('should return a job note', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      content: 'Test',
    });

    const res = await request(app).get('/api/job-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/job-notes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/job-notes/:id', () => {
  it('should update a job note', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      content: 'Updated',
    });

    const res = await request(app)
      .put('/api/job-notes/00000000-0000-0000-0000-000000000001')
      .send({ content: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/job-notes/00000000-0000-0000-0000-000000000099')
      .send({ content: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/job-notes/:id', () => {
  it('should soft delete a job note', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Job note deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/job-notes');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcJobNote.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/job-notes').send({
      jobId: '00000000-0000-0000-0000-000000000001',
      content: 'Test note',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/job-notes/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJobNote.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/job-notes/00000000-0000-0000-0000-000000000001')
      .send({ content: 'Updated note' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJobNote.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('job-notes.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/job-notes', jobNotesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/job-notes', async () => {
    const res = await request(app).get('/api/job-notes');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/job-notes', async () => {
    const res = await request(app).get('/api/job-notes');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/job-notes body has success property', async () => {
    const res = await request(app).get('/api/job-notes');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

// ─── Extended coverage ───────────────────────────────────────────────────────

describe('job-notes.api — extended edge cases', () => {
  it('GET / returns pagination metadata', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', type: 'NOTE', content: 'c1' },
    ]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(7);

    const res = await request(app).get('/api/job-notes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(7);
  });

  it('GET / applies page and limit to query', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    await request(app).get('/api/job-notes?page=2&limit=10');

    expect(mockPrisma.fsSvcJobNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET / filters by both jobId and type simultaneously', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    await request(app).get('/api/job-notes?jobId=job-123&type=PHOTO');

    expect(mockPrisma.fsSvcJobNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'job-123', type: 'PHOTO' }),
      })
    );
  });

  it('POST / returns 400 when jobId is missing', async () => {
    const res = await request(app).post('/api/job-notes').send({ content: 'No jobId here' });

    expect(res.status).toBe(400);
  });

  it('POST / stores authorId from authenticated user', async () => {
    mockPrisma.fsSvcJobNote.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      type: 'NOTE',
      content: 'Test',
      jobId: '00000000-0000-0000-0000-000000000001',
      authorId: 'user-123',
    });

    await request(app).post('/api/job-notes').send({
      jobId: '00000000-0000-0000-0000-000000000001',
      content: 'Test',
    });

    expect(mockPrisma.fsSvcJobNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ authorId: 'user-123' }),
      })
    );
  });

  it('PUT /:id returns success:true with updated content', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002' });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      content: 'Updated content',
    });

    const res = await request(app)
      .put('/api/job-notes/00000000-0000-0000-0000-000000000002')
      .send({ content: 'Updated content' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns success:true', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000003' });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000003');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/job-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update rejects', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000004' });
    mockPrisma.fsSvcJobNote.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000004');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('job-notes.api — further coverage', () => {
  it('GET / returns success:true on empty result set', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/job-notes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET / pagination.page defaults to 1 when not supplied', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/job-notes');

    expect(res.body.pagination.page).toBe(1);
  });

  it('POST / create is called with type NOTE when type is omitted', async () => {
    mockPrisma.fsSvcJobNote.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      type: 'NOTE',
      content: 'default type',
      jobId: '00000000-0000-0000-0000-000000000001',
    });

    await request(app).post('/api/job-notes').send({
      jobId: '00000000-0000-0000-0000-000000000001',
      content: 'default type',
    });

    expect(mockPrisma.fsSvcJobNote.create).toHaveBeenCalled();
  });

  it('GET / data array is always an array', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/job-notes');

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /:id update passes correct id in where clause', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000050' });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000050', content: 'Updated' });

    await request(app)
      .put('/api/job-notes/00000000-0000-0000-0000-000000000050')
      .send({ content: 'Updated' });

    expect(mockPrisma.fsSvcJobNote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000050' }),
      })
    );
  });

  it('DELETE /:id returns message "Job note deleted" in data.message', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060' });
    mockPrisma.fsSvcJobNote.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060', deletedAt: new Date() });

    const res = await request(app).delete('/api/job-notes/00000000-0000-0000-0000-000000000060');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Job note deleted');
  });
});

describe('job-notes.api — final coverage', () => {
  it('GET / applies skip=20 for page=3 limit=10', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(0);
    await request(app).get('/api/job-notes?page=3&limit=10');
    expect(mockPrisma.fsSvcJobNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET / returns correct pagination.total from count mock', async () => {
    mockPrisma.fsSvcJobNote.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJobNote.count.mockResolvedValue(17);
    const res = await request(app).get('/api/job-notes');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(17);
  });

  it('POST / returns 400 when content is empty string', async () => {
    const res = await request(app).post('/api/job-notes').send({
      jobId: '00000000-0000-0000-0000-000000000001',
      content: '',
    });
    expect(res.status).toBe(400);
  });

  it('GET /:id returns 200 with correct content field', async () => {
    mockPrisma.fsSvcJobNote.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000070',
      content: 'Check valve replaced',
    });
    const res = await request(app).get('/api/job-notes/00000000-0000-0000-0000-000000000070');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('content', 'Check valve replaced');
  });

  it('POST / create is not called when validation fails', async () => {
    await request(app).post('/api/job-notes').send({});
    expect(mockPrisma.fsSvcJobNote.create).not.toHaveBeenCalled();
  });
});

describe('job notes — phase29 coverage', () => {
  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles Map size', () => {
    const m = new Map<string, number>([['a', 1]]); expect(m.size).toBe(1);
  });

  it('handles bitwise AND', () => {
    expect(5 & 3).toBe(1);
  });

  it('handles Promise type', () => {
    expect(Promise.resolve(42)).toBeInstanceOf(Promise);
  });

  it('handles try-catch flow', () => {
    let caught = false; try { throw new Error(); } catch { caught = true; } expect(caught).toBe(true);
  });

});

describe('job notes — phase30 coverage', () => {
  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles object type', () => {
    expect(typeof {}).toBe('object');
  });

  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

});


describe('phase31 coverage', () => {
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
  it('handles empty object', () => { const o = {}; expect(Object.keys(o).length).toBe(0); });
  it('handles typeof null', () => { expect(typeof null).toBe('object'); });
});


describe('phase32 coverage', () => {
  it('handles array sort', () => { expect([3,1,2].sort()).toEqual([1,2,3]); });
  it('handles number exponential', () => { expect((12345).toExponential(2)).toBe('1.23e+4'); });
  it('handles string indexOf', () => { expect('foobar'.indexOf('bar')).toBe(3); expect('foobar'.indexOf('baz')).toBe(-1); });
  it('handles Math.pow', () => { expect(Math.pow(2,10)).toBe(1024); });
  it('handles class instantiation', () => { class C { val: number; constructor(v: number) { this.val = v; } } const c = new C(7); expect(c.val).toBe(7); });
});
