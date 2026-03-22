import { useEffect } from 'react'
import { useMapStore } from '../../stores/mapStore'
import type { EditorTool } from '../../types'

interface ToolDef {
  id: EditorTool
  icon: string
  label: string
  shortcut: string
}

const TOOLS: ToolDef[] = [
  { id: 'brush',      icon: '🖌',  label: 'Brush',      shortcut: 'B' },
  { id: 'eraser',     icon: '✏️',  label: 'Eraser',     shortcut: 'E' },
  { id: 'fog_hide',   icon: '🌫',  label: 'Add Fog',    shortcut: 'F' },
  { id: 'fog_reveal', icon: '🔆',  label: 'Clear Fog',  shortcut: 'R' },
]

export function Toolbar() {
  const { activeTool, setActiveTool, isDirty, isSaving, undo, redo, canUndo, canRedo } = useMapStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if (ctrl && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return }
      if (ctrl && (e.shiftKey ? e.key === 'z' : e.key === 'y')) { e.preventDefault(); redo(); return }

      // Tool shortcuts (no modifier)
      if (!ctrl && !e.metaKey && !e.altKey) {
        const tool = TOOLS.find((t) => t.shortcut.toLowerCase() === e.key.toLowerCase())
        if (tool) setActiveTool(tool.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, setActiveTool])

  return (
    <div className="flex flex-col gap-1 p-2 bg-[#161B24] border-r border-[#2A3347]">
      {/* Drawing tools */}
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          title={`${tool.label} (${tool.shortcut})`}
          onClick={() => setActiveTool(tool.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
            activeTool === tool.id
              ? 'bg-[#C9963A]/20 border border-[#C9963A] text-[#C9963A]'
              : 'text-[#8B9BB0] hover:bg-[#1E2535] hover:text-[#F0EBE1] border border-transparent'
          }`}
        >
          {tool.icon}
        </button>
      ))}

      {/* Divider */}
      <div className="h-px bg-[#2A3347] my-1" />

      {/* Undo */}
      <button
        title="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={!canUndo}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors
          text-[#8B9BB0] hover:bg-[#1E2535] hover:text-[#F0EBE1] border border-transparent
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8B9BB0]"
      >
        ↩
      </button>

      {/* Redo */}
      <button
        title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
        onClick={redo}
        disabled={!canRedo}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors
          text-[#8B9BB0] hover:bg-[#1E2535] hover:text-[#F0EBE1] border border-transparent
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8B9BB0]"
      >
        ↪
      </button>

      <div className="flex-1" />

      {/* Save indicator */}
      {isDirty && !isSaving && (
        <div className="w-2 h-2 rounded-full bg-[#C9963A] mx-auto" title="Unsaved changes" />
      )}
      {isSaving && (
        <div className="w-2 h-2 rounded-full bg-[#8B9BB0] mx-auto animate-pulse" title="Saving..." />
      )}
    </div>
  )
}
