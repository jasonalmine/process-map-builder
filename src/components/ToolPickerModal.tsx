'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Wrench, Star } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { TOOLS, TOOL_CATEGORIES, getToolLogoUrl, Tool, ToolCategory, DEFAULT_CRM } from '@/data/tools';

interface ToolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool) => void;
}

export default function ToolPickerModal({ isOpen, onClose, onSelectTool }: ToolPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Only render portal on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectTool = (tool: Tool) => {
    onSelectTool(tool);
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Don't render on server or if not mounted
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full max-w-2xl max-h-[80vh] backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-600/20">
                  <Wrench className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Add Tool / App
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select an app to add to your flow
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                }`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Search and Filter */}
            <div className={`px-5 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              {/* Search */}
              <div className="relative mb-3">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500/50 ${
                    isDark
                      ? 'bg-gray-800/50 text-white placeholder-gray-500'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-slate-600 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {TOOL_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-slate-600 text-white'
                        : isDark
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Featured: GoHighLevel */}
              {selectedCategory === 'all' && searchQuery === '' && (
                <div className="mb-4">
                  <div className={`flex items-center gap-1.5 mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Featured CRM</span>
                  </div>
                  <button
                    onClick={() => handleSelectTool(DEFAULT_CRM)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/20 hover:from-amber-900/40 hover:to-orange-900/30 border border-amber-700/50'
                        : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md">
                      <img
                        src={getToolLogoUrl(DEFAULT_CRM.domain, 96)}
                        alt={DEFAULT_CRM.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {DEFAULT_CRM.name}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        All-in-one CRM & Marketing Platform
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Popular
                    </div>
                  </button>
                </div>
              )}

              {filteredTools.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No tools found matching your search
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 ${
                        tool.id === 'gohighlevel'
                          ? isDark
                            ? 'bg-amber-900/30 hover:bg-amber-800/40 border border-amber-700/50 ring-1 ring-amber-500/30'
                            : 'bg-amber-50 hover:bg-amber-100 border border-amber-300'
                          : isDark
                            ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={getToolLogoUrl(tool.domain, 64)}
                          alt={tool.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight line-clamp-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {tool.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t text-center ${
              isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {filteredTools.length} tools available
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
