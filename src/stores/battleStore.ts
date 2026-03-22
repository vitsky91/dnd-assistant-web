import { create } from 'zustand'
import type { BattleState, MapData, InitiativeEntry } from '../types'

interface BattleStoreState {
  map: MapData | null
  battleState: BattleState | null
  isDM: boolean
  isConnected: boolean
  selectedTokenCharacterId: string | null

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
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  map: null,
  battleState: null,
  isDM: false,
  isConnected: false,
  selectedTokenCharacterId: null,

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
  }),

  applyTokenMoved: (_characterId, _to, allPositions) => {
    const { battleState } = get()
    if (!battleState) return
    set({
      battleState: {
        ...battleState,
        token_positions: allPositions,
      },
    })
  },

  applyFogUpdated: (fogState) => {
    const { battleState } = get()
    if (!battleState) return
    set({
      battleState: {
        ...battleState,
        fog_state: fogState as Record<string, 'hidden' | 'revealed'>,
      },
    })
  },

  applyInitiativeSet: (order, _currentTurnCharacterId, round) => {
    const { battleState } = get()
    if (!battleState) return
    set({
      battleState: {
        ...battleState,
        initiative_order: order,
        current_turn_index: 0,
        round,
        status: 'active',
      },
    })
  },

  applyTurnChanged: (_currentTurnCharacterId, currentTurnIndex, round) => {
    const { battleState } = get()
    if (!battleState) return
    set({
      battleState: {
        ...battleState,
        current_turn_index: currentTurnIndex,
        round,
      },
    })
  },

  applyBattleEnded: () => {
    const { battleState } = get()
    if (!battleState) return
    set({
      battleState: {
        ...battleState,
        status: 'ended',
      },
    })
  },
}))
