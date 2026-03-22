import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useBattleStore } from '../stores/battleStore'
import { mapsApi } from '../api/mapsApi'
import { battleApi } from '../api/battleApi'
import { campaignsApi } from '../api/campaignsApi'
import {
  joinSessionChannel,
  leaveSessionChannel,
} from '../socket/sessionSocket'
import { Spinner } from '../components/shared/Spinner'
import { TurnIndicator } from '../components/battle/TurnIndicator'
import { InitiativePanel } from '../components/battle/InitiativePanel'
import { BattleCanvas } from '../components/battle/BattleCanvas'
import type { BattleState, InitiativeEntry, MapData } from '../types'

// WebSocket event payload shapes
interface TokenMovedPayload {
  character_id: string
  player_id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  token_positions: Record<string, { x: number; y: number }>
}
interface FogUpdatedPayload { fog_state: Record<string, string> }
interface InitiativeSetPayload {
  order: InitiativeEntry[]
  current_turn_character_id: string
  round: number
}
interface TurnChangedPayload {
  current_turn_character_id: string
  current_turn_index: number
  round: number
}
interface BattleStateEventPayload {
  battle_state: BattleState
  map: MapData
}

export function BattlePage() {
  const { campaignId, mapId } = useParams<{ campaignId: string; mapId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    setMap,
    setBattleState,
    setIsDM,
    setIsConnected,
    applyTokenMoved,
    applyFogUpdated,
    applyInitiativeSet,
    applyTurnChanged,
    applyBattleEnded,
    reset,
    map,
    battleState,
    isDM,
  } = useBattleStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<Channel | null>(null)

  // Observe canvas container size
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ width, height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Load map + battle state + connect to channel
  useEffect(() => {
    if (!campaignId || !mapId || !user) return

    let cancelled = false

    async function init() {
      setIsLoading(true)
      setError(null)

      try {
        // Load campaign to check DM role
        const [mapRes, campaignRes] = await Promise.all([
          mapsApi.get(mapId!),
          campaignsApi.get(campaignId!),
        ])

        if (cancelled) return

        const loadedMap = mapRes.data
        const campaign = campaignRes.data
        setMap(loadedMap)
        setIsDM(campaign.dungeon_master_id === user!.id)

        // Load battle state (may not exist yet)
        try {
          const bsRes = await battleApi.get(mapId!)
          if (!cancelled) setBattleState(bsRes.data)
        } catch (err: unknown) {
          // 404 is fine — no battle state yet, DM can create one
          if ((err as { status?: number }).status !== 404) throw err
        }

        if (cancelled) return

        // Join WebSocket channel
        const ch = joinSessionChannel(campaignId!)
        channelRef.current = ch
        setIsConnected(true)

        // Listen for WebSocket events
        ch.on('token_moved', (payload) => {
          const p = payload as TokenMovedPayload
          applyTokenMoved(p.character_id, p.to, p.token_positions)
        })

        ch.on('fog_updated', (payload) => {
          const p = payload as FogUpdatedPayload
          applyFogUpdated(p.fog_state)
        })

        ch.on('initiative_set', (payload) => {
          const p = payload as InitiativeSetPayload
          applyInitiativeSet(p.order, p.current_turn_character_id, p.round)
        })

        ch.on('turn_changed', (payload) => {
          const p = payload as TurnChangedPayload
          applyTurnChanged(p.current_turn_character_id, p.current_turn_index, p.round)
        })

        ch.on('battle_ended', () => {
          applyBattleEnded()
        })

        // Reconnect: server sends current battle state on join
        ch.on('battle_state', (payload) => {
          const p = payload as BattleStateEventPayload
          setBattleState(p.battle_state)
          setMap(p.map)
        })

      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load battle')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      leaveSessionChannel()
      reset()
    }
  }, [campaignId, mapId, user?.id])

  // Create battle state if DM and none exists
  const handleCreateBattleState = useCallback(async () => {
    if (!mapId) return
    try {
      const res = await battleApi.create(mapId)
      setBattleState(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create battle')
    }
  }, [mapId, setBattleState])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0F14]">
        <Spinner size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0D0F14] gap-4">
        <p className="text-[#FF6B6B] text-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#C9963A] hover:text-[#E8B84B]"
        >
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0F14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A3347] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#8B9BB0] hover:text-[#F0EBE1] text-sm"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-[#F0EBE1]">{map?.name ?? 'Battle'}</span>
        </div>
        <TurnIndicator />
        <div className="w-20" /> {/* spacer */}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 overflow-hidden">
          {battleState && channelRef.current && user ? (
            <BattleCanvas
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              channel={channelRef.current}
              currentUserId={user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {isDM && !battleState ? (
                <div className="text-center">
                  <p className="text-[#8B9BB0] text-sm mb-4">No battle session for this map yet.</p>
                  <button
                    onClick={handleCreateBattleState}
                    className="px-4 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold text-sm hover:bg-[#E8B84B] transition-colors"
                  >
                    Start Battle Session
                  </button>
                </div>
              ) : (
                <p className="text-[#8B9BB0] text-sm">Waiting for DM to start the battle…</p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 border-l border-[#2A3347] p-4 overflow-y-auto">
          {battleState && channelRef.current ? (
            <InitiativePanel channel={channelRef.current} />
          ) : (
            <p className="text-xs text-[#8B9BB0]">No battle state</p>
          )}
        </div>
      </div>
    </div>
  )
}
