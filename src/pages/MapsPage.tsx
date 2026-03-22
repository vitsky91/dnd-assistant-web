import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/shared/Layout'
import { Spinner } from '../components/shared/Spinner'
import { api } from '../api/client'
import { mapsApi } from '../api/mapsApi'
import type { Campaign, MapSummary } from '../types'

export function MapsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [mapsMap, setMapsMap] = useState<Record<string, MapSummary[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: Campaign[] }>('/campaigns')
      setCampaigns(res.data)

      const mapEntries = await Promise.all(
        res.data.map(async (campaign) => {
          try {
            const mRes = await api.get<{ data: MapSummary[] }>(
              `/campaigns/${campaign.id}/maps`
            )
            return [campaign.id, mRes.data] as [string, MapSummary[]]
          } catch {
            return [campaign.id, []] as [string, MapSummary[]]
          }
        })
      )
      setMapsMap(Object.fromEntries(mapEntries))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = useCallback(async (mapId: string, campaignId: string) => {
    setDeletingId(mapId)
    setConfirmDeleteId(null)
    try {
      await mapsApi.delete(mapId)
      setMapsMap((prev) => ({
        ...prev,
        [campaignId]: (prev[campaignId] ?? []).filter((m) => m.id !== mapId),
      }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete map')
    } finally {
      setDeletingId(null)
    }
  }, [])

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F0EBE1]">Battle Maps</h1>
            <p className="text-sm text-[#8B9BB0] mt-0.5">Design maps per campaign</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size={32} />
          </div>
        )}

        {error && (
          <div className="bg-[#9B2335]/20 border border-[#9B2335]/50 rounded-xl px-4 py-3 text-sm text-[#FF6B6B] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:opacity-70 ml-4">✕</button>
          </div>
        )}

        {!isLoading && !error && campaigns.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-[#8B9BB0] text-sm">No campaigns yet.</p>
            <p className="text-[#8B9BB0] text-sm">Create a campaign first.</p>
            <Link
              to="/campaigns"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold text-sm hover:bg-[#E8B84B] transition-colors"
            >
              Go to Campaigns
            </Link>
          </div>
        )}

        {!isLoading && campaigns.map((campaign) => {
          const maps = mapsMap[campaign.id] ?? []
          return (
            <div key={campaign.id} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#F0EBE1]">{campaign.name}</h2>
                  <p className="text-xs text-[#8B9BB0] capitalize">{campaign.ruleset} · {campaign.status}</p>
                </div>
                <Link
                  to={`/campaigns/${campaign.id}/maps/editor`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] transition-colors"
                >
                  + New Map
                </Link>
              </div>

              {maps.length === 0 ? (
                <div className="bg-[#161B24] border border-[#2A3347] rounded-xl px-4 py-6 text-center text-sm text-[#8B9BB0]">
                  No maps yet for this campaign
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maps.map((m) => {
                    const isDeleting = deletingId === m.id
                    const isConfirming = confirmDeleteId === m.id

                    return (
                      <div
                        key={m.id}
                        className="bg-[#161B24] border border-[#2A3347] rounded-xl p-4 hover:border-[#C9963A]/50 transition-colors flex items-center gap-3"
                      >
                        <div className="text-2xl">🗺️</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F0EBE1] truncate">{m.name}</p>
                          <p className="text-xs text-[#8B9BB0] capitalize">{m.status}</p>
                        </div>

                        {isConfirming ? (
                          /* Confirmation row */
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-[#FF6B6B]">Delete?</span>
                            <button
                              onClick={() => handleDelete(m.id, campaign.id)}
                              className="text-xs px-2 py-1 rounded-lg bg-[#9B2335] text-white hover:bg-[#C0392B] transition-colors font-semibold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded-lg bg-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1] transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 shrink-0">
                            <Link
                              to={`/campaigns/${campaign.id}/maps/editor?mapId=${m.id}`}
                              className="text-xs px-2 py-1 rounded-lg bg-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1] transition-colors"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/campaigns/${campaign.id}/maps/${m.id}/battle`}
                              className="text-xs px-2 py-1 rounded-lg bg-[#C9963A]/20 text-[#C9963A] hover:bg-[#C9963A]/30 transition-colors font-semibold"
                            >
                              Battle
                            </Link>
                            <button
                              onClick={() => setConfirmDeleteId(m.id)}
                              disabled={isDeleting}
                              title="Delete map"
                              className="text-xs px-2 py-1 rounded-lg bg-[#2A3347] text-[#8B9BB0] hover:text-[#FF6B6B] hover:bg-[#9B2335]/20 transition-colors disabled:opacity-40"
                            >
                              {isDeleting ? <Spinner size={10} /> : '🗑'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
