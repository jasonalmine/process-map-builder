'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as AnimatedEdgeData | undefined;

  return (
    <>
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Background path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#gradient-${id})`,
          strokeWidth: 2,
          opacity: 0.3,
        }}
      />

      {/* Animated path */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#gradient-${id})`}
        strokeWidth={2}
        strokeDasharray="8 4"
        className="animate-dash"
      />

      {/* Flow dots animation */}
      <circle r="4" fill="#8b5cf6" className="animate-flow-dot">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>

      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 shadow-md border border-gray-200 dark:border-gray-700"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(AnimatedEdgeComponent);
