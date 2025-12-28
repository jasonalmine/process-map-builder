'use client';

import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthModal } from './AuthModal';
import { Workflow } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, isLoading } = useAuthStore();

  // If Supabase is not configured, allow access (development mode)
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
            <Workflow className="w-8 h-8 text-white" />
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading FlowCraft...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!user) {
    return <AuthModal canClose={false} />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
