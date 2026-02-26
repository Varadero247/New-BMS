// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import Anthropic from '@anthropic-ai/sdk';
import { classifyIntent } from './intent-classifier';
import { searchKnowledgeBase, ONBOARDING_KNOWLEDGE_BASE } from './knowledge-base';
import type {
  OnboardingContext,
  ConversationSession,
  AssistantResponse,
  ChatMessage,
  OnboardingIntent,
} from './types';

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

// Session store (24hr TTL)
const sessionStore = new Map<string, ConversationSession>();

const SYSTEM_PROMPT = `You are Nexara IMS Onboarding Assistant, a friendly and knowledgeable expert who helps organisations set up and get certified with the Nexara Integrated Management System.

You specialise in:
- ISO standards: ISO 9001, ISO 14001, ISO 45001, ISO 27001, IATF 16949, BRCGS, ISO 13485
- System onboarding: module configuration, data migration, SSO setup, user management
- Compliance guidance: gap assessments, certification timelines, audit preparation

Communication style:
- Be concise, practical, and encouraging
- Use bullet points for lists and steps
- When unsure, acknowledge it and suggest contacting support
- Always offer next steps or follow-up questions

Important constraints:
- Only provide information about Nexara IMS and the supported standards above
- Do not give legal, financial, or medical advice
- If asked about topics outside your expertise, politely redirect to the relevant support channel`;

function buildContextualSystemPrompt(context: OnboardingContext): string {
  const parts = [SYSTEM_PROMPT];

  if (context.standards?.length) {
    parts.push(`\nThe organisation is targeting: ${context.standards.join(', ')}`);
  }
  if (context.enabledModules?.length) {
    parts.push(`\nEnabled modules: ${context.enabledModules.join(', ')}`);
  }
  if (context.setupStage) {
    parts.push(`\nCurrent setup stage: ${context.setupStage}`);
  }

  return parts.join('\n');
}

function buildKnowledgeContext(userMessage: string): string {
  const entries = searchKnowledgeBase(userMessage);
  if (entries.length === 0) return '';
  return '\n\nRelevant knowledge base entries:\n' + entries.slice(0, 3).map(e => `[${e.topic}]: ${e.content}`).join('\n\n');
}

function getFallbackResponse(intent: OnboardingIntent, userMessage: string, context: OnboardingContext): string {
  const entries = searchKnowledgeBase(userMessage);

  if (entries.length > 0) {
    return entries[0].content + '\n\nWould you like more detail on any of these areas?';
  }

  switch (intent) {
    case 'REQUEST_HUMAN':
      return 'I\'ll connect you with our support team. You can reach them at support@nexara.io or raise a ticket from the Help menu in the top navigation bar. Our team typically responds within 4 business hours.';
    case 'REPORT_PROBLEM':
      return 'I\'m sorry to hear you\'re experiencing an issue. Please raise a support ticket from the Help menu, and our technical team will investigate. If you can describe the steps you took before the problem occurred, that will help us resolve it faster.';
    case 'QUESTION_STANDARD':
      return 'I can help with guidance on ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, ISO 27001:2022, IATF 16949:2016, BRCGS, and ISO 13485:2016. Which standard would you like to know more about?';
    case 'GENERAL_CHAT':
      return `Hello! I\'m here to help you get started with Nexara IMS. I can help you with:\n\n- Setting up your industry configuration pack\n- Assessing your compliance gaps\n- Configuring modules and integrations\n- SSO and user management\n- Understanding ISO standards\n\nWhat would you like help with today?`;
    default:
      return 'I\'m here to help with your Nexara IMS onboarding. Could you tell me more about what you\'re trying to accomplish? For example: setting up a module, understanding a standard requirement, or importing data from another system.';
  }
}

function getFollowUpQuestions(intent: OnboardingIntent, context: OnboardingContext): string[] {
  switch (intent) {
    case 'QUESTION_STANDARD':
      return ['Would you like to start a gap assessment?', 'Do you know which certification body you\'re planning to use?', 'How soon are you targeting certification?'];
    case 'QUESTION_SETUP':
      return ['Have you installed an Instant Start pack for your industry?', 'Are you migrating data from an existing system?', 'Do you need to configure SSO?'];
    case 'QUESTION_COMPLIANCE':
      return ['Would you like me to walk you through the gap assessment process?', 'Which standard are you assessing against?', 'Have you already conducted an internal audit?'];
    case 'REQUEST_CHECKLIST':
      return ['Is there a specific standard you need a checklist for?', 'Do you want to export this as a PDF?'];
    default:
      return context.standards?.length
        ? [`How is your ${context.standards[0]} setup progressing?`, 'Is there a specific feature you need help with?']
        : ['What industry are you in?', 'Which ISO standards are you targeting?'];
  }
}

export function createSession(context: OnboardingContext): ConversationSession {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const session: ConversationSession = {
    sessionId,
    orgId: context.orgId,
    userId: context.userId,
    messages: [],
    context,
    createdAt: new Date(),
    lastActivity: new Date(),
  };
  sessionStore.set(sessionId, session);

  // TTL cleanup
  setTimeout(() => sessionStore.delete(sessionId), 24 * 60 * 60 * 1000);

  return session;
}

export function getSession(sessionId: string): ConversationSession | undefined {
  return sessionStore.get(sessionId);
}

export function cleanExpiredSessions(): void {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, session] of sessionStore) {
    if (session.lastActivity.getTime() < cutoff) sessionStore.delete(id);
  }
}

export async function chat(
  sessionId: string,
  userMessage: string,
): Promise<AssistantResponse> {
  const session = sessionStore.get(sessionId);
  if (!session) throw new Error('Session not found');

  const { intent, confidence } = classifyIntent(userMessage);

  const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date() };
  session.messages.push(userMsg);
  session.lastActivity = new Date();

  let responseText: string;

  if (client) {
    try {
      const knowledgeContext = buildKnowledgeContext(userMessage);
      const systemPrompt = buildContextualSystemPrompt(session.context) + knowledgeContext;

      const messages = session.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      responseText = response.content[0].type === 'text' ? response.content[0].text : getFallbackResponse(intent, userMessage, session.context);
    } catch {
      responseText = getFallbackResponse(intent, userMessage, session.context);
    }
  } else {
    responseText = getFallbackResponse(intent, userMessage, session.context);
  }

  const assistantMsg: ChatMessage = { role: 'assistant', content: responseText, timestamp: new Date() };
  session.messages.push(assistantMsg);
  sessionStore.set(sessionId, session);

  // Build suggested actions from knowledge base matches
  const knowledgeMatches = searchKnowledgeBase(userMessage);
  const suggestedActions = knowledgeMatches.slice(0, 2).flatMap(e => e.suggestedActions ?? []);

  const followUpQuestions = getFollowUpQuestions(intent, session.context);

  return {
    sessionId,
    message: responseText,
    intent,
    confidence,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
    followUpQuestions: followUpQuestions.slice(0, 3),
  };
}

export async function getSuggestedQuestions(context: OnboardingContext): Promise<string[]> {
  const suggestions: string[] = [];

  if (!context.standards?.length) {
    suggestions.push('Which ISO standards should I target for my industry?');
  }
  if (!context.setupStage || context.setupStage === 'initial') {
    suggestions.push('How do I get started with Nexara IMS?');
    suggestions.push('What is an Instant Start pack?');
  }
  if (context.setupStage === 'gap-assessment') {
    suggestions.push('What does a gap assessment involve?');
    suggestions.push('How do I interpret my gap assessment score?');
  }
  if (context.setupStage === 'data-migration') {
    suggestions.push('What file formats are supported for data migration?');
    suggestions.push('How does the AI field mapping work?');
  }

  suggestions.push('How long does ISO certification typically take?');
  suggestions.push('How do I set up SSO with my identity provider?');

  return suggestions.slice(0, 6);
}
