import { api } from './client'
import type { MapData, MapSummary, MapLayer } from '../types'

interface MapListResponse {
  data: MapSummary[]
}

interface MapResponse {
  data: MapData
}

// Fields sent to backend (MapInput schema)
export interface MapPayload {
  name: string
  width: number
  height: number
  cell_size: number
  background_image_url: string | null
  layers: MapLayer[]
}

export const mapsApi = {
  listByCampaign: (campaignId: string) =>
    api.get<MapListResponse>(`/campaigns/${campaignId}/maps`),

  get: (id: string) =>
    api.get<MapResponse>(`/maps/${id}`),

  create: (campaignId: string, body: MapPayload) =>
    api.post<MapResponse>(`/campaigns/${campaignId}/maps`, body),

  update: (id: string, body: MapPayload) =>
    api.patch<MapResponse>(`/maps/${id}`, body),

  delete: (id: string) =>
    api.delete<void>(`/maps/${id}`),
}
