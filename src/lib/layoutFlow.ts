import Dagre from '@dagrejs/dagre';
import { ProcessNode, ProcessEdge } from '@/types/flow';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 80;

export function layoutFlow(
  nodes: ProcessNode[],
  edges: ProcessEdge[]
): ProcessNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100,
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
