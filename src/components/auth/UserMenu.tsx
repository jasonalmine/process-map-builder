'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Cloud } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';

interface UserMenuProps {
  theme: 'light' | 'dark';
}

// Get initials from a display name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserMenu({ theme }: UserMenuProps) {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isSupabaseConfigured || !user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : null) || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const email = user.email;
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          theme === 'dark'
            ? 'hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-offset-gray-900'
            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900 focus:ring-offset-white'
        }`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
          }`}>
            {initials}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-orientation="vertical"
            className={`absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl overflow-hidden z-50 ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* User Info */}
            <div className={`px-4 py-3 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {displayName}
                  </p>
                  <p className={`text-xs truncate ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className={`px-4 py-2 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-2">
                <Cloud className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Cloud sync enabled
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                role="menuitem"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-label={isSigningOut ? 'Signing out' : 'Sign out'}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSigningOut ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
