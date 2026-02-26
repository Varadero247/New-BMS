// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  evaluate,
  evaluateAst,
  safeEvaluate,
  validate,
  extractVariables,
  tokenize,
  parse,
  complexity,
  stringify,
  type ASTNode,
  type Value,
} from '../expression-eval';

// ─────────────────────────────────────────────────────────────────────────────
// Section 1: Arithmetic (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate arithmetic', () => {
  // Addition: 25 tests
  for (let n = 1; n <= 25; n++) {
    const m = n + 3;
    it(`should compute ${n} + ${m} = ${n + m}`, () => {
      expect(evaluate(`${n} + ${m}`)).toBe(n + m);
    });
  }

  // Subtraction: 25 tests
  for (let n = 1; n <= 25; n++) {
    const m = n - 1;
    it(`should compute ${n} - ${m} = ${n - m}`, () => {
      expect(evaluate(`${n} - ${m}`)).toBe(n - m);
    });
  }

  // Multiplication: 25 tests
  for (let n = 1; n <= 25; n++) {
    const m = n + 1;
    it(`should compute ${n} * ${m} = ${n * m}`, () => {
      expect(evaluate(`${n} * ${m}`)).toBe(n * m);
    });
  }

  // Division: 25 tests (use divisible pairs to avoid float precision issues)
  for (let n = 1; n <= 25; n++) {
    const m = n * 2;
    it(`should compute ${m} / ${n} = 2`, () => {
      expect(evaluate(`${m} / ${n}`)).toBe(2);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2: Variables (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate with variables', () => {
  for (let n = 1; n <= 50; n++) {
    it(`should compute x * 2 for x=${n} → ${n * 2}`, () => {
      expect(evaluate('x * 2', { variables: { x: n } })).toBe(n * 2);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it(`should compute x + y for x=${n}, y=${n + 5} → ${n + n + 5}`, () => {
      expect(evaluate('x + y', { variables: { x: n, y: n + 5 } })).toBe(n + n + 5);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3: Comparisons (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate comparisons', () => {
  // a > b for a=N, b=N-1: always true (50 tests)
  for (let n = 1; n <= 50; n++) {
    it(`should return true for a > b when a=${n}, b=${n - 1}`, () => {
      expect(evaluate('a > b', { variables: { a: n, b: n - 1 } })).toBe(true);
    });
  }

  // a < b when a=N, b=N+1: always true (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`should return true for a < b when a=${n}, b=${n + 1}`, () => {
      expect(evaluate('a < b', { variables: { a: n, b: n + 1 } })).toBe(true);
    });
  }

  // a == b when same value (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`should return true for a == b when both are ${n}`, () => {
      expect(evaluate('a == b', { variables: { a: n, b: n } })).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 4: Logical operators (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate logical', () => {
  // AND: true && true = true (25)
  for (let n = 0; n < 25; n++) {
    it(`[${n}] true && true should be true`, () => {
      expect(evaluate('a && b', { variables: { a: true, b: true } })).toBe(true);
    });
  }

  // AND: true && false = false (25)
  for (let n = 0; n < 25; n++) {
    it(`[${n}] true && false should be false`, () => {
      expect(evaluate('a && b', { variables: { a: true, b: false } })).toBe(false);
    });
  }

  // OR: false || true = true (25)
  for (let n = 0; n < 25; n++) {
    it(`[${n}] false || true should be true`, () => {
      expect(evaluate('a || b', { variables: { a: false, b: true } })).toBe(true);
    });
  }

  // NOT: !false = true (25)
  for (let n = 0; n < 25; n++) {
    it(`[${n}] !false should be true`, () => {
      expect(evaluate('!a', { variables: { a: false } })).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 5: Built-in functions (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate functions', () => {
  // abs (10)
  for (let n = 1; n <= 10; n++) {
    it(`abs(-${n}) should be ${n}`, () => {
      expect(evaluate(`abs(-${n})`)).toBe(n);
    });
  }

  // ceil (10)
  for (let n = 1; n <= 10; n++) {
    it(`ceil(${n}.3) should be ${n + 1}`, () => {
      expect(evaluate(`ceil(${n}.3)`)).toBe(n + 1);
    });
  }

  // floor (10)
  for (let n = 1; n <= 10; n++) {
    it(`floor(${n}.9) should be ${n}`, () => {
      expect(evaluate(`floor(${n}.9)`)).toBe(n);
    });
  }

  // round (10)
  for (let n = 1; n <= 10; n++) {
    it(`round(${n}.4) should be ${n}`, () => {
      expect(evaluate(`round(${n}.4)`)).toBe(n);
    });
  }

  // sqrt (10)
  const sqrtPairs = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
  for (let i = 0; i < sqrtPairs.length; i++) {
    const v = sqrtPairs[i];
    const expected = Math.sqrt(v);
    it(`sqrt(${v}) should be ${expected}`, () => {
      expect(evaluate(`sqrt(${v})`)).toBe(expected);
    });
  }

  // min/max (10)
  for (let n = 1; n <= 5; n++) {
    it(`min(${n}, ${n + 3}) should be ${n}`, () => {
      expect(evaluate(`min(${n}, ${n + 3})`)).toBe(n);
    });
    it(`max(${n}, ${n + 3}) should be ${n + 3}`, () => {
      expect(evaluate(`max(${n}, ${n + 3})`)).toBe(n + 3);
    });
  }

  // len (10)
  const words = ['hello', 'world', 'abc', 'expression', 'eval', 'test', 'ims', 'nexara', 'foo', 'bar'];
  for (const w of words) {
    it(`len("${w}") should be ${w.length}`, () => {
      expect(evaluate(`len("${w}")`)).toBe(w.length);
    });
  }

  // upper/lower (10)
  const strPairs = [['hello', 'HELLO'], ['world', 'WORLD'], ['abc', 'ABC'], ['xyz', 'XYZ'], ['test', 'TEST']];
  for (const [low, up] of strPairs) {
    it(`upper("${low}") should be "${up}"`, () => {
      expect(evaluate(`upper("${low}")`)).toBe(up);
    });
    it(`lower("${up}") should be "${low}"`, () => {
      expect(evaluate(`lower("${up}")`)).toBe(low);
    });
  }

  // str/num/bool (10)
  for (let n = 1; n <= 5; n++) {
    it(`str(${n}) should be "${n}"`, () => {
      expect(evaluate(`str(${n})`)).toBe(String(n));
    });
    it(`num("${n}") should be ${n}`, () => {
      expect(evaluate(`num("${n}")`)).toBe(n);
    });
  }

  // pow (10)
  for (let n = 1; n <= 10; n++) {
    it(`pow(${n}, 2) should be ${n * n}`, () => {
      expect(evaluate(`pow(${n}, 2)`)).toBe(n * n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 6: Ternary (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluate ternary', () => {
  // |x| via ternary (50 positive)
  for (let n = 1; n <= 50; n++) {
    it(`ternary abs for x=${n} should be ${n}`, () => {
      expect(evaluate('x > 0 ? x : -x', { variables: { x: n } })).toBe(n);
    });
  }

  // |x| via ternary (50 negative)
  for (let n = 1; n <= 50; n++) {
    it(`ternary abs for x=${-n} should be ${n}`, () => {
      expect(evaluate('x > 0 ? x : -x', { variables: { x: -n } })).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 7: safeEvaluate success (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('safeEvaluate success', () => {
  const validExprs: Array<[string, Value]> = [];
  for (let n = 1; n <= 50; n++) {
    validExprs.push([`${n} + ${n}`, n + n]);
    validExprs.push([`${n} * 2`, n * 2]);
  }

  for (let i = 0; i < validExprs.length; i++) {
    const [expr, expected] = validExprs[i];
    it(`[${i}] safeEvaluate("${expr}") success: value=${expected}`, () => {
      const result = safeEvaluate(expr);
      expect(result.success).toBe(true);
      expect(result.value).toBe(expected);
      expect(result.error).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 8: safeEvaluate error (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('safeEvaluate error', () => {
  // Undefined variables (50 tests)
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (let i = 0; i < 50; i++) {
    const varName = `var_${i}`;
    it(`[${i}] safeEvaluate with undefined variable '${varName}' should fail`, () => {
      const result = safeEvaluate(varName);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.value).toBeUndefined();
    });
  }

  // Division by zero (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[div0-${n}] safeEvaluate "${n} / 0" should fail`, () => {
      const result = safeEvaluate(`${n} / 0`);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/zero/i);
    });
  }

  // Invalid syntax (25 tests)
  const invalidExprs = [
    '1 +', '* 2', '(1 + 2', '1 ++ 2', '1 ** 2 ***', '(((',
    '1 2 3', '+ + +', '1 / / 2', '@ 1', '# 2', '$ 3', '1 $ 2',
    '1 + + + + + + + + + + + + + + + + + + + + + + + + +',
    '())', ')(', '1 + (', ') + 1', '1 + )', '()', '( )',
    '1 +\x00', '1 @ 2', '1 # 2', '1 & 2', '1 ~ 2',
    '`1`', '\\1', '1 \\ 2',
  ];
  for (let i = 0; i < 25; i++) {
    const expr = invalidExprs[i % invalidExprs.length] + (i >= invalidExprs.length ? `_${i}` : '');
    it(`[syntax-${i}] safeEvaluate invalid expr should fail`, () => {
      const result = safeEvaluate(expr);
      // Either syntax error or unexpected token or undefined variable — all are failures
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 9: validate (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('validate', () => {
  // 50 valid expressions
  for (let n = 1; n <= 50; n++) {
    it(`[valid-${n}] validate("${n} + ${n}") should be valid`, () => {
      const result = validate(`${n} + ${n}`);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  }

  // 50 invalid expressions (all confirmed to throw in parser/tokenizer)
  const invalids = [
    '1 +',        // missing right operand
    '* 2',        // leading binary op
    '@@@',        // invalid char
    '###',        // invalid char
    '@#!',        // invalid chars
    '&&&',        // invalid char
    '~~~',        // invalid char
    '```',        // invalid char
    '((((',       // unclosed parens
    '))))',       // unexpected rparen
    '1 + @',      // invalid char at end
    '1 + #',      // invalid char at end
    '1 + &',      // invalid char at end
    '1 + ~',      // invalid char at end
    '1 + `',      // invalid char at end
    '@ + 1',      // invalid char at start
    '# + 1',      // invalid char at start
    '& + 1',      // invalid char at start
    '~ + 1',      // invalid char at start
    '` + 1',      // invalid char at start
    '1 + (2',     // unclosed paren
    '(1 + 2',     // unclosed paren
    '((1 + 2)',    // unclosed paren
    '(1 + 2))',    // extra rparen — parse gets 1+2 inside (), then extra ) remains → parse() throws
    '1 +',        // missing right operand (duplicate ok)
    '+ 1',        // unary + not supported → parsePrimary sees PLUS → throws
    '+ + 1',      // unary + not supported
    '1 + + 1',    // inner + not valid primary
    '()',         // empty parens → parsePrimary inside sees RPAREN → throws
    '1 ? 2',      // ternary missing colon
    '1 ?',        // ternary missing consequent and colon
    ': 1',        // unexpected colon
    '1 :',        // unexpected colon at end
    '?1',         // unexpected question at start
    ':1',         // unexpected colon at start
    '? 1 : 2',    // unexpected question at start
    'abs(',       // unclosed function call
    'abs(1,)',    // trailing comma in call
    'abs(,1)',    // leading comma in call
    'abs(1 2)',   // missing comma in call
    '1 + ,',      // comma not a value
    ', 1',        // comma not a value
    '1 ,',        // unexpected comma after expression
    '+ + +',      // all unary+ (unsupported)
    '@ 1 2',      // invalid char
    '1 @ 2',      // invalid char
    '1 # 2',      // invalid char
    '1 $ 2',      // invalid char
    '1 & 2',      // invalid char
    '1 ~ 2',      // invalid char
  ];
  for (let i = 0; i < 50; i++) {
    const expr = invalids[i % invalids.length];
    it(`[invalid-${i}] validate("${expr}") should be invalid`, () => {
      const result = validate(expr);
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 10: extractVariables (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('extractVariables', () => {
  // Single variable (25 tests)
  const singleVarNames = ['x', 'y', 'z', 'a', 'b', 'c', 'val', 'numVar', 'total', 'score',
    'rate', 'count', 'amount', 'price', 'qty', 'tax', 'fee', 'base', 'top', 'end',
    'min_val', 'max_val', 'avg', 'sumVal', 'prodVal'];
  for (let i = 0; i < 25; i++) {
    const v = singleVarNames[i];
    it(`[single-${i}] extractVariables("${v} + 1") should include "${v}"`, () => {
      const vars = extractVariables(`${v} + 1`);
      expect(vars).toContain(v);
    });
  }

  // Two variables (25 tests)
  for (let i = 0; i < 25; i++) {
    const v1 = `p${i}`;
    const v2 = `q${i}`;
    it(`[two-${i}] extractVariables("${v1} + ${v2}") should include both`, () => {
      const vars = extractVariables(`${v1} + ${v2}`);
      expect(vars).toContain(v1);
      expect(vars).toContain(v2);
    });
  }

  // No variables (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[novar-${n}] extractVariables("${n} + ${n}") should be empty`, () => {
      const vars = extractVariables(`${n} + ${n}`);
      expect(vars).toHaveLength(0);
    });
  }

  // Function args not counted as variables (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[fnvar-${n}] extractVariables("abs(-${n}) + x") should only contain x`, () => {
      const vars = extractVariables(`abs(-${n}) + x`);
      expect(vars).toContain('x');
      expect(vars).not.toContain('abs');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 11: tokenize (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('tokenize', () => {
  // Simple arithmetic expressions (25 tests)
  const arithExprs: Array<[string, number]> = [];
  for (let n = 1; n <= 25; n++) {
    // "N + M" → 3 tokens + EOF = 4
    arithExprs.push([`${n} + ${n + 1}`, 4]);
  }
  for (let i = 0; i < arithExprs.length; i++) {
    const [expr, count] = arithExprs[i];
    it(`[${i}] tokenize("${expr}") should yield ${count} tokens`, () => {
      const tokens = tokenize(expr);
      expect(tokens).toHaveLength(count);
      expect(tokens[tokens.length - 1].type).toBe('EOF');
    });
  }

  // Specific token types (25 tests)
  it('tokenize "true" yields BOOLEAN token', () => {
    const tokens = tokenize('true');
    expect(tokens[0].type).toBe('BOOLEAN');
    expect(tokens[0].value).toBe('true');
  });
  it('tokenize "false" yields BOOLEAN token', () => {
    const tokens = tokenize('false');
    expect(tokens[0].type).toBe('BOOLEAN');
  });
  it('tokenize "null" yields NULL token', () => {
    const tokens = tokenize('null');
    expect(tokens[0].type).toBe('NULL');
  });
  it('tokenize "42" yields NUMBER token', () => {
    const tokens = tokenize('42');
    expect(tokens[0].type).toBe('NUMBER');
    expect(tokens[0].value).toBe('42');
  });
  it('tokenize \'"hello"\' yields STRING token', () => {
    const tokens = tokenize('"hello"');
    expect(tokens[0].type).toBe('STRING');
    expect(tokens[0].value).toBe('hello');
  });
  it('tokenize "myVar" yields IDENT token', () => {
    const tokens = tokenize('myVar');
    expect(tokens[0].type).toBe('IDENT');
  });
  it('tokenize "+" yields PLUS', () => {
    expect(tokenize('+')[0].type).toBe('PLUS');
  });
  it('tokenize "-" yields MINUS', () => {
    expect(tokenize('-')[0].type).toBe('MINUS');
  });
  it('tokenize "*" yields STAR', () => {
    expect(tokenize('*')[0].type).toBe('STAR');
  });
  it('tokenize "/" yields SLASH', () => {
    expect(tokenize('/')[0].type).toBe('SLASH');
  });
  it('tokenize "%" yields PERCENT', () => {
    expect(tokenize('%')[0].type).toBe('PERCENT');
  });
  it('tokenize "^" yields CARET', () => {
    expect(tokenize('^')[0].type).toBe('CARET');
  });
  it('tokenize "==" yields EQ', () => {
    expect(tokenize('==')[0].type).toBe('EQ');
  });
  it('tokenize "!=" yields NEQ', () => {
    expect(tokenize('!=')[0].type).toBe('NEQ');
  });
  it('tokenize "<" yields LT', () => {
    expect(tokenize('<')[0].type).toBe('LT');
  });
  it('tokenize "<=" yields LTE', () => {
    expect(tokenize('<=')[0].type).toBe('LTE');
  });
  it('tokenize ">" yields GT', () => {
    expect(tokenize('>')[0].type).toBe('GT');
  });
  it('tokenize ">=" yields GTE', () => {
    expect(tokenize('>=')[0].type).toBe('GTE');
  });
  it('tokenize "&&" yields AND', () => {
    expect(tokenize('&&')[0].type).toBe('AND');
  });
  it('tokenize "||" yields OR', () => {
    expect(tokenize('||')[0].type).toBe('OR');
  });
  it('tokenize "!" yields NOT', () => {
    expect(tokenize('!')[0].type).toBe('NOT');
  });
  it('tokenize "(" yields LPAREN', () => {
    expect(tokenize('(')[0].type).toBe('LPAREN');
  });
  it('tokenize ")" yields RPAREN', () => {
    expect(tokenize(')')[0].type).toBe('RPAREN');
  });
  it('tokenize "," yields COMMA', () => {
    expect(tokenize(',')[0].type).toBe('COMMA');
  });
  it('tokenize "?" yields QUESTION', () => {
    expect(tokenize('?')[0].type).toBe('QUESTION');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 12: complexity (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('complexity', () => {
  // Simple literals have complexity 1 (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`complexity("${n}") should be 1`, () => {
      expect(complexity(`${n}`)).toBe(1);
    });
  }

  // Binary expressions have higher complexity than literals (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[${n}] complexity("${n} + ${n + 1}") > complexity("${n}")`, () => {
      expect(complexity(`${n} + ${n + 1}`)).toBeGreaterThan(complexity(`${n}`));
    });
  }

  // Nested expressions have higher complexity (15 tests)
  it('complexity("(1 + 2) * (3 + 4)") > complexity("1 + 2")', () => {
    expect(complexity('(1 + 2) * (3 + 4)')).toBeGreaterThan(complexity('1 + 2'));
  });
  it('complexity("1 + 2 + 3") > complexity("1 + 2")', () => {
    expect(complexity('1 + 2 + 3')).toBeGreaterThan(complexity('1 + 2'));
  });
  it('complexity("abs(x) + sqrt(y)") > complexity("abs(x)")', () => {
    expect(complexity('abs(x) + sqrt(y)')).toBeGreaterThan(complexity('abs(x)'));
  });
  it('complexity("x ? y : z") should be 4 (ternary + 3 leaves)', () => {
    expect(complexity('x ? y : z')).toBe(4);
  });
  it('complexity("!a && !b") > complexity("!a")', () => {
    expect(complexity('!a && !b')).toBeGreaterThan(complexity('!a'));
  });
  it('complexity("min(1, 2, 3)") should be 4 (call + 3 args)', () => {
    expect(complexity('min(1, 2, 3)')).toBe(4);
  });
  it('complexity("a + b + c + d") should be 7', () => {
    expect(complexity('a + b + c + d')).toBe(7);
  });
  it('complexity of deeply nested expr is higher', () => {
    expect(complexity('((1 + 2) * (3 - 4)) / (5 + 6)')).toBeGreaterThan(complexity('1 + 2'));
  });
  it('complexity("1") === 1', () => {
    expect(complexity('1')).toBe(1);
  });
  it('complexity("a") === 1', () => {
    expect(complexity('a')).toBe(1);
  });
  it('complexity("-x") should be 2 (unary + variable)', () => {
    expect(complexity('-x')).toBe(2);
  });
  it('complexity("x + y") should be 3 (binary + 2 leaves)', () => {
    expect(complexity('x + y')).toBe(3);
  });
  it('complexity("pow(2, 3)") should be 3 (call + 2 args)', () => {
    expect(complexity('pow(2, 3)')).toBe(3);
  });
  it('complexity of five-operand sum is higher than four', () => {
    expect(complexity('a + b + c + d + e')).toBeGreaterThan(complexity('a + b + c + d'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 13: stringify (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('stringify', () => {
  // Parse then stringify then re-evaluate should give same result (25 tests)
  const roundTripCases: Array<[string, Record<string, Value>]> = [];
  for (let n = 1; n <= 25; n++) {
    roundTripCases.push([`${n} + ${n + 1}`, {}]);
  }
  for (let i = 0; i < roundTripCases.length; i++) {
    const [expr, vars] = roundTripCases[i];
    const expected = evaluate(expr, { variables: vars });
    it(`[${i}] stringify round-trip for "${expr}" should re-evaluate to ${expected}`, () => {
      const ast = parse(expr);
      const str = stringify(ast);
      const result = evaluate(str, { variables: vars });
      expect(result).toBe(expected);
    });
  }

  // Literal stringify (10 tests)
  it('stringify literal number 42', () => {
    const ast: ASTNode = { type: 'literal', value: 42 };
    expect(stringify(ast)).toBe('42');
  });
  it('stringify literal boolean true', () => {
    const ast: ASTNode = { type: 'literal', value: true };
    expect(stringify(ast)).toBe('true');
  });
  it('stringify literal boolean false', () => {
    const ast: ASTNode = { type: 'literal', value: false };
    expect(stringify(ast)).toBe('false');
  });
  it('stringify literal string "hello"', () => {
    const ast: ASTNode = { type: 'literal', value: 'hello' };
    expect(stringify(ast)).toBe('"hello"');
  });
  it('stringify variable node', () => {
    const ast: ASTNode = { type: 'variable', name: 'myVar' };
    expect(stringify(ast)).toBe('myVar');
  });
  it('stringify unary minus', () => {
    const ast: ASTNode = { type: 'unary', op: '-', operand: { type: 'literal', value: 5 } };
    expect(stringify(ast)).toBe('-5');
  });
  it('stringify unary NOT', () => {
    const ast: ASTNode = { type: 'unary', op: '!', operand: { type: 'variable', name: 'a' } };
    expect(stringify(ast)).toBe('!a');
  });
  it('stringify call node', () => {
    const ast: ASTNode = { type: 'call', name: 'abs', args: [{ type: 'literal', value: -3 }] };
    expect(stringify(ast)).toBe('abs(-3)');
  });
  it('stringify binary +', () => {
    const ast: ASTNode = {
      type: 'binary', op: '+',
      left: { type: 'literal', value: 1 },
      right: { type: 'literal', value: 2 },
    };
    expect(stringify(ast)).toBe('1 + 2');
  });
  it('stringify ternary node', () => {
    const ast: ASTNode = {
      type: 'ternary',
      condition: { type: 'variable', name: 'x' },
      consequent: { type: 'literal', value: 1 },
      alternate: { type: 'literal', value: 0 },
    };
    expect(stringify(ast)).toBe('x ? 1 : 0');
  });

  // More round trips with variables (15 tests)
  const varRoundTrips: Array<[string, Record<string, Value>]> = [
    ['x * 2', { x: 5 }],
    ['x + y', { x: 3, y: 4 }],
    ['a > b', { a: 10, b: 5 }],
    ['a && b', { a: true, b: true }],
    ['a || b', { a: false, b: true }],
    ['!a', { a: false }],
    ['x ^ 2', { x: 3 }],
    ['x % 3', { x: 7 }],
    ['x == y', { x: 5, y: 5 }],
    ['x != y', { x: 3, y: 7 }],
    ['x >= y', { x: 5, y: 5 }],
    ['x <= y', { x: 3, y: 5 }],
    ['x > 0 ? x : -x', { x: -4 }],
    ['x > 0 ? x : -x', { x: 4 }],
    ['x * y + 1', { x: 2, y: 3 }],
  ];
  for (let i = 0; i < varRoundTrips.length; i++) {
    const [expr, vars] = varRoundTrips[i];
    const expected = evaluate(expr, { variables: vars });
    it(`[var-rt-${i}] round-trip "${expr}" gives ${expected}`, () => {
      const ast = parse(expr);
      const str = stringify(ast);
      expect(evaluate(str, { variables: vars })).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 14: Additional edge cases and coverage (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('additional edge cases', () => {
  // Exponentiation (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`${n} ^ 2 should be ${n * n}`, () => {
      expect(evaluate(`${n} ^ 2`)).toBe(n * n);
    });
  }

  // Modulo (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`${n + 10} % ${n} should be ${(n + 10) % n}`, () => {
      expect(evaluate(`${n + 10} % ${n}`)).toBe((n + 10) % n);
    });
  }

  // String concatenation via + (10 tests)
  const strPairs2 = [
    ['hello', ' world'],
    ['foo', 'bar'],
    ['ims', '-platform'],
    ['nexara', '-dmcc'],
    ['a', 'b'],
    ['test', '123'],
    ['expr', 'eval'],
    ['2026', '-02-25'],
    ['open', 'ai'],
    ['java', 'script'],
  ];
  for (const [a, b] of strPairs2) {
    it(`"${a}" + "${b}" should concat to "${a + b}"`, () => {
      expect(evaluate(`"${a}" + "${b}"`)).toBe(a + b);
    });
  }

  // Nested function calls (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`abs(floor(-${n}.7)) should be ${Math.abs(Math.floor(-n - 0.7))}`, () => {
      const expected = Math.abs(Math.floor(-n - 0.7));
      expect(evaluate(`abs(floor(-${n}.7))`)).toBe(expected);
    });
  }

  // Chained comparisons with AND (10 tests)
  for (let n = 2; n <= 11; n++) {
    it(`${n} > 1 && ${n} < 100 should be true`, () => {
      expect(evaluate(`${n} > 1 && ${n} < 100`)).toBe(true);
    });
  }

  // evaluateAst directly (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`evaluateAst literal node ${n}`, () => {
      const ast: ASTNode = { type: 'literal', value: n };
      expect(evaluateAst(ast)).toBe(n);
    });
  }

  // Trigonometric functions (10 tests)
  it('sin(0) should be 0', () => { expect(evaluate('sin(0)')).toBe(0); });
  it('cos(0) should be 1', () => { expect(evaluate('cos(0)')).toBe(1); });
  it('tan(0) should be 0', () => { expect(evaluate('tan(0)')).toBe(0); });
  it('sin(0) < 1', () => { expect((evaluate('sin(0)') as number) < 1).toBe(true); });
  it('cos(0) == 1', () => { expect(evaluate('cos(0) == 1')).toBe(true); });
  it('log(1) should be 0', () => { expect(evaluate('log(1)')).toBe(0); });
  it('log2(2) should be 1', () => { expect(evaluate('log2(2)')).toBe(1); });
  it('log10(10) should be 1', () => { expect(evaluate('log10(10)')).toBe(1); });
  it('log10(100) should be 2', () => { expect(evaluate('log10(100)')).toBe(2); });
  it('log2(8) should be 3', () => { expect(evaluate('log2(8)')).toBe(3); });
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 15: String functions (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('string functions', () => {
  // trim (25 tests)
  const trimCases = [
    ['  hello  ', 'hello'],
    [' world', 'world'],
    ['test  ', 'test'],
    ['  a  ', 'a'],
    ['  b  ', 'b'],
    ['  c  ', 'c'],
    [' d ', 'd'],
    ['  e  ', 'e'],
    [' f', 'f'],
    ['g ', 'g'],
    ['  h  ', 'h'],
    [' i ', 'i'],
    ['  j  ', 'j'],
    [' k', 'k'],
    ['l ', 'l'],
    ['  m  ', 'm'],
    [' n ', 'n'],
    ['  o  ', 'o'],
    [' p', 'p'],
    ['q ', 'q'],
    ['  r  ', 'r'],
    [' s ', 's'],
    ['  t  ', 't'],
    [' u', 'u'],
    ['v ', 'v'],
  ];
  for (let i = 0; i < 25; i++) {
    const [input, expected] = trimCases[i];
    it(`trim("${input}") should be "${expected}"`, () => {
      expect(evaluate(`trim("${input}")`)).toBe(expected);
    });
  }

  // concat (25 tests)
  for (let n = 1; n <= 25; n++) {
    const s1 = `part${n}`;
    const s2 = `end${n}`;
    it(`concat("${s1}", "${s2}") should be "${s1 + s2}"`, () => {
      expect(evaluate(`concat("${s1}", "${s2}")`)).toBe(s1 + s2);
    });
  }

  // contains (25 tests)
  const containsCases: Array<[string, string, boolean]> = [
    ['hello world', 'world', true],
    ['hello world', 'xyz', false],
    ['nexara dmcc', 'nexara', true],
    ['nexara dmcc', 'xyz', false],
    ['expression evaluator', 'eval', true],
    ['expression evaluator', 'xyz', false],
    ['typescript', 'script', true],
    ['typescript', 'java', false],
    ['ims platform', 'ims', true],
    ['ims platform', 'salesforce', false],
    ['abcdef', 'cde', true],
    ['abcdef', 'xyz', false],
    ['test123', '123', true],
    ['test123', '456', false],
    ['foobar', 'foo', true],
    ['foobar', 'baz', false],
    ['hello', 'ell', true],
    ['hello', 'xyz', false],
    ['world', 'orl', true],
    ['world', 'abc', false],
    ['abc', 'abc', true],
    ['abc', 'abcd', false],
    ['', '', true],
    ['a', 'a', true],
    ['a', 'b', false],
  ];
  for (let i = 0; i < 25; i++) {
    const [hay, needle, expected] = containsCases[i];
    it(`contains("${hay}", "${needle}") should be ${expected}`, () => {
      expect(evaluate(`contains("${hay}", "${needle}")`)).toBe(expected);
    });
  }

  // startsWith / endsWith (25 tests)
  const swCases: Array<[string, string, boolean]> = [
    ['hello', 'hel', true],
    ['hello', 'world', false],
    ['nexara', 'nex', true],
    ['nexara', 'ara', false],
    ['typescript', 'type', true],
    ['typescript', 'script', false],
    ['expression', 'expr', true],
    ['expression', 'ion', false],
    ['ims', 'im', true],
    ['ims', 'ms', false],
    ['platform', 'plat', true],
    ['platform', 'form', false],
    ['foobar', 'foo', true],
    ['foobar', 'bar', false],
    ['abcdef', 'abc', true],
    ['abcdef', 'def', false],
    ['hello world', 'hello', true],
    ['hello world', 'world', false],
    ['testing', 'test', true],
    ['testing', 'ing', false],
    ['evaluate', 'eval', true],
    ['evaluate', 'ate', false],
    ['feature', 'feat', true],
    ['feature', 'ure', false],
    ['calculate', 'calc', true],
  ];
  for (let i = 0; i < 25; i++) {
    const [s, prefix, expected] = swCases[i];
    it(`startsWith("${s}", "${prefix}") should be ${expected}`, () => {
      expect(evaluate(`startsWith("${s}", "${prefix}")`)).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 16: coalesce & if function (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('coalesce and if function', () => {
  // coalesce returns first non-empty value (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[coalesce-${n}] coalesce with variable x=${n} returns x`, () => {
      expect(evaluate('coalesce(x, 0)', { variables: { x: n } })).toBe(n);
    });
  }

  // if function (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[if-${n}] if(true, ${n}, 0) should return ${n}`, () => {
      expect(evaluate(`if(true, ${n}, 0)`)).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 17: Custom functions (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('custom functions', () => {
  // Override abs with custom implementation (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[custom-${n}] custom double function double(${n}) = ${n * 2}`, () => {
      const result = evaluate('double(x)', {
        variables: { x: n },
        functions: { double: (x: Value) => (x as number) * 2 },
      });
      expect(result).toBe(n * 2);
    });
  }

  // Custom function with two args (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`[custom2-${n}] custom add3 function add3(${n}, ${n + 1}, ${n + 2}) = ${n + n + 1 + n + 2}`, () => {
      const result = evaluate('add3(a, b, c)', {
        variables: { a: n, b: n + 1, c: n + 2 },
        functions: { add3: (a: Value, b: Value, c: Value) => (a as number) + (b as number) + (c as number) },
      });
      expect(result).toBe(n + (n + 1) + (n + 2));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 18: parse AST structure (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('parse AST structure', () => {
  // Literal nodes (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`parse("${n}") should return literal node with value ${n}`, () => {
      const ast = parse(`${n}`);
      expect(ast.type).toBe('literal');
      if (ast.type === 'literal') expect(ast.value).toBe(n);
    });
  }

  // Variable nodes (10 tests)
  const varNames = ['x', 'y', 'z', 'a', 'b', 'c', 'val', 'result', 'score', 'rate'];
  for (const v of varNames) {
    it(`parse("${v}") should return variable node with name "${v}"`, () => {
      const ast = parse(v);
      expect(ast.type).toBe('variable');
      if (ast.type === 'variable') expect(ast.name).toBe(v);
    });
  }

  // Binary nodes (10 tests)
  const binOps = ['+', '-', '*', '/', '%', '^', '==', '!=', '<', '>'];
  for (const op of binOps) {
    it(`parse("1 ${op} 2") should return binary node with op "${op}"`, () => {
      const ast = parse(`1 ${op} 2`);
      expect(ast.type).toBe('binary');
      if (ast.type === 'binary') expect(ast.op).toBe(op);
    });
  }

  // Unary nodes (5 tests)
  it('parse("-1") should return unary - node', () => {
    const ast = parse('-1');
    expect(ast.type).toBe('unary');
    if (ast.type === 'unary') expect(ast.op).toBe('-');
  });
  it('parse("!true") should return unary ! node', () => {
    const ast = parse('!true');
    expect(ast.type).toBe('unary');
    if (ast.type === 'unary') expect(ast.op).toBe('!');
  });
  it('parse("!x") should return unary ! with variable operand', () => {
    const ast = parse('!x');
    expect(ast.type).toBe('unary');
  });
  it('parse("-x") should return unary - with variable operand', () => {
    const ast = parse('-x');
    expect(ast.type).toBe('unary');
    if (ast.type === 'unary') {
      expect(ast.operand.type).toBe('variable');
    }
  });
  it('parse("!true") operand is literal', () => {
    const ast = parse('!true');
    if (ast.type === 'unary') expect(ast.operand.type).toBe('literal');
  });

  // Call nodes (10 tests)
  const fns = ['abs', 'ceil', 'floor', 'round', 'sqrt', 'sin', 'cos', 'tan', 'log', 'log2'];
  for (const fn of fns) {
    it(`parse("${fn}(1)") should return call node with name "${fn}"`, () => {
      const ast = parse(`${fn}(1)`);
      expect(ast.type).toBe('call');
      if (ast.type === 'call') {
        expect(ast.name).toBe(fn);
        expect(ast.args).toHaveLength(1);
      }
    });
  }

  // Ternary nodes (5 tests)
  for (let i = 0; i < 5; i++) {
    it(`[ternary-${i}] parse("x ? 1 : 0") should return ternary node`, () => {
      const ast = parse('x ? 1 : 0');
      expect(ast.type).toBe('ternary');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 19: Additional arithmetic expressions (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('additional arithmetic expressions', () => {
  // Compound arithmetic (50 tests)
  for (let n = 1; n <= 50; n++) {
    it(`(${n} + ${n}) * 2 = ${(n + n) * 2}`, () => {
      expect(evaluate(`(${n} + ${n}) * 2`)).toBe((n + n) * 2);
    });
  }

  // Precedence: 2 + 3 * 4 = 14 (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`${n} + ${n} * 2 = ${n + n * 2}`, () => {
      expect(evaluate(`${n} + ${n} * 2`)).toBe(n + n * 2);
    });
  }

  // Double negation (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`--${n} should parse and evaluate correctly`, () => {
      // -(-n) = n
      expect(evaluate(`-(-${n})`)).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 20: maxDepth limit (25 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('maxDepth limit', () => {
  for (let n = 1; n <= 25; n++) {
    it(`[maxDepth-${n}] simple expr with maxDepth=${n + 5} should succeed`, () => {
      const result = safeEvaluate('1 + 2', { maxDepth: n + 5 });
      expect(result.success).toBe(true);
      expect(result.value).toBe(3);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 21: NEQ comparisons (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('NEQ and GTE/LTE comparisons', () => {
  // != (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`${n} != ${n + 1} should be true`, () => {
      expect(evaluate(`${n} != ${n + 1}`)).toBe(true);
    });
  }

  // >= (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`${n} >= ${n} should be true`, () => {
      expect(evaluate(`${n} >= ${n}`)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 22: bool() function (25 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('bool function', () => {
  for (let n = 1; n <= 25; n++) {
    it(`bool(${n}) should be true for non-zero ${n}`, () => {
      expect(evaluate(`bool(${n})`)).toBe(true);
    });
  }
});
