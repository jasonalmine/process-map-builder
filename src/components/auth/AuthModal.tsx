'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, CheckCircle, AlertCircle, X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { OAuthButtons } from './OAuthButtons';

type AuthTab = 'login' | 'signup' | 'magic-link' | 'forgot-password';

interface AuthModalProps {
  onClose?: () => void;
  canClose?: boolean;
}

export function AuthModal({ onClose, canClose = false }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
  };

  const handleSuccess = (message?: string) => {
    setError(null);
    if (message) {
      setSuccessMessage(message);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const switchTab = (tab: AuthTab) => {
    clearMessages();
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">FlowCraft</h2>
                  <p className="text-xs text-gray-400">by Ventryx</p>
                </div>
              </div>
              {canClose && onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          {activeTab !== 'forgot-password' && (
            <div className="px-6 pt-4">
              <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg">
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'login'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'signup'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => switchTab('magic-link')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'magic-link'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Magic Link
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'login' && (
                  <LoginForm
                    onForgotPassword={() => switchTab('forgot-password')}
                    onError={handleError}
                    onSuccess={() => handleSuccess()}
                  />
                )}
                {activeTab === 'signup' && (
                  <SignupForm
                    onError={handleError}
                    onSuccess={handleSuccess}
                  />
                )}
                {activeTab === 'magic-link' && (
                  <MagicLinkForm
                    onError={handleError}
                    onSuccess={handleSuccess}
                  />
                )}
                {activeTab === 'forgot-password' && (
                  <ForgotPasswordForm
                    onBack={() => switchTab('login')}
                    onError={handleError}
                    onSuccess={handleSuccess}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* OAuth Divider */}
            {(activeTab === 'login' || activeTab === 'signup') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-500">or continue with</span>
                  </div>
                </div>
                <OAuthButtons onError={handleError} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
