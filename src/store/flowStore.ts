import { create } from 'zustand';
import { ProcessNode, ProcessEdge } from '@/types/flow';
import {
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';

interface FlowState {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  isGenerating: boolean;
  prompt: string;
  setNodes: (nodes: ProcessNode[]) => void;
  setEdges: (edges: ProcessEdge[]) => void;
  onNodesChange: (changes: NodeChange<ProcessNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<ProcessEdge>[]) => void;
  addNode: (node: ProcessNode) => void;
  addEdge: (edge: ProcessEdge) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setPrompt: (prompt: string) => void;
  clearFlow: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  isGenerating: false,
  prompt: '',

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  addEdge: (edge) => {
    set({ edges: [...get().edges, edge] });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label } }
          : node
      ),
    });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setPrompt: (prompt) => set({ prompt }),

  clearFlow: () => set({ nodes: [], edges: [] }),
}));
