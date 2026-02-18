import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-contracts');

const router = Router();

const analyzeSchema = z.object({
  text: z.string().trim().min(1, 'Text is required'),
});

// ─── Extraction helpers ───────────────────────────────────────────────────────

const COMPANY_SUFFIXES =
  'Ltd|Limited|LLC|L\\.L\\.C\\.|Inc|Incorporated|Corp|Corporation|PLC|plc|LLP|LP|GmbH|S\\.A\\.|B\\.V\\.|Pty|AG';

function extractParties(text: string): string[] {
  const results = new Set<string>();

  // "between X and Y" pattern
  const betweenRe = /\bbetween\s+([\w\s,.']+?)\s+and\s+([\w\s,.']+?)(?:\s*\(|,|\.|;)/gi;
  let m;
  while ((m = betweenRe.exec(text)) !== null) {
    [m[1], m[2]].forEach((p) => {
      const clean = p.replace(/\s+/g, ' ').trim();
      if (clean.length > 2 && clean.length < 80) results.add(clean);
    });
  }

  // Stand-alone company names (word(s) followed by a legal suffix)
  const companyRe = new RegExp(`[A-Z][\\w\\s&'.-]{1,50}(?:${COMPANY_SUFFIXES})\\.?`, 'g');
  while ((m = companyRe.exec(text)) !== null) {
    const clean = m[0].replace(/\s+/g, ' ').trim();
    if (clean.length > 3) results.add(clean);
  }

  return Array.from(results).slice(0, 10);
}

function extractDates(text: string): string[] {
  const results = new Set<string>();

  // ISO-style: 2025-12-31, 31/12/2025, 31-12-2025
  const isoRe = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g;
  let m;
  while ((m = isoRe.exec(text)) !== null) results.add(m[1]);

  // Written: 1st January 2025, January 1, 2025, 1 Jan 2025
  const writtenRe =
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4})\b/gi;
  while ((m = writtenRe.exec(text)) !== null) results.add(m[1].replace(/\s+/g, ' ').trim());

  return Array.from(results).slice(0, 20);
}

function extractValues(text: string): Array<{ amount: string; currency: string; context: string }> {
  const results: Array<{ amount: string; currency: string; context: string }> = [];
  const seen = new Set<string>();

  // £1,000,000.00 / $5M / €500k / USD 1,000
  const valueRe =
    /(?:(GBP|USD|EUR|CAD|AUD|CHF)\s*)?([£$€¥])?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(million|billion|m|bn|k)?\s*(?:(GBP|USD|EUR|CAD|AUD|CHF))?/gi;
  let m;
  while ((m = valueRe.exec(text)) !== null) {
    const raw = m[0].trim();
    if (raw.length < 2) continue;
    const numStr = m[3];
    const num = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(num) || num === 0) continue;

    // Determine currency
    const symbol = m[2];
    const codePrefix = m[1];
    const codeSuffix = m[5];
    const symbolMap: Record<string, string> = { '£': 'GBP', $: 'USD', '€': 'EUR', '¥': 'JPY' };
    const currency = codePrefix || codeSuffix || (symbol ? symbolMap[symbol] : 'USD');

    // Scale
    const scale = (m[4] || '').toLowerCase();
    const multiplier =
      scale === 'billion' || scale === 'bn'
        ? 1e9
        : scale === 'million' || scale === 'm'
          ? 1e6
          : scale === 'k'
            ? 1000
            : 1;
    const scaledNum = num * multiplier;
    const amount =
      scaledNum >= 1e6
        ? `${(scaledNum / 1e6).toFixed(2)}M`
        : scaledNum >= 1000
          ? scaledNum.toLocaleString('en-GB', { minimumFractionDigits: 2 })
          : scaledNum.toFixed(2);

    const key = `${currency}${amount}`;
    if (!seen.has(key)) {
      seen.add(key);
      // Get surrounding context (up to 40 chars before match)
      const start = Math.max(0, m.index - 40);
      const context = text
        .slice(start, m.index + raw.length + 20)
        .replace(/\s+/g, ' ')
        .trim();
      results.push({ amount, currency, context });
    }
    if (results.length >= 15) break;
  }

  return results;
}

const KEY_TERM_PATTERNS: Array<{ term: string; regex: RegExp }> = [
  { term: 'Indemnification', regex: /\bindemnif/i },
  { term: 'Limitation of Liability', regex: /\blimitation\s+of\s+liability\b/i },
  { term: 'Force Majeure', regex: /\bforce\s+majeure\b/i },
  { term: 'Confidentiality / NDA', regex: /\bconfidential(ity)?\b|\bnon-disclosure\b|\bNDA\b/i },
  { term: 'Intellectual Property', regex: /\bintellectual\s+property\b|\bIP\s+rights?\b/i },
  { term: 'Termination', regex: /\btermination\b|\bterminate\s+(this\s+)?agreement\b/i },
  { term: 'Governing Law', regex: /\bgoverning\s+law\b|\bjurisdiction\b/i },
  { term: 'Dispute Resolution', regex: /\bdispute\s+resolution\b|\barbitration\b|\bmediation\b/i },
  { term: 'Payment Terms', regex: /\bpayment\s+terms?\b|\bnet\s+\d+\s+days?\b|\binvoice\b/i },
  { term: 'Warranty', regex: /\bwarrant(y|ies|s)?\b/i },
  { term: 'Assignment', regex: /\bassignment\b|\bassign\s+this\s+agreement\b/i },
  { term: 'Non-Compete', regex: /\bnon-compete\b|\bnon-solicitation\b/i },
  { term: 'Audit Rights', regex: /\baudit\s+rights?\b/i },
  { term: 'Change of Control', regex: /\bchange\s+of\s+control\b/i },
  { term: 'Entire Agreement', regex: /\bentire\s+agreement\b|\bwhole\s+agreement\b/i },
];

function extractKeyTerms(text: string): string[] {
  return KEY_TERM_PATTERNS.filter((p) => p.regex.test(text)).map((p) => p.term);
}

// ─── Route ───────────────────────────────────────────────────────────────────

router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { text } = parsed.data;

    const extracted = {
      parties: extractParties(text),
      dates: extractDates(text),
      values: extractValues(text),
      keyTerms: extractKeyTerms(text),
    };

    res.json({ success: true, data: { extracted, wordCount: text.split(/\s+/).length } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'EXTRACT_ERROR', message: 'Internal server error' } });
  }
});

export default router;
