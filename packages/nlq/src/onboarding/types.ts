// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type OnboardingIntent =
  | 'QUESTION_STANDARD'
  | 'QUESTION_MODULE'
  | 'QUESTION_SETUP'
  | 'QUESTION_COMPLIANCE'
  | 'QUESTION_FEATURE'
  | 'REQUEST_CHECKLIST'
  | 'REQUEST_TEMPLATE'
  | 'REQUEST_EXAMPLE'
  | 'REPORT_PROBLEM'
  | 'REQUEST_HUMAN'
  | 'GENERAL_CHAT';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface OnboardingContext {
  orgId: string;
  userId: string;
  standards?: string[];              // e.g. ["iso-9001-2015", "iso-45001-2018"]
  enabledModules?: string[];
  setupStage?: string;               // e.g. "gap-assessment", "data-migration"
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationSession {
  sessionId: string;
  orgId: string;
  userId: string;
  messages: ChatMessage[];
  context: OnboardingContext;
  createdAt: Date;
  lastActivity: Date;
}

export interface AssistantResponse {
  sessionId: string;
  message: string;
  intent: OnboardingIntent;
  confidence: ConfidenceLevel;
  suggestedActions?: SuggestedAction[];
  relatedLinks?: RelatedLink[];
  followUpQuestions?: string[];
}

export interface SuggestedAction {
  label: string;
  action: string;   // e.g. "navigate:/assessments", "open:instant-start", "download:template"
  description?: string;
}

export interface RelatedLink {
  label: string;
  url: string;
  type: 'DOCUMENTATION' | 'VIDEO' | 'CHECKLIST' | 'TEMPLATE';
}
