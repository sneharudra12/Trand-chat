import React, { useState } from 'react';
import { useApp } from './AppContext';
import { LogIn, UserPlus, HelpCircle, ArrowRight, User, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalsProps {
  onSuccess?: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({ onSuccess }) => {
  const { login, signup, currentUser, onboardUser } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset' | 'onboarding'>('login');

  // Input states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Onboarding settings
  const [bioOnboard, setBioOnboard] = useState('');
  const [avatarOnboard, setAvatarOnboard] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');
  const [bannerOnboard, setBannerOnboard] = useState('linear-gradient(135deg, #FF3B30, #ff9f0a)');

  // Status logs
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const prebuiltAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  ];

  const prebuiltBanners = [
    'linear-gradient(135deg, #FF3B30, #ff9f0a)',
    'linear-gradient(135deg, #007aff, #34c759)',
    'linear-gradient(135deg, #5856d6, #af52de)',
    'linear-gradient(135deg, #1f2937, #dc2626)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #00c6ff, #0072ff)'
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const resp = login(username);
    if (resp.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorText(resp.error || 'Login failed.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const resp = signup(displayName, username, email);
    if (resp.success) {
      setAuthMode('onboarding');
    } else {
      setErrorText(resp.error || 'Signup failed.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email.trim()) return;
    setSuccessText('Password recovery instruction has been sent to your email!');
    setTimeout(() => {
      setAuthMode('login');
      setSuccessText('');
    }, 3000);
  };

  const handleOnboardingComplete = () => {
    onboardUser(bioOnboard, avatarOnboard, bannerOnboard);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="backdrop-blur-xl bg-white/75 dark:bg-zinc-900/80 p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-zinc-800/40 shadow-2xl relative overflow-hidden max-w-md w-full mx-auto" id="auth-panel-container">
      {/* Decorative Red Line at high margin */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-[#FF3B30] to-orange-500"></div>

      <AnimatePresence mode="wait">
        {authMode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Log into <span className="text-[#FF3B30]">TrendTalk</span>
              </h2>
              <p className="text-xs text-zinc-500">Join the trending global discussions today.</p>
            </div>

            {errorText && (
              <div className="text-xs bg-red-100 dark:bg-red-950/20 text-[#FF3B30] p-3 rounded-xl text-center font-semibold">
                {errorText}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">
                  Username or Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="clara_tech"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-3 pl-8 pr-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 pl-1">
                  💡 Hint: Standard demo profiles include <b className="text-[#FF3B30]">admin</b>, <b className="text-[#FF3B30]">clara_tech</b> or <b className="text-[#FF3B30]">marcus_laughs</b>. Just input it to login!
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 px-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="text-xs font-bold text-[#FF3B30] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-3 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FF3B30] hover:bg-[#E03025] active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/10 transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogIn className="w-4.5 h-4.5" /> Sign In
              </button>
            </form>

            <div className="text-center text-xs text-zinc-500">
              New to TrendTalk?{' '}
              <button
                onClick={() => setAuthMode('signup')}
                className="font-bold text-[#FF3B30] hover:underline"
              >
                Register a new account
              </button>
            </div>
          </motion.div>
        )}

        {authMode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Create Account ✦
              </h2>
              <p className="text-xs text-zinc-500">Craft your unique talk index and connect.</p>
            </div>

            {errorText && (
              <div className="text-xs bg-red-100 dark:bg-red-950/20 text-[#FF3B30] p-3 rounded-xl text-center font-semibold">
                {errorText}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 pl-1">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Rivera ✍️"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-2.5 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 pl-1">
                  Choose Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_rivera"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-2.5 pl-8 pr-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 pl-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@trendtalk.com"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-2.5 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl py-2.5 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FF3B30] hover:bg-[#E03025] active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg transition-all duration-200 tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4.5 h-4.5" /> Initialize account
              </button>
            </form>

            <div className="text-center text-xs text-zinc-500">
              Already have an account?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="font-bold text-[#FF3B30] hover:underline"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}

        {authMode === 'reset' && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs text-zinc-500">Provide registration email to recover link.</p>
            </div>

            {successText && (
              <div className="text-xs bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 p-3 rounded-xl text-center font-bold animate-pulse">
                {successText}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@trendtalk.com"
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-950 font-black text-sm rounded-2xl transition flex items-center justify-center gap-1"
                disabled={!!successText}
              >
                Send Recovery Key <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs">
              <button
                onClick={() => setAuthMode('login')}
                className="font-bold text-[#FF3B30] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </motion.div>
        )}

        {authMode === 'onboarding' && (
          <motion.div
            key="onboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center justify-center gap-2">
                Setup Profile <Sparkles className="w-5 h-5 text-[#FF3B30]" />
              </h2>
              <p className="text-xs text-zinc-500">Uniquify your identity to begin TrendTalk.</p>
            </div>

            <div className="space-y-4">
              {/* Profile Avatar Selection Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 pl-1">
                  Choose Avatar Profile Photo
                </label>
                <div className="flex justify-center items-center gap-3 py-2">
                  <img
                    src={avatarOnboard}
                    alt="Active Choose"
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#FF3B30]/30 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="grid grid-cols-6 gap-2">
                    {prebuiltAvatars.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAvatarOnboard(item)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition hover:scale-110 ${
                          avatarOnboard === item ? 'border-[#FF3B30]' : 'border-transparent'
                        }`}
                      >
                        <img src={item} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner custom color setup */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 pl-1">
                  Choose Banner Visual Profile Color
                </label>
                <div className="flex gap-2">
                  {prebuiltBanners.map((gradient, gIdx) => (
                    <button
                      key={gIdx}
                      onClick={() => setBannerOnboard(gradient)}
                      style={{ background: gradient }}
                      className={`w-8 h-8 rounded-lg shadow-sm border-2 transition hover:scale-105 ${
                        bannerOnboard === gradient ? 'border-zinc-800 dark:border-white scale-105' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bio block */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 pl-1">
                  Bio (Describe your thoughts)
                </label>
                <textarea
                  value={bioOnboard}
                  onChange={(e) => setBioOnboard(e.target.value)}
                  placeholder="Confessing ghost researcher, graphic design lover..."
                  className="w-full h-20 bg-white dark:bg-zinc-800 text-sm border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 focus:ring-1 focus:ring-red-500 outline-none"
                  maxLength={160}
                />
              </div>

              <button
                onClick={handleOnboardingComplete}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 via-[#FF3B30] to-rose-600 text-white font-black text-sm rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                Let's Begin the Journey <Check className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
