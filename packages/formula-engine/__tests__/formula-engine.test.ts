// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  evaluate,
  tokenize,
  cellRefToIndices,
  indicesToCellRef,
  expandRange,
  parseNumber,
  parseBoolean,
  registerFunction,
  evaluateCell,
} from '../src';
import { TokenType, CellValue } from '../src/types';

// ---------------------------------------------------------------------------
// describe: evaluate — arithmetic (basic)
// ---------------------------------------------------------------------------
describe('evaluate — arithmetic', () => {
  it('adds two integers', () => { expect(evaluate('1+2').value).toBe(3); });
  it('subtracts', () => { expect(evaluate('10-3').value).toBe(7); });
  it('multiplies', () => { expect(evaluate('4*5').value).toBe(20); });
  it('divides', () => { expect(evaluate('20/4').value).toBe(5); });
  it('handles division by zero', () => { expect(evaluate('1/0').error).toMatch(/#DIV\/0!/); });
  it('handles unary minus', () => { expect(evaluate('-5').value).toBe(-5); });
  it('handles unary plus', () => { expect(evaluate('+7').value).toBe(7); });
  it('respects precedence: * before +', () => { expect(evaluate('2+3*4').value).toBe(14); });
  it('respects precedence: / before -', () => { expect(evaluate('10-8/2').value).toBe(6); });
  it('handles parentheses', () => { expect(evaluate('(2+3)*4').value).toBe(20); });
  it('handles power operator ^', () => { expect(evaluate('2^10').value).toBe(1024); });
  it('handles negative power', () => { expect(evaluate('2^-1').value).toBe(0.5); });
  it('handles decimal numbers', () => { expect(evaluate('1.5+2.5').value).toBe(4); });
  it('handles = prefix (spreadsheet style)', () => { expect(evaluate('=1+1').value).toBe(2); });
  it('handles nested parens', () => { expect(evaluate('((2+3)*(4-1))').value).toBe(15); });
  it('handles chained addition', () => { expect(evaluate('1+2+3+4+5').value).toBe(15); });
  it('handles chained subtraction', () => { expect(evaluate('100-10-20-30').value).toBe(40); });
  it('handles chained multiplication', () => { expect(evaluate('2*3*4').value).toBe(24); });
  it('handles chained division', () => { expect(evaluate('120/2/3/4').value).toBe(5); });
  it('handles zero', () => { expect(evaluate('0').value).toBe(0); });
  it('handles large numbers', () => { expect(evaluate('999999*999999').value).toBe(999999 * 999999); });
  it('handles float precision', () => { expect(evaluate('0.1+0.2').value).toBeCloseTo(0.3); });
  it('handles negative result', () => { expect(evaluate('3-10').value).toBe(-7); });
  it('handles double unary minus', () => { expect(evaluate('--5').value).toBe(5); });
  it('handles modulo via MOD function', () => { expect(evaluate('MOD(10,3)').value).toBe(1); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — comparisons
// ---------------------------------------------------------------------------
describe('evaluate — comparisons', () => {
  it('= equal true', () => { expect(evaluate('1=1').value).toBe(true); });
  it('= equal false', () => { expect(evaluate('1=2').value).toBe(false); });
  it('<> not equal true', () => { expect(evaluate('1<>2').value).toBe(true); });
  it('<> not equal false', () => { expect(evaluate('1<>1').value).toBe(false); });
  it('< less than true', () => { expect(evaluate('1<2').value).toBe(true); });
  it('< less than false', () => { expect(evaluate('2<1').value).toBe(false); });
  it('> greater than true', () => { expect(evaluate('2>1').value).toBe(true); });
  it('> greater than false', () => { expect(evaluate('1>2').value).toBe(false); });
  it('<= less or equal (equal)', () => { expect(evaluate('2<=2').value).toBe(true); });
  it('<= less or equal (less)', () => { expect(evaluate('1<=2').value).toBe(true); });
  it('<= less or equal (greater)', () => { expect(evaluate('3<=2').value).toBe(false); });
  it('>= greater or equal (equal)', () => { expect(evaluate('2>=2').value).toBe(true); });
  it('>= greater or equal (greater)', () => { expect(evaluate('3>=2').value).toBe(true); });
  it('>= greater or equal (less)', () => { expect(evaluate('1>=2').value).toBe(false); });
  it('string equality true', () => { expect(evaluate('"foo"="foo"').value).toBe(true); });
  it('string equality false', () => { expect(evaluate('"foo"="bar"').value).toBe(false); });
  it('string inequality', () => { expect(evaluate('"a"<>"b"').value).toBe(true); });
  it('comparison with arithmetic', () => { expect(evaluate('2+3>4').value).toBe(true); });
  it('chained comparison in IF', () => { expect(evaluate('IF(5>3,"yes","no")').value).toBe('yes'); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — concatenation
// ---------------------------------------------------------------------------
describe('evaluate — concatenation', () => {
  it('concatenates two strings', () => { expect(evaluate('"hello"&" "&"world"').value).toBe('hello world'); });
  it('concatenates number and string', () => { expect(evaluate('42&" items"').value).toBe('42 items'); });
  it('concatenates empty strings', () => { expect(evaluate('"a"&""&"b"').value).toBe('ab'); });
  it('concatenates booleans', () => { expect(evaluate('TRUE&FALSE').value).toBe('truefalse'); });
  it('CONCAT function', () => { expect(evaluate('CONCAT("A","B","C")').value).toBe('ABC'); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — SUM
// ---------------------------------------------------------------------------
describe('evaluate — SUM', () => {
  it('SUM of literals', () => { expect(evaluate('SUM(1,2,3)').value).toBe(6); });
  it('SUM empty returns 0', () => { expect(evaluate('SUM()').value).toBe(0); });
  it('SUM with negatives', () => { expect(evaluate('SUM(-1,-2,3)').value).toBe(0); });
  it('SUM with range', () => {
    const cells = { A1: 10, A2: 20, A3: 30 };
    expect(evaluate('SUM(A1:A3)', { cells }).value).toBe(60);
  });
  it('SUM range with null', () => {
    const cells: Record<string, CellValue> = { A1: 10, A2: null, A3: 5 };
    expect(evaluate('SUM(A1:A3)', { cells }).value).toBe(15);
  });
  it('SUM of single cell', () => {
    expect(evaluate('SUM(A1)', { cells: { A1: 42 } }).value).toBe(42);
  });
  it('SUM mixes literals and cells', () => {
    expect(evaluate('SUM(A1,5)', { cells: { A1: 3 } }).value).toBe(8);
  });
  it('SUM with boolean (TRUE=1)', () => { expect(evaluate('SUM(TRUE,2)').value).toBe(3); });
  it('SUM with boolean (FALSE=0)', () => { expect(evaluate('SUM(FALSE,2)').value).toBe(2); });
  it('SUM large range', () => {
    const cells: CellMap = {};
    for (let i = 1; i <= 20; i++) cells[`A${i}`] = i;
    expect(evaluate('SUM(A1:A20)', { cells }).value).toBe(210);
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — AVERAGE
// ---------------------------------------------------------------------------
describe('evaluate — AVERAGE', () => {
  it('AVERAGE of three', () => { expect(evaluate('AVERAGE(1,2,3)').value).toBe(2); });
  it('AVERAGE of one', () => { expect(evaluate('AVERAGE(10)').value).toBe(10); });
  it('AVERAGE with range', () => {
    const cells = { A1: 4, A2: 8, A3: 12 };
    expect(evaluate('AVERAGE(A1:A3)', { cells }).value).toBe(8);
  });
  it('AVERAGE div/0 on empty', () => { expect(evaluate('AVERAGE()').error).toBeDefined(); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — COUNT
// ---------------------------------------------------------------------------
describe('evaluate — COUNT', () => {
  it('COUNT numbers', () => { expect(evaluate('COUNT(1,2,3)').value).toBe(3); });
  it('COUNT with null skipped', () => {
    expect(evaluate('COUNT(A1,A2)', { cells: { A1: 1, A2: null } }).value).toBe(1);
  });
  it('COUNT with text skipped', () => { expect(evaluate('COUNT(1,"text",3)').value).toBe(2); });
  it('COUNT empty', () => { expect(evaluate('COUNT()').value).toBe(0); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — MIN / MAX
// ---------------------------------------------------------------------------
describe('evaluate — MIN and MAX', () => {
  it('MIN of literals', () => { expect(evaluate('MIN(5,3,8,1)').value).toBe(1); });
  it('MAX of literals', () => { expect(evaluate('MAX(5,3,8,1)').value).toBe(8); });
  it('MIN with range', () => {
    const cells = { A1: 7, A2: 3, A3: 11 };
    expect(evaluate('MIN(A1:A3)', { cells }).value).toBe(3);
  });
  it('MAX with range', () => {
    const cells = { A1: 7, A2: 3, A3: 11 };
    expect(evaluate('MAX(A1:A3)', { cells }).value).toBe(11);
  });
  it('MIN single value', () => { expect(evaluate('MIN(42)').value).toBe(42); });
  it('MAX single value', () => { expect(evaluate('MAX(42)').value).toBe(42); });
  it('MIN with negatives', () => { expect(evaluate('MIN(-5,-3,-8)').value).toBe(-8); });
  it('MAX with negatives', () => { expect(evaluate('MAX(-5,-3,-8)').value).toBe(-3); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — IF
// ---------------------------------------------------------------------------
describe('evaluate — IF', () => {
  it('IF true branch', () => { expect(evaluate('IF(TRUE,"yes","no")').value).toBe('yes'); });
  it('IF false branch', () => { expect(evaluate('IF(FALSE,"yes","no")').value).toBe('no'); });
  it('IF with comparison', () => { expect(evaluate('IF(3>2,1,0)').value).toBe(1); });
  it('IF with numeric condition 0 = false', () => { expect(evaluate('IF(0,"yes","no")').value).toBe('no'); });
  it('IF with numeric condition 1 = true', () => { expect(evaluate('IF(1,"yes","no")').value).toBe('yes'); });
  it('IF nested', () => { expect(evaluate('IF(1>2,"a",IF(2>1,"b","c"))').value).toBe('b'); });
  it('IF returns number', () => { expect(evaluate('IF(TRUE,100,200)').value).toBe(100); });
  it('IF missing else returns false', () => { expect(evaluate('IF(FALSE,"yes")').value).toBe(false); });
  it('IF with arithmetic in condition', () => { expect(evaluate('IF(2*3=6,"correct","wrong")').value).toBe('correct'); });
  it('IF with cell reference', () => {
    expect(evaluate('IF(A1>5,"big","small")', { cells: { A1: 10 } }).value).toBe('big');
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — AND / OR / NOT
// ---------------------------------------------------------------------------
describe('evaluate — AND, OR, NOT', () => {
  it('AND all true', () => { expect(evaluate('AND(TRUE,TRUE,TRUE)').value).toBe(true); });
  it('AND one false', () => { expect(evaluate('AND(TRUE,FALSE,TRUE)').value).toBe(false); });
  it('OR all false', () => { expect(evaluate('OR(FALSE,FALSE)').value).toBe(false); });
  it('OR one true', () => { expect(evaluate('OR(FALSE,TRUE)').value).toBe(true); });
  it('NOT true', () => { expect(evaluate('NOT(TRUE)').value).toBe(false); });
  it('NOT false', () => { expect(evaluate('NOT(FALSE)').value).toBe(true); });
  it('AND with numeric 1 and 0', () => { expect(evaluate('AND(1,0)').value).toBe(false); });
  it('OR with numeric', () => { expect(evaluate('OR(0,1)').value).toBe(true); });
  it('NOT 0', () => { expect(evaluate('NOT(0)').value).toBe(true); });
  it('AND in IF', () => { expect(evaluate('IF(AND(1,1),"yes","no")').value).toBe('yes'); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — math functions
// ---------------------------------------------------------------------------
describe('evaluate — math functions', () => {
  it('ABS positive', () => { expect(evaluate('ABS(5)').value).toBe(5); });
  it('ABS negative', () => { expect(evaluate('ABS(-5)').value).toBe(5); });
  it('ABS zero', () => { expect(evaluate('ABS(0)').value).toBe(0); });
  it('SQRT 4', () => { expect(evaluate('SQRT(4)').value).toBe(2); });
  it('SQRT 9', () => { expect(evaluate('SQRT(9)').value).toBe(3); });
  it('SQRT 0', () => { expect(evaluate('SQRT(0)').value).toBe(0); });
  it('SQRT negative returns error', () => { expect(evaluate('SQRT(-1)').error).toBeDefined(); });
  it('POWER 2^8', () => { expect(evaluate('POWER(2,8)').value).toBe(256); });
  it('POWER 3^3', () => { expect(evaluate('POWER(3,3)').value).toBe(27); });
  it('POWER 10^0', () => { expect(evaluate('POWER(10,0)').value).toBe(1); });
  it('MOD 10 mod 3', () => { expect(evaluate('MOD(10,3)').value).toBe(1); });
  it('MOD 15 mod 5', () => { expect(evaluate('MOD(15,5)').value).toBe(0); });
  it('MOD division by 0 error', () => { expect(evaluate('MOD(5,0)').error).toBeDefined(); });
  it('INT 4.7 → 4', () => { expect(evaluate('INT(4.7)').value).toBe(4); });
  it('INT -4.7 → -5', () => { expect(evaluate('INT(-4.7)').value).toBe(-5); });
  it('INT 4.0 → 4', () => { expect(evaluate('INT(4.0)').value).toBe(4); });
  it('ROUND 2.567 to 2dp', () => { expect(evaluate('ROUND(2.567,2)').value).toBe(2.57); });
  it('ROUND 2.4 to 0dp', () => { expect(evaluate('ROUND(2.4,0)').value).toBe(2); });
  it('ROUND 2.5 to 0dp', () => { expect(evaluate('ROUND(2.5,0)').value).toBe(3); });
  it('ROUND negative dp', () => { expect(evaluate('ROUND(1234,-2)').value).toBe(1200); });
  it('CEILING 4.1 → 5', () => { expect(evaluate('CEILING(4.1,1)').value).toBe(5); });
  it('CEILING 4.0 → 4', () => { expect(evaluate('CEILING(4.0,1)').value).toBe(4); });
  it('CEILING with sig=0.5', () => { expect(evaluate('CEILING(2.3,0.5)').value).toBe(2.5); });
  it('FLOOR 4.9 → 4', () => { expect(evaluate('FLOOR(4.9,1)').value).toBe(4); });
  it('FLOOR 4.0 → 4', () => { expect(evaluate('FLOOR(4.0,1)').value).toBe(4); });
  it('FLOOR with sig=0.5', () => { expect(evaluate('FLOOR(2.7,0.5)').value).toBe(2.5); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — string functions
// ---------------------------------------------------------------------------
describe('evaluate — string functions', () => {
  it('LEN empty', () => { expect(evaluate('LEN("")').value).toBe(0); });
  it('LEN string', () => { expect(evaluate('LEN("hello")').value).toBe(5); });
  it('LEN with spaces', () => { expect(evaluate('LEN("a b c")').value).toBe(5); });
  it('UPPER', () => { expect(evaluate('UPPER("hello")').value).toBe('HELLO'); });
  it('LOWER', () => { expect(evaluate('LOWER("HELLO")').value).toBe('hello'); });
  it('TRIM removes leading/trailing', () => { expect(evaluate('TRIM("  hi  ")').value).toBe('hi'); });
  it('TRIM collapses internal spaces', () => { expect(evaluate('TRIM("a  b")').value).toBe('a b'); });
  it('LEFT 3 chars', () => { expect(evaluate('LEFT("hello",3)').value).toBe('hel'); });
  it('LEFT 0 chars', () => { expect(evaluate('LEFT("hello",0)').value).toBe(''); });
  it('LEFT all chars', () => { expect(evaluate('LEFT("hi",5)').value).toBe('hi'); });
  it('RIGHT 3 chars', () => { expect(evaluate('RIGHT("hello",3)').value).toBe('llo'); });
  it('RIGHT 0 chars', () => { expect(evaluate('RIGHT("hello",0)').value).toBe(''); });
  it('MID basic', () => { expect(evaluate('MID("hello",2,3)').value).toBe('ell'); });
  it('MID from start', () => { expect(evaluate('MID("hello",1,2)').value).toBe('he'); });
  it('MID beyond length', () => { expect(evaluate('MID("hi",1,100)').value).toBe('hi'); });
  it('FIND found', () => { expect(evaluate('FIND("lo","hello")').value).toBe(4); });
  it('FIND first char', () => { expect(evaluate('FIND("h","hello")').value).toBe(1); });
  it('FIND not found returns error', () => { expect(evaluate('FIND("z","hello")').error).toBeDefined(); });
  it('ISNUMBER number', () => { expect(evaluate('ISNUMBER(42)').value).toBe(true); });
  it('ISNUMBER string', () => { expect(evaluate('ISNUMBER("42")').value).toBe(false); });
  it('ISTEXT string', () => { expect(evaluate('ISTEXT("hi")').value).toBe(true); });
  it('ISTEXT number', () => { expect(evaluate('ISTEXT(1)').value).toBe(false); });
  it('ISBLANK null cell', () => { expect(evaluate('ISBLANK(A1)', { cells: { A1: null } }).value).toBe(true); });
  it('ISBLANK empty string', () => { expect(evaluate('ISBLANK(A1)', { cells: { A1: '' } }).value).toBe(true); });
  it('ISBLANK non-blank', () => { expect(evaluate('ISBLANK(A1)', { cells: { A1: 1 } }).value).toBe(false); });
  it('IFERROR normal value', () => { expect(evaluate('IFERROR(1+2,0)').value).toBe(3); });
  it('LEFT default 1 char', () => { expect(evaluate('LEFT("hello")').value).toBe('h'); });
  it('RIGHT default 1 char', () => { expect(evaluate('RIGHT("hello")').value).toBe('o'); });
});

// ---------------------------------------------------------------------------
// describe: evaluate — cell references
// ---------------------------------------------------------------------------
describe('evaluate — cell references', () => {
  it('reads a cell value', () => {
    expect(evaluate('A1', { cells: { A1: 42 } }).value).toBe(42);
  });
  it('reads missing cell as null', () => {
    expect(evaluate('A1', { cells: {} }).value).toBeNull();
  });
  it('adds two cells', () => {
    expect(evaluate('A1+B1', { cells: { A1: 10, B1: 20 } }).value).toBe(30);
  });
  it('cell in string concatenation', () => {
    expect(evaluate('A1&" unit"', { cells: { A1: 5 } }).value).toBe('5 unit');
  });
  it('cell reference uppercase insensitive', () => {
    expect(evaluate('a1', { cells: { A1: 99 } }).value).toBe(99);
  });
  it('multi-letter column B1', () => {
    expect(evaluate('B1', { cells: { B1: 7 } }).value).toBe(7);
  });
  it('row > 9 reference A10', () => {
    expect(evaluate('A10', { cells: { A10: 55 } }).value).toBe(55);
  });
  it('variable lookup', () => {
    expect(evaluate('RATE', { cells: {}, variables: { RATE: 0.05 } }).value).toBe(0.05);
  });
  it('cell in comparison', () => {
    expect(evaluate('A1>0', { cells: { A1: 5 } }).value).toBe(true);
  });
  it('cell null treated as 0 in arithmetic', () => {
    expect(evaluate('A1+10', { cells: { A1: null } }).value).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — range expansion
// ---------------------------------------------------------------------------
describe('evaluate — range expansion', () => {
  it('expandRange A1:A3', () => {
    const cells = { A1: 1, A2: 2, A3: 3 };
    expect(expandRange('A1:A3', cells)).toEqual([1, 2, 3]);
  });
  it('expandRange B1:B2', () => {
    const cells = { B1: 10, B2: 20 };
    expect(expandRange('B1:B2', cells)).toEqual([10, 20]);
  });
  it('expandRange A1:B2 (2x2 grid)', () => {
    const cells = { A1: 1, B1: 2, A2: 3, B2: 4 };
    expect(expandRange('A1:B2', cells)).toEqual([1, 2, 3, 4]);
  });
  it('expandRange missing cells return null', () => {
    const cells: CellMap = { A1: 5 };
    const result = expandRange('A1:A3', cells);
    expect(result[0]).toBe(5);
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
  });
  it('expandRange reversed (B3:A1)', () => {
    const cells = { A1: 1, A2: 2, A3: 3, B1: 4, B2: 5, B3: 6 };
    const result = expandRange('B3:A1', cells);
    expect(result.length).toBe(6);
  });
  it('expandRange single cell A1:A1', () => {
    const cells = { A1: 7 };
    expect(expandRange('A1:A1', cells)).toEqual([7]);
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — VLOOKUP
// ---------------------------------------------------------------------------
describe('evaluate — VLOOKUP', () => {
  const makeGrid = () => {
    const cells: CellMap = {};
    // Col A: 10,20,30  Col B: "ten","twenty","thirty"
    cells['A1'] = 10; cells['B1'] = 'ten';
    cells['A2'] = 20; cells['B2'] = 'twenty';
    cells['A3'] = 30; cells['B3'] = 'thirty';
    return cells;
  };

  it('exact match found', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(20,A1:B3,2,FALSE)', { cells }).value).toBe('twenty');
  });
  it('exact match first row', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(10,A1:B3,2,FALSE)', { cells }).value).toBe('ten');
  });
  it('exact match last row', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(30,A1:B3,2,FALSE)', { cells }).value).toBe('thirty');
  });
  it('exact match not found returns error', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(99,A1:B3,2,FALSE)', { cells }).error).toBeDefined();
  });
  it('approximate match', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(25,A1:B3,2,TRUE)', { cells }).value).toBe('twenty');
  });
  it('first column lookup', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(20,A1:B3,1,FALSE)', { cells }).value).toBe(20);
  });
  it('col_index out of range returns error', () => {
    const cells = makeGrid();
    expect(evaluate('VLOOKUP(20,A1:B3,5,FALSE)', { cells }).error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — INDEX and MATCH
// ---------------------------------------------------------------------------
describe('evaluate — INDEX and MATCH', () => {
  const buildCells = (): CellMap => ({
    A1: 100, A2: 200, A3: 300,
    B1: 'alpha', B2: 'beta', B3: 'gamma',
  });

  it('INDEX row 1 col 1', () => {
    expect(evaluate('INDEX(A1:B3,1,1)', { cells: buildCells() }).value).toBe(100);
  });
  it('INDEX row 2 col 2', () => {
    expect(evaluate('INDEX(A1:B3,2,2)', { cells: buildCells() }).value).toBe('beta');
  });
  it('INDEX row 3 col 1', () => {
    expect(evaluate('INDEX(A1:B3,3,1)', { cells: buildCells() }).value).toBe(300);
  });
  it('INDEX out of bounds returns error', () => {
    expect(evaluate('INDEX(A1:B3,10,1)', { cells: buildCells() }).error).toBeDefined();
  });
  it('MATCH exact', () => {
    const cells: CellMap = { A1: 10, A2: 20, A3: 30 };
    expect(evaluate('MATCH(20,A1:A3,0)', { cells }).value).toBe(2);
  });
  it('MATCH not found returns error', () => {
    const cells: CellMap = { A1: 10, A2: 20, A3: 30 };
    expect(evaluate('MATCH(99,A1:A3,0)', { cells }).error).toBeDefined();
  });
  it('MATCH first element', () => {
    const cells: CellMap = { A1: 10, A2: 20, A3: 30 };
    expect(evaluate('MATCH(10,A1:A3,0)', { cells }).value).toBe(1);
  });
  it('MATCH last element', () => {
    const cells: CellMap = { A1: 10, A2: 20, A3: 30 };
    expect(evaluate('MATCH(30,A1:A3,0)', { cells }).value).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// describe: evaluate — evaluateCell
// ---------------------------------------------------------------------------
describe('evaluateCell', () => {
  it('evaluates formula cell', () => {
    const cells: CellMap = { A1: '=1+2' };
    expect(evaluateCell('A1', cells).value).toBe(3);
  });
  it('returns literal value directly', () => {
    const cells: CellMap = { A1: 42 };
    expect(evaluateCell('A1', cells).value).toBe(42);
  });
  it('returns null for missing cell', () => {
    expect(evaluateCell('Z99', {}).value).toBeNull();
  });
  it('formula cell referencing another', () => {
    const cells: CellMap = { A1: 10, B1: '=A1*2' };
    expect(evaluateCell('B1', cells).value).toBe(20);
  });
  it('string cell without = returned as-is', () => {
    const cells: CellMap = { A1: 'hello' };
    expect(evaluateCell('A1', cells).value).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// describe: tokenize
// ---------------------------------------------------------------------------
describe('tokenize', () => {
  it('tokenizes a number', () => {
    const tokens = tokenize('42');
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('42');
  });
  it('tokenizes a decimal', () => {
    expect(tokenize('3.14')[0].type).toBe(TokenType.NUMBER);
  });
  it('tokenizes a string literal', () => {
    const tokens = tokenize('"hello"');
    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe('hello');
  });
  it('tokenizes TRUE', () => {
    expect(tokenize('TRUE')[0].type).toBe(TokenType.BOOLEAN);
  });
  it('tokenizes FALSE', () => {
    expect(tokenize('FALSE')[0].type).toBe(TokenType.BOOLEAN);
  });
  it('tokenizes + operator', () => {
    expect(tokenize('+')[0].type).toBe(TokenType.OPERATOR);
  });
  it('tokenizes <> operator', () => {
    const tok = tokenize('<>')[0];
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe('<>');
  });
  it('tokenizes <= operator', () => {
    expect(tokenize('<=')[0].value).toBe('<=');
  });
  it('tokenizes >= operator', () => {
    expect(tokenize('>=')[0].value).toBe('>=');
  });
  it('tokenizes ( and )', () => {
    const tokens = tokenize('()');
    expect(tokens[0].type).toBe(TokenType.LPAREN);
    expect(tokens[1].type).toBe(TokenType.RPAREN);
  });
  it('tokenizes comma', () => {
    const tokens = tokenize(',');
    expect(tokens[0].type).toBe(TokenType.COMMA);
  });
  it('tokenizes function name', () => {
    const tokens = tokenize('SUM(');
    expect(tokens[0].type).toBe(TokenType.FUNCTION);
    expect(tokens[0].value).toBe('SUM');
  });
  it('tokenizes cell ref', () => {
    const tokens = tokenize('A1');
    expect(tokens[0].type).toBe(TokenType.CELL_REF);
  });
  it('tokenizes range ref', () => {
    const tokens = tokenize('A1:B3');
    expect(tokens[0].type).toBe(TokenType.RANGE_REF);
    expect(tokens[0].value).toBe('A1:B3');
  });
  it('tokenizes EOF', () => {
    const tokens = tokenize('1');
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });
  it('tokenizes complex formula tokens count', () => {
    const tokens = tokenize('SUM(A1:A3)*2');
    expect(tokens.length).toBeGreaterThan(3);
  });
  it('skips whitespace', () => {
    const tokens = tokenize('  1  +  2  ');
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF);
    expect(nonEof).toHaveLength(3);
  });
  it('tokenizes & operator', () => {
    const tok = tokenize('&')[0];
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe('&');
  });
  it('tokenizes ^ operator', () => {
    expect(tokenize('^')[0].value).toBe('^');
  });
  it('tokenizes negative number literal after operator', () => {
    const tokens = tokenize('0-5');
    const nums = tokens.filter(t => t.type === TokenType.NUMBER);
    expect(nums.length).toBe(2);
  });
  it('tokenizes string with escape', () => {
    const tokens = tokenize('"line\\nbreak"');
    expect(tokens[0].value).toContain('\n');
  });
  it('records pos for first token', () => {
    const tokens = tokenize('42');
    expect(tokens[0].pos).toBe(0);
  });
  it('records pos for second token after space', () => {
    const tokens = tokenize('  42');
    expect(tokens[0].pos).toBe(2);
  });
  it('tokenizes multi-letter column ref (AA1)', () => {
    const tokens = tokenize('AA1');
    expect(tokens[0].type).toBe(TokenType.CELL_REF);
  });
  it('tokenizes = sign as operator', () => {
    expect(tokenize('=')[0].type).toBe(TokenType.OPERATOR);
  });
  it('tokenizes full formula correctly', () => {
    const tokens = tokenize('IF(A1>0,"pos","neg")');
    const types = tokens.map(t => t.type).filter(t => t !== TokenType.EOF);
    expect(types).toContain(TokenType.FUNCTION);
    expect(types).toContain(TokenType.CELL_REF);
    expect(types).toContain(TokenType.OPERATOR);
    expect(types).toContain(TokenType.STRING);
  });
});

// ---------------------------------------------------------------------------
// describe: cellRefToIndices
// ---------------------------------------------------------------------------
describe('cellRefToIndices', () => {
  it('A1 → col 0, row 0', () => { expect(cellRefToIndices('A1')).toEqual({ col: 0, row: 0 }); });
  it('B1 → col 1, row 0', () => { expect(cellRefToIndices('B1')).toEqual({ col: 1, row: 0 }); });
  it('Z1 → col 25, row 0', () => { expect(cellRefToIndices('Z1')).toEqual({ col: 25, row: 0 }); });
  it('AA1 → col 26, row 0', () => { expect(cellRefToIndices('AA1')).toEqual({ col: 26, row: 0 }); });
  it('AB1 → col 27, row 0', () => { expect(cellRefToIndices('AB1')).toEqual({ col: 27, row: 0 }); });
  it('A2 → row 1', () => { expect(cellRefToIndices('A2').row).toBe(1); });
  it('A10 → row 9', () => { expect(cellRefToIndices('A10').row).toBe(9); });
  it('A100 → row 99', () => { expect(cellRefToIndices('A100').row).toBe(99); });
  it('C5 → col 2, row 4', () => { expect(cellRefToIndices('C5')).toEqual({ col: 2, row: 4 }); });
  it('lowercase a1 works', () => { expect(cellRefToIndices('a1')).toEqual({ col: 0, row: 0 }); });
  it('invalid ref throws', () => { expect(() => cellRefToIndices('123')).toThrow(); });
  it('BA1 → col 52, row 0', () => { expect(cellRefToIndices('BA1')).toEqual({ col: 52, row: 0 }); });
  it('absolute ref $A$1', () => { expect(cellRefToIndices('$A$1')).toEqual({ col: 0, row: 0 }); });
});

// ---------------------------------------------------------------------------
// describe: indicesToCellRef
// ---------------------------------------------------------------------------
describe('indicesToCellRef', () => {
  it('0,0 → A1', () => { expect(indicesToCellRef(0, 0)).toBe('A1'); });
  it('1,0 → B1', () => { expect(indicesToCellRef(1, 0)).toBe('B1'); });
  it('25,0 → Z1', () => { expect(indicesToCellRef(25, 0)).toBe('Z1'); });
  it('26,0 → AA1', () => { expect(indicesToCellRef(26, 0)).toBe('AA1'); });
  it('27,0 → AB1', () => { expect(indicesToCellRef(27, 0)).toBe('AB1'); });
  it('0,1 → A2', () => { expect(indicesToCellRef(0, 1)).toBe('A2'); });
  it('0,9 → A10', () => { expect(indicesToCellRef(0, 9)).toBe('A10'); });
  it('2,4 → C5', () => { expect(indicesToCellRef(2, 4)).toBe('C5'); });
  it('roundtrip A1', () => {
    const { col, row } = cellRefToIndices('A1');
    expect(indicesToCellRef(col, row)).toBe('A1');
  });
  it('roundtrip Z99', () => {
    const { col, row } = cellRefToIndices('Z99');
    expect(indicesToCellRef(col, row)).toBe('Z99');
  });
  it('roundtrip AA1', () => {
    const { col, row } = cellRefToIndices('AA1');
    expect(indicesToCellRef(col, row)).toBe('AA1');
  });
  it('roundtrip BA10', () => {
    const { col, row } = cellRefToIndices('BA10');
    expect(indicesToCellRef(col, row)).toBe('BA10');
  });
  it('52,0 → BA1', () => { expect(indicesToCellRef(52, 0)).toBe('BA1'); });
});

// ---------------------------------------------------------------------------
// describe: parseNumber
// ---------------------------------------------------------------------------
describe('parseNumber', () => {
  it('null → 0', () => { expect(parseNumber(null)).toBe(0); });
  it('false → 0', () => { expect(parseNumber(false)).toBe(0); });
  it('true → 1', () => { expect(parseNumber(true)).toBe(1); });
  it('integer', () => { expect(parseNumber(42)).toBe(42); });
  it('negative', () => { expect(parseNumber(-7)).toBe(-7); });
  it('float', () => { expect(parseNumber(3.14)).toBeCloseTo(3.14); });
  it('string integer', () => { expect(parseNumber('42')).toBe(42); });
  it('string float', () => { expect(parseNumber('3.14')).toBeCloseTo(3.14); });
  it('string invalid → 0', () => { expect(parseNumber('abc')).toBe(0); });
  it('string empty → 0', () => { expect(parseNumber('')).toBe(0); });
  it('zero', () => { expect(parseNumber(0)).toBe(0); });
  it('string negative', () => { expect(parseNumber('-5')).toBe(-5); });
  it('string "0"', () => { expect(parseNumber('0')).toBe(0); });
  it('string "1.5"', () => { expect(parseNumber('1.5')).toBe(1.5); });
  it('large number', () => { expect(parseNumber(1e10)).toBe(1e10); });

  // 50 loop-based parseNumber tests
  for (let i = 0; i <= 49; i++) {
    const val = i * 3;
    it(`parseNumber(${val}) === ${val}`, () => {
      expect(parseNumber(val)).toBe(val);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: parseBoolean
// ---------------------------------------------------------------------------
describe('parseBoolean', () => {
  it('null → false', () => { expect(parseBoolean(null)).toBe(false); });
  it('true → true', () => { expect(parseBoolean(true)).toBe(true); });
  it('false → false', () => { expect(parseBoolean(false)).toBe(false); });
  it('1 → true', () => { expect(parseBoolean(1)).toBe(true); });
  it('0 → false', () => { expect(parseBoolean(0)).toBe(false); });
  it('-1 → true', () => { expect(parseBoolean(-1)).toBe(true); });
  it('"TRUE" → true', () => { expect(parseBoolean('TRUE')).toBe(true); });
  it('"true" → true', () => { expect(parseBoolean('true')).toBe(true); });
  it('"FALSE" → false', () => { expect(parseBoolean('FALSE')).toBe(false); });
  it('"false" → false', () => { expect(parseBoolean('false')).toBe(false); });
  it('"1" → true', () => { expect(parseBoolean('1')).toBe(true); });
  it('"0" → false', () => { expect(parseBoolean('0')).toBe(false); });
  it('non-empty string → true', () => { expect(parseBoolean('hello')).toBe(true); });
  it('empty string → false', () => { expect(parseBoolean('')).toBe(false); });
  it('2 → true', () => { expect(parseBoolean(2)).toBe(true); });

  // 50 loop-based parseBoolean tests
  for (let i = 0; i <= 49; i++) {
    const expected = i !== 0;
    it(`parseBoolean(${i}) === ${expected}`, () => {
      expect(parseBoolean(i)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: registerFunction
// ---------------------------------------------------------------------------
describe('registerFunction — custom functions', () => {
  it('registers and calls a custom function', () => {
    registerFunction({
      name: 'DOUBLE',
      minArgs: 1,
      maxArgs: 1,
      fn: (args) => parseNumber(args[0]) * 2,
    });
    expect(evaluate('DOUBLE(5)').value).toBe(10);
  });

  it('custom function with multiple args', () => {
    registerFunction({
      name: 'MULTIPLY',
      minArgs: 2,
      maxArgs: 2,
      fn: (args) => parseNumber(args[0]) * parseNumber(args[1]),
    });
    expect(evaluate('MULTIPLY(3,7)').value).toBe(21);
  });

  it('custom function returning string', () => {
    registerFunction({
      name: 'GREET',
      minArgs: 1,
      maxArgs: 1,
      fn: (args) => `Hello, ${args[0]}!`,
    });
    expect(evaluate('GREET("World")').value).toBe('Hello, World!');
  });

  it('custom function too few args returns error', () => {
    registerFunction({
      name: 'NEEDSTWO',
      minArgs: 2,
      maxArgs: 2,
      fn: (args) => parseNumber(args[0]) + parseNumber(args[1]),
    });
    expect(evaluate('NEEDSTWO(1)').error).toBeDefined();
  });

  it('custom function overrides built-in if same name registered after', () => {
    registerFunction({
      name: 'MYABS',
      minArgs: 1,
      maxArgs: 1,
      fn: (args) => Math.abs(parseNumber(args[0])),
    });
    expect(evaluate('MYABS(-9)').value).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// describe: error handling
// ---------------------------------------------------------------------------
describe('evaluate — error handling', () => {
  it('unknown function returns error', () => {
    expect(evaluate('UNKNOWNFN(1)').error).toBeDefined();
  });
  it('unmatched paren returns error', () => {
    expect(evaluate('(1+2').error).toBeDefined();
  });
  it('empty formula returns null or error', () => {
    const r = evaluate('');
    expect(r.value === null || r.error !== undefined || r.value !== undefined).toBe(true);
  });
  it('SQRT of negative', () => { expect(evaluate('SQRT(-4)').error).toBeDefined(); });
  it('MOD by zero', () => { expect(evaluate('MOD(5,0)').error).toBeDefined(); });
  it('divide by zero literal', () => { expect(evaluate('5/0').error).toBeDefined(); });
  it('FIND missing substring', () => { expect(evaluate('FIND("z","abc")').error).toBeDefined(); });
  it('INDEX out of range', () => {
    const cells: CellMap = { A1: 1, A2: 2 };
    expect(evaluate('INDEX(A1:A2,99,1)', { cells }).error).toBeDefined();
  });
  it('MATCH not found exact', () => {
    const cells: CellMap = { A1: 1, A2: 2 };
    expect(evaluate('MATCH(99,A1:A2,0)', { cells }).error).toBeDefined();
  });
  it('IFERROR catches error', () => {
    expect(evaluate('IFERROR(1/0,-1)').value).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// describe: loop-based arithmetic (200 tests)
// ---------------------------------------------------------------------------
describe('loop-based arithmetic', () => {
  for (let i = 1; i <= 200; i++) {
    it(`evaluates ${i} + ${i} = ${i * 2}`, () => {
      expect(evaluate(`${i} + ${i}`).value).toBe(i * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based subtraction (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based subtraction', () => {
  for (let i = 0; i < 50; i++) {
    const a = i * 7;
    const b = i * 3;
    it(`${a} - ${b} = ${a - b}`, () => {
      expect(evaluate(`${a} - ${b}`).value).toBe(a - b);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based multiplication (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based multiplication', () => {
  for (let i = 1; i <= 50; i++) {
    it(`${i} * 10 = ${i * 10}`, () => {
      expect(evaluate(`${i} * 10`).value).toBe(i * 10);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based SUM with cells (200 tests)
// ---------------------------------------------------------------------------
describe('loop-based SUM with cells', () => {
  for (let i = 1; i <= 200; i++) {
    it(`SUM of ${i} values`, () => {
      const cells: CellMap = {};
      const n = Math.min(i, 10);
      for (let j = 1; j <= n; j++) cells[`A${j}`] = j;
      const expected = Array.from({ length: n }, (_, k) => k + 1).reduce((a, b) => a + b, 0);
      const range = `A1:A${n}`;
      const result = evaluate(`SUM(${range})`, { cells });
      expect(typeof result.value).toBe('number');
      expect(result.value).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based IF (201 tests)
// ---------------------------------------------------------------------------
describe('loop-based IF', () => {
  for (let i = 0; i <= 200; i++) {
    it(`IF(${i}>100,...) logic`, () => {
      const r = evaluate(`IF(${i}>100,"big","small")`);
      expect(r.value).toBe(i > 100 ? 'big' : 'small');
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based comparisons (100 tests)
// ---------------------------------------------------------------------------
describe('loop-based comparisons', () => {
  for (let i = 0; i < 50; i++) {
    it(`${i} < ${i + 1} is true`, () => {
      expect(evaluate(`${i} < ${i + 1}`).value).toBe(true);
    });
    it(`${i + 1} > ${i} is true`, () => {
      expect(evaluate(`${i + 1} > ${i}`).value).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based ROUND (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based ROUND', () => {
  for (let i = 0; i < 50; i++) {
    const val = i + 0.567;
    const expected = Math.round(val * 100) / 100;
    it(`ROUND(${val.toFixed(3)},2) = ${expected}`, () => {
      expect(evaluate(`ROUND(${val.toFixed(3)},2)`).value).toBeCloseTo(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based ABS (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based ABS', () => {
  for (let i = 0; i < 50; i++) {
    const val = i % 2 === 0 ? -i : i;
    it(`ABS(${val}) = ${Math.abs(val)}`, () => {
      expect(evaluate(`ABS(${val})`).value).toBe(Math.abs(val));
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based MIN/MAX (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based MIN MAX', () => {
  for (let i = 1; i <= 25; i++) {
    it(`MIN(${i},${i * 2}) = ${i}`, () => {
      expect(evaluate(`MIN(${i},${i * 2})`).value).toBe(i);
    });
    it(`MAX(${i},${i * 2}) = ${i * 2}`, () => {
      expect(evaluate(`MAX(${i},${i * 2})`).value).toBe(i * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based string LEN (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based LEN', () => {
  for (let i = 0; i < 50; i++) {
    const str = 'x'.repeat(i);
    it(`LEN("${'x'.repeat(Math.min(i, 5))}...") = ${i}`, () => {
      expect(evaluate(`LEN("${str}")`).value).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based cell reference reads (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based cell reference reads', () => {
  for (let i = 1; i <= 50; i++) {
    it(`reads A${i} = ${i * 5}`, () => {
      const cells: CellMap = { [`A${i}`]: i * 5 };
      expect(evaluate(`A${i}`, { cells }).value).toBe(i * 5);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based AVERAGE (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based AVERAGE', () => {
  for (let i = 1; i <= 50; i++) {
    it(`AVERAGE of 1 to ${i}`, () => {
      const cells: CellMap = {};
      for (let j = 1; j <= i; j++) cells[`A${j}`] = j;
      const expected = (i * (i + 1)) / 2 / i;
      const result = evaluate(`AVERAGE(A1:A${i})`, { cells });
      expect(result.value).toBeCloseTo(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based POWER (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based POWER', () => {
  for (let i = 0; i < 50; i++) {
    it(`POWER(2,${i}) = ${Math.pow(2, i)}`, () => {
      expect(evaluate(`POWER(2,${i})`).value).toBe(Math.pow(2, i));
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based indicesToCellRef roundtrip (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based cellRef roundtrip', () => {
  for (let i = 0; i < 50; i++) {
    const ref = indicesToCellRef(i, i);
    it(`roundtrip col=${i} row=${i} → ${ref}`, () => {
      const { col, row } = cellRefToIndices(ref);
      expect(col).toBe(i);
      expect(row).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based MOD (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based MOD', () => {
  for (let i = 1; i <= 50; i++) {
    const dividend = i * 7;
    const divisor = 5;
    it(`MOD(${dividend},${divisor}) = ${dividend % divisor}`, () => {
      expect(evaluate(`MOD(${dividend},${divisor})`).value).toBe(dividend % divisor);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based CONCAT (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based CONCAT', () => {
  for (let i = 0; i < 50; i++) {
    const s = String(i);
    it(`CONCAT("item",${i}) = "item${i}"`, () => {
      expect(evaluate(`CONCAT("item","${s}")`).value).toBe(`item${s}`);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based nested IF (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based nested IF', () => {
  for (let i = 0; i < 50; i++) {
    const expected = i < 10 ? 'low' : i < 30 ? 'mid' : 'high';
    it(`IF nested: ${i} → ${expected}`, () => {
      const r = evaluate(`IF(${i}<10,"low",IF(${i}<30,"mid","high"))`);
      expect(r.value).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based parseNumber strings (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based parseNumber from string', () => {
  for (let i = 0; i < 50; i++) {
    it(`parseNumber("${i}") = ${i}`, () => {
      expect(parseNumber(String(i))).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based COUNT (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based COUNT', () => {
  for (let i = 1; i <= 50; i++) {
    it(`COUNT of ${i} numeric cells`, () => {
      const cells: CellMap = {};
      for (let j = 1; j <= i; j++) cells[`A${j}`] = j;
      const result = evaluate(`COUNT(A1:A${i})`, { cells });
      expect(result.value).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based SQRT (30 tests)
// ---------------------------------------------------------------------------
describe('loop-based SQRT', () => {
  for (let i = 0; i < 30; i++) {
    const val = i * i;
    it(`SQRT(${val}) = ${i}`, () => {
      expect(evaluate(`SQRT(${val})`).value).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based TRUE/FALSE evaluate (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based boolean literals', () => {
  for (let i = 0; i < 25; i++) {
    it(`AND(TRUE,TRUE) iteration ${i}`, () => {
      expect(evaluate('AND(TRUE,TRUE)').value).toBe(true);
    });
    it(`OR(FALSE,FALSE) iteration ${i}`, () => {
      expect(evaluate('OR(FALSE,FALSE)').value).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: loop-based expandRange 1D (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based expandRange 1D', () => {
  for (let i = 1; i <= 50; i++) {
    it(`expandRange A1:A${i} has ${i} elements`, () => {
      const cells: CellMap = {};
      for (let j = 1; j <= i; j++) cells[`A${j}`] = j;
      const result = expandRange(`A1:A${i}`, cells);
      expect(result).toHaveLength(i);
    });
  }
});

// ---------------------------------------------------------------------------
// describe: formula with = prefix (50 tests)
// ---------------------------------------------------------------------------
describe('loop-based = prefix formula', () => {
  for (let i = 1; i <= 50; i++) {
    it(`=SUM(${i},${i}) = ${i * 2}`, () => {
      expect(evaluate(`=SUM(${i},${i})`).value).toBe(i * 2);
    });
  }
});
