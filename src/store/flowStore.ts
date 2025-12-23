import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProcessEdge } from '@/types/flow';
import {
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Connection,
  addEdge,
} from '@xyflow/react';
import { sampleFlows } from '@/data/sampleFlows';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

interface HistoryState {
  nodes: AnyNode[];
  edges: ProcessEdge[];
}

interface FlowState {
  nodes: AnyNode[];
  edges: ProcessEdge[];
  isGenerating: boolean;
  prompt: string;
  history: HistoryState[];
  historyIndex: number;
  setNodes: (nodes: AnyNode[]) => void;
  setEdges: (edges: ProcessEdge[]) => void;
  onNodesChange: (changes: NodeChange<AnyNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<ProcessEdge>[]) => void;
  addNode: (node: AnyNode) => void;
  addEdge: (edge: ProcessEdge) => void;
  onConnect: (connection: Connection) => void;
  addGroup: (group: AnyNode) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateGroupLabel: (groupId: string, label: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  deleteSelectedNodes: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setPrompt: (prompt: string) => void;
  clearFlow: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  loadSampleFlow: (flowId?: string) => void;
}

const MAX_HISTORY = 50;

// Sample flow for new users
const sampleNodes: AnyNode[] = [
  {
    id: 'sample_1',
    type: 'processNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Customer Inquiry',
      description: 'Customer submits a support request',
      nodeType: 'trigger',
    },
  },
  {
    id: 'sample_2',
    type: 'processNode',
    position: { x: 0, y: 150 },
    data: {
      label: 'Review Request',
      description: 'Support team reviews the inquiry',
      nodeType: 'action',
    },
  },
  {
    id: 'sample_3',
    type: 'processNode',
    position: { x: 0, y: 300 },
    data: {
      label: 'Is it urgent?',
      description: 'Determine priority level',
      nodeType: 'decision',
    },
  },
  {
    id: 'sample_4',
    type: 'processNode',
    position: { x: -200, y: 450 },
    data: {
      label: 'Escalate to Manager',
      description: 'Forward to senior support',
      nodeType: 'action',
    },
  },
  {
    id: 'sample_5',
    type: 'processNode',
    position: { x: 200, y: 450 },
    data: {
      label: 'Queue for Response',
      description: 'Add to standard queue',
      nodeType: 'delay',
    },
  },
  {
    id: 'sample_6',
    type: 'processNode',
    position: { x: 0, y: 600 },
    data: {
      label: 'Resolve & Close',
      description: 'Issue resolved and ticket closed',
      nodeType: 'outcome',
    },
  },
];

const sampleEdges: ProcessEdge[] = [
  { id: 'e_sample_1-2', source: 'sample_1', target: 'sample_2', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sample_2-3', source: 'sample_2', target: 'sample_3', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sample_3-4', source: 'sample_3', target: 'sample_4', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Yes' } },
  { id: 'e_sample_3-5', source: 'sample_3', target: 'sample_5', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'No' } },
  { id: 'e_sample_4-6', source: 'sample_4', target: 'sample_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
  { id: 'e_sample_5-6', source: 'sample_5', target: 'sample_6', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated' },
];

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      isGenerating: false,
      prompt: '',
      history: [],
      historyIndex: -1,

      saveToHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        // Trim history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });

        // Keep only last MAX_HISTORY states
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      setNodes: (nodes) => {
        get().saveToHistory();
        set({ nodes });
      },

      setEdges: (edges) => {
        get().saveToHistory();
        set({ edges });
      },

      onNodesChange: (changes) => {
        const hasRemoval = changes.some((c) => c.type === 'remove');
        if (hasRemoval) {
          get().saveToHistory();
        }
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        const hasRemoval = changes.some((c) => c.type === 'remove');
        if (hasRemoval) {
          get().saveToHistory();
        }
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      addNode: (node) => {
        get().saveToHistory();
        set({ nodes: [...get().nodes, node] });
      },

      addEdge: (edge) => {
        get().saveToHistory();
        set({ edges: [...get().edges, edge] });
      },

      onConnect: (connection) => {
        get().saveToHistory();
        const newEdge: ProcessEdge = {
          ...connection,
          id: `e_${connection.source}-${connection.target}_${Date.now()}`,
          type: 'animated',
          // Default to vertical handles if not specified
          sourceHandle: connection.sourceHandle || 'bottom',
          targetHandle: connection.targetHandle || 'top',
          data: { label: '' },
        };
        set({ edges: addEdge(newEdge, get().edges) });
      },

      addGroup: (group) => {
        get().saveToHistory();
        set({ nodes: [group, ...get().nodes] });
      },

      updateNodeLabel: (nodeId, label) => {
        get().saveToHistory();
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, label } }
              : node
          ),
        });
      },

      updateGroupLabel: (groupId, label) => {
        get().saveToHistory();
        set({
          nodes: get().nodes.map((node) =>
            node.id === groupId
              ? { ...node, data: { ...node.data, label } }
              : node
          ),
        });
      },

      updateEdgeLabel: (edgeId, label) => {
        get().saveToHistory();
        set({
          edges: get().edges.map((edge) =>
            edge.id === edgeId
              ? { ...edge, data: { ...edge.data, label } }
              : edge
          ),
        });
      },

      deleteSelectedNodes: () => {
        const { nodes, edges } = get();
        const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
        if (selectedNodeIds.length === 0) return;

        get().saveToHistory();
        set({
          nodes: nodes.filter((n) => !n.selected),
          edges: edges.filter(
            (e) => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
          ),
        });
      },

      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setPrompt: (prompt) => set({ prompt }),

      clearFlow: () => {
        get().saveToHistory();
        set({ nodes: [], edges: [] });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const prevState = history[newIndex];
          set({
            nodes: JSON.parse(JSON.stringify(prevState.nodes)),
            edges: JSON.parse(JSON.stringify(prevState.edges)),
            historyIndex: newIndex,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const nextState = history[newIndex];
          set({
            nodes: JSON.parse(JSON.stringify(nextState.nodes)),
            edges: JSON.parse(JSON.stringify(nextState.edges)),
            historyIndex: newIndex,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      loadSampleFlow: (flowId?: string) => {
        get().saveToHistory();
        // If flowId provided, find that specific flow; otherwise use first flow or fallback
        const flow = flowId
          ? sampleFlows.find(f => f.id === flowId)
          : sampleFlows[0];

        if (flow) {
          set({ nodes: flow.nodes, edges: flow.edges });
        } else {
          // Fallback to legacy sample
          set({ nodes: sampleNodes, edges: sampleEdges });
        }
      },
    }),
    {
      name: 'processai-flow',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        prompt: state.prompt,
      }),
    }
  )
);
