// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  TokenType,
  Token,
  FormulaResult,
  CellValue,
  CellMap,
  FormulaContext,
  FunctionDef,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseNumber(v: CellValue): number {
  if (v === null) return 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function parseBoolean(v: CellValue): boolean {
  if (v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const upper = String(v).toUpperCase().trim();
  if (upper === 'TRUE' || upper === '1') return true;
  if (upper === 'FALSE' || upper === '0') return false;
  return Boolean(v);
}

/**
 * Convert a spreadsheet column label (A, B, ..., Z, AA, AB, ...) to a 0-based index.
 */
function colLabelToIndex(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Convert a 0-based column index to a spreadsheet column label (0→A, 25→Z, 26→AA …).
 */
function indexToColLabel(index: number): string {
  let label = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

export function cellRefToIndices(ref: string): { col: number; row: number } {
  const match = ref.toUpperCase().match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  return {
    col: colLabelToIndex(match[2]),
    row: parseInt(match[4], 10) - 1,
  };
}

export function indicesToCellRef(col: number, row: number): string {
  return `${indexToColLabel(col)}${row + 1}`;
}

export function expandRange(range: string, cells: CellMap): CellValue[] {
  const parts = range.toUpperCase().split(':');
  if (parts.length !== 2) return [];
  const start = cellRefToIndices(parts[0]);
  const end = cellRefToIndices(parts[1]);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const values: CellValue[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const key = indicesToCellRef(c, r);
      values.push(key in cells ? cells[key] : null);
    }
  }
  return values;
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

const RANGE_PATTERN = /^[A-Za-z$]+\d+:[A-Za-z$]+\d+$/;
const CELL_PATTERN = /^[A-Za-z$]+\d+$/;

export function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = formula.length;

  while (i < len) {
    const pos = i;
    const ch = formula[i];

    // Skip whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // String literal
    if (ch === '"') {
      i++;
      let str = '';
      while (i < len && formula[i] !== '"') {
        if (formula[i] === '\\' && i + 1 < len) {
          i++;
          const esc = formula[i];
          str += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc;
        } else {
          str += formula[i];
        }
        i++;
      }
      if (i < len) i++; // closing quote
      tokens.push({ type: TokenType.STRING, value: str, pos });
      continue;
    }

    // Number literal
    if (/\d/.test(ch) || (ch === '.' && i + 1 < len && /\d/.test(formula[i + 1]))) {
      let num = '';
      while (i < len && /[\d.]/.test(formula[i])) { num += formula[i++]; }
      // Scientific notation
      if (i < len && (formula[i] === 'e' || formula[i] === 'E')) {
        num += formula[i++];
        if (i < len && (formula[i] === '+' || formula[i] === '-')) num += formula[i++];
        while (i < len && /\d/.test(formula[i])) num += formula[i++];
      }
      tokens.push({ type: TokenType.NUMBER, value: num, pos });
      continue;
    }

    // Two-char operators
    if (i + 1 < len) {
      const two = formula.slice(i, i + 2);
      if (['<>', '<=', '>='].includes(two)) {
        tokens.push({ type: TokenType.OPERATOR, value: two, pos });
        i += 2;
        continue;
      }
    }

    // Single-char operators & punctuation
    if ('+-*/^=<>&'.includes(ch)) {
      tokens.push({ type: TokenType.OPERATOR, value: ch, pos });
      i++;
      continue;
    }
    if (ch === '(') { tokens.push({ type: TokenType.LPAREN, value: '(', pos }); i++; continue; }
    if (ch === ')') { tokens.push({ type: TokenType.RPAREN, value: ')', pos }); i++; continue; }
    if (ch === ',') { tokens.push({ type: TokenType.COMMA, value: ',', pos }); i++; continue; }

    // Identifier: function name, boolean, cell ref, range ref
    if (/[A-Za-z$_]/.test(ch)) {
      let ident = '';
      // Consume letters/digits/$ (for absolute refs like $A$1)
      while (i < len && /[A-Za-z0-9$_]/.test(formula[i])) { ident += formula[i++]; }
      // Check for range ref: ident looks like a cell ref AND next char is ':'
      if (i < len && formula[i] === ':') {
        // Could be a range — consume the second part
        const potentialStart = ident;
        if (CELL_PATTERN.test(potentialStart)) {
          i++; // consume ':'
          let ident2 = '';
          while (i < len && /[A-Za-z0-9$]/.test(formula[i])) { ident2 += formula[i++]; }
          const rangeStr = `${potentialStart}:${ident2}`.toUpperCase();
          if (RANGE_PATTERN.test(rangeStr)) {
            tokens.push({ type: TokenType.RANGE_REF, value: rangeStr, pos });
            continue;
          }
          // Not a valid range — backtrack (push both as separate tokens best effort)
          tokens.push({ type: TokenType.CELL_REF, value: potentialStart.toUpperCase(), pos });
          // ident2 is orphaned — push as identifier
          if (ident2) tokens.push({ type: TokenType.FUNCTION, value: ident2.toUpperCase(), pos: pos + potentialStart.length + 1 });
          continue;
        }
      }

      const upper = ident.toUpperCase();
      if (upper === 'TRUE') {
        tokens.push({ type: TokenType.BOOLEAN, value: 'TRUE', pos });
      } else if (upper === 'FALSE') {
        tokens.push({ type: TokenType.BOOLEAN, value: 'FALSE', pos });
      } else if (CELL_PATTERN.test(upper)) {
        // Could be a cell ref (e.g. A1) or a function name followed by '('
        if (i < len && formula[i] === '(') {
          // It's a function call
          tokens.push({ type: TokenType.FUNCTION, value: upper, pos });
        } else {
          tokens.push({ type: TokenType.CELL_REF, value: upper, pos });
        }
      } else {
        // Function name or variable
        tokens.push({ type: TokenType.FUNCTION, value: upper, pos });
      }
      continue;
    }

    // Unknown character — skip
    i++;
  }

  tokens.push({ type: TokenType.EOF, value: '', pos: i });
  return tokens;
}

// ---------------------------------------------------------------------------
// Parser / Evaluator (Recursive Descent)
// ---------------------------------------------------------------------------

class Parser {
  private tokens: Token[];
  private pos: number;
  private ctx: FormulaContext;

  constructor(tokens: Token[], ctx: FormulaContext) {
    this.tokens = tokens;
    this.pos = 0;
    this.ctx = ctx;
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { type: TokenType.EOF, value: '', pos: -1 };
  }

  private consume(): Token {
    return this.tokens[this.pos++] ?? { type: TokenType.EOF, value: '', pos: -1 };
  }

  private expect(type: TokenType): Token {
    const t = this.consume();
    if (t.type !== type) throw new Error(`Expected ${type} but got ${t.type} ('${t.value}') at pos ${t.pos}`);
    return t;
  }

  // expression → comparison
  parseExpression(): CellValue {
    return this.parseConcat();
  }

  // concat → comparison { '&' comparison }
  private parseConcat(): CellValue {
    let left = this.parseComparison();
    while (this.peek().type === TokenType.OPERATOR && this.peek().value === '&') {
      this.consume();
      const right = this.parseComparison();
      left = String(left ?? '') + String(right ?? '');
    }
    return left;
  }

  // comparison → additive { ('='|'<>'|'<'|'>'|'<='|'>=') additive }
  private parseComparison(): CellValue {
    let left = this.parseAdditive();
    const compOps = ['=', '<>', '<', '>', '<=', '>='];
    while (this.peek().type === TokenType.OPERATOR && compOps.includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseAdditive();
      switch (op) {
        case '=':  left = (left === right); break;
        case '<>': left = (left !== right); break;
        case '<':  left = (parseNumber(left) < parseNumber(right)); break;
        case '>':  left = (parseNumber(left) > parseNumber(right)); break;
        case '<=': left = (parseNumber(left) <= parseNumber(right)); break;
        case '>=': left = (parseNumber(left) >= parseNumber(right)); break;
      }
    }
    return left;
  }

  // additive → multiplicative { ('+'|'-') multiplicative }
  private parseAdditive(): CellValue {
    let left = this.parseMultiplicative();
    while (this.peek().type === TokenType.OPERATOR && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      left = op === '+' ? parseNumber(left) + parseNumber(right) : parseNumber(left) - parseNumber(right);
    }
    return left;
  }

  // multiplicative → power { ('*'|'/') power }
  private parseMultiplicative(): CellValue {
    let left = this.parsePower();
    while (this.peek().type === TokenType.OPERATOR && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value;
      const right = this.parsePower();
      if (op === '/') {
        const divisor = parseNumber(right);
        if (divisor === 0) throw new Error('#DIV/0!');
        left = parseNumber(left) / divisor;
      } else {
        left = parseNumber(left) * parseNumber(right);
      }
    }
    return left;
  }

  // power → unary { '^' unary }
  private parsePower(): CellValue {
    let base = this.parseUnary();
    while (this.peek().type === TokenType.OPERATOR && this.peek().value === '^') {
      this.consume();
      const exp = this.parseUnary();
      base = Math.pow(parseNumber(base), parseNumber(exp));
    }
    return base;
  }

  // unary → '-' unary | '+' unary | primary  (recursive to handle --, +--, etc.)
  private parseUnary(): CellValue {
    if (this.peek().type === TokenType.OPERATOR && this.peek().value === '-') {
      this.consume();
      return -parseNumber(this.parseUnary());
    }
    if (this.peek().type === TokenType.OPERATOR && this.peek().value === '+') {
      this.consume();
      return parseNumber(this.parseUnary());
    }
    return this.parsePrimary();
  }

  // primary → number | string | boolean | cell_ref | range_ref | function_call | '(' expression ')'
  private parsePrimary(): CellValue {
    const tok = this.peek();

    if (tok.type === TokenType.NUMBER) {
      this.consume();
      return parseFloat(tok.value);
    }

    if (tok.type === TokenType.STRING) {
      this.consume();
      return tok.value;
    }

    if (tok.type === TokenType.BOOLEAN) {
      this.consume();
      return tok.value === 'TRUE';
    }

    if (tok.type === TokenType.CELL_REF) {
      this.consume();
      const key = tok.value.toUpperCase();
      if (key in this.ctx.cells) return this.ctx.cells[key];
      if (this.ctx.variables && key in this.ctx.variables) return this.ctx.variables[key];
      return null;
    }

    if (tok.type === TokenType.RANGE_REF) {
      this.consume();
      // Range used directly (not inside a function) — return sum for backward compat
      const vals = expandRange(tok.value, this.ctx.cells);
      return vals.reduce<number>((acc, v) => acc + parseNumber(v), 0);
    }

    if (tok.type === TokenType.FUNCTION) {
      this.consume();
      const fnName = tok.value;
      // If not followed by '(', treat as variable/named constant lookup
      if (this.peek().type !== TokenType.LPAREN) {
        if (this.ctx.variables && fnName in this.ctx.variables) return this.ctx.variables[fnName];
        return null;
      }
      this.expect(TokenType.LPAREN);
      // Special form: IFERROR evaluates first arg in a try/catch to catch runtime errors
      if (fnName === 'IFERROR') {
        let firstVal: CellValue;
        let firstError = false;
        try {
          firstVal = this.parseArgument();
        } catch {
          firstVal = null;
          firstError = true;
        }
        // Consume comma and second arg
        let fallback: CellValue = false;
        if (this.peek().type === TokenType.COMMA) {
          this.consume();
          fallback = this.parseArgument();
        }
        this.expect(TokenType.RPAREN);
        if (firstError) {
          // Resolve range fallback
          if (typeof fallback === 'string' && fallback.startsWith('__RANGE__')) {
            return expandRange(fallback.slice('__RANGE__'.length), this.ctx.cells)[0] ?? null;
          }
          return fallback;
        }
        // Resolve range in firstVal
        if (typeof firstVal === 'string' && firstVal.startsWith('__RANGE__')) {
          const vals = expandRange(firstVal.slice('__RANGE__'.length), this.ctx.cells);
          return vals[0] ?? null;
        }
        return firstVal;
      }
      const args = this.parseArgList();
      this.expect(TokenType.RPAREN);
      return this.callFunction(fnName, args);
    }

    if (tok.type === TokenType.LPAREN) {
      this.consume();
      const val = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return val;
    }

    throw new Error(`Unexpected token: ${tok.type} ('${tok.value}') at pos ${tok.pos}`);
  }

  private parseArgList(): CellValue[] {
    const args: CellValue[] = [];
    if (this.peek().type === TokenType.RPAREN) return args;
    args.push(this.parseArgument());
    while (this.peek().type === TokenType.COMMA) {
      this.consume();
      args.push(this.parseArgument());
    }
    return args;
  }

  /**
   * An argument can be a range reference (which stays as a raw range string
   * in a special wrapper) or a normal expression.
   * We handle ranges specially: if the next token is a RANGE_REF, pass it
   * as a special sentinel so functions like SUM can expand it.
   */
  private parseArgument(): CellValue {
    if (this.peek().type === TokenType.RANGE_REF) {
      const tok = this.consume();
      // Encode range as a special string marker that functions can detect
      return `__RANGE__${tok.value}`;
    }
    return this.parseExpression();
  }

  private callFunction(name: string, rawArgs: CellValue[]): CellValue {
    // Resolve ranges in arguments for most functions
    const resolveArgs = (args: CellValue[]): CellValue[] => {
      const result: CellValue[] = [];
      for (const arg of args) {
        if (typeof arg === 'string' && arg.startsWith('__RANGE__')) {
          const range = arg.slice('__RANGE__'.length);
          result.push(...expandRange(range, this.ctx.cells));
        } else {
          result.push(arg);
        }
      }
      return result;
    };

    // Check custom registry first
    const custom = functionRegistry.get(name);
    if (custom) {
      const resolved = resolveArgs(rawArgs);
      if (resolved.length < custom.minArgs) throw new Error(`${name}: too few arguments`);
      if (resolved.length > custom.maxArgs) throw new Error(`${name}: too many arguments`);
      return custom.fn(resolved, this.ctx);
    }

    // Built-ins
    switch (name) {
      case 'SUM': {
        const vals = resolveArgs(rawArgs);
        return vals.reduce<number>((acc, v) => acc + parseNumber(v), 0);
      }
      case 'AVERAGE': {
        const vals = resolveArgs(rawArgs).filter(v => v !== null && v !== '');
        if (vals.length === 0) throw new Error('#DIV/0!');
        return vals.reduce<number>((acc, v) => acc + parseNumber(v), 0) / vals.length;
      }
      case 'COUNT': {
        const vals = resolveArgs(rawArgs);
        return vals.filter(v => typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)))).length;
      }
      case 'MIN': {
        const vals = resolveArgs(rawArgs).filter(v => v !== null);
        if (vals.length === 0) return 0;
        return vals.reduce<number>((min, v) => Math.min(min, parseNumber(v)), Infinity);
      }
      case 'MAX': {
        const vals = resolveArgs(rawArgs).filter(v => v !== null);
        if (vals.length === 0) return 0;
        return vals.reduce<number>((max, v) => Math.max(max, parseNumber(v)), -Infinity);
      }
      case 'IF': {
        const condition = resolveArgs([rawArgs[0]])[0];
        const thenVal = rawArgs[1];
        const elseVal = rawArgs.length > 2 ? rawArgs[2] : false;
        const cond = parseBoolean(condition);
        const branch = cond ? thenVal : elseVal;
        // Resolve range in selected branch
        if (typeof branch === 'string' && branch.startsWith('__RANGE__')) {
          const range = branch.slice('__RANGE__'.length);
          const vals = expandRange(range, this.ctx.cells);
          return vals.length > 0 ? vals[0] : null;
        }
        return branch;
      }
      case 'AND': {
        const vals = resolveArgs(rawArgs);
        return vals.every(v => parseBoolean(v));
      }
      case 'OR': {
        const vals = resolveArgs(rawArgs);
        return vals.some(v => parseBoolean(v));
      }
      case 'NOT': {
        const vals = resolveArgs(rawArgs);
        return !parseBoolean(vals[0]);
      }
      case 'ROUND': {
        const vals = resolveArgs(rawArgs);
        const num = parseNumber(vals[0]);
        const digits = vals.length > 1 ? parseNumber(vals[1]) : 0;
        const factor = Math.pow(10, digits);
        return Math.round(num * factor) / factor;
      }
      case 'ABS': {
        const vals = resolveArgs(rawArgs);
        return Math.abs(parseNumber(vals[0]));
      }
      case 'SQRT': {
        const vals = resolveArgs(rawArgs);
        const n = parseNumber(vals[0]);
        if (n < 0) throw new Error('#NUM!');
        return Math.sqrt(n);
      }
      case 'POWER': {
        const vals = resolveArgs(rawArgs);
        return Math.pow(parseNumber(vals[0]), parseNumber(vals[1]));
      }
      case 'MOD': {
        const vals = resolveArgs(rawArgs);
        const divisor = parseNumber(vals[1]);
        if (divisor === 0) throw new Error('#DIV/0!');
        return parseNumber(vals[0]) % divisor;
      }
      case 'INT': {
        const vals = resolveArgs(rawArgs);
        return Math.floor(parseNumber(vals[0]));
      }
      case 'CEILING': {
        const vals = resolveArgs(rawArgs);
        const num = parseNumber(vals[0]);
        const sig = vals.length > 1 ? parseNumber(vals[1]) : 1;
        if (sig === 0) return 0;
        return Math.ceil(num / sig) * sig;
      }
      case 'FLOOR': {
        const vals = resolveArgs(rawArgs);
        const num = parseNumber(vals[0]);
        const sig = vals.length > 1 ? parseNumber(vals[1]) : 1;
        if (sig === 0) return 0;
        return Math.floor(num / sig) * sig;
      }
      case 'LEN': {
        const vals = resolveArgs(rawArgs);
        return String(vals[0] ?? '').length;
      }
      case 'UPPER': {
        const vals = resolveArgs(rawArgs);
        return String(vals[0] ?? '').toUpperCase();
      }
      case 'LOWER': {
        const vals = resolveArgs(rawArgs);
        return String(vals[0] ?? '').toLowerCase();
      }
      case 'TRIM': {
        const vals = resolveArgs(rawArgs);
        return String(vals[0] ?? '').trim().replace(/\s+/g, ' ');
      }
      case 'CONCAT': {
        const vals = resolveArgs(rawArgs);
        return vals.map(v => String(v ?? '')).join('');
      }
      case 'LEFT': {
        const vals = resolveArgs(rawArgs);
        const str = String(vals[0] ?? '');
        const n = vals.length > 1 ? Math.max(0, parseNumber(vals[1])) : 1;
        return str.slice(0, n);
      }
      case 'RIGHT': {
        const vals = resolveArgs(rawArgs);
        const str = String(vals[0] ?? '');
        const n = vals.length > 1 ? Math.max(0, parseNumber(vals[1])) : 1;
        return str.slice(Math.max(0, str.length - n));
      }
      case 'MID': {
        const vals = resolveArgs(rawArgs);
        const str = String(vals[0] ?? '');
        const start = Math.max(1, parseNumber(vals[1])) - 1;
        const numChars = Math.max(0, parseNumber(vals[2]));
        return str.slice(start, start + numChars);
      }
      case 'FIND': {
        const vals = resolveArgs(rawArgs);
        const needle = String(vals[0] ?? '');
        const haystack = String(vals[1] ?? '');
        const startAt = vals.length > 2 ? Math.max(1, parseNumber(vals[2])) - 1 : 0;
        const idx = haystack.indexOf(needle, startAt);
        if (idx === -1) throw new Error('#VALUE!');
        return idx + 1;
      }
      case 'ISNUMBER': {
        const vals = resolveArgs(rawArgs);
        return typeof vals[0] === 'number';
      }
      case 'ISTEXT': {
        const vals = resolveArgs(rawArgs);
        return typeof vals[0] === 'string';
      }
      case 'ISBLANK': {
        const vals = resolveArgs(rawArgs);
        return vals[0] === null || vals[0] === '';
      }
      case 'IFERROR': {
        // rawArgs[0] is the value expression (may throw), rawArgs[1] is the fallback
        try {
          const val = typeof rawArgs[0] === 'string' && rawArgs[0].startsWith('__RANGE__')
            ? expandRange(rawArgs[0].slice('__RANGE__'.length), this.ctx.cells)
            : rawArgs[0];
          if (val instanceof Array) return val[0] ?? null;
          return val as CellValue;
        } catch {
          const fallback = rawArgs[1];
          if (typeof fallback === 'string' && fallback.startsWith('__RANGE__')) {
            return expandRange(fallback.slice('__RANGE__'.length), this.ctx.cells)[0] ?? null;
          }
          return fallback as CellValue;
        }
      }
      case 'VLOOKUP': {
        // VLOOKUP(lookup_value, table_range, col_index, [approx_match])
        const lookupValue = resolveArgs([rawArgs[0]])[0];
        const approxMatch = rawArgs.length > 3 ? parseBoolean(resolveArgs([rawArgs[3]])[0]) : true;

        // Get table as 2D grid
        if (!(typeof rawArgs[1] === 'string' && rawArgs[1].startsWith('__RANGE__'))) {
          throw new Error('#VALUE!: VLOOKUP table_array must be a range');
        }
        const rangeName = rawArgs[1].slice('__RANGE__'.length);
        const rangeParts = rangeName.split(':');
        const startRef = cellRefToIndices(rangeParts[0]);
        const endRef = cellRefToIndices(rangeParts[1]);
        const colIndex = parseNumber(resolveArgs([rawArgs[2]])[0]);

        const minCol = Math.min(startRef.col, endRef.col);
        const maxCol = Math.max(startRef.col, endRef.col);
        const minRow = Math.min(startRef.row, endRef.row);
        const maxRow = Math.max(startRef.row, endRef.row);

        if (colIndex < 1 || colIndex > maxCol - minCol + 1) throw new Error('#REF!');

        // Build rows
        const rows: CellValue[][] = [];
        for (let r = minRow; r <= maxRow; r++) {
          const row: CellValue[] = [];
          for (let c = minCol; c <= maxCol; c++) {
            const key = indicesToCellRef(c, r);
            row.push(key in this.ctx.cells ? this.ctx.cells[key] : null);
          }
          rows.push(row);
        }

        if (approxMatch) {
          // Find largest first-column value <= lookupValue (sorted ascending assumed)
          let matchRow: CellValue[] | null = null;
          for (const row of rows) {
            const firstVal = row[0];
            if (parseNumber(firstVal) <= parseNumber(lookupValue)) {
              matchRow = row;
            } else {
              break;
            }
          }
          if (!matchRow) throw new Error('#N/A');
          return matchRow[colIndex - 1] ?? null;
        } else {
          // Exact match
          for (const row of rows) {
            if (row[0] === lookupValue) return row[colIndex - 1] ?? null;
          }
          throw new Error('#N/A');
        }
      }
      case 'INDEX': {
        // INDEX(range, row_num, [col_num])
        if (!(typeof rawArgs[0] === 'string' && rawArgs[0].startsWith('__RANGE__'))) {
          throw new Error('#VALUE!: INDEX array must be a range');
        }
        const rangeName = rawArgs[0].slice('__RANGE__'.length);
        const rangeParts = rangeName.split(':');
        const startRef = cellRefToIndices(rangeParts[0]);
        const endRef = cellRefToIndices(rangeParts[1]);
        const minCol = Math.min(startRef.col, endRef.col);
        const maxCol = Math.max(startRef.col, endRef.col);
        const minRow = Math.min(startRef.row, endRef.row);
        const maxRow = Math.max(startRef.row, endRef.row);

        const rowNum = parseNumber(resolveArgs([rawArgs[1]])[0]);
        const colNum = rawArgs.length > 2 ? parseNumber(resolveArgs([rawArgs[2]])[0]) : 1;

        const targetRow = minRow + rowNum - 1;
        const targetCol = minCol + colNum - 1;

        if (targetRow < minRow || targetRow > maxRow || targetCol < minCol || targetCol > maxCol) {
          throw new Error('#REF!');
        }
        const key = indicesToCellRef(targetCol, targetRow);
        return key in this.ctx.cells ? this.ctx.cells[key] : null;
      }
      case 'MATCH': {
        // MATCH(lookup_value, lookup_range, [match_type])
        const lookupValue = resolveArgs([rawArgs[0]])[0];
        let lookupArr: CellValue[];
        if (typeof rawArgs[1] === 'string' && rawArgs[1].startsWith('__RANGE__')) {
          lookupArr = expandRange(rawArgs[1].slice('__RANGE__'.length), this.ctx.cells);
        } else {
          lookupArr = resolveArgs([rawArgs[1]]);
        }
        const matchType = rawArgs.length > 2 ? parseNumber(resolveArgs([rawArgs[2]])[0]) : 1;

        if (matchType === 0) {
          // Exact match
          const idx = lookupArr.findIndex(v => v === lookupValue);
          if (idx === -1) throw new Error('#N/A');
          return idx + 1;
        } else if (matchType === 1) {
          // Largest value <= lookup_value (ascending sorted)
          let matchIdx = -1;
          for (let i = 0; i < lookupArr.length; i++) {
            if (parseNumber(lookupArr[i]) <= parseNumber(lookupValue)) matchIdx = i;
            else break;
          }
          if (matchIdx === -1) throw new Error('#N/A');
          return matchIdx + 1;
        } else {
          // Smallest value >= lookup_value (descending sorted)
          let matchIdx = -1;
          for (let i = 0; i < lookupArr.length; i++) {
            if (parseNumber(lookupArr[i]) >= parseNumber(lookupValue)) matchIdx = i;
            else break;
          }
          if (matchIdx === -1) throw new Error('#N/A');
          return matchIdx + 1;
        }
      }
      default:
        throw new Error(`#NAME?: Unknown function '${name}'`);
    }
  }
}

// ---------------------------------------------------------------------------
// Function Registry
// ---------------------------------------------------------------------------

const functionRegistry = new Map<string, FunctionDef>();

export function registerFunction(def: FunctionDef): void {
  functionRegistry.set(def.name.toUpperCase(), def);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const DEFAULT_CTX: FormulaContext = { cells: {} };

export function evaluate(formula: string, ctx: FormulaContext = DEFAULT_CTX): FormulaResult {
  try {
    const f = formula.trim();
    // Strip leading '=' if present (spreadsheet convention)
    const expr = f.startsWith('=') ? f.slice(1) : f;
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, ctx);
    const value = parser.parseExpression();
    // Ensure we consumed everything (besides EOF)
    return { value: value as number | string | boolean | null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { value: null, error: msg };
  }
}

export function evaluateCell(cellRef: string, cells: CellMap): FormulaResult {
  const key = cellRef.toUpperCase();
  const raw = cells[key];
  if (raw === null || raw === undefined) return { value: null };
  if (typeof raw !== 'string' || !raw.startsWith('=')) return { value: raw };
  return evaluate(raw, { cells });
}
