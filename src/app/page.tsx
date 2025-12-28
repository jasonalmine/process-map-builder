'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Workflow, Moon, Sun, ChevronDown } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { useViewModeStore } from '@/store/viewModeStore';
import { sampleFlows } from '@/data/sampleFlows';
import { AuthGate } from '@/components/auth/AuthGate';
import { UserMenu } from '@/components/auth/UserMenu';

const FlowCanvas = dynamic(() => import('@/components/FlowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <Workflow className="w-5 h-5 animate-pulse" />
        <span>Loading canvas...</span>
      </div>
    </div>
  ),
});

const MermaidEditor = dynamic(() => import('@/components/MermaidEditor'), {
  ssr: false,
});

const DiagramManager = dynamic(() => import('@/components/DiagramManager'), {
  ssr: false,
});

export default function Home() {
  const nodes = useFlowStore((state) => state.nodes);
  const loadSampleFlow = useFlowStore((state) => state.loadSampleFlow);
  const { theme, toggleTheme } = useThemeStore();
  const isViewMode = useViewModeStore((state) => state.isViewMode);
  const hasNodes = nodes.length > 0;

  // Apply theme to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AuthGate>
    <main className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'
    }`}>
      {/* Header - simplified in view mode */}
      <header className={`flex-shrink-0 border-b backdrop-blur-xl z-10 transition-colors duration-300 ${
        theme === 'dark'
          ? 'border-gray-800 bg-gray-900/50'
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                FlowCraft
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {isViewMode ? 'Shared Flowchart' : 'by Ventryx'}
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {!isViewMode && <DiagramManager />}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <UserMenu theme={theme} />
          </nav>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <FlowCanvas />

        {/* Hide editor and empty state in view mode */}
        {!isViewMode && (
          <>
            <MermaidEditor />
            {/* Empty state overlay - only show when canvas is empty */}
            {!hasNodes && <EmptyState theme={theme} onLoadSample={loadSampleFlow} />}
          </>
        )}
      </div>
    </main>
    </AuthGate>
  );
}

function EmptyState({ theme, onLoadSample }: { theme: 'light' | 'dark'; onLoadSample: (flowId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-2xl px-6 opacity-90">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border flex items-center justify-center ${
          theme === 'dark' ? 'border-purple-500/20' : 'border-purple-300/40'
        }`}>
          <Workflow className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          Create Your Flowchart
        </h2>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Write Mermaid code in the editor below, or load a sample flow to get started.
          Drag nodes from the palette to build visually.
        </p>

        {/* Sample Flow Picker */}
        <div className="pointer-events-auto relative inline-block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25`}
          >
            Load Sample Flow
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-96 rounded-xl border shadow-2xl z-50 overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-500 bg-gray-800/50' : 'text-gray-400 bg-gray-50'
              }`}>
                Choose an Industry
              </div>
              <div className="max-h-80 overflow-y-auto">
                {sampleFlows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => {
                      onLoadSample(flow.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 ${
                      theme === 'dark'
                        ? 'hover:bg-gray-800 border-gray-800'
                        : 'hover:bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {flow.name}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {flow.description}
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        theme === 'dark'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {flow.industry}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          {sampleFlows.length} industry templates available
        </p>
      </div>
    </div>
  );
}
