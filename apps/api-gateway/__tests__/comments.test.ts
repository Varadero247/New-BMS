import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockCreateComment = jest.fn().mockResolvedValue({
  id: '00000000-0000-0000-0000-000000000001', body: 'Test comment', mentions: [], authorId: 'user-1', authorName: 'Admin',
});
const mockGetComments = jest.fn().mockResolvedValue({ comments: [], total: 0 });
const mockUpdateComment = jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', body: 'Updated' });
const mockDeleteComment = jest.fn().mockResolvedValue(undefined);
const mockAddReaction = jest.fn().mockResolvedValue({ id: 'r1', commentId: 'c1', userId: 'user-1', emoji: '👍' });
const mockRemoveReaction = jest.fn().mockResolvedValue(undefined);
const mockGetCommentById = jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', authorId: 'user-1', createdAt: new Date().toISOString() });

jest.mock('@ims/comments', () => ({
  createComment: (...args: any[]) => mockCreateComment(...args),
  getComments: (...args: any[]) => mockGetComments(...args),
  updateComment: (...args: any[]) => mockUpdateComment(...args),
  deleteComment: (...args: any[]) => mockDeleteComment(...args),
  addReaction: (...args: any[]) => mockAddReaction(...args),
  removeReaction: (...args: any[]) => mockRemoveReaction(...args),
  getCommentById: (...args: any[]) => mockGetCommentById(...args),
}));

import commentsRoutes from '../src/routes/comments';

describe('Comments Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/comments', commentsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/comments', () => {
    it('creates a new comment', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({ recordType: 'ncr', recordId: 'r1', body: 'Test comment' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing recordType', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({ recordId: 'r1', body: 'Test' });
      expect(res.status).toBe(400);
    });

    it('supports parentId for threading', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({
          recordType: 'ncr',
          recordId: 'r1',
          body: 'Reply',
          parentId: '00000000-0000-0000-0000-000000000001',
        });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/comments', () => {
    it('returns comments for a record', async () => {
      mockGetComments.mockResolvedValue({
        comments: [{ id: '00000000-0000-0000-0000-000000000001', body: 'Test' }],
        total: 1,
      });
      const res = await request(app).get('/api/comments?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('requires recordType and recordId', async () => {
      const res = await request(app).get('/api/comments');
      expect(res.status).toBe(400);
    });

    it('supports pagination', async () => {
      const res = await request(app).get('/api/comments?recordType=ncr&recordId=r1&page=2&limit=10');
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('updates a comment', async () => {
      const res = await request(app)
        .put('/api/comments/00000000-0000-0000-0000-000000000001')
        .send({ body: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects edit from non-author', async () => {
      mockUpdateComment.mockRejectedValueOnce(new Error('Only the author can edit this comment'));
      const res = await request(app)
        .put('/api/comments/00000000-0000-0000-0000-000000000001')
        .send({ body: 'Hack' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('soft-deletes a comment by author', async () => {
      const res = await request(app).delete('/api/comments/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent comment', async () => {
      mockDeleteComment.mockRejectedValueOnce(new Error('Comment not found'));
      const res = await request(app).delete('/api/comments/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/comments/:id/reactions', () => {
    it('adds a reaction', async () => {
      const res = await request(app)
        .post('/api/comments/00000000-0000-0000-0000-000000000001/reactions')
        .send({ emoji: '👍' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing emoji', async () => {
      const res = await request(app)
        .post('/api/comments/00000000-0000-0000-0000-000000000001/reactions')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/comments/:id/reactions/:emoji', () => {
    it('removes a reaction', async () => {
      const res = await request(app).delete('/api/comments/00000000-0000-0000-0000-000000000001/reactions/%F0%9F%91%8D');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
