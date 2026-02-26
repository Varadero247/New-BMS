export * from './types';
export * from './extractor';

import {
  FieldDefinition,
  DocumentContext,
  AutofillResult,
  AutofillOptions,
} from './types';
import { extractAllFields, computeOverallConfidence, buildWarnings } from './extractor';

export function autofillDocument(
  documentId: string,
  fields: FieldDefinition[],
  context: DocumentContext,
  options: AutofillOptions = {}
): AutofillResult {
  const extracted = extractAllFields(fields, context, options);
  return {
    documentId,
    fields: extracted,
    overallConfidence: computeOverallConfidence(extracted),
    processedAt: new Date().toISOString(),
    warnings: buildWarnings(fields, extracted),
  };
}
