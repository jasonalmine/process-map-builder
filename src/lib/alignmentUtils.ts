import { Node } from '@xyflow/react';

type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
type DistributionType = 'horizontal' | 'vertical';

// Default node dimensions (used when width/height not specified)
const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 80;

/**
 * Get the effective width of a node
 */
function getNodeWidth(node: Node): number {
  return (node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH) as number;
}

/**
 * Get the effective height of a node
 */
function getNodeHeight(node: Node): number {
  return (node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT) as number;
}

/**
 * Align nodes along a specified axis
 */
export function alignNodes<T extends Node>(nodes: T[], alignment: AlignmentType): T[] {
  if (nodes.length < 2) return nodes;

  const positions = nodes.map((n) => ({
    x: n.position.x,
    y: n.position.y,
    width: getNodeWidth(n),
    height: getNodeHeight(n),
  }));

  let targetValue: number;

  switch (alignment) {
    case 'left':
      targetValue = Math.min(...positions.map((p) => p.x));
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, x: targetValue },
      }));

    case 'center':
      const centerXs = positions.map((p) => p.x + p.width / 2);
      targetValue = (Math.min(...centerXs) + Math.max(...centerXs)) / 2;
      return nodes.map((n, i) => ({
        ...n,
        position: { ...n.position, x: targetValue - positions[i].width / 2 },
      }));

    case 'right':
      const rightEdges = positions.map((p) => p.x + p.width);
      targetValue = Math.max(...rightEdges);
      return nodes.map((n, i) => ({
        ...n,
        position: { ...n.position, x: targetValue - positions[i].width },
      }));

    case 'top':
      targetValue = Math.min(...positions.map((p) => p.y));
      return nodes.map((n) => ({
        ...n,
        position: { ...n.position, y: targetValue },
      }));

    case 'middle':
      const centerYs = positions.map((p) => p.y + p.height / 2);
      targetValue = (Math.min(...centerYs) + Math.max(...centerYs)) / 2;
      return nodes.map((n, i) => ({
        ...n,
        position: { ...n.position, y: targetValue - positions[i].height / 2 },
      }));

    case 'bottom':
      const bottomEdges = positions.map((p) => p.y + p.height);
      targetValue = Math.max(...bottomEdges);
      return nodes.map((n, i) => ({
        ...n,
        position: { ...n.position, y: targetValue - positions[i].height },
      }));

    default:
      return nodes;
  }
}

/**
 * Distribute nodes evenly along an axis
 */
export function distributeNodes<T extends Node>(nodes: T[], direction: DistributionType): T[] {
  if (nodes.length < 3) return nodes;

  // Sort nodes by position
  const sortedIndices = nodes
    .map((n, i) => ({ index: i, pos: direction === 'horizontal' ? n.position.x : n.position.y }))
    .sort((a, b) => a.pos - b.pos)
    .map((item) => item.index);

  const sortedNodes = sortedIndices.map((i) => nodes[i]);
  const positions = sortedNodes.map((n) => ({
    width: getNodeWidth(n),
    height: getNodeHeight(n),
  }));

  if (direction === 'horizontal') {
    const firstX = sortedNodes[0].position.x;
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const lastX = lastNode.position.x + getNodeWidth(lastNode);

    const totalWidth = positions.reduce((sum, p) => sum + p.width, 0);
    const totalSpace = lastX - firstX - totalWidth;
    const gap = totalSpace / (nodes.length - 1);

    let currentX = firstX;
    const newPositions = sortedNodes.map((n, i) => {
      const newX = currentX;
      currentX += positions[i].width + gap;
      return { id: n.id, x: newX };
    });

    return nodes.map((n) => {
      const newPos = newPositions.find((p) => p.id === n.id);
      return newPos ? { ...n, position: { ...n.position, x: newPos.x } } : n;
    });
  } else {
    const firstY = sortedNodes[0].position.y;
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const lastY = lastNode.position.y + getNodeHeight(lastNode);

    const totalHeight = positions.reduce((sum, p) => sum + p.height, 0);
    const totalSpace = lastY - firstY - totalHeight;
    const gap = totalSpace / (nodes.length - 1);

    let currentY = firstY;
    const newPositions = sortedNodes.map((n, i) => {
      const newY = currentY;
      currentY += positions[i].height + gap;
      return { id: n.id, y: newY };
    });

    return nodes.map((n) => {
      const newPos = newPositions.find((p) => p.id === n.id);
      return newPos ? { ...n, position: { ...n.position, y: newPos.y } } : n;
    });
  }
}
