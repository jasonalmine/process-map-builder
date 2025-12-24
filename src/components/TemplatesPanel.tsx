'use client';

import { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import {
  GitBranch,
  RefreshCw,
  Users,
  ShoppingCart,
  FileText,
  Headphones,
  Mail,
  Zap,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'snippet' | 'workflow';
  code: string;
}

const TEMPLATES: Template[] = [
  // Snippets
  {
    id: 'decision',
    name: 'Decision Block',
    description: 'Yes/No branching logic',
    icon: GitBranch,
    category: 'snippet',
    code: `graph TD
    A[Previous Step] --> B{Decision?}
    B -->|Yes| C[Yes Path]
    B -->|No| D[No Path]`,
  },
  {
    id: 'loop',
    name: 'Retry Loop',
    description: 'Retry with max attempts',
    icon: RefreshCw,
    category: 'snippet',
    code: `graph TD
    A[Start Process] --> B[Attempt Action]
    B --> C{Success?}
    C -->|Yes| D[Continue]
    C -->|No| E{Max Retries?}
    E -->|No| B
    E -->|Yes| F[Handle Failure]`,
  },
  {
    id: 'parallel',
    name: 'Parallel Paths',
    description: 'Multiple concurrent actions',
    icon: Zap,
    category: 'snippet',
    code: `graph TD
    A[Start] --> B[Action 1]
    A --> C[Action 2]
    A --> D[Action 3]
    B --> E[Merge]
    C --> E
    D --> E`,
  },
  {
    id: 'approval',
    name: 'Approval Flow',
    description: 'Request and approve pattern',
    icon: FileText,
    category: 'snippet',
    code: `graph TD
    A([Request Submitted]) --> B[Review Request]
    B --> C{Approved?}
    C -->|Yes| D[Process Approved]
    C -->|No| E{Revisions Needed?}
    E -->|Yes| F[Request Changes]
    F --> A
    E -->|No| G([Rejected])
    D --> H([Complete])`,
  },

  // Full Workflows
  {
    id: 'lead-nurture',
    name: 'Lead Nurture',
    description: 'Email follow-up sequence',
    icon: Mail,
    category: 'workflow',
    code: `graph TD
    A([New Lead]) --> B[Send Welcome Email]
    B --> C((Wait 2 Days))
    C --> D{Opened Email?}
    D -->|Yes| E[Send Product Info]
    D -->|No| F[Send Reminder]
    E --> G((Wait 3 Days))
    F --> G
    G --> H{Engaged?}
    H -->|Yes| I[Schedule Call]
    H -->|No| J[Add to Drip Campaign]
    I --> K([Qualified Lead])
    J --> L([Nurturing])`,
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Ticket handling workflow',
    icon: Headphones,
    category: 'workflow',
    code: `graph TD
    A([Ticket Created]) --> B[Auto-Categorize]
    B --> C{Priority Level}
    C -->|High| D[Escalate to Senior]
    C -->|Medium| E[Assign to Agent]
    C -->|Low| F[Auto-Response]
    D --> G[Immediate Response]
    E --> H[Queue for Response]
    F --> I{Resolved?}
    G --> J[Work on Issue]
    H --> J
    I -->|Yes| K([Closed])
    I -->|No| E
    J --> L{Resolved?}
    L -->|Yes| M[Send Survey]
    L -->|No| N{Needs Escalation?}
    N -->|Yes| D
    N -->|No| J
    M --> K`,
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Order',
    description: 'Order processing flow',
    icon: ShoppingCart,
    category: 'workflow',
    code: `graph TD
    A([Order Placed]) --> B[Verify Payment]
    B --> C{Payment Valid?}
    C -->|No| D[Request New Payment]
    D --> E{Retry Success?}
    E -->|No| F([Order Cancelled])
    E -->|Yes| G[Process Order]
    C -->|Yes| G
    G --> H[Check Inventory]
    H --> I{In Stock?}
    I -->|Yes| J[Pick & Pack]
    I -->|No| K[Backorder]
    K --> L[Notify Customer]
    L --> M((Wait for Stock))
    M --> J
    J --> N[Ship Order]
    N --> O[Send Tracking]
    O --> P([Delivered])`,
  },
  {
    id: 'onboarding',
    name: 'User Onboarding',
    description: 'New user activation flow',
    icon: Users,
    category: 'workflow',
    code: `graph TD
    A([User Signs Up]) --> B[Send Welcome Email]
    B --> C[Show Tutorial]
    C --> D{Completed Tutorial?}
    D -->|Yes| E[Unlock Features]
    D -->|No| F((Wait 1 Day))
    F --> G[Send Reminder]
    G --> H{Returned?}
    H -->|Yes| C
    H -->|No| I((Wait 3 Days))
    I --> J[Send Re-engagement]
    J --> K{Activated?}
    K -->|Yes| E
    K -->|No| L([Inactive User])
    E --> M[Track Milestones]
    M --> N{First Success?}
    N -->|Yes| O[Celebrate & Upsell]
    N -->|No| P[Offer Help]
    P --> M
    O --> Q([Active User])`,
  },
];

interface TemplatesPanelProps {
  onInsert: (code: string) => void;
}

export default function TemplatesPanel({ onInsert }: TemplatesPanelProps) {
  const [activeCategory, setActiveCategory] = useState<'snippet' | 'workflow'>('snippet');
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const filteredTemplates = TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2">
        {[
          { id: 'snippet', label: 'Snippets' },
          { id: 'workflow', label: 'Full Workflows' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as 'snippet' | 'workflow')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onInsert(template.code)}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
              isDark
                ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50 hover:bg-gray-800'
                : 'bg-gray-50 border-gray-200 hover:border-purple-400 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <template.icon
                className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
              />
              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {template.name}
              </span>
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {template.description}
            </span>
          </button>
        ))}
      </div>

      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Click a template to insert it into the editor
      </p>
    </div>
  );
}
