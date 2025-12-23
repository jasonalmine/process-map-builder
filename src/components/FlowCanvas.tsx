'use client';

import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  ReactFlowProvider,
  ConnectionMode,
  Panel,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import {
  Image,
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowDown,
  ArrowRight,
  LayoutGrid,
  Square,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';

import ProcessNode from './nodes/ProcessNode';
import GroupNode from './nodes/GroupNode';
import AnimatedEdge from './edges/AnimatedEdge';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { layoutFlow, LayoutDirection } from '@/lib/layoutFlow';

// Control button with tooltip label on hover
function ControlButton({
  onClick,
  icon,
  label,
  isDark,
  isActive = false,
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : isActive
            ? 'bg-purple-600 text-white'
            : isDark
            ? 'hover:bg-gray-700 text-white'
            : 'hover:bg-gray-200 text-gray-700'
        }`}
      >
        {icon}
      </button>
      {/* Tooltip */}
      <div
        className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
          isDark
            ? 'bg-gray-900 text-white border border-gray-700'
            : 'bg-white text-gray-900 border border-gray-200 shadow-md'
        }`}
      >
        {label}
      </div>
    </div>
  );
}

function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    addGroup,
    deleteSelectedNodes,
    clearFlow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFlowStore();
  const { zoomIn, zoomOut, fitView, getViewport, getNodes } = useReactFlow();

  const handleFitView = useCallback(() => {
    const currentNodes = getNodes();
    if (currentNodes.length > 0) {
      fitView({ padding: 0.2, duration: 200, nodes: currentNodes });
    }
  }, [fitView, getNodes]);
  const [currentLayout, setCurrentLayout] = useState<LayoutDirection>('TB');
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, undo, redo]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      processNode: ProcessNode,
      groupNode: GroupNode,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      animated: AnimatedEdge,
    }),
    []
  );

  const handleLayoutChange = useCallback(
    (direction: LayoutDirection) => {
      // Filter out group nodes for layout calculation
      const processNodes = nodes.filter((n) => n.type === 'processNode');
      if (processNodes.length === 0) return;
      const layoutedNodes = layoutFlow(processNodes, edges, direction);
      // Merge back with group nodes
      const groupNodes = nodes.filter((n) => n.type === 'groupNode');
      setNodes([...groupNodes, ...layoutedNodes]);
      setCurrentLayout(direction);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    },
    [nodes, edges, setNodes, fitView]
  );

  const handleAddGroup = useCallback(() => {
    const viewport = getViewport();
    const groupId = `group_${Date.now()}`;
    addGroup({
      id: groupId,
      type: 'groupNode',
      position: {
        x: -viewport.x / viewport.zoom + 100,
        y: -viewport.y / viewport.zoom + 100,
      },
      data: { label: 'New Group' },
      style: { width: 400, height: 250 },
    });
  }, [addGroup, getViewport]);

  const downloadImage = useCallback(
    async (format: 'png' | 'svg') => {
      const element = document.querySelector('.react-flow') as HTMLElement;
      if (!element) return;

      const bgColor = isDark ? '#111111' : '#f5f5f5';

      try {
        const dataUrl =
          format === 'png'
            ? await toPng(element, {
                backgroundColor: bgColor,
                quality: 1,
                pixelRatio: 2,
              })
            : await toSvg(element, {
                backgroundColor: bgColor,
              });

        const link = document.createElement('a');
        link.download = `process-map.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to export:', error);
      }
    },
    [isDark]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'animated',
          animated: true,
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className={isDark ? 'bg-gray-950' : 'bg-gray-100'}
      >
        <Background color={isDark ? '#333' : '#ccc'} gap={20} size={1} />

        {/* Left Center Controls Panel */}
        <Panel position="top-left" className="!top-1/2 !-translate-y-1/2 !left-4">
          <div
            className={`flex flex-col gap-1 backdrop-blur-xl border rounded-xl p-1.5 shadow-lg ${
              isDark
                ? 'bg-gray-800/90 border-gray-700'
                : 'bg-white/90 border-gray-300'
            }`}
          >
            {/* Undo/Redo controls */}
            <ControlButton
              onClick={undo}
              icon={<Undo2 className="w-4 h-4" />}
              label="Undo (Ctrl+Z)"
              isDark={isDark}
              disabled={!canUndo()}
            />
            <ControlButton
              onClick={redo}
              icon={<Redo2 className="w-4 h-4" />}
              label="Redo (Ctrl+Shift+Z)"
              isDark={isDark}
              disabled={!canRedo()}
            />

            <div className={`h-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

            {/* Zoom controls */}
            <ControlButton
              onClick={() => zoomIn()}
              icon={<ZoomIn className="w-4 h-4" />}
              label="Zoom In"
              isDark={isDark}
            />
            <ControlButton
              onClick={() => zoomOut()}
              icon={<ZoomOut className="w-4 h-4" />}
              label="Zoom Out"
              isDark={isDark}
            />
            <ControlButton
              onClick={handleFitView}
              icon={<Maximize className="w-4 h-4" />}
              label="Fit View"
              isDark={isDark}
            />

            <div className={`h-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

            {/* Layout options */}
            <ControlButton
              onClick={() => handleLayoutChange('TB')}
              icon={<ArrowDown className="w-4 h-4" />}
              label="Vertical"
              isDark={isDark}
              isActive={currentLayout === 'TB'}
            />
            <ControlButton
              onClick={() => handleLayoutChange('LR')}
              icon={<ArrowRight className="w-4 h-4" />}
              label="Horizontal"
              isDark={isDark}
              isActive={currentLayout === 'LR'}
            />
            <ControlButton
              onClick={() => handleLayoutChange('compact')}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Compact"
              isDark={isDark}
              isActive={currentLayout === 'compact'}
            />

            <div className={`h-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

            {/* Add group */}
            <ControlButton
              onClick={handleAddGroup}
              icon={<Square className="w-4 h-4" />}
              label="Add Group"
              isDark={isDark}
            />

            <div className={`h-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

            {/* Clear canvas */}
            <ControlButton
              onClick={clearFlow}
              icon={<Trash2 className="w-4 h-4" />}
              label="Clear Canvas"
              isDark={isDark}
              disabled={nodes.length === 0}
            />
          </div>
        </Panel>

        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: '#3b82f6',
              action: '#10b981',
              decision: '#f59e0b',
              delay: '#8b5cf6',
              outcome: '#22c55e',
              integration: '#ec4899',
            };
            const nodeType = (node.data as Record<string, unknown>)?.nodeType as string;
            return colors[nodeType] || '#6b7280';
          }}
          className={
            isDark
              ? '!bg-gray-800/80 !border-gray-700 !rounded-xl'
              : '!bg-white/80 !border-gray-300 !rounded-xl'
          }
          maskColor={isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
        />

        {/* Export Panel */}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => downloadImage('png')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            <Image className="w-4 h-4" />
            PNG
          </button>
          <button
            onClick={() => downloadImage('svg')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            SVG
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
