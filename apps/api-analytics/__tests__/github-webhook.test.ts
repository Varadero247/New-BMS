import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    changelog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import githubRouter from '../src/routes/webhooks/github';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/webhooks/github', githubRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /webhooks/github', () => {
  it('creates a changelog from push to main', async () => {
    const mockChangelog = { id: 'cl-1', version: '2026.02.15', title: 'fix: patch bug' };
    (prisma.changelog.create as jest.Mock).mockResolvedValue(mockChangelog);

    const res = await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [
          { id: 'abc123', message: 'fix: patch bug' },
          { id: 'def456', message: 'feat: add feature' },
        ],
        head_commit: { message: 'fix: patch bug' },
        repository: { full_name: 'nexara/ims', name: 'ims' },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.changelog).toBeDefined();
    expect(prisma.changelog.create).toHaveBeenCalledTimes(1);
  });

  it('ignores non-main branch pushes', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/feature/my-branch',
        commits: [{ id: 'abc', message: 'wip' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.skipped).toBe(true);
    expect(res.body.data.reason).toBe('Not main branch');
    expect(prisma.changelog.create).not.toHaveBeenCalled();
  });

  it('handles push with empty commits array', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.skipped).toBe(true);
    expect(res.body.data.reason).toBe('No commits');
    expect(prisma.changelog.create).not.toHaveBeenCalled();
  });

  it('generates date-based version string', async () => {
    (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-2' });

    await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [{ id: 'abc', message: 'test' }],
        head_commit: { message: 'test' },
      });

    const createCall = (prisma.changelog.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.version).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it('concatenates commit messages as summary', async () => {
    (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-3' });

    await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [
          { id: 'a1', message: 'fix: first' },
          { id: 'a2', message: 'feat: second' },
        ],
        head_commit: { message: 'feat: second' },
      });

    const createCall = (prisma.changelog.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.summary).toContain('fix: first');
    expect(createCall.data.summary).toContain('feat: second');
  });

  it('stores first commit SHA in commitSha field', async () => {
    (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-4' });

    await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [{ id: 'sha1' }, { id: 'sha2' }],
        head_commit: { message: 'test' },
      });

    const createCall = (prisma.changelog.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.commitSha).toBe('sha1');
    expect(createCall.data.details.shas).toEqual(['sha1', 'sha2']);
    expect(createCall.data.details.commitCount).toBe(2);
  });

  it('stores repository name in details', async () => {
    (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-5' });

    await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [{ id: 'x', message: 't' }],
        head_commit: { message: 't' },
        repository: { full_name: 'org/repo' },
      });

    const createCall = (prisma.changelog.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.details.repository).toBe('org/repo');
  });

  it('handles master branch pushes', async () => {
    (prisma.changelog.create as jest.Mock).mockResolvedValue({ id: 'cl-6' });

    const res = await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/master',
        commits: [{ id: 'x', message: 'legacy push' }],
        head_commit: { message: 'legacy push' },
      });

    expect(res.status).toBe(200);
    expect(prisma.changelog.create).toHaveBeenCalled();
  });

  it('handles database errors gracefully', async () => {
    (prisma.changelog.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/webhooks/github')
      .send({
        ref: 'refs/heads/main',
        commits: [{ id: 'x', message: 'err' }],
        head_commit: { message: 'err' },
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('handles missing ref gracefully', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .send({ commits: [{ id: 'x', message: 'no ref' }] });

    expect(res.status).toBe(200);
    expect(res.body.data.skipped).toBe(true);
  });
});
