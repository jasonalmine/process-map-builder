'use client';

import { useState } from 'react';
import {
  Zap,
  Play,
  GitBranch,
  Clock,
  CheckCircle2,
  Plug,
  Wrench,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore, getThemeConfig } from '@/store/themeStore';
import { NodeType } from '@/types/flow';
import { Tool } from '@/data/tools';
import ToolPickerModal from './ToolPickerModal';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  icon: typeof Zap;
}

const paletteItems: NodePaletteItem[] = [
  { type: 'trigger', label: 'Trigger', icon: Zap },
  { type: 'action', label: 'Action', icon: Play },
  { type: 'decision', label: 'Decision', icon: GitBranch },
  { type: 'delay', label: 'Delay', icon: Clock },
  { type: 'outcome', label: 'Outcome', icon: CheckCircle2 },
  { type: 'integration', label: 'Integration', icon: Plug },
];

export default function NodePalette() {
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false);
  const { getViewport } = useReactFlow();
  const addNode = useFlowStore((state) => state.addNode);
  const theme = useThemeStore((state) => state.theme);
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const isDark = theme === 'dark';
  const themeConfig = getThemeConfig(colorTheme);

  const handleAddNode = (nodeType: NodeType) => {
    const viewport = getViewport();

    // Calculate center of viewport
    const centerX = -viewport.x / viewport.zoom + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) / viewport.zoom;
    const centerY = -viewport.y / viewport.zoom + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400) / viewport.zoom;

    const nodeId = `node_${Date.now()}`;

    addNode({
      id: nodeId,
      type: 'processNode',
      position: {
        x: centerX - 110, // Center the 220px wide node
        y: centerY - 40,  // Center the ~80px tall node
      },
      data: {
        label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
        description: '',
        nodeType,
      },
    });
  };

  const handleAddTool = (tool: Tool) => {
    const viewport = getViewport();

    // Calculate center of viewport
    const centerX = -viewport.x / viewport.zoom + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) / viewport.zoom;
    const centerY = -viewport.y / viewport.zoom + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400) / viewport.zoom;

    const nodeId = `tool_${Date.now()}`;

    addNode({
      id: nodeId,
      type: 'processNode',
      position: {
        x: centerX - 110,
        y: centerY - 40,
      },
      data: {
        label: tool.name,
        description: '',
        nodeType: 'tool' as NodeType,
        toolId: tool.id,
        toolDomain: tool.domain,
      },
    });
  };

  const toolStyle = themeConfig.nodes.tool;

  return (
    <>
      <div className="flex flex-col gap-1">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          const nodeStyle = themeConfig.nodes[item.type];
          // Extract base gradient color for background styling
          const bgClass = `bg-gradient-to-r ${nodeStyle.gradient} hover:opacity-80`;

          return (
            <button
              key={item.type}
              onClick={() => handleAddNode(item.type)}
              className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${bgClass}`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${nodeStyle.iconBg}`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {item.label}
              </span>

              {/* Tooltip */}
              <div
                className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
                  isDark
                    ? 'bg-gray-900 text-white border border-gray-700'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-md'
                }`}
              >
                Click to add {item.label.toLowerCase()}
              </div>
            </button>
          );
        })}

        {/* Tool/App Button */}
        <button
          onClick={() => setIsToolPickerOpen(true)}
          className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all bg-gradient-to-r ${toolStyle.gradient} hover:opacity-80`}
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${toolStyle.iconBg}`}>
            <Wrench className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Tool / App
          </span>

          {/* Tooltip */}
          <div
            className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
              isDark
                ? 'bg-gray-900 text-white border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200 shadow-md'
            }`}
          >
            Add app with logo
          </div>
        </button>
      </div>

      {/* Tool Picker Modal */}
      <ToolPickerModal
        isOpen={isToolPickerOpen}
        onClose={() => setIsToolPickerOpen(false)}
        onSelectTool={handleAddTool}
      />
    </>
  );
}
