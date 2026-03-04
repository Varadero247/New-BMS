// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: EventPublisher + EventSubscriber with real Redis Streams (no mocks).
import Redis from 'ioredis';
import { EventPublisher } from '../../publisher';
import { EventSubscriber } from '../../subscriber';
import type { EventPayload } from '../../types';
import { waitFor } from '../../../../shared/src/test-utils/api-helpers';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const TEST_STREAM_PREFIX = 'nexara:test:events:';

let publisher: EventPublisher;
let redisAdmin: Redis;

beforeAll(async () => {
  redisAdmin = new Redis(REDIS_URL);
  // Flush only test streams
  const keys = await redisAdmin.keys(`${TEST_STREAM_PREFIX}*`);
  if (keys.length > 0) await redisAdmin.del(...keys);
});

beforeEach(() => {
  publisher = new EventPublisher(REDIS_URL, TEST_STREAM_PREFIX);
});

afterEach(async () => {
  await publisher.disconnect();
});

afterAll(async () => {
  // Clean up test streams
  const keys = await redisAdmin.keys(`${TEST_STREAM_PREFIX}*`);
  if (keys.length > 0) await redisAdmin.del(...keys);
  await redisAdmin.quit();
});

const TEST_CONTEXT = {
  source: 'integration-test',
  organisationId: 'test-org-001',
  userId: 'test-user-admin-001',
};

describe('EventPublisher — local handlers', () => {
  it('onLocal handler receives event immediately after publish', async () => {
    const received: EventPayload[] = [];
    publisher.onLocal('test.event.local', async (payload) => {
      received.push(payload);
    });

    await publisher.publish('test.event.local', { key: 'value' }, TEST_CONTEXT);

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('test.event.local');
    expect(received[0].source).toBe('integration-test');
    expect(received[0].organisationId).toBe('test-org-001');
    expect(received[0].userId).toBe('test-user-admin-001');
    expect(received[0].data).toEqual({ key: 'value' });
  });

  it('EventPayload has all required fields', async () => {
    let captured: EventPayload | null = null;
    publisher.onLocal('test.payload.shape', async (payload) => {
      captured = payload;
    });

    await publisher.publish('test.payload.shape', { test: true }, TEST_CONTEXT);

    expect(captured).not.toBeNull();
    expect(typeof captured!.id).toBe('string');
    expect(captured!.id.length).toBeGreaterThan(0);
    expect(typeof captured!.timestamp).toBe('string');
    expect(new Date(captured!.timestamp).getTime()).not.toBeNaN();
    expect(captured!.type).toBe('test.payload.shape');
    expect(captured!.source).toBe('integration-test');
    expect(captured!.organisationId).toBe('test-org-001');
  });

  it('multiple local subscribers all receive the same event', async () => {
    const results: EventPayload[][] = [[], [], []];
    for (let i = 0; i < 3; i++) {
      const idx = i;
      publisher.onLocal('test.multi.subscriber', async (payload) => {
        results[idx].push(payload);
      });
    }

    await publisher.publish('test.multi.subscriber', { seq: 1 }, TEST_CONTEXT);

    expect(results[0]).toHaveLength(1);
    expect(results[1]).toHaveLength(1);
    expect(results[2]).toHaveLength(1);
    expect(results[0][0].id).toBe(results[1][0].id);
    expect(results[1][0].id).toBe(results[2][0].id);
  });

  it('10 sequential events are received in order', async () => {
    const received: number[] = [];
    publisher.onLocal('test.ordering', async (payload) => {
      received.push(payload.data.seq as number);
    });

    for (let i = 0; i < 10; i++) {
      await publisher.publish('test.ordering', { seq: i }, TEST_CONTEXT);
    }

    expect(received).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('handler not registered for event type does NOT receive events', async () => {
    const received: EventPayload[] = [];
    publisher.onLocal('test.specific.type', async (payload) => {
      received.push(payload);
    });

    await publisher.publish('test.different.type', { unrelated: true }, TEST_CONTEXT);

    expect(received).toHaveLength(0);
  });
});

describe('EventPublisher + EventSubscriber — Redis Streams', () => {
  it('subscriber receives published event via Redis within 3s', async () => {
    const subscriber = new EventSubscriber(REDIS_URL, TEST_STREAM_PREFIX);
    const received: EventPayload[] = [];

    subscriber.subscribe('test.redis.integration', async (payload) => {
      received.push(payload);
    });

    await subscriber.start();

    // Give consumer group time to initialize
    await new Promise((r) => setTimeout(r, 100));

    await publisher.publish('test.redis.integration', { msg: 'hello from Redis' }, TEST_CONTEXT);

    try {
      await waitFor(() => received.length >= 1, { timeout: 3000, message: 'Event not received from Redis Streams' });
    } finally {
      await subscriber.stop();
    }

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('test.redis.integration');
    expect(received[0].data).toEqual({ msg: 'hello from Redis' });
  });

  it('publish returns a non-empty id string', async () => {
    const id = await publisher.publish('test.id.check', { x: 1 }, TEST_CONTEXT);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('multiple events published to Redis arrive in order via subscriber', async () => {
    const subscriber = new EventSubscriber(REDIS_URL, TEST_STREAM_PREFIX);
    const received: number[] = [];

    subscriber.subscribe('test.redis.order', async (payload) => {
      received.push(payload.data.seq as number);
    });

    await subscriber.start();
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await publisher.publish('test.redis.order', { seq: i }, TEST_CONTEXT);
    }

    try {
      await waitFor(() => received.length >= 5, { timeout: 5000, message: '5 ordered events not received' });
    } finally {
      await subscriber.stop();
    }

    expect(received).toEqual([0, 1, 2, 3, 4]);
  });
});
