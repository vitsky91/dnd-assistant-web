import { useEffect, useState } from 'react'
import { Layout } from '../components/shared/Layout'
import { Spinner } from '../components/shared/Spinner'
import { campaignsApi } from '../api/campaignsApi'
import type { Campaign } from '../types'
import { useAuthStore } from '../stores/authStore'

const STATUS_COLORS: Record<string, string> = {
  lobby:  'bg-[#2D6A4F]/30 text-[#52B788]',
  active: 'bg-[#C9963A]/20 text-[#C9963A]',
  paused: 'bg-[#8B9BB0]/20 text-[#8B9BB0]',
  ended:  'bg-[#9B2335]/20 text-[#FF6B6B]',
}

function NewCampaignModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string, description: string, ruleset: '2014' | '2024') => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ruleset, setRuleset] = useState<'2014' | '2024'>('2014')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161B24] border border-[#2A3347] rounded-xl p-6 w-80 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#F0EBE1]">New Campaign</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B9BB0]">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lost Mine of Phandelver"
            className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] outline-none focus:border-[#C9963A] transition-colors placeholder:text-[#4A5568]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B9BB0]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional…"
            className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] outline-none focus:border-[#C9963A] transition-colors resize-none placeholder:text-[#4A5568]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#8B9BB0]">Ruleset</label>
          <div className="flex gap-2">
            {(['2014', '2024'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRuleset(r)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  ruleset === r
                    ? 'bg-[#C9963A] text-[#0D0F14] border-[#C9963A]'
                    : 'bg-[#1E2535] text-[#8B9BB0] border-[#2A3347] hover:text-[#F0EBE1]'
                }`}
              >
                D&D {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm text-[#8B9BB0] hover:text-[#F0EBE1] border border-[#2A3347] hover:border-[#4A5568] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim(), description.trim(), ruleset)}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-lg text-sm bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    campaignsApi.list()
      .then((res) => setCampaigns(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleCreate = async (name: string, description: string, ruleset: '2014' | '2024') => {
    setIsCreating(true)
    try {
      const res = await campaignsApi.create({ name, description, ruleset })
      setCampaigns((prev) => [res.data, ...prev])
      setShowModal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Layout>
      {showModal && (
        <NewCampaignModal
          onConfirm={handleCreate}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F0EBE1]">Campaigns</h1>
            <p className="text-sm text-[#8B9BB0] mt-0.5">Your adventures</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={isCreating}
            className="text-sm px-4 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] transition-colors disabled:opacity-40"
          >
            + New Campaign
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size={32} />
          </div>
        )}

        {error && (
          <div className="bg-[#9B2335]/20 border border-[#9B2335]/50 rounded-xl px-4 py-3 text-sm text-[#FF6B6B] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
          </div>
        )}

        {!isLoading && !error && campaigns.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚔️</div>
            <p className="text-[#8B9BB0] text-sm">No campaigns yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold text-sm hover:bg-[#E8B84B] transition-colors"
            >
              Create Your First Campaign
            </button>
          </div>
        )}

        {!isLoading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map((campaign) => {
              const isDM = campaign.dungeon_master_id === user?.id
              return (
                <div
                  key={campaign.id}
                  className="bg-[#161B24] border border-[#2A3347] rounded-xl p-4 hover:border-[#C9963A]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#F0EBE1] text-sm">{campaign.name}</h3>
                    <div className="flex items-center gap-2">
                      {isDM && (
                        <span className="text-xs bg-[#9B2335]/20 text-[#FF6B6B] px-2 py-0.5 rounded">
                          DM
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_COLORS[campaign.status] ?? ''}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>

                  {campaign.description && (
                    <p className="text-xs text-[#8B9BB0] mb-2 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#8B9BB0]">
                    <span>{campaign.ruleset}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
