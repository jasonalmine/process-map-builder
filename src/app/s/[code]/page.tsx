'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadSharedDiagram } from '@/lib/shareService';
import { useFlowStore } from '@/store/flowStore';
import { useViewModeStore } from '@/store/viewModeStore';
import { Node, Edge } from '@xyflow/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export default function SharedDiagramPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setNodes, setEdges } = useFlowStore();
  const { setViewMode } = useViewModeStore();

  useEffect(() => {
    async function loadDiagram() {
      if (!code) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      const result = await loadSharedDiagram(code);

      if (!result.success || !result.diagram) {
        setError(result.error || 'Diagram not found');
        setLoading(false);
        return;
      }

      // Load the diagram into the store
      const nodes = result.diagram.nodes as AnyNode[];
      const edges = result.diagram.edges as Edge[];

      // Enable view mode
      setViewMode(true, result.diagram.name);

      // Redirect to main page
      router.replace('/');
    }

    loadDiagram();
  }, [code, setNodes, setEdges, setViewMode, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared diagram...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Diagram Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Your Own Diagram
          </button>
        </div>
      </div>
    );
  }

  return null;
}
