'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  Edit2,
  Check,
  X,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { useDiagramStore, SavedDiagram } from '@/store/diagramStore';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore } from '@/store/themeStore';
import { ConfirmDialog } from '@/components/ui';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DiagramManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { diagrams, currentDiagramId, isLoading, loadDiagrams, saveDiagram, deleteDiagram, renameDiagram, setCurrentDiagram, exportAllDiagrams, importDiagrams } = useDiagramStore();
  const { nodes, edges, setNodes, setEdges, clearFlow } = useFlowStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Load diagrams on mount
  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveDiagram(saveName.trim(), nodes, edges);
    setSaveName('');
    setShowSaveDialog(false);
  };

  const handleLoad = (diagram: SavedDiagram) => {
    // Cast nodes to the expected type with required 'type' property
    const typedNodes = diagram.nodes.map(node => ({
      ...node,
      type: node.type || 'processNode',
    }));
    setNodes(typedNodes);
    setEdges(diagram.edges);
    setCurrentDiagram(diagram.id);
    setIsOpen(false);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiagramToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (diagramToDelete) {
      await deleteDiagram(diagramToDelete);
      setDiagramToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    await renameDiagram(id, editName.trim());
    setEditingId(null);
  };

  const handleExport = async () => {
    const json = await exportAllDiagrams();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowcraft-diagrams.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const count = await importDiagrams(json);
        setImportMessage(`Imported ${count} diagram(s)`);
        setTimeout(() => setImportMessage(null), 3000);
      } catch (error) {
        setImportMessage('Failed to import diagrams');
        setTimeout(() => setImportMessage(null), 3000);
        console.error(error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNewDiagram = () => {
    clearFlow();
    setCurrentDiagram(null);
    setIsOpen(false);
  };

  const currentDiagram = diagrams.find((d) => d.id === currentDiagramId);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
        }`}
      >
        <FolderOpen className="w-4 h-4" />
        <span className="max-w-[120px] truncate">
          {currentDiagram?.name || 'Diagrams'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 top-full mt-2 w-72 rounded-xl shadow-xl border overflow-hidden z-50 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {/* Actions */}
            <div className={`flex items-center gap-1 p-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleNewDiagram}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(true);
                  setSaveName(currentDiagram?.name || '');
                }}
                disabled={nodes.length === 0}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
              <button
                onClick={handleExport}
                disabled={diagrams.length === 0}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {/* Save dialog */}
            {showSaveDialog && (
              <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Diagram name..."
                    autoFocus
                    className={`flex-1 px-2 py-1.5 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-gray-900 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setShowSaveDialog(false);
                    }}
                  />
                  <button
                    onClick={handleSave}
                    className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Diagram list */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading...
                </div>
              ) : diagrams.length === 0 ? (
                <div className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No saved diagrams
                </div>
              ) : (
                diagrams.map((diagram) => (
                  <div
                    key={diagram.id}
                    onClick={() => handleLoad(diagram)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                      diagram.id === currentDiagramId
                        ? isDark
                          ? 'bg-purple-600/20'
                          : 'bg-purple-50'
                        : isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {editingId === diagram.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            className={`flex-1 px-1.5 py-0.5 text-sm rounded border ${
                              isDark
                                ? 'bg-gray-900 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(diagram.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => handleRename(diagram.id)}
                            className="p-1 rounded hover:bg-green-500/20 text-green-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {diagram.name}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(diagram.updatedAt)}
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== diagram.id && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(diagram.id);
                            setEditName(diagram.name);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(diagram.id, e)}
                          className="p-1 rounded transition-colors hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import status message */}
      <AnimatePresence>
        {importMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute right-0 top-full mt-14 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
              importMessage.includes('Failed')
                ? isDark
                  ? 'bg-red-900/90 text-red-200'
                  : 'bg-red-100 text-red-800'
                : isDark
                  ? 'bg-green-900/90 text-green-200'
                  : 'bg-green-100 text-green-800'
            }`}
          >
            {importMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Diagram"
        message="Are you sure you want to delete this diagram? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDiagramToDelete(null);
        }}
      />
    </div>
  );
}
