import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Comment } from '../types';
import { Heart, CornerDownRight, Trash2, Flag, Send, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const {
    currentUser,
    users,
    comments,
    addComment,
    deleteComment,
    reportItem,
    setActiveProfileId,
    setActiveTab,
    setSelectedPostId,
    setShowAuthModal
  } = useApp();

  const [mainComment, setMainComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Top level comments
  const topLevelComments = comments.filter(c => c.postId === postId && !c.parentId);

  // Helper: Get replies to a comment
  const getReplies = (commentId: string) => {
    return comments.filter(c => c.postId === postId && c.parentId === commentId);
  };

  const handleAddMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainComment.trim()) return;
    addComment(postId, mainComment.trim());
    setMainComment('');
  };

  const handleAddReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addComment(postId, replyText.trim(), parentId);
    setReplyText('');
    setReplyToId(null);
  };

  const handleUserClick = (userId: string) => {
    setActiveProfileId(userId);
    setActiveTab('profile');
    setSelectedPostId(null);
  };

  const formatTime = (isoString: string) => {
    try {
      const past = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return past.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const CommentNode = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean; key?: any }) => {
    const author = users.find(u => u.id === comment.userId) || {
      id: 'unknown',
      username: 'someone',
      displayName: 'Anonymous',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isVerified: false,
    };

    const isCommentOwner = currentUser ? currentUser.id === comment.userId : false;
    const isStaff = currentUser ? currentUser.isAdmin : false;

    return (
      <div className={`p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-zinc-800/20 border border-white/10 dark:border-zinc-700/10 ${isReply ? 'ml-6 sm:ml-10 border-l-2 border-l-[#FF3B30]/30' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img
              src={author.avatar}
              alt={author.displayName}
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
              referrerPolicy="no-referrer"
              onClick={() => handleUserClick(author.id)}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:underline"
                  onClick={() => handleUserClick(author.id)}
                >
                  {author.displayName}
                </span>
                {author.isVerified && (
                  <span className="text-[10px] text-red-500 font-bold">✓</span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                <span className="cursor-pointer hover:text-[#FF3B30]" onClick={() => handleUserClick(author.id)}>
                  @{author.username}
                </span>
                <span>•</span>
                <span>{formatTime(comment.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Delete Option */}
            {(isCommentOwner || isStaff) && (
              <button
                onClick={() => {
                  if (confirm('Delete this comment?')) {
                    deleteComment(comment.id);
                  }
                }}
                className="p-1 text-zinc-400 hover:text-red-500 rounded transition-all duration-200"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Report Option */}
            {!isCommentOwner && currentUser && (
              <button
                onClick={() => {
                  const reason = prompt('Specify report reasoning for this comment:');
                  if (reason) {
                    reportItem(comment.id, 'comment', reason);
                    alert('Comment reported. Thank you helper!');
                  }
                }}
                className="p-1 text-zinc-400 hover:text-yellow-600 rounded transition-all duration-200"
                title="Report"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content body with @mentions highlighting */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed pl-1">
          {comment.content.split(/(\s+)/).map((p, i) => {
            if (p.startsWith('@') && p.length > 1) {
              const cleanUser = p.replace(/[@.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase();
              const found = users.find(u => u.username.toLowerCase() === cleanUser);
              return (
                <span
                  key={i}
                  className="text-blue-500 font-medium cursor-pointer hover:underline"
                  onClick={() => found && handleUserClick(found.id)}
                >
                  {p}
                </span>
              );
            }
            if (p.startsWith('#') && p.length > 1) {
              return <span key={i} className="text-[#FF3B30] font-medium">{p}</span>;
            }
            return p;
          })}
        </p>

        {/* Inline Actions (Like/Reply Button) */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-500 pl-1">
          {!isReply && (
            <button
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                  return;
                }
                if (replyToId === comment.id) {
                  setReplyToId(null);
                } else {
                  setReplyToId(comment.id);
                  setReplyText(`@${author.username} `);
                }
              }}
              className="flex items-center gap-1 hover:text-[#FF3B30] transition duration-150"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>

        {/* Inline Reply Form */}
        <AnimatePresence>
          {replyToId === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-2 overflow-hidden"
            >
              <form onSubmit={(e) => handleAddReply(e, comment.id)} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to @${author.username}...`}
                  className="flex-1 bg-white dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1.5 focus:ring-1 focus:ring-red-400 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-1.5 bg-[#FF3B30] text-white rounded-full hover:bg-red-600 disabled:opacity-40 transition"
                >
                  <Send className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="p-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Nested Replies */}
        <div className="space-y-3 mt-3">
          {getReplies(comment.id).map(rep => (
            <CommentNode key={rep.id} comment={rep} isReply={true} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Thread Title */}
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-wider uppercase">
        Discussion Thread
      </h3>

      {/* Insert New Comment Box */}
      {currentUser ? (
        <form onSubmit={handleAddMainComment} className="flex gap-2">
          <img
            src={currentUser.avatar}
            alt="Current"
            className="w-9 h-9 rounded-full object-cover shadow-sm border border-white"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={mainComment}
              onChange={e => setMainComment(e.target.value)}
              placeholder="Inject your thoughts into this discussion..."
              className="flex-1 bg-white/50 backdrop-blur-sm dark:bg-zinc-800/40 text-sm text-zinc-800 dark:text-zinc-100 border border-white/20 dark:border-zinc-700/20 rounded-full px-4 py-2 focus:ring-1 focus:ring-red-500 outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              disabled={!mainComment.trim()}
              className="px-4 py-2 bg-[#FF3B30] text-white text-xs font-bold rounded-full hover:bg-red-600 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> post
            </button>
          </div>
        </form>
      ) : (
        <div 
          onClick={() => setShowAuthModal(true)}
          className="p-3.5 bg-white/45 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-805 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#FF3B30]/50 transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-450 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition">
              <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-[#FF3B30] transition duration-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Join the discussion</p>
              <p className="text-[10px] text-zinc-505 dark:text-zinc-450">Log in or create an account to reply or comment.</p>
            </div>
          </div>
          <button className="px-3.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10.5px] font-bold text-zinc-650 dark:text-zinc-300 rounded-full transition group-hover:bg-[#FF3B30] group-hover:text-white">
            Comment ✦
          </button>
        </div>
      )}

      {/* Discussion Feed */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500 italic">
            This post currently has zero discussions. Be the first to start the trend!
          </div>
        ) : (
          topLevelComments.map(comm => (
            <CommentNode key={comm.id} comment={comm} />
          ))
        )}
      </div>
    </div>
  );
};
