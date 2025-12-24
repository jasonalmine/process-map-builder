'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

interface DraggablePanelProps {
  children: ReactNode;
  title: string;
  defaultPosition?: { x: number; y: number };
  defaultMinimized?: boolean;
  storageKey?: string;
}

export default function DraggablePanel({
  children,
  title,
  defaultPosition = { x: 16, y: 100 },
  defaultMinimized = false,
  storageKey,
}: DraggablePanelProps) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Load saved position from localStorage
  const getSavedState = () => {
    if (typeof window === 'undefined' || !storageKey) return null;
    try {
      const saved = localStorage.getItem(`panel-${storageKey}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = getSavedState();
  const [position, setPosition] = useState(savedState?.position || defaultPosition);
  const [isMinimized, setIsMinimized] = useState(savedState?.minimized ?? defaultMinimized);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Save state to localStorage
  const saveState = useCallback((pos: { x: number; y: number }, minimized: boolean) => {
    if (typeof window === 'undefined' || !storageKey) return;
    try {
      localStorage.setItem(`panel-${storageKey}`, JSON.stringify({ position: pos, minimized }));
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newPos = {
        x: Math.max(0, dragRef.current.startPosX + dx),
        y: Math.max(0, dragRef.current.startPosY + dy),
      };
      setPosition(newPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (dragRef.current) {
        const dx = 0;
        const dy = 0;
        const finalPos = {
          x: Math.max(0, position.x),
          y: Math.max(0, position.y),
        };
        saveState(finalPos, isMinimized);
      }
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, isMinimized, saveState]);

  const toggleMinimize = useCallback(() => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    saveState(position, newMinimized);
  }, [isMinimized, position, saveState]);

  return (
    <div
      ref={panelRef}
      className="fixed z-40"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div
        className={`backdrop-blur-xl border rounded-xl shadow-lg overflow-hidden ${
          isDark
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/90 border-gray-300'
        }`}
      >
        {/* Header - Draggable */}
        <div
          onMouseDown={handleMouseDown}
          className={`flex items-center gap-1 px-2 py-1.5 cursor-grab active:cursor-grabbing select-none border-b ${
            isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <GripVertical className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wider flex-1 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {title}
          </span>
          <button
            onClick={toggleMinimize}
            className={`p-0.5 rounded transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
            }`}
          >
            {isMinimized ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="p-1.5">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
