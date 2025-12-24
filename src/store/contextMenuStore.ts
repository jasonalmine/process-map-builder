import { create } from 'zustand';

export type ContextMenuTargetType = 'node' | 'edge' | 'canvas' | null;

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  targetType: ContextMenuTargetType;
  targetId: string | null;
  open: (position: { x: number; y: number }, targetType: ContextMenuTargetType, targetId: string | null) => void;
  close: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  targetType: null,
  targetId: null,

  open: (position, targetType, targetId) => {
    set({
      isOpen: true,
      position,
      targetType,
      targetId,
    });
  },

  close: () => {
    set({
      isOpen: false,
      targetType: null,
      targetId: null,
    });
  },
}));
