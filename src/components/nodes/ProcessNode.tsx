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
        relative min-w-[240px] max-w-[320px] rounded-2xl
        bg-gradient-to-br ${config.gradient}
        backdrop-blur-xl
        border-2 ${config.borderColor}
        ${selected ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
        shadow-lg shadow-black/20
        transition-all duration-200
        hover:shadow-xl hover:shadow-black/30
        group
      `}
    >
      {/* Glow effect on selection */}
      {selected && (
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} blur-xl opacity-50 -z-10`}
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors"
      />

      <div className="p-4 flex items-start gap-3">
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl ${config.iconBg}
            flex items-center justify-center
            shadow-lg
          `}
        >
          <Icon className="w-5 h-5 text-white" />
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
              className="w-full bg-white/20 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-white/50"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {data.label}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
              >
                <Pencil className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          )}
          {data.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {data.description}
            </p>
          )}
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-black/20 px-2 py-0.5 rounded-full">
            {data.nodeType}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors"
      />

      {/* Decision node extra handles */}
      {data.nodeType === 'decision' && (
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="no"
            className="!w-3 !h-3 !bg-red-400 !border-2 !border-red-600 hover:!bg-red-300 transition-colors"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="yes"
            className="!w-3 !h-3 !bg-green-400 !border-2 !border-green-600 hover:!bg-green-300 transition-colors"
          />
        </>
      )}
    </motion.div>
  );
}

export default memo(ProcessNodeComponent);
