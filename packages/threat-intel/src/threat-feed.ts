import { ThreatFeedEntry, IOCRecord, IOCType, ThreatSeverity } from './types';
import { IOCManager } from './ioc-manager';

export class ThreatFeedProcessor {
  private readonly feeds: ThreatFeedEntry[] = [];
  private readonly manager: IOCManager;

  constructor(manager: IOCManager) {
    this.manager = manager;
  }

  ingest(feedId: string, feedName: string, rawEntries: Array<{ type: string; value: string; severity?: string; tags?: string[]; confidence?: number }>): ThreatFeedEntry {
    const iocs: IOCRecord[] = [];
    for (const entry of rawEntries) {
      const ioc = this.manager.add(
        entry.type as IOCType,
        entry.value,
        {
          severity: (entry.severity as ThreatSeverity) ?? 'MEDIUM',
          tags: entry.tags ?? [],
          confidence: entry.confidence ?? 70,
          source: feedName,
        }
      );
      iocs.push(ioc);
    }
    const feed: ThreatFeedEntry = {
      feedId, feedName, iocs, ingestedAt: new Date(), recordCount: iocs.length,
    };
    this.feeds.push(feed);
    return feed;
  }

  getFeeds(): ThreatFeedEntry[] { return [...this.feeds]; }
  getFeedById(feedId: string): ThreatFeedEntry | undefined { return this.feeds.find(f => f.feedId === feedId); }
  getTotalIngested(): number { return this.feeds.reduce((s, f) => s + f.recordCount, 0); }
  getLatestFeed(): ThreatFeedEntry | undefined { return this.feeds[this.feeds.length - 1]; }

  deduplicate(): number {
    const seen = new Set<string>();
    let removed = 0;
    for (const ioc of this.manager.getAll()) {
      const key = `${ioc.type}:${ioc.value}`;
      if (seen.has(key)) {
        this.manager.deactivate(ioc.id);
        removed++;
      } else {
        seen.add(key);
      }
    }
    return removed;
  }
}
