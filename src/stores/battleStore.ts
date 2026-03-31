import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { BattleState, MapData, InitiativeEntry, CombatLogEntry } from '../types'

const MAX_LOG = 100

interface OnlinePlayer {
  player_id: string
  username: string
}

interface BattleStoreState {
  map: MapData | null
  battleState: BattleState | null
  isDM: boolean
  isConnected: boolean
  selectedTokenCharacterId: string | null

  // TICK-008
  combatLog: CombatLogEntry[]
  hpMap: Record<string, { hp: number; max_hp: number }>
  conditions: Record<string, string[]>

  // TICK-009
  onlinePlayers: OnlinePlayer[]

  // Actions
  setMap: (map: MapData) => void
  setBattleState: (bs: BattleState) => void
  setIsDM: (isDM: boolean) => void
  setIsConnected: (connected: boolean) => void
  selectToken: (characterId: string | null) => void
  reset: () => void

  // WebSocket event handlers
  applyTokenMoved: (characterId: string, to: { x: number; y: number }, allPositions: Record<string, { x: number; y: number }>) => void
  applyFogUpdated: (fogState: Record<string, string>) => void
  applyInitiativeSet: (order: InitiativeEntry[], currentTurnCharacterId: string, round: number) => void
  applyTurnChanged: (currentTurnCharacterId: string, currentTurnIndex: number, round: number) => void
  applyBattleEnded: () => void

  // TICK-008 handlers
  applyDiceRolled: (payload: Omit<CombatLogEntry, 'id' | 'type'>) => void
  applyHpUpdated: (characterId: string, hp: number, maxHp: number, delta: number) => void
  applyConditionChanged: (characterId: string, condition: string, active: boolean) => void

  // TICK-009 handlers
  applyPlayerJoined: (playerId: string, username: string) => void
  applyPlayerLeft: (playerId: string) => void
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  map: null,
  battleState: null,
  isDM: false,
  isConnected: false,
  selectedTokenCharacterId: null,
  combatLog: [],
  hpMap: {},
  conditions: {},
  onlinePlayers: [],

  setMap: (map) => set({ map }),
  setBattleState: (battleState) => set({ battleState }),
  setIsDM: (isDM) => set({ isDM }),
  setIsConnected: (isConnected) => set({ isConnected }),
  selectToken: (characterId) => set({ selectedTokenCharacterId: characterId }),

  reset: () => set({
    map: null,
    battleState: null,
    isDM: false,
    isConnected: false,
    selectedTokenCharacterId: null,
    combatLog: [],
    hpMap: {},
    conditions: {},
    onlinePlayers: [],
  }),

  applyTokenMoved: (_characterId, _to, allPositions) => {
    const { battleState } = get()
    if (!battleState) return
    set({ battleState: { ...battleState, token_positions: allPositions } })
  },

  applyFogUpdated: (fogState) => {
    const { battleState } = get()
    if (!battleState) return
    set({ battleState: { ...battleState, fog_state: fogState as Record<string, 'hidden' | 'revealed'> } })
  },

  applyInitiativeSet: (order, _currentTurnCharacterId, round) => {
    const { battleState } = get()
    if (!battleState) return
    set({ battleState: { ...battleState, initiative_order: order, current_turn_index: 0, round, status: 'active' } })
  },

  applyTurnChanged: (_currentTurnCharacterId, currentTurnIndex, round) => {
    const { battleState } = get()
    if (!battleState) return
    set({ battleState: { ...battleState, current_turn_index: currentTurnIndex, round } })
  },

  applyBattleEnded: () => {
    const { battleState } = get()
    if (!battleState) return
    set({ battleState: { ...battleState, status: 'ended' } })
  },

  // ── TICK-008 ──────────────────────────────────────────────────────────────

  applyDiceRolled: (payload) => {
    const entry: CombatLogEntry = { id: uuidv4(), type: 'dice_rolled', ...payload }
    const { combatLog } = get()
    set({ combatLog: [entry, ...combatLog].slice(0, MAX_LOG) })
  },

  applyHpUpdated: (characterId, hp, maxHp, delta) => {
    const { hpMap, combatLog } = get()
    const entry: CombatLogEntry = {
      id: uuidv4(),
      type: 'hp_updated',
      character_id: characterId,
      timestamp: new Date().toISOString(),
      hp,
      max_hp: maxHp,
      delta,
    }
    set({
      hpMap: { ...hpMap, [characterId]: { hp, max_hp: maxHp } },
      combatLog: [entry, ...combatLog].slice(0, MAX_LOG),
    })
  },

  applyConditionChanged: (characterId, condition, active) => {
    const { conditions, combatLog } = get()
    const current = conditions[characterId] ?? []
    const updated = active
      ? current.includes(condition) ? current : [...current, condition]
      : current.filter((c) => c !== condition)
    const entry: CombatLogEntry = {
      id: uuidv4(),
      type: 'condition_changed',
      character_id: characterId,
      timestamp: new Date().toISOString(),
      condition,
      active,
    }
    set({
      conditions: { ...conditions, [characterId]: updated },
      combatLog: [entry, ...combatLog].slice(0, MAX_LOG),
    })
  },

  // ── TICK-009 ──────────────────────────────────────────────────────────────

  applyPlayerJoined: (playerId, username) => {
    const { onlinePlayers } = get()
    if (onlinePlayers.some((p) => p.player_id === playerId)) return
    set({ onlinePlayers: [...onlinePlayers, { player_id: playerId, username }] })
  },

  applyPlayerLeft: (playerId) => {
    const { onlinePlayers } = get()
    set({ onlinePlayers: onlinePlayers.filter((p) => p.player_id !== playerId) })
  },
}))
