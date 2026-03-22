import { useMapStore, TILE_COLORS } from '../../stores/mapStore'
import type { TileType } from '../../types'

interface TileDef {
  id: TileType
  label: string
  icon: string
}

const TILES: TileDef[] = [
  { id: 'floor_stone', label: 'Stone Floor', icon: '⬜' },
  { id: 'floor_wood',  label: 'Wood Floor',  icon: '🟫' },
  { id: 'floor_dirt',  label: 'Dirt',        icon: '🟤' },
  { id: 'wall',        label: 'Wall',         icon: '⬛' },
  { id: 'wall_stone',  label: 'Stone Wall',   icon: '🪨' },
  { id: 'water',       label: 'Water',        icon: '🟦' },
  { id: 'lava',        label: 'Lava',         icon: '🔴' },
  { id: 'grass',       label: 'Grass',        icon: '🟩' },
  { id: 'forest',      label: 'Forest',       icon: '🌲' },
  { id: 'door_open',   label: 'Open Door',    icon: '🚪' },
  { id: 'door_closed', label: 'Closed Door',  icon: '🚫' },
  { id: 'stairs_up',   label: 'Stairs Up',    icon: '⬆️' },
  { id: 'stairs_down', label: 'Stairs Down',  icon: '⬇️' },
]

export function TilePalette() {
  const { selectedTile, setSelectedTile, activeTool } = useMapStore()
  const isVisible = activeTool === 'brush'

  if (!isVisible) return null

  return (
    <div className="p-3 bg-[#161B24] border-r border-[#2A3347] w-40 overflow-y-auto">
      <p className="text-xs text-[#8B9BB0] mb-2 uppercase tracking-wider">Tiles</p>
      <div className="flex flex-col gap-1">
        {TILES.map((tile) => (
          <button
            key={tile.id}
            onClick={() => setSelectedTile(tile.id)}
            title={tile.label}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
              selectedTile === tile.id
                ? 'bg-[#C9963A]/20 border border-[#C9963A]/60 text-[#F0EBE1]'
                : 'text-[#8B9BB0] hover:bg-[#1E2535] hover:text-[#F0EBE1] border border-transparent'
            }`}
          >
            <span
              className="w-4 h-4 rounded-sm flex-shrink-0 border border-white/10"
              style={{ backgroundColor: TILE_COLORS[tile.id] }}
            />
            <span className="truncate">{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
