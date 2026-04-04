import { useEffect, useState } from 'react'
import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { gameDataApi } from '../../api/gameDataApi'
import { Spinner } from '../shared/Spinner'
import type { Background } from '../../types'

export function Step3_Background() {
  const { ruleset, background, setBackground } = useCharacterCreationStore()
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    gameDataApi.backgrounds(ruleset)
      .then((res) => setBackgrounds(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load backgrounds'))
      .finally(() => setLoading(false))
  }, [ruleset])

  if (loading) return <div className="flex justify-center py-8"><Spinner size={28} /></div>
  if (error) return <p className="text-sm text-[#FF6B6B]">{error}</p>

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[#8B9BB0] mb-1">Choose your character's background.</p>
      {backgrounds.map((bg) => {
        const isSelected = background?.id === bg.id
        const isExpanded = expandedId === bg.id

        return (
          <div key={bg.id}
            className={`rounded-xl border transition-colors ${
              isSelected ? 'border-[#C9963A]' : 'border-[#2A3347]'
            } bg-[#161B24]`}
          >
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3"
              onClick={() => {
                setBackground(bg)
                setExpandedId(isExpanded ? null : bg.id)
              }}
            >
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                  {bg.name}
                </div>
                <div className="text-xs text-[#8B9BB0] mt-0.5">
                  Skills: {bg.skill_proficiencies.map((s) => s.replace(/_/g, ' ')).join(', ')}
                  {bg.languages > 0 ? ` · ${bg.languages} language${bg.languages > 1 ? 's' : ''}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSelected && <span className="w-3 h-3 rounded-full bg-[#C9963A]" />}
                <span className="text-[#8B9BB0] text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 border-t border-[#2A3347] flex flex-col gap-2 mt-1">
                <p className="text-xs text-[#8B9BB0]">{bg.description}</p>
                <div className="text-xs">
                  <span className="text-[#E8B84B] font-semibold">{bg.feature.name}: </span>
                  <span className="text-[#8B9BB0]">{bg.feature.description}</span>
                </div>
                {bg.tool_proficiencies.length > 0 && (
                  <div className="text-xs text-[#8B9BB0]">
                    Tools: {bg.tool_proficiencies.map((t) => t.replace(/_/g, ' ')).join(', ')}
                  </div>
                )}
                {bg.stat_bonuses && (
                  <div className="text-xs text-[#8B9BB0]">
                    Stats: {Object.entries(bg.stat_bonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
