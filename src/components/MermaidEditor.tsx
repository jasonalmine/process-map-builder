'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Code2,
  Play,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { layoutFlow } from '@/lib/layoutFlow';
import { parseMermaid, convertMermaidToFlow } from '@/lib/parseMermaid';
import { flowToMermaid } from '@/lib/exportFlow';
import CheatSheet from './CheatSheet';
import AIAssistPanel from './AIAssistPanel';

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

interface MermaidEditorProps {
  defaultExpanded?: boolean;
}

export default function MermaidEditor({ defaultExpanded = false }: MermaidEditorProps) {
  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [synced, setSynced] = useState(false);
  const [enableGroups, setEnableGroups] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai-assist' | 'editor' | 'cheatsheet'>('ai-assist');

  const { nodes, edges, setNodes, setEdges, clearFlow } = useFlowStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Sync from canvas to code when canvas changes (if no active edits)
  const syncFromCanvas = useCallback(() => {
    if (nodes.length > 0) {
      const mermaidCode = flowToMermaid(nodes, edges);
      setCode(mermaidCode);
      setParseError(null);
    }
  }, [nodes, edges]);

  // Initialize code from canvas on mount
  useEffect(() => {
    if (nodes.length > 0 && !code) {
      syncFromCanvas();
    }
  }, []);

  // Parse and validate code
  const parseResult = useMemo(() => {
    if (!code.trim()) {
      return { valid: false, error: null, nodeCount: 0, edgeCount: 0 };
    }

    const result = parseMermaid(code);
    if (result.success && result.flow) {
      return {
        valid: true,
        error: null,
        nodeCount: result.flow.nodes.length,
        edgeCount: result.flow.edges.length,
      };
    }

    return { valid: false, error: result.error || 'Invalid syntax', nodeCount: 0, edgeCount: 0 };
  }, [code]);

  // Update error state
  useEffect(() => {
    if (code.trim() && !parseResult.valid) {
      setParseError(parseResult.error);
    } else {
      setParseError(null);
    }
  }, [code, parseResult]);

  // Apply code to canvas
  const applyToCanvas = useCallback(() => {
    if (!code.trim()) return;

    const result = parseMermaid(code);
    if (!result.success || !result.flow) {
      setParseError(result.error || 'Failed to parse');
      return;
    }

    const { nodes: newNodes, edges: newEdges } = convertMermaidToFlow(result.flow, { enableGroups });
    const layoutedNodes = layoutFlow(newNodes, newEdges);

    clearFlow();

    // Animate nodes appearing
    (async () => {
      for (let i = 0; i < layoutedNodes.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setNodes(layoutedNodes.slice(0, i + 1));
        setEdges(
          newEdges.filter((e) => {
            const sourceNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.source);
            const targetNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.target);
            return sourceNode && targetNode;
          })
        );
      }
    })();

    setSynced(true);
    setTimeout(() => setSynced(false), 2000);
  }, [code, enableGroups, clearFlow, setNodes, setEdges]);

  // Copy code to clipboard
  const copyCode = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto p-4 pointer-events-auto"
      >
        <div
          className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
            isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mermaid Editor
              </span>
              {parseResult.valid && code.trim() && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  {parseResult.nodeCount} nodes, {parseResult.edgeCount} edges
                </span>
              )}
              {parseError && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Error
                </span>
              )}
            </div>
            <button
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  {[
                    { id: 'ai-assist', label: 'AI Assist', icon: Wand2 },
                    { id: 'editor', label: 'Editor', icon: Code2 },
                    { id: 'cheatsheet', label: 'Cheat Sheet', icon: AlertCircle },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(tab.id as typeof activeTab);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? isDark
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-purple-600 border-b-2 border-purple-600'
                          : isDark
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {activeTab === 'editor' && (
                    <div className="space-y-3">
                      {/* Code editor */}
                      <div
                        className={`rounded-xl overflow-hidden border ${
                          parseError
                            ? 'border-red-500/50'
                            : isDark
                            ? 'border-gray-700'
                            : 'border-gray-300'
                        }`}
                      >
                        <CodeMirror
                          value={code}
                          height="200px"
                          theme={isDark ? 'dark' : 'light'}
                          onChange={(value) => setCode(value)}
                          placeholder={`graph TD
    A([Start]) --> B[Process Step]
    B --> C{Decision?}
    C -->|Yes| D[Action]
    C -->|No| E([End])`}
                          basicSetup={{
                            lineNumbers: true,
                            highlightActiveLineGutter: true,
                            foldGutter: false,
                          }}
                        />
                      </div>

                      {/* Error message */}
                      {parseError && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg ${
                          isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                        }`}>
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{parseError}</span>
                        </div>
                      )}

                      {/* Options and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Groups toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableGroups}
                              onChange={(e) => setEnableGroups(e.target.checked)}
                              className="sr-only"
                            />
                            <div
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                enableGroups
                                  ? 'bg-purple-600'
                                  : isDark
                                  ? 'bg-gray-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                  enableGroups ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              Enable Groups
                            </span>
                          </label>

                          {/* Sync from canvas */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              syncFromCanvas();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              isDark
                                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Sync from Canvas
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode();
                            }}
                            disabled={!code.trim()}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                              isDark
                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
                            }`}
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </>
                            )}
                          </button>

                          {/* Apply button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyToCanvas();
                            }}
                            disabled={!parseResult.valid}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              synced
                                ? 'bg-green-600 text-white'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {synced ? (
                              <>
                                <Check className="w-4 h-4" />
                                Applied!
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Apply to Canvas
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'ai-assist' && (
                    <AIAssistPanel onMermaidGenerated={(mermaid) => {
                      setCode(mermaid);
                      setActiveTab('editor');
                    }} />
                  )}

                  {activeTab === 'cheatsheet' && <CheatSheet />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
