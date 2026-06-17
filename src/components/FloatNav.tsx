import React from 'react';
import { useApp } from './AppContext';
import { Home, TrendingUp, Bell, User, ShieldAlert, Moon, Sun, Bookmark, Search, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export const FloatNav: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setSelectedPostId,
    setActiveProfileId,
    notifications,
    darkMode,
    setDarkMode,
    logout
  } = useApp();

  const unreadCount = notifications.filter(n => n.recipientId === currentUser?.id && !n.isRead).length;

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'bookmarks', label: 'Saved', icon: Bookmark },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User, requiresUser: true },
  ];

  if (currentUser?.isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedPostId(null);
    if (tabId === 'profile' && currentUser) {
      setActiveProfileId(currentUser.id);
    } else {
      setActiveProfileId(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-full">
      <div 
        className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-800/40 rounded-full px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between gap-1 relative overflow-hidden"
        id="trendtalk-floating-navbar"
      >
        {/* Red accent stripe at bottom of floating bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-rose-600 to-red-500 opacity-60"></div>

        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-around">
          {tabs.map((tab) => {
            if (tab.requiresUser && !currentUser) return null;
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'text-red-500 dark:text-red-400 scale-110' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={tab.label}
                id={`nav-btn-${tab.id}`}
              >
                <Icon className="w-5.5 h-5.5" />
                
                {tab.badge !== undefined && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                    {tab.badge}
                  </span>
                ) : null}

                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF3B30]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator element */}
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>

        {/* Extra buttons: theme & logout */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-[#ff9f0a] rounded-full transition-all duration-200"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            id="nav-theme-toggle"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {currentUser && (
            <button
              onClick={() => logout()}
              className="p-2 text-zinc-500 hover:text-[#FF3B30] dark:text-zinc-400 dark:hover:text-red-400 rounded-full transition-all duration-200"
              title="Logout"
              id="nav-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
