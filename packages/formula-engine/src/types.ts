// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  COMMA = 'COMMA',
  CELL_REF = 'CELL_REF',
  RANGE_REF = 'RANGE_REF',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export interface FormulaResult {
  value: number | string | boolean | null;
  error?: string;
}

export type CellValue = number | string | boolean | null;

export type CellMap = Record<string, CellValue>;

export interface FormulaContext {
  cells: CellMap;
  variables?: Record<string, CellValue>;
}

export interface FunctionDef {
  name: string;
  minArgs: number;
  maxArgs: number;
  fn: (args: CellValue[], ctx: FormulaContext) => CellValue;
}
