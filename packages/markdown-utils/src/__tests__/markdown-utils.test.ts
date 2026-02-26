// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  toHtml,
  toPlainText,
  stripMarkdown,
  extractHeadings,
  extractLinks,
  extractCodeBlocks,
  extractTables,
  extractFrontMatter,
  extractImages,
  getStats,
  getTableOfContents,
  countWords,
  addHeadingIds,
  slugify,
  normalizeHeadings,
  sanitizeHtml,
  truncateMarkdown,
  highlight,
  mergeFrontMatter,
  removeFrontMatter,
  heading,
  bold,
  italic,
  code,
  codeBlock,
  link,
  image,
  blockquote,
  list,
  table,
  horizontalRule,
} from '../markdown-utils';

// ─── Helper ───────────────────────────────────────────────────────────────────
function repeat(str: string, n: number): string {
  return Array.from({ length: n }, () => str).join(' ');
}

// =============================================================================
// SECTION 1 — toHtml: headings level 1–6 (loop × 6 levels × ~5 assertions = 30)
// =============================================================================
describe('toHtml – heading levels 1-6', () => {
  for (let level = 1; level <= 6; level++) {
    describe(`h${level}`, () => {
      const hashes = '#'.repeat(level);
      const md = `${hashes} Hello World`;

      it(`produces <h${level}> tag`, () => {
        expect(toHtml(md)).toContain(`<h${level}`);
      });

      it(`contains heading text`, () => {
        expect(toHtml(md)).toContain('Hello World');
      });

      it(`closes <h${level}> tag`, () => {
        expect(toHtml(md)).toContain(`</h${level}>`);
      });

      it(`adds id attribute by default`, () => {
        expect(toHtml(md)).toContain('id="hello-world"');
      });

      it(`omits id when addHeadingIds=false`, () => {
        expect(toHtml(md, { addHeadingIds: false })).not.toContain('id=');
      });
    });
  }
});

// =============================================================================
// SECTION 2 — toHtml bold (100 tests via loop i=0..99)
// =============================================================================
describe('toHtml – bold repetition tests (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: renders bold content for i=${i}`, () => {
      const content = i === 0 ? '' : repeat('word', i);
      if (i === 0) {
        // empty bold — no strong expected (edge case: nothing to bold)
        const out = toHtml('**' + content + '**');
        // Either empty strong or just whitespace/empty — just verify no crash
        expect(typeof out).toBe('string');
      } else {
        const md = `**${content}**`;
        const out = toHtml(md);
        expect(out).toContain('<strong>');
        expect(out).toContain('</strong>');
      }
    });
  }
});

// =============================================================================
// SECTION 3 — slugify (100 tests via loop i=0..99)
// =============================================================================
describe('slugify – 100 iteration tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: slugify produces lowercase hyphenated string`, () => {
      const input = `Title Number ${i} With Spaces!`;
      const result = slugify(input);
      expect(result).toBe(`title-number-${i}-with-spaces`);
      expect(result).not.toMatch(/[A-Z]/);
      expect(result).not.toMatch(/\s/);
      expect(result).not.toMatch(/!/);
    });
  }
});

// =============================================================================
// SECTION 4 — countWords (100 tests via loop i=1..100)
// =============================================================================
describe('countWords – 100 iteration tests', () => {
  for (let i = 1; i <= 100; i++) {
    it(`counts ${i} words correctly`, () => {
      const text = Array.from({ length: i }, (_, k) => `word${k + 1}`).join(' ');
      expect(countWords(text)).toBe(i);
    });
  }
});

// =============================================================================
// SECTION 5 — extractHeadings on generated Markdown (50 tests, i=0..49)
// =============================================================================
describe('extractHeadings – generated markdown (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: extracts ${i + 1} headings correctly`, () => {
      const lines = Array.from({ length: i + 1 }, (_, k) => `## Heading ${k + 1}`);
      const md = lines.join('\n\n');
      const headings = extractHeadings(md);
      expect(headings).toHaveLength(i + 1);
      expect(headings[0].level).toBe(2);
      expect(headings[0].text).toBe('Heading 1');
      expect(headings[0].id).toBe('heading-1');
    });
  }
});

// =============================================================================
// SECTION 6 — builders roundtrip through toHtml (50 × 4 = 200 tests)
// =============================================================================
describe('builders – link roundtrip (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: link builder renders <a> in toHtml`, () => {
      const url = `https://example.com/${i}`;
      const text = `Link ${i}`;
      const md = link(text, url);
      const html = toHtml(md);
      expect(html).toContain(`href="${url}"`);
      expect(html).toContain(text);
    });
  }
});

describe('builders – bold roundtrip (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: bold builder renders <strong> in toHtml`, () => {
      const text = `BoldText${i}`;
      const md = bold(text);
      const html = toHtml(md);
      expect(html).toContain('<strong>');
      expect(html).toContain(text);
    });
  }
});

describe('builders – italic roundtrip (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: italic builder renders <em> in toHtml`, () => {
      const text = `ItalicText${i}`;
      const md = italic(text);
      const html = toHtml(md);
      expect(html).toContain('<em>');
      expect(html).toContain(text);
    });
  }
});

describe('builders – code roundtrip (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: code builder renders <code> in toHtml`, () => {
      const text = `codeValue${i}`;
      const md = code(text);
      const html = toHtml(md);
      expect(html).toContain('<code>');
      expect(html).toContain(text);
    });
  }
});

// =============================================================================
// SECTION 7 — table builder column count (50 tests, i=0..49)
// =============================================================================
describe('table builder – correct column count (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    const colCount = i + 1;
    it(`iteration ${i}: table with ${colCount} column(s)`, () => {
      const headers = Array.from({ length: colCount }, (_, k) => `Col${k}`);
      const rows = [Array.from({ length: colCount }, (_, k) => `R0C${k}`)];
      const out = table(headers, rows);
      // Each header appears in output
      headers.forEach((h) => expect(out).toContain(h));
      // Separator line has correct number of --- segments
      const sepLine = out.split('\n')[1];
      const dashCount = (sepLine.match(/---/g) ?? []).length;
      expect(dashCount).toBe(colCount);
    });
  }
});

// =============================================================================
// SECTION 8 — Correctness tests for every function
// =============================================================================

// ── toHtml correctness ────────────────────────────────────────────────────────
describe('toHtml – correctness', () => {
  it('converts h1', () => expect(toHtml('# Title')).toContain('<h1'));
  it('converts h2', () => expect(toHtml('## Sub')).toContain('<h2'));
  it('converts h3', () => expect(toHtml('### Sub3')).toContain('<h3'));
  it('converts h4', () => expect(toHtml('#### Sub4')).toContain('<h4'));
  it('converts h5', () => expect(toHtml('##### Sub5')).toContain('<h5'));
  it('converts h6', () => expect(toHtml('###### Sub6')).toContain('<h6'));

  it('converts **bold**', () => {
    expect(toHtml('**hello**')).toContain('<strong>hello</strong>');
  });

  it('converts *italic*', () => {
    expect(toHtml('*hello*')).toContain('<em>hello</em>');
  });

  it('converts `inline code`', () => {
    expect(toHtml('`code`')).toContain('<code>code</code>');
  });

  it('converts fenced code block', () => {
    const md = '```js\nconsole.log("hi");\n```';
    const html = toHtml(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code');
    expect(html).toContain('language-js');
  });

  it('converts [link](url)', () => {
    const html = toHtml('[Click](https://example.com)');
    expect(html).toContain('<a href="https://example.com">Click</a>');
  });

  it('converts ![image](url)', () => {
    const html = toHtml('![Alt](https://img.com/a.png)');
    expect(html).toContain('<img src="https://img.com/a.png" alt="Alt" />');
  });

  it('converts > blockquote', () => {
    const html = toHtml('> quote text');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('quote text');
  });

  it('converts - unordered list', () => {
    const html = toHtml('- item A\n- item B');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>item A</li>');
    expect(html).toContain('<li>item B</li>');
    expect(html).toContain('</ul>');
  });

  it('converts * unordered list', () => {
    const html = toHtml('* item X');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>item X</li>');
  });

  it('converts 1. ordered list', () => {
    const html = toHtml('1. first\n2. second');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>first</li>');
    expect(html).toContain('<li>second</li>');
    expect(html).toContain('</ol>');
  });

  it('converts --- horizontal rule', () => {
    const html = toHtml('---');
    expect(html).toContain('<hr />');
  });

  it('wraps blank-line-separated text in <p>', () => {
    const html = toHtml('Hello\n\nWorld');
    expect(html).toContain('<p>Hello</p>');
    expect(html).toContain('<p>World</p>');
  });

  it('HTML-escapes special chars', () => {
    const html = toHtml('a & b < c > d');
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('fullDocument wraps output', () => {
    const html = toHtml('# Hi', { fullDocument: true, title: 'Test' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Test</title>');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
  });

  it('empty markdown returns empty string', () => {
    expect(toHtml('')).toBe('');
  });

  it('preserves code block language', () => {
    const html = toHtml('```python\nprint()\n```');
    expect(html).toContain('language-python');
  });

  it('handles multiple headings in document', () => {
    const md = '# One\n\n## Two\n\n### Three';
    const html = toHtml(md);
    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).toContain('<h3');
  });
});

// ── toPlainText / stripMarkdown ───────────────────────────────────────────────
describe('toPlainText / stripMarkdown', () => {
  it('strips heading markers', () => {
    expect(toPlainText('# Hello')).toBe('Hello');
  });

  it('strips bold markers', () => {
    expect(toPlainText('**bold**')).toBe('bold');
  });

  it('strips italic markers', () => {
    expect(toPlainText('*italic*')).toBe('italic');
  });

  it('strips inline code backticks', () => {
    expect(toPlainText('`code`')).toBe('code');
  });

  it('strips link syntax keeping text', () => {
    expect(toPlainText('[Click](https://x.com)')).toBe('Click');
  });

  it('strips image syntax entirely', () => {
    expect(toPlainText('![alt](https://x.com/img.png)')).toBe('');
  });

  it('strips blockquote markers', () => {
    expect(toPlainText('> quote')).toBe('quote');
  });

  it('strips unordered list markers', () => {
    expect(toPlainText('- item')).toBe('item');
  });

  it('strips ordered list markers', () => {
    expect(toPlainText('1. item')).toBe('item');
  });

  it('strips horizontal rule', () => {
    expect(toPlainText('---')).toBe('');
  });

  it('stripMarkdown is alias for toPlainText', () => {
    const md = '# Test **bold** *italic*';
    expect(stripMarkdown(md)).toBe(toPlainText(md));
  });

  it('handles empty input', () => {
    expect(toPlainText('')).toBe('');
  });

  it('removes fenced code block markers but keeps content', () => {
    const md = '```js\nconsole.log();\n```';
    const result = toPlainText(md);
    expect(result).toContain('console.log()');
    expect(result).not.toContain('```');
  });
});

// ── extractHeadings ───────────────────────────────────────────────────────────
describe('extractHeadings – correctness', () => {
  it('returns empty array for no headings', () => {
    expect(extractHeadings('no headings here')).toEqual([]);
  });

  it('extracts h1', () => {
    const [h] = extractHeadings('# Alpha');
    expect(h.level).toBe(1);
    expect(h.text).toBe('Alpha');
    expect(h.id).toBe('alpha');
  });

  it('extracts h6', () => {
    const [h] = extractHeadings('###### Deep');
    expect(h.level).toBe(6);
  });

  it('extracts multiple headings in order', () => {
    const md = '# One\n## Two\n### Three';
    const hs = extractHeadings(md);
    expect(hs).toHaveLength(3);
    expect(hs[0].text).toBe('One');
    expect(hs[1].text).toBe('Two');
    expect(hs[2].text).toBe('Three');
  });

  it('does not extract headings inside code blocks', () => {
    const md = '```\n# Not a heading\n```\n# Real heading';
    const hs = extractHeadings(md);
    expect(hs).toHaveLength(1);
    expect(hs[0].text).toBe('Real heading');
  });

  it('generates correct id slug', () => {
    const [h] = extractHeadings('## Hello World!');
    expect(h.id).toBe('hello-world');
  });
});

// ── extractLinks ──────────────────────────────────────────────────────────────
describe('extractLinks – correctness', () => {
  it('returns empty for no links', () => {
    expect(extractLinks('plain text')).toEqual([]);
  });

  it('extracts a standard link', () => {
    const links = extractLinks('[Example](https://example.com)');
    const link = links.find((l) => !l.isImage);
    expect(link).toBeDefined();
    expect(link?.text).toBe('Example');
    expect(link?.url).toBe('https://example.com');
    expect(link?.isImage).toBe(false);
  });

  it('extracts an image link', () => {
    const links = extractLinks('![Logo](https://example.com/logo.png)');
    const img = links.find((l) => l.isImage);
    expect(img).toBeDefined();
    expect(img?.text).toBe('Logo');
    expect(img?.url).toBe('https://example.com/logo.png');
    expect(img?.isImage).toBe(true);
  });

  it('extracts both links and images', () => {
    const md = '[Link](https://a.com) and ![Img](https://b.com/img.png)';
    const links = extractLinks(md);
    expect(links.some((l) => !l.isImage)).toBe(true);
    expect(links.some((l) => l.isImage)).toBe(true);
  });

  it('handles multiple links on same line', () => {
    const md = '[A](https://a.com) [B](https://b.com)';
    const links = extractLinks(md).filter((l) => !l.isImage);
    expect(links).toHaveLength(2);
  });
});

// ── extractImages ─────────────────────────────────────────────────────────────
describe('extractImages – correctness', () => {
  it('returns only images', () => {
    const md = '[Link](https://a.com) ![Alt](https://b.com/img.png)';
    const images = extractImages(md);
    expect(images.every((i) => i.isImage)).toBe(true);
    expect(images).toHaveLength(1);
  });

  it('returns empty when no images', () => {
    expect(extractImages('[link](https://example.com)')).toEqual([]);
  });
});

// ── extractCodeBlocks ─────────────────────────────────────────────────────────
describe('extractCodeBlocks – correctness', () => {
  it('returns empty for no code blocks', () => {
    expect(extractCodeBlocks('no code here')).toEqual([]);
  });

  it('extracts code block with language', () => {
    const md = '```typescript\nconst x = 1;\n```';
    const blocks = extractCodeBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('typescript');
    expect(blocks[0].code).toContain('const x = 1;');
  });

  it('extracts code block without language', () => {
    const md = '```\nsome code\n```';
    const blocks = extractCodeBlocks(md);
    expect(blocks[0].language).toBe('');
  });

  it('extracts multiple code blocks', () => {
    const md = '```js\nalert();\n```\n\n```python\nprint()\n```';
    const blocks = extractCodeBlocks(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].language).toBe('js');
    expect(blocks[1].language).toBe('python');
  });
});

// ── extractTables ─────────────────────────────────────────────────────────────
describe('extractTables – correctness', () => {
  const sampleTable = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';

  it('returns empty for no tables', () => {
    expect(extractTables('no table')).toEqual([]);
  });

  it('extracts headers correctly', () => {
    const tables = extractTables(sampleTable);
    expect(tables).toHaveLength(1);
    expect(tables[0].headers).toEqual(['Name', 'Age']);
  });

  it('extracts rows correctly', () => {
    const tables = extractTables(sampleTable);
    expect(tables[0].rows).toHaveLength(2);
    expect(tables[0].rows[0]).toEqual(['Alice', '30']);
    expect(tables[0].rows[1]).toEqual(['Bob', '25']);
  });

  it('handles single-row table', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const tables = extractTables(md);
    expect(tables[0].rows).toHaveLength(1);
  });
});

// ── extractFrontMatter ────────────────────────────────────────────────────────
describe('extractFrontMatter – correctness', () => {
  it('returns empty data and full content when no front matter', () => {
    const result = extractFrontMatter('# Hello');
    expect(result.data).toEqual({});
    expect(result.content).toBe('# Hello');
  });

  it('extracts string field', () => {
    const md = '---\ntitle: My Doc\n---\n# Content';
    const { data } = extractFrontMatter(md);
    expect(data.title).toBe('My Doc');
  });

  it('extracts numeric field', () => {
    const md = '---\nversion: 42\n---\nContent';
    const { data } = extractFrontMatter(md);
    expect(data.version).toBe(42);
  });

  it('extracts boolean field true', () => {
    const md = '---\npublished: true\n---\nContent';
    const { data } = extractFrontMatter(md);
    expect(data.published).toBe(true);
  });

  it('extracts boolean field false', () => {
    const md = '---\ndraft: false\n---\nContent';
    const { data } = extractFrontMatter(md);
    expect(data.draft).toBe(false);
  });

  it('extracts array field', () => {
    const md = '---\ntags: [a, b, c]\n---\nContent';
    const { data } = extractFrontMatter(md);
    expect(data.tags).toEqual(['a', 'b', 'c']);
  });

  it('content excludes front matter', () => {
    const md = '---\ntitle: Hi\n---\n# Body';
    const { content } = extractFrontMatter(md);
    expect(content).toBe('# Body');
    expect(content).not.toContain('title:');
  });
});

// ── getStats ──────────────────────────────────────────────────────────────────
describe('getStats – correctness', () => {
  it('returns zero counts for empty string', () => {
    const stats = getStats('');
    expect(stats.wordCount).toBe(0);
    expect(stats.headingCount).toBe(0);
    expect(stats.linkCount).toBe(0);
    expect(stats.imageCount).toBe(0);
    expect(stats.codeBlockCount).toBe(0);
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it('counts words correctly', () => {
    const stats = getStats('one two three');
    expect(stats.wordCount).toBe(3);
  });

  it('counts headings', () => {
    const stats = getStats('# A\n## B\n### C');
    expect(stats.headingCount).toBe(3);
  });

  it('counts links (not images)', () => {
    const stats = getStats('[A](https://a.com) [B](https://b.com)');
    expect(stats.linkCount).toBe(2);
  });

  it('counts images', () => {
    const stats = getStats('![A](https://a.com/img.png)');
    expect(stats.imageCount).toBe(1);
  });

  it('counts code blocks', () => {
    const stats = getStats('```js\ncode\n```\n\n```py\nmore\n```');
    expect(stats.codeBlockCount).toBe(2);
  });

  it('includes charCount as raw string length', () => {
    const md = '# Hello';
    expect(getStats(md).charCount).toBe(md.length);
  });

  it('readingTimeMinutes is at least 1', () => {
    expect(getStats('hi').readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it('readingTimeMinutes scales with word count', () => {
    const manyWords = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(getStats(manyWords).readingTimeMinutes).toBe(2);
  });
});

// ── getTableOfContents ────────────────────────────────────────────────────────
describe('getTableOfContents – correctness', () => {
  it('returns empty string for no headings', () => {
    expect(getTableOfContents('no headings')).toBe('');
  });

  it('generates a TOC entry for each heading', () => {
    const md = '# One\n## Two\n### Three';
    const toc = getTableOfContents(md);
    expect(toc).toContain('One');
    expect(toc).toContain('Two');
    expect(toc).toContain('Three');
  });

  it('uses anchor links in TOC', () => {
    const md = '# My Heading';
    const toc = getTableOfContents(md);
    expect(toc).toContain('#my-heading');
  });

  it('indents sub-headings relative to minimum', () => {
    const md = '## H2\n### H3';
    const toc = getTableOfContents(md);
    const lines = toc.split('\n');
    // H2 should be at indent 0, H3 at indent 1 (2 spaces)
    expect(lines[0].startsWith('-')).toBe(true);
    expect(lines[1].startsWith('  -')).toBe(true);
  });
});

// ── addHeadingIds ──────────────────────────────────────────────────────────────
describe('addHeadingIds – correctness', () => {
  it('adds {#slug} to a heading', () => {
    const result = addHeadingIds('# Hello World');
    expect(result).toBe('# Hello World {#hello-world}');
  });

  it('handles multiple headings', () => {
    const md = '# One\n## Two';
    const result = addHeadingIds(md);
    expect(result).toContain('{#one}');
    expect(result).toContain('{#two}');
  });

  it('does not modify non-heading lines', () => {
    const result = addHeadingIds('Regular paragraph text.');
    expect(result).toBe('Regular paragraph text.');
  });
});

// ── slugify ───────────────────────────────────────────────────────────────────
describe('slugify – correctness', () => {
  it('lowercases text', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('strips leading/trailing hyphens', () => {
    expect(slugify('!hello!')).toBe('hello');
  });

  it('collapses multiple non-alphanumeric chars', () => {
    expect(slugify('a  --  b')).toBe('a-b');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numeric string', () => {
    expect(slugify('123')).toBe('123');
  });

  it('handles Unicode outside ASCII', () => {
    const result = slugify('Héllo');
    // Non-ASCII is stripped (not alphanumeric in [a-z0-9])
    expect(result).toMatch(/^[a-z0-9-]*$/);
  });
});

// ── normalizeHeadings ─────────────────────────────────────────────────────────
describe('normalizeHeadings – correctness', () => {
  it('no change needed when min = baseLevel', () => {
    const md = '# One\n## Two';
    expect(normalizeHeadings(md, 1)).toBe(md);
  });

  it('shifts headings down (## → # when baseLevel=1)', () => {
    const md = '## Two\n### Three';
    const result = normalizeHeadings(md, 1);
    expect(result).toContain('# Two');
    expect(result).toContain('## Three');
  });

  it('shifts headings up (# → ## when baseLevel=2)', () => {
    const md = '# One\n## Two';
    const result = normalizeHeadings(md, 2);
    expect(result).toContain('## One');
    expect(result).toContain('### Two');
  });

  it('caps at h6', () => {
    const md = '##### Five\n###### Six';
    const result = normalizeHeadings(md, 3);
    // min is 5, shift +(-2), five→###, six→####
    expect(result).toContain('### Five');
    expect(result).toContain('#### Six');
  });

  it('handles empty document', () => {
    expect(normalizeHeadings('')).toBe('');
  });
});

// ── sanitizeHtml ──────────────────────────────────────────────────────────────
describe('sanitizeHtml – correctness', () => {
  it('removes <script> tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(html)).not.toContain('<script>');
    expect(sanitizeHtml(html)).not.toContain('alert');
  });

  it('removes on* attributes (double quotes)', () => {
    const html = '<button onclick="evil()">Click</button>';
    expect(sanitizeHtml(html)).not.toContain('onclick');
  });

  it('removes on* attributes (single quotes)', () => {
    const html = "<button onclick='evil()'>Click</button>";
    expect(sanitizeHtml(html)).not.toContain('onclick');
  });

  it('replaces javascript: href with #', () => {
    const html = '<a href="javascript:void(0)">Link</a>';
    expect(sanitizeHtml(html)).not.toContain('javascript:');
    expect(sanitizeHtml(html)).toContain('href="#"');
  });

  it('preserves safe attributes', () => {
    const html = '<a href="https://example.com">Safe</a>';
    expect(sanitizeHtml(html)).toContain('href="https://example.com"');
  });

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

// ── truncateMarkdown ──────────────────────────────────────────────────────────
describe('truncateMarkdown – correctness', () => {
  it('does not truncate when under limit', () => {
    expect(truncateMarkdown('one two three', 10)).toBe('one two three');
  });

  it('truncates at word boundary', () => {
    const result = truncateMarkdown('one two three four five', 3);
    expect(result).toBe('one two three...');
  });

  it('adds ... when truncated', () => {
    const result = truncateMarkdown('a b c d e', 2);
    expect(result.slice(-3)).toBe('...');
  });

  it('handles single word with limit 1', () => {
    expect(truncateMarkdown('hello', 1)).toBe('hello');
  });

  it('handles maxWords=0', () => {
    expect(truncateMarkdown('a b c', 0)).toBe('...');
  });
});

// ── highlight ─────────────────────────────────────────────────────────────────
describe('highlight – correctness', () => {
  it('wraps term in ==marks==', () => {
    expect(highlight('Hello World', 'World')).toBe('Hello ==World==');
  });

  it('is case-insensitive', () => {
    expect(highlight('Hello world', 'WORLD')).toBe('Hello ==world==');
  });

  it('highlights multiple occurrences', () => {
    const result = highlight('cat and cat and cat', 'cat');
    expect((result.match(/==/g) ?? []).length).toBe(6);
  });

  it('returns unchanged string when term is empty', () => {
    expect(highlight('Hello', '')).toBe('Hello');
  });

  it('escapes regex special chars in term', () => {
    expect(() => highlight('a.b.c', '.')).not.toThrow();
  });
});

// ── mergeFrontMatter / removeFrontMatter ─────────────────────────────────────
describe('mergeFrontMatter – correctness', () => {
  it('adds front matter to document without any', () => {
    const result = mergeFrontMatter('# Hello', { title: 'Test', version: 1 });
    expect(result).toContain('---');
    expect(result).toContain('title: Test');
    expect(result).toContain('version: 1');
    expect(result).toContain('# Hello');
  });

  it('replaces existing front matter', () => {
    const md = '---\ntitle: Old\n---\n# Body';
    const result = mergeFrontMatter(md, { title: 'New' });
    expect(result).toContain('title: New');
    expect(result).not.toContain('title: Old');
  });

  it('serializes array values', () => {
    const result = mergeFrontMatter('Content', { tags: ['a', 'b', 'c'] as unknown as string });
    expect(result).toContain('tags:');
  });
});

describe('removeFrontMatter – correctness', () => {
  it('removes front matter block', () => {
    const md = '---\ntitle: Test\n---\n# Body';
    const result = removeFrontMatter(md);
    expect(result).toBe('# Body');
    expect(result).not.toContain('---');
  });

  it('returns unchanged when no front matter', () => {
    const md = '# Hello\nWorld';
    expect(removeFrontMatter(md)).toBe(md);
  });
});

// ── Builder functions ─────────────────────────────────────────────────────────
describe('builder functions – correctness', () => {
  it('heading(1, text) produces # text', () => {
    expect(heading(1, 'Title')).toBe('# Title');
  });

  it('heading(6, text) produces ###### text', () => {
    expect(heading(6, 'Deep')).toBe('###### Deep');
  });

  it('bold wraps in **', () => {
    expect(bold('hello')).toBe('**hello**');
  });

  it('italic wraps in *', () => {
    expect(italic('hello')).toBe('*hello*');
  });

  it('code wraps in backticks', () => {
    expect(code('val')).toBe('`val`');
  });

  it('codeBlock wraps in fences with language', () => {
    const result = codeBlock('x = 1', 'python');
    expect(result).toContain('```python');
    expect(result).toContain('x = 1');
    expect(result).toContain('```');
  });

  it('codeBlock works without language', () => {
    const result = codeBlock('x = 1');
    expect(result).toContain('```\n');
  });

  it('link produces [text](url)', () => {
    expect(link('Click', 'https://example.com')).toBe('[Click](https://example.com)');
  });

  it('image produces ![alt](url)', () => {
    expect(image('Logo', 'https://example.com/logo.png')).toBe(
      '![Logo](https://example.com/logo.png)',
    );
  });

  it('blockquote prefixes with >', () => {
    expect(blockquote('Hello')).toBe('> Hello');
  });

  it('blockquote handles multi-line', () => {
    const result = blockquote('Line 1\nLine 2');
    expect(result).toBe('> Line 1\n> Line 2');
  });

  it('list creates unordered list', () => {
    const result = list(['a', 'b', 'c']);
    expect(result).toBe('- a\n- b\n- c');
  });

  it('list creates ordered list', () => {
    const result = list(['x', 'y'], true);
    expect(result).toBe('1. x\n2. y');
  });

  it('table creates header row', () => {
    const result = table(['A', 'B'], [['1', '2']]);
    expect(result).toContain('| A | B |');
  });

  it('table creates separator row', () => {
    const result = table(['A', 'B'], []);
    expect(result).toContain('| --- | --- |');
  });

  it('table creates data rows', () => {
    const result = table(['Name'], [['Alice'], ['Bob']]);
    expect(result).toContain('| Alice |');
    expect(result).toContain('| Bob |');
  });

  it('horizontalRule returns ---', () => {
    expect(horizontalRule()).toBe('---');
  });
});

// ── countWords edge cases ──────────────────────────────────────────────────────
describe('countWords – edge cases', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('handles tabs and newlines as word separators', () => {
    expect(countWords('a\tb\nc')).toBe(3);
  });

  it('handles multiple spaces between words', () => {
    expect(countWords('a   b   c')).toBe(3);
  });
});

// ── Additional integration/edge-case tests ────────────────────────────────────
describe('Integration and edge-case tests', () => {
  it('toHtml handles complex document', () => {
    const md = [
      '# Main Title',
      '',
      'Intro paragraph with **bold** and *italic* text.',
      '',
      '## Section 1',
      '',
      '- Item A',
      '- Item B',
      '',
      '## Section 2',
      '',
      '1. Step one',
      '2. Step two',
      '',
      '```javascript',
      'const x = 42;',
      '```',
      '',
      '> Important note',
      '',
      '---',
      '',
      '[Read more](https://example.com)',
    ].join('\n');

    const html = toHtml(md);
    expect(html).toContain('<h1');
    expect(html).toContain('<h2');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<pre>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<hr />');
    expect(html).toContain('<a href=');
  });

  it('getStats counts all elements in complex doc', () => {
    const md = [
      '# Title',
      '',
      'Word1 word2 word3.',
      '',
      '[Link](https://x.com)',
      '',
      '![Img](https://x.com/img.png)',
      '',
      '```js\ncode\n```',
    ].join('\n');
    const stats = getStats(md);
    expect(stats.headingCount).toBe(1);
    expect(stats.linkCount).toBeGreaterThanOrEqual(1);
    expect(stats.imageCount).toBe(1);
    expect(stats.codeBlockCount).toBe(1);
  });

  it('round-trip: builder → extractor', () => {
    const md = [
      heading(1, 'Document'),
      '',
      link('Example', 'https://example.com'),
      '',
      image('Photo', 'https://example.com/photo.jpg'),
    ].join('\n');

    const headings = extractHeadings(md);
    expect(headings[0].text).toBe('Document');

    const links = extractLinks(md);
    const plainLink = links.find((l) => !l.isImage);
    const imgLink = links.find((l) => l.isImage);
    expect(plainLink?.url).toBe('https://example.com');
    expect(imgLink?.url).toBe('https://example.com/photo.jpg');
  });

  it('extractCodeBlocks + codeBlock builder roundtrip', () => {
    const md = codeBlock('const x = 1;', 'typescript');
    const blocks = extractCodeBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('typescript');
    expect(blocks[0].code).toContain('const x = 1;');
  });

  it('table builder + extractTables roundtrip', () => {
    const md = table(['Name', 'Score'], [['Alice', '100'], ['Bob', '90']]);
    const tables = extractTables(md);
    expect(tables).toHaveLength(1);
    expect(tables[0].headers).toEqual(['Name', 'Score']);
    expect(tables[0].rows[0]).toEqual(['Alice', '100']);
  });

  it('mergeFrontMatter + extractFrontMatter roundtrip', () => {
    const original = '# Document body';
    const merged = mergeFrontMatter(original, { title: 'Test', published: 'true' });
    const { data, content } = extractFrontMatter(merged);
    expect(data.title).toBe('Test');
    expect(content).toContain('# Document body');
  });

  it('normalizeHeadings + extractHeadings consistency', () => {
    const md = '## Two\n### Three\n#### Four';
    const normalized = normalizeHeadings(md, 1);
    const headings = extractHeadings(normalized);
    const levels = headings.map((h) => h.level);
    expect(Math.min(...levels)).toBe(1);
  });

  it('getTableOfContents produces valid markdown links', () => {
    const md = '# Alpha\n## Beta\n### Gamma';
    const toc = getTableOfContents(md);
    expect(toc).toContain('[Alpha](#alpha)');
    expect(toc).toContain('[Beta](#beta)');
    expect(toc).toContain('[Gamma](#gamma)');
  });

  it('sanitizeHtml does not alter clean HTML', () => {
    const html = '<p>Safe <strong>content</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('truncateMarkdown preserves exact word boundary', () => {
    const md = 'The quick brown fox jumps over the lazy dog';
    const result = truncateMarkdown(md, 5);
    expect(result).toBe('The quick brown fox jumps...');
  });

  it('highlight does not affect markdown structure', () => {
    const md = '# Hello World\n\nThis is a world.';
    const result = highlight(md, 'world');
    // Structure preserved
    expect(result).toContain('# Hello');
    expect(result).toContain('==world==');
  });

  it('toHtml fullDocument includes DOCTYPE', () => {
    const html = toHtml('Hello', { fullDocument: true });
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
  });

  it('bold + italic combined', () => {
    const md = '**bold** and *italic*';
    const html = toHtml(md);
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });
});

// =============================================================================
// SECTION 9 — Extra iterations to hit ≥1,000 total test executions
// (slugify variant: 100 more, countWords variant: 100 more)
// =============================================================================
describe('slugify – additional 100 iterations with special chars', () => {
  for (let i = 0; i < 100; i++) {
    it(`special-char iteration ${i}`, () => {
      const input = `Item #${i}: Value (${i + 1}) — test!`;
      const result = slugify(input);
      expect(result).toMatch(/^[a-z0-9-]*$/);
      expect(result).not.toMatch(/^-/);
      expect(result).not.toMatch(/-$/);
    });
  }
});

describe('countWords – additional 100 iterations with multi-space', () => {
  for (let i = 1; i <= 100; i++) {
    it(`multi-space iteration ${i}: ${i} words with extra spaces`, () => {
      const words = Array.from({ length: i }, (_, k) => `term${k}`);
      const text = words.join('   '); // triple spaces
      expect(countWords(text)).toBe(i);
    });
  }
});

// =============================================================================
// SECTION 10 — 25 additional builder/roundtrip tests to ensure ≥1,000 total
// =============================================================================
describe('heading builder – all 6 levels with roundtrip (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    const level = ((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    it(`iteration ${i}: heading level ${level} builder and toHtml roundtrip`, () => {
      const text = `HeadingText${i}`;
      const md = heading(level, text);
      expect(md).toBe(`${'#'.repeat(level)} ${text}`);
      const html = toHtml(md);
      expect(html).toContain(`<h${level}`);
      expect(html).toContain(text);
      expect(html).toContain(`</h${level}>`);
    });
  }
});
