import { Node, Edge } from '@xyflow/react';

export type NodeType = 'trigger' | 'action' | 'decision' | 'delay' | 'outcome' | 'integration';

export interface ProcessNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  nodeType: NodeType;
  icon?: string;
}

export type ProcessNode = Node<ProcessNodeData>;
export type ProcessEdge = Edge<{ label?: string }>;

export interface GeneratedFlow {
  nodes: Array<{
    id: string;
    type: NodeType;
    label: string;
    description?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
}
