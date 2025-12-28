'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadSharedDiagram, checkShareAccess } from '@/lib/shareService';
import { useFlowStore } from '@/store/flowStore';
import { useViewModeStore } from '@/store/viewModeStore';
import { Node, Edge } from '@xyflow/react';
import { Lock, Eye, EyeOff } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export default function SharedDiagramPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setNodes, setEdges } = useFlowStore();
  const { setViewMode } = useViewModeStore();

  // Check if password is required
  useEffect(() => {
    async function checkAccess() {
      if (!code) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      const accessResult = await checkShareAccess(code);

      if (accessResult.error) {
        setError(accessResult.error);
        setLoading(false);
        return;
      }

      if (accessResult.requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
      } else {
        // No password required, load directly
        await loadDiagram();
      }
    }

    checkAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function loadDiagram(passwordAttempt?: string) {
    setIsSubmitting(true);

    const result = await loadSharedDiagram(code, passwordAttempt);

    if (result.requiresPassword) {
      setRequiresPassword(true);
      setError(result.error || 'Password required');
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    if (!result.success || !result.diagram) {
      setError(result.error || 'Diagram not found');
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    // Load the diagram into the store
    const nodes = result.diagram.nodes as AnyNode[];
    const edges = result.diagram.edges as Edge[];

    setNodes(nodes);
    setEdges(edges);

    // Enable view mode
    setViewMode(true, result.diagram.name);

    // Redirect to main page
    router.replace('/');
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await loadDiagram(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading shared diagram...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-md mx-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Password Protected
              </h1>
              <p className="text-gray-400 text-sm">
                This diagram is password protected. Enter the password to view it.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && error !== 'Password required' && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !password}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'View Diagram'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Create your own diagram instead
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Diagram Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Create Your Own Diagram
          </button>
        </div>
      </div>
    );
  }

  return null;
}
