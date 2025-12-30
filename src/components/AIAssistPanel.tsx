'use client';

import { useState, memo } from 'react';
import { useThemeStore } from '@/store/themeStore';
import {
  Wand2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Clipboard,
} from 'lucide-react';

const AI_SERVICES = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    color: 'bg-green-600 hover:bg-green-500',
    description: 'OpenAI',
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    color: 'bg-orange-600 hover:bg-orange-500',
    description: 'Anthropic',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    color: 'bg-blue-600 hover:bg-blue-500',
    description: 'Google',
  },
];

const SYSTEM_PROMPT = `You are a process flow architect. Convert the user's process description into a Mermaid flowchart.

Return ONLY valid Mermaid flowchart syntax (no markdown code blocks, no explanation). Use this format:

graph TD
    A[Start: Trigger Event] --> B[Action Step]
    B --> C{Decision Point?}
    C -->|Yes| D[Yes Path Action]
    C -->|No| E[No Path Action]
    D --> F[End: Outcome]
    E --> F

Node shapes to use:
- [Rectangle] for actions/steps: "Send Email", "Create Task", "Update Record"
- {Diamond} for decisions (yes/no): "Qualified?", "Interested?", "Approved?"
- ([Stadium]) for triggers and outcomes: "Form Submitted", "Deal Won", "Process Complete"
- ((Circle)) for delays/waits: "Wait 24hrs", "Delay 3 days"
- [[Subroutine]] for integrations: "Sync to CRM", "API Call"

When the user mentions specific tools (GoHighLevel, Zapier, HubSpot, Salesforce, Stripe, Calendly, Twilio, Slack, etc.), include them as labeled nodes.

Use subgraphs to group related steps:
    subgraph GroupName [Group Label]
        A[Step 1] --> B[Step 2]
    end

Syntax rules:
1. Start with "graph TD" (top-down) or "graph LR" (left-right)
2. Use short, unique IDs (A, B, C or descriptive like Start, Check, End)
3. Put labels inside the shape brackets
4. Use -->|Label| for labeled connections (Yes/No paths)
5. Use --> for unlabeled connections

Keep labels concise (max 5 words). Return ONLY the Mermaid code, nothing else.`;

const EXAMPLE_PROMPTS = [
  "Customer fills out a contact form, we send a welcome email, wait 2 days, then call them. If they're interested, schedule a demo. If not, add to nurture campaign.",
  "New order comes in, verify payment, check inventory. If in stock, ship it. If not, notify customer and offer alternatives.",
  "Support ticket created, auto-categorize by priority. High priority goes to senior agent, others go to queue. Resolve and send satisfaction survey.",
];

interface AIAssistPanelProps {
  onMermaidGenerated: (mermaid: string) => void;
}

function AIAssistPanel({ onMermaidGenerated }: AIAssistPanelProps) {
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedAI, setSelectedAI] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const generatePrompt = () => {
    return `${SYSTEM_PROMPT}

User's process description:
${description}`;
  };

  const copyPromptAndOpenAI = async (aiService: typeof AI_SERVICES[0]) => {
    const prompt = generatePrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setSelectedAI(aiService.id);
      setStep(2);

      // Open AI service in new tab
      window.open(aiService.url, '_blank');

      setTimeout(() => {
        setCopied(false);
        setStep(3);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePasteMermaid = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Clean up the pasted content - remove markdown code blocks if present
      let cleanCode = text.trim();
      const codeBlockMatch = cleanCode.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        cleanCode = codeBlockMatch[1].trim();
      }
      onMermaidGenerated(cleanCode);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedAI(null);
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors ${
                  step > s
                    ? 'bg-purple-600'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
        <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {step === 1 && 'Describe your process'}
          {step === 2 && 'Paste prompt in AI chat'}
          {step === 3 && 'Paste Mermaid result here'}
        </span>
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your process flow in plain English...

Example: When a customer submits a contact form, send them a welcome email, wait 24 hours, then have a sales rep call them. If they're interested, schedule a demo meeting. If not, add them to our newsletter."
            className={`w-full h-28 rounded-xl px-4 py-3 text-sm placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              isDark ? 'bg-gray-800/50 text-white' : 'bg-gray-100 text-gray-900'
            }`}
          />

          {/* Example prompts */}
          <div className="space-y-2">
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Or try an example:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(prompt)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors truncate max-w-[200px] ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {prompt.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* AI Service buttons */}
          <div className={`pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate with your favorite AI (free):
            </p>
            <div className="flex flex-wrap gap-2">
              {AI_SERVICES.map((ai) => (
                <button
                  key={ai.id}
                  onClick={() => copyPromptAndOpenAI(ai)}
                  disabled={!description.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ai.color}`}
                >
                  <Wand2 className="w-4 h-4" />
                  {ai.name}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Clicking a button copies the prompt and opens the AI in a new tab. Just paste!
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Waiting for AI */}
      {step === 2 && (
        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Prompt copied to clipboard!
            </span>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedAI === 'chatgpt' && 'Paste the prompt in ChatGPT and wait for the Mermaid code.'}
            {selectedAI === 'claude' && 'Paste the prompt in Claude and wait for the Mermaid code.'}
            {selectedAI === 'gemini' && 'Paste the prompt in Gemini and wait for the Mermaid code.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              I have the Mermaid code
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetFlow}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Paste Mermaid */}
      {step === 3 && (
        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <Clipboard className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Copy the Mermaid code from the AI
          </p>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select all the code the AI generated (starting with "graph TD" or "graph LR") and copy it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePasteMermaid}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/25"
            >
              <Clipboard className="w-4 h-4" />
              Paste from Clipboard
            </button>
            <button
              onClick={resetFlow}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AIAssistPanel);
