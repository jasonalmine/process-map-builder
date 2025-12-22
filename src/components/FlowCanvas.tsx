'use client';

import { useCallback, useRef, useMemo } from 'react';
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
  LayoutGrid,
} from 'lucide-react';

import ProcessNode from './nodes/ProcessNode';
import AnimatedEdge from './edges/AnimatedEdge';
import { useFlowStore } from '@/store/flowStore';
import { layoutFlow } from '@/lib/layoutFlow';

function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes } = useFlowStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const nodeTypes: NodeTypes = useMemo(() => ({
    processNode: ProcessNode,
  }), []);

  const edgeTypes: EdgeTypes = useMemo(() => ({
    animated: AnimatedEdge,
  }), []);

  const handleArrangeFlow = useCallback(() => {
    if (nodes.length === 0) return;
    const layoutedNodes = layoutFlow(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [nodes, edges, setNodes, fitView]);

  const downloadImage = useCallback(async (format: 'png' | 'svg') => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl =
        format === 'png'
          ? await toPng(element, {
              backgroundColor: '#111111',
              quality: 1,
              pixelRatio: 2,
            })
          : await toSvg(element, {
              backgroundColor: '#111111',
            });

      const link = document.createElement('a');
      link.download = `process-map.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  }, []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        className="bg-gray-950"
      >
        <Background color="#333" gap={20} size={1} />

        {/* Left Center Controls Panel - n8n style */}
        <Panel position="top-left" className="!top-1/2 !-translate-y-1/2 !left-4">
          <div className="flex flex-col gap-1 bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-xl p-1.5 shadow-lg">
            <button
              onClick={() => zoomIn()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-px bg-gray-700 my-1" />
            <button
              onClick={() => fitView({ padding: 0.2 })}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Zoom to Fit"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={handleArrangeFlow}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Arrange / Beautify"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
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
          className="!bg-gray-800/80 !border-gray-700 !rounded-xl"
          maskColor="rgba(0,0,0,0.8)"
        />

        {/* Export Panel */}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => downloadImage('png')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
          >
            <Image className="w-4 h-4" />
            PNG
          </button>
          <button
            onClick={() => downloadImage('svg')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
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
