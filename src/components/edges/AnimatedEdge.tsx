'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  EdgeLabelRenderer,
  Position,
} from '@xyflow/react';
import { useThemeStore } from '@/store/themeStore';
import { useFlowStore } from '@/store/flowStore';
import { Pencil, X } from 'lucide-react';

export type EdgeColor = 'default' | 'success' | 'error' | 'warning' | 'info';
export type EdgeType = 'bezier' | 'orthogonal' | 'straight';

interface AnimatedEdgeData {
  label?: string;
  edgeColor?: EdgeColor;
  edgeType?: EdgeType;
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
 * Orthogonal (right-angle) edge path calculation
 * Creates L-shaped or Z-shaped paths with 90-degree angles
 */
function getOrthogonalEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position
): { path: string; labelX: number; labelY: number } {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const offset = 40; // Minimum distance from node before turning

  let path = '';
  let labelX = midX;
  let labelY = midY;

  // Vertical flow (top-bottom connections)
  if (
    (sourcePosition === Position.Bottom && targetPosition === Position.Top) ||
    (sourcePosition === Position.Top && targetPosition === Position.Bottom)
  ) {
    const goingDown = sourcePosition === Position.Bottom;
    const cornerY = goingDown
      ? Math.max(sourceY + offset, midY)
      : Math.min(sourceY - offset, midY);

    if (Math.abs(sourceX - targetX) < 5) {
      // Straight vertical line
      path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    } else {
      // Z-shaped path
      path = `M ${sourceX},${sourceY} L ${sourceX},${cornerY} L ${targetX},${cornerY} L ${targetX},${targetY}`;
      labelY = cornerY;
    }
  }
  // Horizontal flow (left-right connections)
  else if (
    (sourcePosition === Position.Right && targetPosition === Position.Left) ||
    (sourcePosition === Position.Left && targetPosition === Position.Right)
  ) {
    const goingRight = sourcePosition === Position.Right;
    const cornerX = goingRight
      ? Math.max(sourceX + offset, midX)
      : Math.min(sourceX - offset, midX);

    if (Math.abs(sourceY - targetY) < 5) {
      // Straight horizontal line
      path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    } else {
      // Z-shaped path
      path = `M ${sourceX},${sourceY} L ${cornerX},${sourceY} L ${cornerX},${targetY} L ${targetX},${targetY}`;
      labelX = cornerX;
    }
  }
  // Mixed directions - L-shaped or more complex
  else {
    // Simple L-shape for mixed connections
    if (sourcePosition === Position.Bottom || sourcePosition === Position.Top) {
      path = `M ${sourceX},${sourceY} L ${sourceX},${targetY} L ${targetX},${targetY}`;
      labelX = sourceX;
      labelY = targetY;
    } else {
      path = `M ${sourceX},${sourceY} L ${targetX},${sourceY} L ${targetX},${targetY}`;
      labelX = targetX;
      labelY = sourceY;
    }
  }

  return { path, labelX, labelY };
}

/**
 * Straight edge path calculation
 */
function getStraightEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): { path: string; labelX: number; labelY: number } {
  return {
    path: `M ${sourceX},${sourceY} L ${targetX},${targetY}`,
    labelX: (sourceX + targetX) / 2,
    labelY: (sourceY + targetY) / 2,
  };
}

/**
 * n8n-style edge path calculation (bezier)
 * - Straight lines when nodes are aligned on the same axis
 * - Smooth bezier curves only when needed for non-aligned connections
 */
function getBezierEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position
): { path: string; labelX: number; labelY: number } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  // Check if this is a straight vertical or horizontal connection
  const isVerticalFlow =
    (sourcePosition === Position.Bottom && targetPosition === Position.Top) ||
    (sourcePosition === Position.Top && targetPosition === Position.Bottom);
  const isHorizontalFlow =
    (sourcePosition === Position.Right && targetPosition === Position.Left) ||
    (sourcePosition === Position.Left && targetPosition === Position.Right);

  // If nodes are aligned and flow direction matches, use straight line
  const isAlignedVertical = isVerticalFlow && absX < 5;
  const isAlignedHorizontal = isHorizontalFlow && absY < 5;

  if (isAlignedVertical || isAlignedHorizontal) {
    // Straight line - no curves needed
    const labelX = (sourceX + targetX) / 2;
    const labelY = (sourceY + targetY) / 2;
    const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    return { path, labelX, labelY };
  }

  // For non-aligned connections, use bezier curves
  // Curvature scales with the perpendicular distance
  const curvature = Math.max(40, Math.min(120, Math.max(absX, absY) * 0.4));

  let c1x = sourceX;
  let c1y = sourceY;
  let c2x = targetX;
  let c2y = targetY;

  // Source control point - extends in the direction of the source handle
  switch (sourcePosition) {
    case Position.Bottom:
      c1y = sourceY + curvature;
      break;
    case Position.Top:
      c1y = sourceY - curvature;
      break;
    case Position.Right:
      c1x = sourceX + curvature;
      break;
    case Position.Left:
      c1x = sourceX - curvature;
      break;
  }

  // Target control point - extends in the direction of the target handle
  switch (targetPosition) {
    case Position.Top:
      c2y = targetY - curvature;
      break;
    case Position.Bottom:
      c2y = targetY + curvature;
      break;
    case Position.Right:
      c2x = targetX + curvature;
      break;
    case Position.Left:
      c2x = targetX - curvature;
      break;
  }

  // Calculate label position using bezier midpoint formula
  const labelX = 0.125 * sourceX + 0.375 * c1x + 0.375 * c2x + 0.125 * targetX;
  const labelY = 0.125 * sourceY + 0.375 * c1y + 0.375 * c2y + 0.125 * targetY;

  const path = `M ${sourceX},${sourceY} C ${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`;

  return { path, labelX, labelY };
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

  // Get edge type (default to bezier)
  const edgeType = edgeData?.edgeType || 'bezier';

  // Calculate path based on edge type
  const { path: edgePath, labelX, labelY } = useMemo(() => {
    switch (edgeType) {
      case 'orthogonal':
        return getOrthogonalEdgePath(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition);
      case 'straight':
        return getStraightEdgePath(sourceX, sourceY, targetX, targetY);
      case 'bezier':
      default:
        return getBezierEdgePath(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition);
    }
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, edgeType]);

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

  // Generate unique ID for gradient
  const gradientId = `edge-gradient-${id}`;

  // Determine the current edge color based on state
  const currentEdgeColor = selected ? edgeColorSelected : isHovered ? edgeColorHover : edgeColor;

  return (
    <>
      {/* Gradient definition for n8n-style gradient effect */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={currentEdgeColor} stopOpacity="0.6" />
          <stop offset="50%" stopColor={currentEdgeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={currentEdgeColor} stopOpacity="0.6" />
        </linearGradient>
      </defs>

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

      {/* Main edge path - n8n style */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: selected ? 3 : isHovered ? 2.5 : 2,
          strokeLinecap: 'round',
          transition: 'stroke-width 0.15s ease',
        }}
      />

      {/* Animated flow line - moving green dashes */}
      <path
        d={edgePath}
        fill="none"
        stroke={selected ? edgeColorSelected : isDark ? '#22c55e' : '#16a34a'}
        strokeWidth={2}
        strokeDasharray="5 5"
        strokeLinecap="round"
        style={{
          animation: 'flowAnimation 1s linear infinite',
          opacity: selected ? 1 : 0.8,
        }}
      />

      {/* CSS animation for flow */}
      <style>
        {`
          @keyframes flowAnimation {
            from { stroke-dashoffset: 10; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>

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
              {showControls && (
                <button
                  onClick={handleDelete}
                  className={`p-1.5 rounded-md shadow-md border transition-all ${
                    selected
                      ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                      : isDark
                        ? 'bg-red-900/80 text-red-400 border-red-800 hover:bg-red-900'
                        : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                  }`}
                  title="Delete connection (or press Delete key)"
                >
                  <X className={selected ? 'w-4 h-4' : 'w-3 h-3'} />
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
              <button
                onClick={handleDelete}
                className={`p-1.5 rounded-md shadow-md border transition-all ${
                  selected
                    ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                    : isDark
                      ? 'bg-red-900/80 text-red-400 border-red-800 hover:bg-red-900'
                      : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                }`}
                title="Delete connection (or press Delete key)"
              >
                <X className={selected ? 'w-4 h-4' : 'w-3 h-3'} />
              </button>
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(AnimatedEdgeComponent);
