export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  joinDate: string;
  followers: string[]; // User IDs who follow this user
  following: string[]; // User IDs this user follows
  isVerified: boolean;
  isAdmin: boolean;
  blockedUsers: string[]; // User IDs blocked by this user
  bannerColor: string; // Gradient or solid color for header banner
}

export type PostCategory = 'thought' | 'opinion' | 'confession' | 'question' | 'news' | 'joke' | 'discussion';

export interface Post {
  id: string;
  userId: string; // Creator ID
  content: string;
  category: PostCategory;
  image?: string;
  hashtags: string[];
  createdAt: string; // Date string
  likes: string[]; // User IDs who liked this post
  bookmarks: string[]; // User IDs who bookmarked this post
  isPinned?: boolean;
  sharesCount: number;
  reportsCount: number;
  reports: { reporterId: string; reason: string }[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  parentId?: string; // For threaded replies
  likes: string[]; // User IDs who liked this comment
  reportsCount: number;
  reports: { reporterId: string; reason: string }[];
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'report_action';

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string; // Can be 'system' for system announcements
  type: NotificationType;
  postId?: string;
  commentId?: string;
  createdAt: string;
  isRead: boolean;
  details?: string; // Extra descriptive text
}

export interface Report {
  id: string;
  reporterId: string;
  itemId: string; // ID of post or comment
  itemType: 'post' | 'comment';
  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AppState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  currentUser: User | null;
  darkMode: boolean;
}
