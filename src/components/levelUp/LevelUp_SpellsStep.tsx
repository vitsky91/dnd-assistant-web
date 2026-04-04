import { useState } from 'react'
import { Spinner } from '../shared/Spinner'
import type { Spell } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  lu: ReturnType<typeof useLevelUp>
  isCantrips?: boolean
}

export function LevelUp_SpellsStep({ lu, isCantrips = false }: Props) {
  const {
    availableSpells, availableCantrips, spellsLoading,
    chosenSpells, setChosenSpells,
    chosenCantrips, setChosenCantrips,
    newSpellCount, newCantripCount,
    maxSpellLvl,
    gameClass,
  } = lu

  const spells = isCantrips ? availableCantrips : availableSpells
  const chosen = isCantrips ? chosenCantrips : chosenSpells
  const setChosen = isCantrips ? setChosenCantrips : setChosenSpells
  const maxCount = isCantrips ? newCantripCount : newSpellCount
  const [expanded, setExpanded] = useState<string | null>(null)

  if (spellsLoading) return <div className="flex justify-center py-8"><Spinner size={28} /></div>

  // Filter to max accessible spell level
  const filtered = isCantrips
    ? spells
    : spells.filter((s) => s.level <= maxSpellLvl)

  const chosenIds = new Set(chosen.map((s) => s.id))

  function toggle(spell: Spell) {
    if (chosenIds.has(spell.id)) {
      setChosen(chosen.filter((s) => s.id !== spell.id))
    } else if (chosen.length < maxCount) {
      setChosen([...chosen, spell])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8B9BB0]">
          {isCantrips
            ? `Choose ${maxCount} new cantrip${maxCount > 1 ? 's' : ''} from the ${gameClass?.spellcasting?.spell_list ?? ''} list.`
            : `Choose ${maxCount} new spell${maxCount > 1 ? 's' : ''} (up to level ${maxSpellLvl}).`}
        </p>
        <span className={`text-xs font-semibold ${chosen.length === maxCount ? 'text-[#52B788]' : 'text-[#8B9BB0]'}`}>
          {chosen.length}/{maxCount}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map((spell) => {
          const isChosen = chosenIds.has(spell.id)
          const canPick = isChosen || chosen.length < maxCount
          const isExp = expanded === spell.id

          return (
            <div key={spell.id}
              className={`rounded-lg border transition-colors ${isChosen ? 'border-[#C9963A]' : 'border-[#2A3347]'} bg-[#161B24]`}
            >
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 text-left ${!canPick ? 'opacity-40' : ''}`}
                onClick={() => toggle(spell)}
                disabled={!canPick}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  isChosen ? 'border-[#C9963A] bg-[#C9963A]' : 'border-[#2A3347]'
                }`}>
                  {isChosen && <span className="text-[9px] text-[#0D0F14] font-bold">✓</span>}
                </div>
                <span className={`flex-1 text-sm ${isChosen ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'}`}>
                  {spell.name}
                </span>
                {!isCantrips && <span className="text-xs text-[#4A5568]">Lv {spell.level}</span>}
                <span className="text-xs text-[#4A5568] ml-1 capitalize">{spell.school}</span>
                <button className="text-[#8B9BB0] text-xs ml-1" onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : spell.id) }}>
                  {isExp ? '▲' : '▼'}
                </button>
              </button>
              {isExp && (
                <div className="px-3 pb-2 border-t border-[#2A3347] text-xs text-[#8B9BB0] flex flex-col gap-0.5">
                  <div className="mt-1">{spell.casting_time} · {spell.range} · {spell.duration}</div>
                  <p className="mt-1">{spell.description.slice(0, 200)}{spell.description.length > 200 ? '…' : ''}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
