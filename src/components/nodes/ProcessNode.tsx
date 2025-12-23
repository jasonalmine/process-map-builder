'use client';

import { memo, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Zap,
  Play,
  GitBranch,
  Clock,
  CheckCircle2,
  Plug,
  Pencil,
} from 'lucide-react';
import { ProcessNodeData, NodeType } from '@/types/flow';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';

const nodeConfig: Record<
  NodeType,
  {
    icon: typeof Zap;
    gradient: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  trigger: {
    icon: Zap,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
    iconBg: 'bg-blue-500',
  },
  action: {
    icon: Play,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/50',
    iconBg: 'bg-emerald-500',
  },
  decision: {
    icon: GitBranch,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    iconBg: 'bg-amber-500',
  },
  delay: {
    icon: Clock,
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/50',
    iconBg: 'bg-purple-500',
  },
  outcome: {
    icon: CheckCircle2,
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50',
    iconBg: 'bg-green-500',
  },
  integration: {
    icon: Plug,
    gradient: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/50',
    iconBg: 'bg-pink-500',
  },
};

type ProcessNodeType = Node<ProcessNodeData, 'processNode'>;

function ProcessNodeComponent({ id, data, selected }: NodeProps<ProcessNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const config = nodeConfig[data.nodeType] || nodeConfig.action;
  const Icon = config.icon;

  const handleSave = () => {
    updateNodeLabel(id, editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(data.label);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative w-[220px] rounded-xl
        bg-gradient-to-br ${config.gradient}
        backdrop-blur-xl
        border ${config.borderColor}
        ${selected ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent' : ''}
        shadow-lg shadow-black/20
        transition-all duration-200
        hover:shadow-xl hover:shadow-black/30
        group
      `}
    >
      {/* Glow effect on selection */}
      {selected && (
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} blur-xl opacity-50 -z-10`}
        />
      )}

      {/* Top handle (input) - primary for vertical layouts */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-top-1"
      />

      {/* Left handle (input) - for horizontal layouts */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-left-1"
      />

      <div className="p-2.5 flex items-start gap-2">
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg ${config.iconBg}
            flex items-center justify-center
            shadow-md
          `}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-full bg-white/20 rounded px-1.5 py-0.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-white/50 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            />
          ) : (
            <div className="flex items-center gap-1">
              <h3 className={`text-xs font-semibold truncate leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data.label}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded flex-shrink-0"
              >
                <Pencil className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          )}
          {data.description && (
            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {data.description}
            </p>
          )}
          <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full ${
            isDark ? 'text-gray-400 bg-black/20' : 'text-gray-500 bg-white/30'
          }`}>
            {data.nodeType}
          </span>
        </div>
      </div>

      {/* Bottom handle (output) - primary for vertical layouts */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-bottom-1"
      />

      {/* Right handle (output) - for horizontal layouts */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-right-1"
      />

      {/* Decision node extra handles for Yes/No branches */}
      {data.nodeType === 'decision' && (
        <>
          <Handle
            type="source"
            position={Position.Top}
            id="no"
            className="!w-2.5 !h-2.5 !bg-red-400 !border-2 !border-red-600 hover:!bg-red-300 transition-colors !-top-1 !left-1/4"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="!w-2.5 !h-2.5 !bg-green-400 !border-2 !border-green-600 hover:!bg-green-300 transition-colors !-bottom-1 !left-3/4"
          />
        </>
      )}
    </motion.div>
  );
}

export default memo(ProcessNodeComponent);
