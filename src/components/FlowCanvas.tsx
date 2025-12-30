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
  FileText,
  FileDown,
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
  Share2,
  Check,
  Keyboard,
  ChevronDown,
  Copy,
} from 'lucide-react';
import { flowToMermaid, flowToMarkdown, exportToPDF, downloadTextFile, copyToClipboard } from '@/lib/exportFlow';
import { shareDiagram, isSharingAvailable } from '@/lib/shareService';

import ProcessNode from './nodes/ProcessNode';
import GroupNode from './nodes/GroupNode';
import AnimatedEdge from './edges/AnimatedEdge';
import NodePalette from './NodePalette';
import NodeDetailsPanel from './NodeDetailsPanel';
import DraggablePanel from './DraggablePanel';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from './KeyboardShortcuts';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore, COLOR_THEMES, getThemeConfig } from '@/store/themeStore';
import { useViewModeStore } from '@/store/viewModeStore';
import { useContextMenuStore } from '@/store/contextMenuStore';
import { layoutFlow, LayoutDirection, LayoutSpacing, DEFAULT_SPACING } from '@/lib/layoutFlow';
import { ProcessNodeData, NodeType } from '@/types/flow';
import { Node } from '@xyflow/react';
import ContextMenu from './ContextMenu';
import SpacingControls from './SpacingControls';

// Control button with visible label
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
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors w-full text-left ${
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
      <span className="text-xs font-medium">{label}</span>
    </button>
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
    setEdges,
    addGroup,
    deleteSelectedNodes,
    deleteSelectedEdges,
    clearFlow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFlowStore();
  const { zoomIn, zoomOut, fitView, getViewport, getNodes, screenToFlowPosition } = useReactFlow();
  const { open: openContextMenu, close: closeContextMenu } = useContextMenuStore();

  const handleFitView = useCallback(() => {
    const currentNodes = getNodes();
    if (currentNodes.length > 0) {
      fitView({ padding: 0.2, duration: 200, nodes: currentNodes });
    }
  }, [fitView, getNodes]);
  const [currentLayout, setCurrentLayout] = useState<LayoutDirection>('TB');
  const [spacing, setSpacing] = useState<LayoutSpacing>(DEFAULT_SPACING);
  const [selectedNode, setSelectedNode] = useState<Node<ProcessNodeData> | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportCopied, setExportCopied] = useState<string | null>(null);
  const keyboardShortcuts = useKeyboardShortcuts();
  const theme = useThemeStore((state) => state.theme);
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const setColorTheme = useThemeStore((state) => state.setColorTheme);
  const isDark = theme === 'dark';
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { isViewMode, setViewMode, exitViewMode } = useViewModeStore();

  // Track selected node
  useEffect(() => {
    const selected = nodes.find(
      (n) => n.selected && n.type === 'processNode'
    ) as Node<ProcessNodeData> | undefined;
    setSelectedNode(selected || null);
  }, [nodes]);

  // Load shared flow from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flowParam = params.get('flow');
    if (flowParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(flowParam)));
        if (decoded.nodes && decoded.edges) {
          setNodes(decoded.nodes);
          setEdges(decoded.edges);
          // Enable view mode for shared links
          setViewMode(true);
          setTimeout(() => fitView({ padding: 0.2 }), 100);
        }
      } catch (error) {
        console.error('Failed to load shared flow:', error);
      }
    }
  }, [setNodes, setEdges, fitView, setViewMode]);

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

      // Delete selected nodes and edges
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
        deleteSelectedEdges();
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
  }, [deleteSelectedNodes, deleteSelectedEdges, undo, redo]);

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
    (direction: LayoutDirection, newSpacing?: LayoutSpacing) => {
      const processNodes = nodes.filter((n) => n.type === 'processNode');
      if (processNodes.length === 0) return;
      // Pass ALL nodes (including groups) so layoutFlow can handle group-aware layout
      const spacingToUse = newSpacing || spacing;
      const layoutedNodes = layoutFlow(nodes, edges, direction, spacingToUse);
      setNodes(layoutedNodes);
      setCurrentLayout(direction);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    },
    [nodes, edges, setNodes, fitView, spacing]
  );

  const handleApplySpacing = useCallback(() => {
    handleLayoutChange(currentLayout, spacing);
  }, [handleLayoutChange, currentLayout, spacing]);

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
      // Don't set color - group will use global theme by default
      data: { label: 'New Group' },
      style: { width: 400, height: 250 },
    });
  }, [addGroup, getViewport]);

  const downloadImage = useCallback(
    async (format: 'png' | 'svg') => {
      // Get the viewport element which contains only the nodes and edges
      const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewport) return;

      const bgColor = isDark ? '#111111' : '#f5f5f5';

      // Get the bounding box of all nodes to calculate the export area
      const nodeElements = document.querySelectorAll('.react-flow__node');
      if (nodeElements.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      nodeElements.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const transform = window.getComputedStyle(node).transform;
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      });

      // Add padding around the flowchart
      const padding = 40;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;

      try {
        // Hide UI elements temporarily
        const controls = document.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap, .react-flow__background');
        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'hidden';
        });

        const dataUrl =
          format === 'png'
            ? await toPng(viewport, {
                backgroundColor: bgColor,
                quality: 1,
                pixelRatio: 3, // Higher resolution
                width: width,
                height: height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
              })
            : await toSvg(viewport, {
                backgroundColor: bgColor,
                width: width,
                height: height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
              });

        // Restore UI elements
        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'visible';
        });

        const link = document.createElement('a');
        link.download = `flowchart.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to export:', error);
        // Restore UI elements on error
        const controls = document.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap, .react-flow__background');
        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'visible';
        });
      }
      setShowExportMenu(false);
    },
    [isDark]
  );

  const handleExportMermaid = useCallback(async (action: 'copy' | 'download') => {
    const mermaidCode = flowToMermaid(nodes, edges);
    if (action === 'copy') {
      await copyToClipboard(mermaidCode);
      setExportCopied('mermaid');
      setTimeout(() => setExportCopied(null), 2000);
    } else {
      downloadTextFile(mermaidCode, 'flowchart.mmd', 'text/plain');
    }
    setShowExportMenu(false);
  }, [nodes, edges]);

  const handleExportMarkdown = useCallback(async () => {
    const markdown = flowToMarkdown(nodes, edges, 'Flowchart');
    await copyToClipboard(markdown);
    setExportCopied('markdown');
    setTimeout(() => setExportCopied(null), 2000);
    setShowExportMenu(false);
  }, [nodes, edges]);

  const handleExportPDF = useCallback(async () => {
    try {
      await exportToPDF('.react-flow', 'flowchart.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
    setShowExportMenu(false);
  }, []);

  // Context menu handler
  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (isViewMode) return;

      // Check if we clicked on a node or edge
      const target = event.target as HTMLElement;
      const nodeElement = target.closest('.react-flow__node');
      const edgeElement = target.closest('.react-flow__edge');

      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id');
        openContextMenu({ x: event.clientX, y: event.clientY }, 'node', nodeId);
      } else if (edgeElement) {
        const edgeId = edgeElement.getAttribute('data-id');
        openContextMenu({ x: event.clientX, y: event.clientY }, 'edge', edgeId);
      } else {
        openContextMenu({ x: event.clientX, y: event.clientY }, 'canvas', null);
      }
    },
    [isViewMode, openContextMenu]
  );

  // Drag-to-canvas handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isViewMode) return;

      const nodeType = event.dataTransfer.getData('application/flowcraft-node-type') as NodeType;
      if (!nodeType) return;

      const rawPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Snap to 20px grid to match the snapGrid setting
      const position = {
        x: Math.round(rawPosition.x / 20) * 20,
        y: Math.round(rawPosition.y / 20) * 20,
      };

      // Use crypto.randomUUID() to prevent duplicate IDs on rapid creation
      const newNode = {
        id: `node_${crypto.randomUUID()}`,
        type: 'processNode',
        position,
        data: {
          label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          nodeType,
          description: '',
        },
      };

      useFlowStore.getState().addNode(newNode);
    },
    [isViewMode, screenToFlowPosition]
  );

  const handleShare = useCallback(async () => {
    try {
      // Try Supabase short links first
      if (isSharingAvailable()) {
        const mermaidCode = flowToMermaid(nodes, edges);
        const result = await shareDiagram(nodes, edges, 'Shared Diagram', mermaidCode);

        if (result.success && result.url) {
          await navigator.clipboard.writeText(result.url);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
          return;
        }
      }

      // Fallback to long URL encoding
      const flowData = { nodes, edges };
      const encoded = btoa(encodeURIComponent(JSON.stringify(flowData)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?flow=${encoded}`;

      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }, [nodes, edges]);

  // Connection validation - prevent self-connections and duplicate edges
  const isValidConnection = useCallback(
    (connection: { source: string | null; target: string | null; sourceHandle?: string | null; targetHandle?: string | null }) => {
      // Prevent self-connections
      if (connection.source === connection.target) {
        return false;
      }

      // Prevent duplicate edges (same source and target)
      const isDuplicate = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target
      );
      if (isDuplicate) {
        return false;
      }

      return true;
    },
    [edges]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isViewMode ? undefined : onNodesChange}
        onEdgesChange={isViewMode ? undefined : onEdgesChange}
        onConnect={isViewMode ? undefined : onConnect}
        isValidConnection={isValidConnection}
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
        nodesDraggable={!isViewMode}
        nodesConnectable={!isViewMode}
        elementsSelectable={!isViewMode}
        // Snap to grid for cleaner alignment
        snapToGrid={true}
        snapGrid={[20, 20]}
        // Enable box selection with drag (hold shift to multi-select)
        selectionOnDrag={true}
        // Magnetic handles - connection snaps within 30px radius
        connectionRadius={30}
        // Pan with middle mouse button or right-click, drag select with left
        panOnDrag={[1, 2]}
        zoomOnScroll={true}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Background color={isDark ? '#333' : '#ccc'} gap={20} size={1} />

        {/* View Mode Banner */}
        {isViewMode && (
          <Panel position="top-left" className="m-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-lg ${
              isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                View Mode
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This is a shared flowchart
              </span>
              <button
                onClick={() => {
                  exitViewMode();
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="ml-2 px-3 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Edit a Copy
              </button>
            </div>
          </Panel>
        )}

        {/* Left Controls Panel - Draggable (hidden in view mode) */}
        {!isViewMode && (
          <DraggablePanel
            title="Tools"
            defaultPosition={{ x: 16, y: 100 }}
            storageKey="tools-panel"
          >
            <div className="flex flex-col gap-1">
              {/* Undo/Redo controls */}
              <ControlButton
                onClick={undo}
                icon={<Undo2 className="w-4 h-4" />}
                label="Undo"
                isDark={isDark}
                disabled={!canUndo()}
              />
              <ControlButton
                onClick={redo}
                icon={<Redo2 className="w-4 h-4" />}
                label="Redo"
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

              {/* Spacing Controls */}
              <div className="mt-1">
                <SpacingControls
                  spacing={spacing}
                  onChange={setSpacing}
                  onApply={handleApplySpacing}
                  isDark={isDark}
                />
              </div>

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
          </DraggablePanel>
        )}

        {/* Node Palette - Draggable (hidden in view mode) */}
        {!isViewMode && (
          <DraggablePanel
            title="Add Node"
            defaultPosition={{ x: 16, y: 450 }}
            storageKey="node-palette"
          >
            <NodePalette />
          </DraggablePanel>
        )}

        <MiniMap
          nodeColor={(node) => {
            const themeConfig = getThemeConfig(colorTheme);
            const nodeType = (node.data as Record<string, unknown>)?.nodeType as string;
            const nodeStyle = themeConfig.nodes[nodeType as keyof typeof themeConfig.nodes];
            return nodeStyle?.minimapColor || '#6b7280';
          }}
          className={
            isDark
              ? '!bg-gray-800/80 !border-gray-700 !rounded-xl'
              : '!bg-white/80 !border-gray-300 !rounded-xl'
          }
          maskColor={isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
        />

        {/* Export Panel */}
        <Panel position="top-right" className="flex gap-2 items-center">
          {/* Keyboard Shortcuts */}
          <button
            onClick={keyboardShortcuts.open}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
            }`}
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Color Theme Picker */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              <div className="flex -space-x-1">
                {COLOR_THEMES.find(t => t.id === colorTheme)?.swatches.slice(0, 3).map((swatch, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${swatch} border border-white/50`} />
                ))}
              </div>
              <span>Theme</span>
            </button>

            {showThemePicker && (
              <div
                className={`absolute right-0 top-full mt-2 p-3 rounded-xl shadow-xl border z-[100] min-w-[200px] ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Color Theme
                </div>
                <div className="flex flex-col gap-1">
                  {COLOR_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setColorTheme(t.id);
                        setShowThemePicker(false);
                      }}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${
                        colorTheme === t.id
                          ? isDark ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-purple-100 ring-1 ring-purple-400'
                          : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex -space-x-1">
                        {t.swatches.map((swatch, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full ${swatch} border border-white/50`} />
                        ))}
                      </div>
                      <div className="text-left">
                        <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t.label}
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              nodes.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${
              linkCopied
                ? 'bg-green-600 hover:bg-green-500 text-white border-green-600'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-transparent'
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={nodes.length === 0}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                nodes.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              <FileDown className="w-4 h-4" />
              Export
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div
                className={`absolute right-0 top-full mt-2 py-2 rounded-xl shadow-xl border z-[100] min-w-[180px] ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Code
                </div>
                <button
                  onClick={() => handleExportMermaid('copy')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {exportCopied === 'mermaid' ? 'Copied!' : 'Copy Mermaid'}
                </button>
                <button
                  onClick={() => handleExportMermaid('download')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  Download .mmd
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {exportCopied === 'markdown' ? 'Copied!' : 'Copy Markdown'}
                </button>

                <div className={`my-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Images
                </div>
                <button
                  onClick={() => downloadImage('png')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={() => downloadImage('svg')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  Download SVG
                </button>
                <button
                  onClick={handleExportPDF}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </Panel>

        {/* Node Details Panel (hidden in view mode) */}
        {!isViewMode && (
          <NodeDetailsPanel
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={keyboardShortcuts.isOpen}
          onClose={keyboardShortcuts.close}
        />

        {/* Context Menu */}
        <ContextMenu />
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
