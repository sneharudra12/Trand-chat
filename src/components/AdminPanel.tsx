import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Post, Comment, User } from '../types';
import { Shield, ShieldAlert, Check, Trash2, X, AlertTriangle, Users, BookOpen, AlertCircle, Award } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const {
    posts,
    comments,
    users,
    moderateItem,
    blockUser,
    unblockUser,
    updateProfile,
    triggerSystemNotification,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'reported-posts' | 'reported-comments' | 'manage-users'>('reported-posts');

  const reportedPosts = posts.filter(p => p.reportsCount > 0);
  const reportedComments = comments.filter(c => c.reportsCount > 0);

  // Statistics
  const stats = {
    totalPosts: posts.length,
    totalComments: comments.length,
    totalReports: reportedPosts.length + reportedComments.length,
    totalUsers: users.length,
  };

  const handleToggleVerifyUser = (user: User) => {
    // Update user verified state
    const nextUsers = users.map(u => {
      if (u.id === user.id) {
        const nextState = !u.isVerified;
        // Trigger notification
        triggerSystemNotification(user.id, nextState 
          ? 'Congratulations! TrendTalk administration has awarded your profile with a Verification Badge.'
          : 'Your Verification badge has been reviewed and removed under policy guidelines.');
        return { ...u, isVerified: nextState };
      }
      return u;
    });
    localStorage.setItem('tt_users', JSON.stringify(nextUsers));
    // Simple page reload to apply verified updates is a backup, but ideally we can just trigger state saving using a fake profile edit or window location reload!
    window.location.reload();
  };

  const handleAdminBlockUser = (user: User) => {
    const isBlocked = user.blockedUsers.includes('admin-blocked'); // Simulate admin block
    let nextUsers;
    if (isBlocked) {
      nextUsers = users.map(u => u.id === user.id ? { ...u, blockedUsers: u.blockedUsers.filter(x => x !== 'admin-blocked') } : u);
      triggerSystemNotification(user.id, 'Your profile block has been lifted by TrendTalk safety administration.');
    } else {
      nextUsers = users.map(u => u.id === user.id ? { ...u, blockedUsers: [...u.blockedUsers, 'admin-blocked'] } : u);
      triggerSystemNotification(user.id, 'Your profile has been blocked by TrendTalk staff due to multiple policy violations.');
    }
    localStorage.setItem('tt_users', JSON.stringify(nextUsers));
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-4">
      {/* Admin Title Block */}
      <div className="backdrop-blur-md bg-zinc-900/10 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-full text-[#FF3B30]">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              Staff Moderation Panel <span className="text-xs bg-[#FF3B30] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Secure</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Audit reports, verified badges, block profiles, and maintain the TrendTalk platform integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Stats Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: stats.totalPosts, icon: BookOpen, color: 'text-blue-500 bg-blue-500/5' },
          { label: 'Total Communities', value: stats.totalComments, icon: Shield, color: 'text-indigo-500 bg-indigo-500/5' },
          { label: 'Active Creators', value: stats.totalUsers, icon: Users, color: 'text-emerald-500 bg-emerald-500/5' },
          { label: 'Open Reports', value: stats.totalReports, icon: ShieldAlert, color: 'text-rose-500 bg-[#FF3B30]/5 text-[#FF3B30]' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="backdrop-blur-md bg-white/40 dark:bg-zinc-800/40 border border-white/20 dark:border-zinc-700/20 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className={`p-2.5 rounded-full ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">{item.label}</div>
                <div className="text-lg sm:text-xl font-extrabold text-zinc-800 dark:text-white">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4">
        {[
          { id: 'reported-posts', label: `Reported Posts (${reportedPosts.length})` },
          { id: 'reported-comments', label: `Reported Comments (${reportedComments.length})` },
          { id: 'manage-users', label: 'Manage Creators' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 transition duration-200 ${
              activeSubTab === tab.id
                ? 'border-[#FF3B30] text-[#FF3B30]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content tabs */}
      <div className="space-y-4">
        {activeSubTab === 'reported-posts' && (
          <div className="space-y-4">
            {reportedPosts.length === 0 ? (
              <div className="text-center py-12 backdrop-blur-md bg-white/10 dark:bg-zinc-800/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs italic">
                Everything is pristine! Zero posts are reported currently. 🎉
              </div>
            ) : (
              reportedPosts.map((post) => {
                const author = users.find(u => u.id === post.userId);
                return (
                  <div key={post.id} className="backdrop-blur-md bg-white/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={author?.avatar} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">@{author?.username}</span>
                      </div>
                      <span className="text-[10px] bg-red-100 dark:bg-[#FF3B30]/20 text-[#FF3B30] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged {post.reportsCount} times
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/50">
                      {post.content}
                    </div>

                    {/* Report Reasons details */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Reporter Feedbacks:</div>
                      {post.reports.map((report, rIdx) => (
                        <div key={rIdx} className="text-xs text-zinc-500 dark:text-zinc-400 pl-2 border-l border-red-400 font-medium">
                          • "{report.reason}"
                        </div>
                      ))}
                    </div>

                    {/* Actions block */}
                    <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <button
                        onClick={() => moderateItem(post.id, 'post', 'keep')}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Dismiss & Keep
                      </button>
                      <button
                        onClick={() => moderateItem(post.id, 'post', 'delete')}
                        className="px-3 py-1.5 bg-[#FF3B30] hover:bg-[#E03025] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Content
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeSubTab === 'reported-comments' && (
          <div className="space-y-4">
            {reportedComments.length === 0 ? (
              <div className="text-center py-12 backdrop-blur-md bg-white/10 dark:bg-zinc-800/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs italic">
                Prine clean! Zero flagged replies or comments reported. 🎉
              </div>
            ) : (
              reportedComments.map((comment) => {
                const author = users.find(u => u.id === comment.userId);
                return (
                  <div key={comment.id} className="backdrop-blur-md bg-white/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={author?.avatar} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">@{author?.username}</span>
                      </div>
                      <span className="text-[10px] bg-red-100 dark:bg-[#FF3B30]/20 text-[#FF3B30] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged {comment.reportsCount} times
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/50">
                      {comment.content}
                    </div>

                    {/* Report Reasons details */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Reporter Feedback:</div>
                      {comment.reports.map((report, rIdx) => (
                        <div key={rIdx} className="text-xs text-zinc-500 dark:text-zinc-400 pl-2 border-l border-red-400 font-medium">
                          • "{report.reason}"
                        </div>
                      ))}
                    </div>

                    {/* Actions block */}
                    <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <button
                        onClick={() => moderateItem(comment.id, 'comment', 'keep')}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Dismiss & Keep
                      </button>
                      <button
                        onClick={() => moderateItem(comment.id, 'comment', 'delete')}
                        className="px-3 py-1.5 bg-[#FF3B30] hover:bg-[#E03025] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Comment
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeSubTab === 'manage-users' && (
          <div className="backdrop-blur-md bg-white/40 dark:bg-zinc-800/40 border border-white/20 dark:border-zinc-700/20 rounded-2xl overflow-hidden p-2 sm:p-5">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Followers</th>
                    <th className="py-3 px-4">Badges</th>
                    <th className="py-3 px-4 text-right">Moderations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {users.map((user) => {
                    const isUserBlocked = user.blockedUsers.includes('admin-blocked');
                    return (
                      <tr key={user.id} className="text-xs text-zinc-800 dark:text-zinc-200 hover:bg-white/10">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold">{user.displayName}</div>
                            <div className="text-[10px] text-zinc-400">@{user.username}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">{user.email}</td>
                        <td className="py-3.5 px-4 font-bold">{user.followers.length}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-1">
                            {user.isVerified && (
                              <span className="bg-red-500/10 text-[#FF3B30] font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                                Verified
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                Staff
                              </span>
                            )}
                            {isUserBlocked && (
                              <span className="bg-red-600 text-white font-bold px-1 text-[9px] rounded">
                                Blocked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleToggleVerifyUser(user)}
                            className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-[11px] font-bold inline-flex items-center gap-1 transition text-amber-600 dark:text-amber-400"
                            title="Toggle Verified Badge"
                          >
                            <Award className="w-3.5 h-3.5" /> {user.isVerified ? 'Revoke badge' : 'Verify'}
                          </button>

                          {!user.isAdmin && (
                            <button
                              onClick={() => handleAdminBlockUser(user)}
                              className={`p-1 px-2.5 rounded text-[11px] font-bold inline-flex items-center gap-1 transition ${
                                isUserBlocked
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-[#FF3B30]'
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> {isUserBlocked ? 'Unblock' : 'Block Creator'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
