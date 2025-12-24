'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Trash2,
  Scissors,
  ClipboardPaste,
  ArrowRight,
  ChevronRight,
  Zap,
  Play,
  GitBranch,
  Clock,
  CheckCircle2,
  Plug,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  LayoutGrid,
  Square,
  Circle,
  Diamond,
  Database,
  Columns,
} from 'lucide-react';
import { useContextMenuStore } from '@/store/contextMenuStore';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { NodeType, NodeShape } from '@/types/flow';
import { alignNodes, distributeNodes } from '@/lib/alignmentUtils';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
  danger?: boolean;
  submenu?: MenuItem[];
  divider?: boolean;
}

const NODE_TYPES: { type: NodeType; label: string; icon: React.ReactNode }[] = [
  { type: 'trigger', label: 'Trigger', icon: <Zap className="w-4 h-4" /> },
  { type: 'action', label: 'Action', icon: <Play className="w-4 h-4" /> },
  { type: 'decision', label: 'Decision', icon: <GitBranch className="w-4 h-4" /> },
  { type: 'delay', label: 'Delay', icon: <Clock className="w-4 h-4" /> },
  { type: 'outcome', label: 'Outcome', icon: <CheckCircle2 className="w-4 h-4" /> },
  { type: 'integration', label: 'Integration', icon: <Plug className="w-4 h-4" /> },
];

const NODE_SHAPES: { shape: NodeShape; label: string; icon: React.ReactNode }[] = [
  { shape: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
  { shape: 'stadium', label: 'Stadium', icon: <Square className="w-4 h-4 rounded-full" /> },
  { shape: 'diamond', label: 'Diamond', icon: <Diamond className="w-4 h-4" /> },
  { shape: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
  { shape: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
  { shape: 'subroutine', label: 'Subroutine', icon: <Columns className="w-4 h-4" /> },
];

export default function ContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isOpen, position, targetType, targetId, close } = useContextMenuStore();
  const { nodes, edges, setNodes, updateNodeData, deleteSelectedNodes, deleteEdge } = useFlowStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const selectedNodes = nodes.filter((n) => n.selected);
  const targetNode = targetId ? nodes.find((n) => n.id === targetId) : null;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Duplicate selected nodes
  const handleDuplicate = useCallback(() => {
    const nodesToDuplicate = selectedNodes.length > 0 ? selectedNodes : (targetNode ? [targetNode] : []);
    if (nodesToDuplicate.length === 0) return;

    const newNodes = nodesToDuplicate.map((node) => ({
      ...node,
      id: `${node.id}_copy_${Date.now()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false,
    }));

    setNodes([...nodes, ...newNodes]);
    close();
  }, [selectedNodes, targetNode, nodes, setNodes, close]);

  // Change node type
  const handleChangeType = useCallback((newType: NodeType) => {
    const nodesToChange = selectedNodes.length > 0 ? selectedNodes : (targetNode ? [targetNode] : []);
    nodesToChange.forEach((node) => {
      if (node.type === 'processNode') {
        updateNodeData(node.id, { nodeType: newType });
      }
    });
    close();
  }, [selectedNodes, targetNode, updateNodeData, close]);

  // Change node shape
  const handleChangeShape = useCallback((newShape: NodeShape) => {
    const nodesToChange = selectedNodes.length > 0 ? selectedNodes : (targetNode ? [targetNode] : []);
    nodesToChange.forEach((node) => {
      if (node.type === 'processNode') {
        updateNodeData(node.id, { shape: newShape });
      }
    });
    close();
  }, [selectedNodes, targetNode, updateNodeData, close]);

  // Delete node(s)
  const handleDelete = useCallback(() => {
    if (targetType === 'edge' && targetId) {
      deleteEdge(targetId);
    } else {
      deleteSelectedNodes();
    }
    close();
  }, [targetType, targetId, deleteEdge, deleteSelectedNodes, close]);

  // Alignment handlers
  const handleAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodes.length < 2) return;
    const alignedNodes = alignNodes(selectedNodes, alignment);
    const nodeMap = new Map(alignedNodes.map((n) => [n.id, n]));
    setNodes(nodes.map((n) => nodeMap.get(n.id) || n));
    close();
  }, [selectedNodes, nodes, setNodes, close]);

  // Distribution handlers
  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedNodes.length < 3) return;
    const distributedNodes = distributeNodes(selectedNodes, direction);
    const nodeMap = new Map(distributedNodes.map((n) => [n.id, n]));
    setNodes(nodes.map((n) => nodeMap.get(n.id) || n));
    close();
  }, [selectedNodes, nodes, setNodes, close]);

  // Build menu items based on context
  const getMenuItems = (): MenuItem[] => {
    if (targetType === 'edge') {
      return [
        { label: 'Delete Edge', icon: <Trash2 className="w-4 h-4" />, action: handleDelete, danger: true },
      ];
    }

    if (targetType === 'node' || selectedNodes.length > 0) {
      const items: MenuItem[] = [
        { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, action: handleDuplicate },
        { divider: true, label: '' },
        {
          label: 'Change Type',
          icon: <ArrowRight className="w-4 h-4" />,
          submenu: NODE_TYPES.map((nt) => ({
            label: nt.label,
            icon: nt.icon,
            action: () => handleChangeType(nt.type),
          })),
        },
        {
          label: 'Change Shape',
          icon: <Square className="w-4 h-4" />,
          submenu: NODE_SHAPES.map((ns) => ({
            label: ns.label,
            icon: ns.icon,
            action: () => handleChangeShape(ns.shape),
          })),
        },
      ];

      // Add alignment options if multiple nodes selected
      if (selectedNodes.length >= 2) {
        items.push({ divider: true, label: '' });
        items.push({
          label: 'Align',
          icon: <AlignLeft className="w-4 h-4" />,
          submenu: [
            { label: 'Align Left', icon: <AlignLeft className="w-4 h-4" />, action: () => handleAlign('left') },
            { label: 'Align Center', icon: <AlignCenter className="w-4 h-4" />, action: () => handleAlign('center') },
            { label: 'Align Right', icon: <AlignRight className="w-4 h-4" />, action: () => handleAlign('right') },
            { divider: true, label: '' },
            { label: 'Align Top', icon: <AlignStartVertical className="w-4 h-4" />, action: () => handleAlign('top') },
            { label: 'Align Middle', icon: <AlignCenterVertical className="w-4 h-4" />, action: () => handleAlign('middle') },
            { label: 'Align Bottom', icon: <AlignEndVertical className="w-4 h-4" />, action: () => handleAlign('bottom') },
          ],
        });
      }

      // Add distribution if 3+ nodes selected
      if (selectedNodes.length >= 3) {
        items.push({
          label: 'Distribute',
          icon: <LayoutGrid className="w-4 h-4" />,
          submenu: [
            { label: 'Distribute Horizontally', icon: <AlignCenter className="w-4 h-4" />, action: () => handleDistribute('horizontal') },
            { label: 'Distribute Vertically', icon: <AlignCenterVertical className="w-4 h-4" />, action: () => handleDistribute('vertical') },
          ],
        });
      }

      items.push({ divider: true, label: '' });
      items.push({ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, action: handleDelete, danger: true });

      return items;
    }

    // Canvas context menu
    return [
      { label: 'Select All', icon: <LayoutGrid className="w-4 h-4" />, action: () => {
        setNodes(nodes.map((n) => ({ ...n, selected: true })));
        close();
      }},
    ];
  };

  const menuItems = getMenuItems();

  // Adjust position to keep menu on screen
  const adjustedPosition = { ...position };
  if (typeof window !== 'undefined') {
    const menuWidth = 200;
    const menuHeight = menuItems.length * 36 + 16;
    if (position.x + menuWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - menuWidth - 10;
    }
    if (position.y + menuHeight > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - menuHeight - 10;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className={`fixed z-50 min-w-[180px] py-1 rounded-lg shadow-xl border backdrop-blur-xl ${
            isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
          }`}
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          {menuItems.map((item, index) =>
            item.divider ? (
              <div
                key={`divider-${index}`}
                className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              />
            ) : (
              <MenuItemComponent
                key={item.label}
                item={item}
                isDark={isDark}
              />
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItemComponent({ item, isDark }: { item: MenuItem; isDark: boolean }) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);

  // For submenu
  if (item.submenu) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowSubmenu(true)}
        onMouseLeave={() => setShowSubmenu(false)}
      >
        <button
          ref={itemRef}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors ${
            isDark
              ? 'text-gray-200 hover:bg-gray-800'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.label}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showSubmenu && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.1 }}
              className={`absolute left-full top-0 ml-1 min-w-[160px] py-1 rounded-lg shadow-xl border backdrop-blur-xl ${
                isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
              }`}
            >
              {item.submenu.map((subitem, i) =>
                subitem.divider ? (
                  <div
                    key={`subdiv-${i}`}
                    className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  />
                ) : (
                  <button
                    key={subitem.label}
                    onClick={subitem.action}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isDark
                        ? 'text-gray-200 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {subitem.icon}
                    {subitem.label}
                  </button>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={item.action}
      disabled={item.disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
        item.disabled
          ? 'opacity-50 cursor-not-allowed'
          : item.danger
          ? isDark
            ? 'text-red-400 hover:bg-red-500/20'
            : 'text-red-600 hover:bg-red-50'
          : isDark
          ? 'text-gray-200 hover:bg-gray-800'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {item.icon}
      {item.label}
    </button>
  );
}

