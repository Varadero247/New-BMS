// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Regulation, ImportResult } from './types';
import { REGULATORY_SOURCES } from './sources';

/**
 * Regulatory feed service for managing and querying regulations.
 * In production, this would interface with actual regulatory APIs and databases.
 */
export class RegulatoryFeedService {
  private regulations: Map<string, Regulation> = new Map();

  /**
   * Add a regulation to the internal store (for testing/seeding).
   */
  addRegulation(regulation: Regulation): void {
    this.regulations.set(regulation.id, regulation);
  }

  /**
   * Add multiple regulations.
   */
  addRegulations(regulations: Regulation[]): void {
    for (const reg of regulations) {
      this.regulations.set(reg.id, reg);
    }
  }

  /**
   * Get the latest regulations from a specific source.
   *
   * @param source - Source ID (e.g. 'uk_hse', 'eu_oj')
   * @param limit - Maximum number of regulations to return (default: 10)
   * @returns Array of regulations sorted by published date (newest first)
   */
  getLatest(source: string, limit: number = 10): Regulation[] {
    const sourceConfig = REGULATORY_SOURCES[source];
    if (!sourceConfig) {
      throw new Error(`Unknown regulatory source: ${source}`);
    }

    return Array.from(this.regulations.values())
      .filter((reg) => reg.source === source)
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, limit);
  }

  /**
   * Search regulations by keyword query.
   *
   * @param query - Search query string
   * @returns Array of matching regulations
   */
  searchRegulations(query: string): Regulation[] {
    const terms = query.toLowerCase().split(/\s+/);

    return Array.from(this.regulations.values()).filter((reg) => {
      const searchText =
        `${reg.title} ${reg.description} ${reg.keywords.join(' ')} ${reg.categories.join(' ')}`.toLowerCase();
      return terms.every((term) => searchText.includes(term));
    });
  }

  /**
   * Import a regulation into the legal register.
   * In production, this would create a record in the legal compliance database.
   *
   * @param regulationId - ID of the regulation to import
   * @returns Import result
   */
  importToLegalRegister(regulationId: string): ImportResult {
    const regulation = this.regulations.get(regulationId);

    if (!regulation) {
      return {
        success: false,
        regulationId,
        message: `Regulation ${regulationId} not found`,
      };
    }

    // In production, this would create a legal register entry via Prisma
    const legalRegisterId = `LR-${Date.now()}`;

    return {
      success: true,
      regulationId,
      legalRegisterId,
      message: `Successfully imported "${regulation.title}" to legal register as ${legalRegisterId}`,
    };
  }

  /**
   * Get a regulation by ID.
   */
  getById(id: string): Regulation | undefined {
    return this.regulations.get(id);
  }

  /**
   * Get all regulations.
   */
  getAll(): Regulation[] {
    return Array.from(this.regulations.values());
  }

  /**
   * Get count of regulations by source.
   */
  getCountBySource(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const reg of this.regulations.values()) {
      counts[reg.source] = (counts[reg.source] || 0) + 1;
    }
    return counts;
  }
}
