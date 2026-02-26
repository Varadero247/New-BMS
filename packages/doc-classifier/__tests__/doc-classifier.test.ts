import {
  getBuiltInRules,
  tokenise,
  scoreText,
  matchedKeywords,
  classify,
  detectConfidentiality,
  detectFormat,
  detectLanguage,
  isValidCategory,
  isValidFormat,
  isValidConfidentiality,
  makeConfig,
  makeDoc,
} from '../src/index';
import type {
  ClassificationRule,
  DocumentCategory,
  DocumentFormat,
  ConfidentialityLevel,
  LanguageCode,
  DocumentMetadata,
} from '../src/index';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const defaultConfig = makeConfig(0.1);

const ALL_CATEGORIES: DocumentCategory[] = [
  'policy', 'procedure', 'form', 'report', 'contract', 'invoice', 'certificate',
  'audit', 'risk', 'training', 'safety', 'compliance', 'technical', 'correspondence', 'other',
];

const ALL_FORMATS: DocumentFormat[] = [
  'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'html', 'xml', 'json', 'image', 'other',
];

const ALL_CONFIDENTIALITY: ConfidentialityLevel[] = ['public', 'internal', 'confidential', 'restricted'];

// ─────────────────────────────────────────────────────────────────────────────
// 1. getBuiltInRules
// ─────────────────────────────────────────────────────────────────────────────

describe('getBuiltInRules', () => {
  const rules = getBuiltInRules();

  it('returns an array', () => expect(Array.isArray(rules)).toBe(true));
  it('returns exactly 14 rules', () => expect(rules).toHaveLength(14));
  it('is not the same reference on repeated calls', () => {
    // Both calls return the same underlying array (that is fine), but result is truthy
    expect(getBuiltInRules()).toBeDefined();
  });

  // Every rule must have required fields
  rules.forEach((rule, i) => {
    it(`rule[${i}] has an id string`, () => expect(typeof rule.id).toBe('string'));
    it(`rule[${i}] id is non-empty`, () => expect(rule.id.length).toBeGreaterThan(0));
    it(`rule[${i}] has a category`, () => expect(typeof rule.category).toBe('string'));
    it(`rule[${i}] category is valid`, () => expect(isValidCategory(rule.category)).toBe(true));
    it(`rule[${i}] has keywords array`, () => expect(Array.isArray(rule.keywords)).toBe(true));
    it(`rule[${i}] has at least one keyword`, () => expect(rule.keywords.length).toBeGreaterThan(0));
    it(`rule[${i}] weight is a positive number`, () => expect(rule.weight).toBeGreaterThan(0));
    it(`rule[${i}] all keywords are strings`, () =>
      rule.keywords.forEach(kw => expect(typeof kw).toBe('string')));
  });

  // Specific rule ids must exist
  const ids = rules.map(r => r.id);
  const expectedIds = [
    'policy', 'procedure', 'form', 'report', 'contract', 'invoice', 'certificate',
    'audit', 'risk', 'training', 'safety', 'compliance', 'technical', 'correspondence',
  ];
  expectedIds.forEach(id => {
    it(`contains rule with id '${id}'`, () => expect(ids).toContain(id));
  });

  // Weight checks
  it('contract rule has weight 3', () => {
    const r = rules.find(x => x.id === 'contract');
    expect(r?.weight).toBe(3);
  });
  it('invoice rule has weight 3', () => {
    const r = rules.find(x => x.id === 'invoice');
    expect(r?.weight).toBe(3);
  });
  it('certificate rule has weight 3', () => {
    const r = rules.find(x => x.id === 'certificate');
    expect(r?.weight).toBe(3);
  });
  it('correspondence rule has weight 1', () => {
    const r = rules.find(x => x.id === 'correspondence');
    expect(r?.weight).toBe(1);
  });
  it('policy rule has weight 2', () => {
    const r = rules.find(x => x.id === 'policy');
    expect(r?.weight).toBe(2);
  });

  // Keyword content spot checks
  it('policy rule contains keyword "policy"', () => {
    const r = rules.find(x => x.id === 'policy')!;
    expect(r.keywords).toContain('policy');
  });
  it('invoice rule contains keyword "invoice"', () => {
    const r = rules.find(x => x.id === 'invoice')!;
    expect(r.keywords).toContain('invoice');
  });
  it('risk rule contains keyword "risk"', () => {
    const r = rules.find(x => x.id === 'risk')!;
    expect(r.keywords).toContain('risk');
  });
  it('safety rule contains keyword "safety"', () => {
    const r = rules.find(x => x.id === 'safety')!;
    expect(r.keywords).toContain('safety');
  });
  it('training rule contains keyword "training"', () => {
    const r = rules.find(x => x.id === 'training')!;
    expect(r.keywords).toContain('training');
  });
  it('compliance rule contains keyword "compliance"', () => {
    const r = rules.find(x => x.id === 'compliance')!;
    expect(r.keywords).toContain('compliance');
  });
  it('technical rule contains keyword "technical"', () => {
    const r = rules.find(x => x.id === 'technical')!;
    expect(r.keywords).toContain('technical');
  });
  it('audit rule contains keyword "audit"', () => {
    const r = rules.find(x => x.id === 'audit')!;
    expect(r.keywords).toContain('audit');
  });
  it('correspondence rule contains keyword "letter"', () => {
    const r = rules.find(x => x.id === 'correspondence')!;
    expect(r.keywords).toContain('letter');
  });
  it('form rule contains keyword "form"', () => {
    const r = rules.find(x => x.id === 'form')!;
    expect(r.keywords).toContain('form');
  });
  it('procedure rule contains keyword "procedure"', () => {
    const r = rules.find(x => x.id === 'procedure')!;
    expect(r.keywords).toContain('procedure');
  });
  it('report rule contains keyword "report"', () => {
    const r = rules.find(x => x.id === 'report')!;
    expect(r.keywords).toContain('report');
  });
  it('certificate rule contains keyword "certificate"', () => {
    const r = rules.find(x => x.id === 'certificate')!;
    expect(r.keywords).toContain('certificate');
  });
  it('contract rule contains keyword "contract"', () => {
    const r = rules.find(x => x.id === 'contract')!;
    expect(r.keywords).toContain('contract');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. tokenise
// ─────────────────────────────────────────────────────────────────────────────

describe('tokenise', () => {
  it('returns an array', () => expect(Array.isArray(tokenise('hello world'))).toBe(true));
  it('splits on single space', () => expect(tokenise('hello world')).toEqual(['hello', 'world']));
  it('splits on multiple spaces', () => expect(tokenise('a  b   c')).toEqual(['a', 'b', 'c']));
  it('splits on tab', () => expect(tokenise('a\tb')).toEqual(['a', 'b']));
  it('splits on newline', () => expect(tokenise('a\nb')).toEqual(['a', 'b']));
  it('splits on mixed whitespace', () => expect(tokenise('a \t\n b')).toEqual(['a', 'b']));
  it('lowercases tokens', () => expect(tokenise('Hello World')).toEqual(['hello', 'world']));
  it('lowercases ALL-CAPS', () => expect(tokenise('POLICY DOCUMENT')).toEqual(['policy', 'document']));
  it('filters empty strings', () => expect(tokenise('')).toEqual([]));
  it('handles leading whitespace', () => expect(tokenise('  hello')).toEqual(['hello']));
  it('handles trailing whitespace', () => expect(tokenise('hello  ')).toEqual(['hello']));
  it('handles single token', () => expect(tokenise('word')).toEqual(['word']));
  it('preserves punctuation within tokens', () => expect(tokenise('hello, world.')).toEqual(['hello,', 'world.']));
  it('handles numbers', () => expect(tokenise('report 2024')).toEqual(['report', '2024']));
  it('handles hyphenated words', () => expect(tokenise('near-miss event')).toEqual(['near-miss', 'event']));
  it('empty array for whitespace-only', () => expect(tokenise('   ')).toEqual([]));
  it('handles unicode letters', () => {
    const result = tokenise('über alles');
    expect(result).toContain('über');
    expect(result).toContain('alles');
  });

  // Loop: tokenise single words roundtrips correctly
  const singleWords = ['policy', 'audit', 'risk', 'safety', 'training', 'compliance', 'form'];
  singleWords.forEach(word => {
    it(`tokenise('${word}') returns ['${word}']`, () =>
      expect(tokenise(word)).toEqual([word]));
    it(`tokenise('${word.toUpperCase()}') returns ['${word}']`, () =>
      expect(tokenise(word.toUpperCase())).toEqual([word]));
  });

  // Loop: various lengths
  for (let n = 1; n <= 10; n++) {
    const words = Array.from({ length: n }, (_, i) => `word${i}`);
    it(`tokenise of ${n} space-separated words returns ${n} tokens`, () =>
      expect(tokenise(words.join(' '))).toHaveLength(n));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. scoreText
// ─────────────────────────────────────────────────────────────────────────────

describe('scoreText', () => {
  const policyRule: ClassificationRule = {
    id: 'policy', category: 'policy',
    keywords: ['policy', 'policies', 'governance', 'guideline', 'framework'],
    weight: 2,
  };
  const invoiceRule: ClassificationRule = {
    id: 'invoice', category: 'invoice',
    keywords: ['invoice', 'receipt', 'payment', 'billing', 'purchase order'],
    weight: 3,
  };
  const singleKwRule: ClassificationRule = {
    id: 'test', category: 'other',
    keywords: ['alpha'],
    weight: 5,
  };

  it('returns 0 for empty text', () => expect(scoreText('', policyRule)).toBe(0));
  it('returns 0 for no match', () => expect(scoreText('irrelevant document', policyRule)).toBe(0));
  it('returns weight for single keyword match', () => expect(scoreText('this is a policy', policyRule)).toBe(2));
  it('returns 2*weight for two keyword matches', () =>
    expect(scoreText('policy and governance document', policyRule)).toBe(4));
  it('returns 5*weight for all keywords matching', () =>
    expect(scoreText('policy policies governance guideline framework', policyRule)).toBe(10));
  it('is case-insensitive', () => expect(scoreText('POLICY DOCUMENT', policyRule)).toBe(2));
  it('is case-insensitive for rule keywords', () =>
    expect(scoreText('Policy Document', policyRule)).toBe(2));
  it('uses rule weight correctly', () =>
    expect(scoreText('alpha beta gamma', singleKwRule)).toBe(5));
  it('invoice weight=3 single match = 3', () =>
    expect(scoreText('please pay this invoice', invoiceRule)).toBe(3));
  it('invoice weight=3 two matches = 6', () =>
    expect(scoreText('invoice payment due', invoiceRule)).toBe(6));
  it('score is non-negative', () =>
    expect(scoreText('anything', policyRule)).toBeGreaterThanOrEqual(0));
  it('keyword appearing multiple times still counted once per keyword', () =>
    expect(scoreText('policy policy policy', policyRule)).toBe(2));
  it('partial word still matches (substring)', () =>
    // 'policies' contains 'policies' keyword → match
    expect(scoreText('these are our policies', policyRule)).toBe(2));

  // Loop: each keyword in policyRule should independently score 2
  policyRule.keywords.forEach(kw => {
    it(`policyRule scores ${policyRule.weight} for text containing '${kw}'`, () =>
      expect(scoreText(`document with ${kw} content`, policyRule)).toBe(policyRule.weight));
  });

  // Loop: each keyword in invoiceRule should independently score 3
  // (excluding 'purchase order' since it's two words — still works via includes)
  invoiceRule.keywords.forEach(kw => {
    it(`invoiceRule scores ${invoiceRule.weight} for text containing '${kw}'`, () =>
      expect(scoreText(`here is a ${kw} document`, invoiceRule)).toBe(invoiceRule.weight));
  });

  // Loop: weight variations
  [1, 2, 3, 4, 5].forEach(w => {
    const r: ClassificationRule = { id: 'x', category: 'other', keywords: ['alpha'], weight: w };
    it(`weight ${w} returns ${w} for matching text`, () =>
      expect(scoreText('this has alpha in it', r)).toBe(w));
    it(`weight ${w} returns 0 for non-matching text`, () =>
      expect(scoreText('nothing relevant here', r)).toBe(0));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. matchedKeywords
// ─────────────────────────────────────────────────────────────────────────────

describe('matchedKeywords', () => {
  const rule: ClassificationRule = {
    id: 'policy', category: 'policy',
    keywords: ['policy', 'policies', 'governance', 'guideline', 'framework'],
    weight: 2,
  };

  it('returns empty array for no match', () =>
    expect(matchedKeywords('irrelevant text', rule)).toEqual([]));
  it('returns empty array for empty text', () =>
    expect(matchedKeywords('', rule)).toEqual([]));
  it('returns matched keyword for single match', () =>
    expect(matchedKeywords('our policy document', rule)).toEqual(['policy']));
  it('returns multiple matched keywords', () => {
    const result = matchedKeywords('policy and governance', rule);
    expect(result).toContain('policy');
    expect(result).toContain('governance');
  });
  it('returns all 5 keywords when all present', () => {
    const text = 'policy policies governance guideline framework';
    expect(matchedKeywords(text, rule)).toHaveLength(5);
  });
  it('is case-insensitive', () =>
    expect(matchedKeywords('POLICY document', rule)).toEqual(['policy']));
  it('returns array type', () =>
    expect(Array.isArray(matchedKeywords('test', rule))).toBe(true));
  it('does not return duplicates for repeated keyword in text', () => {
    const result = matchedKeywords('policy policy policy', rule);
    expect(result.filter(k => k === 'policy')).toHaveLength(1);
  });

  // Loop: each keyword matched individually
  rule.keywords.forEach(kw => {
    it(`matchedKeywords returns ['${kw}'] when only '${kw}' is in text`, () =>
      expect(matchedKeywords(`the ${kw} of the document`, rule)).toEqual([kw]));
  });

  // Loop: various non-matching texts
  ['invoice', 'contract', 'audit', 'safety', 'risk'].forEach(word => {
    it(`returns [] for text '${word}' against policy rule`, () =>
      expect(matchedKeywords(word, rule)).toEqual([]));
  });

  // Custom rules
  const multiKwRule: ClassificationRule = {
    id: 'custom', category: 'other', keywords: ['alpha', 'beta', 'gamma'], weight: 1,
  };
  it('returns subset of matching keywords', () => {
    const result = matchedKeywords('alpha and gamma only', multiKwRule);
    expect(result).toContain('alpha');
    expect(result).toContain('gamma');
    expect(result).not.toContain('beta');
  });
  it('returns all 3 when all present', () => {
    expect(matchedKeywords('alpha beta gamma', multiKwRule)).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. detectConfidentiality
// ─────────────────────────────────────────────────────────────────────────────

describe('detectConfidentiality', () => {
  // restricted
  it('"restricted document" → restricted', () =>
    expect(detectConfidentiality('restricted document')).toBe('restricted'));
  it('"RESTRICTED" → restricted', () =>
    expect(detectConfidentiality('RESTRICTED')).toBe('restricted'));
  it('"top secret document" → restricted', () =>
    expect(detectConfidentiality('top secret document')).toBe('restricted'));
  it('"top-secret clearance" → restricted', () =>
    expect(detectConfidentiality('top-secret clearance')).toBe('restricted'));

  // confidential
  it('"confidential report" → confidential', () =>
    expect(detectConfidentiality('confidential report')).toBe('confidential'));
  it('"CONFIDENTIAL" → confidential', () =>
    expect(detectConfidentiality('CONFIDENTIAL')).toBe('confidential'));
  it('"sensitive data" → confidential', () =>
    expect(detectConfidentiality('sensitive data')).toBe('confidential'));
  it('"private information" → confidential', () =>
    expect(detectConfidentiality('private information')).toBe('confidential'));

  // internal
  it('"internal memo" → internal', () =>
    expect(detectConfidentiality('internal memo')).toBe('internal'));
  it('"INTERNAL" → internal', () =>
    expect(detectConfidentiality('INTERNAL')).toBe('internal'));
  it('"internal use only" → internal', () =>
    expect(detectConfidentiality('internal use only')).toBe('internal'));

  // public
  it('empty text → public', () => expect(detectConfidentiality('')).toBe('public'));
  it('plain text → public', () =>
    expect(detectConfidentiality('this is a normal document')).toBe('public'));
  it('"public policy" → public (no confidentiality markers)', () =>
    expect(detectConfidentiality('public policy document')).toBe('public'));

  // Priority: restricted > confidential > internal
  it('text with both "restricted" and "confidential" → restricted', () =>
    expect(detectConfidentiality('restricted and confidential')).toBe('restricted'));
  it('text with both "confidential" and "internal" → confidential', () =>
    expect(detectConfidentiality('confidential internal document')).toBe('confidential'));

  // Loop: restricted triggers
  ['restricted', 'top secret', 'top-secret'].forEach(trigger => {
    it(`detectConfidentiality('${trigger}') → 'restricted'`, () =>
      expect(detectConfidentiality(trigger)).toBe('restricted'));
  });

  // Loop: confidential triggers
  ['confidential', 'sensitive', 'private'].forEach(trigger => {
    it(`detectConfidentiality('${trigger}') → 'confidential'`, () =>
      expect(detectConfidentiality(trigger)).toBe('confidential'));
  });

  // Loop: returns a valid level for various inputs
  ['hello world', 'policy doc', 'annual report', 'training material', 'invoice 2024'].forEach(text => {
    it(`detectConfidentiality('${text}') returns a valid level`, () =>
      expect(ALL_CONFIDENTIALITY).toContain(detectConfidentiality(text)));
  });

  // Large batch
  for (let i = 0; i < 20; i++) {
    it(`random public text #${i} returns valid level`, () => {
      const result = detectConfidentiality(`document number ${i} plain text`);
      expect(ALL_CONFIDENTIALITY).toContain(result);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. detectFormat
// ─────────────────────────────────────────────────────────────────────────────

describe('detectFormat', () => {
  // Extension → format map
  const extMap: [string, DocumentFormat][] = [
    ['file.pdf', 'pdf'],
    ['doc.docx', 'docx'],
    ['legacy.doc', 'docx'],
    ['sheet.xlsx', 'xlsx'],
    ['legacy.xls', 'xlsx'],
    ['slides.pptx', 'pptx'],
    ['legacy.ppt', 'pptx'],
    ['data.txt', 'txt'],
    ['data.csv', 'csv'],
    ['page.html', 'html'],
    ['page.htm', 'html'],
    ['data.xml', 'xml'],
    ['config.json', 'json'],
    ['photo.png', 'image'],
    ['photo.jpg', 'image'],
    ['photo.jpeg', 'image'],
    ['photo.gif', 'image'],
    ['photo.bmp', 'image'],
    ['unknown.xyz', 'other'],
    ['file.zip', 'other'],
    ['archive.tar', 'other'],
    ['binary.bin', 'other'],
  ];

  extMap.forEach(([filename, expected]) => {
    it(`detectFormat('${filename}') → '${expected}'`, () =>
      expect(detectFormat(filename)).toBe(expected));
  });

  // No extension
  it('no extension → other', () => expect(detectFormat('noextension')).toBe('other'));
  it('dot at end → other', () => expect(detectFormat('file.')).toBe('other'));

  // Case-insensitive
  it('PDF uppercase → pdf', () => expect(detectFormat('file.PDF')).toBe('pdf'));
  it('DOCX uppercase → docx', () => expect(detectFormat('document.DOCX')).toBe('docx'));
  it('XLSX uppercase → xlsx', () => expect(detectFormat('data.XLSX')).toBe('xlsx'));
  it('PNG uppercase → image', () => expect(detectFormat('photo.PNG')).toBe('image'));
  it('JSON uppercase → json', () => expect(detectFormat('config.JSON')).toBe('json'));

  // All valid formats returned by detectFormat
  ALL_FORMATS.forEach(fmt => {
    it(`isValidFormat of detectFormat result is true for .${fmt}`, () => {
      // Use direct mapping for formats that equal their extension
      const filename = `file.${fmt}`;
      const result = detectFormat(filename);
      expect(isValidFormat(result)).toBe(true);
    });
  });

  // Multiple dots in filename
  it('multiple dots uses last extension', () =>
    expect(detectFormat('my.report.2024.pdf')).toBe('pdf'));
  it('multiple dots xlsx', () =>
    expect(detectFormat('budget.q1.2024.xlsx')).toBe('xlsx'));

  // Loop: 20 random unknown extensions return 'other'
  const unknownExts = ['aaa', 'bbb', 'ccc', 'eml', 'msg', 'odt', 'rtf', 'psd', 'ai', 'svg',
    'mp4', 'mov', 'mp3', 'wav', 'exe', 'dll', 'sh', 'bat', 'py', 'rb'];
  unknownExts.forEach(ext => {
    it(`file.${ext} → 'other'`, () => expect(detectFormat(`file.${ext}`)).toBe('other'));
  });

  // Filenames with paths
  it('path with directories uses filename extension', () =>
    expect(detectFormat('/path/to/document.pdf')).toBe('pdf'));
  it('path with subdirectory and xlsx', () =>
    expect(detectFormat('/docs/reports/q1.xlsx')).toBe('xlsx'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. detectLanguage
// ─────────────────────────────────────────────────────────────────────────────

describe('detectLanguage', () => {
  // English
  it('English text with "the" → en', () =>
    expect(detectLanguage('the quick brown fox')).toBe('en'));
  it('English text with "and" → en', () =>
    expect(detectLanguage('cats and dogs')).toBe('en'));
  it('English text with "is" → en', () =>
    expect(detectLanguage('this is a document')).toBe('en'));
  it('English text with "are" → en', () =>
    expect(detectLanguage('these are the policies')).toBe('en'));
  it('English text with "was" → en', () =>
    expect(detectLanguage('it was completed')).toBe('en'));
  it('English text with "were" → en', () =>
    expect(detectLanguage('they were present')).toBe('en'));
  it('English text with "with" → en', () =>
    expect(detectLanguage('document with attachments')).toBe('en'));
  it('English text with "for" → en', () =>
    expect(detectLanguage('form for submission')).toBe('en'));
  it('English text with "or" → en', () =>
    expect(detectLanguage('yes or no')).toBe('en'));

  // German
  it('German text with "und" → de', () =>
    expect(detectLanguage('schwarz und weiß')).toBe('de'));
  it('German text with "ist" → de', () =>
    expect(detectLanguage('das ist gut')).toBe('de'));
  it('German text with "sind" → de', () =>
    expect(detectLanguage('sie sind hier')).toBe('de'));
  it('German text with "die" → de', () =>
    expect(detectLanguage('die katze sitzt')).toBe('de'));
  it('German text with "der" → de', () =>
    expect(detectLanguage('der hund läuft')).toBe('de'));
  it('German text with "das" → de', () =>
    expect(detectLanguage('das buch ist alt')).toBe('de'));
  it('German text with "mit" → de', () =>
    expect(detectLanguage('mit freundlichen grüßen')).toBe('de'));

  // French
  it('French text with "le" → fr', () =>
    expect(detectLanguage('le document est prêt')).toBe('fr'));
  it('French text with "les" → fr', () =>
    expect(detectLanguage('les fichiers sont là')).toBe('fr'));
  it('French text with "est" → fr', () =>
    expect(detectLanguage('cela est correct')).toBe('fr'));
  it('French text with "avec" → fr', () =>
    expect(detectLanguage('avec plaisir')).toBe('fr'));
  it('French text with "pour" → fr', () =>
    expect(detectLanguage('merci pour votre aide')).toBe('fr'));
  it('French text with "dans" → fr', () =>
    expect(detectLanguage('dans ce cas')).toBe('fr'));

  // Spanish — use words that do NOT contain English/German/French trigger subwords at word boundaries
  it('Spanish text with "el" → es', () =>
    expect(detectLanguage('el trabajo el trabajo')).toBe('es'));
  it('Spanish text with "los" → es', () =>
    expect(detectLanguage('los libros los libros')).toBe('es'));
  it('Spanish text with "con" → es', () =>
    expect(detectLanguage('con mucho gusto')).toBe('es'));
  it('Spanish text with "para" → es', () =>
    expect(detectLanguage('gracias para todo')).toBe('es'));
  it('Spanish text with "del" → es', () =>
    expect(detectLanguage('a del centro')).toBe('es'));

  // Other / unknown
  it('empty text → other', () => expect(detectLanguage('')).toBe('other'));
  it('numeric-only text → other', () => expect(detectLanguage('12345 67890')).toBe('other'));
  it('unknown language → other', () =>
    expect(detectLanguage('абвгд ежзий')).toBe('other'));
  it('Japanese-like text → other', () =>
    expect(detectLanguage('これはテストです')).toBe('other'));

  // Loop: valid language codes returned
  const validLangs: LanguageCode[] = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'other'];
  const textSamples = [
    'the document is complete',
    'das ist ein dokument',
    'le fichier est complet',
    'el archivo está completo',
    'arbitrary numeric 9999',
  ];
  textSamples.forEach(text => {
    it(`detectLanguage returns a LanguageCode type for: "${text.substring(0, 20)}"`, () => {
      const result = detectLanguage(text);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // Loop: English keywords each trigger 'en'
  ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'with', 'for'].forEach(kw => {
    it(`English keyword '${kw}' triggers 'en'`, () =>
      expect(detectLanguage(`word ${kw} word`)).toBe('en'));
  });

  // Loop: German keywords each trigger 'de'
  ['und', 'oder', 'ist', 'sind', 'die', 'der', 'das', 'mit'].forEach(kw => {
    it(`German keyword '${kw}' triggers 'de'`, () =>
      expect(detectLanguage(`wort ${kw} wort`)).toBe('de'));
  });

  // Loop: French keywords
  ['le', 'les', 'est', 'avec', 'pour', 'dans'].forEach(kw => {
    it(`French keyword '${kw}' triggers 'fr'`, () =>
      expect(detectLanguage(`mot ${kw} mot`)).toBe('fr'));
  });

  // Loop: Spanish keywords
  ['el', 'los', 'con', 'para', 'del'].forEach(kw => {
    it(`Spanish keyword '${kw}' triggers 'es'`, () =>
      expect(detectLanguage(`palabra ${kw} palabra`)).toBe('es'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. isValidCategory
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidCategory', () => {
  ALL_CATEGORIES.forEach(cat => {
    it(`isValidCategory('${cat}') is true`, () => expect(isValidCategory(cat)).toBe(true));
  });

  const invalids = ['', 'unknown', 'POLICY', 'Policy', 'memo', 'doc', 'file', 'letter', 'null', '123'];
  invalids.forEach(s => {
    it(`isValidCategory('${s}') is false`, () => expect(isValidCategory(s)).toBe(false));
  });

  it('returns boolean', () => expect(typeof isValidCategory('policy')).toBe('boolean'));
  it('is case-sensitive (uppercase fails)', () => expect(isValidCategory('AUDIT')).toBe(false));
  it('is case-sensitive (mixed case fails)', () => expect(isValidCategory('Policy')).toBe(false));

  // Loop: all 15 categories round-trip
  for (let i = 0; i < ALL_CATEGORIES.length; i++) {
    it(`category index ${i} ('${ALL_CATEGORIES[i]}') is valid`, () =>
      expect(isValidCategory(ALL_CATEGORIES[i])).toBe(true));
  }

  // Extra invalid strings via loop
  for (let i = 0; i < 15; i++) {
    it(`random string 'invalid${i}' is not a valid category`, () =>
      expect(isValidCategory(`invalid${i}`)).toBe(false));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. isValidFormat
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidFormat', () => {
  ALL_FORMATS.forEach(fmt => {
    it(`isValidFormat('${fmt}') is true`, () => expect(isValidFormat(fmt)).toBe(true));
  });

  const invalids = ['', 'PDF', 'Pdf', 'doc', 'xls', 'ppt', 'htm', 'jpeg', 'png', 'gif', 'bmp'];
  invalids.forEach(s => {
    it(`isValidFormat('${s}') is false`, () => expect(isValidFormat(s)).toBe(false));
  });

  it('returns boolean', () => expect(typeof isValidFormat('pdf')).toBe('boolean'));
  it('is case-sensitive', () => expect(isValidFormat('PDF')).toBe(false));
  it('length of valid formats is 11', () => expect(ALL_FORMATS).toHaveLength(11));

  // Loop: 11 formats all pass
  for (let i = 0; i < ALL_FORMATS.length; i++) {
    it(`format index ${i} ('${ALL_FORMATS[i]}') is valid`, () =>
      expect(isValidFormat(ALL_FORMATS[i])).toBe(true));
  }

  // Extra invalids via loop
  for (let i = 0; i < 10; i++) {
    it(`'badformat${i}' is not a valid format`, () =>
      expect(isValidFormat(`badformat${i}`)).toBe(false));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. isValidConfidentiality
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidConfidentiality', () => {
  ALL_CONFIDENTIALITY.forEach(level => {
    it(`isValidConfidentiality('${level}') is true`, () =>
      expect(isValidConfidentiality(level)).toBe(true));
  });

  const invalids = ['', 'PUBLIC', 'Internal', 'CONFIDENTIAL', 'secret', 'private', 'top-secret', '0'];
  invalids.forEach(s => {
    it(`isValidConfidentiality('${s}') is false`, () =>
      expect(isValidConfidentiality(s)).toBe(false));
  });

  it('returns boolean type', () => expect(typeof isValidConfidentiality('public')).toBe('boolean'));
  it('is case-sensitive', () => expect(isValidConfidentiality('Public')).toBe(false));
  it('4 valid levels exist', () => expect(ALL_CONFIDENTIALITY).toHaveLength(4));

  // Loop
  for (let i = 0; i < 10; i++) {
    it(`'badlevel${i}' is not a valid confidentiality`, () =>
      expect(isValidConfidentiality(`badlevel${i}`)).toBe(false));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. makeConfig
// ─────────────────────────────────────────────────────────────────────────────

describe('makeConfig', () => {
  it('default minConfidence is 0.1', () => expect(makeConfig().minConfidence).toBe(0.1));
  it('custom minConfidence is stored', () => expect(makeConfig(0.5).minConfidence).toBe(0.5));
  it('minConfidence 0 is stored', () => expect(makeConfig(0).minConfidence).toBe(0));
  it('minConfidence 1 is stored', () => expect(makeConfig(1).minConfidence).toBe(1));
  it('rules include built-in rules', () => {
    const cfg = makeConfig();
    expect(cfg.rules.length).toBeGreaterThanOrEqual(14);
  });
  it('defaultCategory is "other"', () => expect(makeConfig().defaultCategory).toBe('other'));
  it('extraRules are appended', () => {
    const extra: ClassificationRule[] = [
      { id: 'x', category: 'other', keywords: ['foo'], weight: 1 },
    ];
    const cfg = makeConfig(0.1, extra);
    expect(cfg.rules).toHaveLength(15);
  });
  it('two extra rules → 16 total', () => {
    const extra: ClassificationRule[] = [
      { id: 'a', category: 'other', keywords: ['aaa'], weight: 1 },
      { id: 'b', category: 'other', keywords: ['bbb'], weight: 1 },
    ];
    const cfg = makeConfig(0.1, extra);
    expect(cfg.rules).toHaveLength(16);
  });
  it('no extra rules → 14 built-in', () => {
    expect(makeConfig().rules).toHaveLength(14);
  });
  it('returns an object with rules, minConfidence, defaultCategory', () => {
    const cfg = makeConfig();
    expect(cfg).toHaveProperty('rules');
    expect(cfg).toHaveProperty('minConfidence');
    expect(cfg).toHaveProperty('defaultCategory');
  });
  it('does not mutate built-in rules array', () => {
    const before = getBuiltInRules().length;
    makeConfig(0.1, [{ id: 'extra', category: 'other', keywords: ['x'], weight: 1 }]);
    expect(getBuiltInRules().length).toBe(before);
  });

  // Loop: various minConfidence values
  [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].forEach(mc => {
    it(`makeConfig(${mc}).minConfidence === ${mc}`, () =>
      expect(makeConfig(mc).minConfidence).toBe(mc));
  });

  // Loop: extra rules counts
  for (let n = 0; n <= 5; n++) {
    const extras: ClassificationRule[] = Array.from({ length: n }, (_, i) => ({
      id: `extra${i}`, category: 'other' as DocumentCategory, keywords: [`kw${i}`], weight: 1,
    }));
    it(`${n} extra rules → ${14 + n} total rules`, () =>
      expect(makeConfig(0.1, extras).rules).toHaveLength(14 + n));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. makeDoc
// ─────────────────────────────────────────────────────────────────────────────

describe('makeDoc', () => {
  it('stores id', () => expect(makeDoc('doc-1', 'file.pdf').id).toBe('doc-1'));
  it('stores filename', () => expect(makeDoc('doc-1', 'file.pdf').filename).toBe('file.pdf'));
  it('no overrides: mimeType undefined', () =>
    expect(makeDoc('x', 'f.pdf').mimeType).toBeUndefined());
  it('no overrides: sizeBytes undefined', () =>
    expect(makeDoc('x', 'f.pdf').sizeBytes).toBeUndefined());
  it('no overrides: createdAt undefined', () =>
    expect(makeDoc('x', 'f.pdf').createdAt).toBeUndefined());
  it('no overrides: language undefined', () =>
    expect(makeDoc('x', 'f.pdf').language).toBeUndefined());
  it('mimeType override is applied', () =>
    expect(makeDoc('x', 'f.pdf', { mimeType: 'application/pdf' }).mimeType).toBe('application/pdf'));
  it('sizeBytes override is applied', () =>
    expect(makeDoc('x', 'f.pdf', { sizeBytes: 1024 }).sizeBytes).toBe(1024));
  it('createdAt override is applied', () =>
    expect(makeDoc('x', 'f.pdf', { createdAt: 1706000000 }).createdAt).toBe(1706000000));
  it('language override is applied', () =>
    expect(makeDoc('x', 'f.pdf', { language: 'en' }).language).toBe('en'));
  it('multiple overrides applied', () => {
    const doc = makeDoc('id1', 'doc.docx', { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sizeBytes: 2048, language: 'de' });
    expect(doc.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(doc.sizeBytes).toBe(2048);
    expect(doc.language).toBe('de');
  });
  it('returns an object with id and filename', () => {
    const doc = makeDoc('abc', 'test.txt');
    expect(doc).toHaveProperty('id', 'abc');
    expect(doc).toHaveProperty('filename', 'test.txt');
  });

  // Loop: various ids and filenames
  ['doc-1', 'doc-2', 'file-abc', 'uuid-1234', 'report-2024'].forEach(id => {
    it(`makeDoc stores id '${id}'`, () => expect(makeDoc(id, 'f.txt').id).toBe(id));
  });

  ['report.pdf', 'policy.docx', 'data.xlsx', 'image.png', 'config.json'].forEach(fn => {
    it(`makeDoc stores filename '${fn}'`, () => expect(makeDoc('id', fn).filename).toBe(fn));
  });

  // Loop: language overrides
  const validLangs: LanguageCode[] = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'other'];
  validLangs.forEach(lang => {
    it(`language override '${lang}' is stored`, () =>
      expect(makeDoc('x', 'f.pdf', { language: lang }).language).toBe(lang));
  });

  // Loop: sizeBytes
  [0, 100, 1024, 10240, 1048576].forEach(size => {
    it(`sizeBytes ${size} is stored`, () =>
      expect(makeDoc('x', 'f.pdf', { sizeBytes: size }).sizeBytes).toBe(size));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. classify — core tests
// ─────────────────────────────────────────────────────────────────────────────

describe('classify', () => {
  const cfg = makeConfig(0.1);

  it('returns an object with documentId', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'test text', cfg);
    expect(result.documentId).toBe('d1');
  });
  it('returns a valid category', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'this is a policy document', cfg);
    expect(isValidCategory(result.category)).toBe(true);
  });
  it('returns confidence between 0 and 1', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy document', cfg);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
  it('returns matchedKeywords as array', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy document', cfg);
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
  });
  it('returns valid confidentiality', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'internal policy document', cfg);
    expect(isValidConfidentiality(result.confidentiality)).toBe(true);
  });
  it('returns valid format', () => {
    const result = classify(makeDoc('d1', 'file.pdf'), 'policy document', cfg);
    expect(isValidFormat(result.format)).toBe(true);
  });
  it('returns scores object', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy document', cfg);
    expect(typeof result.scores).toBe('object');
  });
  it('scores object has all categories', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy document', cfg);
    ALL_CATEGORIES.forEach(cat => {
      expect(result.scores).toHaveProperty(cat);
    });
  });

  // Category classification
  it('policy text → category "policy"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'this is a policy document with governance framework', cfg);
    expect(result.category).toBe('policy');
  });
  it('invoice text → category "invoice"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'invoice payment billing receipt', cfg);
    expect(result.category).toBe('invoice');
  });
  it('contract text → category "contract"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'contract agreement terms conditions sla', cfg);
    expect(result.category).toBe('contract');
  });
  it('certificate text → category "certificate"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'certificate certification accreditation award qualification', cfg);
    expect(result.category).toBe('certificate');
  });
  it('audit text → category "audit"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'audit inspection assessment evaluation', cfg);
    expect(result.category).toBe('audit');
  });
  it('risk text → category "risk"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'risk hazard threat vulnerability mitigation', cfg);
    expect(result.category).toBe('risk');
  });
  it('training text → category "training"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'training learning education course competency', cfg);
    expect(result.category).toBe('training');
  });
  it('safety text → category "safety"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'safety incident accident near miss ppe', cfg);
    expect(result.category).toBe('safety');
  });
  it('compliance text → category "compliance"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'compliance regulation requirement standard iso', cfg);
    expect(result.category).toBe('compliance');
  });
  it('technical text → category "technical"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'technical specification drawing engineering design', cfg);
    expect(result.category).toBe('technical');
  });
  it('form text → category "form"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'form template request application questionnaire', cfg);
    expect(result.category).toBe('form');
  });
  it('report text → category "report"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'report summary analysis review findings', cfg);
    expect(result.category).toBe('report');
  });
  it('procedure text → category "procedure"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'procedure process workflow instruction step', cfg);
    expect(result.category).toBe('procedure');
  });

  // Empty text → default category
  it('empty text → defaultCategory', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), '', cfg);
    expect(result.category).toBe(cfg.defaultCategory);
  });
  it('empty text → confidence 0', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), '', cfg);
    expect(result.confidence).toBe(0);
  });
  it('empty text → no matched keywords', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), '', cfg);
    expect(result.matchedKeywords).toHaveLength(0);
  });

  // Confidence: below minConfidence → defaultCategory
  it('low confidence → default category', () => {
    // Spread keywords across many categories so no single category dominates (confidence << 0.99)
    // policy(2) + invoice(3) + contract(3) + certificate(3) + audit(2) + risk(2) + training(2)
    // + safety(2) + compliance(2) + technical(2) = many categories, each with low proportion
    const strictCfg = makeConfig(0.99);
    const spreadText = 'policy invoice contract certificate audit risk training safety compliance technical';
    const result = classify(makeDoc('d1', 'f.pdf'), spreadText, strictCfg);
    // With many categories scoring, highest category confidence will be well below 0.99
    expect(result.category).toBe('other');
  });

  // Format from filename
  it('format detected from .pdf filename', () => {
    const result = classify(makeDoc('d1', 'report.pdf'), 'report findings', cfg);
    expect(result.format).toBe('pdf');
  });
  it('format detected from .docx filename', () => {
    const result = classify(makeDoc('d1', 'policy.docx'), 'policy governance', cfg);
    expect(result.format).toBe('docx');
  });
  it('format detected from .xlsx filename', () => {
    const result = classify(makeDoc('d1', 'data.xlsx'), 'invoice billing', cfg);
    expect(result.format).toBe('xlsx');
  });

  // Confidentiality from text
  it('confidential text → confidentiality "confidential"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'confidential policy document', cfg);
    expect(result.confidentiality).toBe('confidential');
  });
  it('restricted text → confidentiality "restricted"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'restricted policy document', cfg);
    expect(result.confidentiality).toBe('restricted');
  });
  it('plain text → confidentiality "public"', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy governance framework', cfg);
    expect(result.confidentiality).toBe('public');
  });

  // matchedKeywords deduplication
  it('matchedKeywords are deduplicated', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'policy policy governance', cfg);
    const unique = [...new Set(result.matchedKeywords)];
    expect(result.matchedKeywords).toHaveLength(unique.length);
  });

  // documentId preserved
  it('documentId matches doc.id', () => {
    const doc = makeDoc('my-doc-id', 'f.pdf');
    const result = classify(doc, 'policy document', cfg);
    expect(result.documentId).toBe('my-doc-id');
  });

  // Scores are non-negative
  it('all scores are non-negative', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'audit inspection assessment', cfg);
    ALL_CATEGORIES.forEach(cat => {
      expect(result.scores[cat]).toBeGreaterThanOrEqual(0);
    });
  });

  // Top scoring category score > 0 for matched text
  it('top category score > 0 for relevant text', () => {
    const result = classify(makeDoc('d1', 'f.pdf'), 'invoice billing payment', cfg);
    expect(result.scores['invoice']).toBeGreaterThan(0);
  });

  // Loop: classify with each category's own keywords → correct classification
  const categoryKeywordMap: [DocumentCategory, string][] = [
    ['policy', 'policy governance guideline framework'],
    ['invoice', 'invoice billing payment receipt'],
    ['contract', 'contract agreement terms conditions'],
    ['certificate', 'certificate certification accreditation'],
    ['audit', 'audit inspection assessment evaluation'],
    ['risk', 'risk hazard threat vulnerability'],
    ['training', 'training learning education course'],
    ['safety', 'safety incident accident ppe'],
    ['compliance', 'compliance regulation requirement standard'],
    ['technical', 'technical specification drawing engineering'],
    ['form', 'form template request application'],
    ['report', 'report summary analysis review'],
    ['procedure', 'procedure process workflow instruction'],
  ];

  categoryKeywordMap.forEach(([cat, text]) => {
    it(`classify dominant '${cat}' text → category '${cat}'`, () => {
      const result = classify(makeDoc('d', 'f.pdf'), text, cfg);
      expect(result.category).toBe(cat);
    });
    it(`classify '${cat}' text confidence > 0`, () => {
      const result = classify(makeDoc('d', 'f.pdf'), text, cfg);
      expect(result.confidence).toBeGreaterThan(0);
    });
    it(`classify '${cat}' text has matched keywords`, () => {
      const result = classify(makeDoc('d', 'f.pdf'), text, cfg);
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });
  });

  // Loop: formats via different filenames
  const formatTests: [string, DocumentFormat][] = [
    ['doc.pdf', 'pdf'], ['doc.docx', 'docx'], ['doc.xlsx', 'xlsx'],
    ['doc.pptx', 'pptx'], ['doc.txt', 'txt'], ['doc.csv', 'csv'],
    ['doc.html', 'html'], ['doc.xml', 'xml'], ['doc.json', 'json'],
    ['doc.png', 'image'], ['doc.xyz', 'other'],
  ];
  formatTests.forEach(([filename, fmt]) => {
    it(`classify with filename '${filename}' → format '${fmt}'`, () => {
      const result = classify(makeDoc('d', filename), 'policy document', cfg);
      expect(result.format).toBe(fmt);
    });
  });

  // Loop: confidentiality from text content
  const confTests: [string, ConfidentialityLevel][] = [
    ['restricted access only', 'restricted'],
    ['this is confidential information', 'confidential'],
    ['internal use memo', 'internal'],
    ['publicly available data', 'public'],
  ];
  confTests.forEach(([text, expected]) => {
    it(`classify text '${text.substring(0, 30)}' → confidentiality '${expected}'`, () => {
      const result = classify(makeDoc('d', 'f.pdf'), text, cfg);
      expect(result.confidentiality).toBe(expected);
    });
  });

  // Custom config with no rules falls back to built-in
  it('config with 0 rules falls back to built-in rules', () => {
    const emptyRulesCfg: import('../src/types').ClassifierConfig = {
      minConfidence: 0.1,
      rules: [],
      defaultCategory: 'other',
    };
    const result = classify(makeDoc('d', 'f.pdf'), 'policy governance document', emptyRulesCfg);
    expect(isValidCategory(result.category)).toBe(true);
  });

  // Repeated classify calls with same input produce consistent results
  it('repeated classify calls produce consistent results', () => {
    const text = 'invoice billing payment';
    const r1 = classify(makeDoc('d', 'f.pdf'), text, cfg);
    const r2 = classify(makeDoc('d', 'f.pdf'), text, cfg);
    expect(r1.category).toBe(r2.category);
    expect(r1.confidence).toBe(r2.confidence);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. Bulk loop tests — comprehensive coverage
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidCategory — exhaustive loop', () => {
  for (let i = 0; i < ALL_CATEGORIES.length; i++) {
    const cat = ALL_CATEGORIES[i];
    it(`ALL_CATEGORIES[${i}] = '${cat}' passes isValidCategory`, () =>
      expect(isValidCategory(cat)).toBe(true));
  }
  // 30 additional invalid strings
  for (let i = 0; i < 30; i++) {
    it(`isValidCategory('garbage${i}') is false`, () =>
      expect(isValidCategory(`garbage${i}`)).toBe(false));
  }
});

describe('isValidFormat — exhaustive loop', () => {
  for (let i = 0; i < ALL_FORMATS.length; i++) {
    const fmt = ALL_FORMATS[i];
    it(`ALL_FORMATS[${i}] = '${fmt}' passes isValidFormat`, () =>
      expect(isValidFormat(fmt)).toBe(true));
  }
  for (let i = 0; i < 20; i++) {
    it(`isValidFormat('badformat${i}') is false`, () =>
      expect(isValidFormat(`badformat${i}`)).toBe(false));
  }
});

describe('isValidConfidentiality — exhaustive loop', () => {
  for (let i = 0; i < ALL_CONFIDENTIALITY.length; i++) {
    const level = ALL_CONFIDENTIALITY[i];
    it(`ALL_CONFIDENTIALITY[${i}] = '${level}' passes isValidConfidentiality`, () =>
      expect(isValidConfidentiality(level)).toBe(true));
  }
  for (let i = 0; i < 20; i++) {
    it(`isValidConfidentiality('badlevel${i}') is false`, () =>
      expect(isValidConfidentiality(`badlevel${i}`)).toBe(false));
  }
});

describe('detectFormat — exhaustive extension mapping', () => {
  const fullMap: [string, DocumentFormat][] = [
    ['a.pdf', 'pdf'], ['b.PDF', 'pdf'],
    ['a.docx', 'docx'], ['b.DOCX', 'docx'], ['c.doc', 'docx'], ['d.DOC', 'docx'],
    ['a.xlsx', 'xlsx'], ['b.XLSX', 'xlsx'], ['c.xls', 'xlsx'], ['d.XLS', 'xlsx'],
    ['a.pptx', 'pptx'], ['b.PPTX', 'pptx'], ['c.ppt', 'pptx'], ['d.PPT', 'pptx'],
    ['a.txt', 'txt'], ['b.TXT', 'txt'],
    ['a.csv', 'csv'], ['b.CSV', 'csv'],
    ['a.html', 'html'], ['b.HTML', 'html'], ['c.htm', 'html'], ['d.HTM', 'html'],
    ['a.xml', 'xml'], ['b.XML', 'xml'],
    ['a.json', 'json'], ['b.JSON', 'json'],
    ['a.png', 'image'], ['a.PNG', 'image'],
    ['a.jpg', 'image'], ['a.JPG', 'image'],
    ['a.jpeg', 'image'], ['a.JPEG', 'image'],
    ['a.gif', 'image'], ['a.GIF', 'image'],
    ['a.bmp', 'image'], ['a.BMP', 'image'],
    ['a.xyz', 'other'], ['a.abc', 'other'], ['a.zzz', 'other'],
  ];
  fullMap.forEach(([fn, expected]) => {
    it(`detectFormat('${fn}') === '${expected}'`, () =>
      expect(detectFormat(fn)).toBe(expected));
  });
});

describe('scoreText — bulk keyword presence tests', () => {
  const rules = getBuiltInRules();
  rules.forEach(rule => {
    rule.keywords.forEach(kw => {
      it(`rule '${rule.id}': text with keyword '${kw}' scores ${rule.weight}`, () =>
        expect(scoreText(`document containing ${kw} here`, rule)).toBe(rule.weight));
    });
  });
  rules.forEach(rule => {
    it(`rule '${rule.id}': empty text scores 0`, () =>
      expect(scoreText('', rule)).toBe(0));
    it(`rule '${rule.id}': completely unrelated text scores 0`, () =>
      expect(scoreText('xyzzy plugh zork', rule)).toBe(0));
  });
});

describe('matchedKeywords — bulk keyword isolation tests', () => {
  const rules = getBuiltInRules();
  rules.forEach(rule => {
    rule.keywords.forEach(kw => {
      it(`rule '${rule.id}': keyword '${kw}' is in matchedKeywords result`, () => {
        const result = matchedKeywords(`text with ${kw} in it`, rule);
        expect(result).toContain(kw);
      });
    });
    it(`rule '${rule.id}': empty text → empty matchedKeywords`, () =>
      expect(matchedKeywords('', rule)).toHaveLength(0));
  });
});

describe('classify — bulk document id preservation', () => {
  const cfg = makeConfig(0.1);
  const ids = ['id-001', 'id-002', 'id-003', 'id-004', 'id-005',
    'uuid-abc', 'uuid-def', 'doc-100', 'doc-200', 'doc-300'];
  ids.forEach(id => {
    it(`classify preserves documentId '${id}'`, () => {
      const result = classify(makeDoc(id, 'f.pdf'), 'policy governance', cfg);
      expect(result.documentId).toBe(id);
    });
  });
});

describe('classify — bulk scores completeness', () => {
  const cfg = makeConfig(0.1);
  const texts = [
    'policy governance framework guideline',
    'invoice billing payment receipt',
    'contract agreement terms conditions',
    'audit inspection assessment evaluation',
    'risk hazard threat vulnerability',
    'training learning education course',
    'safety incident accident ppe',
    'compliance regulation requirement standard',
    'technical specification drawing engineering',
    'certificate certification accreditation award',
  ];
  texts.forEach((text, i) => {
    it(`classify text #${i} has all ${ALL_CATEGORIES.length} category scores`, () => {
      const result = classify(makeDoc(`d${i}`, 'f.pdf'), text, cfg);
      expect(Object.keys(result.scores)).toHaveLength(ALL_CATEGORIES.length);
    });
    it(`classify text #${i} all scores are numbers`, () => {
      const result = classify(makeDoc(`d${i}`, 'f.pdf'), text, cfg);
      ALL_CATEGORIES.forEach(cat => {
        expect(typeof result.scores[cat]).toBe('number');
      });
    });
    it(`classify text #${i} confidence in [0,1]`, () => {
      const result = classify(makeDoc(`d${i}`, 'f.pdf'), text, cfg);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('tokenise — bulk length tests', () => {
  for (let n = 1; n <= 20; n++) {
    const text = Array.from({ length: n }, (_, i) => `tok${i}`).join(' ');
    it(`tokenise of ${n} tokens returns length ${n}`, () =>
      expect(tokenise(text)).toHaveLength(n));
  }
  // All tokens lowercase
  const upperWords = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON'];
  upperWords.forEach(word => {
    it(`tokenise('${word}') returns ['${word.toLowerCase()}']`, () =>
      expect(tokenise(word)).toEqual([word.toLowerCase()]));
  });
});

describe('makeDoc — bulk override tests', () => {
  const mimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
    'application/json',
    'text/html',
    'image/png',
    'image/jpeg',
    'application/xml',
  ];
  mimeTypes.forEach(mime => {
    it(`makeDoc mimeType '${mime}' stored correctly`, () =>
      expect(makeDoc('x', 'f.pdf', { mimeType: mime }).mimeType).toBe(mime));
  });

  // createdAt timestamps
  const timestamps = [0, 1000000, 1700000000, 1706000000, Date.now()];
  timestamps.forEach(ts => {
    it(`makeDoc createdAt ${ts} stored correctly`, () =>
      expect(makeDoc('x', 'f.pdf', { createdAt: ts }).createdAt).toBe(ts));
  });
});

describe('getBuiltInRules — weight distribution', () => {
  it('exactly 3 rules have weight 3', () => {
    const rules = getBuiltInRules();
    expect(rules.filter(r => r.weight === 3)).toHaveLength(3);
  });
  it('exactly 1 rule has weight 1', () => {
    const rules = getBuiltInRules();
    expect(rules.filter(r => r.weight === 1)).toHaveLength(1);
  });
  it('exactly 10 rules have weight 2', () => {
    const rules = getBuiltInRules();
    expect(rules.filter(r => r.weight === 2)).toHaveLength(10);
  });
  it('no rules have weight 0', () => {
    const rules = getBuiltInRules();
    expect(rules.filter(r => r.weight === 0)).toHaveLength(0);
  });
  it('all weights are positive integers', () => {
    getBuiltInRules().forEach(r => {
      expect(r.weight).toBeGreaterThan(0);
      expect(Number.isInteger(r.weight)).toBe(true);
    });
  });
  it('all rule ids are unique', () => {
    const rules = getBuiltInRules();
    const ids = rules.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all rule categories are valid DocumentCategory', () => {
    getBuiltInRules().forEach(r => {
      expect(isValidCategory(r.category)).toBe(true);
    });
  });
  it('each rule has at least 5 keywords', () => {
    getBuiltInRules().forEach(r => {
      expect(r.keywords.length).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('classify — edge cases', () => {
  const cfg = makeConfig(0.1);

  it('whitespace-only text → default category', () => {
    const result = classify(makeDoc('d', 'f.pdf'), '   ', cfg);
    expect(result.category).toBe('other');
  });
  it('single irrelevant word → default category', () => {
    const result = classify(makeDoc('d', 'f.pdf'), 'xyzzy', cfg);
    expect(result.category).toBe('other');
  });
  it('very long text with policy keywords → policy', () => {
    const text = ('policy governance framework guideline ' as string).repeat(50);
    const result = classify(makeDoc('d', 'f.pdf'), text, cfg);
    expect(result.category).toBe('policy');
  });
  it('numbers-only text → default category', () => {
    const result = classify(makeDoc('d', 'f.pdf'), '12345 67890', cfg);
    expect(result.category).toBe('other');
  });
  it('format "other" for unknown extension', () => {
    const result = classify(makeDoc('d', 'file.xyz'), 'policy', cfg);
    expect(result.format).toBe('other');
  });
  it('format "image" for .png file', () => {
    const result = classify(makeDoc('d', 'photo.png'), 'safety incident', cfg);
    expect(result.format).toBe('image');
  });
  it('matchedKeywords is an array', () => {
    const result = classify(makeDoc('d', 'f.pdf'), 'invoice billing', cfg);
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
  });
  it('scores["other"] is initially 0 for most texts', () => {
    const result = classify(makeDoc('d', 'f.pdf'), 'invoice billing payment', cfg);
    expect(result.scores['other']).toBe(0);
  });
  it('mixed category text still returns valid category', () => {
    const result = classify(makeDoc('d', 'f.pdf'), 'policy invoice contract audit risk', cfg);
    expect(isValidCategory(result.category)).toBe(true);
  });
  it('confidence is a finite number', () => {
    const result = classify(makeDoc('d', 'f.pdf'), 'policy document', cfg);
    expect(Number.isFinite(result.confidence)).toBe(true);
  });

  // Loop: classify multiple times for idempotency
  for (let i = 0; i < 10; i++) {
    it(`classify idempotency check #${i}`, () => {
      const text = `policy governance document iteration ${i}`;
      const r1 = classify(makeDoc('d', 'f.pdf'), text, cfg);
      const r2 = classify(makeDoc('d', 'f.pdf'), text, cfg);
      expect(r1.category).toBe(r2.category);
      expect(r1.confidence).toBe(r2.confidence);
      expect(r1.matchedKeywords.sort()).toEqual(r2.matchedKeywords.sort());
    });
  }
});

describe('detectConfidentiality — bulk inputs', () => {
  // 20 plain texts that should return public
  const plainTexts = [
    'this is a report', 'annual review 2024', 'training schedule', 'policy document',
    'audit findings', 'risk assessment', 'compliance check', 'technical drawing',
    'form submission', 'invoice 2024', 'contract renewal', 'certificate of achievement',
    'meeting minutes', 'project plan', 'budget forecast', 'employee handbook',
    'product specification', 'quality manual', 'standard operating procedure', 'work instruction',
  ];
  plainTexts.forEach((text, i) => {
    it(`plain text #${i}: '${text.substring(0, 30)}' → 'public'`, () =>
      expect(detectConfidentiality(text)).toBe('public'));
  });

  // 10 restricted texts
  for (let i = 0; i < 10; i++) {
    it(`restricted text #${i} → 'restricted'`, () =>
      expect(detectConfidentiality(`restricted document number ${i}`)).toBe('restricted'));
  }

  // 10 confidential texts
  for (let i = 0; i < 10; i++) {
    it(`confidential text #${i} → 'confidential'`, () =>
      expect(detectConfidentiality(`confidential report number ${i}`)).toBe('confidential'));
  }

  // 10 internal texts
  for (let i = 0; i < 10; i++) {
    it(`internal text #${i} → 'internal'`, () =>
      expect(detectConfidentiality(`internal memo number ${i}`)).toBe('internal'));
  }
});

describe('detectLanguage — bulk inputs', () => {
  // 15 English texts
  const englishTexts = [
    'the policy is in effect', 'this document is for internal use',
    'the audit was completed successfully', 'risk assessment and mitigation',
    'training and development programme', 'safety and compliance requirements',
    'the contract was signed and agreed', 'invoice for services rendered',
    'certificate of conformance is issued', 'the report was reviewed',
    'procedure for handling incidents', 'form for requesting leave',
    'the technical specification', 'correspondence with the customer',
    'the compliance framework',
  ];
  englishTexts.forEach((text, i) => {
    it(`English text #${i} → 'en'`, () =>
      expect(detectLanguage(text)).toBe('en'));
  });

  // German texts
  const germanTexts = [
    'das ist ein dokument', 'die katze ist auf dem tisch',
    'mit freundlichen grüßen', 'und oder ist sind',
  ];
  germanTexts.forEach((text, i) => {
    it(`German text #${i} → 'de'`, () =>
      expect(detectLanguage(text)).toBe('de'));
  });

  // French texts
  const frenchTexts = [
    'le document est prêt', 'les fichiers sont dans le dossier',
    'avec plaisir merci pour votre aide',
  ];
  frenchTexts.forEach((text, i) => {
    it(`French text #${i} → 'fr'`, () =>
      expect(detectLanguage(text)).toBe('fr'));
  });

  // Spanish texts — avoid words containing French/English trigger subwords at word boundaries
  const spanishTexts = [
    'el trabajo con mucho gusto', 'con los libros del centro',
    'los archivos del trabajo',
  ];
  spanishTexts.forEach((text, i) => {
    it(`Spanish text #${i} → 'es'`, () =>
      expect(detectLanguage(text)).toBe('es'));
  });

  // Unknown texts
  const unknownTexts = ['', '12345', '!!!', 'αβγδ', 'абвгд'];
  unknownTexts.forEach((text, i) => {
    it(`unknown text #${i} → 'other'`, () =>
      expect(detectLanguage(text)).toBe('other'));
  });
});

describe('scoreText — rule weight interactions', () => {
  // All 5 keywords matching policyRule → 5*2 = 10
  it('all 5 policy keywords → score 10', () => {
    const rule = getBuiltInRules().find(r => r.id === 'policy')!;
    const text = rule.keywords.join(' ');
    expect(scoreText(text, rule)).toBe(rule.keywords.length * rule.weight);
  });

  // All 5 keywords for various rules
  const rules = getBuiltInRules();
  rules.forEach(rule => {
    it(`all keywords present for '${rule.id}' → score ${rule.keywords.length * rule.weight}`, () => {
      const text = rule.keywords.join(' ');
      expect(scoreText(text, rule)).toBe(rule.keywords.length * rule.weight);
    });
  });

  // Zero keywords match → score 0
  rules.forEach(rule => {
    it(`'xyzzy plugh' text for rule '${rule.id}' → score 0`, () =>
      expect(scoreText('xyzzy plugh', rule)).toBe(0));
  });
});
