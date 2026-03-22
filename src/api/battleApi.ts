import { api } from './client'
import type { BattleState } from '../types'

interface BattleStateResponse {
  data: BattleState
}

export const battleApi = {
  get: (mapId: string) =>
    api.get<BattleStateResponse>(`/maps/${mapId}/battle_state`),

  create: (mapId: string, body?: { token_positions?: Record<string, { x: number; y: number }>; fog_state?: Record<string, string> }) =>
    api.post<BattleStateResponse>(`/maps/${mapId}/battle_state`, body ?? {}),

  update: (mapId: string, body: Partial<BattleState>) =>
    api.patch<BattleStateResponse>(`/maps/${mapId}/battle_state`, body),
}
