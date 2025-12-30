'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
} from '@xyflow/react';
import { useThemeStore } from '@/store/themeStore';
import { useFlowStore } from '@/store/flowStore';
import { Pencil, X } from 'lucide-react';

export type EdgeColor = 'default' | 'success' | 'error' | 'warning' | 'info';

interface AnimatedEdgeData {
  label?: string;
  edgeColor?: EdgeColor;
  [key: string]: unknown;
}

// Color palette for edge colors
const EDGE_COLORS: Record<EdgeColor, { dark: string; light: string; darkHover: string; lightHover: string }> = {
  default: { dark: '#6b7280', light: '#9ca3af', darkHover: '#9ca3af', lightHover: '#6b7280' },
  success: { dark: '#22c55e', light: '#16a34a', darkHover: '#4ade80', lightHover: '#15803d' },
  error: { dark: '#ef4444', light: '#dc2626', darkHover: '#f87171', lightHover: '#b91c1c' },
  warning: { dark: '#f59e0b', light: '#d97706', darkHover: '#fbbf24', lightHover: '#b45309' },
  info: { dark: '#3b82f6', light: '#2563eb', darkHover: '#60a5fa', lightHover: '#1d4ed8' },
};

/**
 * Calculate a better label position that avoids corners and overlaps
 * Places label on the first straight segment of the edge path
 */
function calculateLabelPosition(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position
): { x: number; y: number; offsetX: number; offsetY: number } {
  // For vertical flow (TB), place label on the horizontal segment if there is one
  // For horizontal flow (LR), place label on the vertical segment
  const isVerticalFlow = sourcePosition === Position.Bottom || sourcePosition === Position.Top;
  const isHorizontalFlow = sourcePosition === Position.Left || sourcePosition === Position.Right;

  // Calculate midpoints
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Default offset to position label slightly away from the line
  let offsetX = 0;
  let offsetY = 0;

  if (isVerticalFlow) {
    // For vertical flow, check if there's horizontal displacement
    if (Math.abs(sourceX - targetX) > 20) {
      // Place label on the horizontal segment (at midY level, offset to the side)
      // Position closer to the source on the horizontal run
      const horizontalMidY = sourcePosition === Position.Bottom
        ? sourceY + Math.abs(targetY - sourceY) * 0.3
        : sourceY - Math.abs(targetY - sourceY) * 0.3;
      return {
        x: midX,
        y: horizontalMidY,
        offsetX: 0,
        offsetY: -12, // Above the line
      };
    } else {
      // Straight vertical line - place label to the side
      return {
        x: sourceX,
        y: midY,
        offsetX: 20, // To the right of the line
        offsetY: 0,
      };
    }
  } else if (isHorizontalFlow) {
    // For horizontal flow, check if there's vertical displacement
    if (Math.abs(sourceY - targetY) > 20) {
      // Place label on the vertical segment
      const verticalMidX = sourcePosition === Position.Right
        ? sourceX + Math.abs(targetX - sourceX) * 0.3
        : sourceX - Math.abs(targetX - sourceX) * 0.3;
      return {
        x: verticalMidX,
        y: midY,
        offsetX: 12, // To the right of the line
        offsetY: 0,
      };
    } else {
      // Straight horizontal line - place label above
      return {
        x: midX,
        y: sourceY,
        offsetX: 0,
        offsetY: -12, // Above the line
      };
    }
  }

  // Default: center of the edge
  return { x: midX, y: midY, offsetX: 0, offsetY: -12 };
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
  selected,
}: EdgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = data as AnimatedEdgeData | undefined;
  const [editValue, setEditValue] = useState(edgeData?.label || '');
  const updateEdgeLabel = useFlowStore((state) => state.updateEdgeLabel);
  const deleteEdge = useFlowStore((state) => state.deleteEdge);

  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Use React Flow's built-in smoothstep path calculation
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  // Calculate better label position
  const labelPosition = useMemo(() => {
    return calculateLabelPosition(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition);
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const labelX = labelPosition.x + labelPosition.offsetX;
  const labelY = labelPosition.y + labelPosition.offsetY;

  // Show controls when hovered or selected
  const showControls = isHovered || selected;

  // Get edge color from data or use default
  const colorKey = edgeData?.edgeColor || 'default';
  const colorPalette = EDGE_COLORS[colorKey];
  const edgeColor = isDark ? colorPalette.dark : colorPalette.light;
  const edgeColorHover = isDark ? colorPalette.darkHover : colorPalette.lightHover;
  const edgeColorSelected = isDark ? '#ef4444' : '#dc2626'; // Red when selected

  const handleSave = useCallback(() => {
    updateEdgeLabel(id, editValue);
    setIsEditing(false);
  }, [id, editValue, updateEdgeLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Stop propagation to prevent edge deletion when pressing Delete/Backspace
      e.stopPropagation();
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

  const handleDelete = useCallback(() => {
    deleteEdge(id);
  }, [id, deleteEdge]);

  // Determine the current edge color based on state
  const currentEdgeColor = selected ? edgeColorSelected : isHovered ? edgeColorHover : edgeColor;

  return (
    <>
      {/* Background path for hover/click area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Selection highlight glow when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={edgeColorSelected}
          strokeWidth={6}
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />
      )}

      {/* Main edge path - clean solid line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: currentEdgeColor,
          strokeWidth: selected ? 3 : isHovered ? 2.5 : 2,
          strokeLinecap: 'round',
          transition: 'stroke-width 0.15s ease, stroke 0.15s ease',
        }}
      />

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
            <div className="flex items-center gap-1">
              <div
                onClick={handleStartEdit}
                className={`group flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shadow-md border cursor-pointer transition-colors ${
                  selected
                    ? isDark
                      ? 'bg-red-900/90 text-red-300 border-red-700'
                      : 'bg-red-50 text-red-700 border-red-300'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {edgeData.label}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
              {selected && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-md shadow-md border transition-all bg-red-600 text-white border-red-500 hover:bg-red-700"
                  title="Delete connection (or press Delete key)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : showControls ? (
            <div className="flex items-center gap-1">
              {!selected && (
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
              )}
              {selected && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-md shadow-md border transition-all bg-red-600 text-white border-red-500 hover:bg-red-700"
                  title="Delete connection (or press Delete key)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(AnimatedEdgeComponent);
