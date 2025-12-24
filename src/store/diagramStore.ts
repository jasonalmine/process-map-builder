import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';
import { ProcessEdge } from '@/types/flow';

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
}

interface DiagramState {
  diagrams: SavedDiagram[];
  currentDiagramId: string | null;
  isLoading: boolean;
  loadDiagrams: () => Promise<void>;
  saveDiagram: (name: string, nodes: AnyNode[], edges: ProcessEdge[], mermaidCode?: string) => Promise<string>;
  updateDiagram: (id: string, updates: Partial<Omit<SavedDiagram, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  renameDiagram: (id: string, newName: string) => Promise<void>;
  setCurrentDiagram: (id: string | null) => void;
  exportAllDiagrams: () => Promise<string>;
  importDiagrams: (jsonString: string) => Promise<number>;
}

const DIAGRAM_PREFIX = 'flowcraft_diagram_';

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagrams: [],
  currentDiagramId: null,
  isLoading: false,

  loadDiagrams: async () => {
    set({ isLoading: true });
    try {
      const allKeys = await idbKeys();
      const diagramKeys = allKeys.filter(
        (key) => typeof key === 'string' && key.startsWith(DIAGRAM_PREFIX)
      );

      const diagrams: SavedDiagram[] = [];
      for (const key of diagramKeys) {
        const diagram = await idbGet<SavedDiagram>(key as string);
        if (diagram) {
          diagrams.push(diagram);
        }
      }

      // Sort by updatedAt descending
      diagrams.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ diagrams, isLoading: false });
    } catch (error) {
      console.error('Failed to load diagrams:', error);
      set({ isLoading: false });
    }
  },

  saveDiagram: async (name, nodes, edges, mermaidCode) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const diagram: SavedDiagram = {
      id,
      name,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      mermaidCode,
      createdAt: now,
      updatedAt: now,
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

    await idbSet(`${DIAGRAM_PREFIX}${id}`, updatedDiagram);

    set((state) => ({
      diagrams: state.diagrams
        .map((d) => (d.id === id ? updatedDiagram : d))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    }));
  },

  deleteDiagram: async (id) => {
    await idbDel(`${DIAGRAM_PREFIX}${id}`);

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
        // Generate new ID to avoid conflicts
        const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${count}`;
        const newDiagram: SavedDiagram = {
          ...diagram,
          id: newId,
          name: `${diagram.name} (imported)`,
          updatedAt: Date.now(),
        };

        await idbSet(`${DIAGRAM_PREFIX}${newId}`, newDiagram);
        count++;
      }
    }

    // Reload diagrams
    await get().loadDiagrams();
    return count;
  },
}));
