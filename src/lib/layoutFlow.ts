import Dagre from '@dagrejs/dagre';
import { ProcessEdge } from '@/types/flow';
import { Node } from '@xyflow/react';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const GROUP_PADDING = 40;

export type LayoutDirection = 'TB' | 'LR' | 'compact';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export function layoutFlow(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection = 'TB'
): AnyNode[] {
  if (nodes.length === 0) return nodes;

  // Separate group nodes from process nodes
  const groupNodes = nodes.filter(n => n.type === 'groupNode');
  const processNodes = nodes.filter(n => n.type !== 'groupNode');

  // If there are groups, use group-aware layout
  if (groupNodes.length > 0) {
    return layoutWithGroups(processNodes, groupNodes, edges, direction);
  }

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

/**
 * Layout nodes with group support
 * Groups are positioned to contain their child nodes
 */
function layoutWithGroups(
  processNodes: AnyNode[],
  groupNodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection
): AnyNode[] {
  // First, layout all process nodes without parent constraints
  const nodesWithoutParent = processNodes.map(n => ({
    ...n,
    parentId: undefined,
    extent: undefined,
  }));

  // Layout process nodes
  let layoutedProcessNodes: AnyNode[];
  if (direction === 'compact') {
    layoutedProcessNodes = layoutCompact(nodesWithoutParent, edges);
  } else if (direction === 'LR') {
    layoutedProcessNodes = layoutLR(nodesWithoutParent, edges);
  } else {
    layoutedProcessNodes = layoutTree(nodesWithoutParent, edges);
  }

  // Build map of group id to child nodes
  const groupChildMap = new Map<string, AnyNode[]>();
  groupNodes.forEach(g => groupChildMap.set(g.id, []));

  // Find children for each group
  processNodes.forEach((originalNode, index) => {
    if (originalNode.parentId && groupChildMap.has(originalNode.parentId)) {
      groupChildMap.get(originalNode.parentId)!.push(layoutedProcessNodes[index]);
    }
  });

  // Position groups to encompass their children
  const positionedGroups: AnyNode[] = groupNodes.map(group => {
    const children = groupChildMap.get(group.id) || [];

    if (children.length === 0) {
      return {
        ...group,
        position: { x: 0, y: 0 },
        style: { ...group.style, width: 300, height: 200 },
      };
    }

    // Calculate bounding box of children
    const minX = Math.min(...children.map(c => c.position.x));
    const minY = Math.min(...children.map(c => c.position.y));
    const maxX = Math.max(...children.map(c => c.position.x + NODE_WIDTH));
    const maxY = Math.max(...children.map(c => c.position.y + NODE_HEIGHT));

    const groupX = minX - GROUP_PADDING;
    const groupY = minY - GROUP_PADDING - 20; // Extra space for label
    const groupWidth = maxX - minX + GROUP_PADDING * 2;
    const groupHeight = maxY - minY + GROUP_PADDING * 2 + 20;

    return {
      ...group,
      position: { x: groupX, y: groupY },
      style: { ...group.style, width: groupWidth, height: groupHeight },
    };
  });

  // Adjust child positions to be relative to parent group
  const finalProcessNodes = layoutedProcessNodes.map((node, index) => {
    const originalNode = processNodes[index];
    if (originalNode.parentId) {
      const parentGroup = positionedGroups.find(g => g.id === originalNode.parentId);
      if (parentGroup) {
        return {
          ...node,
          parentId: originalNode.parentId,
          extent: 'parent' as const,
          position: {
            x: node.position.x - parentGroup.position.x,
            y: node.position.y - parentGroup.position.y,
          },
        };
      }
    }
    return node;
  });

  // Return groups first, then process nodes (React Flow requires parents before children)
  return [...positionedGroups, ...finalProcessNodes];
}

function layoutLR(nodes: AnyNode[], edges: ProcessEdge[]): AnyNode[] {
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
    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
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
