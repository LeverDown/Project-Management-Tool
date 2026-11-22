import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { getCommentsByTaskApi, createCommentApi, deleteCommentApi } from '../../api/comments.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../common/Toast.jsx';
import Avatar from '../common/Avatar.jsx';
import Spinner from '../common/Spinner.jsx';
import { formatRelativeTime, formatDate } from '../../utils/date.js';

export default function CommentThread({ taskId, onCommentCountChanged }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const pollIntervalRef = useRef(null);

  const fetchComments = useCallback(async (isPolling = false) => {
    if (!taskId) return;
    if (!isPolling) setLoading(true);

    try {
      const data = await getCommentsByTaskApi(taskId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments(false);

    pollIntervalRef.current = setInterval(() => {
      fetchComments(true);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || submitting) return;

    const trimmedText = text.trim();
    setSubmitting(true);

    try {
      const newComment = await createCommentApi(taskId, { text: trimmedText });
      setText('');
      setComments((prev) => {
        const next = [...prev, newComment];
        if (onCommentCountChanged) {
          onCommentCountChanged(next.length);
        }
        return next;
      });
      showToast('Comment posted', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post comment';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => {
        const next = prev.filter((c) => c._id !== commentId);
        if (onCommentCountChanged) {
          onCommentCountChanged(next.length);
        }
        return next;
      });
      showToast('Comment deleted', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete comment';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
        <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Comment Input */}
      <div className="flex gap-2.5 items-start">
        <Avatar user={user} size="sm" />
        <div className="flex-1">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Enter to send, Shift+Enter for newline)"
            className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none"
          />
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
            >
              {submitting ? (
                <Spinner size="sm" className="border-white border-r-transparent" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="py-6 flex items-center justify-center text-gray-400 dark:text-slate-500 gap-2 text-xs">
          <Spinner size="sm" /> Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/40 rounded-lg border border-gray-100 dark:border-slate-800">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const author = comment.author || {};
            const isAuthor = user && (author._id === user._id || author === user._id);

            return (
              <div
                key={comment._id}
                className="group flex gap-2.5 p-3 rounded-lg bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100/80 dark:border-slate-700/50 hover:bg-gray-100/50 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar user={author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                        {author.name || 'User'}
                      </span>
                      <span
                        className="text-[11px] text-gray-400 dark:text-slate-500 cursor-default"
                        title={formatDate(comment.createdAt)}
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment._id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
