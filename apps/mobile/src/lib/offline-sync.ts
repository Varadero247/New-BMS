/**
 * Offline Sync Engine for IMS Mobile App
 * Uses local queue + background sync pattern
 */

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: unknown;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

export class OfflineSyncEngine {
  private queue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setOnlineStatus(online: boolean) {
    this.isOnline = online;
    if (online) this.processQueue();
  }

  async enqueue(endpoint: string, method: SyncQueueItem['method'], body: unknown): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      body,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    };
    this.queue.push(item);

    if (this.isOnline) {
      await this.processQueue();
    }

    return item.id;
  }

  async processQueue(): Promise<void> {
    const pending = this.queue.filter(i => i.status === 'pending' || i.status === 'failed');

    for (const item of pending) {
      if (item.retryCount >= item.maxRetries) {
        item.status = 'failed';
        continue;
      }

      item.status = 'syncing';
      try {
        const response = await fetch(`${this.baseUrl}${item.endpoint}`, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
          },
          body: JSON.stringify(item.body),
        });

        if (response.ok) {
          item.status = 'synced';
        } else {
          item.status = 'failed';
          item.retryCount++;
        }
      } catch {
        item.status = 'failed';
        item.retryCount++;
      }
    }
  }

  getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.filter(i => i.status === 'pending' || i.status === 'failed').length;
  }

  clearSynced(): void {
    this.queue = this.queue.filter(i => i.status !== 'synced');
  }
}
