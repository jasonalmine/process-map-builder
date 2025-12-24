'use client';

import { useState } from 'react';
import { Minimize2, Maximize2, Move } from 'lucide-react';
import { LayoutSpacing, DEFAULT_SPACING } from '@/lib/layoutFlow';

interface SpacingControlsProps {
  spacing: LayoutSpacing;
  onChange: (spacing: LayoutSpacing) => void;
  onApply: () => void;
  isDark: boolean;
}

export default function SpacingControls({ spacing, onChange, onApply, isDark }: SpacingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNodeSpacingChange = (value: number) => {
    onChange({ ...spacing, nodeSpacing: value });
  };

  const handleRankSpacingChange = (value: number) => {
    onChange({ ...spacing, rankSpacing: value });
  };

  const handleReset = () => {
    onChange(DEFAULT_SPACING);
  };

  // Preset buttons for quick spacing adjustments
  const presets = [
    { label: 'Tight', nodeSpacing: 1, rankSpacing: 1, icon: <Minimize2 className="w-3 h-3" /> },
    { label: 'Normal', nodeSpacing: 3, rankSpacing: 3, icon: <Move className="w-3 h-3" /> },
    { label: 'Spacious', nodeSpacing: 5, rankSpacing: 5, icon: <Maximize2 className="w-3 h-3" /> },
  ];

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
            : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
        }`}
      >
        <Move className="w-3.5 h-3.5" />
        Spacing
      </button>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl border shadow-lg ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Auto Spacing
        </span>
        <button
          onClick={() => setIsExpanded(false)}
          className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
        >
          Close
        </button>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 mb-3">
        {presets.map((preset) => {
          const isActive = spacing.nodeSpacing === preset.nodeSpacing && spacing.rankSpacing === preset.rankSpacing;
          return (
            <button
              key={preset.label}
              onClick={() => {
                onChange({ nodeSpacing: preset.nodeSpacing, rankSpacing: preset.rankSpacing });
              }}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                isActive
                  ? isDark
                    ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                    : 'bg-purple-100 border border-purple-300 text-purple-700'
                  : isDark
                    ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {preset.icon}
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {/* Node Spacing (horizontal) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Horizontal
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {spacing.nodeSpacing}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={spacing.nodeSpacing}
            onChange={(e) => handleNodeSpacingChange(parseInt(e.target.value))}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125`}
          />
        </div>

        {/* Rank Spacing (vertical) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Vertical
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {spacing.rankSpacing}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={spacing.rankSpacing}
            onChange={(e) => handleRankSpacingChange(parseInt(e.target.value))}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125`}
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleReset}
          className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
            isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors"
        >
          Apply Layout
        </button>
      </div>
    </div>
  );
}
