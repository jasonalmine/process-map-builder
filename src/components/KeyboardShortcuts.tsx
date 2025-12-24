'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'general' | 'canvas' | 'editing';
}

const SHORTCUTS: Shortcut[] = [
  // General
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general' },
  { keys: ['Cmd/Ctrl', 'S'], description: 'Save current diagram', category: 'general' },
  { keys: ['Cmd/Ctrl', 'M'], description: 'Toggle Mermaid editor', category: 'general' },

  // Canvas
  { keys: ['Cmd/Ctrl', '+'], description: 'Zoom in', category: 'canvas' },
  { keys: ['Cmd/Ctrl', '-'], description: 'Zoom out', category: 'canvas' },
  { keys: ['Cmd/Ctrl', '0'], description: 'Fit view', category: 'canvas' },
  { keys: ['Space', 'Drag'], description: 'Pan canvas', category: 'canvas' },

  // Editing
  { keys: ['Delete'], description: 'Delete selected nodes', category: 'editing' },
  { keys: ['Backspace'], description: 'Delete selected nodes', category: 'editing' },
  { keys: ['Cmd/Ctrl', 'Z'], description: 'Undo', category: 'editing' },
  { keys: ['Cmd/Ctrl', 'Shift', 'Z'], description: 'Redo', category: 'editing' },
  { keys: ['Cmd/Ctrl', 'Y'], description: 'Redo (alternative)', category: 'editing' },
  { keys: ['Cmd/Ctrl', 'A'], description: 'Select all nodes', category: 'editing' },
  { keys: ['Escape'], description: 'Deselect all', category: 'editing' },
];

const CATEGORY_LABELS = {
  general: 'General',
  canvas: 'Canvas Navigation',
  editing: 'Editing',
};

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsProps) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div
              className={`rounded-2xl shadow-2xl border overflow-hidden ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${
                  isDark ? 'border-gray-800' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-purple-500" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3
                      className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </h3>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between py-2 ${
                            index < shortcuts.length - 1
                              ? isDark
                                ? 'border-b border-gray-800/50'
                                : 'border-b border-gray-100'
                              : ''
                          }`}
                        >
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex} className="flex items-center gap-1">
                                <kbd
                                  className={`px-2 py-1 text-xs font-mono rounded-md border ${
                                    isDark
                                      ? 'bg-gray-800 border-gray-700 text-gray-300'
                                      : 'bg-gray-100 border-gray-200 text-gray-700'
                                  }`}
                                >
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    +
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className={`px-5 py-3 border-t text-center ${
                  isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">?</kbd> anytime to show this panel
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage shortcuts modal state
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
