// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type Value = number | boolean | string;
export type Variables = Record<string, Value>;

// ─── Token types ─────────────────────────────────────────────────────────────

export type TokenType =
  | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'NULL'
  | 'IDENT'
  | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'PERCENT' | 'CARET'
  | 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE'
  | 'AND' | 'OR' | 'NOT'
  | 'LPAREN' | 'RPAREN'
  | 'COMMA'
  | 'QUESTION' | 'COLON'
  | 'EOF';

export interface Token { type: TokenType; value: string; pos: number }

// ─── Tokenizer ────────────────────────────────────────────────────────────────

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    // skip whitespace
    if (/\s/.test(expr[i])) { i++; continue; }

    const pos = i;
    const ch = expr[i];

    // numbers
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[i + 1] ?? ''))) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'NUMBER', value: num, pos });
      continue;
    }

    // strings
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = '';
      i++; // skip opening quote
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === '\\') { i++; str += expr[i] ?? ''; i++; }
        else { str += expr[i++]; }
      }
      i++; // skip closing quote
      tokens.push({ type: 'STRING', value: str, pos });
      continue;
    }

    // identifiers / keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_$]/.test(expr[i])) ident += expr[i++];
      if (ident === 'true' || ident === 'false') {
        tokens.push({ type: 'BOOLEAN', value: ident, pos });
      } else if (ident === 'null') {
        tokens.push({ type: 'NULL', value: ident, pos });
      } else if (ident === 'and' || ident === 'AND') {
        tokens.push({ type: 'AND', value: ident, pos });
      } else if (ident === 'or' || ident === 'OR') {
        tokens.push({ type: 'OR', value: ident, pos });
      } else if (ident === 'not' || ident === 'NOT') {
        tokens.push({ type: 'NOT', value: ident, pos });
      } else {
        tokens.push({ type: 'IDENT', value: ident, pos });
      }
      continue;
    }

    // two-char operators
    if (i + 1 < expr.length) {
      const two = expr[i] + expr[i + 1];
      if (two === '==') { tokens.push({ type: 'EQ', value: two, pos }); i += 2; continue; }
      if (two === '!=') { tokens.push({ type: 'NEQ', value: two, pos }); i += 2; continue; }
      if (two === '<=') { tokens.push({ type: 'LTE', value: two, pos }); i += 2; continue; }
      if (two === '>=') { tokens.push({ type: 'GTE', value: two, pos }); i += 2; continue; }
      if (two === '&&') { tokens.push({ type: 'AND', value: two, pos }); i += 2; continue; }
      if (two === '||') { tokens.push({ type: 'OR', value: two, pos }); i += 2; continue; }
    }

    // single-char operators
    switch (ch) {
      case '+': tokens.push({ type: 'PLUS', value: ch, pos }); break;
      case '-': tokens.push({ type: 'MINUS', value: ch, pos }); break;
      case '*': tokens.push({ type: 'STAR', value: ch, pos }); break;
      case '/': tokens.push({ type: 'SLASH', value: ch, pos }); break;
      case '%': tokens.push({ type: 'PERCENT', value: ch, pos }); break;
      case '^': tokens.push({ type: 'CARET', value: ch, pos }); break;
      case '<': tokens.push({ type: 'LT', value: ch, pos }); break;
      case '>': tokens.push({ type: 'GT', value: ch, pos }); break;
      case '!': tokens.push({ type: 'NOT', value: ch, pos }); break;
      case '(': tokens.push({ type: 'LPAREN', value: ch, pos }); break;
      case ')': tokens.push({ type: 'RPAREN', value: ch, pos }); break;
      case ',': tokens.push({ type: 'COMMA', value: ch, pos }); break;
      case '?': tokens.push({ type: 'QUESTION', value: ch, pos }); break;
      case ':': tokens.push({ type: 'COLON', value: ch, pos }); break;
      default: throw new Error(`Unexpected character '${ch}' at position ${pos}`);
    }
    i++;
  }

  tokens.push({ type: 'EOF', value: '', pos: i });
  return tokens;
}

// ─── AST nodes ────────────────────────────────────────────────────────────────

export type NodeType = 'literal' | 'variable' | 'binary' | 'unary' | 'call' | 'ternary';

export interface LiteralNode { type: 'literal'; value: Value }
export interface VariableNode { type: 'variable'; name: string }
export interface BinaryNode { type: 'binary'; op: string; left: ASTNode; right: ASTNode }
export interface UnaryNode { type: 'unary'; op: string; operand: ASTNode }
export interface CallNode { type: 'call'; name: string; args: ASTNode[] }
export interface TernaryNode { type: 'ternary'; condition: ASTNode; consequent: ASTNode; alternate: ASTNode }
export type ASTNode = LiteralNode | VariableNode | BinaryNode | UnaryNode | CallNode | TernaryNode;

// ─── Parser ───────────────────────────────────────────────────────────────────

class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token { return this.tokens[this.pos]; }

  private consume(): Token {
    const t = this.tokens[this.pos];
    this.pos++;
    return t;
  }

  private expect(type: TokenType): Token {
    const t = this.peek();
    if (t.type !== type) {
      throw new Error(`Expected ${type} but got ${t.type} ('${t.value}') at position ${t.pos}`);
    }
    return this.consume();
  }

  parse(): ASTNode {
    const node = this.parseTernary();
    if (this.peek().type !== 'EOF') {
      const t = this.peek();
      throw new Error(`Unexpected token '${t.value}' at position ${t.pos}`);
    }
    return node;
  }

  // Ternary: condition ? consequent : alternate
  private parseTernary(): ASTNode {
    const cond = this.parseOr();
    if (this.peek().type === 'QUESTION') {
      this.consume(); // ?
      const consequent = this.parseTernary();
      this.expect('COLON');
      const alternate = this.parseTernary();
      return { type: 'ternary', condition: cond, consequent, alternate };
    }
    return cond;
  }

  // Logical OR: expr || expr
  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.peek().type === 'OR') {
      const op = this.consume().value;
      const right = this.parseAnd();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Logical AND: expr && expr
  private parseAnd(): ASTNode {
    let left = this.parseEquality();
    while (this.peek().type === 'AND') {
      const op = this.consume().value;
      const right = this.parseEquality();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Equality: expr == expr | expr != expr
  private parseEquality(): ASTNode {
    let left = this.parseRelational();
    while (this.peek().type === 'EQ' || this.peek().type === 'NEQ') {
      const op = this.consume().value;
      const right = this.parseRelational();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Relational: expr < expr | expr <= expr | expr > expr | expr >= expr
  private parseRelational(): ASTNode {
    let left = this.parseAdditive();
    while (['LT', 'LTE', 'GT', 'GTE'].includes(this.peek().type)) {
      const op = this.consume().value;
      const right = this.parseAdditive();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Additive: expr + expr | expr - expr
  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Multiplicative: expr * expr | expr / expr | expr % expr
  private parseMultiplicative(): ASTNode {
    let left = this.parseExponentiation();
    while (['STAR', 'SLASH', 'PERCENT'].includes(this.peek().type)) {
      const op = this.consume().value;
      const right = this.parseExponentiation();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  // Exponentiation: expr ^ expr (right-associative)
  private parseExponentiation(): ASTNode {
    const base = this.parseUnary();
    if (this.peek().type === 'CARET') {
      const op = this.consume().value;
      const exp = this.parseExponentiation(); // right-associative
      return { type: 'binary', op, left: base, right: exp };
    }
    return base;
  }

  // Unary: - expr | ! expr
  private parseUnary(): ASTNode {
    if (this.peek().type === 'MINUS') {
      this.consume();
      const operand = this.parseUnary();
      return { type: 'unary', op: '-', operand };
    }
    if (this.peek().type === 'NOT') {
      this.consume();
      const operand = this.parseUnary();
      return { type: 'unary', op: '!', operand };
    }
    return this.parsePrimary();
  }

  // Primary: literal | ident | ident(...) | ( expr )
  private parsePrimary(): ASTNode {
    const t = this.peek();

    if (t.type === 'NUMBER') {
      this.consume();
      return { type: 'literal', value: parseFloat(t.value) };
    }

    if (t.type === 'STRING') {
      this.consume();
      return { type: 'literal', value: t.value };
    }

    if (t.type === 'BOOLEAN') {
      this.consume();
      return { type: 'literal', value: t.value === 'true' };
    }

    if (t.type === 'NULL') {
      this.consume();
      return { type: 'literal', value: 0 }; // null → 0 for simplicity
    }

    if (t.type === 'IDENT') {
      this.consume();
      // function call?
      if (this.peek().type === 'LPAREN') {
        this.consume(); // (
        const args: ASTNode[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseTernary());
          while (this.peek().type === 'COMMA') {
            this.consume();
            args.push(this.parseTernary());
          }
        }
        this.expect('RPAREN');
        return { type: 'call', name: t.value, args };
      }
      return { type: 'variable', name: t.value };
    }

    if (t.type === 'LPAREN') {
      this.consume();
      const expr = this.parseTernary();
      this.expect('RPAREN');
      return expr;
    }

    throw new Error(`Unexpected token '${t.value}' (${t.type}) at position ${t.pos}`);
  }
}

export function parse(expr: string): ASTNode {
  const tokens = tokenize(expr);
  const parser = new Parser(tokens);
  return parser.parse();
}

// ─── Built-in functions ───────────────────────────────────────────────────────

export interface BuiltinFunctions {
  abs(x: number): number;
  ceil(x: number): number;
  floor(x: number): number;
  round(x: number): number;
  sqrt(x: number): number;
  pow(x: number, y: number): number;
  min(...args: number[]): number;
  max(...args: number[]): number;
  log(x: number): number;
  log2(x: number): number;
  log10(x: number): number;
  sin(x: number): number;
  cos(x: number): number;
  tan(x: number): number;
  len(s: string | unknown[]): number;
  upper(s: string): string;
  lower(s: string): string;
  trim(s: string): string;
  concat(...args: string[]): string;
  str(x: Value): string;
  num(x: Value): number;
  bool(x: Value): boolean;
  contains(haystack: string, needle: string): boolean;
  startsWith(s: string, prefix: string): boolean;
  endsWith(s: string, suffix: string): boolean;
  if(condition: boolean, consequent: Value, alternate: Value): Value;
  coalesce(...args: Value[]): Value;
}

const BUILTINS: Record<string, (...args: Value[]) => Value> = {
  abs: (x) => Math.abs(x as number),
  ceil: (x) => Math.ceil(x as number),
  floor: (x) => Math.floor(x as number),
  round: (x) => Math.round(x as number),
  sqrt: (x) => Math.sqrt(x as number),
  pow: (x, y) => Math.pow(x as number, y as number),
  min: (...args) => Math.min(...(args as number[])),
  max: (...args) => Math.max(...(args as number[])),
  log: (x) => Math.log(x as number),
  log2: (x) => Math.log2(x as number),
  log10: (x) => Math.log10(x as number),
  sin: (x) => Math.sin(x as number),
  cos: (x) => Math.cos(x as number),
  tan: (x) => Math.tan(x as number),
  len: (s) => typeof s === 'string' ? s.length : (s as unknown[]).length,
  upper: (s) => (s as string).toUpperCase(),
  lower: (s) => (s as string).toLowerCase(),
  trim: (s) => (s as string).trim(),
  concat: (...args) => args.map(String).join(''),
  str: (x) => String(x),
  num: (x) => {
    if (typeof x === 'number') return x;
    if (typeof x === 'boolean') return x ? 1 : 0;
    const n = parseFloat(x as string);
    if (isNaN(n)) throw new Error(`Cannot convert '${x}' to number`);
    return n;
  },
  bool: (x) => {
    if (typeof x === 'boolean') return x;
    if (typeof x === 'number') return x !== 0;
    return (x as string).length > 0;
  },
  contains: (haystack, needle) => (haystack as string).includes(needle as string),
  startsWith: (s, prefix) => (s as string).startsWith(prefix as string),
  endsWith: (s, suffix) => (s as string).endsWith(suffix as string),
  if: (condition, consequent, alternate) => (condition as boolean) ? consequent : alternate,
  coalesce: (...args) => {
    for (const a of args) {
      if (a !== null && a !== undefined && a !== '') return a;
    }
    return args[args.length - 1] ?? '';
  },
};

// ─── Evaluator ────────────────────────────────────────────────────────────────

export interface EvalOptions {
  variables?: Variables;
  functions?: Partial<BuiltinFunctions> & Record<string, (...args: Value[]) => Value>;
  maxDepth?: number;
}

function evalNode(node: ASTNode, opts: EvalOptions, depth: number): Value {
  const maxDepth = opts.maxDepth ?? 100;
  if (depth > maxDepth) throw new Error(`Maximum recursion depth (${maxDepth}) exceeded`);

  switch (node.type) {
    case 'literal':
      return node.value;

    case 'variable': {
      const vars = opts.variables ?? {};
      if (Object.prototype.hasOwnProperty.call(vars, node.name)) {
        return vars[node.name];
      }
      throw new Error(`Undefined variable '${node.name}'`);
    }

    case 'unary': {
      const val = evalNode(node.operand, opts, depth + 1);
      if (node.op === '-') {
        if (typeof val !== 'number') throw new Error(`Unary '-' requires a number, got ${typeof val}`);
        return -val;
      }
      if (node.op === '!') return !val;
      throw new Error(`Unknown unary operator '${node.op}'`);
    }

    case 'binary': {
      const op = node.op;
      // Short-circuit logical
      if (op === '&&' || op === 'and' || op === 'AND') {
        const lv = evalNode(node.left, opts, depth + 1);
        if (!lv) return false;
        return !!evalNode(node.right, opts, depth + 1);
      }
      if (op === '||' || op === 'or' || op === 'OR') {
        const lv = evalNode(node.left, opts, depth + 1);
        if (lv) return true;
        return !!evalNode(node.right, opts, depth + 1);
      }

      const lv = evalNode(node.left, opts, depth + 1);
      const rv = evalNode(node.right, opts, depth + 1);

      switch (op) {
        case '+':
          if (typeof lv === 'string' || typeof rv === 'string') return String(lv) + String(rv);
          return (lv as number) + (rv as number);
        case '-': return (lv as number) - (rv as number);
        case '*': return (lv as number) * (rv as number);
        case '/':
          if ((rv as number) === 0) throw new Error('Division by zero');
          return (lv as number) / (rv as number);
        case '%': return (lv as number) % (rv as number);
        case '^': return Math.pow(lv as number, rv as number);
        case '==': return lv === rv;
        case '!=': return lv !== rv;
        case '<': return (lv as number) < (rv as number);
        case '<=': return (lv as number) <= (rv as number);
        case '>': return (lv as number) > (rv as number);
        case '>=': return (lv as number) >= (rv as number);
        default:
          throw new Error(`Unknown binary operator '${op}'`);
      }
    }

    case 'call': {
      const fnName = node.name;
      const userFns = opts.functions ?? {};
      const fn: ((...args: Value[]) => Value) | undefined =
        (userFns as Record<string, (...args: Value[]) => Value>)[fnName] ?? BUILTINS[fnName];
      if (!fn) throw new Error(`Unknown function '${fnName}'`);
      const args = node.args.map(a => evalNode(a, opts, depth + 1));
      return fn(...args);
    }

    case 'ternary': {
      const cond = evalNode(node.condition, opts, depth + 1);
      return cond ? evalNode(node.consequent, opts, depth + 1) : evalNode(node.alternate, opts, depth + 1);
    }
  }
}

export function evaluateAst(node: ASTNode, opts?: EvalOptions): Value {
  return evalNode(node, opts ?? {}, 0);
}

export function evaluate(expr: string, opts?: EvalOptions): Value {
  const ast = parse(expr);
  return evaluateAst(ast, opts);
}

// ─── Safe evaluate ────────────────────────────────────────────────────────────

export interface EvalResult { value?: Value; error?: string; success: boolean }

export function safeEvaluate(expr: string, opts?: EvalOptions): EvalResult {
  try {
    const value = evaluate(expr, opts);
    return { success: true, value };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Validate ─────────────────────────────────────────────────────────────────

export function validate(expr: string): { valid: boolean; error?: string } {
  try {
    parse(expr);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

// ─── Extract variables ────────────────────────────────────────────────────────

function collectVariables(node: ASTNode, fnNames: Set<string>, vars: Set<string>): void {
  switch (node.type) {
    case 'literal': break;
    case 'variable':
      if (!fnNames.has(node.name)) vars.add(node.name);
      break;
    case 'unary':
      collectVariables(node.operand, fnNames, vars);
      break;
    case 'binary':
      collectVariables(node.left, fnNames, vars);
      collectVariables(node.right, fnNames, vars);
      break;
    case 'call':
      fnNames.add(node.name);
      node.args.forEach(a => collectVariables(a, fnNames, vars));
      break;
    case 'ternary':
      collectVariables(node.condition, fnNames, vars);
      collectVariables(node.consequent, fnNames, vars);
      collectVariables(node.alternate, fnNames, vars);
      break;
  }
}

export function extractVariables(expr: string): string[] {
  const ast = parse(expr);
  const fnNames = new Set<string>(Object.keys(BUILTINS));
  const vars = new Set<string>();
  collectVariables(ast, fnNames, vars);
  return Array.from(vars);
}

// ─── Complexity ───────────────────────────────────────────────────────────────

function countNodes(node: ASTNode): number {
  switch (node.type) {
    case 'literal':
    case 'variable':
      return 1;
    case 'unary':
      return 1 + countNodes(node.operand);
    case 'binary':
      return 1 + countNodes(node.left) + countNodes(node.right);
    case 'call':
      return 1 + node.args.reduce((s, a) => s + countNodes(a), 0);
    case 'ternary':
      return 1 + countNodes(node.condition) + countNodes(node.consequent) + countNodes(node.alternate);
  }
}

export function complexity(expr: string): number {
  const ast = parse(expr);
  return countNodes(ast);
}

// ─── Stringify ────────────────────────────────────────────────────────────────

function needsParens(parent: string, child: ASTNode, side: 'left' | 'right'): boolean {
  if (child.type !== 'binary') return false;
  const prec: Record<string, number> = {
    '||': 1, 'or': 1, 'OR': 1,
    '&&': 2, 'and': 2, 'AND': 2,
    '==': 3, '!=': 3,
    '<': 4, '<=': 4, '>': 4, '>=': 4,
    '+': 5, '-': 5,
    '*': 6, '/': 6, '%': 6,
    '^': 7,
  };
  const pp = prec[parent] ?? 0;
  const cp = prec[child.op] ?? 0;
  if (cp < pp) return true;
  if (cp === pp && side === 'right' && parent !== '^') return true;
  return false;
}

export function stringify(node: ASTNode): string {
  switch (node.type) {
    case 'literal':
      if (typeof node.value === 'string') return `"${node.value}"`;
      return String(node.value);
    case 'variable':
      return node.name;
    case 'unary': {
      const inner = stringify(node.operand);
      const needP = node.operand.type === 'binary' || node.operand.type === 'ternary';
      return `${node.op}${needP ? '(' + inner + ')' : inner}`;
    }
    case 'binary': {
      const lStr = stringify(node.left);
      const rStr = stringify(node.right);
      const lNeedsP = needsParens(node.op, node.left, 'left');
      const rNeedsP = needsParens(node.op, node.right, 'right');
      const l = lNeedsP ? `(${lStr})` : lStr;
      const r = rNeedsP ? `(${rStr})` : rStr;
      return `${l} ${node.op} ${r}`;
    }
    case 'call':
      return `${node.name}(${node.args.map(stringify).join(', ')})`;
    case 'ternary':
      return `${stringify(node.condition)} ? ${stringify(node.consequent)} : ${stringify(node.alternate)}`;
  }
}
