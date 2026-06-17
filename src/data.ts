import { User, Post, Comment, Notification } from './types';

// Helper to generate ISO strings relative to current date/time (which is June 17, 2026)
const getPastDate = (hoursAgo: number): string => {
  const d = new Date('2026-06-17T06:00:00.000Z');
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    displayName: 'TrendTalk System',
    email: 'admin@trendtalk.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Official TrendTalk Administrator account. Keeping the community safe, glass-morphic, and highly trending.',
    joinDate: '2026-01-01T00:00:00.000Z',
    followers: ['u-2', 'u-3', 'u-4', 'u-5'],
    following: ['u-2'],
    isVerified: true,
    isAdmin: true,
    blockedUsers: [],
    bannerColor: 'linear-gradient(135deg, #1f2937, #dc2626)',
  },
  {
    id: 'u-2',
    username: 'clara_tech',
    displayName: 'Clara Chen ⚡️',
    email: 'clara@insight.tech',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Software architect & visual designer. Talking design, generative AI, and sleek clean CSS. Let\'s build the future!',
    joinDate: '2026-03-12T00:00:00.000Z',
    followers: ['u-1', 'u-3', 'u-5'],
    following: ['u-1', 'u-4', 'u-5'],
    isVerified: true,
    isAdmin: false,
    blockedUsers: [],
    bannerColor: 'linear-gradient(135deg, #FF3B30, #ff9f0a)',
  },
  {
    id: 'u-3',
    username: 'marcus_laughs',
    displayName: 'Marcus Vance 🎙️',
    email: 'marcus@comedy.co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Standup comedian, continuous coffee drinker, professional over-thinker. Daily bad puns are guaranteed.',
    joinDate: '2026-04-01T00:00:00.000Z',
    followers: ['u-2', 'u-4'],
    following: ['u-2', 'u-5'],
    isVerified: true,
    isAdmin: false,
    blockedUsers: [],
    bannerColor: 'linear-gradient(135deg, #ff9f0a, #34c759)',
  },
  {
    id: 'u-4',
    username: 'confessing_ghost',
    displayName: 'A Ghostly Confession 👻',
    email: 'ghost@confess.io',
    avatar: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80',
    bio: 'I share the deep thoughts people only admit at 3:00 AM. Leave your secrets in the replies. Fully anonymous vibe.',
    joinDate: '2026-05-15T00:00:00.000Z',
    followers: ['u-1', 'u-2', 'u-3', 'u-5'],
    following: ['u-1'],
    isVerified: false,
    isAdmin: false,
    blockedUsers: [],
    bannerColor: 'linear-gradient(135deg, #5856d6, #af52de)',
  },
  {
    id: 'u-5',
    username: 'sarah_trends',
    displayName: 'Sarah Patel 📈',
    email: 'sarah@trends.io',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Analyst tracking viral events, startups, and pop culture. If it is happening, it is on TrendTalk first.',
    joinDate: '2026-02-18T00:00:00.000Z',
    followers: ['u-2', 'u-3'],
    following: ['u-1', 'u-2', 'u-3', 'u-4'],
    isVerified: true,
    isAdmin: false,
    blockedUsers: [],
    bannerColor: 'linear-gradient(135deg, #007aff, #34c759)',
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p-1',
    userId: 'u-2',
    content: 'Unpopular opinion: UI developers should spend 50% of their time editing typography first. Standard default system fonts make stunning applications look ordinary. Give me custom kerning and generous negative space any day! #design #uiux #trendtalk',
    category: 'opinion',
    hashtags: ['design', 'uiux', 'trendtalk'],
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    createdAt: getPastDate(2), // 2 hours ago
    likes: ['u-1', 'u-3', 'u-4', 'u-5'],
    bookmarks: ['u-1', 'u-5'],
    isPinned: true,
    sharesCount: 12,
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'p-2',
    userId: 'u-4',
    content: 'Sometimes at fancy tech networking dinners, I just nod along and repeat words like "modular token micro-architectures" and "hydration layer indices". I have an engineering degree but 80% of my job is searching why a div has a 2px off-center margin. Who is with me? 😅 #confession #developerlife #real',
    category: 'confession',
    hashtags: ['confession', 'developerlife', 'real'],
    createdAt: getPastDate(4), // 4 hours ago
    likes: ['u-2', 'u-3', 'u-5'],
    bookmarks: ['u-2'],
    sharesCount: 24,
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'p-3',
    userId: 'u-5',
    content: 'Breaking down the modern startup aesthetic for 2026: it is all about glassmorphic blurs, beautiful deep red gradients, ultra-bold minimal display fonts, and offline-first reactive mechanics. Gone are the boring flat gray boxes. We want depth and identity! What are you building today? #startup #trends #dev',
    category: 'discussion',
    hashtags: ['startup', 'trends', 'dev'],
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80',
    createdAt: getPastDate(8), // 8 hours ago
    likes: ['u-1', 'u-2', 'u-4'],
    bookmarks: [],
    sharesCount: 8,
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'p-4',
    userId: 'u-3',
    content: 'My computer told me it needed to update "immediately for security purposes", so I clicked snooze. It is now on its 42nd consecutive snooze. At this point, the hacker group that breaches me deserves my 12GB of reaction memes. #joke #sysadmin #meme',
    category: 'joke',
    hashtags: ['joke', 'sysadmin', 'meme'],
    createdAt: getPastDate(12), // 12 hours ago
    likes: ['u-1', 'u-2', 'u-5'],
    bookmarks: ['u-1'],
    sharesCount: 31,
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'p-5',
    userId: 'u-2',
    content: 'What is the absolute best advice you have received for handling imposter syndrome? Seems like every creator I meet feels like they are just one commit away from being discovered. Let\'s make this a helpful thread. #question #wisdom #mentalhealth',
    category: 'question',
    hashtags: ['question', 'wisdom', 'mentalhealth'],
    createdAt: getPastDate(24), // 24 hours ago
    likes: ['u-3', 'u-4', 'u-5'],
    bookmarks: ['u-3', 'u-4'],
    sharesCount: 15,
    reportsCount: 0,
    reports: [],
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    postId: 'p-1',
    userId: 'u-5',
    content: 'Totally agreed on the typography aspect! Bad line-height makes reading long posts a chore. Inter and Space Grotesk really change the whole game.',
    createdAt: getPastDate(1.5),
    likes: ['u-2'],
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'c-2',
    postId: 'p-1',
    userId: 'u-2',
    content: 'Thanks Sarah! Yes, pairing Inter with a gorgeous high contrast display heading offers that clean, Swiss modernism feel.',
    createdAt: getPastDate(1.2),
    parentId: 'c-1', // replying to Clara's comment
    likes: ['u-5'],
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'c-3',
    postId: 'p-2',
    userId: 'u-3',
    content: 'Oh this is 100% accurate. "Let\'s align the schema paradigms" is my favorite go-to sequence to buy another 6 hours of bug fixing time.',
    createdAt: getPastDate(3.8),
    likes: ['u-4'],
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'c-4',
    postId: 'p-2',
    userId: 'u-2',
    content: 'Wait, @confessing_ghost, are you watching me working right now? Just resolved a div problem that was solved by removing a custom border thickness. Classic!',
    createdAt: getPastDate(3.5),
    likes: ['u-4'],
    reportsCount: 0,
    reports: [],
  },
  {
    id: 'c-5',
    postId: 'p-5',
    userId: 'u-5',
    content: 'Mine is simple: realize that literally everyone is googling basic syntax and running into issues. No one is a perfect compiler. Be kind to yourself!',
    createdAt: getPastDate(22),
    likes: ['u-2', 'u-3'],
    reportsCount: 0,
    reports: [],
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    recipientId: 'u-2',
    senderId: 'u-5',
    type: 'comment',
    postId: 'p-1',
    commentId: 'c-1',
    createdAt: getPastDate(1.5),
    isRead: false,
  },
  {
    id: 'n-2',
    recipientId: 'u-2',
    senderId: 'u-1',
    type: 'like',
    postId: 'p-1',
    createdAt: getPastDate(1.8),
    isRead: false,
  },
  {
    id: 'n-3',
    recipientId: 'u-4',
    senderId: 'u-2',
    type: 'mention',
    postId: 'p-2',
    commentId: 'c-4',
    createdAt: getPastDate(3.5),
    isRead: true,
  }
];
