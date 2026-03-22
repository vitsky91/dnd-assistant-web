import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { MapData, MapLayer, CellData, TileType, EditorTool } from '../types'

const MAX_HISTORY = 50

const DEFAULT_TILE_COLORS: Record<TileType, string> = {
  floor_stone: '#4A4A5E',
  floor_wood:  '#7A5530',
  floor_dirt:  '#6B4F2E',
  wall:        '#1A1A2E',
  wall_stone:  '#333344',
  water:       '#1E5F8A',
  lava:        '#CC3300',
  grass:       '#2D5E2D',
  forest:      '#1A3D1A',
  door_open:   '#B8860B',
  door_closed: '#5C3D11',
  stairs_up:   '#999999',
  stairs_down: '#555555',
}

export const TILE_COLORS = DEFAULT_TILE_COLORS

function createDefaultLayers(): MapLayer[] {
  return [
    { id: uuidv4(), name: 'Terrain', type: 'tile', visible: true, cells: {} },
    { id: uuidv4(), name: 'Objects', type: 'object', visible: true, cells: {} },
    { id: uuidv4(), name: 'Fog of War', type: 'fog', visible: true, cells: {} },
  ]
}

interface MapState {
  map: MapData | null
  activeLayerIndex: number
  selectedTile: TileType
  activeTool: EditorTool
  isDirty: boolean
  isSaving: boolean

  // Undo / redo
  history: MapData[]   // past states (index 0 = oldest)
  future: MapData[]    // redo states (index 0 = next)
  canUndo: boolean
  canRedo: boolean

  // Actions
  setMap: (map: MapData) => void
  clearMap: () => void
  createNewMap: (name: string, width: number, height: number, campaignId: string) => void
  setActiveLayer: (index: number) => void
  setSelectedTile: (tile: TileType) => void
  setActiveTool: (tool: EditorTool) => void
  saveToHistory: () => void   // call before each paint stroke
  paintCell: (x: number, y: number) => void
  eraseCell: (x: number, y: number) => void
  undo: () => void
  redo: () => void
  toggleLayerVisibility: (index: number) => void
  setIsSaving: (saving: boolean) => void
  setIsDirty: (dirty: boolean) => void
  updateMapFromServer: (map: MapData) => void
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  activeLayerIndex: 0,
  selectedTile: 'floor_stone',
  activeTool: 'brush',
  isDirty: false,
  isSaving: false,
  history: [],
  future: [],
  canUndo: false,
  canRedo: false,

  setMap: (map) => set({ map, isDirty: false, history: [], future: [], canUndo: false, canRedo: false }),
  clearMap: () => set({ map: null, isDirty: false, history: [], future: [], canUndo: false, canRedo: false }),

  createNewMap: (name, width, height, campaignId) => {
    const map: MapData = {
      id: '',
      name,
      width,
      height,
      cell_size: 50,
      background_image_url: null,
      layers: createDefaultLayers(),
      campaign_id: campaignId,
      status: 'draft',
    }
    set({ map, activeLayerIndex: 0, isDirty: true, history: [], future: [], canUndo: false, canRedo: false })
  },

  setActiveLayer: (index) => set({ activeLayerIndex: index }),
  setSelectedTile: (tile) => set({ selectedTile: tile }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Save current map layers to history before starting a stroke
  saveToHistory: () => {
    const { map, history } = get()
    if (!map) return
    const next = [...history, map].slice(-MAX_HISTORY)
    set({ history: next, future: [], canUndo: true, canRedo: false })
  },

  paintCell: (x, y) => {
    const { map, activeLayerIndex, selectedTile, activeTool } = get()
    if (!map) return

    const key = `${x},${y}`
    const layers = map.layers.map((layer, i) => {
      if (i !== activeLayerIndex) return layer

      if (activeTool === 'fog_reveal') {
        if (layer.type !== 'fog') return layer
        const cells = { ...layer.cells }
        delete cells[key]
        return { ...layer, cells }
      }

      if (activeTool === 'fog_hide') {
        if (layer.type !== 'fog') return layer
        const cellData: CellData = { tile_type: 'wall', color: '#000000' }
        return { ...layer, cells: { ...layer.cells, [key]: cellData } }
      }

      if (activeTool === 'brush') {
        if (layer.type === 'fog') return layer
        const cellData: CellData = {
          tile_type: selectedTile,
          color: DEFAULT_TILE_COLORS[selectedTile],
        }
        return { ...layer, cells: { ...layer.cells, [key]: cellData } }
      }

      return layer
    })

    set({ map: { ...map, layers }, isDirty: true })
  },

  eraseCell: (x, y) => {
    const { map, activeLayerIndex } = get()
    if (!map) return

    const key = `${x},${y}`
    const layers = map.layers.map((layer, i) => {
      if (i !== activeLayerIndex) return layer
      const cells = { ...layer.cells }
      delete cells[key]
      return { ...layer, cells }
    })

    set({ map: { ...map, layers }, isDirty: true })
  },

  undo: () => {
    const { map, history, future } = get()
    if (!map || history.length === 0) return
    const prev = history[history.length - 1]
    const nextHistory = history.slice(0, -1)
    const nextFuture = [map, ...future]
    set({
      map: prev,
      history: nextHistory,
      future: nextFuture,
      isDirty: true,
      canUndo: nextHistory.length > 0,
      canRedo: true,
    })
  },

  redo: () => {
    const { map, history, future } = get()
    if (!map || future.length === 0) return
    const next = future[0]
    const nextFuture = future.slice(1)
    const nextHistory = [...history, map].slice(-MAX_HISTORY)
    set({
      map: next,
      history: nextHistory,
      future: nextFuture,
      isDirty: true,
      canUndo: true,
      canRedo: nextFuture.length > 0,
    })
  },

  toggleLayerVisibility: (index) => {
    const { map } = get()
    if (!map) return
    const layers = map.layers.map((layer, i) =>
      i === index ? { ...layer, visible: !layer.visible } : layer
    )
    set({ map: { ...map, layers } })
  },

  setIsSaving: (isSaving) => set({ isSaving }),
  setIsDirty: (isDirty) => set({ isDirty }),
  updateMapFromServer: (map) => set({ map, isDirty: false }),
}))
