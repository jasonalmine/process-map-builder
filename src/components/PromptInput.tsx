'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, X, ChevronDown } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { layoutFlow } from '@/lib/layoutFlow';
import { ProcessNode, ProcessEdge, GeneratedFlow } from '@/types/flow';

const examplePrompts = [
  "When a lead fills out our contact form, send them a welcome email. If they open it, call them within 24 hours. If they don't open after 3 days, send a follow-up.",
  "Customer calls in → Receptionist qualifies the lead → If qualified, schedule appointment → Technician visits → Provide estimate → If accepted, schedule work → Complete job → Send invoice → Follow up for review",
  "Website visitor clicks ad → Landing page → Form submission → CRM entry → Sales rep assigned → Initial call → If interested, send proposal → Negotiation → Close deal or mark as lost",
];

export default function PromptInput() {
  const [input, setInput] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const { isGenerating, setIsGenerating, setNodes, setEdges, clearFlow } =
    useFlowStore();

  const generateFlow = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    clearFlow();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flow');
      }

      const data: GeneratedFlow = await response.json();

      // Convert to React Flow format
      const nodes: ProcessNode[] = data.nodes.map((node, index) => ({
        id: node.id,
        type: 'processNode',
        position: { x: 0, y: index * 150 },
        data: {
          label: node.label,
          description: node.description,
          nodeType: node.type,
        },
      }));

      const edges: ProcessEdge[] = data.edges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'animated',
        data: { label: edge.label },
      }));

      // Apply layout
      const layoutedNodes = layoutFlow(nodes, edges);

      // Animate nodes appearing one by one
      for (let i = 0; i < layoutedNodes.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setNodes(layoutedNodes.slice(0, i + 1));
        setEdges(edges.filter((e) => {
          const sourceNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.source);
          const targetNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.target);
          return sourceNode && targetNode;
        }));
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generateFlow();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto pointer-events-auto"
      >
        {/* Examples dropdown */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Example Prompts</h3>
                <button
                  onClick={() => setShowExamples(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                      setShowExamples(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-sm text-gray-300 transition-colors line-clamp-2"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main input */}
        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-400">
              Describe your process flow
            </span>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Examples
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="When a customer calls, the receptionist takes their information and schedules an appointment..."
            className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-4 resize-none focus:outline-none text-sm leading-relaxed"
            rows={3}
            disabled={isGenerating}
          />

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/50">
            <span className="text-xs text-gray-500">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to
              generate
            </span>

            <button
              onClick={generateFlow}
              disabled={!input.trim() || isGenerating}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200
                ${
                  input.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Flow
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
