'use client';

import { useState, useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { cn } from './utils';

// ============================================
// Types
// ============================================

interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
}

interface Comment {
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
  editedAt?: string | Date;
  deletedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CommentThreadProps {
  recordType: string;
  recordId: string;
  currentUserId: string;
  currentUserName: string;
  apiBaseUrl?: string;
  className?: string;
}

// ============================================
// Helpers
// ============================================

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function canEdit(comment: Comment, currentUserId: string): boolean {
  if (comment.authorId !== currentUserId) return false;
  if (comment.deletedAt) return false;
  const fifteenMinutes = 15 * 60 * 1000;
  return Date.now() - new Date(comment.createdAt).getTime() < fifteenMinutes;
}

const REACTION_EMOJIS = ['\uD83D\uDC4D', '\uD83D\uDC4E', '\u2764\uFE0F', '\uD83C\uDF89', '\u26A0\uFE0F'];

// ============================================
// Avatar component
// ============================================

function CommentAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300',
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

// ============================================
// Single comment component
// ============================================

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onRemoveReaction,
  isReply,
}: {
  comment: Comment;
  currentUserId: string;
  onReply: (parentId: string) => void;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  isReply?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isDeleted = !!comment.deletedAt;
  const isEditable = canEdit(comment, currentUserId);
  const isOwner = comment.authorId === currentUserId;

  const handleSaveEdit = () => {
    if (editBody.trim()) {
      onEdit(comment.id, editBody.trim());
      setEditing(false);
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditBody(comment.body);
    }
  };

  // Group reactions by emoji
  const reactionGroups = new Map<string, { count: number; userReacted: boolean }>();
  for (const r of comment.reactions) {
    const existing = reactionGroups.get(r.emoji) || { count: 0, userReacted: false };
    existing.count++;
    if (r.userId === currentUserId) existing.userReacted = true;
    reactionGroups.set(r.emoji, existing);
  }

  return (
    <div className={cn('flex gap-3', isReply && 'ml-11')}>
      <CommentAvatar name={comment.authorName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {comment.authorName}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.editedAt && !isDeleted && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">(edited)</span>
          )}
        </div>

        {/* Body or edit textarea */}
        {editing ? (
          <div className="mt-1">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              rows={3}
              autoFocus
            />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                }}
                className="rounded-md px-3 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className={cn(
            'mt-0.5 text-sm whitespace-pre-wrap',
            isDeleted
              ? 'italic text-zinc-400 dark:text-zinc-500'
              : 'text-zinc-700 dark:text-zinc-300'
          )}>
            {comment.body}
          </p>
        )}

        {/* Reactions bar */}
        {!isDeleted && !editing && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {Array.from(reactionGroups.entries()).map(([emoji, { count, userReacted }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  userReacted
                    ? onRemoveReaction(comment.id, emoji)
                    : onReaction(comment.id, emoji)
                }
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                  userReacted
                    ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                )}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReactions(!showReactions)}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:text-zinc-300"
                title="Add reaction"
              >
                +
              </button>
              {showReactions && (
                <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onReaction(comment.id, emoji);
                        setShowReactions(false);
                      }}
                      className="rounded p-1 text-base hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!isDeleted && !editing && (
          <div className="mt-1 flex items-center gap-3">
            {!isReply && (
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="text-xs font-medium text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
              >
                Reply
              </button>
            )}
            {isEditable && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
              >
                Edit
              </button>
            )}
            {isOwner && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Delete
              </button>
            )}
            {showDeleteConfirm && (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Delete?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(comment.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                >
                  No
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main CommentThread component
// ============================================

export function CommentThread({
  recordType,
  recordId,
  currentUserId,
  currentUserName,
  apiBaseUrl = '',
  className,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newBody, setNewBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const newCommentRef = useRef<HTMLTextAreaElement>(null);

  const limit = 10;

  // Fetch comments
  const fetchComments = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(
        `${apiBaseUrl}/api/comments?recordType=${encodeURIComponent(recordType)}&recordId=${encodeURIComponent(recordId)}&page=${p}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const json = await res.json();
      if (json.success) {
        if (p === 1) {
          setComments(json.data.comments);
        } else {
          setComments((prev) => [...prev, ...json.data.comments]);
        }
        setTotal(json.data.total);
      }
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, recordType, recordId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Create comment
  const handleCreate = async (parentId?: string | null) => {
    const body = parentId ? replyBody : newBody;
    if (!body.trim()) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ recordType, recordId, parentId: parentId || null, body: body.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        if (parentId) {
          setReplyBody('');
          setReplyTo(null);
        } else {
          setNewBody('');
        }
        // Refresh from page 1
        setPage(1);
        fetchComments(1);
      }
    } catch {
      setError('Failed to post comment');
    }
  };

  // Edit comment
  const handleEdit = async (id: string, body: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch(`${apiBaseUrl}/api/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ body }),
      });
      fetchComments(1);
    } catch {
      setError('Failed to edit comment');
    }
  };

  // Delete comment
  const handleDelete = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch(`${apiBaseUrl}/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      fetchComments(1);
    } catch {
      setError('Failed to delete comment');
    }
  };

  // Add reaction
  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch(`${apiBaseUrl}/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ emoji }),
      });
      fetchComments(page);
    } catch {
      setError('Failed to add reaction');
    }
  };

  // Remove reaction
  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch(`${apiBaseUrl}/api/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      fetchComments(page);
    } catch {
      setError('Failed to remove reaction');
    }
  };

  const handleNewKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreate(null);
    }
  };

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreate(replyTo);
    }
    if (e.key === 'Escape') {
      setReplyTo(null);
      setReplyBody('');
    }
  };

  const hasMore = comments.length < total;

  return (
    <div className={cn('rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900', className)}>
      {/* Header */}
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Comments {total > 0 && <span className="font-normal text-zinc-500">({total})</span>}
        </h3>
      </div>

      {/* New comment */}
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex gap-3">
          <CommentAvatar name={currentUserName} />
          <div className="flex-1">
            <textarea
              ref={newCommentRef}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              onKeyDown={handleNewKeyDown}
              placeholder="Add a comment... (use @[userId] to mention)"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              rows={2}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Cmd+Enter to submit
              </span>
              <button
                type="button"
                onClick={() => handleCreate(null)}
                disabled={!newBody.trim()}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors',
                  newBody.trim()
                    ? 'bg-brand-600 hover:bg-brand-700'
                    : 'cursor-not-allowed bg-zinc-300 dark:bg-zinc-700'
                )}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Comment list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {comments.map((comment) => (
          <div key={comment.id} className="px-4 py-3">
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              onReply={(parentId) => {
                setReplyTo(parentId);
                setReplyBody('');
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReaction={handleReaction}
              onRemoveReaction={handleRemoveReaction}
            />

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={() => {}}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReaction={handleReaction}
                    onRemoveReaction={handleRemoveReaction}
                    isReply
                  />
                ))}
              </div>
            )}

            {/* Reply textarea */}
            {replyTo === comment.id && (
              <div className="ml-11 mt-3 flex gap-3">
                <CommentAvatar name={currentUserName} className="h-6 w-6 text-[10px]" />
                <div className="flex-1">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    placeholder="Write a reply..."
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    rows={2}
                    autoFocus
                  />
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCreate(replyTo)}
                      disabled={!replyBody.trim()}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-medium text-white',
                        replyBody.trim()
                          ? 'bg-brand-600 hover:bg-brand-700'
                          : 'cursor-not-allowed bg-zinc-300 dark:bg-zinc-700'
                      )}
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyBody('');
                      }}
                      className="rounded-md px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {!loading && comments.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No comments yet. Be the first to comment.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading comments...
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="px-4 py-3 text-center">
            <button
              type="button"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchComments(nextPage);
              }}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Load more comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
