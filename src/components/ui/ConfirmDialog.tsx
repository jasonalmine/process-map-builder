'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import Button from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Tab') {
      // Simple focus trap between cancel and confirm buttons
      const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [open, onCancel]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the cancel button by default (safer action)
      cancelButtonRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl shadow-2xl border ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className={`absolute top-3 right-3 p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              {variant === 'destructive' && (
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isDark ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
              )}

              {/* Title */}
              <h2
                id="confirm-dialog-title"
                className={`text-lg font-semibold text-center mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="confirm-dialog-message"
                className={`text-sm text-center mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  ref={cancelButtonRef}
                  variant="secondary"
                  size="md"
                  onClick={onCancel}
                  className="flex-1"
                >
                  {cancelText}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  variant={variant === 'destructive' ? 'destructive' : 'primary'}
                  size="md"
                  onClick={onConfirm}
                  className="flex-1"
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
