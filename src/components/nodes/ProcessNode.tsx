'use client';

import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position, type Node, type NodeProps, NodeResizer } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Zap,
  Play,
  GitBranch,
  Clock,
  CheckCircle2,
  Plug,
  Pencil,
  Wrench,
  Plus,
  Copy,
  Trash2,
} from 'lucide-react';
import { ProcessNodeData, NodeType, NodeShape } from '@/types/flow';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore, getThemeConfig } from '@/store/themeStore';
import { getToolLogoUrl } from '@/data/tools';

// Icon mapping for node types
const nodeIcons: Record<NodeType, typeof Zap> = {
  trigger: Zap,
  action: Play,
  decision: GitBranch,
  delay: Clock,
  outcome: CheckCircle2,
  integration: Plug,
  tool: Wrench,
};

// Default shape for node types (used when shape is not explicitly set)
const defaultShapeForType: Record<NodeType, NodeShape> = {
  trigger: 'stadium',
  action: 'rectangle',
  decision: 'diamond',
  delay: 'circle',
  outcome: 'stadium',
  integration: 'rectangle',
  tool: 'rectangle',
};

type ProcessNodeType = Node<ProcessNodeData, 'processNode'>;

// Shape wrapper component
function ShapeWrapper({
  shape,
  children,
  className,
  nodeStyle,
  selected,
  isDark,
  customColor,
  borderStyle = 'solid',
  width,
  height,
}: {
  shape: NodeShape;
  children: React.ReactNode;
  className?: string;
  nodeStyle: { gradient: string; borderColor: string };
  selected: boolean;
  isDark: boolean;
  customColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  width?: number;
  height?: number;
}) {
  const baseClasses = `
    relative backdrop-blur-xl
    ${customColor ? '' : `bg-gradient-to-br ${nodeStyle.gradient}`}
    ${selected ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent' : ''}
    shadow-lg shadow-black/20
    transition-all duration-200
    hover:shadow-xl hover:shadow-black/30
    group
  `;

  const borderClass = customColor
    ? `border-2 border-[${customColor}]`
    : `border ${nodeStyle.borderColor}`;

  const borderStyleClass =
    borderStyle === 'dashed' ? 'border-dashed' : borderStyle === 'dotted' ? 'border-dotted' : '';

  const dynamicWidth = width ? `${width}px` : '220px';
  const dynamicHeight = height ? `${height}px` : 'auto';

  switch (shape) {
    case 'diamond':
      return (
        <div
          className={`${className} flex items-center justify-center`}
          style={{ width: dynamicWidth, height: dynamicHeight, minHeight: '120px' }}
        >
          <div
            className={`
              ${baseClasses} ${borderClass} ${borderStyleClass}
              w-[140px] h-[140px] rotate-45
            `}
            style={customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}}
          >
            <div className="-rotate-45 w-full h-full flex items-center justify-center p-4">
              {children}
            </div>
          </div>
          {/* Glow effect */}
          {selected && (
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
            />
          )}
        </div>
      );

    case 'circle':
      return (
        <div
          className={`
            ${baseClasses} ${borderClass} ${borderStyleClass} ${className}
            rounded-full aspect-square min-w-[120px] min-h-[120px]
            flex items-center justify-center
          `}
          style={{
            width: width || 120,
            height: height || 120,
            ...(customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}),
          }}
        >
          {children}
          {selected && (
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
            />
          )}
        </div>
      );

    case 'stadium':
      return (
        <div
          className={`
            ${baseClasses} ${borderClass} ${borderStyleClass} ${className}
            rounded-full
          `}
          style={{
            width: dynamicWidth,
            minHeight: dynamicHeight,
            ...(customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}),
          }}
        >
          {children}
          {selected && (
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
            />
          )}
        </div>
      );

    case 'database':
      return (
        <div
          className={`${className} relative`}
          style={{ width: dynamicWidth }}
        >
          {/* Database shape using clip-path or SVG */}
          <div
            className={`
              ${baseClasses} ${borderClass} ${borderStyleClass}
              rounded-lg
            `}
            style={{
              borderRadius: '8px 8px 50% 50% / 8px 8px 20px 20px',
              ...(customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}),
            }}
          >
            <div className="pt-2">{children}</div>
          </div>
          {selected && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
              style={{ borderRadius: '8px 8px 50% 50% / 8px 8px 20px 20px' }}
            />
          )}
        </div>
      );

    case 'subroutine':
      return (
        <div
          className={`
            ${baseClasses} ${borderStyleClass} ${className}
            rounded-lg border-2 ${customColor ? '' : nodeStyle.borderColor}
          `}
          style={{
            width: dynamicWidth,
            minHeight: dynamicHeight,
            boxShadow: `inset 8px 0 0 0 ${customColor || 'rgba(255,255,255,0.1)'}, inset -8px 0 0 0 ${customColor || 'rgba(255,255,255,0.1)'}`,
            ...(customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}),
          }}
        >
          {children}
          {selected && (
            <div
              className={`absolute inset-0 rounded-lg bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
            />
          )}
        </div>
      );

    case 'rectangle':
    default:
      return (
        <div
          className={`
            ${baseClasses} ${borderClass} ${borderStyleClass} ${className}
            rounded-xl
          `}
          style={{
            width: dynamicWidth,
            minHeight: dynamicHeight,
            ...(customColor ? { backgroundColor: `${customColor}20`, borderColor: customColor } : {}),
          }}
        >
          {children}
          {selected && (
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${nodeStyle.gradient} blur-xl opacity-50 -z-10`}
            />
          )}
        </div>
      );
  }
}

// Quick Actions component
function QuickActions({
  nodeId,
  isDark,
}: {
  nodeId: string;
  isDark: boolean;
}) {
  const { nodes, addNode, deleteSelectedNodes, setNodes } = useFlowStore();

  const handleAddConnected = () => {
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return;

    const newNodeId = `node_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'processNode',
      position: {
        x: currentNode.position.x,
        y: currentNode.position.y + 150,
      },
      data: {
        label: 'New Node',
        nodeType: 'action' as NodeType,
        description: '',
      },
    };

    addNode(newNode);

    // Add edge from current node to new node
    useFlowStore.getState().onConnect({
      source: nodeId,
      target: newNodeId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
    });
  };

  const handleDuplicate = () => {
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return;

    const newNode = {
      ...currentNode,
      id: `${nodeId}_copy_${Date.now()}`,
      position: {
        x: currentNode.position.x + 50,
        y: currentNode.position.y + 50,
      },
      selected: false,
    };

    addNode(newNode);
  };

  const handleDelete = () => {
    // Select the node first, then delete
    setNodes(nodes.map((n) => ({ ...n, selected: n.id === nodeId })));
    setTimeout(() => deleteSelectedNodes(), 0);
  };

  const buttonClass = `
    p-1.5 rounded-lg transition-all
    ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'}
    shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}
  `;

  return (
    <div className="flex flex-col gap-1">
      <button onClick={handleAddConnected} className={buttonClass} title="Add connected node">
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleDuplicate} className={buttonClass} title="Duplicate">
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleDelete} className={`${buttonClass} hover:!bg-red-500/20 hover:!text-red-400`} title="Delete">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ProcessNodeComponent({ id, data, selected }: NodeProps<ProcessNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  // Sync editValue when label changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(data.label);
    }
  }, [data.label, isEditing]);
  const { updateNodeLabel, updateNodeData } = useFlowStore();
  const theme = useThemeStore((state) => state.theme);
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const isDark = theme === 'dark';

  // Track mouse movement to distinguish click from drag
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  // Double-click to edit handler
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // Get theme-based node styling
  const themeConfig = getThemeConfig(colorTheme);
  const nodeStyle = themeConfig.nodes[data.nodeType] || themeConfig.nodes.action;
  const Icon = nodeIcons[data.nodeType] || nodeIcons.action;

  // Determine actual shape (use explicit shape or default for type)
  const shape = data.shape || defaultShapeForType[data.nodeType] || 'rectangle';

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

  // Handle resize
  const handleResize = (_: unknown, params: { width: number; height: number }) => {
    updateNodeData(id, { width: params.width, height: params.height });
  };

  // Compact content for diamond/circle shapes
  const isCompactShape = shape === 'diamond' || shape === 'circle';

  const nodeContent = (
    <div className={`${isCompactShape ? 'text-center' : 'p-2.5 flex items-start gap-2'}`}>
      {!isCompactShape && (
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg ${data.nodeType === 'tool' && data.toolDomain ? 'bg-white' : nodeStyle.iconBg}
            flex items-center justify-center
            shadow-md overflow-hidden
          `}
        >
          {data.nodeType === 'tool' && data.toolDomain ? (
            <img
              src={getToolLogoUrl(data.toolDomain, 64)}
              alt={data.label}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Icon className={`w-4 h-4 text-white ${data.nodeType === 'tool' && data.toolDomain ? 'hidden' : ''}`} />
        </div>
      )}

      <div className={`${isCompactShape ? '' : 'flex-1 min-w-0'}`}>
        {isCompactShape && (
          <div className={`w-6 h-6 rounded-md ${nodeStyle.iconBg} flex items-center justify-center mx-auto mb-1`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
        )}
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
          <div className={`flex items-center gap-1 ${isCompactShape ? 'justify-center' : ''}`}>
            <h3 className={`text-xs font-semibold truncate leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {data.label}
            </h3>
            {!isCompactShape && (
              <button
                onMouseDown={(e) => {
                  mouseDownPos.current = { x: e.clientX, y: e.clientY };
                  isDragging.current = false;
                }}
                onMouseMove={(e) => {
                  if (mouseDownPos.current) {
                    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
                    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
                    if (dx > 3 || dy > 3) {
                      isDragging.current = true;
                    }
                  }
                }}
                onMouseUp={() => {
                  if (!isDragging.current && mouseDownPos.current) {
                    setIsEditing(true);
                  }
                  mouseDownPos.current = null;
                  isDragging.current = false;
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded flex-shrink-0"
              >
                <Pencil className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
        )}
        {data.description && !isCompactShape && (
          <p className={`text-[10px] mt-0.5 line-clamp-2 leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {data.description}
          </p>
        )}
        {!isCompactShape && (
          <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full ${
            isDark ? 'text-gray-400 bg-black/20' : 'text-gray-500 bg-white/30'
          }`}>
            {data.nodeType}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Node Resizer - only show for non-compact shapes */}
      {!isCompactShape && (
        <NodeResizer
          minWidth={150}
          minHeight={60}
          isVisible={selected}
          handleClassName="!w-2 !h-2 !bg-purple-500 !border-purple-600"
          lineClassName="!border-purple-500"
          onResize={handleResize}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative"
        onDoubleClick={handleDoubleClick}
      >
        <ShapeWrapper
          shape={shape}
          nodeStyle={nodeStyle}
          selected={selected || false}
          isDark={isDark}
          customColor={data.customColor}
          borderStyle={data.borderStyle}
          width={data.width}
          height={data.height}
        >
          {nodeContent}
        </ShapeWrapper>

        {/* Quick Actions - right side of node */}
        <div
          className={`
            absolute top-1/2 -right-12 -translate-y-1/2
            opacity-0 group-hover:opacity-100 transition-opacity
            pointer-events-none group-hover:pointer-events-auto
          `}
        >
          <QuickActions nodeId={id} isDark={isDark} />
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-top-1"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-left-1"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-bottom-1"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!w-2.5 !h-2.5 !bg-white/80 !border-2 !border-gray-400 hover:!bg-white transition-colors !-right-1"
        />

        {/* Decision node extra handles */}
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
    </>
  );
}

export default memo(ProcessNodeComponent);
