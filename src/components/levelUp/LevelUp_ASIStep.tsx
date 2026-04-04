import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { STAT_KEYS, STAT_LABELS, STAT_FULL_LABELS } from '../../utils/characterCreation'
import type { Character, ASIChoice, StatKey } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'

// Basic feat list for ASI/Feat option
const BASIC_FEATS = [
  'Alert', 'Athlete', 'Actor', 'Charger', 'Crossbow Expert',
  'Defensive Duelist', 'Dual Wielder', 'Dungeon Delver', 'Durable',
  'Elemental Adept', 'Great Weapon Master', 'Healer',
  'Heavy Armor Master', 'Inspiring Leader', 'Keen Mind',
  'Lightly Armored', 'Lucky', 'Mage Slayer', 'Magic Initiate',
  'Martial Adept', 'Mobile', 'Moderately Armored',
  'Mounted Combatant', 'Observant', 'Polearm Master', 'Resilient',
  'Ritual Caster', 'Savage Attacker', 'Sentinel', 'Sharpshooter',
  'Shield Master', 'Skilled', 'Skulker', 'Spell Sniper',
  'Tough', 'War Caster', 'Weapon Master',
]

type ASIMode = 'plus2' | 'plus1plus1' | 'feat'

interface Props {
  character: Character
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_ASIStep({ character, lu }: Props) {
  const { asiChoice, setAsiChoice } = lu
  const mode: ASIMode = asiChoice?.type ?? 'plus2'
  const stats = character.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

  function setMode(m: ASIMode) {
    if (m === 'plus2') setAsiChoice({ type: 'plus2', stat: 'str' })
    else if (m === 'plus1plus1') setAsiChoice({ type: 'plus1plus1', stat1: 'str', stat2: 'dex' })
    else setAsiChoice({ type: 'feat', feat: BASIC_FEATS[0] })
  }

  const MODES: { id: ASIMode; label: string }[] = [
    { id: 'plus2',      label: '+2 to one stat' },
    { id: 'plus1plus1', label: '+1 to two stats' },
    { id: 'feat',       label: 'Take a Feat' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#8B9BB0]">Choose an Ability Score Improvement or a Feat.</p>

      {/* Mode selector */}
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              mode === m.id
                ? 'border-[#C9963A] bg-[#C9963A]/10 text-[#C9963A]'
                : 'border-[#2A3347] text-[#8B9BB0] hover:border-[#3A4357]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* +2 to one */}
      {mode === 'plus2' && asiChoice?.type === 'plus2' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B9BB0]">Choose which stat gains +2 (max 20).</p>
          {STAT_KEYS.map((stat) => {
            const current = stats[stat] ?? 10
            const capped = current >= 20
            const isSelected = asiChoice.stat === stat
            return (
              <button
                key={stat}
                disabled={capped}
                onClick={() => setAsiChoice({ type: 'plus2', stat })}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                  isSelected ? 'border-[#C9963A] bg-[#C9963A]/10' :
                  capped ? 'border-[#1A2030] opacity-30 cursor-not-allowed' :
                  'border-[#2A3347] bg-[#161B24] hover:border-[#3A4357]'
                }`}
              >
                <span className="w-10 text-xs font-semibold text-[#8B9BB0]">{STAT_LABELS[stat]}</span>
                <span className={`flex-1 text-sm ${isSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                  {STAT_FULL_LABELS[stat]}
                </span>
                <span className="text-sm font-bold text-[#8B9BB0]">{current}</span>
                <span className="text-sm font-bold text-[#52B788]">→ {Math.min(20, current + 2)}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* +1+1 */}
      {mode === 'plus1plus1' && asiChoice?.type === 'plus1plus1' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B9BB0]">Choose two different stats to each gain +1 (max 20).</p>
          {STAT_KEYS.map((stat) => {
            const current = stats[stat] ?? 10
            const capped = current >= 20
            const isStat1 = asiChoice.stat1 === stat
            const isStat2 = asiChoice.stat2 === stat
            const isSelected = isStat1 || isStat2

            function toggle() {
              if (!asiChoice || asiChoice.type !== 'plus1plus1') return
              if (isStat1) {
                // deselect stat1 → set stat1 to stat2, stat2 to something else
                const next = STAT_KEYS.find((k) => k !== stat && k !== asiChoice.stat2)
                setAsiChoice({ type: 'plus1plus1', stat1: asiChoice.stat2, stat2: next ?? 'con' })
              } else if (isStat2) {
                const next = STAT_KEYS.find((k) => k !== stat && k !== asiChoice.stat1)
                setAsiChoice({ type: 'plus1plus1', stat1: asiChoice.stat1, stat2: next ?? 'int' })
              } else if (!isStat1) {
                setAsiChoice({ type: 'plus1plus1', stat1: stat, stat2: asiChoice.stat2 })
              }
            }

            return (
              <button
                key={stat}
                disabled={capped && !isSelected}
                onClick={toggle}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                  isStat1 ? 'border-[#C9963A] bg-[#C9963A]/10' :
                  isStat2 ? 'border-[#52B788] bg-[#52B788]/10' :
                  capped ? 'border-[#1A2030] opacity-30 cursor-not-allowed' :
                  'border-[#2A3347] bg-[#161B24] hover:border-[#3A4357]'
                }`}
              >
                <span className="w-10 text-xs font-semibold text-[#8B9BB0]">{STAT_LABELS[stat]}</span>
                <span className={`flex-1 text-sm ${isSelected ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'}`}>
                  {STAT_FULL_LABELS[stat]}
                </span>
                <span className="text-sm font-bold text-[#8B9BB0]">{current}</span>
                {isSelected && <span className="text-sm font-bold text-[#52B788]">→ {Math.min(20, current + 1)}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Feat */}
      {mode === 'feat' && asiChoice?.type === 'feat' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B9BB0]">Select a feat.</p>
          <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
            {BASIC_FEATS.map((feat) => {
              const isSelected = asiChoice.feat === feat
              return (
                <button
                  key={feat}
                  onClick={() => setAsiChoice({ type: 'feat', feat })}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'border-[#C9963A] bg-[#C9963A]/10 text-[#C9963A]'
                      : 'border-[#2A3347] text-[#8B9BB0] hover:border-[#3A4357]'
                  }`}
                >
                  {feat}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
