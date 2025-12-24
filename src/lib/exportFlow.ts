import { Node } from '@xyflow/react';
import { ProcessEdge, ProcessNodeData, NodeType, NodeShape } from '@/types/flow';

/**
 * Convert node shape to Mermaid syntax
 */
function shapeToMermaidSyntax(shape: NodeShape | undefined, label: string): string {
  const escapedLabel = label.replace(/"/g, "'");

  switch (shape) {
    case 'stadium':
      return `([${escapedLabel}])`;
    case 'diamond':
      return `{${escapedLabel}}`;
    case 'circle':
      return `((${escapedLabel}))`;
    case 'database':
      return `[(${escapedLabel})]`;
    case 'subroutine':
      return `[[${escapedLabel}]]`;
    case 'rectangle':
    default:
      return `[${escapedLabel}]`;
  }
}

/**
 * Convert node type to Mermaid shape syntax (fallback when no explicit shape)
 */
function nodeTypeToShape(nodeType: NodeType, label: string): string {
  const escapedLabel = label.replace(/"/g, "'");

  switch (nodeType) {
    case 'trigger':
      return `([${escapedLabel}])`; // Stadium shape for triggers
    case 'decision':
      return `{${escapedLabel}}`; // Diamond for decisions
    case 'delay':
      return `((${escapedLabel}))`; // Circle for delays
    case 'outcome':
      return `([${escapedLabel}])`; // Stadium for outcomes
    case 'integration':
      return `[[${escapedLabel}]]`; // Subroutine shape
    case 'tool':
      return `[/${escapedLabel}/]`; // Parallelogram for tools
    case 'action':
    default:
      return `[${escapedLabel}]`; // Rectangle for actions
  }
}

/**
 * Get the Mermaid shape syntax for a node, preferring explicit shape over type-based default
 */
function getNodeMermaidShape(node: Node<ProcessNodeData>): string {
  const label = node.data?.label || node.id;
  const shape = node.data?.shape;
  const nodeType = node.data?.nodeType || 'action';

  // If node has an explicit shape set, use it
  if (shape) {
    return shapeToMermaidSyntax(shape, label);
  }

  // Otherwise fall back to type-based shape
  return nodeTypeToShape(nodeType, label);
}

/**
 * Generate a valid Mermaid node ID from any string
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Convert React Flow nodes and edges to Mermaid flowchart syntax
 */
export function flowToMermaid(
  nodes: Node<ProcessNodeData>[],
  edges: ProcessEdge[],
  direction: 'TB' | 'LR' = 'TB'
): string {
  const lines: string[] = [];

  // Filter to only process nodes (not groups)
  const processNodes = nodes.filter(n => n.type === 'processNode');
  const groupNodes = nodes.filter(n => n.type === 'groupNode');

  // Start with direction
  lines.push(`graph ${direction}`);
  lines.push('');

  // Group nodes by their parent (subgraph)
  const nodesByGroup = new Map<string | undefined, Node<ProcessNodeData>[]>();

  processNodes.forEach(node => {
    const parentId = node.parentId;
    if (!nodesByGroup.has(parentId)) {
      nodesByGroup.set(parentId, []);
    }
    nodesByGroup.get(parentId)!.push(node);
  });

  // Generate subgraphs for groups
  groupNodes.forEach(group => {
    const groupId = sanitizeId(group.id);
    const groupLabel = (group.data as { label?: string })?.label || 'Group';
    const childNodes = nodesByGroup.get(group.id) || [];

    if (childNodes.length > 0) {
      lines.push(`    subgraph ${groupId} [${groupLabel}]`);

      childNodes.forEach(node => {
        const nodeId = sanitizeId(node.id);
        const shape = getNodeMermaidShape(node);
        lines.push(`        ${nodeId}${shape}`);
      });

      lines.push('    end');
      lines.push('');
    }
  });

  // Generate standalone nodes (not in any group)
  const standaloneNodes = nodesByGroup.get(undefined) || [];
  standaloneNodes.forEach(node => {
    const nodeId = sanitizeId(node.id);
    const shape = getNodeMermaidShape(node);
    lines.push(`    ${nodeId}${shape}`);
  });

  if (standaloneNodes.length > 0) {
    lines.push('');
  }

  // Generate edges
  edges.forEach(edge => {
    const sourceId = sanitizeId(edge.source);
    const targetId = sanitizeId(edge.target);
    const label = edge.data?.label;

    if (label) {
      lines.push(`    ${sourceId} -->|${label}| ${targetId}`);
    } else {
      lines.push(`    ${sourceId} --> ${targetId}`);
    }
  });

  return lines.join('\n');
}

/**
 * Export flow as Markdown with Mermaid code block
 */
export function flowToMarkdown(
  nodes: Node<ProcessNodeData>[],
  edges: ProcessEdge[],
  title?: string,
  direction: 'TB' | 'LR' = 'TB'
): string {
  const mermaidCode = flowToMermaid(nodes, edges, direction);

  const lines: string[] = [];

  if (title) {
    lines.push(`# ${title}`);
    lines.push('');
  }

  lines.push('```mermaid');
  lines.push(mermaidCode);
  lines.push('```');

  return lines.join('\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download text as a file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export flow as PDF using jspdf and html-to-image
 */
export async function exportToPDF(elementSelector: string, filename: string = 'flowchart.pdf'): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { toPng } = await import('html-to-image');

  // Get the viewport element which contains only the nodes and edges
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) {
    throw new Error('Viewport not found');
  }

  // Get the bounding box of all nodes
  const nodeElements = document.querySelectorAll('.react-flow__node');
  if (nodeElements.length === 0) {
    throw new Error('No nodes to export');
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodeElements.forEach((node) => {
    const rect = node.getBoundingClientRect();
    minX = Math.min(minX, rect.left);
    minY = Math.min(minY, rect.top);
    maxX = Math.max(maxX, rect.right);
    maxY = Math.max(maxY, rect.bottom);
  });

  // Add padding
  const padding = 60;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  // Hide UI elements temporarily
  const controls = document.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap, .react-flow__background');
  controls.forEach((el) => {
    (el as HTMLElement).style.visibility = 'hidden';
  });

  try {
    const dataUrl = await toPng(viewport, {
      backgroundColor: '#ffffff',
      quality: 1,
      pixelRatio: 3,
      width: width,
      height: height,
      style: {
        transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
      },
    });

    // Restore UI elements
    controls.forEach((el) => {
      (el as HTMLElement).style.visibility = 'visible';
    });

    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width / 3, img.height / 3],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 3, img.height / 3);
    pdf.save(filename);
  } catch (error) {
    // Restore UI elements on error
    controls.forEach((el) => {
      (el as HTMLElement).style.visibility = 'visible';
    });
    throw error;
  }
}
