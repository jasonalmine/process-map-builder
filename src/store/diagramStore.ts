import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';
import { ProcessEdge } from '@/types/flow';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchUserDiagrams,
  saveDiagramToCloud,
  updateDiagramInCloud,
  deleteDiagramFromCloud,
  CloudDiagram,
} from '@/lib/diagramSyncService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  [key: string]: unknown;
};

export interface SavedDiagram {
  id: string;
  name: string;
  nodes: AnyNode[];
  edges: ProcessEdge[];
  mermaidCode?: string;
  createdAt: number;
  updatedAt: number;
  isCloud?: boolean; // Flag to identify cloud-synced diagrams
}

interface DiagramState {
  diagrams: SavedDiagram[];
  currentDiagramId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  loadDiagrams: () => Promise<void>;
  saveDiagram: (name: string, nodes: AnyNode[], edges: ProcessEdge[], mermaidCode?: string) => Promise<string>;
  updateDiagram: (id: string, updates: Partial<Omit<SavedDiagram, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  renameDiagram: (id: string, newName: string) => Promise<void>;
  setCurrentDiagram: (id: string | null) => void;
  exportAllDiagrams: () => Promise<string>;
  importDiagrams: (jsonString: string) => Promise<number>;
  syncToCloud: () => Promise<void>;
}

const DIAGRAM_PREFIX = 'flowcraft_diagram_';

// Convert cloud diagram to local format
function cloudToLocal(cloud: CloudDiagram): SavedDiagram {
  return {
    id: cloud.id,
    name: cloud.name,
    nodes: cloud.nodes as AnyNode[],
    edges: cloud.edges as ProcessEdge[],
    mermaidCode: cloud.mermaidCode,
    createdAt: new Date(cloud.createdAt).getTime(),
    updatedAt: new Date(cloud.updatedAt).getTime(),
    isCloud: true,
  };
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagrams: [],
  currentDiagramId: null,
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,

  loadDiagrams: async () => {
    set({ isLoading: true, syncError: null });

    try {
      // If Supabase is configured, load from cloud
      if (isSupabaseConfigured) {
        const result = await fetchUserDiagrams();

        if (result.success) {
          const diagrams = result.diagrams.map(cloudToLocal);
          diagrams.sort((a, b) => b.updatedAt - a.updatedAt);
          set({
            diagrams,
            isLoading: false,
            lastSyncedAt: Date.now(),
            syncError: null,
          });
          return;
        } else {
          set({ syncError: result.error || 'Failed to load diagrams' });
        }
      }

      // Fallback to local storage (IndexedDB)
      const allKeys = await idbKeys();
      const diagramKeys = allKeys.filter(
        (key) => typeof key === 'string' && key.startsWith(DIAGRAM_PREFIX)
      );

      const diagrams: SavedDiagram[] = [];
      for (const key of diagramKeys) {
        const diagram = await idbGet<SavedDiagram>(key as string);
        if (diagram) {
          diagrams.push({ ...diagram, isCloud: false });
        }
      }

      // Sort by updatedAt descending
      diagrams.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ diagrams, isLoading: false });
    } catch (error) {
      console.error('Failed to load diagrams:', error);
      set({ isLoading: false, syncError: 'Failed to load diagrams' });
    }
  },

  saveDiagram: async (name, nodes, edges, mermaidCode) => {
    const now = Date.now();

    // If Supabase is configured, save to cloud
    if (isSupabaseConfigured) {
      set({ isSyncing: true });

      const result = await saveDiagramToCloud(
        name,
        nodes as unknown as import('@xyflow/react').Node[],
        edges as unknown as import('@xyflow/react').Edge[],
        mermaidCode
      );

      set({ isSyncing: false });

      if (result.success && result.diagram) {
        const diagram = cloudToLocal(result.diagram);

        set((state) => ({
          diagrams: [diagram, ...state.diagrams],
          currentDiagramId: diagram.id,
          lastSyncedAt: Date.now(),
        }));

        return diagram.id;
      } else {
        set({ syncError: result.error || 'Failed to save diagram' });
        throw new Error(result.error || 'Failed to save diagram');
      }
    }

    // Fallback to local storage
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const diagram: SavedDiagram = {
      id,
      name,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      mermaidCode,
      createdAt: now,
      updatedAt: now,
      isCloud: false,
    };

    await idbSet(`${DIAGRAM_PREFIX}${id}`, diagram);

    set((state) => ({
      diagrams: [diagram, ...state.diagrams],
      currentDiagramId: id,
    }));

    return id;
  },

  updateDiagram: async (id, updates) => {
    const { diagrams } = get();
    const diagram = diagrams.find((d) => d.id === id);

    if (!diagram) {
      throw new Error('Diagram not found');
    }

    const updatedDiagram: SavedDiagram = {
      ...diagram,
      ...updates,
      updatedAt: Date.now(),
    };

    if (updates.nodes) {
      updatedDiagram.nodes = JSON.parse(JSON.stringify(updates.nodes));
    }
    if (updates.edges) {
      updatedDiagram.edges = JSON.parse(JSON.stringify(updates.edges));
    }

    // If cloud diagram, update in cloud
    if (diagram.isCloud && isSupabaseConfigured) {
      set({ isSyncing: true });

      const result = await updateDiagramInCloud(id, {
        name: updates.name,
        nodes: updates.nodes as unknown as import('@xyflow/react').Node[],
        edges: updates.edges as unknown as import('@xyflow/react').Edge[],
        mermaidCode: updates.mermaidCode,
      });

      set({ isSyncing: false });

      if (!result.success) {
        set({ syncError: result.error || 'Failed to update diagram' });
        throw new Error(result.error || 'Failed to update diagram');
      }

      if (result.diagram) {
        const cloudDiagram = cloudToLocal(result.diagram);
        set((state) => ({
          diagrams: state.diagrams
            .map((d) => (d.id === id ? cloudDiagram : d))
            .sort((a, b) => b.updatedAt - a.updatedAt),
          lastSyncedAt: Date.now(),
        }));
        return;
      }
    }

    // Local storage update
    await idbSet(`${DIAGRAM_PREFIX}${id}`, updatedDiagram);

    set((state) => ({
      diagrams: state.diagrams
        .map((d) => (d.id === id ? updatedDiagram : d))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    }));
  },

  deleteDiagram: async (id) => {
    const { diagrams } = get();
    const diagram = diagrams.find((d) => d.id === id);

    // If cloud diagram, delete from cloud
    if (diagram?.isCloud && isSupabaseConfigured) {
      set({ isSyncing: true });

      const result = await deleteDiagramFromCloud(id);

      set({ isSyncing: false });

      if (!result.success) {
        set({ syncError: result.error || 'Failed to delete diagram' });
        throw new Error(result.error || 'Failed to delete diagram');
      }
    } else {
      // Local storage delete
      await idbDel(`${DIAGRAM_PREFIX}${id}`);
    }

    set((state) => ({
      diagrams: state.diagrams.filter((d) => d.id !== id),
      currentDiagramId: state.currentDiagramId === id ? null : state.currentDiagramId,
    }));
  },

  renameDiagram: async (id, newName) => {
    await get().updateDiagram(id, { name: newName });
  },

  setCurrentDiagram: (id) => {
    set({ currentDiagramId: id });
  },

  exportAllDiagrams: async () => {
    const { diagrams } = get();
    return JSON.stringify(diagrams, null, 2);
  },

  importDiagrams: async (jsonString) => {
    const imported = JSON.parse(jsonString) as SavedDiagram[];

    if (!Array.isArray(imported)) {
      throw new Error('Invalid import format');
    }

    let count = 0;
    for (const diagram of imported) {
      if (diagram.id && diagram.name && diagram.nodes && diagram.edges) {
        // Save each diagram (will go to cloud if configured)
        await get().saveDiagram(
          `${diagram.name} (imported)`,
          diagram.nodes,
          diagram.edges,
          diagram.mermaidCode
        );
        count++;
      }
    }

    // Reload diagrams
    await get().loadDiagrams();
    return count;
  },

  syncToCloud: async () => {
    if (!isSupabaseConfigured) return;

    set({ isSyncing: true, syncError: null });

    try {
      await get().loadDiagrams();
      set({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (error) {
      console.error('Sync failed:', error);
      set({ isSyncing: false, syncError: 'Sync failed' });
    }
  },
}));
