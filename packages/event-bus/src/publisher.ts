import Redis from 'ioredis';
import { EventPayload } from './types';

export class EventPublisher {
  private redis: Redis | null = null;
  private streamPrefix: string;
  private localHandlers = new Map<string, Set<(payload: EventPayload) => Promise<void>>>();

  constructor(redisUrl?: string, streamPrefix = 'nexara:events:') {
    this.streamPrefix = streamPrefix;
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  async publish(
    eventType: string,
    data: Record<string, unknown>,
    context: {
      source: string;
      organisationId: string;
      userId?: string;
    }
  ): Promise<string> {
    const payload: EventPayload = {
      id: crypto.randomUUID(),
      type: eventType,
      source: context.source,
      timestamp: new Date().toISOString(),
      organisationId: context.organisationId,
      userId: context.userId,
      data,
    };

    if (this.redis) {
      const stream = `${this.streamPrefix}${eventType}`;
      await this.redis.xadd(stream, '*', 'payload', JSON.stringify(payload));
    }

    // Emit locally for in-process subscribers
    this.localHandlers.get(eventType)?.forEach((handler) => handler(payload));

    return payload.id;
  }

  onLocal(eventType: string, handler: (payload: EventPayload) => Promise<void>): void {
    if (!this.localHandlers.has(eventType)) {
      this.localHandlers.set(eventType, new Set());
    }
    this.localHandlers.get(eventType)!.add(handler);
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
