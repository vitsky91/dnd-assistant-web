import { Socket, Channel } from 'phoenixjs'

const WS_URL = 'wss://dnd.vitskylab.dev/socket'

// Module-level singletons — one socket, one channel at a time
let socket: Socket | null = null
let channel: Channel | null = null
let currentCampaignId: string | null = null

function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('jwt_token')
    socket = new Socket(WS_URL, { params: { token: token ?? '' } })
    socket.connect()
  }
  return socket
}

export function joinSessionChannel(campaignId: string): Channel {
  // Reuse existing channel for same campaign
  if (channel && currentCampaignId === campaignId) return channel

  // Leave previous channel if switching campaigns
  if (channel) {
    channel.leave()
    channel = null
  }

  const s = getSocket()
  channel = s.channel(`session:${campaignId}`, {})
  currentCampaignId = campaignId

  channel
    .join()
    .receive('ok', () => {})
    .receive('error', (err: unknown) => console.error('[SessionSocket] join error', err))

  return channel
}

export function leaveSessionChannel() {
  channel?.leave()
  channel = null
  currentCampaignId = null
}

export function disconnectSocket() {
  leaveSessionChannel()
  socket?.disconnect()
  socket = null
}

// ── Typed push helpers ──────────────────────────────────────────────────────

export function pushMoveToken(
  ch: Channel,
  characterId: string,
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  ch.push('move_token', { character_id: characterId, from, to })
}

export function pushRevealFog(ch: Channel, cells: { x: number; y: number }[]) {
  ch.push('reveal_fog', { cells })
}

export function pushHideFog(ch: Channel, cells: { x: number; y: number }[]) {
  ch.push('hide_fog', { cells })
}

export function pushRollDice(
  ch: Channel,
  dice: string,
  purpose: string,
  characterId: string
) {
  ch.push('roll_dice', { dice, purpose, character_id: characterId })
}

export function pushSetInitiative(
  ch: Channel,
  order: { character_id: string; player_id: string; player_username: string; initiative: number }[]
) {
  ch.push('set_initiative', { order })
}

export function pushNextTurn(ch: Channel) {
  ch.push('next_turn', {})
}

export function pushEndBattle(ch: Channel) {
  ch.push('end_battle', {})
}
