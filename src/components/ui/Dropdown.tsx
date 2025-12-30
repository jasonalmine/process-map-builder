'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'right',
  width = 200,
  disabled = false,
  ariaLabel,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Filter out divider-only items for keyboard navigation
  const navigableItems = items.filter(item => !item.divider || item.label);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setFocusedIndex(0);
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const handleSelect = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      handleClose();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1;
          return next >= navigableItems.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? navigableItems.length - 1 : next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < navigableItems.length) {
          handleSelect(navigableItems[focusedIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [isOpen, focusedIndex, navigableItems, handleClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => isOpen ? handleClose() : handleOpen()}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="focus:outline-none"
      >
        {trigger}
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            role="menu"
            aria-orientation="vertical"
            style={{ width }}
            className={`absolute top-full mt-1 py-1 rounded-lg shadow-xl border z-50 ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {items.map((item, index) => {
              if (item.divider && !item.label) {
                return (
                  <div
                    key={`divider-${index}`}
                    className={`my-1 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
                  />
                );
              }

              const navigableIndex = navigableItems.findIndex(ni => ni.id === item.id);

              return (
                <button
                  key={item.id}
                  ref={el => { itemRefs.current[navigableIndex] = el; }}
                  role="menuitem"
                  tabIndex={focusedIndex === navigableIndex ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setFocusedIndex(navigableIndex)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    item.disabled
                      ? isDark
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : item.destructive
                        ? isDark
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-red-600 hover:bg-red-50'
                        : isDark
                          ? 'text-gray-200 hover:bg-gray-800'
                          : 'text-gray-700 hover:bg-gray-100'
                  } ${
                    focusedIndex === navigableIndex && !item.disabled
                      ? isDark
                        ? 'bg-gray-800'
                        : 'bg-gray-100'
                      : ''
                  }`}
                >
                  {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
