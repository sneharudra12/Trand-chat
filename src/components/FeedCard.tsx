import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Post, User } from '../types';
import { Heart, MessageSquare, Bookmark, Share2, Pin, Trash2, Edit3, Flag, CheckCircle, ShieldAlert, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedCardProps {
  post: Post;
  expanded?: boolean;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, expanded = false }) => {
  const {
    currentUser,
    users,
    comments,
    toggleLikePost,
    toggleBookmarkPost,
    incrementShare,
    togglePinPost,
    deletePost,
    editPost,
    reportItem,
    setActiveProfileId,
    setActiveTab,
    setSelectedPostId,
    setSearchQuery,
    followUser
  } = useApp();

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<'copied' | 'shared' | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState(post.category);

  // Author details
  const author = users.find(u => u.id === post.userId) || {
    id: 'unknown',
    username: 'someone',
    displayName: 'Anonymous Talker',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isVerified: false,
    isAdmin: false,
  };

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarks.includes(currentUser.id) : false;
  const isOwner = currentUser ? currentUser.id === post.userId : false;
  const isAdmin = currentUser ? currentUser.isAdmin : false;

  const postComments = comments.filter(c => c.postId === post.id && !c.parentId);
  const totalCommentsCount = comments.filter(c => c.postId === post.id).length;

  // Nice date formatter
  const formatTime = (isoString: string) => {
    try {
      const past = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 600);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${Math.max(1, diffHours)}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Some time ago';
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `TrendTalk Post by @${author.username}`,
      text: post.content.length > 120 ? `${post.content.slice(0, 120)}...` : post.content,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        incrementShare(post.id);
        setShareStatus('shared');
        setTimeout(() => setShareStatus(null), 2000);
      } catch (err) {
        console.log('Native share failed or dismissed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        incrementShare(post.id);
        setShareStatus('copied');
        setTimeout(() => setShareStatus(null), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    reportItem(post.id, 'post', reportReason);
    setIsReporting(false);
    setShowReportSuccess(true);
    setTimeout(() => setShowReportSuccess(false), 3000);
  };

  const handleApplyEdit = () => {
    if (!editContent.trim()) return;
    editPost(post.id, editContent, editCategory);
    setIsEditing(false);
  };

  const handleHashtagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery(tag);
    setActiveTab('feed');
    setSelectedPostId(null);
  };

  const handleMentionClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanUser = username.replace('@', '').toLowerCase();
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser);
    if (foundUser) {
      setActiveProfileId(foundUser.id);
      setActiveTab('profile');
      setSelectedPostId(null);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProfileId(author.id);
    setActiveTab('profile');
    setSelectedPostId(null);
  };

  // Turn #hashtags and @mentions into inline clickables
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith('#') && part.length > 1) {
        return (
          <span
            key={idx}
            onClick={(e) => handleHashtagClick(part, e)}
            className="text-[#FF3B30] hover:underline cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span
            key={idx}
            onClick={(e) => handleMentionClick(part, e)}
            className="text-blue-500 hover:underline cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const categoryColors: Record<string, { bg: string, text: string }> = {
    thought: { bg: 'bg-[#FF3B30]/10 text-[#FF3B30]', text: 'Thought' },
    opinion: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', text: 'Opinion' },
    confession: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', text: 'Confession' },
    question: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', text: 'Question' },
    news: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', text: 'News' },
    joke: { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', text: 'Joke' },
    discussion: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', text: 'Discussion' },
  };

  const currentCategoryMeta = categoryColors[post.category] || { bg: 'bg-gray-100 text-gray-800', text: 'Discussion' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`relative backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 rounded-[32px] p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
        post.isPinned ? 'ring-1.5 ring-[#FF3B30]/50' : ''
      }`}
      onClick={() => {
        if (!expanded) setSelectedPostId(post.id);
      }}
      id={`feed-post-${post.id}`}
    >
      {/* Pin Ribbon Indicator */}
      {post.isPinned && (
        <div className="absolute top-4 right-14 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#FF3B30]">
          <Pin className="w-3 h-3 fill-current rotate-45" /> Pinned
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar}
            alt={author.displayName}
            className="w-11 h-11 rounded-full object-cover border-2 border-white/70 shadow-sm cursor-pointer hover:scale-105 transition-all duration-200"
            referrerPolicy="no-referrer"
            onClick={handleUserClick}
          />
          <div>
            <div className="flex items-center gap-1">
              <span 
                className="font-bold text-zinc-800 dark:text-zinc-100 cursor-pointer hover:underline text-[15px]"
                onClick={handleUserClick}
              >
                {author.displayName}
              </span>
              {author.isVerified && (
                <CheckCircle className="w-4 h-4 text-[#FF3B30] fill-red-100 dark:fill-none" />
              )}
              {author.isAdmin && (
                <span className="text-[9px] uppercase tracking-widest bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 border font-extrabold px-1.5 py-0.5 rounded ml-1">
                  Staff
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="cursor-pointer hover:text-[#FF3B30]" onClick={handleUserClick}>
                @{author.username}
              </span>
              <span>•</span>
              <span>{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Category Badge */}
        <span className={`text-[11px] font-semibold px-2.5 py-0.75 rounded-full ${currentCategoryMeta.bg}`}>
          {currentCategoryMeta.text}
        </span>
      </div>

      {/* Editor Block */}
      {isEditing ? (
        <div className="space-y-3 my-3 bg-white/20 dark:bg-zinc-900/20 p-3 rounded-xl border border-white/10" onClick={e => e.stopPropagation()}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-red-400 outline-none"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as any)}
              className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs"
            >
              <option value="thought">Thought</option>
              <option value="opinion">Opinion</option>
              <option value="confession">Confession</option>
              <option value="question">Question</option>
              <option value="news">News</option>
              <option value="joke">Joke</option>
              <option value="discussion">Discussion</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyEdit}
                className="px-3 py-1 bg-[#FF3B30] hover:bg-[#E03025] text-white rounded text-xs transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Content Panel */
        <div className="my-3 font-sans text-[14.5px] text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap select-text">
          {renderFormattedContent(post.content)}
        </div>
      )}

      {/* Attached Post Media Image with smooth hover scaling */}
      {post.image && !isEditing && (
        <div className="my-4 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 max-h-96">
          <img
            src={post.image}
            alt="TrendTalk Upload"
            className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-[1.025]"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Horizontal Line separating and cleaning structure */}
      <hr className="border-t border-zinc-100 dark:border-zinc-800/70 my-3.5" />

      {/* Buttons Deck */}
      <div className="flex items-center justify-between mt-3 text-zinc-400">
        <div className="flex items-center gap-1 sm:gap-4 flex-1">
          {/* Like Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentUser) toggleLikePost(post.id);
            }}
            disabled={!currentUser}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              isLiked 
                ? 'text-[#FF3B30] bg-red-500/10 scale-105' 
                : 'hover:text-[#FF3B30] hover:bg-red-500/5'
            }`}
            id={`like-btn-${post.id}`}
          >
            <motion.div whileTap={{ scale: 1.4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span className="text-xs font-semibold">{post.likes.length}</span>
          </button>

          {/* Comment Bubble */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPostId(post.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="text-xs font-semibold">{totalCommentsCount}</span>
          </button>

          {/* Bookmark */}
          {currentUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmarkPost(post.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                isBookmarked 
                  ? 'text-yellow-500 bg-yellow-500/10' 
                  : 'hover:text-yellow-500 hover:bg-yellow-500/5'
              }`}
            >
              <Bookmark className={`w-4.5 h-4.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-emerald-500 hover:bg-emerald-500/5 transition-all duration-200"
            title="Share Post"
          >
            <Share2 className="w-4.5 h-4.5" />
            {shareStatus && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce font-medium">
                {shareStatus === 'copied' ? 'Link Copied!' : 'Post Shared!'}
              </span>
            )}
          </button>
        </div>

        {/* User Specific Management Options (Owner controls & reports) */}
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {isOwner && (
            <button
              onClick={() => togglePinPost(post.id)}
              className={`p-1.5 rounded-full hover:text-orange-500 transition-colors ${
                post.isPinned ? 'text-[#FF3B30]' : 'text-zinc-400'
              }`}
              title={post.isPinned ? 'Unpin' : 'Pin to profile'}
            >
              <Pin className="w-4 h-4 rotate-45" />
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-full hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-all duration-200"
              title="Edit Post"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {(isOwner || isAdmin) && (
            <button
              onClick={() => {
                if (confirm('Delete this post permanently?')) {
                  deletePost(post.id);
                }
              }}
              className="p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
              title="Delete Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!isOwner && currentUser && (
            <button
              onClick={() => setIsReporting(true)}
              className="p-1.5 rounded-full hover:bg-yellow-500/10 hover:text-yellow-600 transition-all duration-200"
              title="Report Post"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reporting Prompt Overlay inside Card for simplicity yet beautiful UI */}
      <AnimatePresence>
        {isReporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-yellow-500" /> Report Post
              </h4>
              <button onClick={() => setIsReporting(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveReport} className="space-y-3">
              <p className="text-xs text-zinc-500">Why are you reporting this content to TrendTalk staff?</p>
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                required
              >
                <option value="">-- Choose reason --</option>
                <option value="Spam">Spam or excessive duplication</option>
                <option value="Harassment">Hate speech or harassment</option>
                <option value="Inappropriate">Explicit or inappropriate content</option>
                <option value="Misinformation">Harmful misinformation</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-3 py-1 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Short Feedback Toast */}
      {showReportSuccess && (
        <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 p-2 rounded-lg text-center font-medium animate-pulse">
          Thank you. Content flagged for staff verification.
        </div>
      )}
    </motion.div>
  );
};
