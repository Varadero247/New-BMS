// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  // Utilities
  escapeXml,
  unescapeXml,
  isValidXmlName,
  // Parsing
  parseXml,
  parseXmlNode,
  // Building
  buildXml,
  buildXmlNode,
  nodeToString,
  // Querying
  findByTag,
  findFirst,
  findByAttribute,
  getTextContent,
  getChildrenByTag,
  getAttribute,
  hasAttribute,
  countNodes,
  getDepth,
  // Transformation
  mapNodes,
  filterNodes,
  addChild,
  removeChild,
  setAttribute,
  removeAttribute,
  createNode,
  createDocument,
  // Conversion
  xmlToJson,
  jsonToXml,
} from '../xml-utils';

import type { XmlNode, XmlDocument } from '../types';

// ---------------------------------------------------------------------------
// Helper: build a deep tree of given depth
// ---------------------------------------------------------------------------
function buildDeepTree(depth: number, tag = 'node'): XmlNode {
  if (depth <= 1) return createNode(tag, { level: '1' }, 'leaf');
  return addChild(createNode(tag, { level: String(depth) }), buildDeepTree(depth - 1, tag));
}

// ---------------------------------------------------------------------------
// 1. escapeXml / unescapeXml — 50 iterations × 10 expects = 500 expects
// ---------------------------------------------------------------------------
describe('escapeXml / unescapeXml roundtrip', () => {
  const samples: string[] = [
    'Hello & World',
    '<div>',
    '>arrow',
    '"quoted"',
    "'apostrophe'",
    'a & b < c > d "e" \'f\'',
    '',
    'plain text',
    '&amp; already escaped',
    'mix <b>&amp;"it\'s"</b>',
  ];

  for (let i = 0; i < 50; i++) {
    const sample = samples[i % samples.length];
    test(`escape/unescape roundtrip #${i + 1}: "${sample.slice(0, 20)}"`, () => {
      const escaped = escapeXml(sample);
      const roundtripped = unescapeXml(escaped);
      expect(typeof escaped).toBe('string');
      expect(typeof roundtripped).toBe('string');
      // escapeXml should not leave bare & < > in output (unless already part of entity)
      expect(escaped).not.toMatch(/(?<!&amp|&lt|&gt|&quot|&apos|&#\d+|&#x[\da-fA-F]+);.*?[<>]/);
      // round-trip recovers the original string for the simple samples
      if (!sample.startsWith('&amp;')) {
        // avoid double-unescape on already-escaped inputs in roundtrip check
        expect(unescapeXml(escapeXml(sample))).toBe(sample);
      }
      expect(unescapeXml(escapeXml('safe text'))).toBe('safe text');
    });
  }
});

// ---------------------------------------------------------------------------
// 2. createNode + buildXmlNode + parseXmlNode roundtrip — 100 iterations × 5 expects
// ---------------------------------------------------------------------------
describe('createNode → buildXmlNode → parseXmlNode roundtrip', () => {
  for (let i = 1; i <= 100; i++) {
    test(`roundtrip #${i}`, () => {
      const tag = `item${i}`;
      const attrs: Record<string, string> = { id: String(i), index: String(i * 2) };
      const text = i % 3 === 0 ? `text-${i}` : undefined;
      const node = createNode(tag, attrs, text);

      const xml = nodeToString(node);
      expect(typeof xml).toBe('string');
      expect(xml).toContain(`<${tag}`);

      const parsed = parseXmlNode(xml);
      expect(parsed.tag).toBe(tag);
      expect(parsed.attributes['id']).toBe(String(i));
      expect(parsed.attributes['index']).toBe(String(i * 2));
      if (text) {
        expect(parsed.text).toBe(text);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. findByTag on generated trees — 50 iterations × 6 expects
// ---------------------------------------------------------------------------
describe('findByTag on generated trees', () => {
  for (let i = 0; i < 50; i++) {
    test(`findByTag tree #${i + 1}`, () => {
      const childCount = (i % 5) + 2; // 2..6 children
      let root = createNode('root', { n: String(i) });
      for (let j = 0; j < childCount; j++) {
        root = addChild(root, createNode('child', { j: String(j) }, `value-${j}`));
      }
      // Add one grandchild with a unique tag
      const withGrand = addChild(
        root,
        addChild(createNode('group'), createNode('grandchild', { g: String(i) }))
      );

      const children = findByTag(withGrand, 'child');
      expect(children.length).toBe(childCount);

      const grandchildren = findByTag(withGrand, 'grandchild');
      expect(grandchildren.length).toBe(1);
      expect(grandchildren[0].tag).toBe('grandchild');

      const none = findByTag(withGrand, 'nonexistent');
      expect(none.length).toBe(0);

      const first = findFirst(withGrand, 'child');
      expect(first).toBeDefined();
      expect(first!.tag).toBe('child');

      const firstMissing = findFirst(withGrand, 'zzz');
      expect(firstMissing).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 4. addChild / removeChild operations — 50 iterations × 6 expects
// ---------------------------------------------------------------------------
describe('addChild and removeChild', () => {
  for (let i = 1; i <= 50; i++) {
    test(`addChild/removeChild #${i}`, () => {
      const parent = createNode('parent', { i: String(i) });
      const child = createNode(`child-${i}`, { idx: String(i) }, `text-${i}`);

      const withChild = addChild(parent, child);
      expect(withChild.children.length).toBe(1);
      expect(withChild.children[0].tag).toBe(`child-${i}`);

      // Original is not mutated
      expect(parent.children.length).toBe(0);

      const withoutChild = removeChild(withChild, `child-${i}`);
      expect(withoutChild.children.length).toBe(0);

      // Removing non-existent child returns same structure
      const unchanged = removeChild(withChild, 'nonexistent');
      expect(unchanged.children.length).toBe(1);

      // addChild preserves existing children
      const sibling = createNode('sibling');
      const withTwo = addChild(withChild, sibling);
      expect(withTwo.children.length).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. setAttribute / getAttribute roundtrip — 50 iterations × 7 expects
// ---------------------------------------------------------------------------
describe('setAttribute and getAttribute roundtrip', () => {
  for (let i = 0; i < 50; i++) {
    test(`setAttribute/getAttribute #${i + 1}`, () => {
      const node = createNode('el', { existing: 'yes' });
      const key = `attr-${i}`;
      const value = `value-${i * 3}`;

      const updated = setAttribute(node, key, value);
      expect(getAttribute(updated, key)).toBe(value);
      expect(hasAttribute(updated, key)).toBe(true);

      // Original unaffected
      expect(hasAttribute(node, key)).toBe(false);

      // Override existing
      const overridden = setAttribute(updated, key, 'new');
      expect(getAttribute(overridden, key)).toBe('new');

      // Default value when attr absent
      expect(getAttribute(node, 'missing', 'default')).toBe('default');
      expect(getAttribute(node, 'missing')).toBeUndefined();

      // removeAttribute
      const removed = removeAttribute(updated, key);
      expect(hasAttribute(removed, key)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. buildXml / parseXml with declaration — 30 tests
// ---------------------------------------------------------------------------
describe('buildXml and parseXml with declaration', () => {
  for (let i = 1; i <= 30; i++) {
    test(`buildXml/parseXml #${i}`, () => {
      const root = createNode('document', { version: String(i) }, `doc-${i}`);
      const doc = createDocument(root, { version: '1.0', encoding: 'UTF-8' });
      const xml = buildXml(doc, { declaration: true, indent: '  ' });

      expect(xml).toContain('<?xml');
      expect(xml).toContain('version="1.0"');
      expect(xml).toContain('<document');
      expect(xml).toContain(`doc-${i}`);

      const parsed = parseXml(xml);
      expect(parsed.root.tag).toBe('document');
      expect(parsed.root.attributes['version']).toBe(String(i));
      expect(parsed.root.text).toBe(`doc-${i}`);
      expect(parsed.declaration).toBeDefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 7. countNodes and getDepth — 30 tests
// ---------------------------------------------------------------------------
describe('countNodes and getDepth', () => {
  for (let i = 1; i <= 30; i++) {
    test(`countNodes/getDepth tree depth ${i % 5 + 1}`, () => {
      const depth = (i % 5) + 1;
      const tree = buildDeepTree(depth);

      const nodeCount = countNodes(tree);
      expect(nodeCount).toBe(depth); // linear chain: exactly 'depth' nodes

      const treeDepth = getDepth(tree);
      expect(treeDepth).toBe(depth);

      // Flat tree: 1 root + N children → N+1 nodes, depth 2
      let flat = createNode('flat');
      for (let j = 0; j < i; j++) flat = addChild(flat, createNode(`c${j}`));
      expect(countNodes(flat)).toBe(i + 1);
      if (i > 0) {
        expect(getDepth(flat)).toBe(2);
      } else {
        expect(getDepth(flat)).toBe(1);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 8. mapNodes and filterNodes — 30 tests
// ---------------------------------------------------------------------------
describe('mapNodes and filterNodes', () => {
  for (let i = 0; i < 30; i++) {
    test(`mapNodes/filterNodes #${i + 1}`, () => {
      let root = createNode('root');
      for (let j = 0; j < 4; j++) {
        const child = createNode(j % 2 === 0 ? 'even' : 'odd', { n: String(j) });
        root = addChild(root, child);
      }

      // mapNodes: add a mapped attribute to every node
      const mapped = mapNodes(root, (n) => setAttribute(n, 'mapped', 'true'));
      expect(getAttribute(mapped, 'mapped')).toBe('true');
      for (const c of mapped.children) {
        expect(getAttribute(c, 'mapped')).toBe('true');
      }

      // filterNodes: keep only 'even' children
      const filtered = filterNodes(root, (n) => n.tag === 'even');
      expect(filtered.children.every((c) => c.tag === 'even')).toBe(true);
      // root is always kept
      expect(filtered.tag).toBe('root');

      // Original tree unmodified
      expect(root.children.length).toBe(4);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. getTextContent — 20 tests
// ---------------------------------------------------------------------------
describe('getTextContent', () => {
  for (let i = 1; i <= 20; i++) {
    test(`getTextContent #${i}`, () => {
      const texts = Array.from({ length: i }, (_, k) => `text${k + 1}`);
      let root = createNode('root', {}, texts[0]);
      for (let j = 1; j < i; j++) {
        root = addChild(root, createNode(`c${j}`, {}, texts[j]));
      }
      const content = getTextContent(root);
      expect(typeof content).toBe('string');
      // All text fragments should appear in the concatenation
      for (const t of texts) {
        expect(content).toContain(t);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 10. getChildrenByTag — 20 tests
// ---------------------------------------------------------------------------
describe('getChildrenByTag', () => {
  for (let i = 1; i <= 20; i++) {
    test(`getChildrenByTag #${i}`, () => {
      let root = createNode('root');
      const targetTag = 'target';
      for (let j = 0; j < i; j++) {
        root = addChild(root, createNode(targetTag, { j: String(j) }));
        root = addChild(root, createNode('other', { j: String(j) }));
      }
      const targets = getChildrenByTag(root, targetTag);
      expect(targets.length).toBe(i);
      const others = getChildrenByTag(root, 'other');
      expect(others.length).toBe(i);
      const none = getChildrenByTag(root, 'missing');
      expect(none.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. findByAttribute — 20 tests
// ---------------------------------------------------------------------------
describe('findByAttribute', () => {
  for (let i = 1; i <= 20; i++) {
    test(`findByAttribute #${i}`, () => {
      let root = createNode('root');
      for (let j = 0; j < i; j++) {
        root = addChild(
          root,
          createNode('item', { id: String(j), type: j % 2 === 0 ? 'even' : 'odd' })
        );
      }
      // All have 'id'
      const withId = findByAttribute(root, 'id');
      expect(withId.length).toBe(i);

      // Filter by value
      const evens = findByAttribute(root, 'type', 'even');
      const expectedEvens = Math.ceil(i / 2);
      expect(evens.length).toBe(expectedEvens);

      // No match
      const noMatch = findByAttribute(root, 'id', 'nonexistent');
      expect(noMatch.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. xmlToJson / jsonToXml — 20 tests
// ---------------------------------------------------------------------------
describe('xmlToJson and jsonToXml', () => {
  for (let i = 1; i <= 20; i++) {
    test(`xmlToJson/jsonToXml #${i}`, () => {
      const obj: Record<string, unknown> = {};
      for (let j = 0; j < i; j++) {
        obj[`key${j}`] = `value${j}`;
      }

      const xmlNode = jsonToXml(obj, 'record');
      expect(xmlNode.tag).toBe('record');
      expect(xmlNode.children.length).toBe(i);

      for (let j = 0; j < i; j++) {
        const child = xmlNode.children.find((c) => c.tag === `key${j}`);
        expect(child).toBeDefined();
        expect(child!.text).toBe(`value${j}`);
      }

      // xmlToJson
      const json = xmlToJson(xmlNode) as Record<string, unknown>;
      expect(typeof json).toBe('object');
      for (let j = 0; j < i; j++) {
        expect(json[`key${j}`]).toBeDefined();
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 13. isValidXmlName — correctness tests
// ---------------------------------------------------------------------------
describe('isValidXmlName', () => {
  const valid = [
    'div', 'my-element', 'ns:tag', '_private', 'item.1',
    'a', 'A', 'myTag123', 'some_tag', 'root',
  ];
  const invalid = ['', '1starts-with-digit', ' spaces', '-starts', '.starts'];

  for (let i = 0; i < 20; i++) {
    test(`valid name #${i + 1}: "${valid[i % valid.length]}"`, () => {
      expect(isValidXmlName(valid[i % valid.length])).toBe(true);
    });
  }
  for (let i = 0; i < 20; i++) {
    test(`invalid name #${i + 1}: "${invalid[i % invalid.length]}"`, () => {
      expect(isValidXmlName(invalid[i % invalid.length])).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. parseXml correctness — 30 specific tests
// ---------------------------------------------------------------------------
describe('parseXml correctness', () => {
  test('parses simple element with text', () => {
    const doc = parseXml('<root>hello</root>');
    expect(doc.root.tag).toBe('root');
    expect(doc.root.text).toBe('hello');
  });

  test('parses element with attributes', () => {
    const doc = parseXml('<item id="1" name="foo"/>');
    expect(doc.root.tag).toBe('item');
    expect(doc.root.attributes['id']).toBe('1');
    expect(doc.root.attributes['name']).toBe('foo');
  });

  test('parses nested children', () => {
    const xml = '<parent><child1/><child2>text</child2></parent>';
    const doc = parseXml(xml);
    expect(doc.root.children.length).toBe(2);
    expect(doc.root.children[0].tag).toBe('child1');
    expect(doc.root.children[1].tag).toBe('child2');
    expect(doc.root.children[1].text).toBe('text');
  });

  test('parses XML declaration', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><root/>';
    const doc = parseXml(xml);
    expect(doc.declaration).toBeDefined();
    expect(doc.declaration!['version']).toBe('1.0');
    expect(doc.declaration!['encoding']).toBe('UTF-8');
    expect(doc.root.tag).toBe('root');
  });

  test('parses self-closing tag', () => {
    const doc = parseXml('<br/>');
    expect(doc.root.tag).toBe('br');
    expect(doc.root.selfClosing).toBe(true);
    expect(doc.root.children.length).toBe(0);
  });

  test('parses attributes with single quotes', () => {
    const doc = parseXml("<item name='hello' id='42'/>");
    expect(doc.root.attributes['name']).toBe('hello');
    expect(doc.root.attributes['id']).toBe('42');
  });

  test('parses escaped entities in text', () => {
    const doc = parseXml('<note>a &amp; b &lt; c</note>');
    expect(doc.root.text).toBe('a & b < c');
  });

  test('parses escaped entities in attributes', () => {
    const doc = parseXml('<el title="hello &amp; world"/>');
    expect(doc.root.attributes['title']).toBe('hello & world');
  });

  test('parses deeply nested structure', () => {
    const xml = '<a><b><c><d>deep</d></c></b></a>';
    const doc = parseXml(xml);
    expect(doc.root.tag).toBe('a');
    expect(getDepth(doc.root)).toBe(4);
  });

  test('parses multiple children with same tag', () => {
    const xml = '<list><item>1</item><item>2</item><item>3</item></list>';
    const doc = parseXml(xml);
    const items = getChildrenByTag(doc.root, 'item');
    expect(items.length).toBe(3);
    expect(items[0].text).toBe('1');
    expect(items[2].text).toBe('3');
  });

  test('throws on empty input', () => {
    expect(() => parseXml('')).toThrow();
  });

  test('ignores XML comments', () => {
    const xml = '<root><!-- this is a comment --><child/></root>';
    const doc = parseXml(xml);
    expect(doc.root.children.length).toBe(1);
    expect(doc.root.children[0].tag).toBe('child');
  });

  test('parseXmlNode works for simple node', () => {
    const node = parseXmlNode('<item id="5">hello</item>');
    expect(node.tag).toBe('item');
    expect(node.attributes['id']).toBe('5');
    expect(node.text).toBe('hello');
  });

  // Additional correctness tests (i=0..16)
  for (let i = 0; i < 17; i++) {
    test(`parse/build correctness #${i + 1}`, () => {
      const n = createNode(`el${i}`, { idx: String(i) }, i % 2 === 0 ? `t${i}` : undefined);
      const xml = nodeToString(n);
      const parsed = parseXmlNode(xml);
      expect(parsed.tag).toBe(`el${i}`);
      expect(parsed.attributes['idx']).toBe(String(i));
      if (i % 2 === 0) {
        expect(parsed.text).toBe(`t${i}`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 15. buildXml options — 15 tests
// ---------------------------------------------------------------------------
describe('buildXml options', () => {
  for (let i = 0; i < 15; i++) {
    test(`buildXml option variant #${i + 1}`, () => {
      const root = createNode('root', { n: String(i) }, `content-${i}`);
      const doc = createDocument(root, { version: '1.0' });

      // with declaration
      const withDecl = buildXml(doc, { declaration: true });
      expect(withDecl.startsWith('<?xml')).toBe(true);

      // without declaration
      const noDecl = buildXml(doc, { declaration: false });
      expect(noDecl.startsWith('<root')).toBe(true);

      // custom indent
      const indented = buildXml(doc, { indent: '\t', declaration: false });
      expect(typeof indented).toBe('string');
      expect(indented).toContain('<root');
    });
  }
});

// ---------------------------------------------------------------------------
// 16. nodeToString compact output — 20 tests
// ---------------------------------------------------------------------------
describe('nodeToString compact', () => {
  for (let i = 0; i < 20; i++) {
    test(`nodeToString #${i + 1}`, () => {
      const tag = `tag${i}`;
      const attrs: Record<string, string> = { id: String(i) };
      if (i % 2 === 0) attrs['class'] = `cls-${i}`;

      const node = createNode(tag, attrs, i % 3 === 0 ? `txt-${i}` : undefined);
      const str = nodeToString(node);
      expect(str).toContain(`<${tag}`);
      expect(str).toContain(`id="${i}"`);
      if (i % 3 === 0) expect(str).toContain(`txt-${i}`);
      // No newlines in compact output
      expect(str.includes('\n')).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. createDocument — 10 tests
// ---------------------------------------------------------------------------
describe('createDocument', () => {
  for (let i = 1; i <= 10; i++) {
    test(`createDocument #${i}`, () => {
      const root = createNode(`root${i}`);
      const doc = createDocument(root, { version: '1.0', encoding: 'UTF-8' });
      expect(doc.root.tag).toBe(`root${i}`);
      expect(doc.declaration!['version']).toBe('1.0');
      expect(doc.declaration!['encoding']).toBe('UTF-8');
    });
  }
});

// ---------------------------------------------------------------------------
// 18. Immutability checks — 20 tests
// ---------------------------------------------------------------------------
describe('Immutability of transformation functions', () => {
  for (let i = 0; i < 20; i++) {
    test(`immutability #${i + 1}`, () => {
      const original = createNode('root', { a: 'orig' });
      const withAttr = setAttribute(original, 'b', 'new');
      expect(original.attributes['b']).toBeUndefined();
      expect(withAttr.attributes['b']).toBe('new');

      const child = createNode(`child${i}`);
      const withChild = addChild(original, child);
      expect(original.children.length).toBe(0);
      expect(withChild.children.length).toBe(1);

      const withoutChild = removeChild(withChild, `child${i}`);
      expect(withChild.children.length).toBe(1);
      expect(withoutChild.children.length).toBe(0);

      const withoutAttr = removeAttribute(withAttr, 'b');
      expect(withAttr.attributes['b']).toBe('new');
      expect(withoutAttr.attributes['b']).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 19. Edge cases — 15 tests
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  test('escapeXml handles empty string', () => {
    expect(escapeXml('')).toBe('');
  });

  test('unescapeXml handles plain text', () => {
    expect(unescapeXml('hello world')).toBe('hello world');
  });

  test('unescapeXml handles numeric char refs', () => {
    expect(unescapeXml('&#65;')).toBe('A');
    expect(unescapeXml('&#x41;')).toBe('A');
  });

  test('createNode without text leaves text undefined', () => {
    const n = createNode('el');
    expect(n.text).toBeUndefined();
  });

  test('createNode with empty attributes', () => {
    const n = createNode('el', {});
    expect(Object.keys(n.attributes).length).toBe(0);
  });

  test('nodeToString self-closing with no children/text', () => {
    const n = createNode('br', {});
    n.selfClosing = true;
    expect(nodeToString(n)).toBe('<br/>');
  });

  test('findByTag returns empty for leaf node', () => {
    const n = createNode('leaf');
    expect(findByTag(n, 'leaf').length).toBe(0);
    expect(findByTag(n, 'other').length).toBe(0);
  });

  test('getAttribute with default for missing attribute', () => {
    const n = createNode('el');
    expect(getAttribute(n, 'x', 'fallback')).toBe('fallback');
    expect(getAttribute(n, 'x')).toBeUndefined();
  });

  test('countNodes single leaf', () => {
    const n = createNode('leaf');
    expect(countNodes(n)).toBe(1);
  });

  test('getDepth single leaf', () => {
    const n = createNode('leaf');
    expect(getDepth(n)).toBe(1);
  });

  test('filterNodes with always-true predicate returns same structure', () => {
    let root = createNode('root');
    root = addChild(root, createNode('a'));
    root = addChild(root, createNode('b'));
    const filtered = filterNodes(root, () => true);
    expect(filtered.children.length).toBe(2);
  });

  test('filterNodes with always-false predicate removes all children', () => {
    let root = createNode('root');
    root = addChild(root, createNode('a'));
    root = addChild(root, createNode('b'));
    const filtered = filterNodes(root, () => false);
    expect(filtered.children.length).toBe(0);
  });

  test('jsonToXml with nested object', () => {
    const obj = { outer: { inner: 'value' } };
    const node = jsonToXml(obj, 'root');
    expect(node.tag).toBe('root');
    const outer = node.children.find((c) => c.tag === 'outer');
    expect(outer).toBeDefined();
    const inner = outer!.children.find((c) => c.tag === 'inner');
    expect(inner).toBeDefined();
    expect(inner!.text).toBe('value');
  });

  test('jsonToXml with array value', () => {
    const obj: Record<string, unknown> = { items: ['a', 'b', 'c'] };
    const node = jsonToXml(obj, 'root');
    const items = node.children.filter((c) => c.tag === 'items');
    expect(items.length).toBe(3);
    expect(items[0].text).toBe('a');
    expect(items[2].text).toBe('c');
  });

  test('buildXmlNode indentation levels', () => {
    let root = createNode('root');
    root = addChild(root, createNode('child', {}, 'text'));
    const result = buildXmlNode(root, '  ', 0);
    expect(result).toContain('\n');
    expect(result).toContain('  <child>');
  });
});

// ---------------------------------------------------------------------------
// 20. Comprehensive parse ↔ build ↔ parse stability — 50 tests
// ---------------------------------------------------------------------------
describe('Parse → build → parse stability', () => {
  for (let i = 0; i < 50; i++) {
    test(`stability #${i + 1}`, () => {
      // Build an XML string with varying complexity
      const childCount = (i % 4) + 1;
      let root = createNode(`root${i}`, { rev: String(i) });
      for (let j = 0; j < childCount; j++) {
        const child = createNode(`child`, { j: String(j), parent: String(i) }, `val-${j}`);
        root = addChild(root, child);
      }
      const doc1 = createDocument(root, { version: '1.0', encoding: 'UTF-8' });
      const xml1 = buildXml(doc1, { declaration: true });

      // Second parse
      const doc2 = parseXml(xml1);
      expect(doc2.root.tag).toBe(`root${i}`);
      expect(doc2.root.attributes['rev']).toBe(String(i));
      expect(doc2.root.children.length).toBe(childCount);

      // Second build should produce valid XML
      const xml2 = buildXml(doc2, { declaration: false });
      expect(xml2).toContain(`<root${i}`);

      // Third parse from second build
      const doc3 = parseXml(xml2);
      expect(doc3.root.tag).toBe(`root${i}`);
      expect(doc3.root.children.length).toBe(childCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. mapNodes depth coverage — 20 tests
// ---------------------------------------------------------------------------
describe('mapNodes deep coverage', () => {
  for (let i = 1; i <= 20; i++) {
    test(`mapNodes depth ${i % 4 + 1}`, () => {
      const depth = (i % 4) + 1;
      const tree = buildDeepTree(depth, `n${i}`);

      let callCount = 0;
      const counted = mapNodes(tree, (n) => {
        callCount++;
        return setAttribute(n, 'visited', 'yes');
      });

      expect(callCount).toBe(depth);
      // Every node in result should have 'visited' attribute
      function checkVisited(node: XmlNode): void {
        expect(node.attributes['visited']).toBe('yes');
        node.children.forEach(checkVisited);
      }
      checkVisited(counted);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. Bulk escapeXml special characters — 20 tests
// ---------------------------------------------------------------------------
describe('escapeXml special characters', () => {
  const chars = ['&', '<', '>', '"', "'"];
  for (let i = 0; i < 20; i++) {
    test(`escape special char #${i + 1}`, () => {
      const ch = chars[i % chars.length];
      const input = `before${ch}after`;
      const escaped = escapeXml(input);
      // The raw character should not appear unescaped in the result
      if (ch === '&') {
        // &amp; is the escape; there should be no bare & followed by a non-entity char
        expect(escaped).toContain('&amp;');
        expect(escaped).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
      } else {
        expect(escaped).not.toContain(ch);
      }
      expect(unescapeXml(escaped)).toBe(input);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. buildXmlNode with children only (no text) — 20 tests
// ---------------------------------------------------------------------------
describe('buildXmlNode children-only', () => {
  for (let i = 1; i <= 20; i++) {
    test(`children-only buildXmlNode #${i}`, () => {
      let parent = createNode('parent');
      for (let j = 0; j < i; j++) {
        parent = addChild(parent, createNode(`child${j}`, { n: String(j) }));
      }
      const xml = buildXmlNode(parent, '  ', 0);
      expect(xml).toContain('<parent>');
      expect(xml).toContain('</parent>');
      for (let j = 0; j < i; j++) {
        expect(xml).toContain(`<child${j}`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 24. Mixed content (text + children) roundtrip — 20 tests
// ---------------------------------------------------------------------------
describe('Mixed content roundtrip', () => {
  for (let i = 1; i <= 20; i++) {
    test(`mixed content #${i}`, () => {
      // Build a node with text + children
      let parent = createNode('mixed', {}, `prefix-${i}`);
      parent = addChild(parent, createNode('sub', {}, `child-text-${i}`));

      const xml = buildXmlNode(parent, '  ', 0);
      expect(xml).toContain(`prefix-${i}`);
      expect(xml).toContain(`child-text-${i}`);

      const reparsed = parseXmlNode(xml);
      expect(reparsed.text).toBe(`prefix-${i}`);
      expect(reparsed.children.length).toBe(1);
      expect(reparsed.children[0].text).toBe(`child-text-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. Attribute escaping in build/parse roundtrip — 20 tests
// ---------------------------------------------------------------------------
describe('Attribute escaping roundtrip', () => {
  for (let i = 0; i < 20; i++) {
    test(`attribute escaping #${i + 1}`, () => {
      const specialValues = [
        'hello & world',
        '<tag>',
        '>value',
        '"quoted"',
        "it's fine",
        'mix &amp; <ok>',
        `val-${i}`,
        'normal',
        '100% ok',
        'a=b',
      ];
      const val = specialValues[i % specialValues.length];
      const node = createNode('el', { data: val });
      const xml = nodeToString(node);
      const parsed = parseXmlNode(xml);
      expect(parsed.attributes['data']).toBe(val);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. removeChild on multi-child nodes — 40 tests
// ---------------------------------------------------------------------------
describe('removeChild multi-child', () => {
  for (let i = 1; i <= 40; i++) {
    test(`removeChild multi-child #${i}`, () => {
      let root = createNode('root');
      const numChildren = (i % 5) + 2;
      for (let j = 0; j < numChildren; j++) {
        root = addChild(root, createNode(`child${j}`, { j: String(j) }));
      }
      expect(root.children.length).toBe(numChildren);

      // Remove the middle child
      const midTag = `child${Math.floor(numChildren / 2)}`;
      const pruned = removeChild(root, midTag);
      expect(pruned.children.length).toBe(numChildren - 1);
      expect(pruned.children.every((c) => c.tag !== midTag)).toBe(true);

      // Original unaffected
      expect(root.children.length).toBe(numChildren);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. getDepth on wide trees — 40 tests
// ---------------------------------------------------------------------------
describe('getDepth on wide and deep trees', () => {
  for (let i = 1; i <= 40; i++) {
    test(`getDepth wide/deep #${i}`, () => {
      // Build a tree: root → i children each with (i%3+1) grandchildren
      let root = createNode('root');
      const grandDepth = (i % 3) + 1;
      for (let j = 0; j < i; j++) {
        let branch = createNode(`branch${j}`);
        for (let k = 0; k < grandDepth; k++) {
          branch = addChild(branch, createNode(`leaf${k}`));
        }
        root = addChild(root, branch);
      }
      const d = getDepth(root);
      // root(1) + branch(1) + leaf(1) = 3 when grandDepth >= 1
      expect(d).toBe(3);

      // Leaf-only check
      const leafNode = createNode('leaf');
      expect(getDepth(leafNode)).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 28. xmlToJson with attributes — 30 tests
// ---------------------------------------------------------------------------
describe('xmlToJson with @attributes', () => {
  for (let i = 1; i <= 30; i++) {
    test(`xmlToJson attributes #${i}`, () => {
      const node = createNode('item', { id: String(i), type: `type-${i % 3}` }, `text-${i}`);
      const json = xmlToJson(node) as Record<string, unknown>;

      expect(json['@attributes']).toBeDefined();
      const attrs = json['@attributes'] as Record<string, string>;
      expect(attrs['id']).toBe(String(i));
      expect(attrs['type']).toBe(`type-${i % 3}`);
      expect(json['#text']).toBe(`text-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. buildXml without declaration — 30 tests
// ---------------------------------------------------------------------------
describe('buildXml no-declaration mode', () => {
  for (let i = 1; i <= 30; i++) {
    test(`buildXml no-decl #${i}`, () => {
      let root = createNode(`el${i}`, { n: String(i) });
      if (i % 2 === 0) {
        root = addChild(root, createNode('nested', {}, `nested-${i}`));
      }
      const doc = createDocument(root);
      const xml = buildXml(doc, { declaration: false, indent: '    ' });
      expect(xml.startsWith(`<el${i}`)).toBe(true);
      expect(xml).not.toContain('<?xml');
      if (i % 2 === 0) {
        expect(xml).toContain('nested');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 30. countNodes on progressively larger trees — 30 tests
// ---------------------------------------------------------------------------
describe('countNodes progressive', () => {
  for (let i = 1; i <= 30; i++) {
    test(`countNodes progressive #${i}`, () => {
      let root = createNode('root');
      // Add i children
      for (let j = 0; j < i; j++) {
        root = addChild(root, createNode(`c${j}`));
      }
      expect(countNodes(root)).toBe(i + 1);

      // Add a grandchild to the first child
      if (i > 0) {
        const firstChild = root.children[0];
        const withGrand = addChild(firstChild, createNode('grand'));
        // Total: root + i children + 1 grandchild = i + 2
        // But we need to rebuild the root with updated first child
        const newChildren = [withGrand, ...root.children.slice(1)];
        const newRoot = { ...root, children: newChildren };
        expect(countNodes(newRoot)).toBe(i + 2);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 31. filterNodes with tag-based predicate — 40 tests
// ---------------------------------------------------------------------------
describe('filterNodes tag-based', () => {
  for (let i = 1; i <= 40; i++) {
    test(`filterNodes tag predicate #${i}`, () => {
      let root = createNode('root');
      const keepCount = i % 4 + 1;
      const dropCount = i % 3 + 1;
      for (let j = 0; j < keepCount; j++) {
        root = addChild(root, createNode('keep', { j: String(j) }));
      }
      for (let j = 0; j < dropCount; j++) {
        root = addChild(root, createNode('drop', { j: String(j) }));
      }

      const filtered = filterNodes(root, (n) => n.tag === 'keep');
      expect(filtered.children.length).toBe(keepCount);
      expect(filtered.children.every((c) => c.tag === 'keep')).toBe(true);

      const filteredDrop = filterNodes(root, (n) => n.tag === 'drop');
      expect(filteredDrop.children.length).toBe(dropCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 32. unescapeXml numeric character references — 25 tests
// ---------------------------------------------------------------------------
describe('unescapeXml numeric character references', () => {
  for (let i = 0; i < 25; i++) {
    test(`numeric charref #${i + 1}`, () => {
      const code = 65 + (i % 26); // A-Z cycling
      const charDecimal = `&#${code};`;
      const charHex = `&#x${code.toString(16).toUpperCase()};`;
      const expected = String.fromCharCode(code);
      expect(unescapeXml(charDecimal)).toBe(expected);
      expect(unescapeXml(charHex)).toBe(expected);
      expect(unescapeXml(`prefix${charDecimal}suffix`)).toBe(`prefix${expected}suffix`);
    });
  }
});

// ---------------------------------------------------------------------------
// 33. findFirst depth-first ordering — 20 tests
// ---------------------------------------------------------------------------
describe('findFirst depth-first ordering', () => {
  for (let i = 1; i <= 20; i++) {
    test(`findFirst ordering #${i}`, () => {
      // Build: root → [branch0, branch1, ...] each having 'target' children
      let root = createNode('root');
      for (let j = 0; j < i; j++) {
        let branch = createNode(`branch${j}`);
        branch = addChild(branch, createNode('target', { branch: String(j) }, `val-${j}`));
        root = addChild(root, branch);
      }

      // findFirst should return the first-encountered target (depth-first → branch0's target)
      const first = findFirst(root, 'target');
      expect(first).toBeDefined();
      expect(first!.attributes['branch']).toBe('0');
      expect(first!.text).toBe('val-0');

      // All targets
      const all = findByTag(root, 'target');
      expect(all.length).toBe(i);
    });
  }
});
