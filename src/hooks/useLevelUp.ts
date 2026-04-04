import { useState, useCallback, useEffect } from 'react'
import type { Character, GameClass, Spell, ASIChoice, StatKey } from '../types'
import { gameDataApi } from '../api/gameDataApi'
import { charactersApi } from '../api/charactersApi'
import {
  getSpellSlots, newSpellsAtLevel, newCantripsAtLevel, asiLevels, maxSpellLevel,
} from '../utils/spellSlotProgression'
import { abilityModifier } from '../utils/characterCreation'

// ── Step IDs ──────────────────────────────────────────────────────────────────

export type LevelUpStepId =
  | 'confirm'
  | 'hit_points'
  | 'features'
  | 'subclass'
  | 'spell_slots'
  | 'spells'
  | 'cantrips'
  | 'asi'
  | 'summary'

export interface LevelUpStep {
  id: LevelUpStepId
  title: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLevelUp(character: Character) {
  const newLevel = character.level + 1
  const classId = character.class.toLowerCase()

  // ── Class data ──
  const [gameClass, setGameClass] = useState<GameClass | null>(null)

  // ── Spell data ──
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([])
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([])
  const [spellsLoading, setSpellsLoading] = useState(false)

  // ── Wizard state ──
  const [hpRoll, setHpRoll] = useState<number | null>(null)
  const [hpChoice, setHpChoice] = useState<'roll' | 'average'>('average')
  const [chosenSubclass, setChosenSubclass] = useState<string | null>(character.subclass ?? null)
  const [chosenSpells, setChosenSpells] = useState<Spell[]>([])
  const [chosenCantrips, setChosenCantrips] = useState<Spell[]>([])
  const [asiChoice, setAsiChoice] = useState<ASIChoice | null>(null)

  const [stepIndex, setStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Load class data ──
  useEffect(() => {
    gameDataApi.classes(character.ruleset)
      .then((res) => {
        const cls = res.data.find((c) => c.id === classId) ?? null
        setGameClass(cls)
        if (cls?.spellcasting) {
          loadSpells(cls.spellcasting.spell_list)
        }
      })
      .catch(console.error)
  }, [classId, character.ruleset])

  function loadSpells(spellList: string) {
    setSpellsLoading(true)
    const maxLvl = maxSpellLevel(classId, newLevel)
    const fetches: Promise<{ data: Spell[] }>[] = [
      gameDataApi.spells({ class: spellList, level: 0, ruleset: character.ruleset }),
    ]
    for (let lvl = 1; lvl <= maxLvl; lvl++) {
      fetches.push(gameDataApi.spells({ class: spellList, level: lvl, ruleset: character.ruleset }))
    }
    Promise.all(fetches)
      .then(([cantripsRes, ...spellsRes]) => {
        setAvailableCantrips(cantripsRes.data)
        setAvailableSpells(spellsRes.flatMap((r) => r.data))
      })
      .catch(console.error)
      .finally(() => setSpellsLoading(false))
  }

  // ── Derived computed ──────────────────────────────────────────────────────

  const needsSubclass =
    gameClass !== null &&
    gameClass.subclass_level === newLevel &&
    !character.subclass

  const needsSpells =
    gameClass?.spellcasting != null &&
    newSpellsAtLevel(classId, newLevel) > 0 &&
    !gameClass.spellcasting.prepared // prepared casters don't pick

  const needsCantrips =
    gameClass?.spellcasting != null &&
    newCantripsAtLevel(classId, newLevel) > 0

  const needsASI = asiLevels(classId).includes(newLevel)

  const activeSteps: LevelUpStep[] = [
    { id: 'confirm', title: 'Level Up' },
    { id: 'hit_points', title: 'Hit Points' },
    { id: 'features', title: 'Class Features' },
    ...(needsSubclass ? [{ id: 'subclass' as const, title: 'Subclass' }] : []),
    { id: 'spell_slots', title: 'Spell Slots' },
    ...(needsSpells ? [{ id: 'spells' as const, title: 'New Spells' }] : []),
    ...(needsCantrips ? [{ id: 'cantrips' as const, title: 'New Cantrip' }] : []),
    ...(needsASI ? [{ id: 'asi' as const, title: 'Ability Score' }] : []),
    { id: 'summary', title: 'Summary' },
  ]

  const currentStep = activeSteps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === activeSteps.length - 1

  // ── HP calculation ────────────────────────────────────────────────────────

  const hitDieFaces = parseInt((gameClass?.hit_die ?? 'd8').replace('d', ''), 10) || 8

  const conMod = abilityModifier(character.stats?.con ?? 10)
  const averageRoll = Math.floor(hitDieFaces / 2) + 1
  const hpGain = Math.max(1, (hpChoice === 'average' ? averageRoll : (hpRoll ?? averageRoll)) + conMod)
  const newMaxHp = character.max_hit_points + hpGain

  // ── Slot diff ─────────────────────────────────────────────────────────────

  const oldSlots = getSpellSlots(classId, character.level)
  const newSlots = getSpellSlots(classId, newLevel)

  // ── Step validation ───────────────────────────────────────────────────────

  function isStepValid(): boolean {
    const step = currentStep?.id
    if (!step) return false
    if (step === 'subclass') return !!chosenSubclass
    if (step === 'spells') return chosenSpells.length === newSpellsAtLevel(classId, newLevel)
    if (step === 'cantrips') return chosenCantrips.length === newCantripsAtLevel(classId, newLevel)
    if (step === 'asi') return !!asiChoice
    return true
  }

  function goNext() { if (stepIndex < activeSteps.length - 1) setStepIndex((i) => i + 1) }
  function goBack() { if (stepIndex > 0) setStepIndex((i) => i - 1) }

  // ── Roll HP ───────────────────────────────────────────────────────────────

  function rollHP() {
    const roll = Math.floor(Math.random() * hitDieFaces) + 1
    setHpRoll(roll)
    setHpChoice('roll')
  }

  function takeAverage() {
    setHpChoice('average')
    setHpRoll(null)
  }

  // ── Build PATCH payload ───────────────────────────────────────────────────

  function buildPatchPayload() {
    const patch: Record<string, unknown> = {
      level: newLevel,
      max_hit_points: newMaxHp,
      hit_points: newMaxHp, // full heal on level up
      proficiency_bonus: Math.ceil(newLevel / 4) + 1,
    }

    if (Object.keys(newSlots).length > 0) {
      patch.spell_slots = newSlots
    }

    if (needsSubclass && chosenSubclass) {
      patch.subclass = chosenSubclass
    }

    if (needsASI && asiChoice) {
      const stats = { ...(character.stats ?? {}) }
      if (asiChoice.type === 'plus2') {
        stats[asiChoice.stat] = Math.min(20, (stats[asiChoice.stat] ?? 10) + 2)
      } else if (asiChoice.type === 'plus1plus1') {
        stats[asiChoice.stat1] = Math.min(20, (stats[asiChoice.stat1] ?? 10) + 1)
        stats[asiChoice.stat2] = Math.min(20, (stats[asiChoice.stat2] ?? 10) + 1)
      }
      patch.stats = stats
    }

    return patch
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const patch = buildPatchPayload()
      await charactersApi.update(character.id, patch as Parameters<typeof charactersApi.update>[1])

      const spellIds = [
        ...chosenCantrips.map((s) => s.id),
        ...chosenSpells.map((s) => s.id),
      ]
      if (spellIds.length > 0) {
        await gameDataApi.addSpellsBatch(character.id, spellIds)
      }

      return true
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [character, chosenSpells, chosenCantrips, asiChoice, chosenSubclass, hpGain, newMaxHp, newSlots, needsSubclass, needsASI])

  return {
    // Derived
    newLevel,
    gameClass,
    hitDieFaces,
    conMod,
    averageRoll,
    hpGain,
    newMaxHp,
    oldSlots,
    newSlots,
    needsSubclass,
    needsSpells,
    needsCantrips,
    needsASI,
    newSpellCount: newSpellsAtLevel(classId, newLevel),
    newCantripCount: newCantripsAtLevel(classId, newLevel),
    maxSpellLvl: maxSpellLevel(classId, newLevel),
    availableSpells,
    availableCantrips,
    spellsLoading,
    // State
    hpRoll,
    hpChoice,
    chosenSubclass, setChosenSubclass,
    chosenSpells, setChosenSpells,
    chosenCantrips, setChosenCantrips,
    asiChoice, setAsiChoice,
    // Navigation
    activeSteps,
    stepIndex,
    currentStep,
    isFirst,
    isLast,
    isStepValid,
    goNext,
    goBack,
    rollHP,
    takeAverage,
    // Submit
    submitting,
    submitError,
    handleSubmit,
    buildPatchPayload,
  }
}
