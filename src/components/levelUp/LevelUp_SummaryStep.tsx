import type { Character } from '../../types'
import type { useLevelUp } from '../../hooks/useLevelUp'
import { STAT_LABELS, abilityModifier } from '../../utils/characterCreation'
import { STAT_KEYS } from '../../utils/characterCreation'

interface Props {
  character: Character
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_SummaryStep({ character, lu }: Props) {
  const {
    newLevel, hpGain, newMaxHp, chosenSubclass, chosenSpells, chosenCantrips, asiChoice,
    newSlots, oldSlots, needsASI, needsSubclass, gameClass,
  } = lu

  const oldStats = character.stats
  const newStats = (() => {
    if (!needsASI || !asiChoice || !oldStats) return oldStats
    const s = { ...oldStats }
    if (asiChoice.type === 'plus2') s[asiChoice.stat] = Math.min(20, s[asiChoice.stat] + 2)
    else if (asiChoice.type === 'plus1plus1') {
      s[asiChoice.stat1] = Math.min(20, s[asiChoice.stat1] + 1)
      s[asiChoice.stat2] = Math.min(20, s[asiChoice.stat2] + 1)
    }
    return s
  })()

  const newPB = Math.ceil(newLevel / 4) + 1

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#8B9BB0]">Review all changes before saving.</p>

      {/* Level + HP */}
      <Section title="Level & HP">
        <Row label="Level" before={String(character.level)} after={String(newLevel)} />
        <Row label="Max HP" before={String(character.max_hit_points)} after={String(newMaxHp)} gain={`+${hpGain}`} />
        <Row label="Proficiency Bonus" before={`+${character.proficiency_bonus ?? 2}`} after={`+${newPB}`} />
      </Section>

      {/* Subclass */}
      {needsSubclass && chosenSubclass && (
        <Section title="Subclass">
          <Row label="Subclass" before="—" after={gameClass?.subclasses.find((s) => s.id === chosenSubclass)?.name ?? chosenSubclass} />
        </Section>
      )}

      {/* Ability scores */}
      {needsASI && asiChoice && (
        <Section title="Ability Score">
          {asiChoice.type === 'feat' ? (
            <Row label="Feat" before="—" after={asiChoice.feat} />
          ) : (
            STAT_KEYS
              .filter((stat) => {
                if (asiChoice.type === 'plus2') return asiChoice.stat === stat
                return asiChoice.stat1 === stat || asiChoice.stat2 === stat
              })
              .map((stat) => {
                const before = oldStats?.[stat] ?? 10
                const after = newStats?.[stat] ?? before
                return (
                  <Row key={stat}
                    label={STAT_LABELS[stat]}
                    before={`${before} (${abilityModifier(before) >= 0 ? '+' : ''}${abilityModifier(before)})`}
                    after={`${after} (${abilityModifier(after) >= 0 ? '+' : ''}${abilityModifier(after)})`}
                    gain={`+${after - before}`}
                  />
                )
              })
          )}
        </Section>
      )}

      {/* Spell slots */}
      {Object.keys(newSlots).length > 0 && (
        <Section title="Spell Slots">
          {Object.keys(newSlots).sort().map((lvl) => {
            const before = oldSlots[lvl]?.total ?? 0
            const after = newSlots[lvl]?.total ?? 0
            return (
              <Row key={lvl}
                label={`Level ${lvl}`}
                before={before ? String(before) : '—'}
                after={String(after)}
                gain={after > before ? `+${after - before}` : undefined}
              />
            )
          })}
        </Section>
      )}

      {/* New spells */}
      {(chosenSpells.length > 0 || chosenCantrips.length > 0) && (
        <Section title="New Spells">
          {chosenCantrips.map((s) => (
            <Row key={s.id} label="Cantrip" before="—" after={s.name} />
          ))}
          {chosenSpells.map((s) => (
            <Row key={s.id} label={`Level ${s.level} spell`} before="—" after={s.name} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#161B24] rounded-xl border border-[#2A3347] overflow-hidden">
      <div className="px-4 py-2 bg-[#1E2535] text-xs font-semibold text-[#8B9BB0]">{title}</div>
      <div className="px-4 py-2 flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, before, after, gain }: { label: string; before: string; after: string; gain?: string }) {
  const changed = before !== after
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      <span className="text-[#8B9BB0] flex-1">{label}</span>
      <span className="text-[#4A5568]">{before}</span>
      <span className="text-[#4A5568]">→</span>
      <span className={changed ? 'text-[#52B788] font-semibold' : 'text-[#F0EBE1]'}>{after}</span>
      {gain && <span className="text-xs text-[#52B788]">({gain})</span>}
    </div>
  )
}
