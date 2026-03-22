import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/shared/Layout'
import { MapCanvas } from '../components/editor/MapCanvas'
import { Toolbar } from '../components/editor/Toolbar'
import { TilePalette } from '../components/editor/TilePalette'
import { LayerPanel } from '../components/editor/LayerPanel'
import { Spinner } from '../components/shared/Spinner'
import { useMapStore } from '../stores/mapStore'
import { mapsApi } from '../api/mapsApi'
import { battleApi } from '../api/battleApi'
import type { MapData } from '../types'

// Only the fields the backend expects in MapInput
function toSavePayload(map: MapData) {
  return {
    name: map.name,
    width: map.width,
    height: map.height,
    cell_size: map.cell_size,
    background_image_url: map.background_image_url,
    layers: map.layers,
  }
}

function NewMapModal({ onConfirm, onCancel }: {
  onConfirm: (name: string, width: number, height: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('New Map')
  const [width, setWidth] = useState(20)
  const [height, setHeight] = useState(15)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161B24] border border-[#2A3347] rounded-xl p-6 w-80 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#F0EBE1]">New Map</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B9BB0]">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] outline-none focus:border-[#C9963A] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#8B9BB0]">Width (cells)</label>
            <input type="number" min={5} max={60} value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] outline-none focus:border-[#C9963A] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#8B9BB0]">Height (cells)</label>
            <input type="number" min={5} max={60} value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] outline-none focus:border-[#C9963A] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm text-[#8B9BB0] hover:text-[#F0EBE1] border border-[#2A3347] hover:border-[#4A5568] transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(name, width, height)}
            className="flex-1 py-2 rounded-lg text-sm bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] transition-colors">
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export function MapEditorPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { map, isDirty, isSaving, createNewMap, setMap, setIsSaving, setIsDirty } = useMapStore()

  const [error, setError] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  // Keep latest map in a ref so saveMap callback doesn't go stale
  const mapRef = useRef(map)
  useEffect(() => { mapRef.current = map }, [map])

  // Container size for canvas
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const e = entries[0]
      if (e) setContainerSize({ width: e.contentRect.width, height: e.contentRect.height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveMap = useCallback(async () => {
    const current = mapRef.current
    if (!current) return
    setIsSaving(true)
    setError(null)
    try {
      const payload = toSavePayload(current)
      if (!current.id) {
        // First save — create on server
        if (!campaignId) return
        const res = await mapsApi.create(campaignId, payload)
        setMap(res.data)
      } else {
        const res = await mapsApi.update(current.id, payload)
        setMap(res.data)
        setIsDirty(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }, [campaignId, setMap, setIsSaving, setIsDirty])

  // Auto-save: 2s debounce after dirty change
  useEffect(() => {
    if (!isDirty || !mapRef.current?.id) return
    const timer = setTimeout(saveMap, 2000)
    return () => clearTimeout(timer)
  }, [isDirty, map, saveMap])

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /mac/i.test(navigator.userAgent)
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (mapRef.current && !isSaving) saveMap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveMap, isSaving])

  // ── Activate map → start battle ───────────────────────────────────────────
  const handleActivate = useCallback(async () => {
    const current = mapRef.current
    if (!current?.id || !campaignId) return
    if (isDirty) await saveMap()
    setIsActivating(true)
    try {
      await battleApi.create(current.id)
      navigate(`/campaigns/${campaignId}/maps/${current.id}/battle`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start battle')
      setIsActivating(false)
    }
  }, [campaignId, isDirty, saveMap, navigate])

  const handleNewMap = (name: string, width: number, height: number) => {
    if (!campaignId) return
    createNewMap(name, width, height, campaignId)
    setShowNewModal(false)
  }

  return (
    <Layout>
      {showNewModal && (
        <NewMapModal onConfirm={handleNewMap} onCancel={() => setShowNewModal(false)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#161B24] border-b border-[#2A3347] flex-shrink-0">
        <button onClick={() => navigate(-1)}
          className="text-[#8B9BB0] hover:text-[#F0EBE1] text-sm transition-colors">
          ← Back
        </button>

        <div className="h-4 w-px bg-[#2A3347]" />

        {map
          ? <span className="text-sm font-medium text-[#F0EBE1]">{map.name}</span>
          : <span className="text-sm text-[#8B9BB0]">No map loaded</span>
        }

        {isDirty && !isSaving && (
          <span className="text-xs text-[#C9963A]">● Unsaved</span>
        )}
        {isSaving && (
          <span className="text-xs text-[#8B9BB0] flex items-center gap-1">
            <Spinner size={10} /> Saving…
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowNewModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1] hover:border-[#4A5568] transition-colors">
            + New Map
          </button>

          {map && (
            <button
              onClick={saveMap}
              disabled={isSaving || (!isDirty && !!map.id)}
              title="Save (Ctrl+S)"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          )}

          {map?.id && (
            <button
              onClick={handleActivate}
              disabled={isActivating || isSaving}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isActivating ? <Spinner size={12} /> : '⚔️'}
              {isActivating ? 'Starting…' : 'Start Battle'}
            </button>
          )}
        </div>
      </div>

      {/* ── Error bar ── */}
      {error && (
        <div className="px-4 py-2 bg-[#9B2335]/20 border-b border-[#9B2335]/40 text-xs text-[#FF6B6B] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
        </div>
      )}

      {/* ── Editor body ── */}
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <TilePalette />

        <div ref={containerRef} className="flex-1 bg-[#0D0F14] overflow-hidden" style={{ position: 'relative' }}>
          {map ? (
            <MapCanvas containerWidth={containerSize.width} containerHeight={containerSize.height} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-5xl">🗺️</div>
              <p className="text-[#8B9BB0] text-sm">No map loaded</p>
              <button onClick={() => setShowNewModal(true)}
                className="px-4 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold text-sm hover:bg-[#E8B84B] transition-colors">
                Create New Map
              </button>
            </div>
          )}
        </div>

        <LayerPanel />
      </div>
    </Layout>
  )
}
