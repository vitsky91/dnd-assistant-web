import { useBattleStore } from '../../stores/battleStore'

export function TurnIndicator() {
  const { battleState } = useBattleStore()

  if (!battleState || battleState.status !== 'active') return null

  const { initiative_order, current_turn_index, round } = battleState
  const current = initiative_order[current_turn_index]

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#C9963A]/10 border border-[#C9963A]/30 rounded-xl">
      <div className="w-2 h-2 rounded-full bg-[#C9963A] animate-pulse" />
      <div>
        <p className="text-xs text-[#8B9BB0]">Round {round}</p>
        <p className="text-sm font-semibold text-[#C9963A]">
          {current?.player_username ?? '—'}'s turn
        </p>
      </div>
    </div>
  )
}
