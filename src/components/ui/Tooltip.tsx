'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  side = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent',
  };

  const animationVariants = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={animationVariants[side].initial}
            animate={animationVariants[side].animate}
            exit={animationVariants[side].initial}
            transition={{ duration: 0.1 }}
            role="tooltip"
            className={`absolute ${positionStyles[side]} z-50 pointer-events-none`}
          >
            <div
              className={`px-2 py-1 text-xs font-medium rounded shadow-lg whitespace-nowrap ${
                isDark
                  ? 'bg-gray-700 text-gray-100 border border-gray-600'
                  : 'bg-gray-900 text-white'
              }`}
            >
              {content}
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-4 ${arrowStyles[side]}`}
                style={{
                  borderTopColor: side === 'top' ? (isDark ? '#374151' : '#111827') : 'transparent',
                  borderBottomColor: side === 'bottom' ? (isDark ? '#374151' : '#111827') : 'transparent',
                  borderLeftColor: side === 'left' ? (isDark ? '#374151' : '#111827') : 'transparent',
                  borderRightColor: side === 'right' ? (isDark ? '#374151' : '#111827') : 'transparent',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
