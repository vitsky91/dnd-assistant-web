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

// ── Editor ────────────────────────────────────────────────────────────────────

export type EditorTool = 'brush' | 'eraser' | 'fog_reveal' | 'fog_hide' | 'token'
