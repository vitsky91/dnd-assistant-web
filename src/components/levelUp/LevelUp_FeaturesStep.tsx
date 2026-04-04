import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  lu: ReturnType<typeof useLevelUp>
}

// Minimal hardcoded feature highlights for common levels
// (backend returns features_by_level: null, so we show generic info)
const GENERIC_FEATURES: Record<string, Record<number, string[]>> = {
  barbarian: { 5: ['Extra Attack', 'Fast Movement'], 7: ['Feral Instinct'], 9: ['Brutal Critical (1 die)'] },
  bard:      { 5: ['Font of Inspiration'], 6: ['Countercharm'], 10: ['Magical Secrets'] },
  cleric:    { 5: ['Destroy Undead'], 10: ['Divine Intervention'] },
  druid:     { 5: ['Wild Shape improvement'], 10: ['Timeless Body', 'Beast Spells'] },
  fighter:   { 5: ['Extra Attack'], 6: ['Extra Attack (2)'], 11: ['Extra Attack (3)'] },
  monk:      { 5: ['Stunning Strike', 'Extra Attack'], 7: ['Evasion', 'Stillness of Mind'] },
  paladin:   { 5: ['Extra Attack'], 7: ['Aura of Protection', 'Sacred Weapon'] },
  ranger:    { 5: ['Extra Attack'], 8: ['Land\'s Stride'] },
  rogue:     { 5: ['Uncanny Dodge'], 7: ['Evasion'], 10: ['Ability Score Improvement'] },
  sorcerer:  { 6: ['Metamagic (additional option)'] },
  warlock:   { 5: ['Third Mystic Arcanum'] },
  wizard:    { 5: ['Spell Mastery (high level)'], 10: ['Spell Mastery'] },
}

export function LevelUp_FeaturesStep({ lu }: Props) {
  const { gameClass, newLevel } = lu
  const classId = gameClass?.id ?? ''
  const features = GENERIC_FEATURES[classId]?.[newLevel] ?? []

  if (features.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#8B9BB0]">
          Class features for {gameClass?.name ?? 'your class'} at level {newLevel}.
        </p>
        <div className="bg-[#161B24] rounded-xl border border-[#2A3347] p-5 flex flex-col items-center gap-2">
          <span className="text-2xl">📜</span>
          <p className="text-sm text-[#8B9BB0] text-center">
            No highlighted features at this level.<br />
            Check your class description for details.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#8B9BB0]">
        New features unlocked at {gameClass?.name ?? ''} level {newLevel}:
      </p>
      <div className="flex flex-col gap-2">
        {features.map((feat) => (
          <div key={feat} className="bg-[#161B24] rounded-xl border border-[#2A3347] px-4 py-3 flex items-center gap-3">
            <span className="text-[#E8B84B] text-lg">✦</span>
            <span className="text-sm font-semibold text-[#F0EBE1]">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
