'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  X,
  ChevronDown,
  Copy,
  ClipboardPaste,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { layoutFlow } from '@/lib/layoutFlow';
import { ProcessNode, ProcessEdge, GeneratedFlow } from '@/types/flow';

const examplePrompts = [
  "When a lead fills out our contact form, send them a welcome email. If they open it, call them within 24 hours. If they don't open after 3 days, send a follow-up.",
  "Customer calls in → Receptionist qualifies the lead → If qualified, schedule appointment → Technician visits → Provide estimate → If accepted, schedule work → Complete job → Send invoice → Follow up for review",
  "Website visitor clicks ad → Landing page → Form submission → CRM entry → Sales rep assigned → Initial call → If interested, send proposal → Negotiation → Close deal or mark as lost",
];

const AI_LINKS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', color: 'bg-green-600' },
  { name: 'Claude', url: 'https://claude.ai', color: 'bg-orange-600' },
  { name: 'Gemini', url: 'https://gemini.google.com/app', color: 'bg-blue-600' },
];

const SYSTEM_PROMPT = `You are a process flow architect. Convert the user's process description into a flowchart structure.

Return ONLY valid JSON (no markdown, no code blocks, no explanation) with this exact structure:
{
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger|action|decision|delay|outcome|integration",
      "label": "Short label (max 5 words)",
      "description": "Optional longer description"
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "label": "Optional edge label (Yes/No/etc)"
    }
  ]
}

Node types:
- trigger: Starting points (form submission, phone call, ad click)
- action: Things that happen (send email, make call, assign to rep)
- decision: Yes/No branches (did they respond? qualified?)
- delay: Time waits (wait 24 hours, after 3 days)
- outcome: End states (converted, lost, cold, completed)
- integration: External systems (add to CRM, Slack notification)

Guidelines:
1. Start with a trigger node
2. End branches with outcome nodes
3. For decisions, create Yes/No branches
4. Keep labels concise (max 5 words)
5. Ensure all node IDs are unique and match in edges

IMPORTANT: Return ONLY the JSON object, nothing else.`;

export default function PromptInput() {
  const [input, setInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedForAI, setCopiedForAI] = useState<string | null>(null);
  const [parseError, setParseError] = useState('');
  const { setNodes, setEdges, clearFlow } = useFlowStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const generatePromptForAI = () => {
    return `${SYSTEM_PROMPT}

User's process description:
${input}`;
  };

  const copyPromptToClipboard = async () => {
    const fullPrompt = generatePromptForAI();
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAILinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, aiName: string) => {
    if (!input.trim()) {
      e.preventDefault();
      return;
    }

    // Copy prompt to clipboard before opening
    const fullPrompt = generatePromptForAI();
    await navigator.clipboard.writeText(fullPrompt);
    setCopiedForAI(aiName);
    setTimeout(() => setCopiedForAI(null), 3000);
  };

  const parseAndRenderFlow = (jsonString: string) => {
    setParseError('');

    try {
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found. Make sure to copy the entire JSON response.');
      }

      const data: GeneratedFlow = JSON.parse(jsonMatch[0]);

      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid format: missing "nodes" array');
      }
      if (!data.edges || !Array.isArray(data.edges)) {
        throw new Error('Invalid format: missing "edges" array');
      }

      const nodes = data.nodes.map((node, index) => ({
        id: node.id,
        type: 'processNode' as const,
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

      const layoutedNodes = layoutFlow(nodes, edges);

      clearFlow();
      (async () => {
        for (let i = 0; i < layoutedNodes.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setNodes(layoutedNodes.slice(0, i + 1));
          setEdges(
            edges.filter((e) => {
              const sourceNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.source);
              const targetNode = layoutedNodes.slice(0, i + 1).find((n) => n.id === e.target);
              return sourceNode && targetNode;
            })
          );
        }
      })();

      setShowManualMode(false);
      setJsonInput('');
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse JSON');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto pointer-events-auto"
      >
        {/* How To Use Modal */}
        <AnimatePresence>
          {showHowToUse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mb-3 backdrop-blur-xl rounded-2xl border p-5 shadow-2xl ${
                isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  How to Use ProcessAI
                </h3>
                <button
                  onClick={() => setShowHowToUse(false)}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Describe your process</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Write your workflow in plain English in the text box below</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Copy the prompt</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click "Copy Prompt" to copy a structured prompt to your clipboard</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Click an AI button below</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>The prompt is auto-copied to your clipboard. Just paste (Ctrl/Cmd+V) when the AI chat opens.</p>
                    <div className="flex gap-1 mt-2">
                      {AI_LINKS.map((ai) => (
                        <a
                          key={ai.name}
                          href={ai.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleAILinkClick(e, ai.name)}
                          className={`px-2 py-1 text-[10px] font-medium text-white ${ai.color} hover:opacity-80 rounded transition-opacity ${
                            !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {ai.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">4</div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Paste the JSON response</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Copy the AI's JSON response, click "Paste JSON", and generate your flowchart!</p>
                  </div>
                </div>

                <div className={`pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className="text-purple-400 font-medium">Tip:</span> Use the layout buttons on the left to rearrange your flow. You can also drag nodes to reposition them manually.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual JSON Input Modal */}
        <AnimatePresence>
          {showManualMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mb-3 backdrop-blur-xl rounded-2xl border p-4 shadow-2xl ${
                isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Paste AI Response (JSON)
                </h3>
                <button
                  onClick={() => {
                    setShowManualMode(false);
                    setParseError('');
                  }}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste the JSON response from ChatGPT/Claude/Gemini here...'
                className={`w-full h-32 rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono resize-none ${
                  isDark ? 'bg-gray-800/50 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />

              {parseError && (
                <p className="text-red-400 text-xs mt-2">{parseError}</p>
              )}

              <button
                onClick={() => parseAndRenderFlow(jsonInput)}
                disabled={!jsonInput.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Wand2 className="w-4 h-4" />
                Generate Flow
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples dropdown */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mb-3 backdrop-blur-xl rounded-2xl border p-4 shadow-2xl ${
                isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Example Prompts</h3>
                <button
                  onClick={() => setShowExamples(false)}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
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
                    className={`w-full text-left p-3 rounded-xl text-sm transition-colors line-clamp-2 ${
                      isDark ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main input */}
        <div className={`relative backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
        }`}>
          <div className={`flex items-center gap-2 px-4 py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Describe your process flow
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowHowToUse(!showHowToUse)}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How to use
              </button>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Examples
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="When a customer calls, the receptionist takes their information and schedules an appointment..."
            className={`w-full bg-transparent placeholder-gray-500 px-4 py-4 resize-none focus:outline-none text-sm leading-relaxed ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            rows={3}
          />

          <div className={`flex items-center justify-between px-4 py-3 border-t gap-2 ${
            isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            {/* Left side - Copy Prompt and AI links */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copyPromptToClipboard}
                disabled={!input.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 border-gray-300'
                }`}
                title="Copy prompt for free AI"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Prompt
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                {AI_LINKS.map((ai) => (
                  <a
                    key={ai.name}
                    href={ai.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleAILinkClick(e, ai.name)}
                    className={`px-2 py-1 text-[10px] font-medium text-white ${ai.color} hover:opacity-80 rounded transition-all ${
                      !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    } ${copiedForAI === ai.name ? `ring-2 ring-white ring-offset-1 ${isDark ? 'ring-offset-gray-900' : 'ring-offset-white'}` : ''}`}
                    title={input.trim() ? `Copy prompt & open ${ai.name}` : 'Enter a process description first'}
                  >
                    {copiedForAI === ai.name ? 'Copied! Paste in chat' : ai.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right side - Paste JSON button (main action) */}
            <button
              onClick={() => setShowManualMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste JSON
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
