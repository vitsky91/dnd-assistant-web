import { api } from './client'
import type { Race, GameClass, Background, Spell } from '../types'

export const gameDataApi = {
  races: (ruleset: string) =>
    api.get<{ data: Race[] }>(`/game_data/races?ruleset=${ruleset}`),

  classes: (ruleset: string) =>
    api.get<{ data: GameClass[] }>(`/game_data/classes?ruleset=${ruleset}`),

  backgrounds: (ruleset: string) =>
    api.get<{ data: Background[] }>(`/game_data/backgrounds?ruleset=${ruleset}`),

  spells: (params: { class?: string; level?: number; ruleset?: string }) => {
    const qs = new URLSearchParams()
    if (params.class) qs.set('class', params.class)
    if (params.level !== undefined) qs.set('level', String(params.level))
    if (params.ruleset) qs.set('ruleset', params.ruleset)
    return api.get<{ data: Spell[] }>(`/spells?${qs.toString()}`)
  },

  addSpellsBatch: (characterId: string, spellIds: string[]) =>
    api.post<void>(`/characters/${characterId}/spells/batch`, { spell_ids: spellIds }),
}
