'use client';

import { memo, useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeProps,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { useThemeStore } from '@/store/themeStore';
import { useFlowStore } from '@/store/flowStore';
import { Pencil } from 'lucide-react';

interface AnimatedEdgeData {
  label?: string;
  [key: string]: unknown;
}

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = data as AnimatedEdgeData | undefined;
  const [editValue, setEditValue] = useState(edgeData?.label || '');
  const updateEdgeLabel = useFlowStore((state) => state.updateEdgeLabel);

  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Calculate orthogonal path based on direction
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  const isVertical = sourcePosition === 'bottom' || sourcePosition === 'top' ||
                     targetPosition === 'top' || targetPosition === 'bottom';

  if (isVertical) {
    // Vertical layout: go down, then horizontal if needed, then down
    const midY = (sourceY + targetY) / 2;
    if (Math.abs(sourceX - targetX) < 5) {
      // Perfectly aligned - straight vertical line
      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY}`;
    } else {
      // Need horizontal segment
      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    }
    labelX = (sourceX + targetX) / 2;
    labelY = midY;
  } else {
    // Horizontal layout: go right, then vertical if needed, then right
    const midX = (sourceX + targetX) / 2;
    if (Math.abs(sourceY - targetY) < 5) {
      // Perfectly aligned - straight horizontal line
      edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY}`;
    } else {
      // Need vertical segment
      edgePath = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    }
    labelX = midX;
    labelY = (sourceY + targetY) / 2;
  }

  // n8n-style edge color
  const edgeColor = isDark ? '#10b981' : '#059669';

  const handleSave = useCallback(() => {
    updateEdgeLabel(id, editValue);
    setIsEditing(false);
  }, [id, editValue, updateEdgeLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setEditValue(edgeData?.label || '');
        setIsEditing(false);
      }
    },
    [handleSave, edgeData?.label]
  );

  const handleStartEdit = useCallback(() => {
    setEditValue(edgeData?.label || '');
    setIsEditing(true);
  }, [edgeData?.label]);

  return (
    <>
      {/* Main path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2,
        }}
      />

      {/* Flow dot animation */}
      <circle r="3" fill={edgeColor}>
        <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
      </circle>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Label..."
              className={`px-2 py-1 rounded-md text-xs font-medium shadow-md border min-w-[60px] outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark
                  ? 'bg-gray-800 text-gray-300 border-gray-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            />
          ) : edgeData?.label ? (
            <div
              onClick={handleStartEdit}
              className={`group flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shadow-md border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {edgeData.label}
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
          ) : isHovered ? (
            <button
              onClick={handleStartEdit}
              className={`px-2 py-1 rounded-md text-xs font-medium shadow-md border transition-all ${
                isDark
                  ? 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-800'
                  : 'bg-white/80 text-gray-400 border-gray-200 hover:bg-white'
              }`}
            >
              + Label
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(AnimatedEdgeComponent);
