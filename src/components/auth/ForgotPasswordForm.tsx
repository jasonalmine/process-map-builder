'use client';

import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function ForgotPasswordForm({ onBack, onError, onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      onError('Authentication is not configured');
      return;
    }

    if (!email) {
      onError('Please enter your email');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      onError(error.message);
    } else {
      onSuccess('Check your email for a password reset link.');
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Reset Password</h3>
        <p className="text-gray-400 text-sm">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  );
}
