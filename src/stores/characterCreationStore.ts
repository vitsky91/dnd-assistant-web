import { create } from 'zustand'
import type { Race, Subrace, GameClass, Subclass, Background, Spell, AbilityScores, AbilityScoreMethod } from '../types'
import { STANDARD_ARRAY, STAT_KEYS, applyRacialBonuses, buildSavingThrows } from '../utils/characterCreation'
import { getSpellSlots } from '../utils/spellSlotProgression'

export interface CharacterCreationState {
  // ── Step 0
  ruleset: '2014' | '2024'

  // ── Step 1
  race: Race | null
  subrace: Subrace | null

  // ── Step 2
  gameClass: GameClass | null

  // ── Conditional: Subclass (step 2b)
  subclass: Subclass | null

  // ── Step 3
  background: Background | null

  // ── Step 4
  abilityMethod: AbilityScoreMethod
  // Raw scores before racial bonuses
  baseScores: AbilityScores
  // For Standard Array: which slot is assigned to which stat
  arrayAssignment: Record<string, string | null>  // stat → array value index

  // ── Step 5
  classSkills: string[]  // chosen class skill proficiencies

  // ── Conditional: Starting Spells
  chosenCantrips: Spell[]
  chosenSpells: Spell[]

  // ── Step 6
  name: string
  alignment: string
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string

  // ── Actions
  setRuleset: (r: '2014' | '2024') => void
  setRace: (race: Race | null, subrace: Subrace | null) => void
  setClass: (cls: GameClass | null) => void
  setSubclass: (sc: Subclass | null) => void
  setBackground: (bg: Background | null) => void
  setAbilityMethod: (m: AbilityScoreMethod) => void
  setBaseScores: (scores: AbilityScores) => void
  setArrayAssignment: (assignment: Record<string, string | null>) => void
  setClassSkills: (skills: string[]) => void
  setChosenCantrips: (spells: Spell[]) => void
  setChosenSpells: (spells: Spell[]) => void
  setDetails: (details: Partial<Pick<CharacterCreationState, 'name' | 'alignment' | 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'>>) => void
  reset: () => void

  // ── Derived helpers
  getFinalScores: () => AbilityScores
}

const defaultScores: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
const defaultArrayAssignment: Record<string, string | null> = {
  str: null, dex: null, con: null, int: null, wis: null, cha: null,
}

const initialState = {
  ruleset: '2014' as const,
  race: null,
  subrace: null,
  gameClass: null,
  subclass: null,
  background: null,
  abilityMethod: 'standard_array' as AbilityScoreMethod,
  baseScores: defaultScores,
  arrayAssignment: defaultArrayAssignment,
  classSkills: [] as string[],
  chosenCantrips: [] as Spell[],
  chosenSpells: [] as Spell[],
  name: '',
  alignment: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
}

export const useCharacterCreationStore = create<CharacterCreationState>((set, get) => ({
  ...initialState,

  setRuleset: (r) => set({ ruleset: r, race: null, subrace: null, gameClass: null, subclass: null, background: null }),

  setRace: (race, subrace) => set({ race, subrace }),

  setClass: (cls) => set({ gameClass: cls, subclass: null, classSkills: [], chosenCantrips: [], chosenSpells: [] }),

  setSubclass: (sc) => set({ subclass: sc }),

  setBackground: (bg) => set({ background: bg }),

  setAbilityMethod: (m) => set({
    abilityMethod: m,
    baseScores: defaultScores,
    arrayAssignment: defaultArrayAssignment,
  }),

  setBaseScores: (scores) => set({ baseScores: scores }),

  setArrayAssignment: (assignment) => {
    // Build baseScores from assignment
    const scores = { ...defaultScores }
    for (const stat of STAT_KEYS) {
      const val = assignment[stat]
      if (val !== null && val !== undefined) {
        scores[stat] = parseInt(val, 10) || 10
      }
    }
    set({ arrayAssignment: assignment, baseScores: scores })
  },

  setClassSkills: (skills) => set({ classSkills: skills }),

  setChosenCantrips: (spells) => set({ chosenCantrips: spells }),

  setChosenSpells: (spells) => set({ chosenSpells: spells }),

  setDetails: (details) => set(details),

  reset: () => set(initialState),

  getFinalScores: () => {
    const { race, subrace, baseScores, abilityMethod, arrayAssignment } = get()
    let scores = { ...baseScores }

    if (abilityMethod === 'standard_array') {
      // Rebuild from assignment
      const s = { ...defaultScores }
      for (const stat of STAT_KEYS) {
        const val = arrayAssignment[stat]
        if (val !== null && val !== undefined) s[stat] = parseInt(val, 10) || 10
      }
      scores = s
    }

    if (race) return applyRacialBonuses(scores, race, subrace)
    return scores
  },
}))

// ── Build final payload from store state ────────────────────────────────────

export function buildCharacterPayload(state: CharacterCreationState) {
  const finalScores = state.getFinalScores()
  const cls = state.gameClass!
  const bg = state.background

  const conMod = Math.floor((finalScores.con - 10) / 2)
  const dexMod = Math.floor((finalScores.dex - 10) / 2)
  const hitDieFaces = parseInt(cls.hit_die.replace('d', ''), 10) || 8
  const maxHp = hitDieFaces + conMod

  const savingThrows = buildSavingThrows(cls)
  const allSkills: Record<string, boolean> = {}
  if (bg) for (const s of bg.skill_proficiencies) allSkills[s] = true
  for (const s of state.classSkills) allSkills[s] = true

  const spellSlots = getSpellSlots(cls.id, 1)

  const standardArrayValues = STANDARD_ARRAY.map(String)
  const unusedStandardArray = standardArrayValues.filter(
    (v) => !Object.values(state.arrayAssignment).includes(v)
  )
  void unusedStandardArray

  return {
    name: state.name.trim(),
    ruleset: state.ruleset,
    race: state.race?.id ?? '',
    subrace: state.subrace?.id ?? null,
    class: cls.id,
    subclass: state.subclass?.id ?? null,
    level: 1,
    background: bg?.id ?? null,
    alignment: state.alignment || null,
    hit_points: Math.max(1, maxHp),
    max_hit_points: Math.max(1, maxHp),
    armor_class: 10 + dexMod,
    speed: state.race?.speed ?? 30,
    proficiency_bonus: 2,
    stats: finalScores,
    skill_proficiencies: allSkills,
    saving_throw_proficiencies: savingThrows,
    spell_slots: spellSlots,
    spellcasting_ability: cls.spellcasting?.ability ?? null,
    languages: state.race?.languages ?? [],
    tool_proficiencies: bg?.tool_proficiencies ?? [],
    personality_traits: state.personalityTraits || null,
    ideals: state.ideals || null,
    bonds: state.bonds || null,
    flaws: state.flaws || null,
  }
}
