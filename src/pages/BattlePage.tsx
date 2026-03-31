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
import { CombatLogPanel } from '../components/battle/CombatLogPanel'
import { PlayersPanel } from '../components/battle/PlayersPanel'
import type { Channel } from 'phoenixjs'
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
interface DiceRolledPayload {
  character_id: string
  player_username: string
  dice: string
  result: number
  rolls: number[]
  purpose: string
  timestamp: string
}
interface HpUpdatedPayload {
  character_id: string
  hp: number
  max_hp: number
  delta: number
}
interface ConditionChangedPayload {
  character_id: string
  condition: string
  active: boolean
}
interface PlayerEventPayload {
  player_id: string
  username: string
}

type SidebarTab = 'initiative' | 'log' | 'players'

export function BattlePage() {
  const { campaignId, mapId } = useParams<{ campaignId: string; mapId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    setMap, setBattleState, setIsDM, setIsConnected,
    applyTokenMoved, applyFogUpdated, applyInitiativeSet, applyTurnChanged, applyBattleEnded,
    applyDiceRolled, applyHpUpdated, applyConditionChanged,
    applyPlayerJoined, applyPlayerLeft,
    reset, map, battleState, isDM,
  } = useBattleStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('initiative')
  const [isEndingBattle, setIsEndingBattle] = useState(false)

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
        const [mapRes, campaignRes] = await Promise.all([
          mapsApi.get(mapId!),
          campaignsApi.get(campaignId!),
        ])
        if (cancelled) return

        setMap(mapRes.data)
        setIsDM(campaignRes.data.dungeon_master_id === user!.id)

        try {
          const bsRes = await battleApi.get(mapId!)
          if (!cancelled) setBattleState(bsRes.data)
        } catch (err: unknown) {
          if ((err as { status?: number }).status !== 404) throw err
        }

        if (cancelled) return

        const ch = joinSessionChannel(campaignId!)
        channelRef.current = ch
        setIsConnected(true)

        // ── TICK-007 ──
        ch.on('token_moved', (p) => {
          const payload = p as TokenMovedPayload
          applyTokenMoved(payload.character_id, payload.to, payload.token_positions)
        })
        ch.on('fog_updated', (p) => {
          applyFogUpdated((p as FogUpdatedPayload).fog_state)
        })
        ch.on('initiative_set', (p) => {
          const payload = p as InitiativeSetPayload
          applyInitiativeSet(payload.order, payload.current_turn_character_id, payload.round)
        })
        ch.on('turn_changed', (p) => {
          const payload = p as TurnChangedPayload
          applyTurnChanged(payload.current_turn_character_id, payload.current_turn_index, payload.round)
        })
        ch.on('battle_ended', () => applyBattleEnded())
        ch.on('map_loaded', (p) => setMap((p as { map: MapData }).map))
        ch.on('battle_state', (p) => {
          const payload = p as BattleStateEventPayload
          setBattleState(payload.battle_state)
          setMap(payload.map)
        })

        // ── TICK-008 ──
        ch.on('dice_rolled', (p) => {
          const payload = p as DiceRolledPayload
          applyDiceRolled({
            character_id: payload.character_id,
            player_username: payload.player_username,
            dice: payload.dice,
            result: payload.result,
            purpose: payload.purpose,
            timestamp: payload.timestamp,
          })
        })
        ch.on('hp_updated', (p) => {
          const payload = p as HpUpdatedPayload
          applyHpUpdated(payload.character_id, payload.hp, payload.max_hp, payload.delta)
        })
        ch.on('condition_changed', (p) => {
          const payload = p as ConditionChangedPayload
          applyConditionChanged(payload.character_id, payload.condition, payload.active)
        })

        // ── TICK-009 ──
        ch.on('player_joined', (p) => {
          const payload = p as PlayerEventPayload
          applyPlayerJoined(payload.player_id, payload.username)
        })
        ch.on('player_left', (p) => {
          const payload = p as PlayerEventPayload
          applyPlayerLeft(payload.player_id)
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

  const handleCreateBattleState = useCallback(async () => {
    if (!mapId) return
    try {
      const res = await battleApi.create(mapId)
      setBattleState(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create battle')
    }
  }, [mapId, setBattleState])

  const handleEndBattle = useCallback(async () => {
    if (!campaignId) return
    setIsEndingBattle(true)
    try {
      await campaignsApi.endBattle(campaignId)
      // battle_ended WS event will update the store
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end battle')
    } finally {
      setIsEndingBattle(false)
    }
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0F14]">
        <Spinner size={40} />
      </div>
    )
  }

  if (error && !battleState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0D0F14] gap-4">
        <p className="text-[#FF6B6B] text-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#C9963A] hover:text-[#E8B84B]">
          ← Back
        </button>
      </div>
    )
  }

  const battleEnded = battleState?.status === 'ended'

  return (
    <div className="flex flex-col h-screen bg-[#0D0F14] overflow-hidden relative">

      {/* Battle ended overlay */}
      {battleEnded && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#161B24] border border-[#2A3347] rounded-xl p-8 text-center flex flex-col items-center gap-4">
            <div className="text-5xl">⚔️</div>
            <h2 className="text-lg font-bold text-[#F0EBE1]">Battle Ended</h2>
            <p className="text-sm text-[#8B9BB0]">The battle has concluded.</p>
            <button
              onClick={() => navigate(`/maps`)}
              className="px-6 py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] transition-colors"
            >
              ← Back to Maps
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A3347] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-[#8B9BB0] hover:text-[#F0EBE1] text-sm">←</button>
          <span className="text-sm font-semibold text-[#F0EBE1]">{map?.name ?? 'Battle'}</span>
        </div>

        <TurnIndicator />

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-[#FF6B6B]">{error}</span>
          )}
          {isDM && battleState?.status === 'active' && (
            <button
              onClick={handleEndBattle}
              disabled={isEndingBattle}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#9B2335]/60 text-[#FF6B6B] hover:bg-[#9B2335]/20 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              {isEndingBattle ? <Spinner size={10} /> : '⚔️'}
              End Battle
            </button>
          )}
        </div>
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

        {/* Right sidebar — tabbed */}
        <div className="w-64 shrink-0 border-l border-[#2A3347] flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-[#2A3347] shrink-0">
            {([
              { id: 'initiative', label: 'Initiative' },
              { id: 'log',        label: 'Log' },
              { id: 'players',    label: 'Players' },
            ] as { id: SidebarTab; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  sidebarTab === tab.id
                    ? 'text-[#C9963A] border-b-2 border-[#C9963A]'
                    : 'text-[#8B9BB0] hover:text-[#F0EBE1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3">
            {sidebarTab === 'initiative' && (
              battleState && channelRef.current ? (
                <InitiativePanel
                  channel={channelRef.current}
                  currentUserId={user?.id ?? ''}
                />
              ) : (
                <p className="text-xs text-[#8B9BB0]">No battle state</p>
              )
            )}
            {sidebarTab === 'log' && <CombatLogPanel />}
            {sidebarTab === 'players' && campaignId && (
              <PlayersPanel campaignId={campaignId} isDM={isDM} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
