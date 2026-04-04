import type { Character } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  character: Character
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_SpellSlotsStep({ character, lu }: Props) {
  const { oldSlots, newSlots } = lu
  const allLevels = Array.from(
    new Set([...Object.keys(oldSlots), ...Object.keys(newSlots)].map(Number))
  ).sort((a, b) => a - b)

  if (allLevels.length === 0) {
    return (
      <p className="text-sm text-[#8B9BB0]">No spell slots for {character.class}.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#8B9BB0]">Your spell slots automatically update at level {lu.newLevel}.</p>
      <div className="bg-[#161B24] rounded-xl border border-[#2A3347] overflow-hidden">
        <div className="grid grid-cols-3 text-xs text-[#8B9BB0] px-4 py-2 border-b border-[#2A3347] font-semibold">
          <span>Slot Level</span>
          <span className="text-center">Before</span>
          <span className="text-center">After</span>
        </div>
        {allLevels.map((lvl) => {
          const before = oldSlots[String(lvl)]?.total ?? 0
          const after  = newSlots[String(lvl)]?.total ?? 0
          const gained = after - before
          return (
            <div key={lvl} className="grid grid-cols-3 px-4 py-2.5 border-b border-[#2A3347] last:border-b-0 text-sm">
              <span className="text-[#8B9BB0]">Level {lvl}</span>
              <span className="text-center text-[#F0EBE1]">{before || '—'}</span>
              <span className={`text-center font-semibold ${gained > 0 ? 'text-[#52B788]' : 'text-[#F0EBE1]'}`}>
                {after || '—'}
                {gained > 0 && <span className="text-xs ml-1">(+{gained})</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
