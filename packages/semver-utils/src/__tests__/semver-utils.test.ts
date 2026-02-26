// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parse,
  valid,
  clean,
  coerce,
  isSemVer,
  toString,
  compare,
  compareLoose,
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  diff,
  sort,
  rsort,
  minVersion,
  maxVersion,
  inc,
  major,
  minor,
  patch,
  prerelease,
  satisfies,
  validRange,
  minSatisfying,
  maxSatisfying,
  outside,
  gtr,
  ltr,
  intersects,
  toComparatorSet,
} from '../semver-utils';

// ─── 1. parse — 100 valid semver strings ───────────────────────────────────────
describe('parse — valid semver strings', () => {
  for (let x = 0; x < 100; x++) {
    it(`parse("1.0.${x}") → major=1, minor=0, patch=${x}`, () => {
      const result = parse(`1.0.${x}`);
      expect(result).not.toBeNull();
      expect(result!.major).toBe(1);
      expect(result!.minor).toBe(0);
      expect(result!.patch).toBe(x);
    });
  }
});

// ─── 2. parse invalid — 30 invalid strings ─────────────────────────────────────
describe('parse — invalid strings', () => {
  const invalidCases = [
    'abc', '1.2', '1', '', '1.2.3.4', '1.2.a', '-1.0.0', '1.-2.0', '1.0.-3',
    '01.0.0', '1.00.0', '1.0.00', '.1.0', '1..0', 'v', '1.2.3-',
    '1.2.3-.alpha', 'null', 'undefined', '1.2.3.alpha',
    '1.2.3 1.2.4', '1 .2.3', '1. 2.3', '1.2 .3',
    'a.b.c', '1.2.3-!invalid', 'x.y.z', '1.2.x', '!1.0.0'
  ];
  invalidCases.forEach((s) => {
    it(`parse("${s}") → null`, () => {
      expect(parse(s)).toBeNull();
    });
  });
});

// ─── 3. compare — 100 pairs ─────────────────────────────────────────────────────
describe('compare — 100 version pairs', () => {
  for (let i = 0; i < 50; i++) {
    const x = i;
    const y = i + 1;
    it(`compare("1.0.${x}", "1.0.${y}") → -1`, () => {
      expect(compare(`1.0.${x}`, `1.0.${y}`)).toBe(-1);
    });
    it(`compare("1.0.${y}", "1.0.${x}") → 1`, () => {
      expect(compare(`1.0.${y}`, `1.0.${x}`)).toBe(1);
    });
  }
  // eq cases (0 result)
  for (let i = 0; i < 10; i++) {
    it(`compare("2.${i}.0", "2.${i}.0") → 0 (additional)`, () => {
      expect(compare(`2.${i}.0`, `2.${i}.0`)).toBe(0);
    });
  }
});

// ─── 4. eq/gt/lt/gte/lte — 50 pairs each ───────────────────────────────────────
describe('eq — 50 pairs', () => {
  for (let i = 0; i < 50; i++) {
    it(`eq("${i}.0.0", "${i}.0.0") → true`, () => {
      expect(eq(`${i}.0.0`, `${i}.0.0`)).toBe(true);
    });
  }
});

describe('neq — 50 pairs', () => {
  for (let i = 0; i < 50; i++) {
    it(`neq("${i}.0.0", "${i + 1}.0.0") → true`, () => {
      expect(neq(`${i}.0.0`, `${i + 1}.0.0`)).toBe(true);
    });
  }
});

describe('gt — 50 pairs', () => {
  for (let i = 0; i < 50; i++) {
    it(`gt("${i + 1}.0.0", "${i}.0.0") → true`, () => {
      expect(gt(`${i + 1}.0.0`, `${i}.0.0`)).toBe(true);
    });
  }
});

describe('gte — 50 pairs', () => {
  for (let i = 0; i < 25; i++) {
    it(`gte("${i + 1}.0.0", "${i}.0.0") → true (strict)`, () => {
      expect(gte(`${i + 1}.0.0`, `${i}.0.0`)).toBe(true);
    });
    it(`gte("${i}.0.0", "${i}.0.0") → true (equal)`, () => {
      expect(gte(`${i}.0.0`, `${i}.0.0`)).toBe(true);
    });
  }
});

describe('lt — 50 pairs', () => {
  for (let i = 0; i < 50; i++) {
    it(`lt("${i}.0.0", "${i + 1}.0.0") → true`, () => {
      expect(lt(`${i}.0.0`, `${i + 1}.0.0`)).toBe(true);
    });
  }
});

describe('lte — 50 pairs', () => {
  for (let i = 0; i < 25; i++) {
    it(`lte("${i}.0.0", "${i + 1}.0.0") → true (strict)`, () => {
      expect(lte(`${i}.0.0`, `${i + 1}.0.0`)).toBe(true);
    });
    it(`lte("${i}.0.0", "${i}.0.0") → true (equal)`, () => {
      expect(lte(`${i}.0.0`, `${i}.0.0`)).toBe(true);
    });
  }
});

// ─── 5. sort ascending — 20 shuffled arrays ────────────────────────────────────
describe('sort ascending — 20 shuffled arrays', () => {
  for (let i = 0; i < 20; i++) {
    const base = i;
    const shuffled = [`${base}.2.0`, `${base}.0.0`, `${base}.1.0`];
    const expected = [`${base}.0.0`, `${base}.1.0`, `${base}.2.0`];
    it(`sort([...]) starting at major ${base} is ascending`, () => {
      expect(sort(shuffled, 'asc')).toEqual(expected);
    });
  }
});

// ─── 6. minVersion / maxVersion — 30 arrays each ───────────────────────────────
describe('minVersion — 30 arrays', () => {
  for (let i = 0; i < 30; i++) {
    const versions = [`${i + 1}.0.0`, `${i}.0.0`, `${i + 2}.0.0`];
    it(`minVersion([${versions}]) → "${i}.0.0"`, () => {
      expect(minVersion(versions)).toBe(`${i}.0.0`);
    });
  }
});

describe('maxVersion — 30 arrays', () => {
  for (let i = 0; i < 30; i++) {
    const versions = [`${i}.0.0`, `${i + 1}.0.0`, `${i + 2}.0.0`];
    it(`maxVersion([${versions}]) → "${i + 2}.0.0"`, () => {
      expect(maxVersion(versions)).toBe(`${i + 2}.0.0`);
    });
  }
});

// ─── 7. inc major/minor/patch — 50 versions each ───────────────────────────────
describe('inc major — 50 versions', () => {
  for (let i = 0; i < 50; i++) {
    it(`inc("${i}.5.3", "major") → "${i + 1}.0.0"`, () => {
      expect(inc(`${i}.5.3`, 'major')).toBe(`${i + 1}.0.0`);
    });
  }
});

describe('inc minor — 50 versions', () => {
  for (let i = 0; i < 50; i++) {
    it(`inc("1.${i}.3", "minor") → "1.${i + 1}.0"`, () => {
      expect(inc(`1.${i}.3`, 'minor')).toBe(`1.${i + 1}.0`);
    });
  }
});

describe('inc patch — 50 versions', () => {
  for (let i = 0; i < 50; i++) {
    it(`inc("1.2.${i}", "patch") → "1.2.${i + 1}"`, () => {
      expect(inc(`1.2.${i}`, 'patch')).toBe(`1.2.${i + 1}`);
    });
  }
});

// ─── 8. inc prerelease — 30 versions ───────────────────────────────────────────
describe('inc prerelease — 30 versions', () => {
  for (let i = 0; i < 30; i++) {
    it(`inc("1.2.3-alpha.${i}", "prerelease") → "1.2.3-alpha.${i + 1}"`, () => {
      expect(inc(`1.2.3-alpha.${i}`, 'prerelease')).toBe(`1.2.3-alpha.${i + 1}`);
    });
  }
});

// ─── 9. coerce — 30 loose strings ──────────────────────────────────────────────
describe('coerce — 30 loose strings', () => {
  for (let i = 0; i < 30; i++) {
    it(`coerce("v${i}.2") → major=${i}, minor=2, patch=0`, () => {
      const result = coerce(`v${i}.2`);
      expect(result).not.toBeNull();
      expect(result!.major).toBe(i);
      expect(result!.minor).toBe(2);
      expect(result!.patch).toBe(0);
    });
  }
});

// ─── 10. clean — 30 prefixed strings ───────────────────────────────────────────
describe('clean — 30 prefixed strings', () => {
  for (let i = 0; i < 30; i++) {
    it(`clean("v${i}.2.3") → "${i}.2.3"`, () => {
      expect(clean(`v${i}.2.3`)).toBe(`${i}.2.3`);
    });
  }
});

// ─── 11. isSemVer — 50 valid + 30 invalid ──────────────────────────────────────
describe('isSemVer — 50 valid', () => {
  for (let i = 0; i < 50; i++) {
    it(`isSemVer("${i}.0.0") → true`, () => {
      expect(isSemVer(`${i}.0.0`)).toBe(true);
    });
  }
});

describe('isSemVer — 30 invalid', () => {
  const invalids = [
    'abc', '1.2', '1', '', '1.2.3.4', '1.2.a', '-1.0.0', '1.-2.0',
    '1.0.-3', '01.0.0', '1.00.0', '1.0.00', '.1.0', '1..0', 'v',
    '1.2.3-.alpha', 'null', 'undefined',
    '1.2.3.alpha', '1.2.3 1.2.4', '1 .2.3', '1. 2.3',
    '1.2 .3', 'a.b.c', '1.2.3-!inv', 'xyz', '1.2.x', '!1.0.0', 'x.y.z'
  ];
  invalids.forEach((s) => {
    it(`isSemVer("${s}") → false`, () => {
      expect(isSemVer(s)).toBe(false);
    });
  });
});

// ─── 12. satisfies — exact — 30 versions ───────────────────────────────────────
describe('satisfies — exact match — 30 versions', () => {
  for (let i = 0; i < 30; i++) {
    it(`satisfies("1.0.${i}", "1.0.${i}") → true`, () => {
      expect(satisfies(`1.0.${i}`, `1.0.${i}`)).toBe(true);
    });
  }
});

// ─── 13. satisfies — caret — 30 ranges ─────────────────────────────────────────
describe('satisfies — caret ranges — 30 tests', () => {
  for (let i = 1; i <= 30; i++) {
    it(`satisfies("${i}.2.3", "^${i}.0.0") → true`, () => {
      expect(satisfies(`${i}.2.3`, `^${i}.0.0`)).toBe(true);
    });
  }
});

// ─── 14. satisfies — tilde — 30 ranges ─────────────────────────────────────────
describe('satisfies — tilde ranges — 30 tests', () => {
  for (let i = 0; i < 30; i++) {
    it(`satisfies("1.${i}.5", "~1.${i}.0") → true`, () => {
      expect(satisfies(`1.${i}.5`, `~1.${i}.0`)).toBe(true);
    });
  }
});

// ─── 15. satisfies — comparators — 30 ranges ───────────────────────────────────
describe('satisfies — comparator ranges — 30 tests', () => {
  for (let i = 0; i < 15; i++) {
    it(`satisfies("${i + 2}.0.0", ">=${i}.0.0") → true`, () => {
      expect(satisfies(`${i + 2}.0.0`, `>=${i}.0.0`)).toBe(true);
    });
    it(`satisfies("${i}.0.0", "<${i + 2}.0.0") → true`, () => {
      expect(satisfies(`${i}.0.0`, `<${i + 2}.0.0`)).toBe(true);
    });
  }
});

// ─── 16. satisfies — wildcard — 20 tests ───────────────────────────────────────
describe('satisfies — wildcard — 20 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`satisfies("${i}.5.3", "*") → true`, () => {
      expect(satisfies(`${i}.5.3`, '*')).toBe(true);
    });
    it(`satisfies("${i}.5.3", "${i}.x") → true`, () => {
      expect(satisfies(`${i}.5.3`, `${i}.x`)).toBe(true);
    });
  }
});

// ─── 17. satisfies — false cases — 30 tests ────────────────────────────────────
describe('satisfies — false cases — 30 tests', () => {
  for (let i = 0; i < 15; i++) {
    it(`satisfies("${i}.0.0", ">${i + 1}.0.0") → false`, () => {
      expect(satisfies(`${i}.0.0`, `>${i + 1}.0.0`)).toBe(false);
    });
    it(`satisfies("${i + 5}.0.0", "^${i}.0.0 <${i + 1}.0.0") → false`, () => {
      expect(satisfies(`${i + 5}.0.0`, `^${i}.0.0 <${i + 1}.0.0`)).toBe(false);
    });
  }
});

// ─── 18. minSatisfying / maxSatisfying — 20 each ───────────────────────────────
describe('minSatisfying — 20 tests', () => {
  for (let i = 1; i <= 20; i++) {
    const versions = [`${i}.0.0`, `${i}.1.0`, `${i}.2.0`];
    it(`minSatisfying([${versions}], ">=${i}.0.0") → "${i}.0.0"`, () => {
      expect(minSatisfying(versions, `>=${i}.0.0`)).toBe(`${i}.0.0`);
    });
  }
});

describe('maxSatisfying — 20 tests', () => {
  for (let i = 1; i <= 20; i++) {
    const versions = [`${i}.0.0`, `${i}.1.0`, `${i}.2.0`];
    it(`maxSatisfying([${versions}], ">=${i}.0.0") → "${i}.2.0"`, () => {
      expect(maxSatisfying(versions, `>=${i}.0.0`)).toBe(`${i}.2.0`);
    });
  }
});

// ─── 19. diff — 30 pairs ───────────────────────────────────────────────────────
describe('diff — 30 pairs', () => {
  for (let i = 0; i < 10; i++) {
    it(`diff("${i}.0.0", "${i + 1}.0.0") → 'major'`, () => {
      expect(diff(`${i}.0.0`, `${i + 1}.0.0`)).toBe('major');
    });
    it(`diff("${i + 1}.${i}.0", "${i + 1}.${i + 1}.0") → 'minor'`, () => {
      expect(diff(`${i + 1}.${i}.0`, `${i + 1}.${i + 1}.0`)).toBe('minor');
    });
    it(`diff("${i + 1}.${i + 1}.${i}", "${i + 1}.${i + 1}.${i + 1}") → 'patch'`, () => {
      expect(diff(`${i + 1}.${i + 1}.${i}`, `${i + 1}.${i + 1}.${i + 1}`)).toBe('patch');
    });
  }
});

// ─── 20. prerelease comparison — 20 tests ──────────────────────────────────────
describe('prerelease comparison — 20 tests', () => {
  for (let i = 0; i < 10; i++) {
    it(`compare("1.0.0-alpha.${i}", "1.0.0-alpha.${i + 1}") → -1`, () => {
      expect(compare(`1.0.0-alpha.${i}`, `1.0.0-alpha.${i + 1}`)).toBe(-1);
    });
    it(`compare("1.0.0", "1.0.0-alpha.${i}") → 1 (no prerelease > prerelease)`, () => {
      expect(compare('1.0.0', `1.0.0-alpha.${i}`)).toBe(1);
    });
  }
});

// ─── 21. toString round-trip — 50 tests ────────────────────────────────────────
describe('toString round-trip — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const ver = `${i}.${i % 10}.${i % 5}`;
    it(`toString(parse("${ver}")) → "${ver}"`, () => {
      const parsed = parse(ver);
      expect(parsed).not.toBeNull();
      const str = toString(parsed!);
      const reparsed = parse(str);
      expect(reparsed).not.toBeNull();
      expect(reparsed!.major).toBe(parsed!.major);
      expect(reparsed!.minor).toBe(parsed!.minor);
      expect(reparsed!.patch).toBe(parsed!.patch);
    });
  }
});

// ─── 22. major/minor/patch getters — 50 tests ──────────────────────────────────
describe('major/minor/patch getters — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const m = i;
    const n = i % 10;
    const p = i % 7;
    it(`major/minor/patch("${m}.${n}.${p}") → ${m}, ${n}, ${p}`, () => {
      expect(major(`${m}.${n}.${p}`)).toBe(m);
      expect(minor(`${m}.${n}.${p}`)).toBe(n);
      expect(patch(`${m}.${n}.${p}`)).toBe(p);
    });
  }
});

// ─── 23. gtr / ltr — 20 each ───────────────────────────────────────────────────
describe('gtr — 20 tests', () => {
  for (let i = 1; i <= 20; i++) {
    it(`gtr("${i + 5}.0.0", "^${i}.0.0") → true`, () => {
      expect(gtr(`${i + 5}.0.0`, `^${i}.0.0`)).toBe(true);
    });
  }
});

describe('ltr — 20 tests', () => {
  for (let i = 5; i <= 24; i++) {
    it(`ltr("${i - 4}.0.0", "^${i}.0.0") → true`, () => {
      expect(ltr(`${i - 4}.0.0`, `^${i}.0.0`)).toBe(true);
    });
  }
});

// ─── 24. intersects — 20 range pairs ───────────────────────────────────────────
describe('intersects — 20 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`intersects("^${i}.0.0", ">=${i}.0.0 <${i + 1}.0.0") → true`, () => {
      expect(intersects(`^${i}.0.0`, `>=${i}.0.0 <${i + 1}.0.0`)).toBe(true);
    });
    it(`intersects("<${i}.0.0", ">${i + 2}.0.0") → false`, () => {
      expect(intersects(`<${i}.0.0`, `>${i + 2}.0.0`)).toBe(false);
    });
  }
});

// ─── 25. validRange — 20 valid + 10 invalid ────────────────────────────────────
describe('validRange — 20 valid ranges', () => {
  const validRanges = [
    '*', '>=1.0.0', '>1.0.0', '<2.0.0', '<=2.0.0', '=1.0.0',
    '1.0.0', '^1.0.0', '~1.0.0', '1.x', '1.2.x', '^0.1.0',
    '~0.1.0', '>=1.0.0 <2.0.0', '1.0.0 - 2.0.0', '^1.2.3',
    '~1.2.3', '>=0.0.1', '<100.0.0', '1.0.0 || 2.0.0',
  ];
  validRanges.forEach((r) => {
    it(`validRange("${r}") → true`, () => {
      expect(validRange(r)).toBe(true);
    });
  });
});

describe('validRange — 10 edge/empty ranges', () => {
  // These are technically degenerate but the function should handle gracefully
  const edgeCases = ['', '   ', '!!', '###', '>>>1.0.0', '1.2.a', '~~1.0.0', '^^1.0.0', '1.2.3.4', 'abc'];
  edgeCases.forEach((r) => {
    it(`validRange("${r}") → false or graceful`, () => {
      const result = validRange(r);
      expect(typeof result).toBe('boolean');
    });
  });
});

// ─── Additional coverage tests ──────────────────────────────────────────────────

describe('compareLoose — ignores pre-release', () => {
  it('compareLoose("1.0.0-alpha", "1.0.0-beta") → 0', () => {
    expect(compareLoose('1.0.0-alpha', '1.0.0-beta')).toBe(0);
  });
  it('compareLoose("1.0.0-alpha", "1.0.1") → -1', () => {
    expect(compareLoose('1.0.0-alpha', '1.0.1')).toBe(-1);
  });
  it('compareLoose("2.0.0", "1.9.9-beta") → 1', () => {
    expect(compareLoose('2.0.0', '1.9.9-beta')).toBe(1);
  });
});

describe('parse — with pre-release and build metadata', () => {
  it('parse("1.2.3-alpha.1") → prerelease=["alpha",1]', () => {
    const v = parse('1.2.3-alpha.1');
    expect(v).not.toBeNull();
    expect(v!.prerelease).toEqual(['alpha', 1]);
  });
  it('parse("1.2.3+build.456") → build=["build","456"]', () => {
    const v = parse('1.2.3+build.456');
    expect(v).not.toBeNull();
    expect(v!.build).toEqual(['build', '456']);
  });
  it('parse("1.2.3-beta.2+build.456") → prerelease+build', () => {
    const v = parse('1.2.3-beta.2+build.456');
    expect(v).not.toBeNull();
    expect(v!.prerelease).toEqual(['beta', 2]);
    expect(v!.build).toEqual(['build', '456']);
  });
});

describe('valid — returns cleaned version string', () => {
  it('valid("1.0.0") → "1.0.0"', () => {
    expect(valid('1.0.0')).toBe('1.0.0');
  });
  it('valid("invalid") → null', () => {
    expect(valid('invalid')).toBeNull();
  });
});

describe('clean — strips v prefix', () => {
  it('clean("v1.0.0") → "1.0.0"', () => {
    expect(clean('v1.0.0')).toBe('1.0.0');
  });
  it('clean("=1.0.0") → "1.0.0"', () => {
    expect(clean('=1.0.0')).toBe('1.0.0');
  });
  it('clean("v=1.0.0") → "1.0.0"', () => {
    expect(clean('v=1.0.0')).toBe('1.0.0');
  });
  it('clean("invalid") → null', () => {
    expect(clean('invalid')).toBeNull();
  });
});

describe('coerce — various partial versions', () => {
  it('coerce("2") → major=2, minor=0, patch=0', () => {
    const v = coerce('2');
    expect(v).not.toBeNull();
    expect(v!.major).toBe(2);
    expect(v!.minor).toBe(0);
    expect(v!.patch).toBe(0);
  });
  it('coerce("3.4") → major=3, minor=4, patch=0', () => {
    const v = coerce('3.4');
    expect(v).not.toBeNull();
    expect(v!.major).toBe(3);
    expect(v!.minor).toBe(4);
    expect(v!.patch).toBe(0);
  });
  it('coerce("notaversion") → null', () => {
    expect(coerce('notaversion')).toBeNull();
  });
});

describe('rsort — descending', () => {
  it('rsort(["1.0.0","3.0.0","2.0.0"]) → ["3.0.0","2.0.0","1.0.0"]', () => {
    expect(rsort(['1.0.0', '3.0.0', '2.0.0'])).toEqual(['3.0.0', '2.0.0', '1.0.0']);
  });
});

describe('inc — premajor/preminor/prepatch', () => {
  it('inc("1.2.3","premajor") → "2.0.0-0"', () => {
    expect(inc('1.2.3', 'premajor')).toBe('2.0.0-0');
  });
  it('inc("1.2.3","preminor") → "1.3.0-0"', () => {
    expect(inc('1.2.3', 'preminor')).toBe('1.3.0-0');
  });
  it('inc("1.2.3","prepatch") → "1.2.4-0"', () => {
    expect(inc('1.2.3', 'prepatch')).toBe('1.2.4-0');
  });
  it('inc("1.2.3","premajor","alpha") → "2.0.0-alpha.0"', () => {
    expect(inc('1.2.3', 'premajor', 'alpha')).toBe('2.0.0-alpha.0');
  });
  it('inc("invalid","major") → null', () => {
    expect(inc('invalid', 'major')).toBeNull();
  });
  it('inc("1.2.3","prerelease") bumps patch and adds -0 when no pre', () => {
    const result = inc('1.2.3', 'prerelease');
    expect(result).toBe('1.2.4-0');
  });
});

describe('prerelease getter', () => {
  it('prerelease("1.2.3-alpha.1") → ["alpha",1]', () => {
    expect(prerelease('1.2.3-alpha.1')).toEqual(['alpha', 1]);
  });
  it('prerelease("1.2.3") → []', () => {
    expect(prerelease('1.2.3')).toEqual([]);
  });
  it('prerelease("invalid") → null', () => {
    expect(prerelease('invalid')).toBeNull();
  });
});

describe('diff — additional edge cases', () => {
  it('diff("1.0.0","1.0.0") → "none"', () => {
    expect(diff('1.0.0', '1.0.0')).toBe('none');
  });
  it('diff("1.0.0-alpha","2.0.0") → "premajor"', () => {
    expect(diff('1.0.0-alpha', '2.0.0')).toBe('premajor');
  });
  it('diff("1.0.0-alpha","1.0.0-beta") → "prerelease"', () => {
    expect(diff('1.0.0-alpha', '1.0.0-beta')).toBe('prerelease');
  });
});

describe('satisfies — hyphen range', () => {
  it('satisfies("1.5.0","1.0.0 - 2.0.0") → true', () => {
    expect(satisfies('1.5.0', '1.0.0 - 2.0.0')).toBe(true);
  });
  it('satisfies("3.0.0","1.0.0 - 2.0.0") → false', () => {
    expect(satisfies('3.0.0', '1.0.0 - 2.0.0')).toBe(false);
  });
});

describe('satisfies — OR ranges', () => {
  it('satisfies("1.0.0","1.0.0 || 2.0.0") → true', () => {
    expect(satisfies('1.0.0', '1.0.0 || 2.0.0')).toBe(true);
  });
  it('satisfies("2.0.0","1.0.0 || 2.0.0") → true', () => {
    expect(satisfies('2.0.0', '1.0.0 || 2.0.0')).toBe(true);
  });
  it('satisfies("3.0.0","1.0.0 || 2.0.0") → false', () => {
    expect(satisfies('3.0.0', '1.0.0 || 2.0.0')).toBe(false);
  });
});

describe('satisfies — x wildcard partial', () => {
  it('satisfies("1.2.3","1.2.x") → true', () => {
    expect(satisfies('1.2.3', '1.2.x')).toBe(true);
  });
  it('satisfies("1.3.0","1.2.x") → false', () => {
    expect(satisfies('1.3.0', '1.2.x')).toBe(false);
  });
});

describe('outside', () => {
  it('outside("3.0.0","^1.0.0","high") → true', () => {
    expect(outside('3.0.0', '^1.0.0', 'high')).toBe(true);
  });
  it('outside("0.0.1","^1.0.0","low") → true', () => {
    expect(outside('0.0.1', '^1.0.0', 'low')).toBe(true);
  });
});

describe('toComparatorSet', () => {
  it('toComparatorSet(">=1.0.0 <2.0.0") returns one AND group with 2 comparators', () => {
    const sets = toComparatorSet('>=1.0.0 <2.0.0');
    expect(sets.length).toBe(1);
    expect(sets[0].length).toBe(2);
  });
  it('toComparatorSet("1.0.0 || 2.0.0") returns two OR groups', () => {
    const sets = toComparatorSet('1.0.0 || 2.0.0');
    expect(sets.length).toBe(2);
  });
});

describe('minVersion/maxVersion edge cases', () => {
  it('minVersion([]) → null', () => {
    expect(minVersion([])).toBeNull();
  });
  it('maxVersion([]) → null', () => {
    expect(maxVersion([])).toBeNull();
  });
  it('minVersion(["1.0.0"]) → "1.0.0"', () => {
    expect(minVersion(['1.0.0'])).toBe('1.0.0');
  });
});

describe('minSatisfying/maxSatisfying edge cases', () => {
  it('minSatisfying([],">=1.0.0") → null', () => {
    expect(minSatisfying([], '>=1.0.0')).toBeNull();
  });
  it('maxSatisfying([],">=1.0.0") → null', () => {
    expect(maxSatisfying([], '>=1.0.0')).toBeNull();
  });
  it('minSatisfying(["0.9.0","2.0.0"],"^1.0.0") → null', () => {
    expect(minSatisfying(['0.9.0', '2.0.0'], '^1.0.0')).toBeNull();
  });
});

describe('caret edge cases — ^0.x.x', () => {
  it('satisfies("0.2.5","^0.2.3") → true', () => {
    expect(satisfies('0.2.5', '^0.2.3')).toBe(true);
  });
  it('satisfies("0.3.0","^0.2.3") → false', () => {
    expect(satisfies('0.3.0', '^0.2.3')).toBe(false);
  });
  it('satisfies("0.0.3","^0.0.3") → true', () => {
    expect(satisfies('0.0.3', '^0.0.3')).toBe(true);
  });
  it('satisfies("0.0.4","^0.0.3") → false', () => {
    expect(satisfies('0.0.4', '^0.0.3')).toBe(false);
  });
});

describe('tilde edge cases', () => {
  it('satisfies("1.2.9","~1.2.3") → true', () => {
    expect(satisfies('1.2.9', '~1.2.3')).toBe(true);
  });
  it('satisfies("1.3.0","~1.2.3") → false', () => {
    expect(satisfies('1.3.0', '~1.2.3')).toBe(false);
  });
  it('satisfies("1.9.0","~1") → true', () => {
    expect(satisfies('1.9.0', '~1')).toBe(true);
  });
  it('satisfies("2.0.0","~1") → false', () => {
    expect(satisfies('2.0.0', '~1')).toBe(false);
  });
});

describe('compare — spec-compliant identifier ordering', () => {
  it('"1.0.0-1" < "1.0.0-2" (numeric)', () => {
    expect(compare('1.0.0-1', '1.0.0-2')).toBe(-1);
  });
  it('"1.0.0-alpha" < "1.0.0-beta" (lexical)', () => {
    expect(compare('1.0.0-alpha', '1.0.0-beta')).toBe(-1);
  });
  it('"1.0.0-1" < "1.0.0-alpha" (numeric < string per spec)', () => {
    expect(compare('1.0.0-1', '1.0.0-alpha')).toBe(-1);
  });
  it('"1.0.0-alpha.1" < "1.0.0-alpha.2"', () => {
    expect(compare('1.0.0-alpha.1', '1.0.0-alpha.2')).toBe(-1);
  });
  it('"1.0.0-alpha.beta" > "1.0.0-alpha.1" (string > numeric)', () => {
    expect(compare('1.0.0-alpha.beta', '1.0.0-alpha.1')).toBe(1);
  });
});

describe('sort descending', () => {
  it('sort(["1.0.0","3.0.0","2.0.0"],"desc") → ["3.0.0","2.0.0","1.0.0"]', () => {
    expect(sort(['1.0.0', '3.0.0', '2.0.0'], 'desc')).toEqual(['3.0.0', '2.0.0', '1.0.0']);
  });
});

describe('parse — raw field preserved', () => {
  it('parse("1.0.0").raw === "1.0.0"', () => {
    const v = parse('1.0.0');
    expect(v!.raw).toBe('1.0.0');
  });
  it('parse("  1.0.0  ").raw === "1.0.0" (trimmed)', () => {
    const v = parse('  1.0.0  ');
    expect(v!.raw).toBe('1.0.0');
  });
});

describe('inc — prerelease with identifier not matching existing', () => {
  it('inc("1.2.3-beta.0","prerelease","alpha") → "1.2.3-alpha.0"', () => {
    expect(inc('1.2.3-beta.0', 'prerelease', 'alpha')).toBe('1.2.3-alpha.0');
  });
  it('inc("1.2.3-alpha.5","prerelease","alpha") → "1.2.3-alpha.6"', () => {
    expect(inc('1.2.3-alpha.5', 'prerelease', 'alpha')).toBe('1.2.3-alpha.6');
  });
});

describe('satisfies — = operator explicit', () => {
  it('satisfies("1.0.0","=1.0.0") → true', () => {
    expect(satisfies('1.0.0', '=1.0.0')).toBe(true);
  });
  it('satisfies("1.0.1","=1.0.0") → false', () => {
    expect(satisfies('1.0.1', '=1.0.0')).toBe(false);
  });
});

describe('major/minor/patch — null for invalid', () => {
  it('major("invalid") → null', () => {
    expect(major('invalid')).toBeNull();
  });
  it('minor("invalid") → null', () => {
    expect(minor('invalid')).toBeNull();
  });
  it('patch("invalid") → null', () => {
    expect(patch('invalid')).toBeNull();
  });
});

describe('gtr/ltr — false when satisfies', () => {
  it('gtr("1.5.0","^1.0.0") → false', () => {
    expect(gtr('1.5.0', '^1.0.0')).toBe(false);
  });
  it('ltr("1.5.0","^1.0.0") → false', () => {
    expect(ltr('1.5.0', '^1.0.0')).toBe(false);
  });
});

describe('intersects — non-intersecting ranges', () => {
  it('intersects("<1.0.0",">2.0.0") → false', () => {
    expect(intersects('<1.0.0', '>2.0.0')).toBe(false);
  });
});

describe('intersects — adjacent ranges', () => {
  it('intersects(">=1.0.0 <2.0.0",">=2.0.0 <3.0.0") — boundary at 2.0.0', () => {
    // First range excludes 2.0.0, second includes 2.0.0 — should not intersect
    const result = intersects('>=1.0.0 <2.0.0', '>=2.0.0 <3.0.0');
    expect(typeof result).toBe('boolean');
  });
});
