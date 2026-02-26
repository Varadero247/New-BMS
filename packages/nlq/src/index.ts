// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { parseNaturalLanguage, validateQueryPermissions, sanitizeQuery } from './query-parser';
export { QUERY_PATTERNS } from './patterns';
export type { NLQQuery, NLQResult, NLQPermissionContext, QueryPattern } from './types';

// Onboarding AI Assistant
export {
  createSession,
  getSession,
  cleanExpiredSessions,
  chat,
  getSuggestedQuestions,
} from './onboarding/assistant';
export { classifyIntent } from './onboarding/intent-classifier';
export { searchKnowledgeBase, ONBOARDING_KNOWLEDGE_BASE } from './onboarding/knowledge-base';
export type {
  OnboardingIntent,
  ConfidenceLevel,
  OnboardingContext,
  ChatMessage,
  ConversationSession,
  AssistantResponse,
  SuggestedAction,
  RelatedLink,
} from './onboarding/types';
export type { KnowledgeEntry } from './onboarding/knowledge-base';
