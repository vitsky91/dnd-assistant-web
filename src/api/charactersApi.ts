import { api } from './client'
import type { Character } from '../types'

interface CharacterListResponse {
  data: Character[]
}

interface CharacterResponse {
  data: Character
}

export const charactersApi = {
  list: () => api.get<CharacterListResponse>('/characters'),

  get: (id: string) => api.get<CharacterResponse>(`/characters/${id}`),

  create: (body: Partial<Character>) =>
    api.post<CharacterResponse>('/characters', body),

  update: (id: string, body: Partial<Character>) =>
    api.patch<CharacterResponse>(`/characters/${id}`, body),

  delete: (id: string) => api.delete<void>(`/characters/${id}`),
}
