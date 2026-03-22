import { api } from './client'
import type { Campaign } from '../types'

export interface CampaignPayload {
  name: string
  description?: string
  ruleset: '2014' | '2024'
}

export const campaignsApi = {
  list: () =>
    api.get<{ data: Campaign[] }>('/campaigns'),

  get: (id: string) =>
    api.get<{ data: Campaign }>(`/campaigns/${id}`),

  create: (body: CampaignPayload) =>
    api.post<{ data: Campaign }>('/campaigns', body),
}
