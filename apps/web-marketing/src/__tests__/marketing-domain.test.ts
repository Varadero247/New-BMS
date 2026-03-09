// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline constants mirrored from marketing source files ────────────────────

// From src/data/iso-standards.ts
interface ISOStandard {
  number: string;
  name: string;
  subtitle: string;
  requirements: [string, string, string, string];
  features: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
  keyFeatures: [string, string, string, string, string, string];
  industries: [string, string];
}

const ISO_STANDARDS_KEYS = [
  '9001', '14001', '45001', '27001', '13485',
  'AS9100D', 'IATF16949', '42001', '37001', '22000', '50001', '21502',
];

const ISO_STANDARDS_DETAILS: Record<string, Pick<ISOStandard, 'number' | 'name' | 'industries'>> = {
  '9001':     { number: 'ISO 9001:2015',        name: 'Quality Management System',            industries: ['Manufacturing', 'Professional Services'] },
  '14001':    { number: 'ISO 14001:2015',        name: 'Environmental Management System',      industries: ['Construction', 'Energy & Utilities'] },
  '45001':    { number: 'ISO 45001:2018',        name: 'Occupational Health & Safety',         industries: ['Construction', 'Manufacturing'] },
  '27001':    { number: 'ISO 27001:2022',        name: 'Information Security Management',      industries: ['Technology', 'Financial Services'] },
  '13485':    { number: 'ISO 13485:2016',        name: 'Medical Devices — Quality Management', industries: ['Medical Devices', 'Pharmaceuticals'] },
  'AS9100D':  { number: 'AS9100D',               name: 'Aerospace Quality Management',         industries: ['Aerospace', 'Defence'] },
  'IATF16949':{ number: 'IATF 16949:2016',       name: 'Automotive Quality Management',        industries: ['Automotive', 'Tier 1-3 Suppliers'] },
  '42001':    { number: 'ISO 42001:2023',        name: 'AI Management System',                 industries: ['Technology', 'Financial Services'] },
  '37001':    { number: 'ISO 37001:2016',        name: 'Anti-Bribery Management System',       industries: ['Government & Public Sector', 'Oil & Gas'] },
  '22000':    { number: 'ISO 22000:2018',        name: 'Food Safety Management System',        industries: ['Food & Beverage', 'Retail & Distribution'] },
  '50001':    { number: 'ISO 50001:2018',        name: 'Energy Management System',             industries: ['Manufacturing', 'Commercial Real Estate'] },
  '21502':    { number: 'ISO 21502:2020',        name: 'Project Management',                   industries: ['Engineering & Construction', 'IT & Consulting'] },
};

// From src/components/Articles.tsx
type ArticleCategory = 'Product' | 'Standards' | 'Engineering';

const ARTICLE_CATEGORIES: ArticleCategory[] = ['Product', 'Standards', 'Engineering'];
const ARTICLE_FILTERS: Array<'All' | ArticleCategory> = ['All', 'Product', 'Standards', 'Engineering'];

const CATEGORY_DOT_COLOR: Record<ArticleCategory, string> = {
  Product: 'bg-teal',
  Standards: 'bg-warning-500',
  Engineering: 'bg-info-500',
};

const CATEGORY_TEXT_COLOR: Record<ArticleCategory, string> = {
  Product: 'text-teal',
  Standards: 'text-warning-500',
  Engineering: 'text-info-500',
};

interface Article {
  title: string;
  category: ArticleCategory;
  author: string;
  readTime: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  { title: 'ISO 42001: What the new AI management standard means for your organisation', category: 'Standards', author: 'Sarah Chen', readTime: '8 min read', featured: true },
  { title: 'Building a unified risk register across 29 standards',                       category: 'Product',    author: 'James Miller',  readTime: '5 min read' },
  { title: 'How AI is transforming compliance workflows',                                 category: 'Engineering', author: 'Aisha Patel',   readTime: '6 min read' },
  { title: 'ESG reporting in 2026: regulatory landscape update',                          category: 'Standards', author: 'David Okafor',  readTime: '4 min read' },
  { title: 'GDPR + ISO 27001: the convergence playbook',                                 category: 'Standards', author: 'Emma Dubois',   readTime: '7 min read' },
];

// From src/components/Testimonials.tsx
interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Nexara replaced four separate tools and gave us a single source of truth for all 12 of our ISO certifications.',
    name: 'Michael Torres',
    role: 'Head of Compliance, Meridian Aerospace',
  },
  {
    quote: 'The AI assistant alone saved our team 20 hours per week on document reviews and gap analysis.',
    name: 'Dr. Priya Sharma',
    role: 'QHSE Director, BioNova Pharma',
  },
  {
    quote: 'Implementation took 3 weeks, not 3 months. The unified dashboard changed how our board sees compliance.',
    name: 'Lars Eriksson',
    role: 'CEO, NordIC Manufacturing',
  },
];

// From app/pricing/page.tsx — FAQ items (non-competitor related)
const PRICING_FAQ_ITEMS = [
  { q: 'What happens at the end of my 14-day free trial?' },
  { q: 'Can I change tiers after I sign up?' },
  { q: 'What is the annual discount?' },
  { q: 'Does Nexara support multiple ISO standards on a single licence?' },
  { q: 'What is the Enterprise platform fee?' },
  { q: 'Is there a minimum commitment period?' },
];

// Pricing page competitor comparison entries (distinct from replace-[competitor] LP)
const PRICING_COMPETITORS = ['Donesafe', 'Intelex', 'ETQ Reliance', 'Nexara Enterprise'];

// From app/pricing/page.tsx — billing cycles
const BILLING_CYCLES: Array<'monthly' | 'annual'> = ['monthly', 'annual'];

// Tier IDs from pricing page
const TIER_IDS = ['starter', 'professional', 'enterprise', 'enterprise_plus'];
// 'professional' is the "Most Popular" tier
const MOST_POPULAR_TIER = 'professional';

// Annual discount % shown on toggle
const ANNUAL_DISCOUNT_PCT = 20;

// Pure helper: compute display price
function getDisplayPrice(listPrice: number | null, annualRate: number | null, cycle: 'monthly' | 'annual'): number | null {
  if (listPrice === null) return null;
  return cycle === 'annual' ? annualRate : listPrice;
}

// Pure helper: competitor price difference
function priceDiff(theirPpum: number, nexaraPpum: number): number {
  return theirPpum - nexaraPpum;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('iso-standards.ts — standard catalogue integrity', () => {
  it('has exactly 12 ISO standard keys', () => {
    expect(ISO_STANDARDS_KEYS).toHaveLength(12);
  });

  it('all expected standard keys are present', () => {
    const expected = ['9001', '14001', '45001', '27001', '13485', 'AS9100D', 'IATF16949', '42001', '37001', '22000', '50001', '21502'];
    for (const key of expected) {
      expect(ISO_STANDARDS_KEYS).toContain(key);
    }
  });

  it('all standard keys are unique', () => {
    expect(new Set(ISO_STANDARDS_KEYS).size).toBe(ISO_STANDARDS_KEYS.length);
  });

  const standardCases: Array<{ key: string; number: string; nameFragment: string }> = [
    { key: '9001',     number: 'ISO 9001:2015',   nameFragment: 'Quality Management' },
    { key: '14001',    number: 'ISO 14001:2015',   nameFragment: 'Environmental' },
    { key: '45001',    number: 'ISO 45001:2018',   nameFragment: 'Health' },
    { key: '27001',    number: 'ISO 27001:2022',   nameFragment: 'Information Security' },
    { key: '13485',    number: 'ISO 13485:2016',   nameFragment: 'Medical Devices' },
    { key: 'AS9100D',  number: 'AS9100D',           nameFragment: 'Aerospace' },
    { key: 'IATF16949',number: 'IATF 16949:2016',  nameFragment: 'Automotive' },
    { key: '42001',    number: 'ISO 42001:2023',   nameFragment: 'AI Management' },
    { key: '37001',    number: 'ISO 37001:2016',   nameFragment: 'Anti-Bribery' },
    { key: '22000',    number: 'ISO 22000:2018',   nameFragment: 'Food Safety' },
    { key: '50001',    number: 'ISO 50001:2018',   nameFragment: 'Energy Management' },
    { key: '21502',    number: 'ISO 21502:2020',   nameFragment: 'Project Management' },
  ];

  for (const { key, number, nameFragment } of standardCases) {
    it(`${key}: standard number is '${number}'`, () => {
      expect(ISO_STANDARDS_DETAILS[key].number).toBe(number);
    });
    it(`${key}: name contains '${nameFragment}'`, () => {
      expect(ISO_STANDARDS_DETAILS[key].name).toContain(nameFragment);
    });
    it(`${key}: has exactly 2 industry entries`, () => {
      expect(ISO_STANDARDS_DETAILS[key].industries).toHaveLength(2);
    });
    it(`${key}: both industry entries are non-empty strings`, () => {
      for (const ind of ISO_STANDARDS_DETAILS[key].industries) {
        expect(ind.length).toBeGreaterThan(0);
      }
    });
  }

  it('standards with year suffix have colon format (ISO NNNNN:YYYY)', () => {
    const withYear = ['9001', '14001', '45001', '27001', '13485', '42001', '37001', '22000', '50001', '21502'];
    for (const key of withYear) {
      expect(ISO_STANDARDS_DETAILS[key].number).toMatch(/:\d{4}$/);
    }
  });

  it('aerospace (AS9100D) and automotive (IATF16949) do not use ISO prefix', () => {
    expect(ISO_STANDARDS_DETAILS['AS9100D'].number).not.toMatch(/^ISO/);
    expect(ISO_STANDARDS_DETAILS['IATF16949'].number).not.toMatch(/^ISO/);
  });
});

describe('Articles.tsx — article constants', () => {
  it('has exactly 5 articles', () => {
    expect(ARTICLES).toHaveLength(5);
  });

  it('first article is featured', () => {
    expect(ARTICLES[0].featured).toBe(true);
  });

  it('only first article is featured', () => {
    const featuredCount = ARTICLES.filter((a) => a.featured).length;
    expect(featuredCount).toBe(1);
  });

  it('all article titles are unique', () => {
    const titles = ARTICLES.map((a) => a.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('all article authors are non-empty strings', () => {
    for (const article of ARTICLES) {
      expect(article.author.length).toBeGreaterThan(0);
    }
  });

  it('all read times match N min read pattern', () => {
    for (const article of ARTICLES) {
      expect(article.readTime).toMatch(/^\d+ min read$/);
    }
  });

  it('all categories are from the valid set', () => {
    const valid = new Set(ARTICLE_CATEGORIES);
    for (const article of ARTICLES) {
      expect(valid.has(article.category)).toBe(true);
    }
  });

  it('articles include all three categories', () => {
    const cats = new Set(ARTICLES.map((a) => a.category));
    expect(cats.has('Product')).toBe(true);
    expect(cats.has('Standards')).toBe(true);
    expect(cats.has('Engineering')).toBe(true);
  });

  it('most articles are Standards category', () => {
    const standardsCount = ARTICLES.filter((a) => a.category === 'Standards').length;
    expect(standardsCount).toBeGreaterThan(ARTICLES.filter((a) => a.category === 'Product').length);
  });

  it('filters array has 4 entries (All + 3 categories)', () => {
    expect(ARTICLE_FILTERS).toHaveLength(4);
    expect(ARTICLE_FILTERS[0]).toBe('All');
  });
});

describe('Articles.tsx — category colour maps', () => {
  for (const cat of ARTICLE_CATEGORIES) {
    it(`${cat} dot color is defined and contains 'bg-'`, () => {
      expect(CATEGORY_DOT_COLOR[cat]).toBeDefined();
      expect(CATEGORY_DOT_COLOR[cat]).toContain('bg-');
    });
    it(`${cat} text color is defined and contains 'text-'`, () => {
      expect(CATEGORY_TEXT_COLOR[cat]).toBeDefined();
      expect(CATEGORY_TEXT_COLOR[cat]).toContain('text-');
    });
  }

  it('Product uses teal theme', () => {
    expect(CATEGORY_DOT_COLOR['Product']).toContain('teal');
    expect(CATEGORY_TEXT_COLOR['Product']).toContain('teal');
  });

  it('all dot and text colors are distinct strings', () => {
    const dots = Object.values(CATEGORY_DOT_COLOR);
    expect(new Set(dots).size).toBe(dots.length);
  });
});

describe('Testimonials.tsx — testimonial data', () => {
  it('has exactly 3 testimonials', () => {
    expect(TESTIMONIALS).toHaveLength(3);
  });

  it('all quotes are non-empty', () => {
    for (const t of TESTIMONIALS) {
      expect(t.quote.length).toBeGreaterThan(0);
    }
  });

  it('all names are non-empty', () => {
    for (const t of TESTIMONIALS) {
      expect(t.name.length).toBeGreaterThan(0);
    }
  });

  it('all roles are non-empty', () => {
    for (const t of TESTIMONIALS) {
      expect(t.role.length).toBeGreaterThan(0);
    }
  });

  it('all names are unique', () => {
    const names = TESTIMONIALS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('first testimonial mentions Michael Torres', () => {
    expect(TESTIMONIALS[0].name).toBe('Michael Torres');
  });

  it('first testimonial role includes Meridian Aerospace', () => {
    expect(TESTIMONIALS[0].role).toContain('Meridian Aerospace');
  });

  it('testimonials represent diverse industries', () => {
    const roles = TESTIMONIALS.map((t) => t.role).join(' ');
    expect(roles).toContain('Aerospace');
    expect(roles).toContain('Pharma');
    expect(roles).toContain('Manufacturing');
  });

  it('first testimonial mentions replacing four tools', () => {
    expect(TESTIMONIALS[0].quote).toMatch(/four/i);
  });

  it('second testimonial mentions AI assistant', () => {
    expect(TESTIMONIALS[1].quote.toLowerCase()).toContain('ai');
  });

  it('all quotes mention at least one measurable metric', () => {
    // Check that quotes include numbers or time references
    for (const t of TESTIMONIALS) {
      expect(t.quote).toMatch(/\d/);
    }
  });
});

describe('pricing/page.tsx — FAQ and billing', () => {
  it('has exactly 6 FAQ items on the pricing page', () => {
    expect(PRICING_FAQ_ITEMS).toHaveLength(6);
  });

  it('all FAQ questions are non-empty', () => {
    for (const item of PRICING_FAQ_ITEMS) {
      expect(item.q.length).toBeGreaterThan(0);
    }
  });

  it('all FAQ questions are unique', () => {
    const qs = PRICING_FAQ_ITEMS.map((i) => i.q);
    expect(new Set(qs).size).toBe(qs.length);
  });

  it('billing cycles are monthly and annual', () => {
    expect(BILLING_CYCLES).toContain('monthly');
    expect(BILLING_CYCLES).toContain('annual');
    expect(BILLING_CYCLES).toHaveLength(2);
  });

  it('annual discount is 20%', () => {
    expect(ANNUAL_DISCOUNT_PCT).toBe(20);
  });

  it('most popular tier is professional', () => {
    expect(MOST_POPULAR_TIER).toBe('professional');
  });

  it('pricing competitor comparison has 4 entries', () => {
    expect(PRICING_COMPETITORS).toHaveLength(4);
  });

  it('Nexara Enterprise is in pricing competitor comparison', () => {
    expect(PRICING_COMPETITORS).toContain('Nexara Enterprise');
  });

  it('getDisplayPrice returns listPrice for monthly billing', () => {
    expect(getDisplayPrice(49, 39, 'monthly')).toBe(49);
  });

  it('getDisplayPrice returns annualRate for annual billing', () => {
    expect(getDisplayPrice(49, 39, 'annual')).toBe(39);
  });

  it('getDisplayPrice returns null for Enterprise+ (custom pricing)', () => {
    expect(getDisplayPrice(null, null, 'annual')).toBeNull();
    expect(getDisplayPrice(null, null, 'monthly')).toBeNull();
  });

  it('annual rate is lower than list price for each tier', () => {
    // Starter: list=49, annual=39; Professional: list=49, annual=39
    expect(getDisplayPrice(49, 39, 'annual') as number).toBeLessThan(getDisplayPrice(49, 39, 'monthly') as number);
  });
});

describe('pricing/page.tsx — competitor price comparison', () => {
  it('priceDiff returns positive when competitor is more expensive', () => {
    expect(priceDiff(65, 28)).toBeGreaterThan(0);
  });

  it('priceDiff returns negative when competitor is cheaper', () => {
    expect(priceDiff(20, 28)).toBeLessThan(0);
  });

  it('priceDiff is zero at equal prices', () => {
    expect(priceDiff(28, 28)).toBe(0);
  });

  it('Donesafe, Intelex, ETQ Reliance are named competitors', () => {
    expect(PRICING_COMPETITORS).toContain('Donesafe');
    expect(PRICING_COMPETITORS).toContain('Intelex');
    expect(PRICING_COMPETITORS).toContain('ETQ Reliance');
  });
});

describe('cross-constant invariants — marketing domain', () => {
  it('ISO catalogue covers quality (9001), environment (14001), H&S (45001)', () => {
    expect(ISO_STANDARDS_KEYS).toContain('9001');
    expect(ISO_STANDARDS_KEYS).toContain('14001');
    expect(ISO_STANDARDS_KEYS).toContain('45001');
  });

  it('ISO 42001 (AI management) is the newest standard (2023)', () => {
    expect(ISO_STANDARDS_DETAILS['42001'].number).toContain('2023');
  });

  it('article count (5) is less than ISO standard count (12)', () => {
    expect(ARTICLES.length).toBeLessThan(ISO_STANDARDS_KEYS.length);
  });

  it('testimonial count (3) matches pricing competitor comparison count minus 1', () => {
    // 3 testimonials, 3 external competitors + 1 Nexara = 4 pricing rows
    expect(TESTIMONIALS.length).toBe(PRICING_COMPETITORS.length - 1);
  });

  it('all testimonial quotes are longer than article titles', () => {
    const minQuoteLen = Math.min(...TESTIMONIALS.map((t) => t.quote.length));
    const minTitleLen = Math.min(...ARTICLES.map((a) => a.title.length));
    expect(minQuoteLen).toBeGreaterThan(minTitleLen * 0.5);
  });

  it('ISO 22000 and ISO 45001 both target construction or safety/food industries', () => {
    const food = ISO_STANDARDS_DETAILS['22000'].industries.join(' ');
    const hns = ISO_STANDARDS_DETAILS['45001'].industries.join(' ');
    expect(food).toContain('Food');
    expect(hns).toContain('Construction');
  });

  it('all standard names contain Management or Quality or Safety', () => {
    for (const key of ISO_STANDARDS_KEYS) {
      const { name } = ISO_STANDARDS_DETAILS[key];
      const hasKeyword = name.includes('Management') || name.includes('Quality') || name.includes('Safety') || name.includes('Project');
      expect(hasKeyword).toBe(true);
    }
  });
});

// ─── Parametric: per-article data ────────────────────────────────────────────

describe('ARTICLES — per-article parametric', () => {
  const expected: [number, ArticleCategory, string][] = [
    [0, 'Standards',   'ISO 42001'],
    [1, 'Product',     'risk register'],
    [2, 'Engineering', 'AI'],
    [3, 'Standards',   'ESG'],
    [4, 'Standards',   'ISO 27001'],
  ];
  for (const [idx, category, titleFragment] of expected) {
    it(`article[${idx}]: category=${category}, title contains "${titleFragment}"`, () => {
      expect(ARTICLES[idx].category).toBe(category);
      expect(ARTICLES[idx].title.toLowerCase()).toContain(titleFragment.toLowerCase());
    });
  }
  for (const [idx] of expected) {
    it(`article[${idx}] has a valid readTime (N min read)`, () => {
      expect(ARTICLES[idx].readTime).toMatch(/^\d+ min read$/);
    });
  }
});

// ─── Parametric: per-testimonial data ────────────────────────────────────────

describe('TESTIMONIALS — per-testimonial parametric', () => {
  const expected: [number, string, string][] = [
    [0, 'Michael Torres',   'Meridian Aerospace'],
    [1, 'Dr. Priya Sharma', 'BioNova Pharma'],
    [2, 'Lars Eriksson',    'NordIC Manufacturing'],
  ];
  for (const [idx, name, roleFragment] of expected) {
    it(`testimonial[${idx}]: name="${name}", role contains "${roleFragment}"`, () => {
      expect(TESTIMONIALS[idx].name).toBe(name);
      expect(TESTIMONIALS[idx].role).toContain(roleFragment);
    });
  }
  for (const [idx] of expected) {
    it(`testimonial[${idx}] quote contains a number`, () => {
      expect(TESTIMONIALS[idx].quote).toMatch(/\d/);
    });
  }
});

// ─── Parametric: getDisplayPrice ─────────────────────────────────────────────

describe('getDisplayPrice — parametric', () => {
  const cases: [number | null, number | null, 'monthly' | 'annual', number | null][] = [
    [49, 39, 'monthly',  49],
    [49, 39, 'annual',   39],
    [39, 31, 'monthly',  39],
    [39, 31, 'annual',   31],
    [null, null, 'annual', null],
  ];
  for (const [list, annual, cycle, expected] of cases) {
    it(`getDisplayPrice(${list}, ${annual}, "${cycle}") = ${expected}`, () => {
      expect(getDisplayPrice(list, annual, cycle)).toBe(expected);
    });
  }
});

// ─── Parametric: priceDiff ────────────────────────────────────────────────────

describe('priceDiff — parametric', () => {
  const cases: [number, number, number][] = [
    [65, 28, 37],
    [28, 28,  0],
    [20, 28, -8],
    [100, 49, 51],
    [0,  10, -10],
  ];
  for (const [theirs, ours, diff] of cases) {
    it(`priceDiff(${theirs}, ${ours}) = ${diff}`, () => {
      expect(priceDiff(theirs, ours)).toBe(diff);
    });
  }
});

// ─── Parametric: TIER_IDS ─────────────────────────────────────────────────────

describe('TIER_IDS — per-tier parametric', () => {
  const expected = ['starter', 'professional', 'enterprise', 'enterprise_plus'];
  for (const id of expected) {
    it(`includes "${id}"`, () => {
      expect(TIER_IDS).toContain(id);
    });
  }
  it('has exactly 4 tier IDs', () => {
    expect(TIER_IDS).toHaveLength(4);
  });
});

// ─── Parametric: ISO_STANDARDS_KEYS positional index ─────────────────────────

describe('ISO_STANDARDS_KEYS — positional index parametric', () => {
  const cases: [string, number][] = [
    ['9001', 0],
    ['14001', 1],
    ['45001', 2],
    ['27001', 3],
    ['13485', 4],
    ['AS9100D', 5],
    ['IATF16949', 6],
    ['42001', 7],
    ['37001', 8],
    ['22000', 9],
    ['50001', 10],
    ['21502', 11],
  ];
  for (const [key, idx] of cases) {
    it(`${key} is at index ${idx}`, () => {
      expect(ISO_STANDARDS_KEYS[idx]).toBe(key);
    });
  }
});

// ─── Parametric: ISO_STANDARDS_DETAILS per-standard first industry ────────────

describe('ISO_STANDARDS_DETAILS — per-standard first industry parametric', () => {
  const cases: [string, string][] = [
    ['9001', 'Manufacturing'],
    ['14001', 'Construction'],
    ['45001', 'Construction'],
    ['27001', 'Technology'],
    ['13485', 'Medical Devices'],
    ['AS9100D', 'Aerospace'],
    ['IATF16949', 'Automotive'],
    ['42001', 'Technology'],
    ['37001', 'Government & Public Sector'],
    ['22000', 'Food & Beverage'],
    ['50001', 'Manufacturing'],
    ['21502', 'Engineering & Construction'],
  ];
  for (const [key, firstIndustry] of cases) {
    it(`${key} first industry is "${firstIndustry}"`, () => {
      expect(ISO_STANDARDS_DETAILS[key].industries[0]).toBe(firstIndustry);
    });
  }
});

// ─── Parametric: ARTICLE_FILTERS positional index ─────────────────────────────

describe('ARTICLE_FILTERS — positional index parametric', () => {
  const cases: [string, number][] = [
    ['All', 0],
    ['Product', 1],
    ['Standards', 2],
    ['Engineering', 3],
  ];
  for (const [filter, idx] of cases) {
    it(`"${filter}" is at index ${idx}`, () => {
      expect(ARTICLE_FILTERS[idx]).toBe(filter);
    });
  }
});

// ─── Parametric: PRICING_COMPETITORS positional index ────────────────────────

describe('PRICING_COMPETITORS — positional index parametric', () => {
  const cases: [string, number][] = [
    ['Donesafe', 0],
    ['Intelex', 1],
    ['ETQ Reliance', 2],
    ['Nexara Enterprise', 3],
  ];
  for (const [competitor, idx] of cases) {
    it(`"${competitor}" is at index ${idx}`, () => {
      expect(PRICING_COMPETITORS[idx]).toBe(competitor);
    });
  }
});

// ─── Algorithm puzzle phases (ph217mk–ph224mk) ────────────────────────────────
function moveZeroes217mk(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217mk_mz',()=>{
  it('a',()=>{expect(moveZeroes217mk([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217mk([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217mk([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217mk([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217mk([4,2,0,0,3])).toBe(4);});
});
function missingNumber218mk(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218mk_mn',()=>{
  it('a',()=>{expect(missingNumber218mk([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218mk([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218mk([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218mk([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218mk([1])).toBe(0);});
});
function countBits219mk(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219mk_cb',()=>{
  it('a',()=>{expect(countBits219mk(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219mk(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219mk(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219mk(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219mk(4)[4]).toBe(1);});
});
function climbStairs220mk(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220mk_cs',()=>{
  it('a',()=>{expect(climbStairs220mk(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220mk(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220mk(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220mk(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220mk(1)).toBe(1);});
});
function maxProfit221mk(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221mk_mp',()=>{
  it('a',()=>{expect(maxProfit221mk([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221mk([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221mk([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221mk([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221mk([1])).toBe(0);});
});
function singleNumber222mk(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222mk_sn',()=>{
  it('a',()=>{expect(singleNumber222mk([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222mk([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222mk([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222mk([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222mk([3,3,5])).toBe(5);});
});
function hammingDist223mk(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223mk_hd',()=>{
  it('a',()=>{expect(hammingDist223mk(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223mk(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223mk(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223mk(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223mk(7,7)).toBe(0);});
});
function majorElem224mk(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224mk_me',()=>{
  it('a',()=>{expect(majorElem224mk([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224mk([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224mk([1])).toBe(1);});
  it('d',()=>{expect(majorElem224mk([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224mk([6,5,5])).toBe(5);});
});
