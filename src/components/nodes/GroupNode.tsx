'use client';

import { memo, useState } from 'react';
import { type Node, type NodeProps, NodeResizer } from '@xyflow/react';
import { Pencil } from 'lucide-react';
import { GroupNodeData } from '@/types/flow';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore, getThemeConfig } from '@/store/themeStore';

type GroupNodeType = Node<GroupNodeData, 'groupNode'>;

function GroupNodeComponent({ id, data, selected }: NodeProps<GroupNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const updateGroupLabel = useFlowStore((state) => state.updateGroupLabel);
  const theme = useThemeStore((state) => state.theme);
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const isDark = theme === 'dark';

  // Get group colors from current theme
  const themeConfig = getThemeConfig(colorTheme);

  // Use colorIndex to get specific color, fallback to default group color
  const colorIndex = data.colorIndex ?? 0;
  const groupColorArray = isDark ? themeConfig.groupColors.dark : themeConfig.groupColors.light;
  const colors = groupColorArray[colorIndex % groupColorArray.length] || (isDark ? themeConfig.group.dark : themeConfig.group.light);

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

  // Use static class mappings since dynamic Tailwind classes don't work
  const getResizerClasses = () => {
    const classMap: Record<string, { line: string; handle: string }> = {
      default: { line: '!border-gray-500', handle: '!bg-gray-500 !border-gray-500' },
      wood: { line: '!border-amber-500', handle: '!bg-amber-500 !border-amber-500' },
      green: { line: '!border-emerald-500', handle: '!bg-emerald-500 !border-emerald-500' },
      purple: { line: '!border-purple-500', handle: '!bg-purple-500 !border-purple-500' },
      rainbow: { line: '!border-slate-500', handle: '!bg-slate-500 !border-slate-500' },
    };
    return classMap[colorTheme] || classMap.default;
  };
  const resizerClasses = getResizerClasses();
  const resizerLineClass = resizerClasses.line;
  const resizerHandleClass = resizerClasses.handle;

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName={resizerLineClass}
        handleClassName={resizerHandleClass}
      />
      <div
        className={`w-full h-full rounded-xl border-2 p-3 ${colors.bg} ${colors.border} ${selected ? colors.borderSelected : ''}`}
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
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            />
          ) : (
            <>
              <span className={`text-sm font-semibold tracking-wider ${colors.text}`}>
                {data.label}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
                title="Edit label"
              >
                <Pencil className={`w-3 h-3 ${colors.textMuted}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(GroupNodeComponent);
