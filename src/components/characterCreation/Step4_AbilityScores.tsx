import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import {
  STANDARD_ARRAY, STAT_KEYS, STAT_LABELS, STAT_FULL_LABELS,
  POINT_BUY_COST, POINT_BUY_BUDGET, abilityModifier, pointBuySpent,
} from '../../utils/characterCreation'
import type { AbilityScoreMethod, StatKey } from '../../types'

const METHODS: { id: AbilityScoreMethod; label: string }[] = [
  { id: 'standard_array', label: 'Standard Array' },
  { id: 'point_buy',      label: 'Point Buy' },
  { id: 'manual',         label: 'Manual' },
]

export function Step4_AbilityScores() {
  const {
    abilityMethod, setAbilityMethod,
    baseScores, setBaseScores,
    arrayAssignment, setArrayAssignment,
    race, subrace,
    getFinalScores,
  } = useCharacterCreationStore()

  const finalScores = getFinalScores()

  // ── Standard Array ────────────────────────────────────────────────────────
  function handleArraySelect(stat: StatKey, value: string) {
    const newAssignment = { ...arrayAssignment }
    // Remove this value from any other stat
    for (const k of STAT_KEYS) {
      if (newAssignment[k] === value) newAssignment[k] = null
    }
    newAssignment[stat] = value
    setArrayAssignment(newAssignment)
  }

  const usedValues = new Set(Object.values(arrayAssignment).filter(Boolean))

  // ── Point Buy ─────────────────────────────────────────────────────────────
  const spent = pointBuySpent(baseScores)
  const remaining = POINT_BUY_BUDGET - spent

  function pbAdjust(stat: StatKey, delta: number) {
    const current = baseScores[stat]
    const next = current + delta
    if (next < 8 || next > 15) return
    if (delta > 0 && remaining < (POINT_BUY_COST[next] - POINT_BUY_COST[current])) return
    setBaseScores({ ...baseScores, [stat]: next })
  }

  // ── Manual ────────────────────────────────────────────────────────────────
  function handleManual(stat: StatKey, val: string) {
    const n = parseInt(val, 10)
    if (isNaN(n)) return
    const clamped = Math.max(1, Math.min(20, n))
    setBaseScores({ ...baseScores, [stat]: clamped })
  }

  // ── Racial bonus display ──────────────────────────────────────────────────
  const racialBonuses: Record<string, number> = {}
  if (race) {
    for (const [k, v] of Object.entries(race.stat_bonuses)) racialBonuses[k] = (racialBonuses[k] ?? 0) + v
    if (subrace) {
      for (const [k, v] of Object.entries(subrace.stat_bonuses)) racialBonuses[k] = (racialBonuses[k] ?? 0) + v
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Method selector */}
      <div className="flex gap-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setAbilityMethod(m.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              abilityMethod === m.id
                ? 'border-[#C9963A] bg-[#C9963A]/10 text-[#C9963A]'
                : 'border-[#2A3347] text-[#8B9BB0] hover:border-[#3A4357]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Standard Array */}
      {abilityMethod === 'standard_array' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B9BB0]">Assign values [15, 14, 13, 12, 10, 8] to each ability.</p>
          {STAT_KEYS.map((stat) => {
            const assigned = arrayAssignment[stat]
            return (
              <div key={stat} className="flex items-center gap-2">
                <span className="w-10 text-xs font-semibold text-[#8B9BB0]">{STAT_LABELS[stat]}</span>
                <select
                  value={assigned ?? ''}
                  onChange={(e) => handleArraySelect(stat, e.target.value)}
                  className="flex-1 bg-[#0D0F14] border border-[#2A3347] rounded-lg px-2 py-1.5 text-sm text-[#F0EBE1] focus:outline-none focus:border-[#C9963A]"
                >
                  <option value="">— pick —</option>
                  {STANDARD_ARRAY.map((v) => (
                    <option key={v} value={String(v)} disabled={usedValues.has(String(v)) && assigned !== String(v)}>
                      {v}
                    </option>
                  ))}
                </select>
                {racialBonuses[stat] ? (
                  <span className="text-xs text-[#52B788] w-12 text-right">+{racialBonuses[stat]}</span>
                ) : <span className="w-12" />}
                <span className="text-sm font-bold text-[#F0EBE1] w-8 text-right">
                  {finalScores[stat]}
                </span>
                <span className="text-xs text-[#8B9BB0] w-8 text-right">
                  ({abilityModifier(finalScores[stat]) >= 0 ? '+' : ''}{abilityModifier(finalScores[stat])})
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Point Buy */}
      {abilityMethod === 'point_buy' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8B9BB0]">Points to spend: {POINT_BUY_BUDGET}. Cost increases above 13.</p>
            <span className={`text-xs font-bold ${remaining < 0 ? 'text-[#FF6B6B]' : 'text-[#52B788]'}`}>
              {remaining} left
            </span>
          </div>
          {STAT_KEYS.map((stat) => {
            const val = baseScores[stat]
            const final = finalScores[stat]
            return (
              <div key={stat} className="flex items-center gap-2">
                <span className="w-10 text-xs font-semibold text-[#8B9BB0]">{STAT_LABELS[stat]}</span>
                <button
                  onClick={() => pbAdjust(stat, -1)}
                  disabled={val <= 8}
                  className="w-7 h-7 rounded-lg bg-[#2A3347] text-[#F0EBE1] text-sm hover:bg-[#3A4357] disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#F0EBE1]">{val}</span>
                <button
                  onClick={() => pbAdjust(stat, 1)}
                  disabled={val >= 15 || remaining < (POINT_BUY_COST[val + 1] - POINT_BUY_COST[val])}
                  className="w-7 h-7 rounded-lg bg-[#2A3347] text-[#F0EBE1] text-sm hover:bg-[#3A4357] disabled:opacity-30 transition-colors"
                >
                  +
                </button>
                {racialBonuses[stat] ? (
                  <span className="text-xs text-[#52B788] w-12 text-right">+{racialBonuses[stat]}</span>
                ) : <span className="w-12" />}
                <span className="text-sm font-bold text-[#F0EBE1] w-8 text-right">{final}</span>
                <span className="text-xs text-[#8B9BB0] w-8 text-right">
                  ({abilityModifier(final) >= 0 ? '+' : ''}{abilityModifier(final)})
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Manual */}
      {abilityMethod === 'manual' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B9BB0]">Enter scores from 1–20. Racial bonuses are added automatically.</p>
          {STAT_KEYS.map((stat) => {
            const val = baseScores[stat]
            const final = finalScores[stat]
            return (
              <div key={stat} className="flex items-center gap-2">
                <span className="w-24 text-xs font-semibold text-[#8B9BB0]">{STAT_FULL_LABELS[stat]}</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={val}
                  onChange={(e) => handleManual(stat, e.target.value)}
                  className="w-16 bg-[#0D0F14] border border-[#2A3347] rounded-lg px-2 py-1.5 text-sm text-[#F0EBE1] focus:outline-none focus:border-[#C9963A] text-center"
                />
                {racialBonuses[stat] ? (
                  <span className="text-xs text-[#52B788]">+{racialBonuses[stat]}</span>
                ) : null}
                <span className="text-sm font-bold text-[#F0EBE1]">= {final}</span>
                <span className="text-xs text-[#8B9BB0]">
                  ({abilityModifier(final) >= 0 ? '+' : ''}{abilityModifier(final)})
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
