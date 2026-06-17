import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { FloatNav } from './components/FloatNav';
import { FeedCard } from './components/FeedCard';
import { NewPostForm } from './components/NewPostForm';
import { CommentSection } from './components/CommentSection';
import { AdminPanel } from './components/AdminPanel';
import { AuthModals } from './components/AuthModals';
import { TrendTalkLogo } from './components/TrendTalkLogo';
import { 
  Sparkles, Search, MessageSquare, Heart, Bookmark, Bell, Award, 
  ArrowLeft, Check, Edit2, Camera, Plus, RotateCcw, AlertTriangle, Users,
  ListFilter, Shield, Compass, BadgeHelp, CheckCircle, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function TrendTalkAppContent() {
  const {
    posts,
    users,
    comments,
    notifications,
    currentUser,
    darkMode,
    activeTab,
    selectedPostId,
    activeProfileId,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setSelectedPostId,
    setActiveProfileId,
    followUser,
    markNotificationsRead,
    updateProfile,
    unblockUser
  } = useApp();

  // Search input and Category state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile edit fields
  const [editDisplay, setEditDisplay] = useState(currentUser?.displayName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editBanner, setEditBanner] = useState(currentUser?.bannerColor || '');

  // Auth Overlay toggler
  const [showAuthModal, setShowAuthModal] = useState(!currentUser);

  // Suggested hashtags
  const SUGGESTED_HASHTAGS = ['design', 'uiux', 'developerlife', 'startup', 'trends', 'joke', 'mentalhealth'];

  // Infinite scroll pagination state
  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination count when activeTab, activeCategoryFilter, or searchQuery changes
  useEffect(() => {
    setVisiblePostsCount(5);
  }, [activeTab, activeCategoryFilter, searchQuery]);

  useEffect(() => {
    const currentObserverRef = observerRef.current;
    if (!currentObserverRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setVisiblePostsCount((prev) => prev + 5);
        }
      },
      {
        root: null,
        rootMargin: '120px',
        threshold: 0.1,
      }
    );

    observer.observe(currentObserverRef);

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [visiblePostsCount]);

  // Calculate trending score dynamically: (likes * 4) + (comments * 6) + (shares * 3)
  const getTrendingScore = (post: any) => {
    const postComments = comments.filter(c => c.postId === post.id);
    return (post.likes.length * 4) + (postComments.length * 6) + (post.sharesCount * 3);
  };

  // Get active lists based on tab
  const getFilteredPosts = () => {
    let list = [...posts];

    // Search query matching
    if (searchQuery.trim()) {
      const canonicalSearch = searchQuery.toLowerCase().replace('#', '').trim();
      list = list.filter(p => 
        p.content.toLowerCase().includes(canonicalSearch) ||
        p.hashtags.some(tag => tag.toLowerCase().includes(canonicalSearch)) ||
        p.userId.includes(canonicalSearch)
      );
    }

    // Category filtering
    if (activeCategoryFilter !== 'all') {
      list = list.filter(p => p.category === activeCategoryFilter);
    }

    // Tab specific ordering/scoping
    if (activeTab === 'trending') {
      list.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
    } else if (activeTab === 'bookmarks') {
      if (currentUser) {
        list = list.filter(p => p.bookmarks.includes(currentUser.id));
      } else {
        list = [];
      }
    } else {
      // General feed prioritizes pinned posts, then newest
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list;
  };

  const getProfileSpecificPosts = (profileId: string) => {
    // Get posts created by this profile
    const list = posts.filter(p => p.userId === profileId);
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  };

  const activeProfileUser = users.find(u => u.id === activeProfileId);
  const activeSuggestedCreators = users
    .filter(u => currentUser ? u.id !== currentUser.id : true)
    .slice(0, 4);

  const startProfileEditing = () => {
    if (!currentUser) return;
    setEditDisplay(currentUser.displayName);
    setEditBio(currentUser.bio);
    setEditAvatar(currentUser.avatar);
    setEditBanner(currentUser.bannerColor);
    setIsEditingProfile(true);
  };

  const handleSaveProfileEdit = () => {
    updateProfile(editDisplay, editBio, editAvatar, editBanner);
    setIsEditingProfile(false);
  };

  const currentPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${darkMode ? 'dark bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-zinc-900'}`}>
      
      {/* Decorative Red Accent Stripes background decoration */}
      <div className="fixed top-0 left-0 right-0 h-[5px] bg-[#FF3B30] z-50"></div>
      <div className="absolute top-0 right-0 w-32 h-screen bg-[#FF3B30] opacity-5 -skew-x-12 translate-x-16 pointer-events-none"></div>
      <div className="absolute top-0 right-12 w-1 h-screen bg-[#FF3B30] opacity-10 pointer-events-none"></div>

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
        
        {/* Top Header Deck */}
        <header className="flex items-center justify-between py-4 mb-6 relative z-10">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setActiveTab('feed');
              setSelectedPostId(null);
              setActiveProfileId(null);
              setSearchQuery('');
              setActiveCategoryFilter('all');
            }}
          >
            <TrendTalkLogo size={44} />
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                Trend<span className="text-[#FF3B30]">Talk</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-extrabold text-zinc-400 dark:text-zinc-500">
                Glassmorphism Discussions
              </span>
            </div>
          </div>

          {/* Quick Stats / Session Options */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div 
                className="flex items-center gap-2.5 bg-white/50 backdrop-blur-md dark:bg-zinc-900/40 border border-white/20 dark:border-zinc-800/40 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition"
                onClick={() => {
                  setActiveTab('profile');
                  setActiveProfileId(currentUser.id);
                  setSelectedPostId(null);
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.displayName} 
                  className="w-7 h-7 rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5">
                    {currentUser.displayName}
                    {currentUser.isVerified && <CheckCircle className="w-3.5 h-3.5 text-[#FF3B30]" />}
                  </div>
                  <div className="text-[10px] text-zinc-500">@{currentUser.username}</div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 bg-[#FF3B30] text-xs font-extrabold uppercase tracking-wide text-white rounded-full shadow-md shadow-red-500/15 hover:bg-red-600 transition"
              >
                Get Started
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Main Workspace Matrix layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel Sidebar Deck: Navigation, Categories, Banner (Desktop Only) */}
          <aside className="hidden lg:col-span-3 lg:flex flex-col gap-6 relative z-10 sticky top-6">
            
            {/* Search inputs deck */}
            <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Analyze trends..."
                  className="w-full bg-white dark:bg-zinc-800 rounded-2xl py-2 px-9 text-xs text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-red-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Instant suggested hashtag chips */}
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Popular tags:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_HASHTAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(`#${tag}`)}
                      className={`text-[10px] px-2 py-0.75 rounded-md font-bold transition ${
                        searchQuery.replace('#', '').toLowerCase() === tag 
                          ? 'bg-[#FF3B30] text-white' 
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category filter shortcuts links */}
            <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stream filters</div>
              {[
                { id: 'all', label: 'All Discussion Streams', emoji: '✨' },
                { id: 'thought', label: 'Daily Thoughts', emoji: '💭' },
                { id: 'opinion', label: 'Opinions & Debates', emoji: '🎙️' },
                { id: 'confession', label: 'Ghost Confessions', emoji: '👻' },
                { id: 'question', label: 'Q&A Forums', emoji: '❓' },
                { id: 'news', label: 'Latest News', emoji: '📰' },
                { id: 'joke', label: 'Witty Jokes', emoji: '😂' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveCategoryFilter(opt.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold transition-all duration-200 ${
                    activeCategoryFilter === opt.id
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30] translate-x-1'
                      : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-350'
                  }`}
                >
                  <span className="text-[14px]">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            
          </aside>

          {/* Central Workspace: Feeds, Post details, profiles, notifications */}
          <main className="col-span-1 lg:col-span-6 space-y-6 relative z-10">
            
            {/* Expanded Post Drilldown details panel */}
            <AnimatePresence mode="wait">
              {selectedPostId && currentPost ? (
                <motion.div
                  key="post-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Back to feed block */}
                  <button
                    onClick={() => setSelectedPostId(null)}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-[#FF3B30] transition duration-150 py-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to talk matrix
                  </button>

                  <FeedCard post={currentPost} expanded={true} />

                  <div className="backdrop-blur-md bg-white/40 dark:bg-zinc-800/40 border border-white/20 dark:border-zinc-700/20 rounded-3xl p-5 shadow-sm">
                    <CommentSection postId={currentPost.id} />
                  </div>
                </motion.div>
              ) : activeTab === 'notifications' ? (
                /* Notifications visual layout panel */
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="backdrop-blur-md bg-white/40 dark:bg-zinc-800/40 border border-white/20 dark:border-zinc-700/20 p-5 rounded-3xl shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div>
                      <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                        Alert notifications <Bell className="w-5 h-5 text-[#FF3B30]" />
                      </h2>
                      <p className="text-xs text-zinc-500">Uncover who liked your talk index, followed, or commented.</p>
                    </div>
                    {currentUser && (
                      <button
                        onClick={() => markNotificationsRead()}
                        className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-300 text-xs font-extrabold rounded-full transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {notifications.filter(n => n.recipientId === currentUser?.id).length === 0 ? (
                      <div className="text-center py-12 text-zinc-400 italic text-xs">
                        No notifications tracked. When people interact with you, updates show here.
                      </div>
                    ) : (
                      notifications
                        .filter(n => n.recipientId === currentUser?.id)
                        .map((notif) => {
                          const senderObj = users.find(u => u.id === notif.senderId) || {
                            username: 'TrendTalk System',
                            displayName: 'TrendTalk Support',
                            avatar: ''
                          };
                          
                          const postTarget = posts.find(p => p.id === notif.postId);

                          let actionText = '';
                          if (notif.type === 'like') actionText = 'liked your post';
                          else if (notif.type === 'comment') actionText = 'commented on your post';
                          else if (notif.type === 'follow') actionText = 'started following your updates';
                          else if (notif.type === 'reply') actionText = 'replied to your discussion';
                          else if (notif.type === 'mention') actionText = 'mentioned you in a post';
                          else if (notif.type === 'report_action') actionText = notif.details || 'Community Safety notice';

                          return (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                if (notif.postId) setSelectedPostId(notif.postId);
                              }}
                              className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition cursor-pointer hover:translate-x-0.5 duration-150 ${
                                notif.isRead 
                                  ? 'bg-white/10 dark:bg-zinc-900/10 border-zinc-100 dark:border-zinc-800/40 opacity-75' 
                                  : 'bg-[#FF3B30]/5 dark:bg-[#FF3B30]/10 border-red-500/20'
                              }`}
                            >
                              {notif.senderId === 'system' ? (
                                <div className="p-2 bg-red-100 text-[#FF3B30] rounded-full">
                                  <Shield className="w-5 h-5" />
                                </div>
                              ) : (
                                <img src={senderObj.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm" referrerPolicy="no-referrer" />
                              )}
                              
                              <div className="flex-1 text-left">
                                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                  {notif.senderId === 'system' ? senderObj.displayName : `@${senderObj.username}`}
                                </div>
                                <p className="text-xs text-zinc-650 dark:text-zinc-300 mt-0.5">{actionText}</p>
                                
                                {postTarget && (
                                  <div className="mt-2 text-[11px] bg-white/30 dark:bg-zinc-900/40 p-2 rounded-lg border border-white/20 dark:border-zinc-800/20 line-clamp-2 text-zinc-500 dark:text-zinc-400">
                                    "{postTarget.content}"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </motion.div>
              ) : activeTab === 'profile' && activeProfileUser ? (
                /* Profile Visual View */
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 rounded-[32px] overflow-hidden shadow-sm">
                    {/* Cover Banner */}
                    <div 
                      className="h-28 sm:h-36 relative"
                      style={{ background: activeProfileUser.bannerColor }}
                    />

                    {/* Profile details metrics block */}
                    <div className="p-5 pt-0 relative space-y-4">
                      {/* Avatar shifting up into the banner */}
                      <div className="flex justify-between items-end -mt-10 sm:-mt-14 mb-2">
                        <img
                          src={activeProfileUser.avatar}
                          alt={activeProfileUser.displayName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex gap-2">
                          {currentUser && currentUser.id === activeProfileUser.id ? (
                            <button
                              onClick={startProfileEditing}
                              className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-700 dark:hover:bg-zinc-650 text-zinc-800 dark:text-zinc-100 font-bold text-xs rounded-full transition flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                            </button>
                          ) : currentUser && (
                            <button
                              onClick={() => followUser(activeProfileUser.id)}
                              className={`px-4 py-1.5 font-extrabold text-xs rounded-full transition ${
                                currentUser.following.includes(activeProfileUser.id)
                                  ? 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20'
                                  : 'bg-[#FF3B30] text-white hover:bg-red-600 shadow-md shadow-red-500/10'
                              }`}
                            >
                              {currentUser.following.includes(activeProfileUser.id) ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Info */}
                      <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                          {activeProfileUser.displayName}
                          {activeProfileUser.isVerified && (
                            <CheckCircle className="w-5 h-5 text-[#FF3B30]" />
                          )}
                        </h2>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">@{activeProfileUser.username}</div>
                      </div>

                      {/* Bio details */}
                      {activeProfileUser.bio ? (
                        <p className="text-xs sm:text-sm text-zinc-750 dark:text-zinc-200 leading-relaxed font-sans mt-2 whitespace-pre-wrap">
                          {activeProfileUser.bio}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">No bio has been added yet.</p>
                      )}

                      {/* Follow stats cards */}
                      <div className="flex gap-6 pt-2 text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-bold">
                        <div>
                          <span className="text-base font-black text-zinc-900 dark:text-white mr-1">
                            {activeProfileUser.following.length}
                          </span>
                          Following
                        </div>
                        <div>
                          <span className="text-base font-black text-zinc-900 dark:text-white mr-1">
                            {activeProfileUser.followers.length}
                          </span>
                          Followers
                        </div>
                        <div className="text-zinc-450 text-[11px] font-medium self-center mt-0.5 block ml-auto">
                          Joined {new Date(activeProfileUser.joinDate).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit profile dialog modal rendering inline */}
                  <AnimatePresence>
                    {isEditingProfile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="backdrop-blur-md bg-white/50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 space-y-4"
                      >
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Edit Profile Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Display Name</label>
                            <input
                              type="text"
                              value={editDisplay}
                              onChange={e => setEditDisplay(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-800 border rounded-lg p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Avatar Profile Photo Link</label>
                            <input
                              type="text"
                              value={editAvatar}
                              onChange={e => setEditAvatar(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-800 border rounded-lg p-2 text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Custom Banner Style (color/gradient)</label>
                            <input
                              type="text"
                              value={editBanner}
                              onChange={e => setEditBanner(e.target.value)}
                              placeholder="linear-gradient(...) or hex"
                              className="w-full bg-white dark:bg-zinc-800 border rounded-lg p-2 text-xs font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Short Bio description</label>
                            <textarea
                              value={editBio}
                              onChange={e => setEditBio(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-800 border rounded-lg p-2 text-xs"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="px-3.5 py-1 text-xs bg-zinc-200 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfileEdit}
                            className="px-3.5 py-1 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                          >
                            Save Details
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* List of posts created by this profile creator */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3B30] pl-1">
                      Updates Shared ({getProfileSpecificPosts(activeProfileUser.id).length})
                    </h3>

                    {getProfileSpecificPosts(activeProfileUser.id).length === 0 ? (
                      <div className="text-center py-12 backdrop-blur-md bg-white/10 dark:bg-zinc-800/10 rounded-2xl text-zinc-400 text-xs italic">
                        No TrendTalks currently shared by this creator.
                      </div>
                    ) : (
                      getProfileSpecificPosts(activeProfileUser.id).map(post => (
                        <FeedCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                </motion.div>
              ) : activeTab === 'admin' ? (
                /* Administration dashboard */
                <motion.div
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AdminPanel />
                </motion.div>
              ) : (
                /* Main Stream Tab (Feed, Bookmarks, Trending) */
                <div className="space-y-6">
                  
                  {/* Hero animated background welcome card */}
                  {activeTab === 'feed' && !searchQuery && (
                    <div className="relative overflow-hidden backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-8 rounded-[32px] shadow-sm text-left relative group">
                      
                      {/* Interactive Moving red circle accent decor background */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF3B30]/10 rounded-full blur-2xl group-hover:bg-[#FF3B30]/15 transition duration-500"></div>

                      <div className="space-y-3 max-w-lg relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-[11px] font-black uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" /> Sparking Conversations ✦
                        </div>
                        <h1 className="text-2xl sm:text-3.5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                          Where Global <span className="text-[#FF3B30]">Trends</span> Talk.
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                          Share thoughts, opinions, deep questions, confessions, jokes, and news in a premium, ultra-sleek glassmorphic atmosphere. Let's make discussions trend!
                        </p>
                      </div>

                      {/* Accent red corner stripe decoration requested */}
                      <div className="absolute right-0 bottom-0 w-24 h-1 bg-[#FF3B30]/40"></div>
                    </div>
                  )}

                  {/* Search query notice */}
                  {searchQuery && (
                    <div className="flex justify-between items-center bg-white/20 dark:bg-zinc-900/30 border border-white/20 p-4 rounded-2xl mb-4">
                      <div className="text-xs text-zinc-500">
                        Analyzing talk indices for <strong className="text-[#FF3B30] font-bold">"{searchQuery}"</strong> ({getFilteredPosts().length} matching)
                      </div>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[#FF3B30] font-bold hover:underline"
                      >
                        Reset search
                      </button>
                    </div>
                  )}

                  {/* NewPostForm Compositor */}
                  {currentUser && activeTab === 'feed' && !searchQuery && (
                    <NewPostForm />
                  )}

                  {/* Header visual list categories switcher for Mobile */}
                  <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {['all', 'thought', 'opinion', 'confession', 'question', 'news', 'joke'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0 ${
                          activeCategoryFilter === cat
                            ? 'bg-[#FF3B30] text-white'
                            : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-650 dark:text-zinc-300'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Feed stream of posts */}
                  <div className="space-y-4">
                    {(() => {
                      const filteredPosts = getFilteredPosts();
                      const visiblePosts = filteredPosts.slice(0, visiblePostsCount);
                      const hasMorePosts = visiblePostsCount < filteredPosts.length;

                      if (filteredPosts.length === 0) {
                        return (
                          <div className="text-center py-20 backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 rounded-[32px] border border-white/80 dark:border-zinc-800/80 p-8">
                            <Compass className="w-10 h-10 mx-auto text-[#FF3B30] opacity-40 mb-3 animate-spin duration-30.0" />
                            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nothing currently trending here</h4>
                            <p className="text-xs text-zinc-500 mt-1">Try toggling another filters, tags or share a fresh talk topic!</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {visiblePosts.map(post => (
                            <FeedCard key={post.id} post={post} />
                          ))}
                          
                          {/* Intersection Observer Trigger */}
                          {hasMorePosts && (
                            <div 
                              ref={observerRef} 
                              className="flex items-center justify-center py-8 text-xs text-zinc-400 font-medium font-mono gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-ping"></span>
                              <span>Loading more trends...</span>
                            </div>
                          )}

                          {!hasMorePosts && filteredPosts.length > 5 && (
                            <div className="text-center py-6 text-[10.5px] text-zinc-400 font-sans tracking-wide">
                              All trends loaded ✦ You're fully caught up
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                </div>
              )}
            </AnimatePresence>

          </main>

          {/* Right Panel Sidebar deck: Who to follow recommendations & trending statistics */}
          <aside className="col-span-1 lg:col-span-3 flex flex-col gap-6 relative z-10 sticky top-6">
            
            {/* Quick auth details if logged out */}
            {!currentUser && (
              <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm space-y-4 text-center">
                <Sparkles className="w-7 h-7 mx-auto text-[#FF3B30]" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-white">Begin talking trends</h3>
                  <p className="text-xs text-zinc-500 mt-1">Compose thoughts, reply to confessions, upvote latest news.</p>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 bg-[#FF3B30] hover:bg-red-600 text-white font-bold text-xs rounded-xl transition"
                >
                  Join TrendTalk Now
                </button>
              </div>
            )}

            {/* Popular creators deck recommended users section */}
            <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm space-y-3.5">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Popular Creators</div>
              
              <div className="space-y-3">
                {activeSuggestedCreators.map((creator) => {
                  const isFollowing = currentUser ? currentUser.following.includes(creator.id) : false;
                  return (
                    <div key={creator.id} className="flex items-center justify-between gap-2 text-left">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-85"
                        onClick={() => {
                          setActiveProfileId(creator.id);
                          setActiveTab('profile');
                          setSelectedPostId(null);
                        }}
                      >
                        <img src={creator.avatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5">
                            {creator.displayName}
                            {creator.isVerified && <Check className="w-3 h-3 text-[#FF3B30] stroke-3" />}
                          </div>
                          <div className="text-[10px] text-zinc-400">@{creator.username}</div>
                        </div>
                      </div>

                      {currentUser && currentUser.id !== creator.id && (
                        <button
                          onClick={() => followUser(creator.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition ${
                            isFollowing
                              ? 'bg-zinc-100 hover:bg-zinc-205 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                              : 'bg-[#FF3B30] hover:bg-red-600 text-white shadow-sm shadow-red-500/10'
                          }`}
                        >
                          {isFollowing ? 'Joined' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending hashtag listing */}
            <div className="backdrop-blur-lg bg-white/70 dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 p-6 rounded-[32px] shadow-sm space-y-3 text-left">
              <div className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400">Trending Statistics</div>
              
              <div className="space-y-2.5">
                {[
                  { tag: 'design', views: '2.5k talks', category: 'Design/UI' },
                  { tag: 'developerlife', views: '1.9k talks', category: 'Tech' },
                  { tag: 'confession', views: '1.4k talks', category: 'Rumors' },
                  { tag: 'startup', views: '1.2k talks', category: 'Business' },
                  { tag: 'mentalhealth', views: '890 talks', category: 'Discussion' },
                ].map((stat, sIdx) => (
                  <div 
                    key={sIdx} 
                    onClick={() => setSearchQuery(`#${stat.tag}`)}
                    className="group cursor-pointer hover:bg-white/10 p-1.5 rounded-lg transition-all duration-150"
                  >
                    <div className="text-[10px] text-zinc-400 font-semibold">{stat.category} • Trending</div>
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#FF3B30] flex items-center justify-between">
                      <span>#{stat.tag}</span>
                      <span className="text-[10px] text-zinc-400 font-medium font-mono">{stat.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform rules notice footer */}
            <div className="text-[10.5px] text-zinc-400 pl-2">
              TrendTalk ✦ Glassmorphism Startup © 2026. Created by Rudra Seth.
            </div>

          </aside>

        </div>

        {/* Global Minimalist Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-200/40 dark:border-zinc-850/40 text-center space-y-1 z-10 relative">
          <div className="text-xs font-black tracking-widest text-[#FF3B30] uppercase">
            Created by Rudra Seth
          </div>
          <div className="text-[10px] text-zinc-400 font-medium tracking-tight">
            TrendTalk © 2026 ✦ Minimalist Glassmorphism Social Network
          </div>
        </footer>

      </div>

      {/* Floating navigation bar */}
      <FloatNav />

      {/* Floating authentication overlay modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (currentUser) setShowAuthModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <AuthModals onSuccess={() => setShowAuthModal(false)} />
              
              {currentUser && (
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white/50 backdrop-blur dark:bg-zinc-800/40 p-2.5 rounded-full border"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TrendTalkAppContent />
    </AppProvider>
  );
}
