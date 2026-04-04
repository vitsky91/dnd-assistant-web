import type { Character } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  character: Character
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_HitPointsStep({ character, lu }: Props) {
  const { hitDieFaces, conMod, averageRoll, hpRoll, hpChoice, rollHP, takeAverage, hpGain, newMaxHp } = lu

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#8B9BB0]">
        Roll your {lu.gameClass?.hit_die ?? 'd8'} or take the average.
        Your CON modifier ({conMod >= 0 ? '+' : ''}{conMod}) is added automatically.
      </p>

      <div className="flex gap-3">
        <button
          onClick={rollHP}
          className={`flex-1 py-4 rounded-xl border text-sm font-semibold transition-colors ${
            hpChoice === 'roll'
              ? 'border-[#C9963A] bg-[#C9963A]/10 text-[#C9963A]'
              : 'border-[#2A3347] text-[#8B9BB0] hover:border-[#3A4357]'
          }`}
        >
          🎲 Roll d{hitDieFaces}
          {hpChoice === 'roll' && hpRoll !== null && (
            <span className="block text-3xl font-bold mt-1 text-[#C9963A]">{hpRoll}</span>
          )}
        </button>

        <button
          onClick={takeAverage}
          className={`flex-1 py-4 rounded-xl border text-sm font-semibold transition-colors ${
            hpChoice === 'average'
              ? 'border-[#52B788] bg-[#52B788]/10 text-[#52B788]'
              : 'border-[#2A3347] text-[#8B9BB0] hover:border-[#3A4357]'
          }`}
        >
          Take Average
          <span className="block text-3xl font-bold mt-1">{averageRoll}</span>
        </button>
      </div>

      {/* Result */}
      <div className="bg-[#161B24] rounded-xl border border-[#2A3347] p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#8B9BB0]">Roll</span>
          <span className="text-[#F0EBE1]">{hpChoice === 'average' ? averageRoll : (hpRoll ?? '—')}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#8B9BB0]">CON modifier</span>
          <span className="text-[#F0EBE1]">{conMod >= 0 ? '+' : ''}{conMod}</span>
        </div>
        <div className="border-t border-[#2A3347] pt-2 flex justify-between text-sm font-semibold">
          <span className="text-[#8B9BB0]">HP gained</span>
          <span className="text-[#52B788]">+{hpGain}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-[#8B9BB0]">New Max HP</span>
          <span className="text-[#F0EBE1] font-bold">
            {character.max_hit_points} → {newMaxHp}
          </span>
        </div>
      </div>
    </div>
  )
}
