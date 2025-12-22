'use client';

import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';

const FlowCanvas = dynamic(() => import('@/components/FlowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950">
      <div className="flex items-center gap-3 text-gray-400">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span>Loading canvas...</span>
      </div>
    </div>
  ),
});

const PromptInput = dynamic(() => import('@/components/PromptInput'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ProcessAI</h1>
              <p className="text-xs text-gray-400">AI-Powered Flow Generator</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <FlowCanvas />
        <PromptInput />

        {/* Empty state overlay */}
        <EmptyState />
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-md px-6 opacity-50">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Describe Your Process
        </h2>
        <p className="text-sm text-gray-400">
          Enter a description of your business process below and watch as AI
          transforms it into a beautiful, interactive flowchart.
        </p>
      </div>
    </div>
  );
}
