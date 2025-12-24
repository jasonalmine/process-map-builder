import { create } from 'zustand';

interface ViewModeState {
  isViewMode: boolean;
  sharedBy: string | null;
  setViewMode: (isViewMode: boolean, sharedBy?: string) => void;
  exitViewMode: () => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  isViewMode: false,
  sharedBy: null,
  setViewMode: (isViewMode, sharedBy) => set({ isViewMode, sharedBy: sharedBy || null }),
  exitViewMode: () => set({ isViewMode: false, sharedBy: null }),
}));
