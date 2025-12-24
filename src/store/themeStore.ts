import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NodeType } from '@/types/flow';

type Theme = 'light' | 'dark';

// Node color themes - 5 options: Default, Wood, Green, Purple, Rainbow
export type ColorTheme = 'default' | 'wood' | 'green' | 'purple' | 'rainbow';

// Node style configuration per node type
export interface NodeStyleConfig {
  gradient: string;
  borderColor: string;
  iconBg: string;
  minimapColor: string;
}

export interface GroupColorConfig {
  bg: string;
  border: string;
  borderSelected: string;
  text: string;
  textMuted: string;
}

export interface ColorThemeConfig {
  id: ColorTheme;
  label: string;
  description: string;
  swatches: string[]; // Preview colors for the theme picker
  nodes: Record<NodeType, NodeStyleConfig>;
  group: {
    dark: GroupColorConfig;
    light: GroupColorConfig;
  };
  // Array of group colors for cycling through multiple groups
  groupColors: {
    dark: GroupColorConfig[];
    light: GroupColorConfig[];
  };
}

export const COLOR_THEMES: ColorThemeConfig[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Classic colorful palette',
    swatches: ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'],
    nodes: {
      trigger: {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/50',
        iconBg: 'bg-blue-500',
        minimapColor: '#3b82f6',
      },
      action: {
        gradient: 'from-emerald-500/20 to-teal-500/20',
        borderColor: 'border-emerald-500/50',
        iconBg: 'bg-emerald-500',
        minimapColor: '#10b981',
      },
      decision: {
        gradient: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber-500/50',
        iconBg: 'bg-amber-500',
        minimapColor: '#f59e0b',
      },
      delay: {
        gradient: 'from-purple-500/20 to-violet-500/20',
        borderColor: 'border-purple-500/50',
        iconBg: 'bg-purple-500',
        minimapColor: '#8b5cf6',
      },
      outcome: {
        gradient: 'from-green-500/20 to-emerald-500/20',
        borderColor: 'border-green-500/50',
        iconBg: 'bg-green-500',
        minimapColor: '#22c55e',
      },
      integration: {
        gradient: 'from-pink-500/20 to-rose-500/20',
        borderColor: 'border-pink-500/50',
        iconBg: 'bg-pink-500',
        minimapColor: '#ec4899',
      },
      tool: {
        gradient: 'from-slate-500/20 to-gray-500/20',
        borderColor: 'border-slate-400/50',
        iconBg: 'bg-slate-600',
        minimapColor: '#64748b',
      },
    },
    group: {
      dark: { bg: 'bg-gray-500/20', border: 'border-gray-500/50', borderSelected: '!border-gray-400', text: 'text-gray-300', textMuted: 'text-gray-400' },
      light: { bg: 'bg-gray-100', border: 'border-gray-300', borderSelected: '!border-gray-500', text: 'text-gray-700', textMuted: 'text-gray-500' },
    },
    groupColors: {
      dark: [
        { bg: 'bg-blue-500/15', border: 'border-blue-500/40', borderSelected: '!border-blue-400', text: 'text-blue-200', textMuted: 'text-blue-300' },
        { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', borderSelected: '!border-emerald-400', text: 'text-emerald-200', textMuted: 'text-emerald-300' },
        { bg: 'bg-amber-500/15', border: 'border-amber-500/40', borderSelected: '!border-amber-400', text: 'text-amber-200', textMuted: 'text-amber-300' },
        { bg: 'bg-purple-500/15', border: 'border-purple-500/40', borderSelected: '!border-purple-400', text: 'text-purple-200', textMuted: 'text-purple-300' },
        { bg: 'bg-pink-500/15', border: 'border-pink-500/40', borderSelected: '!border-pink-400', text: 'text-pink-200', textMuted: 'text-pink-300' },
        { bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', borderSelected: '!border-cyan-400', text: 'text-cyan-200', textMuted: 'text-cyan-300' },
      ],
      light: [
        { bg: 'bg-blue-100', border: 'border-blue-300', borderSelected: '!border-blue-500', text: 'text-blue-800', textMuted: 'text-blue-600' },
        { bg: 'bg-emerald-100', border: 'border-emerald-300', borderSelected: '!border-emerald-500', text: 'text-emerald-800', textMuted: 'text-emerald-600' },
        { bg: 'bg-amber-100', border: 'border-amber-300', borderSelected: '!border-amber-500', text: 'text-amber-800', textMuted: 'text-amber-600' },
        { bg: 'bg-purple-100', border: 'border-purple-300', borderSelected: '!border-purple-500', text: 'text-purple-800', textMuted: 'text-purple-600' },
        { bg: 'bg-pink-100', border: 'border-pink-300', borderSelected: '!border-pink-500', text: 'text-pink-800', textMuted: 'text-pink-600' },
        { bg: 'bg-cyan-100', border: 'border-cyan-300', borderSelected: '!border-cyan-500', text: 'text-cyan-800', textMuted: 'text-cyan-600' },
      ],
    },
  },
  {
    id: 'wood',
    label: 'Wood',
    description: 'Warm earthy browns',
    swatches: ['bg-amber-800', 'bg-amber-600', 'bg-orange-700', 'bg-yellow-800'],
    nodes: {
      trigger: {
        gradient: 'from-amber-800/25 to-amber-700/20',
        borderColor: 'border-amber-700/60',
        iconBg: 'bg-amber-800',
        minimapColor: '#92400e',
      },
      action: {
        gradient: 'from-amber-600/25 to-yellow-700/20',
        borderColor: 'border-amber-600/60',
        iconBg: 'bg-amber-600',
        minimapColor: '#d97706',
      },
      decision: {
        gradient: 'from-orange-700/25 to-amber-600/20',
        borderColor: 'border-orange-600/60',
        iconBg: 'bg-orange-700',
        minimapColor: '#c2410c',
      },
      delay: {
        gradient: 'from-yellow-800/25 to-amber-700/20',
        borderColor: 'border-yellow-700/60',
        iconBg: 'bg-yellow-800',
        minimapColor: '#a16207',
      },
      outcome: {
        gradient: 'from-amber-700/25 to-orange-600/20',
        borderColor: 'border-amber-700/60',
        iconBg: 'bg-amber-700',
        minimapColor: '#b45309',
      },
      integration: {
        gradient: 'from-orange-800/25 to-red-700/20',
        borderColor: 'border-orange-700/60',
        iconBg: 'bg-orange-800',
        minimapColor: '#9a3412',
      },
      tool: {
        gradient: 'from-stone-600/25 to-stone-500/20',
        borderColor: 'border-stone-500/60',
        iconBg: 'bg-stone-600',
        minimapColor: '#78716c',
      },
    },
    group: {
      dark: { bg: 'bg-amber-900/30', border: 'border-amber-800/50', borderSelected: '!border-amber-600', text: 'text-amber-200', textMuted: 'text-amber-300' },
      light: { bg: 'bg-amber-50', border: 'border-amber-300', borderSelected: '!border-amber-600', text: 'text-amber-900', textMuted: 'text-amber-700' },
    },
    groupColors: {
      dark: [
        { bg: 'bg-amber-800/20', border: 'border-amber-700/50', borderSelected: '!border-amber-500', text: 'text-amber-200', textMuted: 'text-amber-300' },
        { bg: 'bg-orange-800/20', border: 'border-orange-700/50', borderSelected: '!border-orange-500', text: 'text-orange-200', textMuted: 'text-orange-300' },
        { bg: 'bg-yellow-800/20', border: 'border-yellow-700/50', borderSelected: '!border-yellow-500', text: 'text-yellow-200', textMuted: 'text-yellow-300' },
        { bg: 'bg-stone-700/20', border: 'border-stone-600/50', borderSelected: '!border-stone-500', text: 'text-stone-200', textMuted: 'text-stone-300' },
        { bg: 'bg-red-900/20', border: 'border-red-800/50', borderSelected: '!border-red-600', text: 'text-red-200', textMuted: 'text-red-300' },
        { bg: 'bg-lime-900/20', border: 'border-lime-800/50', borderSelected: '!border-lime-600', text: 'text-lime-200', textMuted: 'text-lime-300' },
      ],
      light: [
        { bg: 'bg-amber-100', border: 'border-amber-400', borderSelected: '!border-amber-600', text: 'text-amber-900', textMuted: 'text-amber-700' },
        { bg: 'bg-orange-100', border: 'border-orange-400', borderSelected: '!border-orange-600', text: 'text-orange-900', textMuted: 'text-orange-700' },
        { bg: 'bg-yellow-100', border: 'border-yellow-400', borderSelected: '!border-yellow-600', text: 'text-yellow-900', textMuted: 'text-yellow-700' },
        { bg: 'bg-stone-100', border: 'border-stone-400', borderSelected: '!border-stone-600', text: 'text-stone-900', textMuted: 'text-stone-700' },
        { bg: 'bg-red-100', border: 'border-red-300', borderSelected: '!border-red-500', text: 'text-red-900', textMuted: 'text-red-700' },
        { bg: 'bg-lime-100', border: 'border-lime-300', borderSelected: '!border-lime-500', text: 'text-lime-900', textMuted: 'text-lime-700' },
      ],
    },
  },
  {
    id: 'green',
    label: 'Forest',
    description: 'Natural greens',
    swatches: ['bg-emerald-700', 'bg-green-600', 'bg-teal-600', 'bg-lime-600'],
    nodes: {
      trigger: {
        gradient: 'from-emerald-700/25 to-green-600/20',
        borderColor: 'border-emerald-600/60',
        iconBg: 'bg-emerald-700',
        minimapColor: '#047857',
      },
      action: {
        gradient: 'from-green-600/25 to-emerald-500/20',
        borderColor: 'border-green-500/60',
        iconBg: 'bg-green-600',
        minimapColor: '#16a34a',
      },
      decision: {
        gradient: 'from-teal-600/25 to-emerald-500/20',
        borderColor: 'border-teal-500/60',
        iconBg: 'bg-teal-600',
        minimapColor: '#0d9488',
      },
      delay: {
        gradient: 'from-lime-600/25 to-green-500/20',
        borderColor: 'border-lime-500/60',
        iconBg: 'bg-lime-600',
        minimapColor: '#65a30d',
      },
      outcome: {
        gradient: 'from-green-700/25 to-teal-600/20',
        borderColor: 'border-green-600/60',
        iconBg: 'bg-green-700',
        minimapColor: '#15803d',
      },
      integration: {
        gradient: 'from-teal-700/25 to-cyan-600/20',
        borderColor: 'border-teal-600/60',
        iconBg: 'bg-teal-700',
        minimapColor: '#0f766e',
      },
      tool: {
        gradient: 'from-emerald-800/25 to-green-700/20',
        borderColor: 'border-emerald-700/60',
        iconBg: 'bg-emerald-800',
        minimapColor: '#065f46',
      },
    },
    group: {
      dark: { bg: 'bg-emerald-900/30', border: 'border-emerald-700/50', borderSelected: '!border-emerald-500', text: 'text-emerald-200', textMuted: 'text-emerald-300' },
      light: { bg: 'bg-emerald-50', border: 'border-emerald-300', borderSelected: '!border-emerald-600', text: 'text-emerald-900', textMuted: 'text-emerald-700' },
    },
    groupColors: {
      dark: [
        { bg: 'bg-emerald-800/20', border: 'border-emerald-600/50', borderSelected: '!border-emerald-500', text: 'text-emerald-200', textMuted: 'text-emerald-300' },
        { bg: 'bg-green-800/20', border: 'border-green-600/50', borderSelected: '!border-green-500', text: 'text-green-200', textMuted: 'text-green-300' },
        { bg: 'bg-teal-800/20', border: 'border-teal-600/50', borderSelected: '!border-teal-500', text: 'text-teal-200', textMuted: 'text-teal-300' },
        { bg: 'bg-lime-800/20', border: 'border-lime-600/50', borderSelected: '!border-lime-500', text: 'text-lime-200', textMuted: 'text-lime-300' },
        { bg: 'bg-cyan-800/20', border: 'border-cyan-600/50', borderSelected: '!border-cyan-500', text: 'text-cyan-200', textMuted: 'text-cyan-300' },
        { bg: 'bg-sky-800/20', border: 'border-sky-600/50', borderSelected: '!border-sky-500', text: 'text-sky-200', textMuted: 'text-sky-300' },
      ],
      light: [
        { bg: 'bg-emerald-100', border: 'border-emerald-400', borderSelected: '!border-emerald-600', text: 'text-emerald-900', textMuted: 'text-emerald-700' },
        { bg: 'bg-green-100', border: 'border-green-400', borderSelected: '!border-green-600', text: 'text-green-900', textMuted: 'text-green-700' },
        { bg: 'bg-teal-100', border: 'border-teal-400', borderSelected: '!border-teal-600', text: 'text-teal-900', textMuted: 'text-teal-700' },
        { bg: 'bg-lime-100', border: 'border-lime-400', borderSelected: '!border-lime-600', text: 'text-lime-900', textMuted: 'text-lime-700' },
        { bg: 'bg-cyan-100', border: 'border-cyan-400', borderSelected: '!border-cyan-600', text: 'text-cyan-900', textMuted: 'text-cyan-700' },
        { bg: 'bg-sky-100', border: 'border-sky-400', borderSelected: '!border-sky-600', text: 'text-sky-900', textMuted: 'text-sky-700' },
      ],
    },
  },
  {
    id: 'purple',
    label: 'Violet',
    description: 'Rich purples',
    swatches: ['bg-purple-700', 'bg-violet-600', 'bg-fuchsia-600', 'bg-indigo-600'],
    nodes: {
      trigger: {
        gradient: 'from-purple-700/25 to-violet-600/20',
        borderColor: 'border-purple-600/60',
        iconBg: 'bg-purple-700',
        minimapColor: '#7e22ce',
      },
      action: {
        gradient: 'from-violet-600/25 to-purple-500/20',
        borderColor: 'border-violet-500/60',
        iconBg: 'bg-violet-600',
        minimapColor: '#7c3aed',
      },
      decision: {
        gradient: 'from-fuchsia-600/25 to-purple-500/20',
        borderColor: 'border-fuchsia-500/60',
        iconBg: 'bg-fuchsia-600',
        minimapColor: '#c026d3',
      },
      delay: {
        gradient: 'from-indigo-600/25 to-violet-500/20',
        borderColor: 'border-indigo-500/60',
        iconBg: 'bg-indigo-600',
        minimapColor: '#4f46e5',
      },
      outcome: {
        gradient: 'from-purple-600/25 to-fuchsia-500/20',
        borderColor: 'border-purple-500/60',
        iconBg: 'bg-purple-600',
        minimapColor: '#9333ea',
      },
      integration: {
        gradient: 'from-pink-600/25 to-fuchsia-500/20',
        borderColor: 'border-pink-500/60',
        iconBg: 'bg-pink-600',
        minimapColor: '#db2777',
      },
      tool: {
        gradient: 'from-violet-700/25 to-indigo-600/20',
        borderColor: 'border-violet-600/60',
        iconBg: 'bg-violet-700',
        minimapColor: '#6d28d9',
      },
    },
    group: {
      dark: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', borderSelected: '!border-purple-500', text: 'text-purple-200', textMuted: 'text-purple-300' },
      light: { bg: 'bg-purple-50', border: 'border-purple-300', borderSelected: '!border-purple-600', text: 'text-purple-900', textMuted: 'text-purple-700' },
    },
    groupColors: {
      dark: [
        { bg: 'bg-purple-800/20', border: 'border-purple-600/50', borderSelected: '!border-purple-500', text: 'text-purple-200', textMuted: 'text-purple-300' },
        { bg: 'bg-violet-800/20', border: 'border-violet-600/50', borderSelected: '!border-violet-500', text: 'text-violet-200', textMuted: 'text-violet-300' },
        { bg: 'bg-fuchsia-800/20', border: 'border-fuchsia-600/50', borderSelected: '!border-fuchsia-500', text: 'text-fuchsia-200', textMuted: 'text-fuchsia-300' },
        { bg: 'bg-indigo-800/20', border: 'border-indigo-600/50', borderSelected: '!border-indigo-500', text: 'text-indigo-200', textMuted: 'text-indigo-300' },
        { bg: 'bg-pink-800/20', border: 'border-pink-600/50', borderSelected: '!border-pink-500', text: 'text-pink-200', textMuted: 'text-pink-300' },
        { bg: 'bg-blue-800/20', border: 'border-blue-600/50', borderSelected: '!border-blue-500', text: 'text-blue-200', textMuted: 'text-blue-300' },
      ],
      light: [
        { bg: 'bg-purple-100', border: 'border-purple-400', borderSelected: '!border-purple-600', text: 'text-purple-900', textMuted: 'text-purple-700' },
        { bg: 'bg-violet-100', border: 'border-violet-400', borderSelected: '!border-violet-600', text: 'text-violet-900', textMuted: 'text-violet-700' },
        { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', borderSelected: '!border-fuchsia-600', text: 'text-fuchsia-900', textMuted: 'text-fuchsia-700' },
        { bg: 'bg-indigo-100', border: 'border-indigo-400', borderSelected: '!border-indigo-600', text: 'text-indigo-900', textMuted: 'text-indigo-700' },
        { bg: 'bg-pink-100', border: 'border-pink-400', borderSelected: '!border-pink-600', text: 'text-pink-900', textMuted: 'text-pink-700' },
        { bg: 'bg-blue-100', border: 'border-blue-400', borderSelected: '!border-blue-600', text: 'text-blue-900', textMuted: 'text-blue-700' },
      ],
    },
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    description: 'Vibrant spectrum',
    swatches: ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'],
    nodes: {
      trigger: {
        gradient: 'from-red-500/25 to-orange-500/20',
        borderColor: 'border-red-500/60',
        iconBg: 'bg-red-500',
        minimapColor: '#ef4444',
      },
      action: {
        gradient: 'from-orange-500/25 to-yellow-500/20',
        borderColor: 'border-orange-500/60',
        iconBg: 'bg-orange-500',
        minimapColor: '#f97316',
      },
      decision: {
        gradient: 'from-yellow-500/25 to-lime-500/20',
        borderColor: 'border-yellow-500/60',
        iconBg: 'bg-yellow-500',
        minimapColor: '#eab308',
      },
      delay: {
        gradient: 'from-green-500/25 to-teal-500/20',
        borderColor: 'border-green-500/60',
        iconBg: 'bg-green-500',
        minimapColor: '#22c55e',
      },
      outcome: {
        gradient: 'from-blue-500/25 to-indigo-500/20',
        borderColor: 'border-blue-500/60',
        iconBg: 'bg-blue-500',
        minimapColor: '#3b82f6',
      },
      integration: {
        gradient: 'from-indigo-500/25 to-purple-500/20',
        borderColor: 'border-indigo-500/60',
        iconBg: 'bg-indigo-500',
        minimapColor: '#6366f1',
      },
      tool: {
        gradient: 'from-purple-500/25 to-pink-500/20',
        borderColor: 'border-purple-500/60',
        iconBg: 'bg-purple-500',
        minimapColor: '#a855f7',
      },
    },
    group: {
      dark: { bg: 'bg-slate-500/20', border: 'border-slate-500/50', borderSelected: '!border-slate-400', text: 'text-slate-300', textMuted: 'text-slate-400' },
      light: { bg: 'bg-slate-100', border: 'border-slate-300', borderSelected: '!border-slate-500', text: 'text-slate-700', textMuted: 'text-slate-500' },
    },
    groupColors: {
      dark: [
        { bg: 'bg-red-500/15', border: 'border-red-500/40', borderSelected: '!border-red-400', text: 'text-red-200', textMuted: 'text-red-300' },
        { bg: 'bg-orange-500/15', border: 'border-orange-500/40', borderSelected: '!border-orange-400', text: 'text-orange-200', textMuted: 'text-orange-300' },
        { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', borderSelected: '!border-yellow-400', text: 'text-yellow-200', textMuted: 'text-yellow-300' },
        { bg: 'bg-green-500/15', border: 'border-green-500/40', borderSelected: '!border-green-400', text: 'text-green-200', textMuted: 'text-green-300' },
        { bg: 'bg-blue-500/15', border: 'border-blue-500/40', borderSelected: '!border-blue-400', text: 'text-blue-200', textMuted: 'text-blue-300' },
        { bg: 'bg-purple-500/15', border: 'border-purple-500/40', borderSelected: '!border-purple-400', text: 'text-purple-200', textMuted: 'text-purple-300' },
      ],
      light: [
        { bg: 'bg-red-100', border: 'border-red-300', borderSelected: '!border-red-500', text: 'text-red-800', textMuted: 'text-red-600' },
        { bg: 'bg-orange-100', border: 'border-orange-300', borderSelected: '!border-orange-500', text: 'text-orange-800', textMuted: 'text-orange-600' },
        { bg: 'bg-yellow-100', border: 'border-yellow-300', borderSelected: '!border-yellow-500', text: 'text-yellow-800', textMuted: 'text-yellow-600' },
        { bg: 'bg-green-100', border: 'border-green-300', borderSelected: '!border-green-500', text: 'text-green-800', textMuted: 'text-green-600' },
        { bg: 'bg-blue-100', border: 'border-blue-300', borderSelected: '!border-blue-500', text: 'text-blue-800', textMuted: 'text-blue-600' },
        { bg: 'bg-purple-100', border: 'border-purple-300', borderSelected: '!border-purple-500', text: 'text-purple-800', textMuted: 'text-purple-600' },
      ],
    },
  },
];

// Helper to get current theme config
export function getThemeConfig(themeId: ColorTheme): ColorThemeConfig {
  return COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
}

interface ThemeState {
  theme: Theme;
  colorTheme: ColorTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      colorTheme: 'default',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
    }),
    {
      name: 'processai-theme',
    }
  )
);
