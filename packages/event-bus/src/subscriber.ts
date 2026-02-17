import Redis from 'ioredis';
import { EventPayload, EventHandler, EventSubscription } from './types';

export class EventSubscriber {
  private redis: Redis | null = null;
  private subscriptions: EventSubscription[] = [];
  private running = false;
  private streamPrefix: string;

  constructor(redisUrl?: string, streamPrefix = 'nexara:events:') {
    this.streamPrefix = streamPrefix;
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  subscribe(event: string, handler: EventHandler, group?: string): void {
    this.subscriptions.push({ event, handler, group });
  }

  async start(): Promise<void> {
    if (!this.redis || this.running) return;
    this.running = true;

    for (const sub of this.subscriptions) {
      const stream = `${this.streamPrefix}${sub.event}`;
      const group = sub.group || 'default';

      try {
        await this.redis.xgroup('CREATE', stream, group, '0', 'MKSTREAM');
      } catch {
        // Group already exists
      }
    }

    this.poll();
  }

  private async poll(): Promise<void> {
    while (this.running && this.redis) {
      for (const sub of this.subscriptions) {
        const stream = `${this.streamPrefix}${sub.event}`;
        const group = sub.group || 'default';

        try {
          const results = await this.redis.xreadgroup(
            'GROUP', group, 'consumer-1',
            'COUNT', '10', 'BLOCK', '1000',
            'STREAMS', stream, '>'
          );

          if (results) {
            for (const [, messages] of results as Array<[string, Array<[string, string[]]>]>) {
              for (const [id, fields] of messages) {
                const payload: EventPayload = JSON.parse(fields[1]);
                await sub.handler(payload);
                await this.redis.xack(stream, group, id);
              }
            }
          }
        } catch {
          // Stream may not exist yet
        }
      }
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
