import {
  ClassificationResult, ClassificationRule, ClassifierConfig, ConfidentialityLevel,
  DocumentCategory, DocumentFormat, DocumentMetadata, LanguageCode,
} from './types';

const BUILT_IN_RULES: ClassificationRule[] = [
  { id: 'policy', category: 'policy', keywords: ['policy', 'policies', 'governance', 'guideline', 'framework'], weight: 2 },
  { id: 'procedure', category: 'procedure', keywords: ['procedure', 'process', 'workflow', 'instruction', 'step'], weight: 2 },
  { id: 'form', category: 'form', keywords: ['form', 'template', 'request', 'application', 'questionnaire'], weight: 2 },
  { id: 'report', category: 'report', keywords: ['report', 'summary', 'analysis', 'review', 'findings'], weight: 2 },
  { id: 'contract', category: 'contract', keywords: ['contract', 'agreement', 'terms', 'conditions', 'sla', 'nda'], weight: 3 },
  { id: 'invoice', category: 'invoice', keywords: ['invoice', 'receipt', 'payment', 'billing', 'purchase order'], weight: 3 },
  { id: 'certificate', category: 'certificate', keywords: ['certificate', 'certification', 'accreditation', 'qualification', 'award'], weight: 3 },
  { id: 'audit', category: 'audit', keywords: ['audit', 'inspection', 'assessment', 'evaluation', 'finding'], weight: 2 },
  { id: 'risk', category: 'risk', keywords: ['risk', 'hazard', 'threat', 'vulnerability', 'mitigation'], weight: 2 },
  { id: 'training', category: 'training', keywords: ['training', 'learning', 'education', 'course', 'competency'], weight: 2 },
  { id: 'safety', category: 'safety', keywords: ['safety', 'incident', 'accident', 'near miss', 'ppe'], weight: 2 },
  { id: 'compliance', category: 'compliance', keywords: ['compliance', 'regulation', 'requirement', 'standard', 'iso'], weight: 2 },
  { id: 'technical', category: 'technical', keywords: ['technical', 'specification', 'drawing', 'engineering', 'design'], weight: 2 },
  { id: 'correspondence', category: 'correspondence', keywords: ['letter', 'email', 'memo', 'notice', 'communication'], weight: 1 },
];

export function getBuiltInRules(): ClassificationRule[] {
  return BUILT_IN_RULES;
}

export function tokenise(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
}

export function scoreText(text: string, rule: ClassificationRule): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of rule.keywords) {
    if (lower.includes(kw.toLowerCase())) score += rule.weight;
  }
  return score;
}

export function matchedKeywords(text: string, rule: ClassificationRule): string[] {
  const lower = text.toLowerCase();
  return rule.keywords.filter(kw => lower.includes(kw.toLowerCase()));
}

export function classify(
  doc: DocumentMetadata,
  text: string,
  config: ClassifierConfig
): ClassificationResult {
  const rules = config.rules.length > 0 ? config.rules : BUILT_IN_RULES;
  const allCategories: DocumentCategory[] = [
    'policy','procedure','form','report','contract','invoice','certificate',
    'audit','risk','training','safety','compliance','technical','correspondence','other'
  ];
  const scores: Record<DocumentCategory, number> = {} as Record<DocumentCategory, number>;
  for (const cat of allCategories) scores[cat] = 0;

  const allMatched: string[] = [];
  for (const rule of rules) {
    const s = scoreText(text, rule);
    scores[rule.category] = (scores[rule.category] ?? 0) + s;
    if (s > 0) allMatched.push(...matchedKeywords(text, rule));
  }

  const topCategory = (Object.keys(scores) as DocumentCategory[]).reduce(
    (best, cat) => scores[cat] > scores[best] ? cat : best,
    'other' as DocumentCategory
  );

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const confidence = totalScore > 0 ? Math.min(1, scores[topCategory] / totalScore) : 0;
  const category = confidence >= config.minConfidence ? topCategory : config.defaultCategory;

  return {
    documentId: doc.id,
    category,
    confidence,
    matchedKeywords: [...new Set(allMatched)],
    confidentiality: detectConfidentiality(text),
    format: detectFormat(doc.filename),
    scores,
  };
}

export function detectConfidentiality(text: string): ConfidentialityLevel {
  const lower = text.toLowerCase();
  if (/\brestricted\b|\btop.?secret\b/.test(lower)) return 'restricted';
  if (/\bconfidential\b|\bsensitive\b|\bprivate\b/.test(lower)) return 'confidential';
  if (/\binternal\b|\binternal.?use\b/.test(lower)) return 'internal';
  return 'public';
}

export function detectFormat(filename: string): DocumentFormat {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, DocumentFormat> = {
    pdf: 'pdf', docx: 'docx', doc: 'docx', xlsx: 'xlsx', xls: 'xlsx',
    pptx: 'pptx', ppt: 'pptx', txt: 'txt', csv: 'csv',
    html: 'html', htm: 'html', xml: 'xml', json: 'json',
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', bmp: 'image',
  };
  return map[ext] ?? 'other';
}

export function detectLanguage(text: string): LanguageCode {
  const lower = text.toLowerCase();
  if (/\b(the|and|or|is|are|was|were|with|for)\b/.test(lower)) return 'en';
  if (/\b(und|oder|ist|sind|war|waren|mit|für|die|der|das)\b/.test(lower)) return 'de';
  if (/\b(le|la|les|est|sont|avec|pour|dans|qui|que)\b/.test(lower)) return 'fr';
  if (/\b(el|la|los|las|es|son|con|para|que|del)\b/.test(lower)) return 'es';
  return 'other';
}

export function isValidCategory(c: string): c is DocumentCategory {
  return ['policy','procedure','form','report','contract','invoice','certificate',
    'audit','risk','training','safety','compliance','technical','correspondence','other'].includes(c);
}

export function isValidFormat(f: string): f is DocumentFormat {
  return ['pdf','docx','xlsx','pptx','txt','csv','html','xml','json','image','other'].includes(f);
}

export function isValidConfidentiality(c: string): c is ConfidentialityLevel {
  return ['public','internal','confidential','restricted'].includes(c);
}

export function makeConfig(minConfidence = 0.1, extraRules: ClassificationRule[] = []): ClassifierConfig {
  return { minConfidence, rules: [...BUILT_IN_RULES, ...extraRules], defaultCategory: 'other' };
}

export function makeDoc(id: string, filename: string, overrides: Partial<DocumentMetadata> = {}): DocumentMetadata {
  return { id, filename, ...overrides };
}
