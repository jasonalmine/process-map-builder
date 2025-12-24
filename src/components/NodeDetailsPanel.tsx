'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Play,
  GitBranch,
  Clock,
  CheckCircle2,
  Plug,
  Trash2,
  Square,
  Circle,
  Diamond,
  Database,
  Columns,
  RotateCcw,
} from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { NodeType, NodeShape, ProcessNodeData } from '@/types/flow';
import { Node, useReactFlow } from '@xyflow/react';

interface NodeTypeOption {
  type: NodeType;
  label: string;
  icon: typeof Zap;
  color: string;
}

interface NodeShapeOption {
  shape: NodeShape;
  label: string;
  icon: React.ReactNode;
}

const nodeTypeOptions: NodeTypeOption[] = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-blue-400' },
  { type: 'action', label: 'Action', icon: Play, color: 'text-emerald-400' },
  { type: 'decision', label: 'Decision', icon: GitBranch, color: 'text-amber-400' },
  { type: 'delay', label: 'Delay', icon: Clock, color: 'text-purple-400' },
  { type: 'outcome', label: 'Outcome', icon: CheckCircle2, color: 'text-green-400' },
  { type: 'integration', label: 'Integration', icon: Plug, color: 'text-pink-400' },
];

const nodeShapeOptions: NodeShapeOption[] = [
  { shape: 'rectangle', label: 'Rectangle', icon: <Square className="w-3.5 h-3.5" /> },
  { shape: 'stadium', label: 'Stadium', icon: <div className="w-4 h-2.5 border-2 rounded-full border-current" /> },
  { shape: 'diamond', label: 'Diamond', icon: <Diamond className="w-3.5 h-3.5" /> },
  { shape: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
  { shape: 'database', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
  { shape: 'subroutine', label: 'Subroutine', icon: <Columns className="w-3.5 h-3.5" /> },
];

// Preset colors for quick selection
const presetColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

const PANEL_WIDTH = 288;
const PANEL_HEIGHT = 500; // Increased for new sections
const NODE_WIDTH = 220;
const OFFSET = 16;

interface NodeDetailsPanelProps {
  selectedNode: Node<ProcessNodeData> | null;
  onClose: () => void;
}

export default function NodeDetailsPanel({ selectedNode, onClose }: NodeDetailsPanelProps) {
  const { updateNodeData, deleteSelectedNodes } = useFlowStore();
  const { getViewport } = useReactFlow();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('action');
  const [shape, setShape] = useState<NodeShape | undefined>(undefined);
  const [customColor, setCustomColor] = useState<string | undefined>(undefined);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  // Sync state with selected node
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setDescription(selectedNode.data.description || '');
      setNodeType(selectedNode.data.nodeType || 'action');
      setShape(selectedNode.data.shape);
      setCustomColor(selectedNode.data.customColor);
      setBorderStyle(selectedNode.data.borderStyle || 'solid');
    }
  }, [selectedNode]);

  // Calculate panel position near the node
  const panelPosition = useMemo(() => {
    if (!selectedNode) return { x: 0, y: 0 };

    const viewport = getViewport();
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const screenX = selectedNode.position.x * viewport.zoom + viewport.x;
    const screenY = selectedNode.position.y * viewport.zoom + viewport.y;

    let panelX = screenX + NODE_WIDTH * viewport.zoom + OFFSET;
    let panelY = screenY;

    if (panelX + PANEL_WIDTH > windowWidth - 20) {
      panelX = screenX - PANEL_WIDTH - OFFSET;
    }
    if (panelX < 20) {
      panelX = 20;
    }
    if (panelY + PANEL_HEIGHT > windowHeight - 20) {
      panelY = windowHeight - PANEL_HEIGHT - 20;
    }
    if (panelY < 80) {
      panelY = 80;
    }

    return { x: panelX, y: panelY };
  }, [selectedNode, getViewport]);

  const handleSave = () => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, {
        label,
        description,
        nodeType,
        shape,
        customColor,
        borderStyle,
      });
    }
  };

  const handleDelete = () => {
    deleteSelectedNodes();
    onClose();
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleTypeChange = (newType: NodeType) => {
    setNodeType(newType);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { nodeType: newType });
    }
  };

  const handleShapeChange = (newShape: NodeShape) => {
    setShape(newShape);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { shape: newShape });
    }
  };

  const handleColorChange = (color: string | undefined) => {
    setCustomColor(color);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { customColor: color });
    }
  };

  const handleBorderStyleChange = (style: 'solid' | 'dashed' | 'dotted') => {
    setBorderStyle(style);
    if (selectedNode) {
      updateNodeData(selectedNode.id, { borderStyle: style });
    }
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            left: panelPosition.x,
            top: panelPosition.y,
            width: PANEL_WIDTH,
          }}
          className={`backdrop-blur-xl rounded-xl border shadow-2xl overflow-hidden z-10 ${
            isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-300'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Node
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
              }`}
            >
              <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Label */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Node label..."
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleBlur}
                rows={2}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Optional description..."
              />
            </div>

            {/* Node Type */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Node Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {nodeTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = nodeType === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleTypeChange(option.type)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? isDark
                            ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                            : 'bg-purple-100 border border-purple-300 text-purple-700'
                          : isDark
                            ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? option.color : ''}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Shape
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {nodeShapeOptions.map((option) => {
                  const isSelected = shape === option.shape;
                  return (
                    <button
                      key={option.shape}
                      onClick={() => handleShapeChange(option.shape)}
                      title={option.label}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-all ${
                        isSelected
                          ? isDark
                            ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                            : 'bg-purple-100 border border-purple-300 text-purple-700'
                          : isDark
                            ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Section */}
            <div className={`pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <label className={`block text-xs font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Style
              </label>

              {/* Color */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Color
                  </span>
                  {customColor && (
                    <button
                      onClick={() => handleColorChange(undefined)}
                      className={`text-[10px] flex items-center gap-1 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-6 h-6 rounded-md border-2 transition-all ${
                        customColor === color
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Border Style */}
              <div>
                <span className={`text-[10px] block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Border
                </span>
                <div className="flex gap-1.5">
                  {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleBorderStyleChange(style)}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                        borderStyle === style
                          ? isDark
                            ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                            : 'bg-purple-100 border border-purple-300 text-purple-700'
                          : isDark
                            ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`w-full h-0.5 mb-1 ${
                          style === 'solid'
                            ? 'border-t-2 border-current'
                            : style === 'dashed'
                            ? 'border-t-2 border-dashed border-current'
                            : 'border-t-2 border-dotted border-current'
                        }`}
                      />
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t ${
            isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <button
              onClick={handleDelete}
              className={`flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Node
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
