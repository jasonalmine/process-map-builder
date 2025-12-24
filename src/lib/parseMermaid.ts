import { NodeType, NodeShape, ProcessNode, ProcessEdge } from '@/types/flow';
import { TOOLS, Tool } from '@/data/tools';

export interface ParsedMermaidNode {
  id: string;
  label: string;
  shape: 'rect' | 'diamond' | 'rounded' | 'stadium' | 'circle' | 'database' | 'subroutine';
  subgraphId?: string; // Which subgraph this node belongs to
}

export interface ParsedMermaidEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ParsedMermaidSubgraph {
  id: string;
  label: string;
  nodeIds: string[];
}

export interface ParsedMermaidFlow {
  direction: 'TB' | 'LR';
  nodes: ParsedMermaidNode[];
  edges: ParsedMermaidEdge[];
  subgraphs: ParsedMermaidSubgraph[];
}

export interface ParseResult {
  success: boolean;
  flow?: ParsedMermaidFlow;
  error?: string;
}

/**
 * Parse Mermaid flowchart syntax into a structured format
 * Supports: graph TD/TB/LR, node definitions, edge definitions with labels, subgraphs
 */
export function parseMermaid(code: string): ParseResult {
  const lines = code.trim().split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length === 0) {
    return { success: false, error: 'Empty input' };
  }

  // Parse direction from first line
  const directionMatch = lines[0].match(/^(?:graph|flowchart)\s+(TD|TB|LR|RL)/i);
  if (!directionMatch) {
    return { success: false, error: 'Invalid Mermaid syntax: Must start with "graph TD", "graph LR", or "flowchart TD/LR"' };
  }

  const direction = directionMatch[1].toUpperCase() === 'LR' || directionMatch[1].toUpperCase() === 'RL'
    ? 'LR'
    : 'TB';

  const nodesMap = new Map<string, ParsedMermaidNode>();
  const edges: ParsedMermaidEdge[] = [];
  const subgraphs: ParsedMermaidSubgraph[] = [];

  // Track current subgraph context
  let currentSubgraph: ParsedMermaidSubgraph | null = null;

  // Process remaining lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments and empty lines
    if (line.startsWith('%%') || line === '') continue;

    // Parse subgraph start: "subgraph ID [Label]" or "subgraph Label"
    const subgraphMatch = line.match(/^subgraph\s+([A-Za-z_][A-Za-z0-9_]*)\s*\[([^\]]+)\]/i) ||
                          line.match(/^subgraph\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/i) ||
                          line.match(/^subgraph\s+["']?([^"'\]]+)["']?\s*$/i);

    if (subgraphMatch) {
      // If there's a bracket label, use it; otherwise use the ID as label
      const id = subgraphMatch[1].replace(/\s+/g, '_');
      const label = subgraphMatch[2] || subgraphMatch[1];
      currentSubgraph = {
        id: `subgraph_${id}`,
        label: label.trim(),
        nodeIds: [],
      };
      subgraphs.push(currentSubgraph);
      continue;
    }

    // Parse subgraph end
    if (line === 'end') {
      currentSubgraph = null;
      continue;
    }

    // Try to parse as edge definition (most common)
    const edgeParsed = parseEdgeLine(line, nodesMap, currentSubgraph?.id);
    if (edgeParsed) {
      edges.push(...edgeParsed.edges);
      // Track nodes added to current subgraph
      if (currentSubgraph) {
        edgeParsed.nodeIds.forEach(id => {
          if (!currentSubgraph!.nodeIds.includes(id)) {
            currentSubgraph!.nodeIds.push(id);
          }
        });
      }
      continue;
    }

    // Try to parse as standalone node definition
    const nodeParsed = parseNodeDefinition(line);
    if (nodeParsed) {
      if (!nodesMap.has(nodeParsed.id)) {
        nodeParsed.subgraphId = currentSubgraph?.id;
        nodesMap.set(nodeParsed.id, nodeParsed);
      }
      if (currentSubgraph && !currentSubgraph.nodeIds.includes(nodeParsed.id)) {
        currentSubgraph.nodeIds.push(nodeParsed.id);
      }
    }
  }

  if (nodesMap.size === 0) {
    return { success: false, error: 'No nodes found in Mermaid diagram' };
  }

  // Validate edges reference existing nodes
  for (const edge of edges) {
    if (!nodesMap.has(edge.source)) {
      return { success: false, error: `Edge references unknown node: "${edge.source}"` };
    }
    if (!nodesMap.has(edge.target)) {
      return { success: false, error: `Edge references unknown node: "${edge.target}"` };
    }
  }

  return {
    success: true,
    flow: {
      direction,
      nodes: Array.from(nodesMap.values()),
      edges,
      subgraphs,
    },
  };
}

/**
 * Parse a single node definition like A["Label"] or B{Decision}
 */
function parseNodeDefinition(text: string): ParsedMermaidNode | null {
  // Match patterns: A["Label"], A[Label], A{Label}, A(Label), A((Label)), A([Label]), A[(Label)], A[[Label]]
  const patterns = [
    // Database/cylinder shape: A[(Label)]
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\[\(["']?([^\)"']+)["']?\)\]/, shape: 'database' as const },
    // Subroutine: A[[Label]]
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\[\[["']?([^\]"']+)["']?\]\]/, shape: 'subroutine' as const },
    // Stadium shape: A([Label])
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\(\[["']?([^\]"']+)["']?\]\)/, shape: 'stadium' as const },
    // Circle/double circle: A((Label))
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\(\(["']?([^)"']+)["']?\)\)/, shape: 'circle' as const },
    // Diamond: A{Label}
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\{["']?([^}"']+)["']?\}/, shape: 'diamond' as const },
    // Rounded: A(Label)
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\(["']?([^)"']+)["']?\)/, shape: 'rounded' as const },
    // Rectangle with quotes: A["Label"]
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\[["']([^\]"']+)["']\]/, shape: 'rect' as const },
    // Rectangle without quotes: A[Label]
    { regex: /^([A-Za-z_][A-Za-z0-9_]*)\s*\[([^\]]+)\]/, shape: 'rect' as const },
  ];

  for (const { regex, shape } of patterns) {
    const match = text.match(regex);
    if (match) {
      return {
        id: match[1],
        label: match[2].trim(),
        shape,
      };
    }
  }

  // Just a node ID without label
  const idOnlyMatch = text.match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
  if (idOnlyMatch) {
    return {
      id: idOnlyMatch[1],
      label: idOnlyMatch[1],
      shape: 'rect',
    };
  }

  return null;
}

/**
 * Parse node text and return the node, adding to nodesMap if new
 */
function parseAndRegisterNode(
  text: string,
  nodesMap: Map<string, ParsedMermaidNode>,
  subgraphId?: string
): ParsedMermaidNode | null {
  let node = parseNodeDefinition(text);
  if (node) {
    if (!nodesMap.has(node.id)) {
      node.subgraphId = subgraphId;
      nodesMap.set(node.id, node);
    }
    return nodesMap.get(node.id)!;
  }

  // Try to extract just the ID
  const idMatch = text.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
  if (idMatch) {
    const id = idMatch[1];
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, label: id, shape: 'rect', subgraphId });
    }
    return nodesMap.get(id)!;
  }

  return null;
}

/**
 * Parse an edge line like A --> B or A -->|label| B
 * Also handles parallel syntax: A --> B & C & D (creates edges A-->B, A-->C, A-->D)
 */
function parseEdgeLine(
  line: string,
  nodesMap: Map<string, ParsedMermaidNode>,
  subgraphId?: string
): { edges: ParsedMermaidEdge[]; nodeIds: string[] } | null {
  const edges: ParsedMermaidEdge[] = [];
  const nodeIds: string[] = [];

  // Split by arrow patterns to handle chains like A --> B --> C
  // Match arrows with labels first (more specific), then plain arrows
  // Order matters: labeled arrows (-->|text|) must come before plain arrows (-->)
  // Mermaid labeled syntax: -->|label| (no > after closing pipe)
  const arrowPattern = /\s*(-->?\|[^|]+\||--+\s+[^-]+\s+--+>|---+>|==+>|-\.+->?|--+>)\s*/;

  const parts = line.split(arrowPattern);

  if (parts.length < 3) {
    return null; // Not an edge line
  }

  // Process pairs of nodes connected by arrows
  for (let i = 0; i < parts.length - 2; i += 2) {
    const sourceText = parts[i].trim();
    const arrowText = parts[i + 1];
    const targetText = parts[i + 2].trim();

    if (!sourceText || !targetText) continue;

    // Extract edge label from arrow text
    let edgeLabel: string | undefined;
    const labelMatch = arrowText.match(/\|([^|]+)\|/);
    if (labelMatch) {
      edgeLabel = labelMatch[1].trim();
    } else {
      // Check for -- text --> pattern
      const textLabelMatch = arrowText.match(/--\s+([^-]+)\s+-->/);
      if (textLabelMatch) {
        edgeLabel = textLabelMatch[1].trim();
      }
    }

    // Handle parallel syntax with & (e.g., "A & B & C" on either side)
    const sourceNodes = sourceText.split(/\s*&\s*/).map(s => s.trim()).filter(Boolean);
    const targetNodes = targetText.split(/\s*&\s*/).map(t => t.trim()).filter(Boolean);

    // Parse all source nodes
    const parsedSources: ParsedMermaidNode[] = [];
    for (const srcText of sourceNodes) {
      const srcNode = parseAndRegisterNode(srcText, nodesMap, subgraphId);
      if (srcNode) {
        parsedSources.push(srcNode);
        if (!nodeIds.includes(srcNode.id)) {
          nodeIds.push(srcNode.id);
        }
      }
    }

    // Parse all target nodes
    const parsedTargets: ParsedMermaidNode[] = [];
    for (const tgtText of targetNodes) {
      const tgtNode = parseAndRegisterNode(tgtText, nodesMap, subgraphId);
      if (tgtNode) {
        parsedTargets.push(tgtNode);
        if (!nodeIds.includes(tgtNode.id)) {
          nodeIds.push(tgtNode.id);
        }
      }
    }

    // Create edges: each source connects to each target
    for (const srcNode of parsedSources) {
      for (const tgtNode of parsedTargets) {
        edges.push({
          source: srcNode.id,
          target: tgtNode.id,
          label: edgeLabel,
        });
      }
    }
  }

  return edges.length > 0 ? { edges, nodeIds } : null;
}

/**
 * Try to match a node label to a known tool
 */
function matchToolByLabel(label: string): Tool | null {
  const labelLower = label.toLowerCase().trim();

  for (const tool of TOOLS) {
    const toolNameLower = tool.name.toLowerCase();
    // Exact match or label contains tool name
    if (labelLower === toolNameLower || labelLower.includes(toolNameLower)) {
      return tool;
    }
    // Also check if tool name contains the label (for short names like "Slack", "Stripe")
    if (toolNameLower.includes(labelLower) && labelLower.length >= 4) {
      return tool;
    }
  }
  return null;
}

/**
 * Infer node type based on shape, position in graph, and edge count
 */
function inferNodeType(
  node: ParsedMermaidNode,
  edges: ParsedMermaidEdge[],
  allNodes: ParsedMermaidNode[]
): NodeType {
  // Diamond shape = decision
  if (node.shape === 'diamond') {
    return 'decision';
  }

  // Count incoming and outgoing edges
  const incomingCount = edges.filter(e => e.target === node.id).length;
  const outgoingCount = edges.filter(e => e.source === node.id).length;

  // No incoming edges = trigger (starting point)
  if (incomingCount === 0 && allNodes.length > 1) {
    return 'trigger';
  }

  // No outgoing edges = outcome (end point)
  if (outgoingCount === 0 && allNodes.length > 1) {
    return 'outcome';
  }

  // Multiple outgoing edges might indicate a decision
  if (outgoingCount > 1) {
    return 'decision';
  }

  // Check label for hints
  const labelLower = node.label.toLowerCase();
  if (labelLower.includes('wait') || labelLower.includes('delay') || labelLower.includes('timer')) {
    return 'delay';
  }
  if (labelLower.includes('api') || labelLower.includes('webhook') || labelLower.includes('integration')) {
    return 'integration';
  }

  // Default to action
  return 'action';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  style?: Record<string, unknown>;
  parentId?: string;
  extent?: 'parent';
};

/**
 * Convert parsed Mermaid flow to app's ProcessNode/ProcessEdge format
 * Supports tool detection for logos and subgraph conversion to visual groups.
 * @param parsed - The parsed Mermaid flow data
 * @param options - Optional settings for conversion
 * @param options.enableGroups - Whether to create group nodes from subgraphs (default: true)
 */
export function convertMermaidToFlow(
  parsed: ParsedMermaidFlow,
  options: { enableGroups?: boolean } = {}
): {
  nodes: AnyNode[];
  edges: ProcessEdge[];
} {
  const { enableGroups = true } = options;
  const allNodes: AnyNode[] = [];

  // Create group nodes from subgraphs first with color coding (if enabled)
  if (enableGroups) {
    parsed.subgraphs.forEach((subgraph, index) => {
      const groupNode: AnyNode = {
        id: subgraph.id,
        type: 'groupNode',
        position: { x: 0, y: index * 400 }, // Temporary positions, will be layouted
        data: {
          label: subgraph.label,
          colorIndex: index, // Assign color based on order for visual distinction
        },
        style: {
          width: 300,
          height: 200,
        },
      };
      allNodes.push(groupNode);
    });
  }

  // Map parsed shape to NodeShape
  const mapParsedShapeToNodeShape = (parsedShape: ParsedMermaidNode['shape']): NodeShape => {
    switch (parsedShape) {
      case 'rect': return 'rectangle';
      case 'diamond': return 'diamond';
      case 'rounded': return 'rectangle'; // Rounded in Mermaid is a rectangle variant
      case 'stadium': return 'stadium';
      case 'circle': return 'circle';
      case 'database': return 'database';
      case 'subroutine': return 'subroutine';
      default: return 'rectangle';
    }
  };

  // Create process nodes with tool detection
  parsed.nodes.forEach((node, index) => {
    // Check if this node matches a known tool
    const matchedTool = matchToolByLabel(node.label);

    const nodeData: Record<string, unknown> = {
      label: node.label,
      description: '',
      nodeType: matchedTool ? 'tool' : inferNodeType(node, parsed.edges, parsed.nodes),
      shape: mapParsedShapeToNodeShape(node.shape),
    };

    // Add tool info if matched
    if (matchedTool) {
      nodeData.toolId = matchedTool.id;
      nodeData.toolDomain = matchedTool.domain;
    }

    const processNode: AnyNode = {
      id: node.id,
      type: 'processNode',
      position: { x: 0, y: index * 150 }, // Temporary positions, will be layouted
      data: nodeData,
    };

    // If node belongs to a subgraph and groups are enabled, set parent relationship
    if (enableGroups && node.subgraphId) {
      processNode.parentId = node.subgraphId;
      processNode.extent = 'parent';
    }

    allNodes.push(processNode);
  });

  const edges: ProcessEdge[] = parsed.edges.map((edge, index) => ({
    id: `mermaid_e${index}_${edge.source}_${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: parsed.direction === 'LR' ? 'right' : 'bottom',
    targetHandle: parsed.direction === 'LR' ? 'left' : 'top',
    type: 'animated',
    data: { label: edge.label || '' },
  }));

  return { nodes: allNodes, edges };
}
