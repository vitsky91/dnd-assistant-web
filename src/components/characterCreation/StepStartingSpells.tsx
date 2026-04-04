import { useEffect, useState } from 'react'
import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { gameDataApi } from '../../api/gameDataApi'
import { Spinner } from '../shared/Spinner'
import type { Spell } from '../../types'

const CANTRIP_COUNT: Record<string, number> = {
  bard: 2, cleric: 3, druid: 2, sorcerer: 4, warlock: 2, wizard: 3,
}
const SPELL_COUNT: Record<string, number> = {
  bard: 4, cleric: 2, druid: 2, sorcerer: 2, warlock: 2, wizard: 6,
}

export function StepStartingSpells() {
  const { gameClass, ruleset, chosenCantrips, setChosenCantrips, chosenSpells, setChosenSpells } =
    useCharacterCreationStore()

  const [cantrips, setCantrips] = useState<Spell[]>([])
  const [spells, setSpells] = useState<Spell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const spellList = gameClass?.spellcasting?.spell_list ?? ''
  const maxCantrips = CANTRIP_COUNT[gameClass?.id ?? ''] ?? 2
  const maxSpells = SPELL_COUNT[gameClass?.id ?? ''] ?? 2

  useEffect(() => {
    if (!spellList) return
    setLoading(true)
    setError(null)
    Promise.all([
      gameDataApi.spells({ class: spellList, level: 0, ruleset }),
      gameDataApi.spells({ class: spellList, level: 1, ruleset }),
    ])
      .then(([c, s]) => {
        setCantrips(c.data)
        setSpells(s.data)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load spells'))
      .finally(() => setLoading(false))
  }, [spellList, ruleset])

  if (loading) return <div className="flex justify-center py-8"><Spinner size={28} /></div>
  if (error) return <p className="text-sm text-[#FF6B6B]">{error}</p>

  function toggleCantrip(spell: Spell) {
    if (chosenCantrips.find((s) => s.id === spell.id)) {
      setChosenCantrips(chosenCantrips.filter((s) => s.id !== spell.id))
    } else if (chosenCantrips.length < maxCantrips) {
      setChosenCantrips([...chosenCantrips, spell])
    }
  }

  function toggleSpell(spell: Spell) {
    if (chosenSpells.find((s) => s.id === spell.id)) {
      setChosenSpells(chosenSpells.filter((s) => s.id !== spell.id))
    } else if (chosenSpells.length < maxSpells) {
      setChosenSpells([...chosenSpells, spell])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {cantrips.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#F0EBE1]">Cantrips</h4>
            <span className={`text-xs font-semibold ${chosenCantrips.length === maxCantrips ? 'text-[#52B788]' : 'text-[#8B9BB0]'}`}>
              {chosenCantrips.length}/{maxCantrips}
            </span>
          </div>
          <SpellList
            spells={cantrips}
            chosen={chosenCantrips}
            max={maxCantrips}
            onToggle={toggleCantrip}
          />
        </section>
      )}

      {spells.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#F0EBE1]">1st Level Spells</h4>
            <span className={`text-xs font-semibold ${chosenSpells.length === maxSpells ? 'text-[#52B788]' : 'text-[#8B9BB0]'}`}>
              {chosenSpells.length}/{maxSpells}
            </span>
          </div>
          <SpellList
            spells={spells}
            chosen={chosenSpells}
            max={maxSpells}
            onToggle={toggleSpell}
          />
        </section>
      )}
    </div>
  )
}

function SpellList({ spells, chosen, max, onToggle }: {
  spells: Spell[]
  chosen: Spell[]
  max: number
  onToggle: (s: Spell) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const chosenIds = new Set(chosen.map((s) => s.id))

  return (
    <div className="flex flex-col gap-1">
      {spells.map((spell) => {
        const isChosen = chosenIds.has(spell.id)
        const canChoose = isChosen || chosen.length < max
        const isExpanded = expanded === spell.id

        return (
          <div key={spell.id}
            className={`rounded-lg border transition-colors ${
              isChosen ? 'border-[#C9963A]' : 'border-[#2A3347]'
            } bg-[#161B24]`}
          >
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 text-left ${!canChoose ? 'opacity-40' : ''}`}
              onClick={() => {
                onToggle(spell)
                setExpanded(expanded === spell.id ? null : spell.id)
              }}
              disabled={!canChoose}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                isChosen ? 'border-[#C9963A] bg-[#C9963A]' : 'border-[#2A3347]'
              }`}>
                {isChosen && <span className="text-[9px] text-[#0D0F14] font-bold">✓</span>}
              </div>
              <span className={`flex-1 text-sm ${isChosen ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'}`}>
                {spell.name}
              </span>
              <span className="text-xs text-[#4A5568] capitalize">{spell.school}</span>
              <button
                className="text-[#8B9BB0] text-xs ml-1"
                onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : spell.id) }}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </button>
            {isExpanded && (
              <div className="px-3 pb-2 border-t border-[#2A3347] text-xs text-[#8B9BB0] flex flex-col gap-0.5">
                <div className="mt-1">{spell.casting_time} · {spell.range} · {spell.duration}</div>
                <div>{spell.components}</div>
                <p className="mt-1">{spell.description.slice(0, 200)}{spell.description.length > 200 ? '…' : ''}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
