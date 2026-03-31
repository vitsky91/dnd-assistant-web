import { useState } from 'react'
import { useBattleStore } from '../../stores/battleStore'
import type { Channel } from 'phoenixjs'
import { pushSetInitiative, pushNextTurn, pushRollDice } from '../../socket/sessionSocket'
import { v4 as uuidv4 } from 'uuid'

const DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const

interface InitiativeRow {
  id: string
  player_username: string
  initiative: string
}

interface Props {
  channel: Channel
  currentUserId: string
}

export function InitiativePanel({ channel, currentUserId }: Props) {
  const { battleState, isDM } = useBattleStore()
  const [showSetup, setShowSetup] = useState(false)
  const [rows, setRows] = useState<InitiativeRow[]>([
    { id: uuidv4(), player_username: '', initiative: '' },
  ])

  if (!battleState) return null

  const { initiative_order, current_turn_index, status } = battleState
  const currentEntry = status === 'active' ? initiative_order[current_turn_index] : null
  const isMyTurn = currentEntry?.player_id === currentUserId

  function addRow() {
    setRows((r) => [...r, { id: uuidv4(), player_username: '', initiative: '' }])
  }
  function removeRow(id: string) {
    setRows((r) => r.filter((row) => row.id !== id))
  }
  function updateRow(id: string, field: keyof Omit<InitiativeRow, 'id'>, value: string) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }
  function handleStartBattle() {
    const valid = rows.filter((r) => r.player_username.trim() && r.initiative.trim())
    if (valid.length === 0) return
    const order = valid
      .map((r) => ({
        character_id: r.id,
        player_id: r.id,
        player_username: r.player_username.trim(),
        initiative: parseInt(r.initiative, 10) || 0,
      }))
      .sort((a, b) => b.initiative - a.initiative)
    pushSetInitiative(channel, order)
    setShowSetup(false)
  }

  function handleRoll(die: string) {
    const charId = currentEntry?.character_id ?? ''
    pushRollDice(channel, `1${die}`, 'roll', charId)
  }

  // ── DM setup form ──────────────────────────────────────────────────────────
  if (showSetup && isDM) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F0EBE1]">Set Initiative</h3>
          <button onClick={() => setShowSetup(false)} className="text-xs text-[#8B9BB0] hover:text-[#F0EBE1]">
            Cancel
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex gap-2 items-center">
              <input type="text" placeholder="Name" value={row.player_username}
                onChange={(e) => updateRow(row.id, 'player_username', e.target.value)}
                className="flex-1 bg-[#0D0F14] border border-[#2A3347] rounded-lg px-3 py-1.5 text-sm text-[#F0EBE1] placeholder-[#8B9BB0] focus:outline-none focus:border-[#C9963A]"
              />
              <input type="number" placeholder="Init" value={row.initiative}
                onChange={(e) => updateRow(row.id, 'initiative', e.target.value)}
                className="w-16 bg-[#0D0F14] border border-[#2A3347] rounded-lg px-2 py-1.5 text-sm text-[#F0EBE1] placeholder-[#8B9BB0] focus:outline-none focus:border-[#C9963A]"
              />
              <button onClick={() => removeRow(row.id)} className="text-[#8B9BB0] hover:text-[#FF6B6B] text-xs px-1">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="text-xs text-[#C9963A] hover:text-[#E8B84B] text-left">
          + Add character
        </button>
        <button onClick={handleStartBattle}
          className="w-full py-2 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold text-sm hover:bg-[#E8B84B] transition-colors">
          Start Battle
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F0EBE1]">Initiative</h3>
        {isDM && status === 'idle' && (
          <button onClick={() => setShowSetup(true)}
            className="text-xs px-3 py-1 rounded-lg bg-[#C9963A] text-[#0D0F14] font-semibold hover:bg-[#E8B84B] transition-colors">
            Set Initiative
          </button>
        )}
        {isDM && status === 'active' && (
          <button onClick={() => pushNextTurn(channel)}
            className="text-xs px-3 py-1 rounded-lg bg-[#2A3347] text-[#F0EBE1] font-semibold hover:bg-[#3A4357] transition-colors">
            Next Turn
          </button>
        )}
      </div>

      {initiative_order.length === 0 ? (
        <p className="text-xs text-[#8B9BB0] text-center py-4">
          {isDM ? 'Set initiative to begin the battle.' : 'Waiting for DM to set initiative…'}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {initiative_order.map((entry, i) => {
            const isCurrentTurn = status === 'active' && i === current_turn_index
            return (
              <div key={entry.character_id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isCurrentTurn
                    ? 'bg-[#C9963A]/20 border border-[#C9963A]/50'
                    : 'bg-[#161B24] border border-transparent'
                }`}>
                <span className={`text-sm font-bold w-6 text-right ${isCurrentTurn ? 'text-[#C9963A]' : 'text-[#8B9BB0]'}`}>
                  {entry.initiative}
                </span>
                <p className={`flex-1 text-sm font-medium ${isCurrentTurn ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'}`}>
                  {entry.player_username}
                </p>
                {isCurrentTurn && <span className="w-2 h-2 rounded-full bg-[#C9963A] animate-pulse shrink-0" />}
              </div>
            )
          })}
        </div>
      )}

      {/* Dice row — DM always, player only on their turn */}
      {status === 'active' && (isDM || isMyTurn) && (
        <div className="mt-1">
          <p className="text-xs text-[#8B9BB0] mb-1.5">
            {isMyTurn && !isDM ? "Your turn — roll:" : "Roll dice:"}
          </p>
          <div className="flex flex-wrap gap-1">
            {DICE.map((die) => (
              <button key={die} onClick={() => handleRoll(die)}
                className="text-xs px-2 py-1 rounded-lg bg-[#2A3347] text-[#C9963A] hover:bg-[#C9963A]/20 font-semibold transition-colors">
                {die}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'ended' && (
        <div className="text-center py-2 text-sm text-[#8B9BB0]">Battle ended</div>
      )}
    </div>
  )
}
