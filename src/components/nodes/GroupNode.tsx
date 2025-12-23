'use client';

import { memo, useState } from 'react';
import { type Node, type NodeProps, NodeResizer } from '@xyflow/react';
import { Pencil } from 'lucide-react';
import { GroupNodeData } from '@/types/flow';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';

type GroupNodeType = Node<GroupNodeData, 'groupNode'>;

function GroupNodeComponent({ id, data, selected }: NodeProps<GroupNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const updateGroupLabel = useFlowStore((state) => state.updateGroupLabel);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const handleSave = () => {
    updateGroupLabel(id, editValue);
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
    <>
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName={isDark ? '!border-purple-500' : '!border-purple-600'}
        handleClassName={isDark ? '!bg-purple-500 !border-purple-500' : '!bg-purple-600 !border-purple-600'}
      />
      <div
        className={`w-full h-full rounded-xl border-2 border-dashed p-3 ${
          isDark
            ? 'bg-gray-800/30 border-gray-600'
            : 'bg-gray-200/50 border-gray-400'
        } ${selected ? (isDark ? '!border-purple-500' : '!border-purple-600') : ''}`}
      >
        <div className="flex items-center gap-2 group">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`px-2 py-1 text-sm font-semibold rounded outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
              }`}
            />
          ) : (
            <>
              <span
                className={`text-sm font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {data.label}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
              >
                <Pencil className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(GroupNodeComponent);
