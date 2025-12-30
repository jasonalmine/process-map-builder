'use client';

import { useState, memo } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Section {
  title: string;
  items: { syntax: string; description: string }[];
}

const SECTIONS: Section[] = [
  {
    title: 'Getting Started',
    items: [
      { syntax: 'graph TD', description: 'Top-down flowchart' },
      { syntax: 'graph LR', description: 'Left-to-right flowchart' },
      { syntax: 'graph TB', description: 'Same as TD (top-bottom)' },
      { syntax: 'graph RL', description: 'Right-to-left flowchart' },
    ],
  },
  {
    title: 'Node Shapes',
    items: [
      { syntax: 'A[Rectangle]', description: 'Standard rectangle (action)' },
      { syntax: 'B(Rounded)', description: 'Rounded rectangle' },
      { syntax: 'C([Stadium])', description: 'Stadium/pill shape (trigger/outcome)' },
      { syntax: 'D{Diamond}', description: 'Diamond (decision)' },
      { syntax: 'E((Circle))', description: 'Circle (delay/wait)' },
      { syntax: 'F[[Subroutine]]', description: 'Subroutine (integration)' },
      { syntax: 'G[/Parallelogram/]', description: 'Parallelogram (input/output)' },
      { syntax: 'H[\\Parallelogram\\]', description: 'Alt parallelogram' },
      { syntax: 'I{{Hexagon}}', description: 'Hexagon' },
    ],
  },
  {
    title: 'Connections (Edges)',
    items: [
      { syntax: 'A --> B', description: 'Arrow connection' },
      { syntax: 'A --- B', description: 'Line without arrow' },
      { syntax: 'A -->|text| B', description: 'Arrow with label' },
      { syntax: 'A ---|text| B', description: 'Line with label' },
      { syntax: 'A -.-> B', description: 'Dotted arrow' },
      { syntax: 'A ==> B', description: 'Thick arrow' },
      { syntax: 'A --o B', description: 'Circle end' },
      { syntax: 'A --x B', description: 'Cross end' },
    ],
  },
  {
    title: 'Subgraphs (Groups)',
    items: [
      { syntax: 'subgraph title', description: 'Start a subgraph' },
      { syntax: 'subgraph id [Title]', description: 'Subgraph with ID' },
      { syntax: 'end', description: 'End subgraph' },
    ],
  },
  {
    title: 'Special Characters',
    items: [
      { syntax: 'A["Text with (parens)"]', description: 'Use quotes for special chars' },
      { syntax: "A['Single quotes']", description: 'Single quotes work too' },
      { syntax: 'A["`Markdown **bold**`"]', description: 'Markdown in labels' },
    ],
  },
];

function CollapsibleSection({ section }: { section: Section }) {
  const [isOpen, setIsOpen] = useState(true);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-sm font-semibold w-full ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {section.title}
      </button>

      {isOpen && (
        <div className="space-y-1.5 pl-6">
          {section.items.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 text-xs ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              <code
                className={`px-1.5 py-0.5 rounded font-mono shrink-0 ${
                  isDark ? 'bg-gray-800 text-purple-400' : 'bg-gray-100 text-purple-600'
                }`}
              >
                {item.syntax}
              </code>
              <span className="pt-0.5">{item.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CheatSheet() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
      {/* Quick example */}
      <div
        className={`p-3 rounded-xl ${
          isDark ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}
      >
        <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Quick Example:
        </p>
        <pre
          className={`text-xs font-mono whitespace-pre-wrap ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`}
        >
{`graph TD
    A([Start]) --> B[Process]
    B --> C{Decision?}
    C -->|Yes| D[Action]
    C -->|No| E([End])`}
        </pre>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <CollapsibleSection key={section.title} section={section} />
        ))}
      </div>

      {/* Link to docs */}
      <div className={`pt-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <a
          href="https://mermaid.js.org/syntax/flowchart.html"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs hover:underline ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`}
        >
          Full Mermaid Documentation &rarr;
        </a>
      </div>
    </div>
  );
}

export default memo(CheatSheet);
