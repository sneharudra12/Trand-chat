import React, { useState } from 'react';
import { useApp } from './AppContext';
import { PostCategory } from '../types';
import { Image, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NewPostForm: React.FC = () => {
  const { createPost, currentUser } = useApp();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('thought');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cool preset background images to make mockups look stunning instantly
  const presetImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', // abstract pink wave
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80', // tech code mesh
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80', // neon red gradient
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'  // cosmic blend
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost(content.trim(), category, imageUrl || undefined);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const categoryOptions: { value: PostCategory; label: string; emoji: string }[] = [
    { value: 'thought', label: 'Thought', emoji: '💭' },
    { value: 'opinion', label: 'Opinion', emoji: '🎙️' },
    { value: 'confession', label: 'Confession', emoji: '👻' },
    { value: 'question', label: 'Question', emoji: '❓' },
    { value: 'news', label: 'News', emoji: '📰' },
    { value: 'joke', label: 'Joke', emoji: '😂' },
    { value: 'discussion', label: 'Discussion', emoji: '💬' },
  ];

  if (!currentUser) return null;

  const isBlocked = currentUser.blockedUsers.includes('admin-blocked');

  if (isBlocked) {
    return (
      <div className="backdrop-blur-md bg-red-100/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-3 text-red-500 text-xs">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Posting restrictions applied</h4>
          <p className="text-[11px] opacity-80">This account has been flagged and suspended for safety. Please audit active violations in your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <img
            src={currentUser.avatar}
            alt="My Profile"
            className="w-10 h-10 rounded-full object-cover border border-white"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Share an opinion, secret confession, or question, @${currentUser.displayName}...`}
              className="w-full bg-transparent text-[14px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 outline-none resize-none pt-2"
              rows={3}
              maxLength={280}
              required
            />
          </div>
        </div>

        {/* Categories Pills section */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 items-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1.5">Focus:</span>
          {categoryOptions.map((opt) => {
            const isSelected = category === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#FF3B30] text-white scale-103 shadow-md shadow-red-500/10'
                    : 'bg-zinc-100/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle Image Panel */}
        <AnimatePresence>
          {showImageInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  Attach Visual Background or Image URL
                </span>
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Hide
                </button>
              </div>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Insert custom Unsplash or web photo link..."
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-red-400 outline-none"
              />

              <div className="space-y-1">
                <div className="text-[10px] text-zinc-400 font-medium">Or quick-click visual themes:</div>
                <div className="flex gap-2">
                  {presetImages.map((pImg, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setImageUrl(pImg)}
                      className={`w-12 h-10 rounded-md overflow-hidden border-2 transition ${
                        imageUrl === pImg ? 'border-[#FF3B30] scale-105' : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={pImg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons submission toolbar */}
        <div className="flex justify-between items-center pt-2.5">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                showImageInput 
                  ? 'bg-red-500/10 text-[#FF3B30]' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200'
              }`}
              title="Add Image"
            >
              <Image className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10.5px] font-bold ${content.length > 250 ? 'text-[#FF3B30]' : 'text-zinc-400'}`}>
              {content.length}/280
            </span>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-[#FF3B30] hover:bg-[#E03025] active:scale-97 text-white font-extrabold text-xs tracking-wider rounded-2xl flex items-center gap-1.5 transition disabled:opacity-40 select-none uppercase shadow-md shadow-red-500/10"
            >
              <Send className="w-3.5 h-3.5" /> Share Talk
            </button>
          </div>
        </div>
      </form>

      {/* Success notification panel */}
      {success && (
        <div className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 p-2.5 rounded-xl text-center font-bold animate-pulse">
          ⚡️ TrendTalk shared! Processing hashtags and viral indices.
        </div>
      )}
    </div>
  );
};
