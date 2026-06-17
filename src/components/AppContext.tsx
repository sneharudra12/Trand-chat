import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Comment, Notification, PostCategory, NotificationType } from '../types';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS } from '../data';

interface AppContextType {
  users: User[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  currentUser: User | null;
  darkMode: boolean;
  activeTab: string; // 'feed' | 'trending' | 'notifications' | 'profile' | 'admin' | 'bookmarks'
  selectedPostId: string | null; // For drill-down post view
  activeProfileId: string | null; // For viewing someone's profile
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedPostId: (id: string | null) => void;
  setActiveProfileId: (id: string | null) => void;
  setDarkMode: (val: boolean) => void;
  login: (username: string) => { success: boolean; error?: string };
  signup: (displayName: string, username: string, email: string) => { success: boolean; error?: string };
  logout: () => void;
  onboardUser: (bio: string, avatar: string, bannerColor: string) => void;
  updateProfile: (displayName: string, bio: string, avatar: string, bannerColor: string) => void;
  createPost: (content: string, category: PostCategory, image?: string, hashtags?: string[]) => string;
  editPost: (postId: string, content: string, category: PostCategory, hashtags?: string[]) => void;
  deletePost: (postId: string) => void;
  togglePinPost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  incrementShare: (postId: string) => void;
  addComment: (postId: string, content: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
  reportItem: (itemId: string, itemType: 'post' | 'comment', reason: string) => void;
  moderateItem: (itemId: string, itemType: 'post' | 'comment', action: 'keep' | 'delete') => void;
  followUser: (userIdToFollow: string) => void;
  blockUser: (userIdToBlock: string) => void;
  unblockUser: (userIdToUnblock: string) => void;
  triggerSystemNotification: (recipientId: string, details: string) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [darkMode, setDarkModeState] = useState<boolean>(false);

  // Viewport/Tabs navigation state
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hydrate from localStorage or use Mock Initial Seeds
  useEffect(() => {
    const savedUsers = localStorage.getItem('tt_users');
    const savedPosts = localStorage.getItem('tt_posts');
    const savedComments = localStorage.getItem('tt_comments');
    const savedNotifications = localStorage.getItem('tt_notifications');
    const savedCurrentUser = localStorage.getItem('tt_current_user');
    const savedDarkMode = localStorage.getItem('tt_dark_mode');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else setUsers(INITIAL_USERS);

    if (savedPosts) setPosts(JSON.parse(savedPosts));
    else setPosts(INITIAL_POSTS);

    if (savedComments) setComments(JSON.parse(savedComments));
    else setComments(INITIAL_COMMENTS);

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    else setNotifications(INITIAL_NOTIFICATIONS);

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    } else {
      setCurrentUser(null);
    }

    if (savedDarkMode) {
      setDarkModeState(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save changes to localStorage on states update
  const saveState = (
    updatedUsers: User[],
    updatedPosts: Post[],
    updatedComments: Comment[],
    updatedNotifications: Notification[],
    updatedCurrentUser: User | null
  ) => {
    localStorage.setItem('tt_users', JSON.stringify(updatedUsers));
    localStorage.setItem('tt_posts', JSON.stringify(updatedPosts));
    localStorage.setItem('tt_comments', JSON.stringify(updatedComments));
    localStorage.setItem('tt_notifications', JSON.stringify(updatedNotifications));
    if (updatedCurrentUser) {
      localStorage.setItem('tt_current_user', JSON.stringify(updatedCurrentUser));
    } else {
      localStorage.removeItem('tt_current_user');
    }
  };

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    localStorage.setItem('tt_dark_mode', JSON.stringify(val));
  };

  // Auth Functions
  const login = (username: string) => {
    const canonical = username.trim().toLowerCase().replace('@', '');
    const found = users.find(u => u.username.toLowerCase() === canonical);
    if (found) {
      setCurrentUser(found);
      saveState(users, posts, comments, notifications, found);
      return { success: true };
    }
    return { success: false, error: 'User not found. Try signing up or logging in with "admin" or "clara_tech"!' };
  };

  const signup = (displayName: string, username: string, email: string) => {
    const canonical = username.trim().toLowerCase().replace('@', '');
    if (!displayName.trim() || !canonical || !email.trim()) {
      return { success: false, error: 'All fields are required!' };
    }
    if (users.some(u => u.username.toLowerCase() === canonical)) {
      return { success: false, error: 'Username is already taken!' };
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: canonical,
      displayName: displayName.trim(),
      email: email.trim(),
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80`, // placeholder
      bio: '',
      joinDate: new Date().toISOString(),
      followers: [],
      following: [],
      isVerified: false,
      isAdmin: false,
      blockedUsers: [],
      bannerColor: 'linear-gradient(135deg, #FF3B30, #007aff)',
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setCurrentUser(newUser);
    saveState(nextUsers, posts, comments, notifications, newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    saveState(users, posts, comments, notifications, null);
    setActiveTab('feed');
    setSelectedPostId(null);
    setActiveProfileId(null);
  };

  const onboardUser = (bio: string, avatar: string, bannerColor: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      bio: bio.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      bannerColor: bannerColor || currentUser.bannerColor,
    };
    const nextUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(nextUsers);
    setCurrentUser(updatedUser);
    saveState(nextUsers, posts, comments, notifications, updatedUser);
  };

  const updateProfile = (displayName: string, bio: string, avatar: string, bannerColor: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      bio: bio.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      bannerColor: bannerColor || currentUser.bannerColor,
    };
    const nextUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(nextUsers);
    setCurrentUser(updatedUser);
    saveState(nextUsers, posts, comments, notifications, updatedUser);
  };

  // Posts Functions
  const createPost = (content: string, category: PostCategory, image?: string, hashtags: string[] = []): string => {
    if (!currentUser) return '';
    // Auto extract hash tags from content too
    const matchHashtags = content.match(/#\w+/g);
    const extractedHashtags = matchHashtags 
      ? Array.from(new Set([...hashtags, ...matchHashtags.map(tag => tag.substring(1).toLowerCase())]))
      : hashtags;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      userId: currentUser.id,
      content,
      category,
      image,
      hashtags: extractedHashtags,
      createdAt: new Date().toISOString(),
      likes: [],
      bookmarks: [],
      sharesCount: 0,
      reportsCount: 0,
      reports: [],
    };

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    saveState(users, nextPosts, comments, notifications, currentUser);

    // Notify any mentioned users
    const mentions = content.match(/@\w+/g);
    if (mentions) {
      mentions.forEach(mention => {
        const targetUsername = mention.substring(1).toLowerCase();
        const targetUser = users.find(u => u.username.toLowerCase() === targetUsername);
        if (targetUser && targetUser.id !== currentUser.id) {
          triggerNotification(targetUser.id, currentUser.id, 'mention', newPost.id);
        }
      });
    }

    return newPost.id;
  };

  const editPost = (postId: string, content: string, category: PostCategory, hashtags: string[] = []) => {
    const matchHashtags = content.match(/#\w+/g);
    const extractedHashtags = matchHashtags 
      ? Array.from(new Set([...hashtags, ...matchHashtags.map(tag => tag.substring(1).toLowerCase())]))
      : hashtags;

    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          content,
          category,
          hashtags: extractedHashtags,
        };
      }
      return p;
    });
    setPosts(nextPosts);
    saveState(users, nextPosts, comments, notifications, currentUser);
  };

  const deletePost = (postId: string) => {
    const nextPosts = posts.filter(p => p.id !== postId);
    const nextComments = comments.filter(c => c.postId !== postId);
    const nextNotifications = notifications.filter(n => n.postId !== postId);
    setPosts(nextPosts);
    setComments(nextComments);
    setNotifications(nextNotifications);
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
    saveState(users, nextPosts, nextComments, nextNotifications, currentUser);
  };

  const togglePinPost = (postId: string) => {
    const nextPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, isPinned: !p.isPinned };
      }
      // Unpin other posts of the same user
      const item = posts.find(post => post.id === postId);
      if (item && p.userId === item.userId && p.id !== postId) {
        return { ...p, isPinned: false };
      }
      return p;
    });
    setPosts(nextPosts);
    saveState(users, nextPosts, comments, notifications, currentUser);
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(currentUser.id);
    const updatedLikes = hasLiked
      ? post.likes.filter(id => id !== currentUser.id)
      : [...post.likes, currentUser.id];

    const nextPosts = posts.map(p => p.id === postId ? { ...p, likes: updatedLikes } : p);
    setPosts(nextPosts);

    let nextNotifications = notifications;
    if (!hasLiked && post.userId !== currentUser.id) {
      // Trigger notification
      const notifId = `n-${Date.now()}`;
      const newNotif: Notification = {
        id: notifId,
        recipientId: post.userId,
        senderId: currentUser.id,
        type: 'like',
        postId: post.id,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      nextNotifications = [newNotif, ...notifications];
      setNotifications(nextNotifications);
    }

    saveState(users, nextPosts, comments, nextNotifications, currentUser);
  };

  const toggleBookmarkPost = (postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isBookmarked = post.bookmarks.includes(currentUser.id);
    const updatedBookmarks = isBookmarked
      ? post.bookmarks.filter(id => id !== currentUser.id)
      : [...post.bookmarks, currentUser.id];

    const nextPosts = posts.map(p => p.id === postId ? { ...p, bookmarks: updatedBookmarks } : p);
    setPosts(nextPosts);
    saveState(users, nextPosts, comments, notifications, currentUser);
  };

  const incrementShare = (postId: string) => {
    const nextPosts = posts.map(p => p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p);
    setPosts(nextPosts);
    saveState(users, nextPosts, comments, notifications, currentUser);
  };

  // Comments Functions
  const addComment = (postId: string, content: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      parentId,
      reportsCount: 0,
      reports: [],
    };

    const nextComments = [...comments, newComment];
    setComments(nextComments);

    // Notifications
    const postObj = posts.find(p => p.id === postId);
    let nextNotifications = notifications;

    if (postObj) {
      const isPostCreator = postObj.userId === currentUser.id;
      const targetUserId = parentId 
        ? comments.find(c => c.id === parentId)?.userId 
        : postObj.userId;

      if (targetUserId && targetUserId !== currentUser.id) {
        const notifType = parentId ? 'reply' : 'comment';
        const newNotif: Notification = {
          id: `n-${Date.now()}`,
          recipientId: targetUserId,
          senderId: currentUser.id,
          type: notifType,
          postId,
          commentId: newComment.id,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        nextNotifications = [newNotif, ...notifications];
        setNotifications(nextNotifications);
      }

      // Check for @mentions in comments
      const mentions = content.match(/@\w+/g);
      if (mentions) {
        mentions.forEach(mention => {
          const targetUsername = mention.substring(1).toLowerCase();
          const targetUser = users.find(u => u.username.toLowerCase() === targetUsername);
          if (targetUser && targetUser.id !== currentUser.id && targetUser.id !== targetUserId) {
            const mNotif: Notification = {
              id: `n-m-${Date.now()}-${Math.random()}`,
              recipientId: targetUser.id,
              senderId: currentUser.id,
              type: 'mention',
              postId,
              commentId: newComment.id,
              createdAt: new Date().toISOString(),
              isRead: false,
            };
            nextNotifications = [mNotif, ...nextNotifications];
          }
        });
        setNotifications(nextNotifications);
      }
    }

    saveState(users, posts, nextComments, nextNotifications, currentUser);
  };

  const deleteComment = (commentId: string) => {
    const nextComments = comments.filter(c => c.id !== commentId && c.parentId !== commentId);
    setComments(nextComments);
    saveState(users, posts, nextComments, notifications, currentUser);
  };

  // Notification Mechanics
  const triggerNotification = (recipientId: string, senderId: string, type: NotificationType, postId?: string) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}-${Math.random()}`,
      recipientId,
      senderId,
      type,
      postId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const nextNotifications = [newNotif, ...notifications];
    setNotifications(nextNotifications);
    saveState(users, posts, comments, nextNotifications, currentUser);
  };

  const triggerSystemNotification = (recipientId: string, details: string) => {
    const newNotif: Notification = {
      id: `n-sys-${Date.now()}`,
      recipientId,
      senderId: 'system',
      type: 'report_action',
      createdAt: new Date().toISOString(),
      isRead: false,
      details,
    };
    const nextNotifications = [newNotif, ...notifications];
    setNotifications(nextNotifications);
    saveState(users, posts, comments, nextNotifications, currentUser);
  };

  const markNotificationsRead = () => {
    if (!currentUser) return;
    const nextNotifs = notifications.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n);
    setNotifications(nextNotifs);
    saveState(users, posts, comments, nextNotifs, currentUser);
  };

  // Moderation Logic
  const reportItem = (itemId: string, itemType: 'post' | 'comment', reason: string) => {
    if (!currentUser) return;
    if (itemType === 'post') {
      const nextPosts = posts.map(p => {
        if (p.id === itemId) {
          const alreadyReported = p.reports.some(r => r.reporterId === currentUser.id);
          const reports = alreadyReported ? p.reports : [...p.reports, { reporterId: currentUser.id, reason }];
          return {
            ...p,
            reportsCount: reports.length,
            reports,
          };
        }
        return p;
      });
      setPosts(nextPosts);
      saveState(users, nextPosts, comments, notifications, currentUser);
    } else {
      const nextComments = comments.map(c => {
        if (c.id === itemId) {
          const alreadyReported = c.reports.some(r => r.reporterId === currentUser.id);
          const reports = alreadyReported ? c.reports : [...c.reports, { reporterId: currentUser.id, reason }];
          return {
            ...c,
            reportsCount: reports.length,
            reports,
          };
        }
        return c;
      });
      setComments(nextComments);
      saveState(users, posts, nextComments, notifications, currentUser);
    }
  };

  const moderateItem = (itemId: string, itemType: 'post' | 'comment', action: 'keep' | 'delete') => {
    if (!currentUser?.isAdmin) return;

    if (itemType === 'post') {
      if (action === 'delete') {
        const postToDel = posts.find(p => p.id === itemId);
        if (postToDel) {
          triggerSystemNotification(postToDel.userId, 'Your post has been removed by system moderation for policy guidelines.');
        }
        deletePost(itemId);
      } else {
        // Reset reports
        const nextPosts = posts.map(p => p.id === itemId ? { ...p, reportsCount: 0, reports: [] } : p);
        setPosts(nextPosts);
        saveState(users, nextPosts, comments, notifications, currentUser);
      }
    } else {
      if (action === 'delete') {
        const commToDel = comments.find(c => c.id === itemId);
        if (commToDel) {
          triggerSystemNotification(commToDel.userId, 'Your comment has been removed by system moderation for policy guidelines.');
        }
        deleteComment(itemId);
      } else {
        const nextComments = comments.map(c => c.id === itemId ? { ...c, reportsCount: 0, reports: [] } : c);
        setComments(nextComments);
        saveState(users, posts, nextComments, notifications, currentUser);
      }
    }
  };

  // Follow & Socials functions
  const followUser = (userIdToFollow: string) => {
    if (!currentUser || currentUser.id === userIdToFollow) return;

    const isFollowing = currentUser.following.includes(userIdToFollow);
    const updatedFollowing = isFollowing
      ? currentUser.following.filter(id => id !== userIdToFollow)
      : [...currentUser.following, userIdToFollow];

    const nextCurrentUser = { ...currentUser, following: updatedFollowing };
    setCurrentUser(nextCurrentUser);

    const nextUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return nextCurrentUser;
      }
      if (u.id === userIdToFollow) {
        const updatedFollowers = isFollowing
          ? u.followers.filter(id => id !== currentUser.id)
          : [...u.followers, currentUser.id];
        return { ...u, followers: updatedFollowers };
      }
      return u;
    });

    setUsers(nextUsers);

    let nextNotifications = notifications;
    if (!isFollowing) {
      const newNotif: Notification = {
        id: `n-follow-${Date.now()}`,
        recipientId: userIdToFollow,
        senderId: currentUser.id,
        type: 'follow',
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      nextNotifications = [newNotif, ...notifications];
      setNotifications(nextNotifications);
    }

    saveState(nextUsers, posts, comments, nextNotifications, nextCurrentUser);
  };

  const blockUser = (userIdToBlock: string) => {
    if (!currentUser || currentUser.id === userIdToBlock) return;
    const isBlocked = currentUser.blockedUsers.includes(userIdToBlock);
    if (isBlocked) return;

    const updatedBlocked = [...currentUser.blockedUsers, userIdToBlock];
    // Also auto-unfollow
    const updatedFollowing = currentUser.following.filter(id => id !== userIdToBlock);

    const nextCurrentUser = { 
      ...currentUser, 
      blockedUsers: updatedBlocked, 
      following: updatedFollowing 
    };
    setCurrentUser(nextCurrentUser);

    const nextUsers = users.map(u => {
      if (u.id === currentUser.id) return nextCurrentUser;
      if (u.id === userIdToBlock) {
        return {
          ...u,
          followers: u.followers.filter(id => id !== currentUser.id),
          following: u.following.filter(id => id !== currentUser.id),
        };
      }
      return u;
    });

    setUsers(nextUsers);
    saveState(nextUsers, posts, comments, notifications, nextCurrentUser);
  };

  const unblockUser = (userIdToUnblock: string) => {
    if (!currentUser) return;
    const updatedBlocked = currentUser.blockedUsers.filter(id => id !== userIdToUnblock);
    const nextCurrentUser = { ...currentUser, blockedUsers: updatedBlocked };
    setCurrentUser(nextCurrentUser);

    const nextUsers = users.map(u => u.id === currentUser.id ? nextCurrentUser : u);
    setUsers(nextUsers);
    saveState(nextUsers, posts, comments, notifications, nextCurrentUser);
  };

  return (
    <AppContext.Provider value={{
      users,
      posts,
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
      setDarkMode,
      login,
      signup,
      logout,
      onboardUser,
      updateProfile,
      createPost,
      editPost,
      deletePost,
      togglePinPost,
      toggleLikePost,
      toggleBookmarkPost,
      incrementShare,
      addComment,
      deleteComment,
      reportItem,
      moderateItem,
      followUser,
      blockUser,
      unblockUser,
      triggerSystemNotification,
      markNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
