import { useBattleStore } from '../../stores/battleStore'

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

export function CombatLogPanel() {
  const combatLog = useBattleStore((s) => s.combatLog)

  if (combatLog.length === 0) {
    return (
      <p className="text-xs text-[#8B9BB0] text-center py-6">
        No events yet. Roll dice or take damage to see the log.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {combatLog.map((entry) => (
        <div key={entry.id} className="bg-[#161B24] rounded-lg px-3 py-2 text-xs">
          {entry.type === 'dice_rolled' && (
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">🎲</span>
              <div className="flex-1 min-w-0">
                <span className="text-[#C9963A] font-semibold">{entry.player_username ?? '?'}</span>
                <span className="text-[#8B9BB0]"> rolled </span>
                <span className="text-[#F0EBE1] font-mono">{entry.dice}</span>
                <span className="text-[#8B9BB0]"> → </span>
                <span className="text-[#52B788] font-bold text-sm">{entry.result}</span>
                {entry.purpose && entry.purpose !== 'roll' && (
                  <span className="text-[#4A5568] ml-1">({entry.purpose})</span>
                )}
                {entry.timestamp && (
                  <div className="text-[#4A5568] text-[10px] mt-0.5">{formatTime(entry.timestamp)}</div>
                )}
              </div>
            </div>
          )}

          {entry.type === 'hp_updated' && (
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">{(entry.delta ?? 0) < 0 ? '💔' : '💚'}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[#F0EBE1] font-semibold">{entry.character_id.slice(0, 8)}</span>
                {(entry.delta ?? 0) < 0 ? (
                  <span className="text-[#E63946]"> took <b>{Math.abs(entry.delta ?? 0)}</b> dmg</span>
                ) : (
                  <span className="text-[#52B788]"> healed <b>{entry.delta}</b></span>
                )}
                <span className="text-[#4A5568]"> ({entry.hp}/{entry.max_hp} HP)</span>
                {entry.timestamp && (
                  <div className="text-[#4A5568] text-[10px] mt-0.5">{formatTime(entry.timestamp)}</div>
                )}
              </div>
            </div>
          )}

          {entry.type === 'condition_changed' && (
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">⚡</span>
              <div className="flex-1 min-w-0">
                <span className="text-[#F0EBE1] font-semibold">{entry.character_id.slice(0, 8)}</span>
                <span className="text-[#8B9BB0]">: </span>
                <span className="text-[#E8B84B] capitalize">{entry.condition}</span>
                <span className={entry.active ? ' text-[#52B788]' : ' text-[#FF6B6B]'}>
                  {entry.active ? ' ▸ ON' : ' ▸ OFF'}
                </span>
                {entry.timestamp && (
                  <div className="text-[#4A5568] text-[10px] mt-0.5">{formatTime(entry.timestamp)}</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
