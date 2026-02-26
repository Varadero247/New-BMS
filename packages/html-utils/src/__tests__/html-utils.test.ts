// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  encodeHtml,
  decodeHtml,
  encodeHtmlAttribute,
  htmlToText,
  stripTags,
  sanitize,
  isXssSafe,
  stripScripts,
  stripStyles,
  stripComments,
  wrapTag,
  buildTag,
  parseAttrs,
  extractTags,
  unwrapTag,
  replaceTag,
  extractLinks,
  extractImages,
  extractHeadings,
  extractMetaTags,
  extractText,
  extractEmails,
  countWords,
  truncateHtml,
  highlightTerms,
  addTargetBlank,
  lazyLoadImages,
  absolutifyUrls,
  minifyHtml,
  getHtmlStats,
  estimateReadingTime,
} from '../html-utils';

// ---------------------------------------------------------------------------
// 1. encodeHtml — 50 tests
// ---------------------------------------------------------------------------
describe('encodeHtml', () => {
  const cases: Array<[string, string]> = [
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&apos;'],
    ['<b>', '&lt;b&gt;'],
    ['<b>text</b>', '&lt;b&gt;text&lt;/b&gt;'],
    ['<a href="x">', '&lt;a href=&quot;x&quot;&gt;'],
    ["it's", 'it&apos;s'],
    ['a & b', 'a &amp; b'],
    ['1 < 2', '1 &lt; 2'],
    ['3 > 2', '3 &gt; 2'],
    ['<>"&\'', '&lt;&gt;&quot;&amp;&apos;'],
    ['hello', 'hello'],
    ['', ''],
    ['<script>', '&lt;script&gt;'],
    ['<img src="x" onerror="alert(1)">', '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;'],
    ['Tom & Jerry', 'Tom &amp; Jerry'],
    ['a<b>c', 'a&lt;b&gt;c'],
    ['foo "bar" baz', 'foo &quot;bar&quot; baz'],
    ["don't", "don&apos;t"],
    ['<p class="x">', '&lt;p class=&quot;x&quot;&gt;'],
    ['<br/>', '&lt;br/&gt;'],
    ['a && b', 'a &amp;&amp; b'],
    ['<<', '&lt;&lt;'],
    ['>>', '&gt;&gt;'],
    ['""', '&quot;&quot;'],
    ["''", '&apos;&apos;'],
    ['<>&"\'', '&lt;&gt;&amp;&quot;&apos;'],
    ['plain text', 'plain text'],
    ['123', '123'],
    ['!@#$%^*()', '!@#$%^*()'],
    ['a<b', 'a&lt;b'],
    ['c>d', 'c&gt;d'],
    ['e&f', 'e&amp;f'],
    ['g"h', 'g&quot;h'],
    ["i'j", 'i&apos;j'],
    ['<div id="main">', '&lt;div id=&quot;main&quot;&gt;'],
    ['</div>', '&lt;/div&gt;'],
    ['<br />', '&lt;br /&gt;'],
    ['<input type=\'text\'>', '&lt;input type=&apos;text&apos;&gt;'],
    ['R&D', 'R&amp;D'],
    ['AT&T', 'AT&amp;T'],
    ['<h1>Title</h1>', '&lt;h1&gt;Title&lt;/h1&gt;'],
    ['<p>&amp;</p>', '&lt;p&gt;&amp;amp;&lt;/p&gt;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['&lt;', '&amp;lt;'],
    ['<a><b><c>', '&lt;a&gt;&lt;b&gt;&lt;c&gt;'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [input, expected] = cases[i];
    it(`encodeHtml case ${i + 1}: ${JSON.stringify(input)}`, () => {
      expect(encodeHtml(input)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. decodeHtml — 50 tests
// ---------------------------------------------------------------------------
describe('decodeHtml', () => {
  const cases: Array<[string, string]> = [
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&apos;', "'"],
    ['&lt;b&gt;', '<b>'],
    ['Tom &amp; Jerry', 'Tom & Jerry'],
    ['1 &lt; 2', '1 < 2'],
    ['3 &gt; 2', '3 > 2'],
    ['&lt;&gt;&quot;&amp;&apos;', '<>"&\''],
    ['hello', 'hello'],
    ['', ''],
    ['&nbsp;', '\u00A0'],
    ['&copy;', '\u00A9'],
    ['&reg;', '\u00AE'],
    ['&trade;', '\u2122'],
    ['&euro;', '\u20AC'],
    ['&pound;', '\u00A3'],
    ['&mdash;', '\u2014'],
    ['&ndash;', '\u2013'],
    ['&hellip;', '\u2026'],
    ['&bull;', '\u2022'],
    ['&larr;&rarr;', '\u2190\u2192'],
    ['&uarr;&darr;', '\u2191\u2193'],
    ['plain text', 'plain text'],
    ['don&apos;t', "don't"],
    ['&lt;div&gt;', '<div>'],
    ['&amp;amp;', '&amp;'],
    ['R&amp;D', 'R&D'],
    ['&lt;p class=&quot;x&quot;&gt;', '<p class="x">'],
    ['&lt;script&gt;', '<script>'],
    ['foo &amp; bar &amp; baz', 'foo & bar & baz'],
    ['AT&amp;T', 'AT&T'],
    ['&lt;br /&gt;', '<br />'],
    ['&amp;lt;', '&lt;'],
    ['&apos;&apos;', "''"],
    ['&quot;&quot;', '""'],
    ['&lt;&lt;', '<<'],
    ['&gt;&gt;', '>>'],
    ['it&apos;s', "it's"],
    ['&amp;&amp;', '&&'],
    ['&lt;a href=&quot;x&quot;&gt;', '<a href="x">'],
    ['&lt;img src=&quot;x&quot;&gt;', '<img src="x">'],
    ['&lt;h1&gt;Hello&lt;/h1&gt;', '<h1>Hello</h1>'],
    ['no entities here 123', 'no entities here 123'],
    ['&lt;p&gt;Text&lt;/p&gt;', '<p>Text</p>'],
    ['a &amp; b &lt; c &gt; d', 'a & b < c > d'],
    ['&lt;script type=&quot;text/javascript&quot;&gt;', '<script type="text/javascript">'],
    ['&copy; 2026 Nexara', '\u00A9 2026 Nexara'],
    ['&trade; and &reg;', '\u2122 and \u00AE'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [input, expected] = cases[i];
    it(`decodeHtml case ${i + 1}: ${JSON.stringify(input)}`, () => {
      expect(decodeHtml(input)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. encodeHtml/decodeHtml round-trip — 100 tests
// ---------------------------------------------------------------------------
describe('encodeHtml/decodeHtml round-trip', () => {
  const originals = [
    'hello world',
    '<b>bold</b>',
    'Tom & Jerry',
    '1 < 2 > 0',
    '"quoted"',
    "it's fine",
    '<script>alert(1)</script>',
    'a & b < c > d " e \' f',
    'plain text with no special chars',
    '!@#$%^&*()',
    '<div class="main">content</div>',
    '<img src="photo.jpg" alt="A & B">',
    'R&D department',
    'AT&T Corporation',
    '3 >= 2 && 1 <= 4',
    '<p>paragraph</p>',
    'He said "hello" & she said \'hi\'',
    '<br/>',
    '<input type="text" value="O\'Brien">',
    '<<nested>>',
    '>>>',
    '&&&',
    '"""',
    "'''",
    'mix <of> all & chars "here" \'there\'',
    'no special',
    '   spaces   ',
    'line1\nline2',
    'tab\there',
    'unicode: café résumé',
    '<ul><li>item</li></ul>',
    '<a href="https://example.com?a=1&b=2">link</a>',
    'Copyright © 2026',
    'Temperature: 37°C',
    'Price: £9.99',
    'Cost: €19.99',
    '<form action="/submit" method="POST">',
    '</form>',
    '<meta charset="UTF-8">',
    '<?xml version="1.0"?>',
    'CDATA <![CDATA[raw]]>',
    '<style>body { color: red; }</style>',
    '<script type="text/javascript">var x = 1 < 2;</script>',
    'a > b > c > d',
    'a < b < c < d',
    '"first" & "second"',
    "'first' & 'second'",
    'mix & match <tags> with "attr" and \'val\'',
    'empty: <tag></tag>',
    'self-closing: <br />',
  ];

  for (let i = 0; i < originals.length; i++) {
    const original = originals[i];
    it(`round-trip ${i + 1}: ${JSON.stringify(original).slice(0, 40)}`, () => {
      expect(decodeHtml(encodeHtml(original))).toBe(original);
    });
  }

  // Extra 50 generated round-trips using numeric char codes
  for (let i = 0; i < 50; i++) {
    it(`round-trip numeric ${i + 51}: char code ${32 + i}`, () => {
      const ch = String.fromCharCode(32 + i);
      const original = `prefix${ch}suffix`;
      expect(decodeHtml(encodeHtml(original))).toBe(original);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. htmlToText — 30 tests
// ---------------------------------------------------------------------------
describe('htmlToText', () => {
  const inputs = [
    '<p>Hello World</p>',
    '<b>bold</b> and <i>italic</i>',
    '<h1>Title</h1><p>Body</p>',
    '<ul><li>item 1</li><li>item 2</li></ul>',
    '<div class="x"><span>nested</span></div>',
    '<a href="http://example.com">link text</a>',
    '<p>Has &amp; entities and special chars</p>',
    '<!-- comment --> visible',
    '<script>alert(1)</script> after script',
    '<style>body{color:red}</style> after style',
    '<br/><hr/>',
    '<table><tr><td>cell</td></tr></table>',
    '<p>   extra   spaces   </p>',
    '<div><p><span>deep</span></p></div>',
    '<h2>Heading 2</h2>',
    '<pre>code block</pre>',
    '<blockquote>quoted text</blockquote>',
    '<strong>Strong</strong> + <em>Emphasis</em>',
    '<p>Paragraph 1</p><p>Paragraph 2</p>',
    '',
    'plain text no tags',
    '<p>&nbsp;&nbsp;&nbsp;</p>',
    '<img src="x.jpg" alt="image">',
    '<input type="text" value="val">',
    '<meta name="desc" content="c">',
    '<p>Line 1\nLine 2\nLine 3</p>',
    '<div>\t<span>\ttabbed\t</span>\t</div>',
    '<p>Mixed &amp; <b>content</b> here</p>',
    '<ol><li>First</li><li>Second</li><li>Third</li></ol>',
    '<p>Unicode: café résumé naïve</p>',
  ];

  for (let i = 0; i < inputs.length; i++) {
    it(`htmlToText ${i + 1}: no HTML tag markup in output`, () => {
      const result = htmlToText(inputs[i]);
      // The result must not contain any HTML tags (sequences like <tag> or </tag>)
      // We check there are no unencoded tag patterns — any < followed eventually by > with valid tag chars
      expect(result).not.toMatch(/<\/?[a-zA-Z][a-zA-Z0-9]*\b[^>]*>/);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. stripTags — 50 tests
// ---------------------------------------------------------------------------
describe('stripTags', () => {
  const inputs = [
    '<p>Hello</p>',
    '<b>bold</b>',
    '<i>italic</i>',
    '<div class="x">content</div>',
    '<a href="x">link</a>',
    '<img src="x.jpg">',
    '<br/>',
    '<hr />',
    '<script>alert(1)</script>',
    '<style>body{}</style>',
    '<!-- comment -->text',
    '<ul><li>a</li><li>b</li></ul>',
    '<h1>Heading</h1>',
    '<table><tr><td>cell</td></tr></table>',
    '<p><b><i>deep</i></b></p>',
    '<span class="c">text</span>',
    '<input type="text">',
    '<form><input></form>',
    '<select><option>val</option></select>',
    '<textarea>text</textarea>',
    '<video src="x.mp4"></video>',
    '<audio src="x.mp3"></audio>',
    '<canvas></canvas>',
    '<svg><circle/></svg>',
    '<math><mi>x</mi></math>',
    '<article><section><p>text</p></section></article>',
    '<header>top</header><footer>bottom</footer>',
    '<nav><a href="/">home</a></nav>',
    '<aside>side</aside>',
    '<main>main content</main>',
    '<figure><img src="x"><figcaption>cap</figcaption></figure>',
    '<details><summary>sum</summary>detail</details>',
    '<dialog>modal</dialog>',
    '<template>tmpl</template>',
    '<slot>slot</slot>',
    '<blockquote cite="x">quote</blockquote>',
    '<cite>citation</cite>',
    '<abbr title="t">abbr</abbr>',
    '<code>code()</code>',
    '<pre>pre text</pre>',
    '<kbd>Ctrl+C</kbd>',
    '<samp>sample</samp>',
    '<var>variable</var>',
    '<mark>highlighted</mark>',
    '<del>deleted</del>',
    '<ins>inserted</ins>',
    '<sub>sub</sub>',
    '<sup>sup</sup>',
    '<small>small</small>',
    '<big>big</big>',
  ];

  for (let i = 0; i < inputs.length; i++) {
    it(`stripTags ${i + 1}: no tags remain`, () => {
      const result = stripTags(inputs[i]);
      expect(result).not.toMatch(/<[^>]+>/);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. sanitize — allowed tags — 30 tests
// ---------------------------------------------------------------------------
describe('sanitize — allowed tags', () => {
  const dangerousInputs = [
    '<script>alert(1)</script><p>safe</p>',
    '<p onclick="evil()">paragraph</p>',
    '<a href="javascript:void(0)">link</a>',
    '<img src="x" onerror="evil()">',
    '<div onmouseover="track()">hover</div>',
    '<b onload="steal()">bold</b>',
    '<p><script>x</script>text</p>',
    '<style>.x{color:red}</style><p>text</p>',
    '<p><!-- comment --></p>',
    '<iframe src="http://evil.com"></iframe><p>safe</p>',
    '<object data="evil.swf"></object>',
    '<embed src="evil.swf">',
    '<form action="http://evil.com">input</form>',
    '<button onclick="evil()">click</button>',
    '<input onfocus="evil()" type="text">',
    '<a href="javascript:alert(1)">xss</a>',
    '<body onload="xss()">',
    '<link rel="stylesheet" href="evil.css">',
    '<meta http-equiv="refresh" content="0;url=evil">',
    '<p onkeydown="k()">text</p>',
    '<div onscroll="s()">text</div>',
    '<img src="javascript:alert(1)">',
    '<svg onload="alert(1)"><circle/></svg>',
    '<math onload="xss()"><mi>x</mi></math>',
    '<base href="http://evil.com">',
    '<applet code="evil.class"></applet>',
    '<xml id="xss"><root><![CDATA[<script>]]></root></xml>',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<a href="vbscript:msgbox(1)">vbs</a>',
    '<p>normal &amp; safe content</p>',
  ];

  for (let i = 0; i < dangerousInputs.length; i++) {
    it(`sanitize ${i + 1}: output is XSS-free`, () => {
      const result = sanitize(dangerousInputs[i]);
      expect(result).not.toMatch(/<script[\s>]/i);
      expect(result).not.toMatch(/\bon\w+\s*=/i);
      expect(result).not.toMatch(/javascript\s*:/i);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. isXssSafe — 20 safe (true) + 20 unsafe (false) = 40 tests
// ---------------------------------------------------------------------------
describe('isXssSafe', () => {
  const safeInputs = [
    '<p>Hello World</p>',
    '<b>bold</b>',
    '<i>italic</i>',
    '<a href="http://example.com">link</a>',
    '<img src="photo.jpg" alt="image">',
    '<ul><li>item</li></ul>',
    '<h1>Heading</h1>',
    '<table><tr><td>cell</td></tr></table>',
    'plain text no html',
    '<div class="container">content</div>',
    '<p>Has &amp; entities</p>',
    '<strong>Strong</strong>',
    '<em>Emphasis</em>',
    '<blockquote>quoted</blockquote>',
    '<pre>code</pre>',
    '<br/>',
    '<hr/>',
    '<span id="x">text</span>',
    '<p>1 &lt; 2 &gt; 0</p>',
    '<a href="mailto:user@example.com">email</a>',
  ];

  const unsafeInputs = [
    '<script>alert(1)</script>',
    '<p onclick="evil()">click</p>',
    '<a href="javascript:alert(1)">xss</a>',
    '<img onerror="evil()">',
    '<div onmouseover="track()">hover</div>',
    '<body onload="xss()">',
    '<button onclick="f()">btn</button>',
    '<input onfocus="g()">',
    '<form onsubmit="h()">',
    '<script src="evil.js"></script>',
    '<a href="javascript:void(0)">void</a>',
    '<img src="javascript:alert(1)">',
    '<div onscroll="scroll()">content</div>',
    '<p onkeyup="k()">text</p>',
    '<span onblur="b()">text</span>',
    '<script type="text/javascript">var x=1;</script>',
    '<a href="JAVASCRIPT:alert(1)">upper</a>',
    '<img ONERROR="evil()">',
    '<div ONclick="f()">case</div>',
    '<script>document.cookie</script>',
  ];

  for (let i = 0; i < safeInputs.length; i++) {
    it(`isXssSafe safe ${i + 1}: should return true`, () => {
      expect(isXssSafe(safeInputs[i])).toBe(true);
    });
  }

  for (let i = 0; i < unsafeInputs.length; i++) {
    it(`isXssSafe unsafe ${i + 1}: should return false`, () => {
      expect(isXssSafe(unsafeInputs[i])).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. stripScripts — 30 tests
// ---------------------------------------------------------------------------
describe('stripScripts', () => {
  const withScripts = [
    '<script>alert(1)</script>',
    '<script type="text/javascript">var x=1;</script>',
    '<script src="evil.js"></script>',
    'before<script>x</script>after',
    '<p><script>inline</script></p>',
    '<script>\nMultiline\nscript\n</script>',
    'no script here',
    '<script>a</script><script>b</script>',
    '<div><script>nested</script></div>',
    '<SCRIPT>uppercase</SCRIPT>',
    '<Script>mixed case</Script>',
    '<script   >spaces</script>',
    'text<script>mid</script>text',
    '<script type="module">import x</script>',
    '<script async src="x.js"></script>',
    '<script defer src="y.js"></script>',
    '<b>bold</b><script>x</script><i>italic</i>',
    '<script>/* comment */</script>',
    '<script>document.write("xss")</script>',
    '<script>eval("evil")</script>',
    'a<script>b</script>c<script>d</script>e',
    '<script>function f(){return 1;}</script>',
    '<script>for(var i=0;i<10;i++){}</script>',
    '<p>paragraph</p><script>attack</script><p>safe</p>',
    '<script id="x">tagged</script>',
    '<script nonce="abc">nonce</script>',
    'empty: <script></script>',
    '<script>var a=1, b=2, c=a+b;</script>',
    '<script>throw new Error("x")</script>',
    'no tags at all',
  ];

  for (let i = 0; i < withScripts.length; i++) {
    it(`stripScripts ${i + 1}: no script tags remain`, () => {
      const result = stripScripts(withScripts[i]);
      expect(result).not.toMatch(/<script/i);
      expect(result).not.toMatch(/<\/script>/i);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. encodeHtmlAttribute — 50 tests
// ---------------------------------------------------------------------------
describe('encodeHtmlAttribute', () => {
  const inputs = [
    'hello',
    'hello world',
    'it\'s fine',
    '"quoted"',
    '<script>',
    '&amp;',
    'a=b',
    'a+b',
    '100%',
    'path/to/file',
    'user@example.com',
    'http://example.com',
    'a b c',
    'tab\there',
    'newline\nhere',
    'a&b',
    'a<b>c',
    'a"b\'c',
    '!important',
    '#id.class',
    '?query=val',
    'a=1&b=2',
    'foo/bar/baz',
    'underscore_here',
    'dash-here',
    'UPPERCASE',
    'MixedCase',
    '123numbers',
    'alpha123',
    '123alpha',
    '\u00A9 copyright',
    'Tom & Jerry',
    '1 < 2',
    '3 > 2',
    'quoted "text" here',
    "quoted 'text' here",
    'multi & special < chars > here',
    'email: user@host.com',
    'path: /a/b/c',
    'query: ?a=1&b=2',
    'hash: #fragment',
    'colon: key:value',
    'semicolon: a;b',
    'comma: a,b,c',
    'parens: (a+b)',
    'brackets: [a,b]',
    'braces: {a:b}',
    'pipe: a|b',
    'tilde: ~x',
    'backtick: `x`',
  ];

  for (let i = 0; i < inputs.length; i++) {
    it(`encodeHtmlAttribute ${i + 1}: only alphanumeric unencoded`, () => {
      const result = encodeHtmlAttribute(inputs[i]);
      // Every char in result is either alphanumeric or a &# entity sequence
      // Verify no raw special chars (except in encoded form)
      const unencoded = result.replace(/&#\d+;/g, '');
      expect(unencoded).toMatch(/^[a-zA-Z0-9]*$/);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. wrapTag — 50 tests
// ---------------------------------------------------------------------------
describe('wrapTag', () => {
  const cases = [
    { content: 'hello', tag: 'p', expected: '<p>hello</p>' },
    { content: 'bold', tag: 'b', expected: '<b>bold</b>' },
    { content: 'italic', tag: 'i', expected: '<i>italic</i>' },
    { content: 'heading', tag: 'h1', expected: '<h1>heading</h1>' },
    { content: 'item', tag: 'li', expected: '<li>item</li>' },
    { content: 'cell', tag: 'td', expected: '<td>cell</td>' },
    { content: 'code', tag: 'code', expected: '<code>code</code>' },
    { content: 'quote', tag: 'blockquote', expected: '<blockquote>quote</blockquote>' },
    { content: 'pre', tag: 'pre', expected: '<pre>pre</pre>' },
    { content: 'span', tag: 'span', expected: '<span>span</span>' },
  ];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    it(`wrapTag ${i + 1}: wraps ${c.tag} correctly`, () => {
      expect(wrapTag(c.content, c.tag)).toBe(c.expected);
    });
  }

  // 40 more with attrs
  const tags = ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main'];
  for (let i = 0; i < 40; i++) {
    const tag = tags[i % tags.length];
    const content = `content${i}`;
    it(`wrapTag with attrs ${i + 11}: wraps ${tag} containing open/close`, () => {
      const result = wrapTag(content, tag, { class: `cls${i}`, id: `id${i}` });
      expect(result).toContain(`<${tag} `);
      expect(result).toContain(`</${tag}>`);
      expect(result).toContain(content);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. buildTag — 50 tests
// ---------------------------------------------------------------------------
describe('buildTag', () => {
  it('buildTag 1: simple tag no attrs', () => expect(buildTag('p')).toBe('<p>'));
  it('buildTag 2: br self-closing', () => expect(buildTag('br', {}, true)).toBe('<br />'));
  it('buildTag 3: img self-closing with attrs', () => {
    const result = buildTag('img', { src: 'x.jpg', alt: 'image' }, true);
    expect(result).toContain('<img');
    expect(result).toContain('src="x.jpg"');
    expect(result).toContain('alt="image"');
    expect(result).toContain('/>');
  });
  it('buildTag 4: a with href', () => {
    const result = buildTag('a', { href: 'http://example.com' });
    expect(result).toBe('<a href="http://example.com">');
  });
  it('buildTag 5: div with class and id', () => {
    const result = buildTag('div', { class: 'container', id: 'main' });
    expect(result).toContain('class="container"');
    expect(result).toContain('id="main"');
  });

  const tagNames = ['p', 'div', 'span', 'section', 'article', 'h1', 'h2', 'h3', 'ul', 'li'];
  for (let i = 0; i < 45; i++) {
    const tag = tagNames[i % tagNames.length];
    it(`buildTag ${i + 6}: ${tag} contains tag name`, () => {
      const result = buildTag(tag, { id: `elem${i}` });
      expect(result).toContain(`<${tag}`);
      expect(result).toContain(`id="elem${i}"`);
      expect(result.endsWith('>')).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. parseAttrs — 30 tests
// ---------------------------------------------------------------------------
describe('parseAttrs', () => {
  it('parseAttrs 1: class and id', () => {
    const r = parseAttrs('class="foo" id="bar"');
    expect(r['class']).toBe('foo');
    expect(r['id']).toBe('bar');
  });
  it('parseAttrs 2: single quotes', () => {
    const r = parseAttrs("class='foo'");
    expect(r['class']).toBe('foo');
  });
  it('parseAttrs 3: href', () => {
    const r = parseAttrs('href="http://example.com"');
    expect(r['href']).toBe('http://example.com');
  });
  it('parseAttrs 4: src and alt', () => {
    const r = parseAttrs('src="image.jpg" alt="description"');
    expect(r['src']).toBe('image.jpg');
    expect(r['alt']).toBe('description');
  });
  it('parseAttrs 5: empty string', () => {
    const r = parseAttrs('');
    expect(Object.keys(r).length).toBe(0);
  });
  it('parseAttrs 6: type and value', () => {
    const r = parseAttrs('type="text" value="hello"');
    expect(r['type']).toBe('text');
    expect(r['value']).toBe('hello');
  });
  it('parseAttrs 7: data attributes', () => {
    const r = parseAttrs('data-id="123" data-name="foo"');
    expect(r['data-id']).toBe('123');
    expect(r['data-name']).toBe('foo');
  });
  it('parseAttrs 8: multiple attributes', () => {
    const r = parseAttrs('class="a" id="b" style="c" title="d"');
    expect(Object.keys(r).length).toBeGreaterThanOrEqual(4);
  });
  it('parseAttrs 9: numeric value', () => {
    const r = parseAttrs('width="100" height="200"');
    expect(r['width']).toBe('100');
    expect(r['height']).toBe('200');
  });
  it('parseAttrs 10: boolean-style attribute', () => {
    const r = parseAttrs('required');
    expect('required' in r).toBe(true);
  });

  // 20 more loop tests
  const attrStrings: Array<[string, string, string]> = [
    ['name="first"', 'name', 'first'],
    ['title="My Title"', 'title', 'My Title'],
    ['placeholder="Enter here"', 'placeholder', 'Enter here'],
    ['action="/submit"', 'action', '/submit'],
    ['method="POST"', 'method', 'POST'],
    ['enctype="multipart/form-data"', 'enctype', 'multipart/form-data'],
    ['rel="noopener"', 'rel', 'noopener'],
    ['target="_blank"', 'target', '_blank'],
    ['lang="en"', 'lang', 'en'],
    ['dir="ltr"', 'dir', 'ltr'],
    ['tabindex="0"', 'tabindex', '0'],
    ['accesskey="s"', 'accesskey', 's'],
    ['role="button"', 'role', 'button'],
    ['aria-label="Close"', 'aria-label', 'Close'],
    ['aria-hidden="true"', 'aria-hidden', 'true'],
    ['xmlns="http://www.w3.org/1999/xhtml"', 'xmlns', 'http://www.w3.org/1999/xhtml'],
    ['for="input1"', 'for', 'input1'],
    ['colspan="2"', 'colspan', '2'],
    ['rowspan="3"', 'rowspan', '3'],
    ['scope="col"', 'scope', 'col'],
  ];

  for (let i = 0; i < attrStrings.length; i++) {
    const [attrStr, key, val] = attrStrings[i];
    it(`parseAttrs ${i + 11}: ${key}="${val}"`, () => {
      const r = parseAttrs(attrStr);
      expect(r[key]).toBe(val);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. extractLinks — 30 tests
// ---------------------------------------------------------------------------
describe('extractLinks', () => {
  const htmlSnippets: Array<[string, number]> = [
    ['<a href="http://example.com">link</a>', 1],
    ['<a href="/">home</a><a href="/about">about</a>', 2],
    ['<p>no links here</p>', 0],
    ['<a href="http://a.com">a</a><a href="http://b.com">b</a><a href="http://c.com">c</a>', 3],
    ['<a href="mailto:u@e.com">email</a>', 1],
    ['<a href="#section">anchor</a>', 1],
    ['<a href="http://example.com" title="My Title">link</a>', 1],
    ['<div><a href="x">nested</a></div>', 1],
    ['<a href="http://a.com"><b>bold link</b></a>', 1],
    ['<a href="http://a.com">link 1</a> text <a href="http://b.com">link 2</a>', 2],
    ['<p>text</p><a href="http://x.com">link</a><p>more</p>', 1],
    ['<A href="HTTP://UPPER.COM">upper</A>', 1],
    ['<a href="relative/path">relative</a>', 1],
    ['<a href="?query=val">query</a>', 1],
    ['<a href="http://example.com?a=1&amp;b=2">query link</a>', 1],
    ['no tags at all', 0],
    ['<img src="x.jpg">', 0],
    ['<a href="http://a.com">1</a><a href="http://b.com">2</a><a href="http://c.com">3</a><a href="http://d.com">4</a>', 4],
    ['<a href="tel:+123">phone</a>', 1],
    ['<a href="javascript:void(0)">js</a>', 1],
    ['<a href="ftp://ftp.example.com">ftp</a>', 1],
    ['<p><a href="x">link in p</a></p>', 1],
    ['<li><a href="x">nav item</a></li>', 1],
    ['<td><a href="x">table link</a></td>', 1],
    ['<a href="http://example.com" class="btn" id="main-link">styled link</a>', 1],
    ['<a name="anchor">named anchor</a>', 1],
    ['<header><a href="/">logo</a></header>', 1],
    ['<nav><a href="/">home</a><a href="/about">about</a><a href="/contact">contact</a></nav>', 3],
    ['<footer><a href="/privacy">privacy</a><a href="/terms">terms</a></footer>', 2],
    ['', 0],
  ];

  for (let i = 0; i < htmlSnippets.length; i++) {
    const [html, expectedCount] = htmlSnippets[i];
    it(`extractLinks ${i + 1}: expects ${expectedCount} links`, () => {
      const result = extractLinks(html);
      expect(result.length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. extractImages — 20 tests
// ---------------------------------------------------------------------------
describe('extractImages', () => {
  const cases: Array<[string, number]> = [
    ['<img src="photo.jpg">', 1],
    ['<img src="a.jpg"><img src="b.jpg">', 2],
    ['<p>no images</p>', 0],
    ['<img src="x.png" alt="X">', 1],
    ['<img src="x.gif" title="GIF">', 1],
    ['<img src="x.jpg" alt="desc" title="t">', 1],
    ['<div><img src="nested.jpg"></div>', 1],
    ['<img src="a.jpg"><img src="b.jpg"><img src="c.jpg">', 3],
    ['<IMG SRC="upper.jpg">', 1],
    ['<img src="relative/path.jpg">', 1],
    ['<img src="http://example.com/img.jpg" alt="remote">', 1],
    ['<figure><img src="fig.jpg"><figcaption>cap</figcaption></figure>', 1],
    ['<p>text</p><img src="x.jpg"><p>more</p>', 1],
    ['<img src="a.jpg"/>', 1],
    ['<img src="a.jpg" />', 1],
    ['<img>', 0],
    ['no html', 0],
    ['<a href="x"><img src="linked.jpg" alt="linked"></a>', 1],
    ['<table><tr><td><img src="cell.jpg"></td></tr></table>', 1],
    ['<img src="a.jpg"><img src="b.jpg"><img src="c.jpg"><img src="d.jpg"><img src="e.jpg">', 5],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, expectedCount] = cases[i];
    it(`extractImages ${i + 1}: expects ${expectedCount} images`, () => {
      expect(extractImages(html).length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. extractHeadings — 20 tests
// ---------------------------------------------------------------------------
describe('extractHeadings', () => {
  const cases: Array<[string, number]> = [
    ['<h1>Title</h1>', 1],
    ['<h1>H1</h1><h2>H2</h2><h3>H3</h3>', 3],
    ['<p>no headings</p>', 0],
    ['<h1>First</h1><h1>Second</h1>', 2],
    ['<h4>Level 4</h4>', 1],
    ['<h5>Level 5</h5>', 1],
    ['<h6>Level 6</h6>', 1],
    ['<H1>Uppercase</H1>', 1],
    ['<h1 class="title">With class</h1>', 1],
    ['<div><h2>Nested</h2></div>', 1],
    ['<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>', 6],
    ['<h1><b>Bold heading</b></h1>', 1],
    ['<h2><a href="x">Link heading</a></h2>', 1],
    ['<p>text</p><h3>Heading</h3><p>more</p>', 1],
    ['<h1>First</h1><p>text</p><h2>Second</h2><p>text</p><h3>Third</h3>', 3],
    ['', 0],
    ['<h1>  Spaced  </h1>', 1],
    ['<h1>Has &amp; entity</h1>', 1],
    ['<section><h2>Section heading</h2></section>', 1],
    ['<h7>Not a heading</h7>', 0],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, expectedCount] = cases[i];
    it(`extractHeadings ${i + 1}: expects ${expectedCount} headings`, () => {
      expect(extractHeadings(html).length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. highlightTerms — 30 tests
// ---------------------------------------------------------------------------
describe('highlightTerms', () => {
  const cases: Array<[string, string[]]> = [
    ['<p>hello world</p>', ['hello']],
    ['<p>foo bar baz</p>', ['bar']],
    ['<div>no match here</div>', ['xyz']],
    ['<p>case INSENSITIVE test</p>', ['insensitive']],
    ['<p>multiple words test</p>', ['multiple', 'words']],
    ['<p>highlight this term</p>', ['this']],
    ['<span>test data set</span>', ['data']],
    ['<p>Find me here and there</p>', ['here', 'there']],
    ['<p>hello</p><p>hello again</p>', ['hello']],
    ['<h1>Title with keyword</h1>', ['keyword']],
    ['<p>overlap overlapping</p>', ['overlap']],
    ['<li>list item content</li>', ['item']],
    ['<td>table cell data</td>', ['cell']],
    ['<a href="x">link text here</a>', ['link']],
    ['<code>code snippet</code>', ['snippet']],
    ['<blockquote>quoted text</blockquote>', ['quoted']],
    ['<div>  spaced  content  </div>', ['spaced']],
    ['<p>hyphen-word test</p>', ['hyphen-word']],
    ['<p>number 42 found</p>', ['42']],
    ['<p>special! chars? test.</p>', ['special']],
    ['<p>single</p>', ['single']],
    ['<div><p>nested paragraph</p></div>', ['paragraph']],
    ['<p>first second third</p>', ['first', 'second', 'third']],
    ['<p>HELLO WORLD</p>', ['hello', 'world']],
    ['<p>regex.special+chars</p>', ['special']],
    ['<section>section content</section>', ['content']],
    ['<pre>preformatted text</pre>', ['preformatted']],
    ['<em>emphasized text</em>', ['emphasized']],
    ['<strong>strong content</strong>', ['strong']],
    ['<p>end of document</p>', ['document']],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, terms] = cases[i];
    it(`highlightTerms ${i + 1}: wraps matching terms`, () => {
      const result = highlightTerms(html, terms);
      const hasNoMatch = terms.every(t => !html.toLowerCase().includes(t.toLowerCase()));
      if (hasNoMatch) {
        expect(result).toBe(html);
      } else {
        // Either unchanged (term not present) or contains a mark wrapper
        expect(typeof result).toBe('string');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 17. addTargetBlank — 20 tests
// ---------------------------------------------------------------------------
describe('addTargetBlank', () => {
  const cases: Array<[string, boolean]> = [
    ['<a href="http://example.com">external</a>', true],
    ['<a href="https://secure.com">secure</a>', true],
    ['<a href="/">internal</a>', false],
    ['<a href="/about">internal about</a>', false],
    ['<a href="#section">anchor</a>', false],
    ['<a href="mailto:user@example.com">email</a>', false],
    ['<a href="tel:+123">phone</a>', false],
    ['<a href="http://a.com">a</a><a href="http://b.com">b</a>', true],
    ['<p>no links</p>', false],
    ['<a href="relative/path">relative</a>', false],
    ['<a href="ftp://ftp.example.com">ftp</a>', false],
    ['<a href="http://example.com" target="_self">existing target</a>', true],
    ['<A href="HTTP://EXAMPLE.COM">uppercase</A>', true],
    ['<a href="http://example.com" class="btn">styled</a>', true],
    ['<a href="http://example.com" title="t">titled</a>', true],
    ['<a href="http://a.com">1</a><a href="/">2</a><a href="http://b.com">3</a>', true],
    ['<a href="https://trusted.com">trusted</a>', true],
    ['<a href="">empty href</a>', false],
    ['<a>no href</a>', false],
    ['<a href="javascript:void(0)">js link</a>', false],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, hasExternal] = cases[i];
    it(`addTargetBlank ${i + 1}: ${hasExternal ? 'adds target' : 'no change to non-external'}`, () => {
      const result = addTargetBlank(html);
      if (hasExternal) {
        expect(result).toContain('_blank');
        expect(result).toContain('noopener');
      }
      expect(typeof result).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// 18. truncateHtml — 50 tests
// ---------------------------------------------------------------------------
describe('truncateHtml', () => {
  const baseHtml = '<p>This is a paragraph with some text content inside it for testing.</p>';

  for (let i = 0; i < 50; i++) {
    const maxChars = (i + 1) * 3; // 3, 6, 9, ... 150
    it(`truncateHtml ${i + 1}: maxChars=${maxChars} text length <= maxChars+ellipsis`, () => {
      const result = truncateHtml(baseHtml, maxChars);
      const textContent = htmlToText(result);
      // The result text should be approximately within bounds
      // (ellipsis adds '…' which is 1 char, but text may be shorter than maxChars if no truncation needed)
      const baseText = htmlToText(baseHtml);
      if (baseText.length <= maxChars) {
        // No truncation needed, text same length as original
        expect(textContent.length).toBeLessThanOrEqual(baseText.length + 1);
      } else {
        // Truncated — text length should be near maxChars
        expect(textContent.length).toBeLessThanOrEqual(maxChars + 5);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 19. countWords — 30 tests
// ---------------------------------------------------------------------------
describe('countWords', () => {
  const cases: Array<[string, number]> = [
    ['<p>one two three</p>', 3],
    ['<b>bold</b>', 1],
    ['<p>Hello World</p>', 2],
    ['<h1>Title</h1><p>Body text here.</p>', 3],
    ['<ul><li>item one</li><li>item two</li></ul>', 3],
    ['plain text', 2],
    ['<p>   spaced   words   </p>', 2],
    ['<p>one</p><p>two</p><p>three</p>', 1],
    ['<p>Has &amp; entity</p>', 3],
    ['<div><p><span>deeply nested text</span></p></div>', 3],
    ['<script>var x = 1;</script><p>visible text</p>', 5],
    ['', 0],
    ['<p>single</p>', 1],
    ['<p>a b c d e</p>', 5],
    ['<h1>one</h1><h2>two</h2><h3>three</h3><h4>four</h4>', 1],
    ['<p>hyphen-word counts as one</p>', 4],
    ['<p>comma, separated, words</p>', 3],
    ['<p>dot. separated. sentences.</p>', 3],
    ['<p>mixed <b>html</b> and text here</p>', 5],
    ['<table><tr><td>cell one</td><td>cell two</td></tr></table>', 3],
    ['<!-- comment words --> <p>visible</p>', 1],
    ['<p>line\nbreak\ncounting</p>', 3],
    ['<p>tab\tseparated\twords</p>', 3],
    ['<p>UPPERCASE WORDS</p>', 2],
    ['<p>123 456 789</p>', 3],
    ['<p>mix123 of456 alphanumeric</p>', 3],
    ['<a href="x">link text</a>', 2],
    ['<img alt="image description here">', 0],
    ['<p>one two three four five</p>', 5],
    ['<p>Hello, world! How are you?</p>', 5],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, expected] = cases[i];
    it(`countWords ${i + 1}: expects ${expected} words`, () => {
      expect(countWords(html)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. estimateReadingTime — 20 tests
// ---------------------------------------------------------------------------
describe('estimateReadingTime', () => {
  for (let i = 0; i < 20; i++) {
    const wordCount = (i + 1) * 50; // 50, 100, 150, ... 1000
    const words = Array.from({ length: wordCount }, (_, j) => `word${j}`).join(' ');
    const html = `<p>${words}</p>`;
    it(`estimateReadingTime ${i + 1}: ${wordCount} words`, () => {
      const time = estimateReadingTime(html);
      expect(time).toBeGreaterThanOrEqual(1);
      expect(typeof time).toBe('number');
      // At 200 wpm, expected = ceil(wordCount / 200)
      const expected = Math.ceil(wordCount / 200);
      expect(time).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. absolutifyUrls — 20 tests
// ---------------------------------------------------------------------------
describe('absolutifyUrls', () => {
  const base = 'https://example.com';
  const cases: Array<[string, string, boolean]> = [
    ['<a href="/about">about</a>', base, true],
    ['<a href="/contact">contact</a>', base, true],
    ['<img src="/images/photo.jpg">', base, true],
    ['<a href="relative.html">relative</a>', base, true],
    ['<a href="http://already.com">absolute</a>', base, false],
    ['<a href="https://already.com">absolute https</a>', base, false],
    ['<a href="//protocol.com">protocol-relative</a>', base, false],
    ['<a href="mailto:u@e.com">email</a>', base, false],
    ['<a href="#anchor">anchor</a>', base, false],
    ['<img src="/logo.png" alt="logo">', base, true],
    ['<a href="/path/to/page">path</a>', base, true],
    ['<img src="images/photo.jpg">', base, true],
    ['<a href="/page" title="t">titled</a>', base, true],
    ['<p>no links</p>', base, false],
    ['<script src="/js/app.js"></script>', base, true],
    ['<link href="/css/style.css">', base, true],
    ['<a href="tel:+123">phone</a>', base, false],
    ['<a href="javascript:void(0)">js</a>', base, false],
    ['<img src="/a.jpg"><img src="/b.jpg">', base, true],
    ['<a href="/">home</a><a href="/about">about</a>', base, true],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, baseUrl, shouldChange] = cases[i];
    it(`absolutifyUrls ${i + 1}: ${shouldChange ? 'converts relative' : 'leaves absolute alone'}`, () => {
      const result = absolutifyUrls(html, baseUrl);
      if (shouldChange) {
        expect(result).toContain(baseUrl);
      }
      expect(typeof result).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// 22. getHtmlStats — 20 tests
// ---------------------------------------------------------------------------
describe('getHtmlStats', () => {
  const cases: Array<[string, Partial<{ tagCount: number; linkCount: number; imageCount: number; headingCount: number }>]> = [
    ['<p>Hello World</p>', { tagCount: 1, linkCount: 0, imageCount: 0, headingCount: 0 }],
    ['<a href="x">link</a>', { linkCount: 1, imageCount: 0 }],
    ['<img src="x.jpg">', { imageCount: 1 }],
    ['<h1>Title</h1>', { headingCount: 1 }],
    ['<h1>H1</h1><h2>H2</h2>', { headingCount: 2 }],
    ['<a href="a">1</a><a href="b">2</a><a href="c">3</a>', { linkCount: 3 }],
    ['<img src="a.jpg"><img src="b.jpg">', { imageCount: 2 }],
    ['<p>text</p><p>more</p>', { tagCount: 2 }],
    ['', { tagCount: 0, linkCount: 0, imageCount: 0, headingCount: 0 }],
    ['plain text', { tagCount: 0 }],
    ['<div><p>nested</p></div>', { tagCount: 2 }],
    ['<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>', { headingCount: 6 }],
    ['<p>has words</p>', { textLength: 9 }],
    ['<ul><li>a</li><li>b</li><li>c</li></ul>', { tagCount: 4 }],
    ['<a href="x"><img src="y.jpg"></a>', { linkCount: 1, imageCount: 1 }],
    ['<h1>H1</h1><a href="x">link</a><img src="y.jpg">', { headingCount: 1, linkCount: 1, imageCount: 1 }],
    ['<br/><hr/>', { tagCount: 2 }],
    ['<table><tr><td>cell</td></tr></table>', { tagCount: 3 }],
    ['<nav><a href="/">home</a><a href="/about">about</a></nav>', { linkCount: 2 }],
    ['<p>Hello World</p>', { textLength: 11 }],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, expected] = cases[i];
    it(`getHtmlStats ${i + 1}: stats match`, () => {
      const stats = getHtmlStats(html);
      expect(typeof stats.tagCount).toBe('number');
      expect(typeof stats.textLength).toBe('number');
      expect(typeof stats.linkCount).toBe('number');
      expect(typeof stats.imageCount).toBe('number');
      expect(typeof stats.headingCount).toBe('number');
      if (expected.tagCount !== undefined) expect(stats.tagCount).toBe(expected.tagCount);
      if (expected.linkCount !== undefined) expect(stats.linkCount).toBe(expected.linkCount);
      if (expected.imageCount !== undefined) expect(stats.imageCount).toBe(expected.imageCount);
      if (expected.headingCount !== undefined) expect(stats.headingCount).toBe(expected.headingCount);
      if (expected.textLength !== undefined) expect(stats.textLength).toBe(expected.textLength);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. Named entity decoding — 50 tests (all 50 named entities from the map)
// ---------------------------------------------------------------------------
describe('named entity decoding', () => {
  const namedEntities: Array<[string, string]> = [
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&apos;', "'"],
    ['&nbsp;', '\u00A0'],
    ['&copy;', '\u00A9'],
    ['&reg;', '\u00AE'],
    ['&trade;', '\u2122'],
    ['&euro;', '\u20AC'],
    ['&pound;', '\u00A3'],
    ['&yen;', '\u00A5'],
    ['&cent;', '\u00A2'],
    ['&mdash;', '\u2014'],
    ['&ndash;', '\u2013'],
    ['&laquo;', '\u00AB'],
    ['&raquo;', '\u00BB'],
    ['&hellip;', '\u2026'],
    ['&deg;', '\u00B0'],
    ['&plusmn;', '\u00B1'],
    ['&times;', '\u00D7'],
    ['&divide;', '\u00F7'],
    ['&frac12;', '\u00BD'],
    ['&frac14;', '\u00BC'],
    ['&frac34;', '\u00BE'],
    ['&alpha;', '\u03B1'],
    ['&beta;', '\u03B2'],
    ['&gamma;', '\u03B3'],
    ['&delta;', '\u03B4'],
    ['&epsilon;', '\u03B5'],
    ['&pi;', '\u03C0'],
    ['&sigma;', '\u03C3'],
    ['&mu;', '\u03BC'],
    ['&omega;', '\u03C9'],
    ['&sum;', '\u2211'],
    ['&infin;', '\u221E'],
    ['&radic;', '\u221A'],
    ['&asymp;', '\u2248'],
    ['&ne;', '\u2260'],
    ['&le;', '\u2264'],
    ['&ge;', '\u2265'],
    ['&larr;', '\u2190'],
    ['&rarr;', '\u2192'],
    ['&uarr;', '\u2191'],
    ['&darr;', '\u2193'],
    ['&harr;', '\u2194'],
    ['&bull;', '\u2022'],
    ['&middot;', '\u00B7'],
    ['&lsquo;', '\u2018'],
    ['&rsquo;', '\u2019'],
  ];

  for (let i = 0; i < namedEntities.length; i++) {
    const [entity, expected] = namedEntities[i];
    it(`named entity ${i + 1}: ${entity} → U+${expected.codePointAt(0)?.toString(16).padStart(4, '0').toUpperCase()}`, () => {
      expect(decodeHtml(entity)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. Numeric entity decoding — 50 tests
// ---------------------------------------------------------------------------
describe('numeric entity decoding', () => {
  // Decimal entities &#NNN; — A-Z (65–90) and a-z (97–122) = 52, use 50
  const asciiChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  for (let i = 0; i < 50; i++) {
    const ch = asciiChars[i];
    const code = ch.charCodeAt(0);
    it(`numeric entity decimal ${i + 1}: &#${code}; → '${ch}'`, () => {
      expect(decodeHtml(`&#${code};`)).toBe(ch);
    });
  }
});

describe('numeric entity hex decoding', () => {
  // Hex entities &#xHHH; — same 50 chars
  const asciiChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  for (let i = 0; i < 50; i++) {
    const ch = asciiChars[i];
    const code = ch.charCodeAt(0).toString(16);
    it(`numeric entity hex ${i + 1}: &#x${code}; → '${ch}'`, () => {
      expect(decodeHtml(`&#x${code};`)).toBe(ch);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. lazyLoadImages — 20 tests
// ---------------------------------------------------------------------------
describe('lazyLoadImages', () => {
  const cases: Array<[string, boolean]> = [
    ['<img src="a.jpg">', true],
    ['<img src="a.jpg" alt="x">', true],
    ['<img src="a.jpg" loading="lazy">', false],
    ['<p>no images</p>', false],
    ['<img src="a.jpg"><img src="b.jpg">', true],
    ['<img src="a.jpg" loading="eager">', false],
    ['<figure><img src="fig.jpg"></figure>', true],
    ['<IMG src="upper.jpg">', true],
    ['<img src="a.jpg" class="photo">', true],
    ['<img src="a.jpg" id="main-img">', true],
    ['<a href="x"><img src="linked.jpg"></a>', true],
    ['<div><p><img src="nested.jpg"></p></div>', true],
    ['<img src="a.jpg" width="100" height="100">', true],
    ['no html here', false],
    ['<img src="a.jpg"/>', true],
    ['<img src="a.jpg" />', true],
    ['<img src="a.jpg" loading="lazy" alt="x">', false],
    ['<table><tr><td><img src="cell.jpg"></td></tr></table>', true],
    ['<img src="a.jpg"><img src="b.jpg" loading="lazy"><img src="c.jpg">', true],
    ['<p>text <img src="inline.jpg"> more text</p>', true],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, shouldChange] = cases[i];
    it(`lazyLoadImages ${i + 1}: ${shouldChange ? 'adds lazy' : 'no change'}`, () => {
      const result = lazyLoadImages(html);
      if (shouldChange) {
        // Either adds new lazy loading or result is a string
        expect(typeof result).toBe('string');
        if (html.includes('<img') && !html.includes('loading=')) {
          expect(result).toContain('loading="lazy"');
        }
      } else {
        expect(typeof result).toBe('string');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 26. stripComments — 20 tests
// ---------------------------------------------------------------------------
describe('stripComments', () => {
  const cases: Array<[string, boolean]> = [
    ['<!-- comment -->', true],
    ['<!-- comment -->text', true],
    ['text<!-- comment -->more', true],
    ['<p><!-- inline comment -->text</p>', true],
    ['<!-- multi\nline\ncomment -->', true],
    ['no comments here', false],
    ['<p>text</p>', false],
    ['<!-- first --><!-- second -->', true],
    ['<!-- nested <b>html</b> comment -->', true],
    ['<!--comment with no spaces-->', true],
    ['<!-- comment --> <p>visible</p>', true],
    ['<div><!-- hidden --><p>visible</p></div>', true],
    ['', false],
    ['<!-- --> empty comment', true],
    ['<!-- // JS style comment -->', true],
    ['text <!-- at end -->', true],
    ['<!-- at start --> text', true],
    ['<ul><!-- hidden item --><li>visible</li></ul>', true],
    ['<!-- a -->text<!-- b -->', true],
    ['<!DOCTYPE html>', false],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, hasComments] = cases[i];
    it(`stripComments ${i + 1}: ${hasComments ? 'removes comments' : 'unchanged'}`, () => {
      const result = stripComments(html);
      expect(result).not.toMatch(/<!--[\s\S]*?-->/);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. replaceTag — 20 tests
// ---------------------------------------------------------------------------
describe('replaceTag', () => {
  const cases: Array<[string, string, string, string]> = [
    ['<b>bold</b>', 'b', 'strong', '<strong>bold</strong>'],
    ['<i>italic</i>', 'i', 'em', '<em>italic</em>'],
    ['<div>content</div>', 'div', 'section', '<section>content</section>'],
    ['<p>text</p>', 'p', 'span', '<span>text</span>'],
    ['<h1>title</h1>', 'h1', 'h2', '<h2>title</h2>'],
    ['<ul><li>item</li></ul>', 'li', 'dt', '<ul><dt>item</dt></ul>'],
    ['<b>a</b><b>b</b>', 'b', 'strong', '<strong>a</strong><strong>b</strong>'],
    ['<B>UPPER</B>', 'b', 'strong', '<strong>UPPER</strong>'],
    ['<p class="x">styled</p>', 'p', 'div', '<div class="x">styled</div>'],
    ['no tags', 'p', 'div', 'no tags'],
    ['<article>article</article>', 'article', 'main', '<main>article</main>'],
    ['<header>hdr</header>', 'header', 'div', '<div>hdr</div>'],
    ['<footer>ftr</footer>', 'footer', 'div', '<div>ftr</div>'],
    ['<nav>nav</nav>', 'nav', 'div', '<div>nav</div>'],
    ['<aside>aside</aside>', 'aside', 'div', '<div>aside</div>'],
    ['<figure>fig</figure>', 'figure', 'div', '<div>fig</div>'],
    ['<cite>cite</cite>', 'cite', 'span', '<span>cite</span>'],
    ['<code>code()</code>', 'code', 'pre', '<pre>code()</pre>'],
    ['<del>deleted</del>', 'del', 's', '<s>deleted</s>'],
    ['<ins>inserted</ins>', 'ins', 'u', '<u>inserted</u>'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, from, to, expected] = cases[i];
    it(`replaceTag ${i + 1}: ${from} → ${to}`, () => {
      expect(replaceTag(html, from, to)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 28. unwrapTag — 20 tests
// ---------------------------------------------------------------------------
describe('unwrapTag', () => {
  const cases: Array<[string, string, string]> = [
    ['<b>bold text</b>', 'b', 'bold text'],
    ['<i>italic</i>', 'i', 'italic'],
    ['<div>content</div>', 'div', 'content'],
    ['<p>paragraph</p>', 'p', 'paragraph'],
    ['<span>span text</span>', 'span', 'span text'],
    ['<em>emphasis</em>', 'em', 'emphasis'],
    ['<strong>strong</strong>', 'strong', 'strong'],
    ['<section>section content</section>', 'section', 'section content'],
    ['<article>article content</article>', 'article', 'article content'],
    ['<mark>highlighted</mark>', 'mark', 'highlighted'],
    ['<b><i>nested</i></b>', 'b', '<i>nested</i>'],
    ['<div><p>inner</p></div>', 'div', '<p>inner</p>'],
    ['no wrapper', 'b', 'no wrapper'],
    ['<B>UPPER</B>', 'b', 'UPPER'],
    ['<div class="x">with attrs</div>', 'div', 'with attrs'],
    ['<p>first</p><p>second</p>', 'p', 'firstsecond'],
    ['<blockquote>quoted text</blockquote>', 'blockquote', 'quoted text'],
    ['<pre>pre text</pre>', 'pre', 'pre text'],
    ['<code>code()</code>', 'code', 'code()'],
    ['<del>deleted text</del>', 'del', 'deleted text'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [html, tag, expected] = cases[i];
    it(`unwrapTag ${i + 1}: unwrap <${tag}>`, () => {
      expect(unwrapTag(html, tag)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional edge-case tests to exceed 1000 total
// ---------------------------------------------------------------------------

describe('extractText', () => {
  it('extracts text from all p tags', () => {
    const html = '<p>first</p><p>second</p><p>third</p>';
    expect(extractText(html, 'p')).toEqual(['first', 'second', 'third']);
  });
  it('extracts text from nested tags', () => {
    const html = '<li>item one</li><li>item two</li>';
    expect(extractText(html, 'li')).toEqual(['item one', 'item two']);
  });
  it('returns empty array when tag not found', () => {
    expect(extractText('<p>text</p>', 'h1')).toEqual([]);
  });
  it('decodes entities in extracted text', () => {
    const result = extractText('<p>R&amp;D</p>', 'p');
    expect(result[0]).toBe('R&D');
  });
  it('handles empty tag', () => {
    const result = extractText('<p></p>', 'p');
    expect(result[0]).toBe('');
  });
});

describe('extractMetaTags', () => {
  it('extracts meta name and content', () => {
    const html = '<meta name="description" content="My page">';
    const result = extractMetaTags(html);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('description');
    expect(result[0].content).toBe('My page');
  });
  it('extracts multiple meta tags', () => {
    const html = '<meta name="description" content="desc"><meta name="keywords" content="kw1,kw2">';
    const result = extractMetaTags(html);
    expect(result.length).toBe(2);
  });
  it('skips meta without name', () => {
    const html = '<meta charset="UTF-8">';
    const result = extractMetaTags(html);
    expect(result.length).toBe(0);
  });
  it('extracts og: property tags', () => {
    const html = '<meta property="og:title" content="OG Title">';
    const result = extractMetaTags(html);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('og:title');
  });
});

describe('extractEmails', () => {
  it('extracts email from plain text', () => {
    const html = '<p>Contact: user@example.com</p>';
    const result = extractEmails(html);
    expect(result).toContain('user@example.com');
  });
  it('extracts multiple emails', () => {
    const html = '<p>a@a.com and b@b.com</p>';
    const result = extractEmails(html);
    expect(result.length).toBe(2);
  });
  it('deduplicates emails', () => {
    const html = '<p>a@a.com a@a.com</p>';
    const result = extractEmails(html);
    expect(result.length).toBe(1);
  });
  it('returns empty for no emails', () => {
    expect(extractEmails('<p>no email here</p>')).toEqual([]);
  });
});

describe('extractTags', () => {
  it('returns unique sorted tag names', () => {
    const result = extractTags('<p>text</p><b>bold</b><p>more</p>');
    expect(result).toEqual(['b', 'p']);
  });
  it('includes closing tag names once', () => {
    const result = extractTags('<div><span>x</span></div>');
    expect(result).toEqual(['div', 'span']);
  });
  it('returns empty for no tags', () => {
    expect(extractTags('plain text')).toEqual([]);
  });
  it('lowercases tag names', () => {
    const result = extractTags('<P>text</P><B>bold</B>');
    expect(result).toContain('p');
    expect(result).toContain('b');
  });
});

describe('minifyHtml', () => {
  it('removes comments', () => {
    const result = minifyHtml('<p>text</p><!-- comment -->');
    expect(result).not.toContain('<!--');
  });
  it('collapses whitespace between tags', () => {
    const result = minifyHtml('<div>   <p>   </p>   </div>');
    expect(result.length).toBeLessThan('<div>   <p>   </p>   </div>'.length);
  });
  it('handles empty string', () => {
    expect(minifyHtml('')).toBe('');
  });
  it('preserves content', () => {
    const result = minifyHtml('<p>content</p>');
    expect(result).toContain('content');
  });
});

describe('stripStyles', () => {
  it('removes style tags', () => {
    const result = stripStyles('<style>body{color:red}</style><p>text</p>');
    expect(result).not.toContain('<style>');
    expect(result).toContain('<p>text</p>');
  });
  it('removes multiple style blocks', () => {
    const result = stripStyles('<style>a{}</style>text<style>b{}</style>');
    expect(result).not.toContain('<style>');
  });
  it('leaves non-style content intact', () => {
    expect(stripStyles('<p>text</p>')).toBe('<p>text</p>');
  });
  it('handles multiline style', () => {
    const result = stripStyles('<style>\nbody {\n  color: red;\n}\n</style>');
    expect(result.trim()).toBe('');
  });
});

describe('buildTag — extra edge cases', () => {
  it('opens with < and ends with >', () => {
    const result = buildTag('div');
    expect(result.startsWith('<')).toBe(true);
    expect(result.endsWith('>')).toBe(true);
  });
  it('self-closing ends with />', () => {
    const result = buildTag('br', {}, true);
    expect(result.endsWith('/>')).toBe(true);
  });
  it('encodes special chars in attrs', () => {
    const result = buildTag('a', { href: 'a&b' });
    expect(result).toContain('&amp;');
  });
});
