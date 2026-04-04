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

export function getSpellSlots(classId: string, level: number): Record<string, number> {
  const casterType = CASTER_TYPE[classId] ?? 'none'
  const lvl = Math.max(1, Math.min(20, level))
  switch (casterType) {
    case 'full':  return FULL_CASTER[lvl] ?? {}
    case 'half':  return HALF_CASTER[lvl] ?? {}
    case 'pact':  return PACT_CASTER[lvl] ?? {}
    case 'third': return THIRD_CASTER[lvl] ?? {}
    default:      return {}
  }
}

export function isSpellcaster(classId: string): boolean {
  const ct = CASTER_TYPE[classId] ?? 'none'
  return ct !== 'none'
}
