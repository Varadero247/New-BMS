// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { OnboardingIntent, ConfidenceLevel } from './types';

interface IntentRule {
  intent: OnboardingIntent;
  patterns: RegExp[];
  weight: number;
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'QUESTION_STANDARD',
    patterns: [
      /\biso\s*\d+\b/i,
      /\biatf\b/i,
      /\bbrcgs?\b/i,
      /\bstandard\b/i,
      /\bcertif/i,
      /\bclause\b/i,
      /\brequirement/i,
    ],
    weight: 3,
  },
  {
    intent: 'QUESTION_MODULE',
    patterns: [
      /\bmodule\b/i,
      /\bhealth\s*(and|&)?\s*safety\b/i,
      /\benvironm/i,
      /\bquality\b/i,
      /\bincident\b/i,
      /\brisk\b/i,
      /\baudit\b/i,
      /\bhr\b/i,
      /\binfosec\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'QUESTION_SETUP',
    patterns: [
      /\bset\s*up\b/i,
      /\bsetup\b/i,
      /\bconfigur/i,
      /\binstall/i,
      /\bonboard/i,
      /\bget\s*start/i,
      /\bbegin/i,
      /\bstart/i,
      /\bwizard\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'QUESTION_COMPLIANCE',
    patterns: [
      /\bcompli/i,
      /\bgap\b/i,
      /\bconform/i,
      /\bassess/i,
      /\breadiness\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'REQUEST_CHECKLIST',
    patterns: [
      /\bchecklist\b/i,
      /\blist\s+of\b/i,
      /\bsteps?\b/i,
      /\bhow\s+do\s+i\b/i,
      /\bwhat\s+do\s+i\s+need\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'REQUEST_TEMPLATE',
    patterns: [
      /\btemplate\b/i,
      /\bform\b/i,
      /\bdocument\b/i,
      /\bdownload\b/i,
      /\bexample\s+document\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'REQUEST_EXAMPLE',
    patterns: [
      /\bexample\b/i,
      /\bsample\b/i,
      /\bshow\s+me\b/i,
      /\bdemonstrate\b/i,
      /\bhow\s+does\b/i,
    ],
    weight: 1,
  },
  {
    intent: 'REPORT_PROBLEM',
    patterns: [
      /\berror\b/i,
      /\bbug\b/i,
      /\bbroken\b/i,
      /\bnot\s+working\b/i,
      /\bcan't\b/i,
      /\bcannot\b/i,
      /\bfail/i,
      /\bproblem\b/i,
      /\bissue\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'REQUEST_HUMAN',
    patterns: [
      /\bhuman\b/i,
      /\bsupport\b/i,
      /\bcall\b/i,
      /\bspeak\s+to\b/i,
      /\bcontact\b/i,
      /\bhelp\s+desk\b/i,
      /\bsupport\s+ticket\b/i,
    ],
    weight: 4,
  },
  {
    intent: 'QUESTION_FEATURE',
    patterns: [
      /\bfeature\b/i,
      /\bcapabilit/i,
      /\bwhat\s+can\b/i,
      /\bdoes\s+(nexara|ims)\b/i,
      /\bcan\s+(nexara|ims|it|you)\b/i,
    ],
    weight: 1,
  },
];

export function classifyIntent(message: string): { intent: OnboardingIntent; confidence: ConfidenceLevel } {
  const scores = new Map<OnboardingIntent, number>();

  for (const rule of INTENT_RULES) {
    let matchCount = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(message)) matchCount++;
    }
    if (matchCount > 0) {
      const current = scores.get(rule.intent) ?? 0;
      scores.set(rule.intent, current + matchCount * rule.weight);
    }
  }

  if (scores.size === 0) {
    return { intent: 'GENERAL_CHAT', confidence: 'LOW' };
  }

  let topIntent: OnboardingIntent = 'GENERAL_CHAT';
  let topScore = 0;
  for (const [intent, score] of scores) {
    if (score > topScore) {
      topScore = score;
      topIntent = intent;
    }
  }

  const confidence: ConfidenceLevel = topScore >= 6 ? 'HIGH' : topScore >= 3 ? 'MEDIUM' : 'LOW';
  return { intent: topIntent, confidence };
}
