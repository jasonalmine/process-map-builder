import Dagre from '@dagrejs/dagre';
import { ProcessEdge } from '@/types/flow';
import { Node } from '@xyflow/react';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const GROUP_PADDING = 60;
const GROUP_SPACING = 80;
const GROUP_LABEL_HEIGHT = 40;

export type LayoutDirection = 'TB' | 'LR' | 'compact';

export interface LayoutSpacing {
  nodeSpacing: number;  // Space between sibling nodes (1-5, default 3)
  rankSpacing: number;  // Space between levels/ranks (1-5, default 3)
}

export const DEFAULT_SPACING: LayoutSpacing = {
  nodeSpacing: 3,  // Balanced default
  rankSpacing: 3,  // Balanced default
};

// Convert 1-5 scale to actual pixel values
function getSpacingValues(spacing: LayoutSpacing): { nodesep: number; ranksep: number } {
  // Scale: 1 = tight (40px), 3 = normal (80px), 5 = spacious (160px)
  // More reasonable defaults that don't spread nodes too far apart
  const nodeBase = 40 + (spacing.nodeSpacing - 1) * 30;   // 40, 70, 100, 130, 160
  const rankBase = 50 + (spacing.rankSpacing - 1) * 30;   // 50, 80, 110, 140, 170
  return { nodesep: nodeBase, ranksep: rankBase };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any, string>;

export function layoutFlow(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection = 'TB',
  spacing: LayoutSpacing = DEFAULT_SPACING
): AnyNode[] {
  if (nodes.length === 0) return nodes;

  // Separate group nodes from process nodes
  const groupNodes = nodes.filter(n => n.type === 'groupNode');
  const processNodes = nodes.filter(n => n.type !== 'groupNode');

  // If there are groups, use group-aware layout
  if (groupNodes.length > 0) {
    return layoutWithGroups(processNodes, groupNodes, edges, direction, spacing);
  }

  // Use compact n8n-style layout
  if (direction === 'compact') {
    return layoutCompact(nodes, edges, spacing);
  }

  // Use tree-style layout for TB
  if (direction === 'TB') {
    return layoutTree(nodes, edges, spacing);
  }

  // LR layout using Dagre
  return layoutLR(nodes, edges, spacing);
}

/**
 * Layout nodes with group support
 * Groups are positioned sequentially to prevent overlaps
 */
function layoutWithGroups(
  processNodes: AnyNode[],
  groupNodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection,
  spacing: LayoutSpacing
): AnyNode[] {
  // Build map of group id to original child nodes
  const groupChildMap = new Map<string, AnyNode[]>();
  const standaloneNodes: AnyNode[] = [];

  groupNodes.forEach(g => groupChildMap.set(g.id, []));

  // Separate nodes by group membership
  processNodes.forEach((node) => {
    if (node.parentId && groupChildMap.has(node.parentId)) {
      groupChildMap.get(node.parentId)!.push(node);
    } else {
      standaloneNodes.push(node);
    }
  });

  // Layout each group's children independently
  const groupLayouts = new Map<string, { nodes: AnyNode[], bounds: { width: number, height: number } }>();

  groupNodes.forEach(group => {
    const children = groupChildMap.get(group.id) || [];
    if (children.length === 0) {
      groupLayouts.set(group.id, { nodes: [], bounds: { width: 300, height: 200 } });
      return;
    }

    // Get edges that are internal to this group
    const childIds = new Set(children.map(c => c.id));
    const internalEdges = edges.filter(e => childIds.has(e.source) && childIds.has(e.target));

    // Layout children with spacing
    const layoutedChildren = layoutGroupChildren(children, internalEdges, direction, spacing);

    // Calculate bounds
    const minX = Math.min(...layoutedChildren.map(c => c.position.x));
    const minY = Math.min(...layoutedChildren.map(c => c.position.y));
    const maxX = Math.max(...layoutedChildren.map(c => c.position.x + NODE_WIDTH));
    const maxY = Math.max(...layoutedChildren.map(c => c.position.y + NODE_HEIGHT));

    // Normalize positions to start from (GROUP_PADDING, GROUP_PADDING + label height)
    const normalizedChildren = layoutedChildren.map(node => ({
      ...node,
      position: {
        x: node.position.x - minX + GROUP_PADDING,
        y: node.position.y - minY + GROUP_PADDING + GROUP_LABEL_HEIGHT,
      },
    }));

    const width = maxX - minX + GROUP_PADDING * 2;
    const height = maxY - minY + GROUP_PADDING * 2 + GROUP_LABEL_HEIGHT;

    groupLayouts.set(group.id, {
      nodes: normalizedChildren,
      bounds: { width, height }
    });
  });

  // Position groups sequentially (vertically stacked with spacing)
  let currentY = 50; // Start position
  const positionedGroups: AnyNode[] = [];
  const allChildNodes: AnyNode[] = [];

  groupNodes.forEach(group => {
    const layout = groupLayouts.get(group.id)!;

    const groupNode: AnyNode = {
      ...group,
      position: { x: 50, y: currentY },
      style: {
        ...group.style,
        width: Math.max(layout.bounds.width, 350), // Minimum width
        height: Math.max(layout.bounds.height, 150), // Minimum height
      },
    };
    positionedGroups.push(groupNode);

    // Add children with parent reference
    layout.nodes.forEach(childNode => {
      allChildNodes.push({
        ...childNode,
        parentId: group.id,
        extent: 'parent' as const,
      });
    });

    currentY += layout.bounds.height + GROUP_SPACING;
  });

  // Layout and position standalone nodes (not in any group)
  if (standaloneNodes.length > 0) {
    const standaloneEdges = edges.filter(e =>
      standaloneNodes.some(n => n.id === e.source) ||
      standaloneNodes.some(n => n.id === e.target)
    );

    const layoutedStandalone = layoutGroupChildren(standaloneNodes, standaloneEdges, direction, spacing);

    // Position standalone nodes below all groups
    layoutedStandalone.forEach(node => {
      allChildNodes.push({
        ...node,
        position: {
          x: node.position.x + 50,
          y: node.position.y + currentY,
        },
      });
    });
  }

  // Return groups first, then process nodes (React Flow requires parents before children)
  return [...positionedGroups, ...allChildNodes];
}

/**
 * Layout children within a group with configurable spacing
 */
function layoutGroupChildren(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  direction: LayoutDirection,
  spacing: LayoutSpacing
): AnyNode[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{
      ...nodes[0],
      position: { x: 0, y: 0 },
    }];
  }

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const { nodesep, ranksep } = getSpacingValues(spacing);
  const isHorizontal = direction === 'LR' || direction === 'compact';

  g.setGraph({
    rankdir: isHorizontal ? 'LR' : 'TB',
    nodesep,
    ranksep,
    marginx: 20,
    marginy: 20,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
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

function layoutLR(nodes: AnyNode[], edges: ProcessEdge[], spacing: LayoutSpacing): AnyNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const { nodesep, ranksep } = getSpacingValues(spacing);

  g.setGraph({
    rankdir: 'LR',
    nodesep,
    ranksep,
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

// Check if a flow has true branching (a node with multiple outgoing edges to different paths)
function hasTrueBranching(edges: ProcessEdge[]): boolean {
  const outgoingCount = new Map<string, Set<string>>();

  edges.forEach(edge => {
    if (!outgoingCount.has(edge.source)) {
      outgoingCount.set(edge.source, new Set());
    }
    outgoingCount.get(edge.source)!.add(edge.target);
  });

  // True branching = a node has 2+ different targets
  for (const [, targets] of outgoingCount) {
    if (targets.size >= 2) {
      return true;
    }
  }

  return false;
}

// Tree-style vertical layout - clean process diagram
function layoutTree(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  spacing: LayoutSpacing
): AnyNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const { nodesep, ranksep } = getSpacingValues(spacing);

  // TB layout - use network-simplex ranker for better branch distribution
  g.setGraph({
    rankdir: 'TB',
    nodesep,
    ranksep,
    marginx: 50,
    marginy: 50,
    ranker: 'network-simplex',
    align: 'UL',  // Upper-left alignment for cleaner vertical lines
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  // After layout, check if this is essentially a linear flow (no true branching)
  // If so, center all nodes on the same X axis for a cleaner look
  const hasBranching = hasTrueBranching(edges);

  if (!hasBranching && nodes.length > 0) {
    // For linear flows, center all nodes on a single X axis
    const positions = nodes.map(node => g.node(node.id));
    const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;

    return nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: {
          x: avgX - NODE_WIDTH / 2,  // Center all nodes on average X
          y: pos.y - NODE_HEIGHT / 2,
        },
      };
    });
  }

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

// n8n-style compact layout using Dagre LR with configurable spacing
function layoutCompact(
  nodes: AnyNode[],
  edges: ProcessEdge[],
  spacing: LayoutSpacing
): AnyNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const { nodesep, ranksep } = getSpacingValues(spacing);

  // Use LR layout with network-simplex for better distribution
  g.setGraph({
    rankdir: 'LR',
    nodesep,
    ranksep,
    marginx: 40,
    marginy: 40,
    ranker: 'network-simplex',
  });

  // Use standard node dimensions
  const COMPACT_WIDTH = NODE_WIDTH;
  const COMPACT_HEIGHT = NODE_HEIGHT;

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
