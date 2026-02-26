// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Types
// ============================================

export interface Comment {
  id: string;
  orgId: string;
  recordType: string;
  recordId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  mentions: string[];
  reactions: CommentReaction[];
  replies?: Comment[];
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
}

export interface CreateCommentParams {
  orgId: string;
  recordType: string;
  recordId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
}

export interface GetCommentsOptions {
  page?: number;
  limit?: number;
}

// ============================================
// In-memory store
// ============================================

const comments = new Map<string, Comment>();
const reactions = new Map<string, CommentReaction>();

// ============================================
// Parse @mentions from body
// ============================================

export function parseMentions(body: string): string[] {
  const regex = /@\[([^\]]+)\]/g;
  const mentions: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}

// ============================================
// Create comment
// ============================================

export async function createComment(params: CreateCommentParams): Promise<Comment> {
  const { orgId, recordType, recordId, parentId, authorId, authorName, authorAvatar, body } =
    params;

  // Validate parent exists if parentId provided
  if (parentId) {
    const parent = comments.get(parentId);
    if (!parent) {
      throw new Error('Parent comment not found');
    }
    // Only allow one level of nesting
    if (parent.parentId) {
      throw new Error('Cannot reply to a reply — only one level of nesting is allowed');
    }
  }

  const mentions = parseMentions(body);
  const now = new Date();

  const comment: Comment = {
    id: uuidv4(),
    orgId,
    recordType,
    recordId,
    parentId: parentId || null,
    authorId,
    authorName,
    authorAvatar,
    body,
    mentions,
    reactions: [],
    editedAt: undefined,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  };

  comments.set(comment.id, comment);
  return comment;
}

// ============================================
// Get comments (threaded, paginated)
// ============================================

export async function getComments(
  recordType: string,
  recordId: string,
  opts?: GetCommentsOptions
): Promise<{ comments: Comment[]; total: number }> {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 20;

  // Get all comments for this record
  const allComments = Array.from(comments.values()).filter(
    (c) => c.recordType === recordType && c.recordId === recordId
  );

  // Separate top-level and replies
  const topLevel = allComments
    .filter((c) => !c.parentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const repliesMap = new Map<string, Comment[]>();
  for (const c of allComments.filter((c) => c.parentId)) {
    const existing = repliesMap.get(c.parentId!) || [];
    existing.push(c);
    repliesMap.set(c.parentId!, existing);
  }

  // Attach replies (sorted oldest first)
  const threaded = topLevel.map((c) => ({
    ...c,
    replies: (repliesMap.get(c.id) || []).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    ),
  }));

  const total = topLevel.length;
  const start = (page - 1) * limit;
  const paginated = threaded.slice(start, start + limit);

  return { comments: paginated, total };
}

// ============================================
// Update comment (author only, 15 min window)
// ============================================

export async function updateComment(id: string, authorId: string, body: string): Promise<Comment> {
  const comment = comments.get(id);
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.authorId !== authorId) {
    throw new Error('Only the author can edit this comment');
  }

  if (comment.deletedAt) {
    throw new Error('Cannot edit a deleted comment');
  }

  const fifteenMinutes = 15 * 60 * 1000;
  if (Date.now() - comment.createdAt.getTime() > fifteenMinutes) {
    throw new Error('Edit window has expired (15 minutes)');
  }

  const now = new Date();
  comment.body = body;
  comment.mentions = parseMentions(body);
  comment.editedAt = now;
  comment.updatedAt = now;

  comments.set(id, comment);
  return comment;
}

// ============================================
// Delete comment (soft delete)
// ============================================

export async function deleteComment(id: string, userId: string, isAdmin: boolean): Promise<void> {
  const comment = comments.get(id);
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.deletedAt) {
    throw new Error('Comment already deleted');
  }

  if (comment.authorId !== userId && !isAdmin) {
    throw new Error('Only the author or an admin can delete this comment');
  }

  comment.body = '[deleted]';
  comment.mentions = [];
  comment.deletedAt = new Date();
  comment.updatedAt = new Date();

  comments.set(id, comment);
}

// ============================================
// Reactions
// ============================================

const ALLOWED_EMOJIS = [
  '\uD83D\uDC4D',
  '\uD83D\uDC4E',
  '\u2764\uFE0F',
  '\uD83C\uDF89',
  '\u26A0\uFE0F',
];

export function getAllowedEmojis(): string[] {
  return ALLOWED_EMOJIS;
}

export async function addReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<CommentReaction> {
  const comment = comments.get(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Check for duplicate
  const existing = comment.reactions.find((r) => r.userId === userId && r.emoji === emoji);
  if (existing) {
    return existing;
  }

  const reaction: CommentReaction = {
    id: uuidv4(),
    commentId,
    userId,
    emoji,
  };

  comment.reactions.push(reaction);
  reactions.set(reaction.id, reaction);
  comments.set(commentId, comment);

  return reaction;
}

export async function removeReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const comment = comments.get(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  const idx = comment.reactions.findIndex((r) => r.userId === userId && r.emoji === emoji);
  if (idx === -1) {
    throw new Error('Reaction not found');
  }

  const removed = comment.reactions.splice(idx, 1);
  if (removed[0]) {
    reactions.delete(removed[0].id);
  }
  comments.set(commentId, comment);
}

// ============================================
// Utility: get a single comment by ID
// ============================================

export async function getCommentById(id: string): Promise<Comment | null> {
  return comments.get(id) || null;
}

// ============================================
// Reset store (for testing)
// ============================================

export function resetStore(): void {
  comments.clear();
  reactions.clear();
}
