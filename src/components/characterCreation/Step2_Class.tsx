import { useEffect, useState } from 'react'
import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { gameDataApi } from '../../api/gameDataApi'
import { Spinner } from '../shared/Spinner'
import type { GameClass } from '../../types'

export function Step2_Class() {
  const { ruleset, gameClass, setClass } = useCharacterCreationStore()
  const [classes, setClasses] = useState<GameClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    gameDataApi.classes(ruleset)
      .then((res) => setClasses(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load classes'))
      .finally(() => setLoading(false))
  }, [ruleset])

  if (loading) return <div className="flex justify-center py-8"><Spinner size={28} /></div>
  if (error) return <p className="text-sm text-[#FF6B6B]">{error}</p>

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[#8B9BB0] mb-1">Choose your character's class.</p>
      {classes.map((cls) => {
        const isSelected = gameClass?.id === cls.id
        const isExpanded = expandedId === cls.id
        const skillCount = cls.skill_choices.options === 'any' ? 'any' : (cls.skill_choices.options as string[]).slice(0, 4).map(s => s.replace(/_/g, ' ')).join(', ')

        return (
          <div key={cls.id}
            className={`rounded-xl border transition-colors ${
              isSelected ? 'border-[#C9963A]' : 'border-[#2A3347]'
            } bg-[#161B24]`}
          >
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3"
              onClick={() => {
                setClass(cls)
                setExpandedId(isExpanded ? null : cls.id)
              }}
            >
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                  {cls.name}
                </div>
                <div className="text-xs text-[#8B9BB0] mt-0.5">
                  {cls.hit_die} · {cls.primary_ability.join('/')} primary
                  {cls.spellcasting ? ` · Spellcaster (${cls.spellcasting.ability.toUpperCase()})` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSelected && <span className="w-3 h-3 rounded-full bg-[#C9963A]" />}
                <span className="text-[#8B9BB0] text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 border-t border-[#2A3347] text-xs text-[#8B9BB0] flex flex-col gap-1.5 mt-1">
                <div><span className="text-[#E8B84B]">Saves: </span>{cls.saving_throw_proficiencies.map(s => s.toUpperCase()).join(', ')}</div>
                <div>
                  <span className="text-[#E8B84B]">Skills: </span>
                  Choose {cls.skill_choices.count} from {cls.skill_choices.options === 'any' ? 'any' : skillCount}
                  {cls.skill_choices.options !== 'any' && (cls.skill_choices.options as string[]).length > 4 ? '…' : ''}
                </div>
                {cls.spellcasting && (
                  <div>
                    <span className="text-[#E8B84B]">Spellcasting: </span>
                    {cls.spellcasting.type} caster, {cls.spellcasting.prepared ? 'prepared' : 'known'} spells
                  </div>
                )}
                <div><span className="text-[#E8B84B]">Subclass at: </span>level {cls.subclass_level} ({cls.subclass_name})</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
