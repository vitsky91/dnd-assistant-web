import type { AbilityScores, Race, Subrace, GameClass, Background, StatKey } from '../types'

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Point buy cost table: score → cost
export const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}
export const POINT_BUY_BUDGET = 27

export const STAT_KEYS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const STAT_LABELS: Record<StatKey, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
}

export const STAT_FULL_LABELS: Record<StatKey, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
}

export const ALL_SKILLS: { id: string; label: string; stat: StatKey }[] = [
  { id: 'acrobatics',      label: 'Acrobatics',       stat: 'dex' },
  { id: 'animal_handling', label: 'Animal Handling',  stat: 'wis' },
  { id: 'arcana',          label: 'Arcana',            stat: 'int' },
  { id: 'athletics',       label: 'Athletics',         stat: 'str' },
  { id: 'deception',       label: 'Deception',         stat: 'cha' },
  { id: 'history',         label: 'History',           stat: 'int' },
  { id: 'insight',         label: 'Insight',           stat: 'wis' },
  { id: 'intimidation',    label: 'Intimidation',      stat: 'cha' },
  { id: 'investigation',   label: 'Investigation',     stat: 'int' },
  { id: 'medicine',        label: 'Medicine',          stat: 'wis' },
  { id: 'nature',          label: 'Nature',            stat: 'int' },
  { id: 'perception',      label: 'Perception',        stat: 'wis' },
  { id: 'performance',     label: 'Performance',       stat: 'cha' },
  { id: 'persuasion',      label: 'Persuasion',        stat: 'cha' },
  { id: 'religion',        label: 'Religion',          stat: 'int' },
  { id: 'sleight_of_hand', label: 'Sleight of Hand',  stat: 'dex' },
  { id: 'stealth',         label: 'Stealth',           stat: 'dex' },
  { id: 'survival',        label: 'Survival',          stat: 'wis' },
]

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
]

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

export function calcMaxHP(hitDie: string, level: number, conMod: number): number {
  const faces = parseInt(hitDie.replace('d', ''), 10) || 8
  // Level 1: max die value. Level 2+: (faces/2 + 1) per level
  const base = faces + conMod
  const rest = level > 1 ? (Math.floor(faces / 2) + 1 + conMod) * (level - 1) : 0
  return Math.max(1, base + rest)
}

export function calcAC(dexMod: number): number {
  return 10 + dexMod
}

export function applyRacialBonuses(base: AbilityScores, race: Race, subrace: Subrace | null): AbilityScores {
  const bonuses = { ...race.stat_bonuses, ...(subrace?.stat_bonuses ?? {}) }
  return {
    str: base.str + (bonuses['str'] ?? 0),
    dex: base.dex + (bonuses['dex'] ?? 0),
    con: base.con + (bonuses['con'] ?? 0),
    int: base.int + (bonuses['int'] ?? 0),
    wis: base.wis + (bonuses['wis'] ?? 0),
    cha: base.cha + (bonuses['cha'] ?? 0),
  }
}

export function pointBuySpent(scores: AbilityScores): number {
  return STAT_KEYS.reduce((total, k) => total + (POINT_BUY_COST[scores[k]] ?? 0), 0)
}

export function buildSavingThrows(cls: GameClass): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const st of cls.saving_throw_proficiencies) result[st] = true
  return result
}

export function mergeSkills(classSkills: string[], backgroundSkills: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const s of backgroundSkills) result[s] = true
  for (const s of classSkills) result[s] = true
  return result
}

export function availableClassSkills(cls: GameClass): string[] {
  if (cls.skill_choices.options === 'any') return ALL_SKILLS.map((s) => s.id)
  return cls.skill_choices.options as string[]
}

export function backgroundLanguages(bg: Background): string[] {
  // Backend stores languages as a count; wizard will note the count as placeholder
  const count = bg.languages ?? 0
  return count > 0 ? Array.from({ length: count }, (_, i) => `Language ${i + 1}`) : []
}
