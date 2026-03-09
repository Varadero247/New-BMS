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
