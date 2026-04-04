// ── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  avatar_url: string | null
  role: 'user' | 'admin'
}

// ── Character ───────────────────────────────────────────────────────────────

export interface Character {
  id: string
  name: string
  race: string
  subrace?: string | null
  class: string
  subclass?: string | null
  level: number
  ruleset: '2014' | '2024'
  background?: string | null
  alignment?: string | null
  hit_points: number
  max_hit_points: number
  armor_class: number
  speed: number
  proficiency_bonus?: number
  stats?: {
    str: number; dex: number; con: number; int: number; wis: number; cha: number
  } | null
  spell_slots?: Record<string, { total: number; used: number }> | null
  skill_proficiencies?: Record<string, boolean> | null
  saving_throw_proficiencies?: Record<string, boolean> | null
  spellcasting_ability?: string | null
  class_features?: string[] | null
  owner_id: string
  inserted_at: string
  updated_at: string
}

// ── Map ─────────────────────────────────────────────────────────────────────

export type TileType =
  | 'floor_stone'
  | 'floor_wood'
  | 'floor_dirt'
  | 'wall'
  | 'wall_stone'
  | 'water'
  | 'lava'
  | 'grass'
  | 'forest'
  | 'door_open'
  | 'door_closed'
  | 'stairs_up'
  | 'stairs_down'

export interface CellData {
  tile_type: TileType
  color?: string
}

export type LayerType = 'tile' | 'object' | 'token' | 'fog'

export interface MapLayer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  cells: Record<string, CellData> // key = "x,y"
}

export interface MapData {
  id: string
  name: string
  width: number
  height: number
  cell_size: number
  background_image_url: string | null
  layers: MapLayer[]
  campaign_id: string
  status: 'draft' | 'active'
}

export interface MapSummary {
  id: string
  name: string
  campaign_id: string
  status: string
  inserted_at: string
  updated_at: string
}

// ── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string
  name: string
  description?: string | null
  ruleset: '2014' | '2024'
  status: 'lobby' | 'active' | 'paused' | 'ended'
  dungeon_master_id: string
  inserted_at: string
  updated_at: string
}

// ── Battle ────────────────────────────────────────────────────────────────────

export interface TokenPosition {
  x: number
  y: number
}

export type FogCell = 'hidden' | 'revealed'

export interface InitiativeEntry {
  character_id: string
  player_id: string
  player_username: string
  initiative: number
  is_active: boolean
}

export interface BattleState {
  id: string
  campaign_id: string
  map_id: string
  status: 'idle' | 'active' | 'ended'
  round: number
  initiative_order: InitiativeEntry[]
  current_turn_index: number
  token_positions: Record<string, TokenPosition>
  fog_state: Record<string, FogCell>
}

// ── Combat Log ────────────────────────────────────────────────────────────────

export type CombatLogEventType = 'dice_rolled' | 'hp_updated' | 'condition_changed'

export interface CombatLogEntry {
  id: string
  type: CombatLogEventType
  timestamp: string
  character_id: string
  // dice_rolled
  player_username?: string
  dice?: string
  result?: number
  purpose?: string
  // hp_updated
  hp?: number
  max_hp?: number
  delta?: number
  // condition_changed
  condition?: string
  active?: boolean
}

// ── Editor ────────────────────────────────────────────────────────────────────

export type EditorTool = 'brush' | 'eraser' | 'fog_reveal' | 'fog_hide' | 'token'

// ── Game Data ─────────────────────────────────────────────────────────────────

export interface RaceTrait {
  name: string
  description: string
}

export interface Subrace {
  id: string
  name: string
  stat_bonuses: Record<string, number>
  speed?: number
  darkvision?: number | null
  traits: RaceTrait[]
}

export interface Race {
  id: string
  name: string
  ruleset: string
  stat_bonuses: Record<string, number>
  stat_bonus_choice: { note: string } | null
  speed: number
  size: string
  darkvision: number | null
  languages: string[]
  traits: RaceTrait[]
  subraces: Subrace[]
}

export interface SpellcastingInfo {
  ability: string
  type: 'full' | 'half' | 'third' | 'pact' | 'artificer'
  spell_list: string
  prepared: boolean
  ritual_casting?: boolean
  spellbook?: boolean
}

export interface Subclass {
  id: string
  name: string
}

export interface GameClass {
  id: string
  name: string
  ruleset: string
  hit_die: string
  primary_ability: string[]
  saving_throw_proficiencies: string[]
  skill_choices: { count: number; options: string[] | 'any' }
  spellcasting: SpellcastingInfo | null
  subclass_name: string
  subclass_level: number
  subclasses: Subclass[]
}

export interface BackgroundFeature {
  name: string
  description: string
}

export interface Background {
  id: string
  name: string
  ruleset: string
  description: string
  stat_bonuses: Record<string, number> | null
  skill_proficiencies: string[]
  tool_proficiencies: string[]
  languages: number
  origin_feat: string | null
  feature: BackgroundFeature
}

export interface Spell {
  id: string
  name: string
  level: number
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  description: string
  classes: string[]
  ruleset: string
}

// ── Level Up ─────────────────────────────────────────────────────────────────

export type ASIChoice =
  | { type: 'plus2'; stat: StatKey }
  | { type: 'plus1plus1'; stat1: StatKey; stat2: StatKey }
  | { type: 'feat'; feat: string }

export interface LevelUpState {
  newLevel: number
  hpRoll: number          // raw roll (before CON mod)
  hpChoice: 'roll' | 'average'
  subclass: string | null // chosen subclass id
  newClassSkills: string[]
  chosenSpells: Spell[]   // new known spells
  chosenCantrips: Spell[]
  asiChoice: ASIChoice | null
}

// ── Character Creation ────────────────────────────────────────────────────────

export type AbilityScoreMethod = 'standard_array' | 'point_buy' | 'manual'

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface CharacterCreatePayload {
  name: string
  ruleset: '2014' | '2024'
  race: string
  subrace?: string | null
  class: string
  subclass?: string | null
  level: number
  background?: string | null
  alignment?: string | null
  hit_points: number
  max_hit_points: number
  armor_class: number
  speed: number
  proficiency_bonus: number
  stats: AbilityScores
  skill_proficiencies: Record<string, boolean>
  saving_throw_proficiencies: Record<string, boolean>
  spell_slots: Record<string, number>
  spellcasting_ability?: string | null
  languages: string[]
  tool_proficiencies: string[]
  personality_traits?: string | null
  ideals?: string | null
  bonds?: string | null
  flaws?: string | null
}
