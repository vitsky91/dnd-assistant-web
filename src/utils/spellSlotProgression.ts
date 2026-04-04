// Spell slot tables — mirrors TICK-011 iOS SpellSlotProgression

// Full casters: Bard, Cleric, Druid, Sorcerer, Wizard
// [level] → {slot_level: count}
const FULL_CASTER: Record<number, Record<string, number>> = {
  1:  { '1': 2 },
  2:  { '1': 3 },
  3:  { '1': 4, '2': 2 },
  4:  { '1': 4, '2': 3 },
  5:  { '1': 4, '2': 3, '3': 2 },
  6:  { '1': 4, '2': 3, '3': 3 },
  7:  { '1': 4, '2': 3, '3': 3, '4': 1 },
  8:  { '1': 4, '2': 3, '3': 3, '4': 2 },
  9:  { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
  10: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 },
  11: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1 },
  12: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1 },
  13: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1 },
  14: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1 },
  15: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1 },
  16: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1 },
  17: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1, '9': 1 },
  18: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 1, '7': 1, '8': 1, '9': 1 },
  19: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 1, '8': 1, '9': 1 },
  20: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 2, '8': 1, '9': 1 },
}

// Half casters: Paladin, Ranger (round down)
const HALF_CASTER: Record<number, Record<string, number>> = {
  1:  {},
  2:  { '1': 2 },
  3:  { '1': 3 },
  4:  { '1': 3 },
  5:  { '1': 4, '2': 2 },
  6:  { '1': 4, '2': 2 },
  7:  { '1': 4, '2': 3 },
  8:  { '1': 4, '2': 3 },
  9:  { '1': 4, '2': 3, '3': 2 },
  10: { '1': 4, '2': 3, '3': 2 },
  11: { '1': 4, '2': 3, '3': 3 },
  12: { '1': 4, '2': 3, '3': 3 },
  13: { '1': 4, '2': 3, '3': 3, '4': 1 },
  14: { '1': 4, '2': 3, '3': 3, '4': 1 },
  15: { '1': 4, '2': 3, '3': 3, '4': 2 },
  16: { '1': 4, '2': 3, '3': 3, '4': 2 },
  17: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
  18: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
  19: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 },
  20: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 },
}

// Pact magic (Warlock): short-rest slots, all same level
const PACT_CASTER: Record<number, Record<string, number>> = {
  1:  { '1': 1 },
  2:  { '1': 2 },
  3:  { '2': 2 },
  4:  { '2': 2 },
  5:  { '3': 2 },
  6:  { '3': 2 },
  7:  { '4': 2 },
  8:  { '4': 2 },
  9:  { '5': 2 },
  10: { '5': 2 },
  11: { '5': 3 },
  12: { '5': 3 },
  13: { '5': 3 },
  14: { '5': 3 },
  15: { '5': 3 },
  16: { '5': 3 },
  17: { '5': 4 },
  18: { '5': 4 },
  19: { '5': 4 },
  20: { '5': 4 },
}

// Third casters: Arcane Trickster, Eldritch Knight (not needed at creation but included for completeness)
const THIRD_CASTER: Record<number, Record<string, number>> = {
  1:  {}, 2: {}, 3: { '1': 2 }, 4: { '1': 3 }, 5: { '1': 3 },
  6:  { '1': 3 }, 7: { '1': 4, '2': 2 }, 8: { '1': 4, '2': 2 },
  9:  { '1': 4, '2': 2 }, 10: { '1': 4, '2': 3 }, 11: { '1': 4, '2': 3 },
  12: { '1': 4, '2': 3 }, 13: { '1': 4, '2': 3, '3': 2 }, 14: { '1': 4, '2': 3, '3': 2 },
  15: { '1': 4, '2': 3, '3': 2 }, 16: { '1': 4, '2': 3, '3': 3 }, 17: { '1': 4, '2': 3, '3': 3 },
  18: { '1': 4, '2': 3, '3': 3 }, 19: { '1': 4, '2': 3, '3': 3, '4': 1 }, 20: { '1': 4, '2': 3, '3': 3, '4': 1 },
}

// Map class id → caster type
const CASTER_TYPE: Record<string, 'full' | 'half' | 'pact' | 'third' | 'none'> = {
  bard:      'full',
  cleric:    'full',
  druid:     'full',
  sorcerer:  'full',
  wizard:    'full',
  paladin:   'half',
  ranger:    'half',
  warlock:   'pact',
  barbarian: 'none',
  fighter:   'none',
  monk:      'none',
  rogue:     'none',
}

export function getSpellSlots(classId: string, level: number): Record<string, { total: number; used: number }> {
  const casterType = CASTER_TYPE[classId] ?? 'none'
  const lvl = Math.max(1, Math.min(20, level))
  let raw: Record<string, number> = {}
  switch (casterType) {
    case 'full':  raw = FULL_CASTER[lvl] ?? {}; break
    case 'half':  raw = HALF_CASTER[lvl] ?? {}; break
    case 'pact':  raw = PACT_CASTER[lvl] ?? {}; break
    case 'third': raw = THIRD_CASTER[lvl] ?? {}; break
    default:      return {}
  }
  const result: Record<string, { total: number; used: number }> = {}
  for (const [slotLevel, total] of Object.entries(raw)) {
    result[slotLevel] = { total, used: 0 }
  }
  return result
}

export function isSpellcaster(classId: string): boolean {
  const ct = CASTER_TYPE[classId] ?? 'none'
  return ct !== 'none'
}

// ── New spells per level for known-spell casters ──────────────────────────

// Returns how many new spells to pick at the given level (non-cantrip)
export function newSpellsAtLevel(classId: string, level: number): number {
  if (level < 1 || level > 20) return 0
  const tables: Record<string, Record<number, number>> = {
    wizard:   { 1: 6, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2 },
    sorcerer: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 0, 13: 1, 14: 0, 15: 1, 16: 0, 17: 1, 18: 1, 19: 0, 20: 1 },
    bard:     { 1: 4, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 2, 11: 1, 12: 0, 13: 1, 14: 2, 15: 1, 16: 0, 17: 1, 18: 2, 19: 0, 20: 1 },
    warlock:  { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 0, 13: 1, 14: 0, 15: 1, 16: 0, 17: 1, 18: 0, 19: 1, 20: 1 },
    ranger:   { 1: 0, 2: 2, 3: 1, 4: 1, 5: 1, 6: 0, 7: 1, 8: 1, 9: 1, 10: 0, 11: 1, 12: 0, 13: 1, 14: 0, 15: 1, 16: 0, 17: 1, 18: 0, 19: 1, 20: 1 },
  }
  return tables[classId]?.[level] ?? 0
}

// Returns how many new cantrips to pick at the given level
export function newCantripsAtLevel(classId: string, level: number): number {
  const gains: Record<string, number[]> = {
    bard:     [4, 10],
    cleric:   [4, 10],
    druid:    [4, 10],
    sorcerer: [4, 10],
    warlock:  [4, 10],
    wizard:   [4, 10],
  }
  return (gains[classId] ?? []).includes(level) ? 1 : 0
}

// ASI levels by class
export const ASI_LEVELS: Record<string, number[]> = {
  fighter: [4, 6, 8, 12, 14, 16, 19],
  rogue:   [4, 8, 10, 12, 16, 18],
}
const DEFAULT_ASI_LEVELS = [4, 8, 12, 16, 19]
export function asiLevels(classId: string): number[] {
  return ASI_LEVELS[classId] ?? DEFAULT_ASI_LEVELS
}

// Max spell level available for a class at a given character level
export function maxSpellLevel(classId: string, level: number): number {
  const slots = getSpellSlots(classId, level)
  const keys = Object.keys(slots).map(Number)
  return keys.length > 0 ? Math.max(...keys) : 0
}
