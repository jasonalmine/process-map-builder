import { Node, Edge } from '@xyflow/react';

export type NodeType = 'trigger' | 'action' | 'decision' | 'delay' | 'outcome' | 'integration' | 'tool';

export interface ProcessNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  nodeType: NodeType;
  icon?: string;
  // Tool-specific fields
  toolId?: string;      // ID from tools.ts
  toolDomain?: string;  // Domain for logo.dev
}

// Legacy GroupColor for backwards compatibility, new groups use ColorTheme from themeStore
export type GroupColor = 'amber' | 'blue' | 'green' | 'purple' | 'rose' | 'slate' | 'stone' | 'walnut' | 'sand' | 'sage' | 'sky' | 'violet';

export interface GroupNodeData extends Record<string, unknown> {
  label: string;
  color?: GroupColor | string;
  colorIndex?: number; // Index into theme's groupColors array
}

export type ProcessNode = Node<ProcessNodeData>;
export type GroupNode = Node<GroupNodeData>;
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
