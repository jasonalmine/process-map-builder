'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  FileCode,
  FileText,
  FileDown,
  Share2,
  Check,
  Keyboard,
  ChevronDown,
  Copy,
  Loader2,
  Image,
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { flowToMermaid, flowToMarkdown, exportToPDF, downloadTextFile, copyToClipboard } from '@/lib/exportFlow';
import { shareDiagram, isSharingAvailable } from '@/lib/shareService';
import { useFlowStore } from '@/store/flowStore';
import { useThemeStore, COLOR_THEMES } from '@/store/themeStore';
import { useKeyboardShortcuts, KeyboardShortcutsModal } from './KeyboardShortcuts';
import { Tooltip } from '@/components/ui';

interface HeaderControlsProps {
  theme: 'light' | 'dark';
}

export default function HeaderControls({ theme }: HeaderControlsProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const colorTheme = useThemeStore((state) => state.colorTheme);
  const setColorTheme = useThemeStore((state) => state.setColorTheme);
  const keyboardShortcuts = useKeyboardShortcuts();

  const [linkCopied, setLinkCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportCopied, setExportCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const themePickerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themePickerRef.current && !themePickerRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadImage = useCallback(
    async (format: 'png' | 'svg') => {
      setIsExporting(format);
      setStatusMessage(`Exporting ${format.toUpperCase()}...`);

      const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewport) {
        setIsExporting(null);
        return;
      }

      const bgColor = isDark ? '#111111' : '#f5f5f5';
      const nodeElements = document.querySelectorAll('.react-flow__node');
      if (nodeElements.length === 0) {
        setIsExporting(null);
        return;
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      nodeElements.forEach((node) => {
        const rect = node.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      });

      const padding = 40;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;

      try {
        const controls = document.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap, .react-flow__background');
        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'hidden';
        });

        const dataUrl =
          format === 'png'
            ? await toPng(viewport, {
                backgroundColor: bgColor,
                quality: 1,
                pixelRatio: 3,
                width: width,
                height: height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
              })
            : await toSvg(viewport, {
                backgroundColor: bgColor,
                width: width,
                height: height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
              });

        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'visible';
        });

        const link = document.createElement('a');
        link.download = `flowchart.${format}`;
        link.href = dataUrl;
        link.click();
        setStatusMessage(`${format.toUpperCase()} exported successfully`);
      } catch (error) {
        console.error('Failed to export:', error);
        setStatusMessage(`Failed to export ${format.toUpperCase()}`);
        const controls = document.querySelectorAll('.react-flow__panel, .react-flow__controls, .react-flow__minimap, .react-flow__background');
        controls.forEach((el) => {
          (el as HTMLElement).style.visibility = 'visible';
        });
      } finally {
        setIsExporting(null);
        setTimeout(() => setStatusMessage(''), 3000);
      }
      setShowExportMenu(false);
    },
    [isDark]
  );

  const handleExportMermaid = useCallback(async (action: 'copy' | 'download') => {
    const mermaidCode = flowToMermaid(nodes, edges);
    if (action === 'copy') {
      await copyToClipboard(mermaidCode);
      setExportCopied('mermaid');
      setStatusMessage('Mermaid code copied to clipboard');
      setTimeout(() => {
        setExportCopied(null);
        setStatusMessage('');
      }, 2000);
    } else {
      downloadTextFile(mermaidCode, 'flowchart.mmd', 'text/plain');
      setStatusMessage('Mermaid file downloaded');
      setTimeout(() => setStatusMessage(''), 2000);
    }
    setShowExportMenu(false);
  }, [nodes, edges]);

  const handleExportMarkdown = useCallback(async () => {
    const markdown = flowToMarkdown(nodes, edges, 'Flowchart');
    await copyToClipboard(markdown);
    setExportCopied('markdown');
    setStatusMessage('Markdown copied to clipboard');
    setTimeout(() => {
      setExportCopied(null);
      setStatusMessage('');
    }, 2000);
    setShowExportMenu(false);
  }, [nodes, edges]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting('pdf');
    setStatusMessage('Exporting PDF...');
    try {
      await exportToPDF('.react-flow', 'flowchart.pdf');
      setStatusMessage('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      setStatusMessage('Failed to export PDF');
    } finally {
      setIsExporting(null);
      setTimeout(() => setStatusMessage(''), 3000);
    }
    setShowExportMenu(false);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (isSharingAvailable()) {
        const mermaidCode = flowToMermaid(nodes, edges);
        const result = await shareDiagram(nodes, edges, 'Shared Diagram', mermaidCode);

        if (result.success && result.url) {
          await navigator.clipboard.writeText(result.url);
          setLinkCopied(true);
          setStatusMessage('Share link copied to clipboard');
          setTimeout(() => {
            setLinkCopied(false);
            setStatusMessage('');
          }, 2000);
          return;
        }
      }

      const flowData = { nodes, edges };
      const encoded = btoa(encodeURIComponent(JSON.stringify(flowData)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?flow=${encoded}`;

      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setStatusMessage('Share link copied to clipboard');
      setTimeout(() => {
        setLinkCopied(false);
        setStatusMessage('');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setStatusMessage('Failed to copy share link');
      setTimeout(() => setStatusMessage(''), 2000);
    }
  }, [nodes, edges]);

  return (
    <>
      {/* Aria-live region for status messages */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Keyboard Shortcuts */}
      <Tooltip content="Keyboard shortcuts (?)">
        <button
          onClick={keyboardShortcuts.open}
          aria-label="Keyboard shortcuts"
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            isDark
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white focus:ring-offset-gray-900'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900 focus:ring-offset-white'
          }`}
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </Tooltip>

      {/* Color Theme Picker */}
      <div className="relative" ref={themePickerRef}>
        <Tooltip content="Color theme">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            aria-label="Color theme"
            aria-expanded={showThemePicker}
            aria-haspopup="menu"
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-offset-gray-900'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900 focus:ring-offset-white'
            }`}
          >
            <div className="flex -space-x-1">
              {COLOR_THEMES.find(t => t.id === colorTheme)?.swatches.slice(0, 3).map((swatch, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${swatch} border border-white/50`} />
              ))}
            </div>
            <span className="hidden sm:inline">Theme</span>
          </button>
        </Tooltip>

        {showThemePicker && (
          <div
            role="menu"
            aria-orientation="vertical"
            className={`absolute right-0 top-full mt-2 p-3 rounded-xl shadow-xl border z-[100] min-w-[200px] ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Color Theme
            </div>
            <div className="flex flex-col gap-1">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.id}
                  role="menuitem"
                  onClick={() => {
                    setColorTheme(t.id);
                    setShowThemePicker(false);
                  }}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    colorTheme === t.id
                      ? isDark ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-purple-100 ring-1 ring-purple-400'
                      : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex -space-x-1">
                    {t.swatches.map((swatch, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full ${swatch} border border-white/50`} />
                    ))}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.label}
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={nodes.length === 0}
        aria-label={linkCopied ? 'Link copied' : 'Share diagram'}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          nodes.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : ''
        } ${
          linkCopied
            ? 'bg-green-600 hover:bg-green-500 text-white focus:ring-green-500'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
        }`}
      >
        {linkCopied ? (
          <>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      {/* Export Dropdown */}
      <div className="relative" ref={exportMenuRef}>
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={nodes.length === 0 || isExporting !== null}
          aria-label="Export options"
          aria-expanded={showExportMenu}
          aria-haspopup="menu"
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            nodes.length === 0 || isExporting !== null
              ? 'opacity-50 cursor-not-allowed'
              : ''
          } ${
            isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700 focus:ring-offset-gray-900'
              : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 focus:ring-offset-white'
          }`}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
        </button>

        {showExportMenu && (
          <div
            role="menu"
            aria-orientation="vertical"
            className={`absolute right-0 top-full mt-2 py-2 rounded-xl shadow-xl border z-[100] min-w-[180px] ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Code
            </div>
            <button
              role="menuitem"
              onClick={() => handleExportMermaid('copy')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              {exportCopied === 'mermaid' ? 'Copied!' : 'Copy Mermaid'}
            </button>
            <button
              role="menuitem"
              onClick={() => handleExportMermaid('download')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Download .mmd
            </button>
            <button
              role="menuitem"
              onClick={handleExportMarkdown}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              {exportCopied === 'markdown' ? 'Copied!' : 'Copy Markdown'}
            </button>

            <div className={`my-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Images
            </div>
            <button
              role="menuitem"
              onClick={() => downloadImage('png')}
              disabled={isExporting === 'png'}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              } ${isExporting === 'png' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isExporting === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              {isExporting === 'png' ? 'Exporting...' : 'Download PNG'}
            </button>
            <button
              role="menuitem"
              onClick={() => downloadImage('svg')}
              disabled={isExporting === 'svg'}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              } ${isExporting === 'svg' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isExporting === 'svg' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
              {isExporting === 'svg' ? 'Exporting...' : 'Download SVG'}
            </button>
            <button
              role="menuitem"
              onClick={handleExportPDF}
              disabled={isExporting === 'pdf'}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              } ${isExporting === 'pdf' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isExporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={keyboardShortcuts.isOpen}
        onClose={keyboardShortcuts.close}
      />
    </>
  );
}
