'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthModal } from './AuthModal';
import { Workflow, ArrowRight, Zap, Share2, Palette, Check } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, isLoading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Show landing page if not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-950 text-white">
          {/* Header */}
          <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">FlowCraft</h1>
                  <p className="text-xs text-gray-400">by Ventryx</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium transition-all text-sm"
              >
                Sign In
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <main className="max-w-6xl mx-auto px-6">
            <div className="py-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
                <Zap className="w-4 h-4" />
                Free & Open Source
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Beautiful Flowcharts,<br />Made Simple
              </h2>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                Create stunning flowcharts and process diagrams with Mermaid syntax.
                Visual editor, drag-and-drop nodes, and instant sharing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-lg transition-all shadow-lg shadow-purple-500/25"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="py-16 border-t border-gray-800">
              <h3 className="text-2xl font-bold text-center mb-12">Everything you need to create flowcharts</h3>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Workflow className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Visual Editor</h4>
                  <p className="text-gray-400">
                    Drag and drop nodes, connect them visually, or use Mermaid syntax for quick diagramming.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Instant Sharing</h4>
                  <p className="text-gray-400">
                    Share your diagrams with a single click. Password protection available for sensitive content.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Beautiful Themes</h4>
                  <p className="text-gray-400">
                    Multiple color themes, node shapes, and export options. Make your diagrams stand out.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing/CTA */}
            <div className="py-16 border-t border-gray-800">
              <div className="max-w-lg mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">Free Forever</h3>
                <p className="text-gray-400 mb-8">
                  FlowCraft is completely free. No limits, no hidden fees.
                </p>

                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 text-left">
                  <ul className="space-y-3">
                    {[
                      'Unlimited diagrams',
                      'Cloud sync across devices',
                      'Share with password protection',
                      'Export to PNG, SVG, PDF',
                      'All node types and shapes',
                      'Dark and light themes',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all"
                  >
                    Start Creating
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-800 py-8">
            <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
              <p className="mb-3">&copy; {new Date().getFullYear()} Ventryx. All rights reserved.</p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://www.ventryx.ai/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </a>
                <span>·</span>
                <a
                  href="https://www.ventryx.ai/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal canClose={true} onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
