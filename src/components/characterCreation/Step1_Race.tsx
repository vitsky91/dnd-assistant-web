import { useEffect, useState } from 'react'
import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { gameDataApi } from '../../api/gameDataApi'
import { Spinner } from '../shared/Spinner'
import type { Race, Subrace } from '../../types'

function statBonusText(bonuses: Record<string, number>): string {
  return Object.entries(bonuses)
    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
    .join(', ')
}

export function Step1_Race() {
  const { ruleset, race, subrace, setRace } = useCharacterCreationStore()
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    gameDataApi.races(ruleset)
      .then((res) => setRaces(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load races'))
      .finally(() => setLoading(false))
  }, [ruleset])

  if (loading) return <div className="flex justify-center py-8"><Spinner size={28} /></div>
  if (error) return <p className="text-sm text-[#FF6B6B]">{error}</p>

  function selectRace(r: Race, sr: Subrace | null = null) {
    setRace(r, sr)
    setExpandedId(r.id)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[#8B9BB0] mb-1">Choose your character's race and subrace.</p>
      {races.map((r) => {
        const isSelected = race?.id === r.id
        const isExpanded = expandedId === r.id
        const bonusText = Object.keys(r.stat_bonuses).length > 0 ? statBonusText(r.stat_bonuses) : r.stat_bonus_choice?.note ?? 'Free choice'

        return (
          <div key={r.id}
            className={`rounded-xl border transition-colors ${
              isSelected ? 'border-[#C9963A]' : 'border-[#2A3347]'
            } bg-[#161B24]`}
          >
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3"
              onClick={() => {
                if (r.subraces.length === 0) {
                  selectRace(r, null)
                } else {
                  setExpandedId(isExpanded ? null : r.id)
                  if (!isSelected) setRace(r, null)
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                  {r.name}
                </div>
                <div className="text-xs text-[#8B9BB0] mt-0.5">
                  {bonusText} · Speed {r.speed}ft · {r.size}
                  {r.darkvision ? ` · Darkvision ${r.darkvision}ft` : ''}
                </div>
              </div>
              {r.subraces.length > 0 && (
                <span className="text-[#8B9BB0] text-xs">{isExpanded ? '▲' : '▼'}</span>
              )}
              {isSelected && r.subraces.length === 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C9963A] shrink-0" />
              )}
            </button>

            {/* Traits preview */}
            {isExpanded && r.subraces.length === 0 && (
              <div className="px-4 pb-3 flex flex-col gap-1 border-t border-[#2A3347]">
                {r.traits.map((t) => (
                  <div key={t.name} className="mt-2">
                    <span className="text-xs font-semibold text-[#E8B84B]">{t.name}: </span>
                    <span className="text-xs text-[#8B9BB0]">{t.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subrace list */}
            {isExpanded && r.subraces.length > 0 && (
              <div className="px-4 pb-3 border-t border-[#2A3347] flex flex-col gap-1 mt-1">
                {r.subraces.map((sr) => {
                  const srSelected = isSelected && subrace?.id === sr.id
                  const srBonusText = Object.keys(sr.stat_bonuses).length > 0 ? statBonusText(sr.stat_bonuses) : ''
                  return (
                    <button
                      key={sr.id}
                      onClick={() => selectRace(r, sr)}
                      className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                        srSelected
                          ? 'border-[#C9963A] bg-[#C9963A]/10'
                          : 'border-[#2A3347] hover:border-[#3A4357]'
                      }`}
                    >
                      <div className={`text-sm font-medium ${srSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                        {sr.name}
                      </div>
                      {srBonusText && (
                        <div className="text-xs text-[#8B9BB0]">{srBonusText}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
