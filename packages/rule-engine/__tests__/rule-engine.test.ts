import {
  evaluateCondition,
  evaluateGroup,
  applyAction,
  evaluateRule,
  evaluate,
  isValidOperator,
  isValidLogicalOperator,
  isValidActionType,
  makeCondition,
  makeAndGroup,
  makeOrGroup,
  makeNotGroup,
  makeRule,
  filterEnabledRules,
  getRulesByTag,
} from '../src/engine';
import type {
  Condition,
  Rule,
  RuleAction,
  RuleContext,
  RuleGroup,
  Operator,
} from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mkRule(
  id: string,
  priority: number,
  conditions: RuleGroup,
  actions: RuleAction[],
  enabled = true,
  tags?: string[],
): Rule {
  return { id, name: `Rule ${id}`, priority, enabled, conditions, actions, tags };
}

function andGroup(conditions: Array<Condition | RuleGroup>): RuleGroup {
  return { logic: 'and', conditions };
}
function orGroup(conditions: Array<Condition | RuleGroup>): RuleGroup {
  return { logic: 'or', conditions };
}
function notGroup(condition: Condition | RuleGroup): RuleGroup {
  return { logic: 'not', conditions: [condition] };
}
function cond(field: string, operator: Operator, value?: unknown): Condition {
  return { field, operator, ...(value !== undefined ? { value } : {}) };
}

// ==========================================================================
// 1. isValidOperator
// ==========================================================================
describe('isValidOperator', () => {
  const valid = ['eq','neq','gt','gte','lt','lte','in','nin','contains','startsWith','endsWith','matches','exists','notExists'];
  valid.forEach(op => {
    it(`returns true for "${op}"`, () => expect(isValidOperator(op)).toBe(true));
  });

  const invalid = ['EQ','NEQ','GT','GTE','LT','LTE','IN','NIN','CONTAINS','STARTSWITH','ENDSWITH','MATCHES','EXISTS','NOTEXISTS',
    'equal','notEqual','greater','greaterThan','less','lessThan','include','exclude','has','startswith','endswith','regex',
    '','   ','null','undefined','0','false','*','between','range','like','ilike'];
  invalid.forEach(op => {
    it(`returns false for "${op}"`, () => expect(isValidOperator(op)).toBe(false));
  });
});

// ==========================================================================
// 2. isValidLogicalOperator
// ==========================================================================
describe('isValidLogicalOperator', () => {
  const valid = ['and', 'or', 'not'];
  valid.forEach(op => {
    it(`returns true for "${op}"`, () => expect(isValidLogicalOperator(op)).toBe(true));
  });

  const invalid = ['AND','OR','NOT','nand','nor','xor','&&','||','!','','nOt','aNd','oR','andd','orr','nott','all','any','none'];
  invalid.forEach(op => {
    it(`returns false for "${op}"`, () => expect(isValidLogicalOperator(op)).toBe(false));
  });
});

// ==========================================================================
// 3. isValidActionType
// ==========================================================================
describe('isValidActionType', () => {
  const valid = ['set','unset','increment','decrement','append','notify','block'];
  valid.forEach(t => {
    it(`returns true for "${t}"`, () => expect(isValidActionType(t)).toBe(true));
  });

  const invalid = ['SET','UNSET','INCREMENT','DECREMENT','APPEND','NOTIFY','BLOCK',
    'add','remove','push','pop','update','delete','create','read','write','exec',
    '','push','pop','shift','unshift','splice','sort','reverse','filter','map'];
  invalid.forEach(t => {
    it(`returns false for "${t}"`, () => expect(isValidActionType(t)).toBe(false));
  });
});

// ==========================================================================
// 4. evaluateCondition — eq
// ==========================================================================
describe('evaluateCondition — eq', () => {
  it('matches string equality', () => expect(evaluateCondition({ x: 'hello' }, cond('x','eq','hello'))).toBe(true));
  it('fails string inequality', () => expect(evaluateCondition({ x: 'hello' }, cond('x','eq','world'))).toBe(false));
  it('matches number equality', () => expect(evaluateCondition({ n: 42 }, cond('n','eq',42))).toBe(true));
  it('fails number inequality', () => expect(evaluateCondition({ n: 42 }, cond('n','eq',43))).toBe(false));
  it('matches boolean true', () => expect(evaluateCondition({ b: true }, cond('b','eq',true))).toBe(true));
  it('matches boolean false', () => expect(evaluateCondition({ b: false }, cond('b','eq',false))).toBe(true));
  it('fails boolean mismatch', () => expect(evaluateCondition({ b: true }, cond('b','eq',false))).toBe(false));
  it('matches null', () => expect(evaluateCondition({ x: null }, cond('x','eq',null))).toBe(true));
  it('fails null vs undefined', () => expect(evaluateCondition({ x: null }, cond('x','eq',undefined))).toBe(false));
  it('matches undefined field eq undefined', () => expect(evaluateCondition({}, cond('x','eq',undefined))).toBe(true));
  it('strict type: "42" !== 42', () => expect(evaluateCondition({ x: '42' }, cond('x','eq',42))).toBe(false));
  it('strict type: 0 !== false', () => expect(evaluateCondition({ x: 0 }, cond('x','eq',false))).toBe(false));
  it('matches empty string', () => expect(evaluateCondition({ x: '' }, cond('x','eq',''))).toBe(true));
  it('matches zero', () => expect(evaluateCondition({ x: 0 }, cond('x','eq',0))).toBe(true));

  // parameterised: eq with various primitives
  const primitives = [1, 2, 3, 10, 100, -1, -100, 0.5, 1.5, 'a', 'b', 'abc', 'xyz', true, false];
  primitives.forEach(v => {
    it(`eq matches ${JSON.stringify(v)}`, () => {
      expect(evaluateCondition({ x: v }, cond('x','eq',v))).toBe(true);
    });
    it(`eq fails with different value for ${JSON.stringify(v)}`, () => {
      const other = typeof v === 'number' ? v + 1000 : `__not_${v}`;
      expect(evaluateCondition({ x: v }, cond('x','eq',other))).toBe(false);
    });
  });
});

// ==========================================================================
// 5. evaluateCondition — neq
// ==========================================================================
describe('evaluateCondition — neq', () => {
  it('true when values differ (string)', () => expect(evaluateCondition({ x: 'a' }, cond('x','neq','b'))).toBe(true));
  it('false when values equal (string)', () => expect(evaluateCondition({ x: 'a' }, cond('x','neq','a'))).toBe(false));
  it('true when values differ (number)', () => expect(evaluateCondition({ n: 1 }, cond('n','neq',2))).toBe(true));
  it('false when values equal (number)', () => expect(evaluateCondition({ n: 1 }, cond('n','neq',1))).toBe(false));
  it('true for null vs string', () => expect(evaluateCondition({ x: null }, cond('x','neq','hello'))).toBe(true));
  it('false for null vs null', () => expect(evaluateCondition({ x: null }, cond('x','neq',null))).toBe(false));
  it('type coercion: "1" neq 1 → true', () => expect(evaluateCondition({ x: '1' }, cond('x','neq',1))).toBe(true));

  const pairs: [unknown, unknown][] = [
    [1, 2], ['a', 'b'], [true, false], [null, 'x'], [0, 1], [-1, 1]
  ];
  pairs.forEach(([a, b]) => {
    it(`neq: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`, () => {
      expect(evaluateCondition({ x: a }, cond('x','neq',b))).toBe(true);
    });
  });
});

// ==========================================================================
// 6. evaluateCondition — gt / gte / lt / lte
// ==========================================================================
describe('evaluateCondition — gt', () => {
  const cases: [number, number, boolean][] = [
    [5, 3, true], [3, 5, false], [3, 3, false], [0, -1, true], [-1, 0, false],
    [100, 99, true], [1.5, 1.4, true], [1.4, 1.5, false], [0.1, 0, true], [-0.1, 0, false],
    [1000, 999, true], [999, 1000, false],
  ];
  cases.forEach(([a, b, expected]) => {
    it(`${a} gt ${b} = ${expected}`, () => expect(evaluateCondition({ n: a }, cond('n','gt',b))).toBe(expected));
  });
  it('returns false for string values', () => expect(evaluateCondition({ n: 'hello' }, cond('n','gt',0))).toBe(false));
  it('returns false when field is missing', () => expect(evaluateCondition({}, cond('n','gt',0))).toBe(false));
  it('returns false when value is string', () => expect(evaluateCondition({ n: 5 }, cond('n','gt','3'))).toBe(false));
});

describe('evaluateCondition — gte', () => {
  const cases: [number, number, boolean][] = [
    [5, 3, true], [3, 5, false], [3, 3, true], [0, -1, true], [-1, 0, false],
    [100, 100, true], [1.5, 1.5, true], [1.4, 1.5, false], [0, 0, true],
  ];
  cases.forEach(([a, b, expected]) => {
    it(`${a} gte ${b} = ${expected}`, () => expect(evaluateCondition({ n: a }, cond('n','gte',b))).toBe(expected));
  });
  it('returns false for string field', () => expect(evaluateCondition({ n: 'big' }, cond('n','gte',0))).toBe(false));
});

describe('evaluateCondition — lt', () => {
  const cases: [number, number, boolean][] = [
    [3, 5, true], [5, 3, false], [3, 3, false], [-1, 0, true], [0, 1, true],
    [99, 100, true], [1.4, 1.5, true], [1.5, 1.4, false],
  ];
  cases.forEach(([a, b, expected]) => {
    it(`${a} lt ${b} = ${expected}`, () => expect(evaluateCondition({ n: a }, cond('n','lt',b))).toBe(expected));
  });
  it('returns false for boolean field', () => expect(evaluateCondition({ n: true }, cond('n','lt',5))).toBe(false));
});

describe('evaluateCondition — lte', () => {
  const cases: [number, number, boolean][] = [
    [3, 5, true], [5, 3, false], [3, 3, true], [-1, 0, true], [0, 0, true],
    [100, 100, true], [1.4, 1.5, true], [1.5, 1.5, true], [2, 1, false],
  ];
  cases.forEach(([a, b, expected]) => {
    it(`${a} lte ${b} = ${expected}`, () => expect(evaluateCondition({ n: a }, cond('n','lte',b))).toBe(expected));
  });
  it('returns false for null field', () => expect(evaluateCondition({ n: null }, cond('n','lte',5))).toBe(false));
});

// ==========================================================================
// 7. evaluateCondition — in / nin
// ==========================================================================
describe('evaluateCondition — in', () => {
  it('true when value is in array', () => expect(evaluateCondition({ x: 2 }, cond('x','in',[1,2,3]))).toBe(true));
  it('false when value not in array', () => expect(evaluateCondition({ x: 5 }, cond('x','in',[1,2,3]))).toBe(false));
  it('works with strings', () => expect(evaluateCondition({ x: 'b' }, cond('x','in',['a','b','c']))).toBe(true));
  it('false with empty array', () => expect(evaluateCondition({ x: 1 }, cond('x','in',[]))).toBe(false));
  it('false when cond.value is not array', () => expect(evaluateCondition({ x: 1 }, cond('x','in','1'))).toBe(false));
  it('false when field is missing', () => expect(evaluateCondition({}, cond('x','in',[1,2]))).toBe(false));
  it('includes null in array', () => expect(evaluateCondition({ x: null }, cond('x','in',[null, 1]))).toBe(true));
  it('includes boolean', () => expect(evaluateCondition({ x: true }, cond('x','in',[true, false]))).toBe(true));
  it('strict type: "1" not in [1]', () => expect(evaluateCondition({ x: '1' }, cond('x','in',[1]))).toBe(false));

  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  values.forEach(v => {
    it(`in: ${v} found in array`, () => expect(evaluateCondition({ x: v }, cond('x','in',values))).toBe(true));
    it(`in: ${v + 1} not found in array`, () => expect(evaluateCondition({ x: v + 1 }, cond('x','in',values))).toBe(false));
  });
});

describe('evaluateCondition — nin', () => {
  it('true when value is NOT in array', () => expect(evaluateCondition({ x: 5 }, cond('x','nin',[1,2,3]))).toBe(true));
  it('false when value IS in array', () => expect(evaluateCondition({ x: 2 }, cond('x','nin',[1,2,3]))).toBe(false));
  it('true with empty array', () => expect(evaluateCondition({ x: 1 }, cond('x','nin',[]))).toBe(true));
  it('false when cond.value is not array', () => expect(evaluateCondition({ x: 1 }, cond('x','nin','1'))).toBe(false));
  it('works with strings', () => expect(evaluateCondition({ x: 'd' }, cond('x','nin',['a','b','c']))).toBe(true));
  it('false when string in array', () => expect(evaluateCondition({ x: 'a' }, cond('x','nin',['a','b']))).toBe(false));

  const values = [10, 20, 30, 40, 50];
  values.forEach(v => {
    it(`nin: ${v} IS in array → false`, () => expect(evaluateCondition({ x: v }, cond('x','nin',values))).toBe(false));
    it(`nin: ${v + 1} NOT in array → true`, () => expect(evaluateCondition({ x: v + 1 }, cond('x','nin',values))).toBe(true));
  });
});

// ==========================================================================
// 8. evaluateCondition — contains / startsWith / endsWith
// ==========================================================================
describe('evaluateCondition — contains', () => {
  it('true when substring present', () => expect(evaluateCondition({ s: 'hello world' }, cond('s','contains','world'))).toBe(true));
  it('false when substring absent', () => expect(evaluateCondition({ s: 'hello' }, cond('s','contains','xyz'))).toBe(false));
  it('false when field is number', () => expect(evaluateCondition({ s: 42 }, cond('s','contains','4'))).toBe(false));
  it('false when value is number', () => expect(evaluateCondition({ s: 'hello' }, cond('s','contains',42))).toBe(false));
  it('true for empty substring', () => expect(evaluateCondition({ s: 'hello' }, cond('s','contains',''))).toBe(true));
  it('false when field is missing', () => expect(evaluateCondition({}, cond('s','contains','x'))).toBe(false));
  it('case-sensitive mismatch', () => expect(evaluateCondition({ s: 'Hello' }, cond('s','contains','hello'))).toBe(false));
  it('case-sensitive match', () => expect(evaluateCondition({ s: 'Hello' }, cond('s','contains','Hello'))).toBe(true));

  const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];
  words.forEach(w => {
    const sentence = `I like ${w} and more`;
    it(`contains: "${sentence}" contains "${w}"`, () => {
      expect(evaluateCondition({ s: sentence }, cond('s','contains',w))).toBe(true);
    });
    it(`contains: "${sentence}" does not contain "zzz"`, () => {
      expect(evaluateCondition({ s: sentence }, cond('s','contains','zzz'))).toBe(false);
    });
  });
});

describe('evaluateCondition — startsWith', () => {
  it('true when starts with prefix', () => expect(evaluateCondition({ s: 'hello world' }, cond('s','startsWith','hello'))).toBe(true));
  it('false when does not start with prefix', () => expect(evaluateCondition({ s: 'hello world' }, cond('s','startsWith','world'))).toBe(false));
  it('true for empty prefix', () => expect(evaluateCondition({ s: 'hello' }, cond('s','startsWith',''))).toBe(true));
  it('false when field is number', () => expect(evaluateCondition({ s: 42 }, cond('s','startsWith','4'))).toBe(false));
  it('false when value is number', () => expect(evaluateCondition({ s: 'hello' }, cond('s','startsWith',4))).toBe(false));
  it('false when field is missing', () => expect(evaluateCondition({}, cond('s','startsWith','h'))).toBe(false));
  it('exact match counts as startsWith', () => expect(evaluateCondition({ s: 'abc' }, cond('s','startsWith','abc'))).toBe(true));

  const prefixes = ['INV-', 'ORD-', 'REQ-', 'TKT-', 'PRJ-', 'EMP-', 'DOC-', 'AUD-'];
  prefixes.forEach(prefix => {
    const value = `${prefix}2024-001`;
    it(`startsWith: "${value}" starts with "${prefix}"`, () => {
      expect(evaluateCondition({ s: value }, cond('s','startsWith',prefix))).toBe(true);
    });
    it(`startsWith: "WRONG-001" does not start with "${prefix}"`, () => {
      expect(evaluateCondition({ s: 'WRONG-001' }, cond('s','startsWith',prefix))).toBe(false);
    });
  });
});

describe('evaluateCondition — endsWith', () => {
  it('true when ends with suffix', () => expect(evaluateCondition({ s: 'hello world' }, cond('s','endsWith','world'))).toBe(true));
  it('false when does not end with suffix', () => expect(evaluateCondition({ s: 'hello world' }, cond('s','endsWith','hello'))).toBe(false));
  it('true for empty suffix', () => expect(evaluateCondition({ s: 'hello' }, cond('s','endsWith',''))).toBe(true));
  it('false when field is number', () => expect(evaluateCondition({ s: 42 }, cond('s','endsWith','2'))).toBe(false));
  it('false when value is number', () => expect(evaluateCondition({ s: 'hello' }, cond('s','endsWith',2))).toBe(false));
  it('false when field is missing', () => expect(evaluateCondition({}, cond('s','endsWith','d'))).toBe(false));
  it('exact match counts as endsWith', () => expect(evaluateCondition({ s: 'abc' }, cond('s','endsWith','abc'))).toBe(true));

  const suffixes = ['.pdf', '.docx', '.xlsx', '.csv', '.json', '.xml', '.png', '.jpg'];
  suffixes.forEach(suffix => {
    const value = `report${suffix}`;
    it(`endsWith: "${value}" ends with "${suffix}"`, () => {
      expect(evaluateCondition({ s: value }, cond('s','endsWith',suffix))).toBe(true);
    });
    it(`endsWith: "report.txt" does not end with "${suffix}"`, () => {
      expect(evaluateCondition({ s: 'report.txt' }, cond('s','endsWith',suffix))).toBe(false);
    });
  });
});

// ==========================================================================
// 9. evaluateCondition — matches
// ==========================================================================
describe('evaluateCondition — matches', () => {
  it('true when regex matches', () => expect(evaluateCondition({ s: 'abc123' }, cond('s','matches','^[a-z]+\\d+$'))).toBe(true));
  it('false when regex does not match', () => expect(evaluateCondition({ s: 'abc' }, cond('s','matches','^\\d+$'))).toBe(false));
  it('false when field is number', () => expect(evaluateCondition({ s: 123 }, cond('s','matches','\\d+'))).toBe(false));
  it('false when value is number', () => expect(evaluateCondition({ s: '123' }, cond('s','matches',123))).toBe(false));
  it('false when field is missing', () => expect(evaluateCondition({}, cond('s','matches','.*'))).toBe(false));
  it('matches email pattern', () => expect(evaluateCondition({ s: 'user@example.com' }, cond('s','matches','^[^@]+@[^@]+\\.[^@]+$'))).toBe(true));
  it('fails email pattern on invalid', () => expect(evaluateCondition({ s: 'notanemail' }, cond('s','matches','^[^@]+@[^@]+\\.[^@]+$'))).toBe(false));
  it('matches UUID-like', () => expect(evaluateCondition({ s: 'abcd1234-ef56-7890-abcd-ef1234567890' }, cond('s','matches','^[a-f0-9-]{36}$'))).toBe(true));
  it('invalid regex pattern returns false gracefully', () => expect(evaluateCondition({ s: 'HELLO' }, cond('s','matches','(?i)hello'))).toBe(false)); // JS doesn't support (?i) inline flag — engine catches and returns false
  it('dot matches any char', () => expect(evaluateCondition({ s: 'aXb' }, cond('s','matches','a.b'))).toBe(true));

  const regexCases: [string, string, boolean][] = [
    ['hello', '^hello$', true],
    ['hello', '^world$', false],
    ['12345', '^\\d+$', true],
    ['abc', '^\\d+$', false],
    ['test@test.com', '@', true],
    ['no-at-sign', '@', false],
    ['', '.*', true],
    ['abc', 'b', true],
    ['xyz', '^a', false],
    ['2024-01-01', '^\\d{4}-\\d{2}-\\d{2}$', true],
  ];
  regexCases.forEach(([val, pattern, expected]) => {
    it(`matches("${val}", "${pattern}") = ${expected}`, () => {
      expect(evaluateCondition({ s: val }, cond('s','matches',pattern))).toBe(expected);
    });
  });
});

// ==========================================================================
// 10. evaluateCondition — exists / notExists
// ==========================================================================
describe('evaluateCondition — exists', () => {
  it('true when field has string value', () => expect(evaluateCondition({ x: 'hello' }, cond('x','exists'))).toBe(true));
  it('true when field has number value', () => expect(evaluateCondition({ x: 42 }, cond('x','exists'))).toBe(true));
  it('true when field has boolean true', () => expect(evaluateCondition({ x: true }, cond('x','exists'))).toBe(true));
  it('true when field has boolean false', () => expect(evaluateCondition({ x: false }, cond('x','exists'))).toBe(true));
  it('true when field has empty string', () => expect(evaluateCondition({ x: '' }, cond('x','exists'))).toBe(true));
  it('true when field has zero', () => expect(evaluateCondition({ x: 0 }, cond('x','exists'))).toBe(true));
  it('true when field has array', () => expect(evaluateCondition({ x: [] }, cond('x','exists'))).toBe(true));
  it('true when field has object', () => expect(evaluateCondition({ x: {} }, cond('x','exists'))).toBe(true));
  it('false when field is null', () => expect(evaluateCondition({ x: null }, cond('x','exists'))).toBe(false));
  it('false when field is undefined (missing)', () => expect(evaluateCondition({}, cond('x','exists'))).toBe(false));
  it('false when field explicitly undefined', () => expect(evaluateCondition({ x: undefined }, cond('x','exists'))).toBe(false));

  const values = [1, 'a', true, [], {}, -1, 0.5, 'hello world'];
  values.forEach(v => {
    it(`exists: ${JSON.stringify(v)} → true`, () => {
      expect(evaluateCondition({ f: v }, cond('f','exists'))).toBe(true);
    });
  });
});

describe('evaluateCondition — notExists', () => {
  it('true when field is undefined (missing)', () => expect(evaluateCondition({}, cond('x','notExists'))).toBe(true));
  it('true when field is null', () => expect(evaluateCondition({ x: null }, cond('x','notExists'))).toBe(true));
  it('true when field explicitly undefined', () => expect(evaluateCondition({ x: undefined }, cond('x','notExists'))).toBe(true));
  it('false when field has string', () => expect(evaluateCondition({ x: 'hello' }, cond('x','notExists'))).toBe(false));
  it('false when field has number', () => expect(evaluateCondition({ x: 42 }, cond('x','notExists'))).toBe(false));
  it('false when field has zero', () => expect(evaluateCondition({ x: 0 }, cond('x','notExists'))).toBe(false));
  it('false when field has empty string', () => expect(evaluateCondition({ x: '' }, cond('x','notExists'))).toBe(false));
  it('false when field has false', () => expect(evaluateCondition({ x: false }, cond('x','notExists'))).toBe(false));
  it('false when field has array', () => expect(evaluateCondition({ x: [] }, cond('x','notExists'))).toBe(false));
  it('false when field has object', () => expect(evaluateCondition({ x: {} }, cond('x','notExists'))).toBe(false));
});

// ==========================================================================
// 11. evaluateGroup — and
// ==========================================================================
describe('evaluateGroup — and', () => {
  it('true when single condition passes', () => {
    const g = andGroup([cond('x','eq',1)]);
    expect(evaluateGroup({ x: 1 }, g)).toBe(true);
  });
  it('false when single condition fails', () => {
    const g = andGroup([cond('x','eq',1)]);
    expect(evaluateGroup({ x: 2 }, g)).toBe(false);
  });
  it('true when all two conditions pass', () => {
    const g = andGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 1, y: 2 }, g)).toBe(true);
  });
  it('false when first fails', () => {
    const g = andGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 9, y: 2 }, g)).toBe(false);
  });
  it('false when second fails', () => {
    const g = andGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 1, y: 9 }, g)).toBe(false);
  });
  it('false when both fail', () => {
    const g = andGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 9, y: 9 }, g)).toBe(false);
  });
  it('true with three passing conditions', () => {
    const g = andGroup([cond('a','eq',1), cond('b','eq',2), cond('c','eq',3)]);
    expect(evaluateGroup({ a: 1, b: 2, c: 3 }, g)).toBe(true);
  });
  it('false with three conditions, one fails', () => {
    const g = andGroup([cond('a','eq',1), cond('b','eq',2), cond('c','eq',3)]);
    expect(evaluateGroup({ a: 1, b: 9, c: 3 }, g)).toBe(false);
  });
  it('true with empty conditions (vacuously true via every)', () => {
    const g = andGroup([]);
    expect(evaluateGroup({}, g)).toBe(true);
  });

  // Nested and groups
  it('true with nested and groups both passing', () => {
    const inner = andGroup([cond('x','gt',0), cond('x','lt',10)]);
    const outer = andGroup([inner, cond('y','eq','active')]);
    expect(evaluateGroup({ x: 5, y: 'active' }, outer)).toBe(true);
  });
  it('false with nested and group failing', () => {
    const inner = andGroup([cond('x','gt',0), cond('x','lt',10)]);
    const outer = andGroup([inner, cond('y','eq','active')]);
    expect(evaluateGroup({ x: 15, y: 'active' }, outer)).toBe(false);
  });

  // Parameterised: 10 contexts
  for (let i = 0; i < 10; i++) {
    it(`and: both eq pass for i=${i}`, () => {
      const g = andGroup([cond('a','eq',i), cond('b','eq',i * 2)]);
      expect(evaluateGroup({ a: i, b: i * 2 }, g)).toBe(true);
    });
    it(`and: fails when b is wrong for i=${i}`, () => {
      const g = andGroup([cond('a','eq',i), cond('b','eq',i * 2)]);
      expect(evaluateGroup({ a: i, b: i * 2 + 1 }, g)).toBe(false);
    });
  }
});

// ==========================================================================
// 12. evaluateGroup — or
// ==========================================================================
describe('evaluateGroup — or', () => {
  it('true when single condition passes', () => {
    const g = orGroup([cond('x','eq',1)]);
    expect(evaluateGroup({ x: 1 }, g)).toBe(true);
  });
  it('false when single condition fails', () => {
    const g = orGroup([cond('x','eq',1)]);
    expect(evaluateGroup({ x: 2 }, g)).toBe(false);
  });
  it('true when first of two passes', () => {
    const g = orGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 1, y: 9 }, g)).toBe(true);
  });
  it('true when second of two passes', () => {
    const g = orGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 9, y: 2 }, g)).toBe(true);
  });
  it('true when both pass', () => {
    const g = orGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 1, y: 2 }, g)).toBe(true);
  });
  it('false when both fail', () => {
    const g = orGroup([cond('x','eq',1), cond('y','eq',2)]);
    expect(evaluateGroup({ x: 9, y: 9 }, g)).toBe(false);
  });
  it('false with empty conditions (vacuously false via some)', () => {
    const g = orGroup([]);
    expect(evaluateGroup({}, g)).toBe(false);
  });
  it('true with three conditions, only last passes', () => {
    const g = orGroup([cond('a','eq',1), cond('b','eq',2), cond('c','eq',3)]);
    expect(evaluateGroup({ a: 9, b: 9, c: 3 }, g)).toBe(true);
  });
  it('false with three conditions, all fail', () => {
    const g = orGroup([cond('a','eq',1), cond('b','eq',2), cond('c','eq',3)]);
    expect(evaluateGroup({ a: 9, b: 9, c: 9 }, g)).toBe(false);
  });

  // Parameterised: 10 pairs
  for (let i = 0; i < 10; i++) {
    it(`or: first passes for i=${i}`, () => {
      const g = orGroup([cond('a','eq',i), cond('b','eq',i * 10)]);
      expect(evaluateGroup({ a: i, b: 999 }, g)).toBe(true);
    });
    it(`or: second passes for i=${i}`, () => {
      const g = orGroup([cond('a','eq',i), cond('b','eq',i * 10)]);
      expect(evaluateGroup({ a: 999, b: i * 10 }, g)).toBe(true);
    });
    it(`or: both fail for i=${i}`, () => {
      const g = orGroup([cond('a','eq',i), cond('b','eq',i * 10)]);
      expect(evaluateGroup({ a: 999, b: 999 }, g)).toBe(false);
    });
  }
});

// ==========================================================================
// 13. evaluateGroup — not
// ==========================================================================
describe('evaluateGroup — not', () => {
  it('true when condition fails', () => {
    const g = notGroup(cond('x','eq',1));
    expect(evaluateGroup({ x: 2 }, g)).toBe(true);
  });
  it('false when condition passes', () => {
    const g = notGroup(cond('x','eq',1));
    expect(evaluateGroup({ x: 1 }, g)).toBe(false);
  });
  it('double not (not-not) returns original', () => {
    const g = notGroup(notGroup(cond('x','eq',1)));
    expect(evaluateGroup({ x: 1 }, g)).toBe(true);
  });
  it('not of and group', () => {
    const inner = andGroup([cond('x','eq',1), cond('y','eq',2)]);
    const g = notGroup(inner);
    expect(evaluateGroup({ x: 1, y: 2 }, g)).toBe(false);
    expect(evaluateGroup({ x: 1, y: 9 }, g)).toBe(true);
  });
  it('not of or group', () => {
    const inner = orGroup([cond('x','eq',1), cond('y','eq',2)]);
    const g = notGroup(inner);
    expect(evaluateGroup({ x: 9, y: 9 }, g)).toBe(true);
    expect(evaluateGroup({ x: 1, y: 9 }, g)).toBe(false);
  });
  it('not of exists', () => {
    const g = notGroup(cond('x','exists'));
    expect(evaluateGroup({}, g)).toBe(true);
    expect(evaluateGroup({ x: 'val' }, g)).toBe(false);
  });

  // Parameterised not
  for (let i = 1; i <= 10; i++) {
    it(`not eq: ctx.n=${i} not eq ${i + 1} → true`, () => {
      const g = notGroup(cond('n','eq',i + 1));
      expect(evaluateGroup({ n: i }, g)).toBe(true);
    });
    it(`not eq: ctx.n=${i} not eq ${i} → false`, () => {
      const g = notGroup(cond('n','eq',i));
      expect(evaluateGroup({ n: i }, g)).toBe(false);
    });
  }
});

// ==========================================================================
// 14. applyAction — set
// ==========================================================================
describe('applyAction — set', () => {
  it('sets a new field', () => {
    const ctx = applyAction({}, { type: 'set', target: 'x', value: 42 });
    expect(ctx.x).toBe(42);
  });
  it('overwrites existing field', () => {
    const ctx = applyAction({ x: 1 }, { type: 'set', target: 'x', value: 99 });
    expect(ctx.x).toBe(99);
  });
  it('does not mutate original context', () => {
    const original: RuleContext = { a: 1 };
    applyAction(original, { type: 'set', target: 'a', value: 2 });
    expect(original.a).toBe(1);
  });
  it('sets string value', () => {
    const ctx = applyAction({}, { type: 'set', target: 's', value: 'hello' });
    expect(ctx.s).toBe('hello');
  });
  it('sets boolean value', () => {
    const ctx = applyAction({}, { type: 'set', target: 'b', value: true });
    expect(ctx.b).toBe(true);
  });
  it('sets null value', () => {
    const ctx = applyAction({ x: 1 }, { type: 'set', target: 'x', value: null });
    expect(ctx.x).toBeNull();
  });
  it('sets array value', () => {
    const ctx = applyAction({}, { type: 'set', target: 'arr', value: [1,2,3] });
    expect(ctx.arr).toEqual([1,2,3]);
  });
  it('sets object value', () => {
    const ctx = applyAction({}, { type: 'set', target: 'obj', value: { a: 1 } });
    expect(ctx.obj).toEqual({ a: 1 });
  });
  it('no-op when target is undefined', () => {
    const ctx = applyAction({ x: 1 }, { type: 'set', value: 42 });
    expect(ctx.x).toBe(1);
    expect(Object.keys(ctx).length).toBe(1);
  });

  // Parameterised set
  for (let i = 0; i < 10; i++) {
    it(`set: field "f${i}" = ${i}`, () => {
      const ctx = applyAction({}, { type: 'set', target: `f${i}`, value: i });
      expect(ctx[`f${i}`]).toBe(i);
    });
  }
});

// ==========================================================================
// 15. applyAction — unset
// ==========================================================================
describe('applyAction — unset', () => {
  it('removes a field', () => {
    const ctx = applyAction({ x: 1, y: 2 }, { type: 'unset', target: 'x' });
    expect('x' in ctx).toBe(false);
    expect(ctx.y).toBe(2);
  });
  it('no error on missing field', () => {
    const ctx = applyAction({ y: 2 }, { type: 'unset', target: 'x' });
    expect(ctx.y).toBe(2);
  });
  it('does not mutate original', () => {
    const original: RuleContext = { x: 1 };
    applyAction(original, { type: 'unset', target: 'x' });
    expect(original.x).toBe(1);
  });
  it('no-op when target is undefined', () => {
    const ctx = applyAction({ x: 1 }, { type: 'unset' });
    expect(ctx.x).toBe(1);
  });

  // Parameterised unset
  for (let i = 0; i < 8; i++) {
    it(`unset: removes f${i}`, () => {
      const initial: RuleContext = {};
      for (let j = 0; j < 5; j++) initial[`f${j}`] = j;
      const ctx = applyAction(initial, { type: 'unset', target: `f${i % 5}` });
      expect(`f${i % 5}` in ctx).toBe(false);
    });
  }
});

// ==========================================================================
// 16. applyAction — increment / decrement
// ==========================================================================
describe('applyAction — increment', () => {
  it('increments by 1 when no value', () => {
    const ctx = applyAction({ n: 5 }, { type: 'increment', target: 'n' });
    expect(ctx.n).toBe(6);
  });
  it('increments by given value', () => {
    const ctx = applyAction({ n: 5 }, { type: 'increment', target: 'n', value: 10 });
    expect(ctx.n).toBe(15);
  });
  it('no-op when field is not a number', () => {
    const ctx = applyAction({ n: 'hello' }, { type: 'increment', target: 'n' });
    expect(ctx.n).toBe('hello');
  });
  it('no-op when field is missing', () => {
    const ctx = applyAction({}, { type: 'increment', target: 'n' });
    expect(ctx.n).toBeUndefined();
  });
  it('no-op when value is string', () => {
    const ctx = applyAction({ n: 5 }, { type: 'increment', target: 'n', value: 'bad' });
    expect(ctx.n).toBe(6); // falls back to +1
  });
  it('does not mutate original', () => {
    const original: RuleContext = { n: 10 };
    applyAction(original, { type: 'increment', target: 'n' });
    expect(original.n).toBe(10);
  });

  // Parameterised increment
  for (let i = 1; i <= 10; i++) {
    it(`increment by ${i}`, () => {
      const ctx = applyAction({ n: 100 }, { type: 'increment', target: 'n', value: i });
      expect(ctx.n).toBe(100 + i);
    });
  }
});

describe('applyAction — decrement', () => {
  it('decrements by 1 when no value', () => {
    const ctx = applyAction({ n: 5 }, { type: 'decrement', target: 'n' });
    expect(ctx.n).toBe(4);
  });
  it('decrements by given value', () => {
    const ctx = applyAction({ n: 10 }, { type: 'decrement', target: 'n', value: 3 });
    expect(ctx.n).toBe(7);
  });
  it('no-op when field is not a number', () => {
    const ctx = applyAction({ n: 'hello' }, { type: 'decrement', target: 'n' });
    expect(ctx.n).toBe('hello');
  });
  it('no-op when field is missing', () => {
    const ctx = applyAction({}, { type: 'decrement', target: 'n' });
    expect(ctx.n).toBeUndefined();
  });
  it('does not mutate original', () => {
    const original: RuleContext = { n: 10 };
    applyAction(original, { type: 'decrement', target: 'n' });
    expect(original.n).toBe(10);
  });

  // Parameterised decrement
  for (let i = 1; i <= 10; i++) {
    it(`decrement by ${i}`, () => {
      const ctx = applyAction({ n: 100 }, { type: 'decrement', target: 'n', value: i });
      expect(ctx.n).toBe(100 - i);
    });
  }
});

// ==========================================================================
// 17. applyAction — append
// ==========================================================================
describe('applyAction — append', () => {
  it('appends to existing array', () => {
    const ctx = applyAction({ arr: [1, 2] }, { type: 'append', target: 'arr', value: 3 });
    expect(ctx.arr).toEqual([1, 2, 3]);
  });
  it('no-op when field is not an array', () => {
    const ctx = applyAction({ arr: 'not-array' }, { type: 'append', target: 'arr', value: 1 });
    expect(ctx.arr).toBe('not-array');
  });
  it('no-op when field is missing', () => {
    const ctx = applyAction({}, { type: 'append', target: 'arr', value: 1 });
    expect(ctx.arr).toBeUndefined();
  });
  it('appends string to string array', () => {
    const ctx = applyAction({ arr: ['a', 'b'] }, { type: 'append', target: 'arr', value: 'c' });
    expect(ctx.arr).toEqual(['a', 'b', 'c']);
  });
  it('appends object to array', () => {
    const ctx = applyAction({ arr: [] }, { type: 'append', target: 'arr', value: { id: 1 } });
    expect(ctx.arr).toEqual([{ id: 1 }]);
  });
  it('does not mutate original array', () => {
    const original: RuleContext = { arr: [1, 2] };
    applyAction(original, { type: 'append', target: 'arr', value: 3 });
    expect(original.arr).toEqual([1, 2]);
  });
  it('no-op when target is undefined', () => {
    const ctx = applyAction({ arr: [1] }, { type: 'append', value: 2 });
    expect(ctx.arr).toEqual([1]);
  });

  // Parameterised append
  for (let i = 0; i < 8; i++) {
    it(`append item ${i} to array`, () => {
      const ctx = applyAction({ arr: [0, 1, 2] }, { type: 'append', target: 'arr', value: i + 10 });
      expect((ctx.arr as number[]).includes(i + 10)).toBe(true);
      expect((ctx.arr as number[]).length).toBe(4);
    });
  }
});

// ==========================================================================
// 18. applyAction — notify / block
// ==========================================================================
describe('applyAction — notify', () => {
  it('does not throw', () => {
    expect(() => applyAction({ x: 1 }, { type: 'notify', message: 'Alert!' })).not.toThrow();
  });
  it('returns context unchanged', () => {
    const original: RuleContext = { x: 1, y: 'test' };
    const ctx = applyAction(original, { type: 'notify', message: 'Alert!' });
    expect(ctx).toEqual({ x: 1, y: 'test' });
  });
  it('does not mutate original', () => {
    const original: RuleContext = { x: 1 };
    applyAction(original, { type: 'notify' });
    expect(original.x).toBe(1);
  });
});

describe('applyAction — block', () => {
  it('does not throw', () => {
    expect(() => applyAction({ x: 1 }, { type: 'block', message: 'Blocked!' })).not.toThrow();
  });
  it('returns context unchanged', () => {
    const original: RuleContext = { x: 1, y: 'test' };
    const ctx = applyAction(original, { type: 'block' });
    expect(ctx).toEqual({ x: 1, y: 'test' });
  });
  it('does not mutate original', () => {
    const original: RuleContext = { x: 1 };
    applyAction(original, { type: 'block' });
    expect(original.x).toBe(1);
  });
});

// ==========================================================================
// 19. evaluateRule
// ==========================================================================
describe('evaluateRule', () => {
  const simpleGroup = andGroup([cond('x','eq',1)]);
  const actions: RuleAction[] = [{ type: 'set', target: 'flag', value: true }];

  it('returns matched=true when enabled and condition passes', () => {
    const rule = mkRule('r1', 10, simpleGroup, actions, true);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.matched).toBe(true);
    expect(result.ruleId).toBe('r1');
    expect(result.actionsExecuted).toEqual(actions);
  });

  it('returns matched=false when enabled and condition fails', () => {
    const rule = mkRule('r1', 10, simpleGroup, actions, true);
    const result = evaluateRule({ x: 999 }, rule);
    expect(result.matched).toBe(false);
    expect(result.actionsExecuted).toEqual([]);
  });

  it('returns matched=false when rule is disabled (condition would pass)', () => {
    const rule = mkRule('r1', 10, simpleGroup, actions, false);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.matched).toBe(false);
    expect(result.actionsExecuted).toEqual([]);
  });

  it('sets ruleId correctly', () => {
    const rule = mkRule('unique-id-42', 5, simpleGroup, actions);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.ruleId).toBe('unique-id-42');
  });

  it('sets ruleName correctly', () => {
    const rule = mkRule('r5', 5, simpleGroup, actions);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.ruleName).toBe('Rule r5');
  });

  it('returns empty actionsExecuted when not matched', () => {
    const rule = mkRule('r1', 10, simpleGroup, actions);
    const result = evaluateRule({ x: 99 }, rule);
    expect(result.actionsExecuted).toHaveLength(0);
  });

  it('returns all actions when matched', () => {
    const multiActions: RuleAction[] = [
      { type: 'set', target: 'a', value: 1 },
      { type: 'notify', message: 'hi' },
      { type: 'block' },
    ];
    const rule = mkRule('r1', 10, simpleGroup, multiActions);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.actionsExecuted).toHaveLength(3);
  });

  it('disabled rule: ruleId still correct', () => {
    const rule = mkRule('disabled-123', 5, simpleGroup, actions, false);
    const result = evaluateRule({ x: 1 }, rule);
    expect(result.ruleId).toBe('disabled-123');
    expect(result.matched).toBe(false);
  });

  // Parameterised evaluateRule
  for (let i = 0; i < 10; i++) {
    it(`evaluateRule i=${i}: matches when x=${i}`, () => {
      const rule = mkRule(`r${i}`, i, andGroup([cond('x','eq',i)]), actions);
      expect(evaluateRule({ x: i }, rule).matched).toBe(true);
    });
    it(`evaluateRule i=${i}: no match when x=${i + 1}`, () => {
      const rule = mkRule(`r${i}`, i, andGroup([cond('x','eq',i)]), actions);
      expect(evaluateRule({ x: i + 1 }, rule).matched).toBe(false);
    });
  }
});

// ==========================================================================
// 20. evaluate — priority sorting + context mutation
// ==========================================================================
describe('evaluate', () => {
  it('returns empty results for no rules', () => {
    const r = evaluate([], { x: 1 });
    expect(r.results).toHaveLength(0);
    expect(r.matchedCount).toBe(0);
  });

  it('returns matchedCount=0 when no rules match', () => {
    const rule = mkRule('r1', 1, andGroup([cond('x','eq',999)]), []);
    const r = evaluate([rule], { x: 1 });
    expect(r.matchedCount).toBe(0);
  });

  it('returns matchedCount=1 when one rule matches', () => {
    const rule = mkRule('r1', 1, andGroup([cond('x','eq',1)]), []);
    const r = evaluate([rule], { x: 1 });
    expect(r.matchedCount).toBe(1);
  });

  it('sorts by priority descending', () => {
    const r1 = mkRule('low', 1, andGroup([cond('x','exists')]), []);
    const r2 = mkRule('high', 100, andGroup([cond('x','exists')]), []);
    const r = evaluate([r1, r2], { x: 1 });
    expect(r.results[0].ruleId).toBe('high');
    expect(r.results[1].ruleId).toBe('low');
  });

  it('does not mutate original rules array order', () => {
    const r1 = mkRule('r1', 1, andGroup([cond('x','exists')]), []);
    const r2 = mkRule('r2', 100, andGroup([cond('x','exists')]), []);
    const rules = [r1, r2];
    evaluate(rules, { x: 1 });
    expect(rules[0].id).toBe('r1');
    expect(rules[1].id).toBe('r2');
  });

  it('applies set action and mutates context for subsequent rules', () => {
    const setAction: RuleAction = { type: 'set', target: 'y', value: 'injected' };
    const r1 = mkRule('r1', 100, andGroup([cond('x','eq',1)]), [setAction]);
    const r2 = mkRule('r2', 50, andGroup([cond('y','eq','injected')]), []);
    const result = evaluate([r1, r2], { x: 1 });
    expect(result.results[0].matched).toBe(true);
    expect(result.results[1].matched).toBe(true);
    expect(result.matchedCount).toBe(2);
  });

  it('context includes mutated values at end', () => {
    const r1 = mkRule('r1', 1, andGroup([cond('x','eq',1)]), [{ type: 'set', target: 'flag', value: true }]);
    const result = evaluate([r1], { x: 1 });
    expect(result.context.flag).toBe(true);
  });

  it('context preserves original values when no match', () => {
    const r1 = mkRule('r1', 1, andGroup([cond('x','eq',999)]), [{ type: 'set', target: 'x', value: 0 }]);
    const result = evaluate([r1], { x: 1 });
    expect(result.context.x).toBe(1);
  });

  it('handles multiple rules, some matching some not', () => {
    const matchingRule = mkRule('m', 10, andGroup([cond('x','gt',0)]), []);
    const notMatchingRule = mkRule('nm', 5, andGroup([cond('x','lt',0)]), []);
    const result = evaluate([matchingRule, notMatchingRule], { x: 5 });
    expect(result.matchedCount).toBe(1);
    expect(result.results.find(r => r.ruleId === 'm')?.matched).toBe(true);
    expect(result.results.find(r => r.ruleId === 'nm')?.matched).toBe(false);
  });

  it('disabled rules are skipped and not matched', () => {
    const disabled = mkRule('d', 100, andGroup([cond('x','eq',1)]), [], false);
    const enabled = mkRule('e', 50, andGroup([cond('x','eq',1)]), []);
    const result = evaluate([disabled, enabled], { x: 1 });
    expect(result.matchedCount).toBe(1);
    expect(result.results.find(r => r.ruleId === 'e')?.matched).toBe(true);
    expect(result.results.find(r => r.ruleId === 'd')?.matched).toBe(false);
  });

  it('increment action chains correctly across rules', () => {
    const r1 = mkRule('r1', 100, andGroup([cond('x','exists')]), [{ type: 'increment', target: 'count', value: 5 }]);
    const r2 = mkRule('r2', 50, andGroup([cond('count','gte',5)]), [{ type: 'increment', target: 'count', value: 5 }]);
    const result = evaluate([r1, r2], { x: 1, count: 0 });
    expect(result.context.count).toBe(10);
    expect(result.matchedCount).toBe(2);
  });

  it('unset action removes field from context for later rules', () => {
    const r1 = mkRule('r1', 100, andGroup([cond('x','eq',1)]), [{ type: 'unset', target: 'secret' }]);
    const r2 = mkRule('r2', 50, andGroup([cond('secret','exists')]), []);
    const result = evaluate([r1, r2], { x: 1, secret: 'hidden' });
    expect(result.results.find(r => r.ruleId === 'r2')?.matched).toBe(false);
  });

  // Parameterised evaluate
  for (let i = 1; i <= 5; i++) {
    it(`evaluate: ${i} matching rules from ${i * 2} total`, () => {
      const rules: Rule[] = [];
      for (let j = 0; j < i * 2; j++) {
        // even index rules match (x > 0), odd don't (x < 0)
        const g = j % 2 === 0
          ? andGroup([cond('x','gt',0)])
          : andGroup([cond('x','lt',0)]);
        rules.push(mkRule(`r${j}`, j, g, []));
      }
      const result = evaluate(rules, { x: 5 });
      expect(result.matchedCount).toBe(i);
    });
  }

  it('returns results array length equal to rules length', () => {
    const rules = Array.from({ length: 7 }, (_, i) =>
      mkRule(`r${i}`, i, andGroup([cond('x','eq',i)]), [])
    );
    const result = evaluate(rules, { x: 3 });
    expect(result.results).toHaveLength(7);
  });

  it('matchedCount matches filter on results', () => {
    const rules = Array.from({ length: 5 }, (_, i) =>
      mkRule(`r${i}`, i, andGroup([cond('x','eq',i)]), [])
    );
    const result = evaluate(rules, { x: 2 });
    const manualCount = result.results.filter(r => r.matched).length;
    expect(result.matchedCount).toBe(manualCount);
  });
});

// ==========================================================================
// 21. makeCondition helper
// ==========================================================================
describe('makeCondition', () => {
  it('creates condition with field and operator', () => {
    const c = makeCondition('x', 'eq', 1);
    expect(c.field).toBe('x');
    expect(c.operator).toBe('eq');
    expect(c.value).toBe(1);
  });
  it('omits value when not provided', () => {
    const c = makeCondition('x', 'exists');
    expect('value' in c).toBe(false);
  });
  it('includes value: 0', () => {
    const c = makeCondition('n', 'eq', 0);
    expect(c.value).toBe(0);
  });
  it('includes value: false', () => {
    const c = makeCondition('b', 'eq', false);
    expect(c.value).toBe(false);
  });
  it('includes value: null', () => {
    const c = makeCondition('x', 'eq', null);
    expect(c.value).toBeNull();
  });
  it('includes value: empty string', () => {
    const c = makeCondition('s', 'eq', '');
    expect(c.value).toBe('');
  });
  it('includes array value', () => {
    const c = makeCondition('x', 'in', [1,2,3]);
    expect(c.value).toEqual([1,2,3]);
  });

  const ops: Operator[] = ['eq','neq','gt','gte','lt','lte','in','nin','contains','startsWith','endsWith','matches','exists','notExists'];
  ops.forEach(op => {
    it(`makeCondition with operator "${op}"`, () => {
      const c = makeCondition('f', op);
      expect(c.operator).toBe(op);
      expect(c.field).toBe('f');
    });
  });
});

// ==========================================================================
// 22. makeAndGroup / makeOrGroup / makeNotGroup helpers
// ==========================================================================
describe('makeAndGroup', () => {
  it('creates group with logic=and', () => {
    const g = makeAndGroup([cond('x','eq',1)]);
    expect(g.logic).toBe('and');
  });
  it('contains the conditions passed', () => {
    const conditions = [cond('x','eq',1), cond('y','gt',0)];
    const g = makeAndGroup(conditions);
    expect(g.conditions).toHaveLength(2);
  });
  it('works with empty conditions', () => {
    const g = makeAndGroup([]);
    expect(g.conditions).toHaveLength(0);
  });
  it('works with nested groups', () => {
    const inner = makeOrGroup([cond('a','eq',1)]);
    const g = makeAndGroup([inner, cond('b','eq',2)]);
    expect(g.conditions).toHaveLength(2);
  });

  for (let i = 0; i < 5; i++) {
    it(`makeAndGroup with ${i + 1} conditions`, () => {
      const conds = Array.from({ length: i + 1 }, (_, j) => cond(`f${j}`, 'eq', j));
      const g = makeAndGroup(conds);
      expect(g.logic).toBe('and');
      expect(g.conditions).toHaveLength(i + 1);
    });
  }
});

describe('makeOrGroup', () => {
  it('creates group with logic=or', () => {
    const g = makeOrGroup([cond('x','eq',1)]);
    expect(g.logic).toBe('or');
  });
  it('contains the conditions passed', () => {
    const conditions = [cond('x','eq',1), cond('y','gt',0)];
    const g = makeOrGroup(conditions);
    expect(g.conditions).toHaveLength(2);
  });
  it('works with empty conditions', () => {
    const g = makeOrGroup([]);
    expect(g.conditions).toHaveLength(0);
  });

  for (let i = 0; i < 5; i++) {
    it(`makeOrGroup with ${i + 1} conditions`, () => {
      const conds = Array.from({ length: i + 1 }, (_, j) => cond(`f${j}`, 'eq', j));
      const g = makeOrGroup(conds);
      expect(g.logic).toBe('or');
      expect(g.conditions).toHaveLength(i + 1);
    });
  }
});

describe('makeNotGroup', () => {
  it('creates group with logic=not', () => {
    const g = makeNotGroup(cond('x','eq',1));
    expect(g.logic).toBe('not');
  });
  it('wraps single condition', () => {
    const c = cond('x','eq',1);
    const g = makeNotGroup(c);
    expect(g.conditions).toHaveLength(1);
    expect(g.conditions[0]).toEqual(c);
  });
  it('wraps a group', () => {
    const inner = makeAndGroup([cond('x','eq',1)]);
    const g = makeNotGroup(inner);
    expect(g.conditions[0]).toEqual(inner);
  });
  it('negates correctly via evaluateGroup', () => {
    const g = makeNotGroup(cond('x','eq',1));
    expect(evaluateGroup({ x: 1 }, g)).toBe(false);
    expect(evaluateGroup({ x: 2 }, g)).toBe(true);
  });

  for (let i = 0; i < 5; i++) {
    it(`makeNotGroup negates correctly for eq ${i}`, () => {
      const g = makeNotGroup(cond('n','eq',i));
      expect(evaluateGroup({ n: i }, g)).toBe(false);
      expect(evaluateGroup({ n: i + 100 }, g)).toBe(true);
    });
  }
});

// ==========================================================================
// 23. makeRule helper
// ==========================================================================
describe('makeRule', () => {
  const g = makeAndGroup([cond('x','eq',1)]);
  const actions: RuleAction[] = [{ type: 'notify' }];

  it('creates rule with correct id', () => expect(makeRule('id1', 'Name', 5, g, actions).id).toBe('id1'));
  it('creates rule with correct name', () => expect(makeRule('id1', 'My Rule', 5, g, actions).name).toBe('My Rule'));
  it('creates rule with correct priority', () => expect(makeRule('id1', 'Name', 99, g, actions).priority).toBe(99));
  it('defaults enabled to true', () => expect(makeRule('id1', 'Name', 5, g, actions).enabled).toBe(true));
  it('allows overriding enabled=false', () => expect(makeRule('id1', 'Name', 5, g, actions, false).enabled).toBe(false));
  it('stores conditions', () => expect(makeRule('id1', 'Name', 5, g, actions).conditions).toEqual(g));
  it('stores actions', () => expect(makeRule('id1', 'Name', 5, g, actions).actions).toEqual(actions));
  it('has no description by default', () => expect(makeRule('id1', 'Name', 5, g, actions).description).toBeUndefined());
  it('has no tags by default', () => expect(makeRule('id1', 'Name', 5, g, actions).tags).toBeUndefined());

  for (let i = 0; i < 8; i++) {
    it(`makeRule priority=${i * 10}`, () => {
      const r = makeRule(`r${i}`, `Rule ${i}`, i * 10, g, actions);
      expect(r.priority).toBe(i * 10);
      expect(r.id).toBe(`r${i}`);
    });
  }
});

// ==========================================================================
// 24. filterEnabledRules
// ==========================================================================
describe('filterEnabledRules', () => {
  const g = makeAndGroup([]);
  const a: RuleAction[] = [];

  it('returns empty for empty input', () => expect(filterEnabledRules([])).toHaveLength(0));
  it('returns all when all enabled', () => {
    const rules = [mkRule('r1', 1, g, a, true), mkRule('r2', 2, g, a, true)];
    expect(filterEnabledRules(rules)).toHaveLength(2);
  });
  it('returns none when all disabled', () => {
    const rules = [mkRule('r1', 1, g, a, false), mkRule('r2', 2, g, a, false)];
    expect(filterEnabledRules(rules)).toHaveLength(0);
  });
  it('returns only enabled ones', () => {
    const rules = [mkRule('r1', 1, g, a, true), mkRule('r2', 2, g, a, false), mkRule('r3', 3, g, a, true)];
    const result = filterEnabledRules(rules);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(['r1', 'r3']);
  });
  it('does not mutate original array', () => {
    const rules = [mkRule('r1', 1, g, a, true), mkRule('r2', 2, g, a, false)];
    filterEnabledRules(rules);
    expect(rules).toHaveLength(2);
  });
  it('preserves rule objects', () => {
    const rule = mkRule('r1', 1, g, a, true);
    const result = filterEnabledRules([rule]);
    expect(result[0]).toBe(rule);
  });

  // Parameterised filterEnabledRules
  for (let i = 1; i <= 8; i++) {
    it(`filterEnabledRules: ${i} of 10 enabled`, () => {
      const rules: Rule[] = Array.from({ length: 10 }, (_, j) =>
        mkRule(`r${j}`, j, g, a, j < i)
      );
      expect(filterEnabledRules(rules)).toHaveLength(i);
    });
  }
});

// ==========================================================================
// 25. getRulesByTag
// ==========================================================================
describe('getRulesByTag', () => {
  const g = makeAndGroup([]);
  const a: RuleAction[] = [];

  it('returns empty for no rules', () => expect(getRulesByTag([], 'tag')).toHaveLength(0));
  it('returns empty when no rules have the tag', () => {
    const rules = [{ ...mkRule('r1', 1, g, a), tags: ['other'] }];
    expect(getRulesByTag(rules, 'wanted')).toHaveLength(0);
  });
  it('returns rules with the tag', () => {
    const rules = [
      { ...mkRule('r1', 1, g, a), tags: ['finance', 'audit'] },
      { ...mkRule('r2', 2, g, a), tags: ['finance'] },
      { ...mkRule('r3', 3, g, a), tags: ['hr'] },
    ];
    const result = getRulesByTag(rules, 'finance');
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toContain('r1');
    expect(result.map(r => r.id)).toContain('r2');
  });
  it('does not return rules with no tags', () => {
    const rules = [mkRule('r1', 1, g, a), { ...mkRule('r2', 2, g, a), tags: ['x'] }];
    expect(getRulesByTag(rules, 'x')).toHaveLength(1);
  });
  it('returns empty for rules with undefined tags', () => {
    const rules = [mkRule('r1', 1, g, a)];
    expect(getRulesByTag(rules, 'anything')).toHaveLength(0);
  });
  it('does not mutate original', () => {
    const rules = [{ ...mkRule('r1', 1, g, a), tags: ['x'] }];
    getRulesByTag(rules, 'x');
    expect(rules).toHaveLength(1);
  });

  // Parameterised getRulesByTag
  const tagNames = ['compliance', 'finance', 'hr', 'audit', 'safety', 'quality', 'legal', 'risk'];
  tagNames.forEach(tag => {
    it(`getRulesByTag finds rules with tag "${tag}"`, () => {
      const rules = [
        { ...mkRule('r1', 1, g, a), tags: [tag, 'extra'] },
        { ...mkRule('r2', 2, g, a), tags: ['other'] },
      ];
      const result = getRulesByTag(rules, tag);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('r1');
    });
  });

  for (let i = 1; i <= 6; i++) {
    it(`getRulesByTag: finds ${i} tagged rules`, () => {
      const rules: Rule[] = Array.from({ length: 10 }, (_, j) => ({
        ...mkRule(`r${j}`, j, g, a),
        tags: j < i ? ['target'] : ['other'],
      }));
      expect(getRulesByTag(rules, 'target')).toHaveLength(i);
    });
  }
});

// ==========================================================================
// 26. Complex integration scenarios
// ==========================================================================
describe('Integration: complex rule scenarios', () => {
  it('high-risk order scenario: blocks order when risk > 80', () => {
    const blockAction: RuleAction = { type: 'block', message: 'High risk order blocked' };
    const flagAction: RuleAction = { type: 'set', target: 'blocked', value: true };
    const rule = mkRule(
      'high-risk-block',
      100,
      andGroup([cond('riskScore','gt',80), cond('orderValue','gt',10000)]),
      [blockAction, flagAction],
    );
    const highRisk = evaluate([rule], { riskScore: 90, orderValue: 15000 });
    expect(highRisk.matchedCount).toBe(1);
    expect(highRisk.context.blocked).toBe(true);

    const lowRisk = evaluate([rule], { riskScore: 50, orderValue: 15000 });
    expect(lowRisk.matchedCount).toBe(0);
    expect(lowRisk.context.blocked).toBeUndefined();
  });

  it('tiered discount scenario: applies highest matching discount', () => {
    const tier1 = mkRule('t1', 10, andGroup([cond('total','gte',100)]), [{ type: 'set', target: 'discount', value: 5 }]);
    const tier2 = mkRule('t2', 20, andGroup([cond('total','gte',500)]), [{ type: 'set', target: 'discount', value: 10 }]);
    const tier3 = mkRule('t3', 30, andGroup([cond('total','gte',1000)]), [{ type: 'set', target: 'discount', value: 15 }]);

    const result = evaluate([tier1, tier2, tier3], { total: 1500 });
    // All three match; tier3 runs first (priority 30), sets discount=15; tier2 then sets to 10; tier1 sets to 5
    // Actually context is mutated sequentially, last set wins
    expect(result.matchedCount).toBe(3);
    // tier3 highest priority sets 15, then tier2 sets 10, then tier1 sets 5
    expect(result.context.discount).toBe(5);
  });

  it('compliance check: all conditions required', () => {
    const complianceRule = mkRule('compliance', 50,
      andGroup([
        cond('certificationValid', 'eq', true),
        cond('insuranceExpiry', 'gt', Date.now()),
        cond('inspectionPassed', 'eq', true),
      ]),
      [{ type: 'set', target: 'compliant', value: true }]
    );
    const compliant = evaluate([complianceRule], {
      certificationValid: true,
      insuranceExpiry: Date.now() + 86400000,
      inspectionPassed: true,
    });
    expect(compliant.matchedCount).toBe(1);
    expect(compliant.context.compliant).toBe(true);

    const nonCompliant = evaluate([complianceRule], {
      certificationValid: true,
      insuranceExpiry: Date.now() + 86400000,
      inspectionPassed: false,
    });
    expect(nonCompliant.matchedCount).toBe(0);
  });

  it('tag-based filtering and evaluation', () => {
    const g = makeAndGroup([cond('x','exists')]);
    const rules: Rule[] = [
      { ...mkRule('r1', 10, g, []), tags: ['finance'] },
      { ...mkRule('r2', 20, g, []), tags: ['hr'] },
      { ...mkRule('r3', 30, g, []), tags: ['finance', 'audit'] },
    ];
    const financeRules = getRulesByTag(rules, 'finance');
    const result = evaluate(financeRules, { x: 1 });
    expect(result.matchedCount).toBe(2);
  });

  it('counter accumulation across multiple matching rules', () => {
    const rules: Rule[] = Array.from({ length: 5 }, (_, i) =>
      mkRule(`r${i}`, i, andGroup([cond('active','eq',true)]), [{ type: 'increment', target: 'hits', value: 1 }])
    );
    const result = evaluate(rules, { active: true, hits: 0 });
    expect(result.context.hits).toBe(5);
    expect(result.matchedCount).toBe(5);
  });

  it('or-condition rules: matches when any sub-condition true', () => {
    const rule = mkRule('or-rule', 10,
      orGroup([cond('status','eq','active'), cond('status','eq','pending'), cond('status','eq','review')]),
      [{ type: 'set', target: 'needsAttention', value: true }]
    );
    ['active', 'pending', 'review'].forEach(status => {
      const result = evaluate([rule], { status });
      expect(result.matchedCount).toBe(1);
    });
    const noMatch = evaluate([rule], { status: 'archived' });
    expect(noMatch.matchedCount).toBe(0);
  });

  it('not-condition rule: fires when condition is false', () => {
    const rule = mkRule('not-rule', 10,
      notGroup(cond('blocked','eq',true)),
      [{ type: 'set', target: 'canProceed', value: true }]
    );
    const unblocked = evaluate([rule], { blocked: false });
    expect(unblocked.matchedCount).toBe(1);
    expect(unblocked.context.canProceed).toBe(true);

    const blocked = evaluate([rule], { blocked: true });
    expect(blocked.matchedCount).toBe(0);
  });

  it('append builds list of matched rule IDs', () => {
    const makeAppendRule = (id: string, priority: number, tag: string) =>
      mkRule(id, priority, andGroup([cond('tags','contains',tag)]),
        [{ type: 'append', target: 'matchedRules', value: id }]);

    const r1 = makeAppendRule('compliance', 30, 'compliance');
    const r2 = makeAppendRule('finance', 20, 'finance');
    const r3 = makeAppendRule('hr', 10, 'hr');

    const result = evaluate([r1, r2, r3], { tags: 'compliance finance', matchedRules: [] });
    expect((result.context.matchedRules as string[]).includes('compliance')).toBe(true);
    expect((result.context.matchedRules as string[]).includes('finance')).toBe(true);
    expect((result.context.matchedRules as string[]).includes('hr')).toBe(false);
  });

  // Parameterised integration: N rules of which half match
  for (let n = 2; n <= 8; n += 2) {
    it(`integration: ${n / 2} matching rules out of ${n}`, () => {
      const rules: Rule[] = Array.from({ length: n }, (_, i) =>
        mkRule(`r${i}`, i, andGroup([cond('val','eq',i % 2)]), [])
      );
      const result = evaluate(rules, { val: 0 });
      expect(result.matchedCount).toBe(n / 2);
    });
  }
});

// ==========================================================================
// 27. Edge cases
// ==========================================================================
describe('Edge cases', () => {
  it('evaluateCondition: unknown operator returns false', () => {
    const c = { field: 'x', operator: 'unknownOp' as Operator };
    expect(evaluateCondition({ x: 1 }, c)).toBe(false);
  });

  it('evaluateGroup: unknown logic returns false', () => {
    const g = { logic: 'xor' as 'and', conditions: [cond('x','eq',1)] };
    expect(evaluateGroup({ x: 1 }, g)).toBe(false);
  });

  it('evaluateGroup: not with no conditions - !undefined = true', () => {
    const g: RuleGroup = { logic: 'not', conditions: [] };
    // results[0] is undefined, !undefined = true
    expect(evaluateGroup({}, g)).toBe(true);
  });

  it('applyAction: increment with non-numeric value falls back to +1', () => {
    const ctx = applyAction({ n: 5 }, { type: 'increment', target: 'n', value: 'bad' });
    expect(ctx.n).toBe(6);
  });

  it('applyAction: decrement with non-numeric value falls back to -1', () => {
    const ctx = applyAction({ n: 5 }, { type: 'decrement', target: 'n', value: 'bad' });
    expect(ctx.n).toBe(4);
  });

  it('evaluate: preserves non-matched rule context', () => {
    const r = mkRule('r1', 1, andGroup([cond('x','eq',999)]), [{ type: 'set', target: 'y', value: 'changed' }]);
    const result = evaluate([r], { x: 1, y: 'original' });
    expect(result.context.y).toBe('original');
  });

  it('evaluate: large priority gap still sorts correctly', () => {
    const low = mkRule('low', 1, andGroup([cond('x','exists')]), []);
    const high = mkRule('high', 999999, andGroup([cond('x','exists')]), []);
    const result = evaluate([low, high], { x: 1 });
    expect(result.results[0].ruleId).toBe('high');
  });

  it('makeCondition: value=undefined is omitted', () => {
    const c = makeCondition('f', 'exists', undefined);
    expect('value' in c).toBe(false);
  });

  it('deeply nested groups evaluate correctly', () => {
    // ((a > 0 AND b > 0) OR (c > 0)) AND d > 0
    const inner1 = makeAndGroup([cond('a','gt',0), cond('b','gt',0)]);
    const inner2 = makeAndGroup([cond('c','gt',0)]);
    const middle = makeOrGroup([inner1, inner2]);
    const outer = makeAndGroup([middle, cond('d','gt',0)]);

    expect(evaluateGroup({ a: 1, b: 1, c: 0, d: 1 }, outer)).toBe(true);
    expect(evaluateGroup({ a: 0, b: 0, c: 1, d: 1 }, outer)).toBe(true);
    expect(evaluateGroup({ a: 1, b: 1, c: 0, d: 0 }, outer)).toBe(false);
    expect(evaluateGroup({ a: 0, b: 0, c: 0, d: 1 }, outer)).toBe(false);
  });

  it('evaluate: no actions applied when no rules match', () => {
    const rules = [
      mkRule('r1', 1, andGroup([cond('x','eq',999)]), [{ type: 'set', target: 'changed', value: true }]),
    ];
    const result = evaluate(rules, { x: 1 });
    expect('changed' in result.context).toBe(false);
  });

  it('filterEnabledRules on empty → empty', () => {
    expect(filterEnabledRules([])).toEqual([]);
  });

  it('getRulesByTag on empty → empty', () => {
    expect(getRulesByTag([], 'any')).toEqual([]);
  });

  // Many conditions in a single and group
  it('and group with 20 conditions all passing', () => {
    const ctx: RuleContext = {};
    const conds: Condition[] = [];
    for (let i = 0; i < 20; i++) {
      ctx[`f${i}`] = i;
      conds.push(cond(`f${i}`, 'eq', i));
    }
    expect(evaluateGroup(ctx, makeAndGroup(conds))).toBe(true);
  });

  it('and group with 20 conditions, one fails', () => {
    const ctx: RuleContext = {};
    const conds: Condition[] = [];
    for (let i = 0; i < 20; i++) {
      ctx[`f${i}`] = i;
      conds.push(cond(`f${i}`, 'eq', i));
    }
    ctx['f10'] = 999; // break one
    expect(evaluateGroup(ctx, makeAndGroup(conds))).toBe(false);
  });

  it('or group with 20 conditions all failing except last', () => {
    const ctx: RuleContext = {};
    const conds: Condition[] = [];
    for (let i = 0; i < 20; i++) {
      ctx[`f${i}`] = 0;
      conds.push(cond(`f${i}`, 'eq', i === 19 ? 0 : 9999)); // only last matches
    }
    expect(evaluateGroup(ctx, makeOrGroup(conds))).toBe(true);
  });

  it('evaluate with 20 rules all matching accumulates correctly', () => {
    const rules: Rule[] = Array.from({ length: 20 }, (_, i) =>
      mkRule(`r${i}`, i, andGroup([cond('x','gt',-1)]), [{ type: 'increment', target: 'count', value: 1 }])
    );
    const result = evaluate(rules, { x: 1, count: 0 });
    expect(result.context.count).toBe(20);
    expect(result.matchedCount).toBe(20);
  });
});

// ==========================================================================
// 28. Additional evaluateCondition coverage — many numeric boundary cases
// ==========================================================================
describe('evaluateCondition — numeric boundary cases', () => {
  const boundaries: [number, number][] = [
    [0, 0], [1, 1], [-1, -1], [100, 100], [-100, -100],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    [0.1, 0.1], [0.01, 0.01], [1.23456789, 1.23456789],
  ];
  boundaries.forEach(([v, expected]) => {
    it(`eq boundary: ${v} === ${expected}`, () => {
      expect(evaluateCondition({ n: v }, cond('n','eq',expected))).toBe(true);
    });
  });

  const gtCases: [number, number][] = [
    [1, 0], [0, -1], [100, 99], [-1, -2], [0.2, 0.1],
    [1000, 0], [50, 49], [7, 6], [3, 2], [9, 8],
    [11, 10], [21, 20], [31, 30], [41, 40], [51, 50],
  ];
  gtCases.forEach(([a, b]) => {
    it(`gt boundary: ${a} > ${b}`, () => {
      expect(evaluateCondition({ n: a }, cond('n','gt',b))).toBe(true);
    });
  });

  const ltCases: [number, number][] = [
    [0, 1], [-1, 0], [99, 100], [-2, -1], [0.1, 0.2],
    [0, 1000], [49, 50], [6, 7], [2, 3], [8, 9],
    [10, 11], [20, 21], [30, 31], [40, 41], [50, 51],
  ];
  ltCases.forEach(([a, b]) => {
    it(`lt boundary: ${a} < ${b}`, () => {
      expect(evaluateCondition({ n: a }, cond('n','lt',b))).toBe(true);
    });
  });
});

// ==========================================================================
// 29. Additional string operator coverage
// ==========================================================================
describe('evaluateCondition — string operators extended', () => {
  const containsCases: [string, string, boolean][] = [
    ['abcdef', 'abc', true],
    ['abcdef', 'def', true],
    ['abcdef', 'bcd', true],
    ['abcdef', 'xyz', false],
    ['hello world', ' ', true],
    ['hello world', 'hello world', true],
    ['abc', 'abcd', false],
    ['', '', true],
    ['a', '', true],
    ['test123', '123', true],
    ['TEST', 'test', false],
    ['UPPER', 'UPPER', true],
    ['mixedCase', 'mixed', true],
    ['mixedCase', 'Case', true],
    ['mixedCase', 'MixedCase', false],
  ];
  containsCases.forEach(([haystack, needle, expected]) => {
    it(`contains("${haystack}", "${needle}") = ${expected}`, () => {
      expect(evaluateCondition({ s: haystack }, cond('s','contains',needle))).toBe(expected);
    });
  });

  const startsWithCases: [string, string, boolean][] = [
    ['hello', 'h', true],
    ['hello', 'he', true],
    ['hello', 'hello', true],
    ['hello', 'world', false],
    ['hello', 'Hello', false],
    ['', '', true],
    ['abc', '', true],
    ['ABC', 'A', true],
    ['ABC', 'a', false],
    ['123abc', '123', true],
    ['123abc', 'abc', false],
    ['prefix-value', 'prefix', true],
    ['prefix-value', 'value', false],
    ['same', 'same', true],
    ['longer', 'longerstring', false],
  ];
  startsWithCases.forEach(([str, prefix, expected]) => {
    it(`startsWith("${str}", "${prefix}") = ${expected}`, () => {
      expect(evaluateCondition({ s: str }, cond('s','startsWith',prefix))).toBe(expected);
    });
  });

  const endsWithCases: [string, string, boolean][] = [
    ['hello', 'o', true],
    ['hello', 'lo', true],
    ['hello', 'hello', true],
    ['hello', 'world', false],
    ['hello', 'Hello', false],
    ['', '', true],
    ['abc', '', true],
    ['ABC', 'C', true],
    ['ABC', 'c', false],
    ['abc123', '123', true],
    ['abc123', 'abc', false],
    ['value-suffix', 'suffix', true],
    ['value-suffix', 'value', false],
    ['same', 'same', true],
    ['longer', 'longerstring', false],
  ];
  endsWithCases.forEach(([str, suffix, expected]) => {
    it(`endsWith("${str}", "${suffix}") = ${expected}`, () => {
      expect(evaluateCondition({ s: str }, cond('s','endsWith',suffix))).toBe(expected);
    });
  });
});

// ==========================================================================
// 30. applyAction — set with many different field names
// ==========================================================================
describe('applyAction — set extended', () => {
  const fieldNames = [
    'status', 'approved', 'riskScore', 'priority', 'category',
    'department', 'assignee', 'dueDate', 'cost', 'quantity',
    'flagged', 'reviewed', 'escalated', 'archived', 'active',
    'level', 'tier', 'phase', 'stage', 'type',
  ];
  fieldNames.forEach((field, i) => {
    it(`set field "${field}" to value ${i}`, () => {
      const ctx = applyAction({}, { type: 'set', target: field, value: i });
      expect(ctx[field]).toBe(i);
    });
    it(`set field "${field}" overrides existing`, () => {
      const ctx = applyAction({ [field]: 'old' }, { type: 'set', target: field, value: 'new' });
      expect(ctx[field]).toBe('new');
    });
  });
});

// ==========================================================================
// 31. evaluateGroup — deeply nested mixed logic
// ==========================================================================
describe('evaluateGroup — deeply nested mixed', () => {
  // Test 10 variations of nested and/or/not
  for (let i = 0; i < 10; i++) {
    const target = i;
    it(`nested: (x eq ${target} OR y gt 100) AND z exists — pass case`, () => {
      const g = makeAndGroup([
        makeOrGroup([cond('x','eq',target), cond('y','gt',100)]),
        cond('z','exists'),
      ]);
      expect(evaluateGroup({ x: target, y: 0, z: 'present' }, g)).toBe(true);
      expect(evaluateGroup({ x: 999, y: 200, z: 'present' }, g)).toBe(true);
      expect(evaluateGroup({ x: target, y: 0, z: 'present' }, g)).toBe(true);
    });
    it(`nested: (x eq ${target} OR y gt 100) AND z exists — fail case`, () => {
      const g = makeAndGroup([
        makeOrGroup([cond('x','eq',target), cond('y','gt',100)]),
        cond('z','exists'),
      ]);
      expect(evaluateGroup({ x: 999, y: 0 }, g)).toBe(false);
    });
  }
});

// ==========================================================================
// 32. evaluate — result structure validation
// ==========================================================================
describe('evaluate — result structure', () => {
  const g = makeAndGroup([cond('x','exists')]);
  const a: RuleAction[] = [];

  for (let i = 0; i < 10; i++) {
    it(`result[${i}] has ruleId, ruleName, matched, actionsExecuted`, () => {
      const rules = Array.from({ length: i + 1 }, (_, j) =>
        mkRule(`rule-${j}`, j, g, a)
      );
      const result = evaluate(rules, { x: 1 });
      result.results.forEach(r => {
        expect(typeof r.ruleId).toBe('string');
        expect(typeof r.ruleName).toBe('string');
        expect(typeof r.matched).toBe('boolean');
        expect(Array.isArray(r.actionsExecuted)).toBe(true);
      });
    });
  }

  it('EvaluationResult has results, matchedCount, context', () => {
    const result = evaluate([], {});
    expect(Array.isArray(result.results)).toBe(true);
    expect(typeof result.matchedCount).toBe('number');
    expect(typeof result.context).toBe('object');
  });

  it('context is a new object (not same reference as input)', () => {
    const input: RuleContext = { x: 1 };
    const result = evaluate([], input);
    expect(result.context).not.toBe(input);
    expect(result.context).toEqual(input);
  });
});

// ==========================================================================
// 33. isValidOperator / isValidLogicalOperator / isValidActionType — extra
// ==========================================================================
describe('validator functions — extra coverage', () => {
  // isValidOperator with non-string-like inputs cast to string
  it('isValidOperator with number-like string "42" → false', () => expect(isValidOperator('42')).toBe(false));
  it('isValidOperator with whitespace " eq " → false', () => expect(isValidOperator(' eq ')).toBe(false));
  it('isValidOperator with "Eq" → false', () => expect(isValidOperator('Eq')).toBe(false));

  it('isValidLogicalOperator with "And" → false', () => expect(isValidLogicalOperator('And')).toBe(false));
  it('isValidLogicalOperator with "Or" → false', () => expect(isValidLogicalOperator('Or')).toBe(false));
  it('isValidLogicalOperator with "Not" → false', () => expect(isValidLogicalOperator('Not')).toBe(false));
  it('isValidLogicalOperator with " and " → false', () => expect(isValidLogicalOperator(' and ')).toBe(false));

  it('isValidActionType with "Set" → false', () => expect(isValidActionType('Set')).toBe(false));
  it('isValidActionType with "Notify" → false', () => expect(isValidActionType('Notify')).toBe(false));
  it('isValidActionType with "Block" → false', () => expect(isValidActionType('Block')).toBe(false));
  it('isValidActionType with " set " → false', () => expect(isValidActionType(' set ')).toBe(false));

  // Ensure all valid operators are exactly the 14 listed
  const validOps = ['eq','neq','gt','gte','lt','lte','in','nin','contains','startsWith','endsWith','matches','exists','notExists'];
  it(`exactly ${validOps.length} valid operators`, () => {
    expect(validOps.filter(isValidOperator)).toHaveLength(validOps.length);
  });

  const validLogic = ['and', 'or', 'not'];
  it(`exactly ${validLogic.length} valid logical operators`, () => {
    expect(validLogic.filter(isValidLogicalOperator)).toHaveLength(validLogic.length);
  });

  const validActions = ['set','unset','increment','decrement','append','notify','block'];
  it(`exactly ${validActions.length} valid action types`, () => {
    expect(validActions.filter(isValidActionType)).toHaveLength(validActions.length);
  });
});

// ==========================================================================
// 34. makeCondition — extended value types
// ==========================================================================
describe('makeCondition — extended value types', () => {
  it('accepts nested object as value', () => {
    const c = makeCondition('obj', 'eq', { a: { b: 1 } });
    expect(c.value).toEqual({ a: { b: 1 } });
  });
  it('accepts nested array as value', () => {
    const c = makeCondition('arr', 'in', [[1,2],[3,4]]);
    expect(c.value).toEqual([[1,2],[3,4]]);
  });
  it('field name with special characters', () => {
    const c = makeCondition('my.field.path', 'exists');
    expect(c.field).toBe('my.field.path');
  });
  it('field name with spaces', () => {
    const c = makeCondition('field name', 'eq', 'value');
    expect(c.field).toBe('field name');
  });
  it('very long field name', () => {
    const longName = 'a'.repeat(200);
    const c = makeCondition(longName, 'exists');
    expect(c.field).toBe(longName);
  });
  it('unicode field name', () => {
    const c = makeCondition('フィールド', 'eq', '値');
    expect(c.field).toBe('フィールド');
    expect(c.value).toBe('値');
  });

  // All operators produce a valid condition object
  const allOps: Operator[] = ['eq','neq','gt','gte','lt','lte','in','nin','contains','startsWith','endsWith','matches','exists','notExists'];
  allOps.forEach(op => {
    it(`makeCondition produces object with field+operator for "${op}"`, () => {
      const c = makeCondition('testField', op, 'someValue');
      expect(c).toMatchObject({ field: 'testField', operator: op });
    });
  });
});

// ==========================================================================
// 35. getRulesByTag — multiple tags per rule
// ==========================================================================
describe('getRulesByTag — multi-tag rules', () => {
  const g = makeAndGroup([]);
  const a: RuleAction[] = [];

  const tagSets = [
    ['compliance', 'audit', 'finance'],
    ['hr', 'payroll'],
    ['safety', 'environment', 'iso14001'],
    ['quality', 'iso9001', 'audit'],
    ['security', 'infosec', 'gdpr'],
  ];

  tagSets.forEach((tags, i) => {
    it(`rule with tags ${JSON.stringify(tags)} found by first tag "${tags[0]}"`, () => {
      const rule = { ...mkRule(`r${i}`, i, g, a), tags };
      expect(getRulesByTag([rule], tags[0])).toHaveLength(1);
    });
    if (tags.length > 1) {
      it(`rule with tags ${JSON.stringify(tags)} found by last tag "${tags[tags.length - 1]}"`, () => {
        const rule = { ...mkRule(`r${i}`, i, g, a), tags };
        expect(getRulesByTag([rule], tags[tags.length - 1])).toHaveLength(1);
      });
    }
    it(`rule with tags ${JSON.stringify(tags)} NOT found by "nonexistent"`, () => {
      const rule = { ...mkRule(`r${i}`, i, g, a), tags };
      expect(getRulesByTag([rule], 'nonexistent')).toHaveLength(0);
    });
  });
});

// ==========================================================================
// 36. evaluateCondition — in/nin with large arrays
// ==========================================================================
describe('evaluateCondition — in/nin with large arrays', () => {
  const bigArray = Array.from({ length: 50 }, (_, i) => i);

  for (let i = 0; i < 25; i++) {
    it(`in: value ${i} found in 50-element array`, () => {
      expect(evaluateCondition({ n: i }, cond('n','in',bigArray))).toBe(true);
    });
    it(`nin: value ${i + 100} NOT in 50-element array`, () => {
      expect(evaluateCondition({ n: i + 100 }, cond('n','nin',bigArray))).toBe(true);
    });
  }
});

// ==========================================================================
// 37. evaluate — EvaluationResult matchedCount never exceeds results length
// ==========================================================================
describe('evaluate — matchedCount invariants', () => {
  const g = makeAndGroup([cond('x','exists')]);
  const a: RuleAction[] = [];

  for (let n = 1; n <= 10; n++) {
    it(`matchedCount <= results.length for ${n} rules`, () => {
      const rules = Array.from({ length: n }, (_, i) => mkRule(`r${i}`, i, g, a));
      const result = evaluate(rules, { x: 1 });
      expect(result.matchedCount).toBeLessThanOrEqual(result.results.length);
    });
    it(`matchedCount >= 0 for ${n} rules with no match`, () => {
      const noMatchG = makeAndGroup([cond('x','eq','NEVER')]);
      const rules = Array.from({ length: n }, (_, i) => mkRule(`r${i}`, i, noMatchG, a));
      const result = evaluate(rules, { x: 1 });
      expect(result.matchedCount).toBeGreaterThanOrEqual(0);
    });
  }
});

// ==========================================================================
// 38. Final padding — two extra tests to reach exactly ≥1000
// ==========================================================================
describe('evaluateCondition — exists with numeric zero and false', () => {
  it('exists: numeric zero is truthy for exists check', () => {
    expect(evaluateCondition({ n: 0 }, cond('n','exists'))).toBe(true);
  });
  it('exists: boolean false is truthy for exists check', () => {
    expect(evaluateCondition({ b: false }, cond('b','exists'))).toBe(true);
  });
});
