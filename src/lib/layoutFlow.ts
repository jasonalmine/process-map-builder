import Dagre from '@dagrejs/dagre';
import { ProcessEdge } from '@/types/flow';
import { Node } from '@xyflow/react';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

export type LayoutDirection = 'TB' | 'LR' | 'compact';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export function layoutFlow(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection = 'TB'
): AnyNode[] {
  if (nodes.length === 0) return nodes;

  // Use compact n8n-style layout
  if (direction === 'compact') {
    return layoutCompact(nodes, edges);
  }

  // Use tree-style layout for TB
  if (direction === 'TB') {
    return layoutTree(nodes, edges);
  }

  // LR layout using Dagre
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: 'LR',
    nodesep: 40,
    ranksep: 60,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return nodes.map((node) => {
    const position = g.node(node.id);
    const x = position.x - NODE_WIDTH / 2;
    const y = position.y - NODE_HEIGHT / 2;

    return {
      ...node,
      position: { x, y },
    };
  });
}

// Tree-style vertical layout - clean process diagram
function layoutTree(
  nodes: AnyNode[],
  edges: ProcessEdge[]
): AnyNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // TB layout with centered alignment for tree look
  g.setGraph({
    rankdir: 'TB',
    nodesep: 40,       // Horizontal space between siblings
    ranksep: 60,       // Vertical space between levels
    marginx: 40,
    marginy: 40,
    align: 'UL',       // Align to reduce sprawl
    ranker: 'tight-tree', // Use tight tree ranking for cleaner layout
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

// n8n-style compact layout using Dagre LR with tight spacing
function layoutCompact(
  nodes: AnyNode[],
  edges: ProcessEdge[]
): AnyNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Use LR layout with tight n8n-style spacing
  g.setGraph({
    rankdir: 'LR',
    nodesep: 30,      // Tight vertical spacing between parallel nodes
    ranksep: 50,      // Tight horizontal spacing between steps
    marginx: 40,
    marginy: 40,
    align: 'UL',
  });

  // Use smaller node dimensions for compact view
  const COMPACT_WIDTH = 160;
  const COMPACT_HEIGHT = 70;

  nodes.forEach((node) => {
    g.setNode(node.id, { width: COMPACT_WIDTH, height: COMPACT_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - COMPACT_WIDTH / 2,
        y: pos.y - COMPACT_HEIGHT / 2,
      },
    };
  });
}
