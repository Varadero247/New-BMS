// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface CronField {
  values: number[];       // expanded set of matching values
  raw: string;            // original field string
}
export interface CronExpression {
  second?: CronField;     // only in 6-field expressions
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  raw: string;
}
export interface CronSchedule {
  expression: CronExpression;
  next(from?: Date): Date;
  prev(from?: Date): Date;
  nextN(n: number, from?: Date): Date[];
  isMatch(date: Date): boolean;
}
export interface CronValidationResult { valid: boolean; error?: string; }
