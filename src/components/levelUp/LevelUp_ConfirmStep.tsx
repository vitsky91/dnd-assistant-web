import type { Character } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  character: Character
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_ConfirmStep({ character, lu }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#161B24] rounded-xl border border-[#2A3347] p-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#8B9BB0]">Current</span>
            <span className="text-5xl font-bold text-[#8B9BB0]">{character.level}</span>
          </div>
          <span className="text-2xl text-[#C9963A]">→</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#C9963A]">New Level</span>
            <span className="text-5xl font-bold text-[#C9963A]">{lu.newLevel}</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-[#F0EBE1]">
          {character.name} • {character.class}
        </p>
      </div>

      <div className="bg-[#161B24] rounded-xl border border-[#2A3347] p-4 flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-[#8B9BB0] mb-1">What's changing</h4>
        <Row label="Hit Points" value={`+${lu.hpGain} (final at next step)`} />
        <Row label="Proficiency Bonus" value={`+${Math.ceil(lu.newLevel / 4) + 1}`} />
        {lu.needsSubclass && <Row label="Subclass" value="Choose at next steps" highlight />}
        {Object.keys(lu.newSlots).length > 0 && (
          <Row label="Spell Slots" value="Updated (see Spell Slots step)" />
        )}
        {lu.needsSpells && <Row label="New Spells" value={`+${lu.newSpellCount} known spell(s)`} />}
        {lu.needsCantrips && <Row label="New Cantrip" value={`+${lu.newCantripCount} cantrip(s)`} />}
        {lu.needsASI && <Row label="Ability Score Improvement" value="Choose at next steps" highlight />}
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#8B9BB0]">{label}</span>
      <span className={highlight ? 'text-[#C9963A] font-semibold' : 'text-[#F0EBE1]'}>{value}</span>
    </div>
  )
}
