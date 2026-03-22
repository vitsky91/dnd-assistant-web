import { useMapStore } from '../../stores/mapStore'
import type { LayerType } from '../../types'

const LAYER_ICONS: Record<LayerType, string> = {
  tile:   '🏔',
  object: '🪑',
  token:  '🧝',
  fog:    '🌫',
}

export function LayerPanel() {
  const { map, activeLayerIndex, setActiveLayer, toggleLayerVisibility } = useMapStore()

  if (!map) return null

  return (
    <div className="p-3 bg-[#161B24] border-l border-[#2A3347] w-44">
      <p className="text-xs text-[#8B9BB0] mb-2 uppercase tracking-wider">Layers</p>
      <div className="flex flex-col gap-1">
        {map.layers.map((layer, i) => (
          <div
            key={layer.id}
            onClick={() => setActiveLayer(i)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeLayerIndex === i
                ? 'bg-[#C9963A]/15 border border-[#C9963A]/40'
                : 'hover:bg-[#1E2535] border border-transparent'
            }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(i) }}
              className={`text-base leading-none flex-shrink-0 transition-opacity ${
                layer.visible ? 'opacity-100' : 'opacity-30'
              }`}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {LAYER_ICONS[layer.type]}
            </button>
            <span className={`text-xs truncate ${
              activeLayerIndex === i ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'
            }`}>
              {layer.name}
            </span>
            {!layer.visible && (
              <span className="ml-auto text-[10px] text-[#4A5568]">hidden</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#2A3347]">
        <p className="text-xs text-[#8B9BB0] mb-1">Active layer</p>
        <p className="text-xs text-[#C9963A] font-medium truncate">
          {map.layers[activeLayerIndex]?.name ?? '–'}
        </p>
      </div>
    </div>
  )
}
