import { useState, useCallback } from 'react'
import { useBattleStore } from '../../stores/battleStore'
import { campaignsApi } from '../../api/campaignsApi'
import { Spinner } from '../shared/Spinner'

interface Props {
  campaignId: string
  isDM: boolean
}

export function PlayersPanel({ campaignId, isDM }: Props) {
  const onlinePlayers = useBattleStore((s) => s.onlinePlayers)
  const [kickingId, setKickingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleKick = useCallback(async (playerId: string) => {
    setKickingId(playerId)
    setError(null)
    try {
      await campaignsApi.kickPlayer(campaignId, playerId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to kick player')
    } finally {
      setKickingId(null)
    }
  }, [campaignId])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F0EBE1]">Online</h3>
        <span className="text-xs text-[#8B9BB0]">{onlinePlayers.length} player{onlinePlayers.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="text-xs text-[#FF6B6B] bg-[#9B2335]/20 rounded-lg px-2 py-1">{error}</div>
      )}

      {onlinePlayers.length === 0 ? (
        <p className="text-xs text-[#8B9BB0] text-center py-4">No players connected yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {onlinePlayers.map((player) => (
            <div key={player.player_id}
              className="flex items-center gap-2 bg-[#161B24] rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-[#52B788] shrink-0" />
              <span className="flex-1 text-sm text-[#F0EBE1] truncate">{player.username}</span>
              {isDM && (
                <button
                  onClick={() => handleKick(player.player_id)}
                  disabled={kickingId === player.player_id}
                  className="text-[10px] px-1.5 py-0.5 rounded text-[#FF6B6B] hover:bg-[#9B2335]/30 transition-colors disabled:opacity-40 shrink-0"
                >
                  {kickingId === player.player_id ? <Spinner size={10} /> : 'Kick'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
