// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { SupplierEvaluation, EvaluationCriteria, EvaluationResult } from './types';

let _evalCounter = 0;
function generateEvalId(): string {
  _evalCounter += 1;
  return `EVAL-${String(_evalCounter).padStart(6, '0')}`;
}

export class EvaluationTracker {
  private evaluations: Map<string, SupplierEvaluation> = new Map();

  evaluate(
    supplierId: string,
    evaluatedBy: string,
    evaluatedAt: string,
    result: EvaluationResult,
    scores: Record<EvaluationCriteria, number>,
    comments?: string,
    nextEvaluationDate?: string,
  ): SupplierEvaluation {
    const id = generateEvalId();
    const scoreValues = Object.values(scores) as number[];
    const overallScore =
      scoreValues.length > 0
        ? scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length
        : 0;

    const evaluation: SupplierEvaluation = {
      id,
      supplierId,
      evaluatedBy,
      evaluatedAt,
      result,
      scores: { ...scores },
      overallScore,
      comments,
      nextEvaluationDate,
    };
    this.evaluations.set(id, evaluation);
    return { ...evaluation };
  }

  getBySupplier(supplierId: string): SupplierEvaluation[] {
    return Array.from(this.evaluations.values())
      .filter((e) => e.supplierId === supplierId)
      .map((e) => ({ ...e }));
  }

  getLatest(supplierId: string): SupplierEvaluation | undefined {
    const evals = this.getBySupplier(supplierId);
    if (evals.length === 0) return undefined;
    return evals.reduce((latest, e) =>
      e.evaluatedAt > latest.evaluatedAt ? e : latest,
    );
  }

  getByResult(result: EvaluationResult): SupplierEvaluation[] {
    return Array.from(this.evaluations.values())
      .filter((e) => e.result === result)
      .map((e) => ({ ...e }));
  }

  getAverageScore(supplierId: string): number {
    const evals = this.getBySupplier(supplierId);
    if (evals.length === 0) return 0;
    return evals.reduce((sum, e) => sum + e.overallScore, 0) / evals.length;
  }

  getTopPerformers(threshold: number): string[] {
    const supplierIds = new Set(
      Array.from(this.evaluations.values()).map((e) => e.supplierId),
    );
    const result: string[] = [];
    supplierIds.forEach((sid) => {
      if (this.getAverageScore(sid) >= threshold) {
        result.push(sid);
      }
    });
    return result;
  }

  getCount(): number {
    return this.evaluations.size;
  }
}
