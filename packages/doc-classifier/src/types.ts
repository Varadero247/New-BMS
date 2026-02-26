export type DocumentCategory =
  | 'policy' | 'procedure' | 'form' | 'report' | 'contract'
  | 'invoice' | 'certificate' | 'audit' | 'risk' | 'training'
  | 'safety' | 'compliance' | 'technical' | 'correspondence' | 'other';

export type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'csv' | 'html' | 'xml' | 'json' | 'image' | 'other';
export type LanguageCode = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl' | 'other';

export interface ClassificationRule {
  id: string;
  category: DocumentCategory;
  keywords: string[];
  weight: number;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt?: number;
  language?: LanguageCode;
}

export interface ClassificationResult {
  documentId: string;
  category: DocumentCategory;
  confidence: number;
  matchedKeywords: string[];
  confidentiality: ConfidentialityLevel;
  format: DocumentFormat;
  scores: Record<DocumentCategory, number>;
}

export interface ClassifierConfig {
  minConfidence: number;
  rules: ClassificationRule[];
  defaultCategory: DocumentCategory;
}
